require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const WebSocket = require("ws");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 8080);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const MAX_PLAYERS_PER_WORLD = Number(process.env.MAX_PLAYERS_PER_WORLD || 5);
const MAX_PARTY_SIZE = Number(process.env.MAX_PARTY_SIZE || 8);
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || "7d";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

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

function worldPlayerCount(worldId) {
  const world = worlds.get(worldId);
  return world ? world.players.size : 0;
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
  return [...world.players.entries()].map(([playerId, player]) => ({
    playerId,
    ...(player.state || {}),
    selectedCar: player.selectedCar || null,
    matcaps: player.matcaps || {},
    score: player.score || 0,
    battery: typeof player.battery === "number" ? player.battery : 100
  }));
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
    ...incoming
  };

  if (isFiniteNumber(incoming.score)) current.score = incoming.score;
  if (isFiniteNumber(incoming.battery)) current.battery = clamp(incoming.battery, 0, 100);
  if (typeof incoming.selectedCar === "string" && incoming.selectedCar.trim()) {
    current.selectedCar = incoming.selectedCar;
  }
  if (incoming.matcaps && typeof incoming.matcaps === "object") {
    current.matcaps = incoming.matcaps;
  }

  world.players.set(playerId, current);

  const profile = ensurePlayerProfile(playerId);
  if (typeof current.selectedCar === "string" && current.selectedCar.trim()) {
    profile.selectedCar = current.selectedCar;
  }
  if (current.matcaps && typeof current.matcaps === "object") {
    profile.matcaps = current.matcaps;
  }
  if (isFiniteNumber(current.score)) {
    profile.score = current.score;
  }

  return current;
}

function createToken(playerId) {
  return jwt.sign({ playerId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

function cleanupPlayer(playerId, worldId) {
  const world = worlds.get(worldId);
  if (!world) return;

  if (world.players.delete(playerId)) {
    broadcastToWorld(worldId, { type: "playerRemoved", playerId }, playerId);
    emitPlayerCount(worldId);
    broadcastWorldCounts();
  }

  if (world.players.size === 0) {
    worlds.delete(worldId);
  }

  removePlayerFromParty(playerId);
  playerToSocket.delete(playerId);
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
  const { playerId } = req.body || {};
  if (!playerId || typeof playerId !== "string") {
    return res.status(400).json({ error: "playerId is required" });
  }

  const token = createToken(playerId);
  return res.json({ token });
});

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
    worldId: null
  });

  connectedClients.add(ws);
  emitWorldCountsTo(ws);
  broadcastGlobalPlayerCount();

  ws.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch (_error) {
      return;
    }

    const meta = socketMeta.get(ws);
    if (!meta) return;

    if (message.type === "generateWorldId") {
      const predefined = Array.isArray(message.predefinedWorldIds) ? message.predefinedWorldIds : [];
      let selected = predefined.find((id) => worldPlayerCount(id) < MAX_PLAYERS_PER_WORLD) || null;
      if (!selected) {
        const autoId = `world-${Math.max(worlds.size + 1, 1)}`;
        selected = autoId;
      }
      safeSend(ws, {
        type: "generateWorldIdResult",
        success: Boolean(selected),
        worldId: selected
      });
      return;
    }

    if (message.type === "findPlayerWorld") {
      const targetPlayerId = message.playerId;
      let foundWorldId = null;
      for (const [worldId, world] of worlds.entries()) {
        if (world.players.has(targetPlayerId)) {
          foundWorldId = worldId;
          break;
        }
      }
      safeSend(ws, {
        type: "findPlayerWorldResult",
        success: Boolean(foundWorldId),
        worldId: foundWorldId
      });
      return;
    }

    if (message.type === "getSelectedCar") {
      const playerId = message.playerId;
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

    if (message.type === "setSelectedCar") {
      const playerId = message.playerId;
      if (!playerId || playerId !== meta.authenticatedPlayerId) {
        safeSend(ws, { type: "error", error: "Token/player mismatch" });
        return;
      }

      const profile = ensurePlayerProfile(playerId);
      if (typeof message.carName === "string" && message.carName.trim()) {
        profile.selectedCar = message.carName;
      }
      if (message.matcaps && typeof message.matcaps === "object") {
        profile.matcaps = message.matcaps;
      }

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
            playerId,
            selectedCar: livePlayer.selectedCar,
            matcaps: livePlayer.matcaps || {},
            ...(livePlayer.state || {})
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

    if (message.type === "getScore") {
      const playerId = message.playerId;
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

    if (message.type === "getControllerPrefs") {
      const playerId = message.playerId;
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

    if (message.type === "saveControllerPrefs") {
      const playerId = message.playerId;
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

    if (message.type === "getFriends" || message.type === "updateFriendList") {
      const playerId = message.playerId;
      if (!playerId || playerId !== meta.authenticatedPlayerId) {
        safeSend(ws, { type: "error", error: "Token/player mismatch" });
        return;
      }
      emitFriendList(ws, playerId, message.type === "getFriends" ? "friendList" : "friendListUpdate");
      return;
    }

    if (message.type === "updateFriendLabel") {
      const playerId = message.playerId;
      const friendId = message.friendId;
      if (!playerId || playerId !== meta.authenticatedPlayerId || !friendId) {
        safeSend(ws, { type: "error", error: "Invalid friend label update" });
        return;
      }

      const profile = ensurePlayerProfile(playerId);
      const friends = getFriendList(playerId);
      const entry = friends.find((item) => item && item.friendId === friendId);
      if (entry) {
        entry.label = typeof message.label === "string" ? message.label.trim().slice(0, 60) : "";
      }
      emitFriendList(ws, playerId, "friendListUpdate");
      return;
    }

    if (message.type === "removeFriend") {
      const playerId = message.playerId;
      const friendId = message.friendId;
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

    if (message.type === "inviteFriendship") {
      const inviterId = message.friendRequestId;
      const targetPlayerId = message.targetPlayerId;
      if (!inviterId || inviterId !== meta.authenticatedPlayerId || !targetPlayerId) {
        safeSend(ws, { type: "error", error: "Invalid friendship invite" });
        return;
      }

      const targetWs = playerToSocket.get(targetPlayerId);
      if (!targetWs) return;

      safeSend(targetWs, {
        type: "inviteFriendship",
        friendRequestId: inviterId,
        targetPlayerId
      });
      return;
    }

    if (message.type === "friendshipResponse") {
      const responderId = meta.authenticatedPlayerId;
      const inviterId = message.friendRequestId;
      if (!inviterId || message.playerId !== responderId) {
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

    if (message.type === "join") {
      const playerId = message.playerId;
      const worldId = message.worldId || "world-1";
      const selectedCar =
        typeof message.selectedCar === "string" && message.selectedCar.trim()
          ? message.selectedCar
          : null;
      const matcaps = message.matcaps && typeof message.matcaps === "object" ? message.matcaps : {};

      if (!playerId || playerId !== meta.authenticatedPlayerId) {
        safeSend(ws, { type: "error", error: "Token/player mismatch" });
        ws.close(4003, "Token/player mismatch");
        return;
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
          state: {
            playerId,
            ...(world.players.get(playerId).state || {}),
            selectedCar: world.players.get(playerId).selectedCar || null,
            matcaps: world.players.get(playerId).matcaps || {},
            score: world.players.get(playerId).score || 0,
            battery: world.players.get(playerId).battery
          }
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

    if (message.type === "update") {
      message.playerId = meta.playerId;
      message.worldId = meta.worldId;
      updatePlayerState(meta.worldId, meta.playerId, message);
      broadcastToWorld(meta.worldId, message, meta.playerId);
      return;
    }

    if (message.type === "carStateUpdate") {
      message.playerId = meta.playerId;
      message.worldId = meta.worldId;
      updatePlayerState(meta.worldId, meta.playerId, message);
      broadcastToWorld(meta.worldId, message, meta.playerId);
      return;
    }

    if (message.type === "remove") {
      cleanupPlayer(meta.playerId, meta.worldId);
      return;
    }

    if (message.type === "bulletFired") {
      message.shooterId = meta.playerId;
      broadcastToWorld(meta.worldId, message, meta.playerId);
      return;
    }

    if (message.type === "bulletCollision") {
      const targetPlayerId = message.carId;
      const shooterId = message.shooterId;
      if (arePartyMates(shooterId, targetPlayerId)) {
        return;
      }
      const target = getPlayer(meta.worldId, targetPlayerId);
      const shooter = getPlayer(meta.worldId, shooterId);

      if (target && isFiniteNumber(message.battery)) {
        target.battery = clamp(message.battery, 0, 100);
        world.players.set(targetPlayerId, target);
      }

      if (shooter && isFiniteNumber(message.score)) {
        shooter.score = message.score;
        world.players.set(shooterId, shooter);
        safeSend(shooter.ws, {
          type: "playerScore",
          playerId: shooterId,
          score: shooter.score
        });
      }

      broadcastToWorld(meta.worldId, message, meta.playerId);
      return;
    }

    if (message.type === "carCollision") {
      const hitCarId = message.hitCarId;
      if (arePartyMates(meta.playerId, hitCarId)) {
        return;
      }
      const hitCar = getPlayer(meta.worldId, hitCarId);

      if (hitCar && isFiniteNumber(message.battery)) {
        hitCar.battery = clamp(message.battery, 0, 100);
        world.players.set(hitCarId, hitCar);
      }

      if (isFiniteNumber(message.score)) {
        const hitter = getPlayer(meta.worldId, meta.playerId);
        if (hitter) {
          hitter.score = message.score;
          world.players.set(meta.playerId, hitter);
          safeSend(hitter.ws, {
            type: "playerScore",
            playerId: meta.playerId,
            score: hitter.score
          });
        }
      }

      broadcastToWorld(meta.worldId, message, meta.playerId);
      return;
    }

    if (message.type === "batteryUpdate") {
      const updated = updatePlayerState(meta.worldId, meta.playerId, {
        battery: clamp(message.battery, 0, 100)
      });
      if (!updated) return;
      broadcastToWorld(
        meta.worldId,
        {
          type: "batteryStatus",
          playerId: meta.playerId,
          battery: updated.battery
        },
        meta.playerId
      );
      return;
    }

    if (message.type === "destroyCar" || message.type === "bulletUpdate") {
      broadcastToWorld(meta.worldId, message, meta.playerId);
      return;
    }

    if (message.type === "invite") {
      if (message.inviterId !== meta.playerId) return;
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

      const targetPlayerId = message.targetPlayerId;
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

    if (message.type === "inviteResponse") {
      if (message.playerId !== meta.playerId) return;
      const inviterWs = playerToSocket.get(message.inviterId);
      safeSend(inviterWs, {
        type: "inviteResponse",
        response: message.response,
        inviterId: message.inviterId,
        playerId: message.playerId
      });
      return;
    }

    if (message.type === "addToParty") {
      const inviterId = message.inviterId;
      const playerId = message.playerId;
      if (inviterId !== meta.playerId) return;

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

    if (message.type === "partyMessage") {
      const partyId = playerToPartyId.get(meta.playerId);
      const party = partyId ? parties.get(partyId) : null;
      if (!party) return;
      const text = typeof message.text === "string" ? message.text.trim().slice(0, 500) : "";
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

    if (message.type === "leaveParty") {
      const leavingPlayerId = message.playerId || meta.playerId;
      if (leavingPlayerId !== meta.playerId) return;
      removePlayerFromParty(leavingPlayerId);
      return;
    }
  });

  ws.on("close", () => {
    const meta = socketMeta.get(ws);
    if (!meta) return;
    connectedClients.delete(ws);
    if (meta.playerId && meta.worldId) {
      cleanupPlayer(meta.playerId, meta.worldId);
      playerToSocket.delete(meta.playerId);
    }
    broadcastGlobalPlayerCount();
  });

  ws.on("error", () => {
    const meta = socketMeta.get(ws);
    if (!meta) return;
    connectedClients.delete(ws);
    if (meta.playerId && meta.worldId) {
      cleanupPlayer(meta.playerId, meta.worldId);
      playerToSocket.delete(meta.playerId);
    }
    broadcastGlobalPlayerCount();
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
