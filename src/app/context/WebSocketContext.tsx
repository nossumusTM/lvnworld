'use client'; // Marking this as a client component
import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

interface WebSocketContextType {
  wsRef: React.RefObject<WebSocket | null>;
  isWebSocketReady: boolean;
  setIsWebSocketReady: React.Dispatch<React.SetStateAction<boolean>>;
  initializeWebSocket: (playerId: string) => void;
  setCarName: React.Dispatch<React.SetStateAction<string>>;
  setMatcaps: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setPlayerAccount: React.Dispatch<React.SetStateAction<number>>;
  setSelectedWorldId: React.Dispatch<React.SetStateAction<string | null>>;
  updateWorldList: (counts: Record<string, number>) => void;
  addSignalEffect: (worldId: string, location: { lat: number; lng: number }) => void;
  removeSignalEffect: (worldId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8080';
  const [isWebSocketReady, setIsWebSocketReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [carName, setCarName] = useState('');
  const [matcaps, setMatcaps] = useState<Record<string, any>>({});
  const [playerAccount, setPlayerAccount] = useState<number>(0);
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null);
  const worldPlayerCounts = useRef<Map<string, number>>(new Map());

  const updateWorldList = (counts: Record<string, number>) => {
    // Your logic to update the world list based on counts
    console.log('World list updated with counts:', counts);
  };

  const addSignalEffect = (worldId: string, location: { lat: number; lng: number }) => {
    console.log(`Adding signal for ${worldId} at ${location.lat}, ${location.lng}`);
  };

  const removeSignalEffect = (worldId: string) => {
    console.log(`Removing signal for ${worldId}`);
  };

  const initializeWebSocket = useCallback((playerId: string) => {
    console.log('Initializing WebSocket...');
    if (!playerId) {
      console.error('Cannot initialize WebSocket: playerId is missing');
      return;
    }

    if (wsRef.current) {
      console.log('WebSocket already initialized');
      return;
    }

    const token = localStorage.getItem('token');
    console.log('Token:', token);

    const serverAddress = `${WS_BASE_URL}?token=${encodeURIComponent(token || '')}`;
    console.log('WebSocket server address:', serverAddress);

    wsRef.current = new WebSocket(serverAddress);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsWebSocketReady(true);
      setRetryCount(0);

      if (playerId) {
        console.log('Requesting selected car for playerId:', playerId);
        wsRef.current?.send(
          JSON.stringify({
            type: 'getSelectedCar',
            playerId,
          })
        );
      } else {
        console.error('Player ID is missing or invalid');
      }
    };

    wsRef.current.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (error) {
        console.error('Error parsing message:', event.data);
        return;
      }

      console.log('Received message:', message);

      if (message.type === 'selectedCar') {
        console.log('SelectedCar message received:', message);
        if (message.selectedCar) {
          setCarName(message.selectedCar);
          console.log('Selected car set to:', message.selectedCar);

          if (message.matcaps) {
            console.log('Matcaps before setting state:', message.matcaps);
            setMatcaps(message.matcaps);
            console.log('Matcaps state updated to:', message.matcaps);
          } else {
            console.warn('No matcaps data received. Defaulting to empty object.');
            setMatcaps({});
          }
        } else {
          console.warn('No selected car found. Defaulting to kybertruck.');
          setCarName('kybertruck');
          setMatcaps({});
        }
      }

      if (message.type === 'playerCount') {
        const playerCountElement = document.getElementById('userCountDisplay');
        if (playerCountElement) {
          playerCountElement.innerText = `${message.count}`;
        }

        const playerCount = message.count;
        const barThresholds = [1, 150, 300, 500];
        const signalBars = document.querySelectorAll('.signal-bars .bar');

        signalBars.forEach((bar, index) => {
          const htmlBar = bar as HTMLElement;
          if (playerCount >= barThresholds[index]) {
            htmlBar.style.opacity = '1';
          } else {
            htmlBar.style.opacity = '0.5';
          }
        });
      }

      if (message.type === 'playerScore') {
        if (typeof message.score === 'number') {
          console.log(`Player score received for player ${message.playerId}:`, message.score);
          setPlayerAccount(message.score);
        } else {
          console.error('Invalid score received:', message.score);
        }
      }

      if (message.type === 'worldCounts') {
        if (!message.hasOwnProperty('counts') || typeof message.counts !== 'object' || message.counts === null) {
          console.log('Invalid counts in worldCounts message:', message.counts);
          return;
        }

        if (!selectedWorldId) {
          console.log('Updating world list with counts:', message.counts);
          updateWorldList(message.counts);

          Object.entries(message.counts).forEach(([worldId, count]) => {
            const previousCount = worldPlayerCounts.current.get(worldId) || 0;
            const newCount = typeof count === 'number' ? count : 0;

            worldPlayerCounts.current.set(worldId, newCount);

            if (newCount > 0 && previousCount === 0) {
              addSignalEffect(worldId, { lat: 0, lng: 0 }); // Use actual location data
            }

            if (newCount === 0 && previousCount > 0) {
              removeSignalEffect(worldId);
            }
          });
        }

        console.log('Received world counts:', message.counts);
      } else {
        console.log('Received message of an unexpected type:', message.type);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket closed');
    };
  }, [selectedWorldId]);

  return (
    <WebSocketContext.Provider
      value={{
        wsRef,
        isWebSocketReady,
        setIsWebSocketReady,
        initializeWebSocket,
        setCarName,
        setMatcaps,
        setPlayerAccount,
        setSelectedWorldId,
        updateWorldList,
        addSignalEffect,
        removeSignalEffect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
