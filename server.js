require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const WebSocket = require("ws");

const app = express();
app.use(cors());
app.use(express.json({ limit: "8kb" }));

const PORT = Number(process.env.PORT || 8080);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const MAX_PLAYERS_PER_WORLD = Number(process.env.MAX_PLAYERS_PER_WORLD || 10);
const MAX_PARTY_SIZE = Number(process.env.MAX_PARTY_SIZE || 8);
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || "7d";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const WS_MESSAGE_MAX_BYTES = Number(process.env.WS_MESSAGE_MAX_BYTES || 32 * 1024);
const WORLD_COORD_LIMIT = Number(process.env.WORLD_COORD_LIMIT || 620);
const WORLD_Z_MIN = -20;
const WORLD_Z_MAX = 140;
const VELOCITY_LIMIT = 250;
const MAX_INVALID_MESSAGES = Number(process.env.MAX_INVALID_MESSAGES || 8);

const PLAYER_ID_REGEX = /^0x[a-fA-F0-9]{40}$/;
const WORLD_ID_REGEX = /^world-[a-zA-Z0-9_-]{1,32}$/;
const MATCAP_KEY_REGEX = /^[a-zA-Z0-9_-]{1,32}$/;

const MESSAGE_RATE_LIMITS = {
  update: { limit: 90, windowMs: 1000 },
  join: { limit: 6, windowMs: 10000 },
  bulletFired: { limit: 16, windowMs: 1000 },
  bulletCollision: { limit: 24, windowMs: 1000 },
  destroyCar: { limit: 24, windowMs: 1000 },
  invite: { limit: 12, windowMs: 10000 },
  inviteFriendship: { limit: 12, windowMs: 10000 },
  partyMessage: { limit: 10, windowMs: 5000 },
  default: { limit: 40, windowMs: 1000 }
};

if (IS_PRODUCTION && (!process.env.JWT_SECRET || JWT_SECRET === "dev-secret-change-me")) {
  throw new Error("JWT_SECRET must be set to a strong value in production.");
}

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const worlds = new Map();
const parties = new Map();
const playerToPartyId = new Map();
const playerToSocket = new Map();
const socketMeta = new WeakMap();
const connectedClients = new Set();
const playerProfiles = new Map();

function safeSend(ws, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeString(value, maxLength = 64) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

function sanitizePlayerId(value) {
  const playerId = sanitizeString(value, 42);
  if (!playerId || !PLAYER_ID_REGEX.test(playerId)) return null;
  return playerId;
}

function sanitizeWorldId(value) {
  const worldId = sanitizeString(value, 40);
  if (!worldId || !WORLD_ID_REGEX.test(worldId)) return null;
  return worldId;
}

function sanitizeBoolean(value) {
  return Boolean(value);
}

function sanitizeFiniteNumber(value, min, max, fallback = null) {
  if (!isFiniteNumber(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function sanitizeVec3(value, limits) {
  if (!isPlainObject(value)) return null;

  const x = sanitizeFiniteNumber(value.x, limits.minX, limits.maxX);
  const y = sanitizeFiniteNumber(value.y, limits.minY, limits.maxY);
  const z = sanitizeFiniteNumber(value.z, limits.minZ, limits.maxZ);

  if (x === null || y === null || z === null) return null;
  return { x, y, z };
}

function sanitizeQuaternion(value) {
  if (!isPlainObject(value)) return null;

  const x = sanitizeFiniteNumber(value.x, -1.5, 1.5);
  const y = sanitizeFiniteNumber(value.y, -1.5, 1.5);
  const z = sanitizeFiniteNumber(value.z, -1.5, 1.5);
  const w = sanitizeFiniteNumber(value.w, -1.5, 1.5);

  if (x === null || y === null || z === null || w === null) return null;
  return { x, y, z, w };
}

function sanitizeWheelState(value) {
  if (!isPlainObject(value)) return null;

  const position = sanitizeVec3(value.position, {
    minX: -WORLD_COORD_LIMIT,
    maxX: WORLD_COORD_LIMIT,
    minY: -WORLD_COORD_LIMIT,
    maxY: WORLD_COORD_LIMIT,
    minZ: WORLD_Z_MIN,
    maxZ: WORLD_Z_MAX
  });
  const rotation = sanitizeQuaternion(value.rotation);
  const rotationAngle = sanitizeFiniteNumber(value.rotationAngle, -500, 500, 0);
  const brake = sanitizeFiniteNumber(value.brake, 0, 1, 0);

  if (!position || !rotation) return null;

  return {
    position,
    rotation,
    rotationAngle,
    brake
  };
}

function sanitizeControls(value) {
  if (!isPlainObject(value)) return null;

  return {
    boost: sanitizeBoolean(value.boost),
    brake: sanitizeBoolean(value.brake),
    down: sanitizeBoolean(value.down),
    left: sanitizeBoolean(value.left),
    right: sanitizeBoolean(value.right),
    up: sanitizeBoolean(value.up),
    shoot: sanitizeBoolean(value.shoot),
    siren: sanitizeBoolean(value.siren),
    steering: sanitizeFiniteNumber(value.steering, -1, 1, 0)
  };
}

function sanitizeMatcaps(value) {
  if (!isPlainObject(value)) return {};

  const sanitized = {};
  for (const [key, matcap] of Object.entries(value).slice(0, 16)) {
    if (!MATCAP_KEY_REGEX.test(key)) continue;
    const safeMatcap = sanitizeString(matcap, 64);
    if (safeMatcap) {
      sanitized[key] = safeMatcap;
    }
  }
  return sanitized;
}

function sanitizeSelectedCar(value) {
  return sanitizeString(value, 64);
}

function sanitizeRealtimeState(value) {
  if (!isPlainObject(value)) return {};

  const sanitized = {};

  const position = sanitizeVec3(value.position, {
    minX: -WORLD_COORD_LIMIT,
    maxX: WORLD_COORD_LIMIT,
    minY: -WORLD_COORD_LIMIT,
    maxY: WORLD_COORD_LIMIT,
    minZ: WORLD_Z_MIN,
    maxZ: WORLD_Z_MAX
  });
  if (position) sanitized.position = position;

  const rotation = sanitizeQuaternion(value.rotation);
  if (rotation) sanitized.rotation = rotation;

  const velocity = sanitizeVec3(value.velocity, {
    minX: -VELOCITY_LIMIT,
    maxX: VELOCITY_LIMIT,
    minY: -VELOCITY_LIMIT,
    maxY: VELOCITY_LIMIT,
    minZ: -VELOCITY_LIMIT,
    maxZ: VELOCITY_LIMIT
  });
  if (velocity) sanitized.velocity = velocity;

  if (Array.isArray(value.wheels)) {
    const sanitizedWheels = value.wheels.slice(0, 4).map(sanitizeWheelState).filter(Boolean);
    if (sanitizedWheels.length) sanitized.wheels = sanitizedWheels;
  }

  const controls = sanitizeControls(value.controls);
  if (controls) sanitized.controls = controls;

  const selectedCar = sanitizeSelectedCar(value.selectedCar);
  if (selectedCar) sanitized.selectedCar = selectedCar;

  if (isPlainObject(value.matcaps)) {
    sanitized.matcaps = sanitizeMatcaps(value.matcaps);
  }

  return sanitized;
}

function buildPlayerSnapshot(playerId, player) {
  return {
    playerId,
    ...(player.state || {}),
    selectedCar: player.selectedCar || null,
    matcaps: player.matcaps || {},
    score: isFiniteNumber(player.score) ? player.score : 0,
    battery: isFiniteNumber(player.battery) ? clamp(player.battery, 0, 100) : 100
  };
}

function consumeRateLimit(meta, type) {
  if (!meta) return false;

  const config = MESSAGE_RATE_LIMITS[type] || MESSAGE_RATE_LIMITS.default;
  const now = Date.now();
  const bucket = meta.rateLimits.get(type) || { startedAt: now, count: 0 };

  if (now - bucket.startedAt >= config.windowMs) {
    bucket.startedAt = now;
    bucket.count = 0;
  }

  bucket.count += 1;
  meta.rateLimits.set(type, bucket);

  return bucket.count > config.limit;
}

function registerInvalidMessage(ws, meta, error, closeCode = null) {
  if (!meta) return;
  meta.invalidMessages += 1;
  safeSend(ws, { type: "error", error });

  if (closeCode || meta.invalidMessages >= MAX_INVALID_MESSAGES) {
    try {
      ws.close(closeCode || 4008, error);
    } catch (_error) {
      // no-op
    }
  }
}

function ensurePlayerProfile(playerId) {
  if (!playerProfiles.has(playerId)) {
    playerProfiles.set(playerId, {
      selectedCar: "Kybertruck",
      matcaps: {},
      score: 0,
      friends: [],
      controllerPrefs: null
    });
  }
  return playerProfiles.get(playerId);
}

function sanitizeControllerPrefs(input) {
  if (!input || typeof input !== "object") return null;
  const sanitized = {};
  for (let i = 1; i <= 8; i++) {
    const key = String(i);
    const value = input[key];
    sanitized[key] = typeof value === "string" ? value : null;
  }
  return sanitized;
}

function getFriendList(playerId) {
  const profile = ensurePlayerProfile(playerId);
  if (!Array.isArray(profile.friends)) profile.friends = [];
  return profile.friends;
}

function emitFriendList(ws, playerId, type = "friendList") {
  safeSend(ws, {
    type,
    playerId,
    friends: getFriendList(playerId)
  });
}

function addFriendOneWay(ownerId, friendId) {
  const list = getFriendList(ownerId);
  const existing = list.find((entry) => entry && entry.friendId === friendId);
  if (existing) return false;
  list.push({ friendId, label: "" });
  return true;
}

function removeFriendOneWay(ownerId, friendId) {
  const list = getFriendList(ownerId);
  const index = list.findIndex((entry) => entry && entry.friendId === friendId);
  if (index === -1) return false;
  list.splice(index, 1);
  return true;
}

function buildWorldCounts() {
  const counts = {};
  for (const [worldId, world] of worlds.entries()) {
    counts[worldId] = world.players.size;
  }
  return counts;
}

function emitWorldCountsTo(ws) {
  safeSend(ws, {
    type: "worldCounts",
    counts: buildWorldCounts()
  });
}

function broadcastWorldCounts() {
  const payload = {
    type: "worldCounts",
    counts: buildWorldCounts()
  };
  for (const client of connectedClients) {
    safeSend(client, payload);
  }
}

function broadcastGlobalPlayerCount() {
  const payload = {
    type: "playerCount",
    count: connectedClients.size
  };
  for (const client of connectedClients) {
    safeSend(client, payload);
  }
}

function worldFor(worldId) {
  if (!worlds.has(worldId)) {
    worlds.set(worldId, { players: new Map() });
  }
  return worlds.get(worldId);
}

function emitPlayerCount(worldId) {
  const world = worlds.get(worldId);
  if (!world) return;

  const count = world.players.size;
  for (const player of world.players.values()) {
    safeSend(player.ws, { type: "playerCount", count });
  }
}

function broadcastToWorld(worldId, payload, excludePlayerId) {
  const world = worlds.get(worldId);
  if (!world) return;

  for (const [playerId, player] of world.players.entries()) {
    if (excludePlayerId && playerId === excludePlayerId) continue;
    safeSend(player.ws, payload);
  }
}

function getWorldState(worldId) {
  const world = worlds.get(worldId);
  if (!world) return [];
  return [...world.players.entries()].map(([playerId, player]) => buildPlayerSnapshot(playerId, player));
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function clamp(value, min, max) {
  if (!isFiniteNumber(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function getPlayer(worldId, playerId) {
  const world = worlds.get(worldId);
  if (!world) return null;
  return world.players.get(playerId) || null;
}

function updatePlayerState(worldId, playerId, incoming) {
  const world = worlds.get(worldId);
  if (!world) return null;

  const current = world.players.get(playerId);
  if (!current) return null;

  current.state = {
    ...(current.state || {}),
    ...sanitizeRealtimeState(incoming)
  };

  const selectedCar = sanitizeSelectedCar(incoming.selectedCar);
  if (selectedCar) {
    current.selectedCar = selectedCar;
  }
  if (isPlainObject(incoming.matcaps)) {
    current.matcaps = sanitizeMatcaps(incoming.matcaps);
  }

  world.players.set(playerId, current);

  const profile = ensurePlayerProfile(playerId);
  if (typeof current.selectedCar === "string" && current.selectedCar.trim()) {
    profile.selectedCar = current.selectedCar;
  }
  if (current.matcaps && typeof current.matcaps === "object") {
    profile.matcaps = current.matcaps;
  }
  profile.score = isFiniteNumber(current.score) ? current.score : 0;

  return current;
}

function createToken(playerId) {
  return jwt.sign({ playerId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

function cleanupPlayer(playerId, worldId, expectedWs = null) {
  const world = worlds.get(worldId);
  if (!world) return;

  const existing = world.players.get(playerId);
  if (!existing) return;
  if (expectedWs && existing.ws && existing.ws !== expectedWs) {
    return;
  }

  if (world.players.delete(playerId)) {
    broadcastToWorld(worldId, { type: "playerRemoved", playerId }, playerId);
    emitPlayerCount(worldId);
    broadcastWorldCounts();
  }

  if (world.players.size === 0) {
    worlds.delete(worldId);
  }

  removePlayerFromParty(playerId);
  if (!expectedWs || playerToSocket.get(playerId) === expectedWs) {
    playerToSocket.delete(playerId);
  }
}

function getOrCreatePartyByLeader(leaderId) {
  const existingPartyId = playerToPartyId.get(leaderId);
  if (existingPartyId && parties.has(existingPartyId)) {
    return existingPartyId;
  }

  const partyId = `party:${leaderId}`;
  parties.set(partyId, {
    id: partyId,
    leader: leaderId,
    members: new Set([leaderId])
  });
  playerToPartyId.set(leaderId, partyId);
  return partyId;
}

function emitPartyUpdate(partyId) {
  const party = parties.get(partyId);
  if (!party) return;
  const members = [...party.members];

  for (const memberId of members) {
    const ws = playerToSocket.get(memberId);
    safeSend(ws, {
      type: "partyUpdate",
      party: {
        leader: party.leader,
        members
      }
    });
  }
}

function emitPartyDisbanded(partyId, includeLeaverId) {
  const party = parties.get(partyId);
  if (!party) return;

  const targets = new Set(party.members);
  if (includeLeaverId) targets.add(includeLeaverId);

  for (const memberId of targets) {
    const ws = playerToSocket.get(memberId);
    safeSend(ws, { type: "partyDisbanded" });
  }

  for (const memberId of party.members) {
    playerToPartyId.delete(memberId);
  }
  parties.delete(partyId);
}

function removePlayerFromParty(playerId) {
  const partyId = playerToPartyId.get(playerId);
  if (!partyId || !parties.has(partyId)) {
    playerToPartyId.delete(playerId);
    return;
  }

  const party = parties.get(partyId);
  party.members.delete(playerId);
  playerToPartyId.delete(playerId);

  if (party.members.size < 2) {
    emitPartyDisbanded(partyId, playerId);
    return;
  }

  if (!party.members.has(party.leader)) {
    party.leader = [...party.members][0];
  }

  emitPartyUpdate(partyId);

  if (party.members.size === 2) {
    for (const memberId of party.members) {
      const ws = playerToSocket.get(memberId);
      safeSend(ws, { type: "partyTwoLeft" });
    }
  }
}

function getPartyForPlayer(playerId) {
  const partyId = playerToPartyId.get(playerId);
  if (!partyId) return null;
  return parties.get(partyId) || null;
}

function arePartyMates(playerIdA, playerIdB) {
  if (!playerIdA || !playerIdB || playerIdA === playerIdB) return false;
  const partyA = getPartyForPlayer(playerIdA);
  if (!partyA) return false;
  return partyA.members.has(playerIdB);
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString()
  });
});

app.get("/state", (_req, res) => {
  if (IS_PRODUCTION) {
    return res.status(404).json({ error: "Not found" });
  }

  const snapshot = [...worlds.entries()].reduce((acc, [worldId, world]) => {
    acc[worldId] = {
      playerCount: world.players.size,
      players: [...world.players.entries()].map(([playerId, player]) => ({
        playerId,
        score: player.score || 0,
        battery: isFiniteNumber(player.battery) ? player.battery : 100
      }))
    };
    return acc;
  }, {});

  res.json({
    worlds: snapshot,
    parties: [...parties.values()].map((party) => ({
      id: party.id,
      leader: party.leader,
      members: [...party.members]
    }))
  });
});

app.post("/getToken", (req, res) => {
  const playerId = sanitizePlayerId(req.body?.playerId);
  if (!playerId) {
    return res.status(400).json({ error: "valid playerId is required" });
  }

  const token = createToken(playerId);
  return res.json({ token });
});

function handleSocketDisconnect(ws) {
  const meta = socketMeta.get(ws);
  if (!meta || meta.closed) return;

  meta.closed = true;
  connectedClients.delete(ws);

  if (meta.playerId && meta.worldId) {
    cleanupPlayer(meta.playerId, meta.worldId, ws);
  }

  if (meta.playerId && playerToSocket.get(meta.playerId) === ws) {
    playerToSocket.delete(meta.playerId);
  }

  broadcastGlobalPlayerCount();
}

wss.on("connection", (ws, req) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host}`);
  const token = requestUrl.searchParams.get("token");

  if (!token) {
    safeSend(ws, { type: "error", error: "Missing token" });
    ws.close(4001, "Missing token");
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (_error) {
    safeSend(ws, { type: "error", error: "Invalid token" });
    ws.close(4002, "Invalid token");
    return;
  }

  socketMeta.set(ws, {
    authenticatedPlayerId: decoded.playerId,
    playerId: null,
    worldId: null,
    invalidMessages: 0,
    rateLimits: new Map(),
    closed: false
  });

  connectedClients.add(ws);
  emitWorldCountsTo(ws);
  broadcastGlobalPlayerCount();

  ws.on("message", (raw) => {
    const meta = socketMeta.get(ws);
    if (!meta || meta.closed) return;

    if (Buffer.byteLength(raw) > WS_MESSAGE_MAX_BYTES) {
      registerInvalidMessage(ws, meta, "Message too large", 4009);
      return;
    }

    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch (_error) {
      registerInvalidMessage(ws, meta, "Invalid JSON payload");
      return;
    }

    if (!isPlainObject(message)) {
      registerInvalidMessage(ws, meta, "Invalid message payload");
      return;
    }

    const messageType = sanitizeString(message.type, 40);
    if (!messageType) {
      registerInvalidMessage(ws, meta, "Invalid message type");
      return;
    }

    if (consumeRateLimit(meta, messageType)) {
      registerInvalidMessage(ws, meta, `Rate limit exceeded for ${messageType}`);
      return;
    }

    if (messageType === "getSelectedCar") {
      const playerId = sanitizePlayerId(message.playerId);
      if (!playerId || playerId !== meta.authenticatedPlayerId) {
        safeSend(ws, { type: "error", error: "Token/player mismatch" });
        return;
      }

      const profile = ensurePlayerProfile(playerId);
      safeSend(ws, {
        type: "selectedCar",
        selectedCar: profile.selectedCar || "Kybertruck",
        matcaps: profile.matcaps || {}
      });
      return;
    }

    if (messageType === "setSelectedCar") {
      const playerId = sanitizePlayerId(message.playerId);
      if (!playerId || playerId !== meta.authenticatedPlayerId) {
        safeSend(ws, { type: "error", error: "Token/player mismatch" });
        return;
      }

      const profile = ensurePlayerProfile(playerId);
      const selectedCar = sanitizeSelectedCar(message.carName);
      if (selectedCar) {
        profile.selectedCar = selectedCar;
      }
      profile.matcaps = sanitizeMatcaps(message.matcaps);

      for (const [worldId, world] of worlds.entries()) {
        if (!world.players.has(playerId)) continue;
        const livePlayer = world.players.get(playerId);
        if (!livePlayer) continue;

        livePlayer.selectedCar = profile.selectedCar || livePlayer.selectedCar || "Kybertruck";
        livePlayer.matcaps = profile.matcaps || livePlayer.matcaps || {};
        world.players.set(playerId, livePlayer);

        broadcastToWorld(
          worldId,
          {
            type: "playerSelectionUpdate",
            ...buildPlayerSnapshot(playerId, livePlayer)
          },
          playerId
        );
      }

      safeSend(ws, {
        type: "selectedCar",
        selectedCar: profile.selectedCar || "Kybertruck",
        matcaps: profile.matcaps || {}
      });
      return;
    }

    if (messageType === "getScore") {
      const playerId = sanitizePlayerId(message.playerId);
      if (!playerId || playerId !== meta.authenticatedPlayerId) {
        safeSend(ws, { type: "error", error: "Token/player mismatch" });
        return;
      }

      const profile = ensurePlayerProfile(playerId);
      safeSend(ws, {
        type: "playerScore",
        playerId,
        score: isFiniteNumber(profile.score) ? profile.score : 0
      });
      return;
    }

    if (messageType === "getControllerPrefs") {
      const playerId = sanitizePlayerId(message.playerId);
      if (!playerId || playerId !== meta.authenticatedPlayerId) {
        safeSend(ws, { type: "error", error: "Token/player mismatch" });
        return;
      }

      const profile = ensurePlayerProfile(playerId);
      safeSend(ws, {
        type: "controllerPrefs",
        playerId,
        buttonPositions: profile.controllerPrefs || null
      });
      return;
    }

    if (messageType === "saveControllerPrefs") {
      const playerId = sanitizePlayerId(message.playerId);
      if (!playerId || playerId !== meta.authenticatedPlayerId) {
        safeSend(ws, { type: "error", error: "Token/player mismatch" });
        return;
      }

      const profile = ensurePlayerProfile(playerId);
      profile.controllerPrefs = sanitizeControllerPrefs(message.buttonPositions);
      safeSend(ws, {
        type: "controllerPrefs",
        playerId,
        buttonPositions: profile.controllerPrefs
      });
      return;
    }

    if (messageType === "getFriends" || messageType === "updateFriendList") {
      const playerId = sanitizePlayerId(message.playerId);
      if (!playerId || playerId !== meta.authenticatedPlayerId) {
        safeSend(ws, { type: "error", error: "Token/player mismatch" });
        return;
      }
      emitFriendList(ws, playerId, messageType === "getFriends" ? "friendList" : "friendListUpdate");
      return;
    }

    if (messageType === "updateFriendLabel") {
      const playerId = sanitizePlayerId(message.playerId);
      const friendId = sanitizePlayerId(message.friendId);
      if (!playerId || playerId !== meta.authenticatedPlayerId || !friendId) {
        safeSend(ws, { type: "error", error: "Invalid friend label update" });
        return;
      }

      const friends = getFriendList(playerId);
      const entry = friends.find((item) => item && item.friendId === friendId);
      if (entry) {
        entry.label = sanitizeString(message.label, 60) || "";
      }
      emitFriendList(ws, playerId, "friendListUpdate");
      return;
    }

    if (messageType === "removeFriend") {
      const playerId = sanitizePlayerId(message.playerId);
      const friendId = sanitizePlayerId(message.friendId);
      if (!playerId || playerId !== meta.authenticatedPlayerId || !friendId) {
        safeSend(ws, { type: "error", error: "Invalid removeFriend request" });
        return;
      }

      removeFriendOneWay(playerId, friendId);
      removeFriendOneWay(friendId, playerId);

      emitFriendList(ws, playerId, "friendListUpdate");
      const friendWs = playerToSocket.get(friendId);
      if (friendWs) {
        emitFriendList(friendWs, friendId, "friendListUpdate");
      }
      return;
    }

    if (messageType === "inviteFriendship") {
      const inviterId = sanitizePlayerId(message.friendRequestId);
      const targetPlayerId = sanitizePlayerId(message.targetPlayerId);
      if (!inviterId || inviterId !== meta.authenticatedPlayerId || !targetPlayerId) {
        safeSend(ws, { type: "error", error: "Invalid friendship invite" });
        return;
      }
      if (inviterId === targetPlayerId) return;

      const targetWs = playerToSocket.get(targetPlayerId);
      if (!targetWs) return;

      safeSend(targetWs, {
        type: "inviteFriendship",
        friendRequestId: inviterId,
        targetPlayerId
      });
      return;
    }

    if (messageType === "friendshipResponse") {
      const responderId = meta.authenticatedPlayerId;
      const inviterId = sanitizePlayerId(message.friendRequestId);
      const playerId = sanitizePlayerId(message.playerId);
      if (!inviterId || playerId !== responderId) {
        safeSend(ws, { type: "error", error: "Invalid friendship response" });
        return;
      }

      const inviterWs = playerToSocket.get(inviterId);
      safeSend(inviterWs, {
        type: "friendshipResponse",
        response: message.response,
        friendRequestId: inviterId,
        playerId: responderId
      });

      if (message.response === "yes") {
        addFriendOneWay(inviterId, responderId);
        addFriendOneWay(responderId, inviterId);

        if (inviterWs) emitFriendList(inviterWs, inviterId, "friendListUpdate");
        emitFriendList(ws, responderId, "friendListUpdate");
      }
      return;
    }

    if (messageType === "join") {
      const playerId = sanitizePlayerId(message.playerId);
      const worldId = sanitizeWorldId(message.worldId) || "world-1";
      const selectedCar = sanitizeSelectedCar(message.selectedCar);
      const matcaps = sanitizeMatcaps(message.matcaps);

      if (!playerId || playerId !== meta.authenticatedPlayerId) {
        safeSend(ws, { type: "error", error: "Token/player mismatch" });
        ws.close(4003, "Token/player mismatch");
        return;
      }

      if (meta.playerId && meta.worldId && (meta.playerId !== playerId || meta.worldId !== worldId)) {
        cleanupPlayer(meta.playerId, meta.worldId, ws);
      }

      const world = worldFor(worldId);
      if (!world.players.has(playerId) && world.players.size >= MAX_PLAYERS_PER_WORLD) {
        safeSend(ws, { type: "worldFull", worldId });
        return;
      }

      meta.playerId = playerId;
      meta.worldId = worldId;

      const previousSocket = playerToSocket.get(playerId);
      if (previousSocket && previousSocket !== ws) {
        try {
          previousSocket.close(4004, "Replaced by new connection");
        } catch (_error) {
          // no-op
        }
      }
      playerToSocket.set(playerId, ws);

      const profile = ensurePlayerProfile(playerId);

      const existing = world.players.get(playerId) || {};
      world.players.set(playerId, {
        ws,
        state: existing.state || {},
        selectedCar: selectedCar || profile.selectedCar || existing.selectedCar || "Kybertruck",
        matcaps: Object.keys(matcaps).length ? matcaps : profile.matcaps || existing.matcaps || {},
        battery: typeof existing.battery === "number" ? existing.battery : 100,
        score: existing.score || 0
      });

      const joinedPlayer = world.players.get(playerId);
      profile.selectedCar = joinedPlayer.selectedCar || profile.selectedCar || "Kybertruck";
      profile.matcaps = joinedPlayer.matcaps || profile.matcaps || {};
      profile.score = joinedPlayer.score || profile.score || 0;

      safeSend(ws, { type: "stateUpdate", state: getWorldState(worldId) });
      safeSend(ws, {
        type: "playerScore",
        playerId,
        score: joinedPlayer.score || 0
      });

      broadcastToWorld(
        worldId,
        {
          type: "playerJoined",
          playerId,
          state: buildPlayerSnapshot(playerId, world.players.get(playerId))
        },
        playerId
      );
      emitPlayerCount(worldId);
      broadcastWorldCounts();
      return;
    }

    if (!meta.playerId || !meta.worldId) {
      safeSend(ws, { type: "error", error: "Join first" });
      return;
    }

    const world = worlds.get(meta.worldId);
    if (!world || !world.players.has(meta.playerId)) return;

    if (messageType === "update") {
      const updated = updatePlayerState(meta.worldId, meta.playerId, message);
      if (!updated) return;

      broadcastToWorld(
        meta.worldId,
        {
          type: "update",
          ...buildPlayerSnapshot(meta.playerId, updated)
        },
        meta.playerId
      );
      return;
    }

    if (messageType === "remove") {
      cleanupPlayer(meta.playerId, meta.worldId, ws);
      return;
    }

    if (messageType === "bulletFired") {
      const position = sanitizeVec3(message.position, {
        minX: -WORLD_COORD_LIMIT,
        maxX: WORLD_COORD_LIMIT,
        minY: -WORLD_COORD_LIMIT,
        maxY: WORLD_COORD_LIMIT,
        minZ: WORLD_Z_MIN,
        maxZ: WORLD_Z_MAX
      });
      const rotation = sanitizeQuaternion(message.rotation);
      const velocity = sanitizeVec3(message.velocity, {
        minX: -VELOCITY_LIMIT,
        maxX: VELOCITY_LIMIT,
        minY: -VELOCITY_LIMIT,
        maxY: VELOCITY_LIMIT,
        minZ: -VELOCITY_LIMIT,
        maxZ: VELOCITY_LIMIT
      });

      if (!position || !rotation || !velocity) {
        safeSend(ws, { type: "error", error: "Invalid bullet payload" });
        return;
      }

      broadcastToWorld(
        meta.worldId,
        {
          type: "bulletFired",
          shooterId: meta.playerId,
          position,
          rotation,
          velocity
        },
        meta.playerId
      );
      return;
    }

    if (messageType === "bulletCollision") {
      const targetPlayerId = sanitizePlayerId(message.carId);
      const shooterId = meta.playerId;

      if (!targetPlayerId || targetPlayerId === shooterId || arePartyMates(shooterId, targetPlayerId)) {
        return;
      }

      const target = getPlayer(meta.worldId, targetPlayerId);
      const shooter = getPlayer(meta.worldId, shooterId);
      if (!target || !shooter) return;

      target.battery = clamp((isFiniteNumber(target.battery) ? target.battery : 100) - 1, 0, 100);
      world.players.set(targetPlayerId, target);

      if (target.battery <= 0) {
        shooter.score = (isFiniteNumber(shooter.score) ? shooter.score : 0) + 1;
        world.players.set(shooterId, shooter);
        safeSend(shooter.ws, {
          type: "playerScore",
          playerId: shooterId,
          score: shooter.score
        });
      }

      ensurePlayerProfile(shooterId).score = shooter.score || 0;

      broadcastToWorld(
        meta.worldId,
        {
          type: "bulletCollision",
          carId: targetPlayerId,
          shooterId,
          battery: target.battery,
          score: shooter.score || 0
        },
        meta.playerId
      );
      return;
    }

    if (messageType === "destroyCar") {
      const targetPlayerId = sanitizePlayerId(message.carId);
      const attackerId = sanitizePlayerId(message.attackerId);
      const reason = sanitizeString(message.reason, 32) || "unknown";
      const durationMs = sanitizeFiniteNumber(message.durationMs, 0, 15000, 0);

      if (!targetPlayerId) return;

      const target = getPlayer(meta.worldId, targetPlayerId);
      if (!target) return;

      if (reason === "carCollision" && attackerId && attackerId !== targetPlayerId && !arePartyMates(attackerId, targetPlayerId)) {
        const attacker = getPlayer(meta.worldId, attackerId);
        if (attacker) {
          attacker.score = (isFiniteNumber(attacker.score) ? attacker.score : 0) + 1;
          world.players.set(attackerId, attacker);
          ensurePlayerProfile(attackerId).score = attacker.score;
          safeSend(attacker.ws, {
            type: "playerScore",
            playerId: attackerId,
            score: attacker.score
          });
        }
      }

      target.battery = 100;
      world.players.set(targetPlayerId, target);

      broadcastToWorld(
        meta.worldId,
        {
          type: "destroyCar",
          carId: targetPlayerId,
          durationMs,
          reason,
          attackerId: attackerId || null
        },
        meta.playerId
      );
      return;
    }

    if (messageType === "invite") {
      const inviterId = sanitizePlayerId(message.inviterId);
      if (inviterId !== meta.playerId) return;
      const inviterParty = getPartyForPlayer(meta.playerId);
      if (inviterParty && inviterParty.leader !== meta.playerId) {
        safeSend(ws, {
          type: "partyInviteDenied",
          reason: "onlyLeaderCanInvite"
        });
        return;
      }
      if (inviterParty && inviterParty.members.size >= MAX_PARTY_SIZE) {
        safeSend(ws, {
          type: "partyInviteDenied",
          reason: "partyFull"
        });
        return;
      }

      const targetPlayerId = sanitizePlayerId(message.targetPlayerId);
      if (!targetPlayerId || targetPlayerId === meta.playerId) return;
      const targetWs = playerToSocket.get(targetPlayerId);
      const targetMeta = targetWs ? socketMeta.get(targetWs) : null;
      if (!targetWs || !targetMeta || targetMeta.worldId !== meta.worldId) return;
      const targetParty = getPartyForPlayer(targetPlayerId);
      if (targetParty) {
        safeSend(ws, {
          type: "partyInviteDenied",
          reason: "targetAlreadyInParty"
        });
        return;
      }

      safeSend(targetWs, {
        type: "invite",
        inviterId: meta.playerId,
        targetPlayerId
      });
      return;
    }

    if (messageType === "inviteResponse") {
      const playerId = sanitizePlayerId(message.playerId);
      const inviterId = sanitizePlayerId(message.inviterId);
      if (playerId !== meta.playerId || !inviterId) return;
      const inviterWs = playerToSocket.get(inviterId);
      safeSend(inviterWs, {
        type: "inviteResponse",
        response: message.response,
        inviterId,
        playerId
      });
      return;
    }

    if (messageType === "addToParty") {
      const inviterId = sanitizePlayerId(message.inviterId);
      const playerId = sanitizePlayerId(message.playerId);
      if (inviterId !== meta.playerId) return;
      if (!playerId || playerId === inviterId) return;

      const inviterWs = playerToSocket.get(inviterId);
      const playerWs = playerToSocket.get(playerId);
      if (!inviterWs || !playerWs) return;

      const inviterMeta = socketMeta.get(inviterWs);
      const playerMeta = socketMeta.get(playerWs);
      if (!inviterMeta || !playerMeta || inviterMeta.worldId !== playerMeta.worldId) return;

      const inviterParty = getPartyForPlayer(inviterId);
      if (inviterParty && inviterParty.leader !== inviterId) return;

      const existingPlayerPartyId = playerToPartyId.get(playerId);
      if (existingPlayerPartyId && parties.has(existingPlayerPartyId)) {
        removePlayerFromParty(playerId);
      }

      const partyId = getOrCreatePartyByLeader(inviterId);
      const party = parties.get(partyId);
      if (!party) return;
      if (party.members.size >= MAX_PARTY_SIZE && !party.members.has(playerId)) return;

      party.members.add(playerId);
      playerToPartyId.set(playerId, partyId);
      emitPartyUpdate(partyId);
      return;
    }

    if (messageType === "partyMessage") {
      const partyId = playerToPartyId.get(meta.playerId);
      const party = partyId ? parties.get(partyId) : null;
      if (!party) return;
      const text = sanitizeString(message.text, 500) || "";
      if (!text) return;

      for (const memberId of party.members) {
        const memberWs = playerToSocket.get(memberId);
        safeSend(memberWs, {
          type: "partyMessage",
          senderId: meta.playerId,
          text
        });
      }
      return;
    }

    if (messageType === "leaveParty") {
      const leavingPlayerId = sanitizePlayerId(message.playerId) || meta.playerId;
      if (leavingPlayerId !== meta.playerId) return;
      removePlayerFromParty(leavingPlayerId);
      return;
    }

    safeSend(ws, { type: "error", error: `Unsupported message type: ${messageType}` });
  });

  ws.on("close", () => {
    handleSocketDisconnect(ws);
  });

  ws.on("error", () => {
    handleSocketDisconnect(ws);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
