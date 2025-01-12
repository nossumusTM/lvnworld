'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import { useModal } from '../../context/index';
import { useWebSocket } from './context/WebSocketContext';
import { initGlobe, addSignalEffect, removeSignalEffect } from './globe'; // Adjust path as necessary
import { FaRedo } from 'react-icons/fa';
import { FaEthereum } from 'react-icons/fa';

// Dynamically import the Application component and disable SSR
const Application = dynamic(() => import('./javascript/Application'), {
  ssr: false,
});

export default function Home() {
  const wsRef = useRef<WebSocket | null>(null);
  // const { initializeWebSocket, wsRef, isWebSocketReady } = useWebSocket();
  const modal = useModal();
  const { address, isConnected, isDisconnected } = useAccount();
  const [isEverythingReady, setIsEverythingReady] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isCanvasInitialized, setIsCanvasInitialized] = useState(false); // State for canvas initialization
  const [application, setApplication] = useState(false); // State for canvas initialization
  const [showLoadingLayer, setShowLoadingLayer] = useState(false); // State for loading layer
  const [hasAppInitialized, setHasAppInitialized] = useState(false); // Ensure Application is only initialized once
  const [showWalletButton, setShowWalletButton] = useState(false); 
  const [isMounted, setIsMounted] = useState(false); // Track when the component is mounted
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null); // New state for selected world ID
  const [isWorldSelected, setIsWorldSelected] = useState(false);
  const [token, setToken] = useState<string | null>(null); // State to store the token
  const [carName, setCarName] = useState<string | null>(null);
  // const [popupGarage, setPopupGarage] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);

  // Websocket
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isWebSocketReady, setIsWebSocketReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [playerAccount, setPlayerAccount] = useState(0);
  const [matcaps, setMatcaps] = useState({});

  const router = useRouter();
  const maxRetries = 5;  // Limit retries to avoid infinite reconnect loop
  const retryDelay = 2000; // Delay between retries (ms)

  const worldPlayerCounts = new Map<string, number>(); // To track player counts per worldId
  const activeSignals = new Map<string, THREE.Object3D>(); // To track active signals

  const handleModal = async () => {
    try {
      await modal.open();
    } catch (error) {
      console.error('Error opening WalletConnect modal:', error);
    }
  };

  const handleReload = () => {
    window.location.reload(); // Reload the page
  };

  const predefinedWorldIds = [
    'Baku', 'New York', 'Tokyo', 'Rome', 'Tel Aviv',
    'New Delhi', 'Munich', 'Florence', 'Beijing', 'Hong Kong',
    'Seoul', 'Los Angeles', 'Paris', 'Las Vegas', 'Istanbul',
    'Reykjavik', 'Doha', 'Moscow', 'Singapore', 'Jakarta',
    'Mexico', 'Madrid', 'Prague', 'Oslo', 'Buenos Aires',
    'Budapest', 'Rio', 'Copenhagen', 'London', 'Dubai',
    'Sydney', 'Accra', 'Hellsinki', 'Dublin', 'Lisbon',
    'Zurich', 'Bogota', 'Melbourne', 'Nairobi', 'Stockholm',
    'Vienna', 'Brussels', 'San Francisco', 'Geneva', 'Cannes',
    'Berlin', 'Havana', 'Montreal', 'Antananarivo', 'Cape Town',
    'Boston', 'Milan', 'Bangkok', 'Mumbai', 'Barcelona',
    'Amsterdam', 'Athens', 'Monaco', 'Venice', 'Peru',
  ];

  // Mapping cities to their corresponding countries
  const cityToFlagMapping: Record<string, string> = {
    'Baku': 'az.svg',
    'New York': 'us.svg',
    'Tokyo': 'jp.svg',
    'Rome': 'it.svg',
    'Tel Aviv': 'il.svg',
    'New Delhi': 'in.svg',
    'Munich': 'de.svg',
    'Florence': 'it.svg',
    'Beijing': 'cn.svg',
    'Hong Kong': 'cn.svg',
    'Seoul': 'kr.svg',
    'Los Angeles': 'us.svg',
    'Paris': 'fr.svg',
    'Las Vegas': 'us.svg',
    'Istanbul': 'tr.svg',
    'Reykjavik': 'is.svg',
    'Doha': 'qa.svg',
    'Moscow': 'ru.svg',
    'Singapore': 'sg.svg',
    'Jakarta': 'id.svg',
    'Mexico': 'mx.svg',
    'Madrid': 'es.svg',
    'Prague': 'cz.svg',
    'Oslo': 'no.svg',
    'Buenos Aires': 'ar.svg',
    'Budapest': 'hu.svg',
    'Rio': 'br.svg',
    'Copenhagen': 'dk.svg',
    'London': 'gb.svg',
    'Dubai': 'ae.svg',
    'Sydney': 'au.svg',
    'Accra': 'gh.svg',
    'Hellsinki': 'fi.svg',
    'Dublin': 'ie.svg',
    'Lisbon': 'pt.svg',
    'Zurich': 'ch.svg',
    'Bogota': 'co.svg',
    'Melbourne': 'au.svg',
    'Nairobi': 'ke.svg',
    'Stockholm': 'se.svg',
    'Vienna': 'at.svg',
    'Brussels': 'be.svg',
    'San Francisco': 'us.svg',
    'Geneva': 'ch.svg',
    'Cannes': 'fr.svg',
    'Berlin': 'de.svg',
    'Havana': 'cu.svg',
    'Montreal': 'ca.svg',
    'Antananarivo': 'mg.svg',
    'Cape Town': 'za.svg',
    'Boston': 'us.svg',
    'Milan': 'it.svg',
    'Bangkok': 'th.svg',
    'Mumbai': 'in.svg',
    'Barcelona': 'es.svg',
    'Amsterdam': 'nl.svg',
    'Athens': 'gr.svg',
    'Monaco': 'mc.svg',
    'Venice': 'it.svg',
    'Peru': 'pe.svg',
  };

  const worldIcons = predefinedWorldIds.map(
    (worldId) => {
      // Check if the worldId exists in the mapping, if not use a default icon (e.g., 'default.svg')
      const flag = cityToFlagMapping[worldId] || 'zz.svg';
      return `/flags/${flag.toLowerCase().replace(/\s+/g, '_')}`;
    }
  );

  const worldLocations: Record<string, { lat: number; lng: number }> = {
    "Baku": { lat: 40.4093, lng: 49.8671 },
    "New York": { lat: 40.7128, lng: -74.0060 },
    "Tokyo": { lat: 35.6764, lng: 139.6500 },
    "Rome": { lat: 41.8967, lng: 12.4822 },
    "Tel Aviv": { lat: 32.0853, lng: 34.7818 },
    "New Delhi": { lat: 28.6139, lng: 77.2088 },
    "Munich": { lat: 48.1351, lng: 11.5820 },
    "Florence": { lat: 43.7700, lng: 11.2577 },
    "Beijing": { lat: 39.9042, lng: 116.4074 },
    "Hong Kong": { lat: 22.3193, lng: 114.1694 },
    "Seoul": { lat: 37.5503, lng: 126.9971 },
    "Los Angeles": { lat: 34.0549, lng: 118.2426 },
    "Paris": { lat: 48.8575, lng: 2.3514 },
    "Las Vegas": { lat: 36.1716, lng: 115.1391 },
    "Istanbul": { lat: 41.0082, lng: 28.9784 },
    "Reykjavik": { lat: 64.1470, lng: 21.9408 },
    "Doha": { lat: 25.2854, lng: 51.5310 },
    "Moscow": { lat: 55.755, lng: 37.6173 },
    "Singapore": { lat: 1.3521, lng: 103.8198 },
    "Jakarta": { lat: 6.1944, lng: 106.8229 },
    "Mexico": { lat: 23.6345, lng: 102.5528 },
    "Madrid": { lat: 40.4167, lng: 3.7033 },
    "Prague": { lat: 50.0755, lng: 14.4378 },
    "Oslo": { lat: 59.9139, lng: 10.7522 },
    "Buenos Aires": { lat: 34.6037, lng: 58.3816 },
    "Budapest": { lat: 47.4979, lng: 19.0402 },
    "Rio": { lat: 22.9068, lng: 43.1729 },
    "Copenhagen": { lat: 55.6761, lng: 12.5683 },
    "London": { lat: 51.5072, lng: 0.1276 },
    "Dubai": { lat: 25.2048, lng: 55.2708 },
    "Sydney": { lat: 33.8688, lng: 151.2093 },
    "Accra": { lat: 5.5593, lng: 0.1974 },
    "Hellsinki": { lat: 60.1699, lng: 24.9384 },
    "Dublin": { lat: 53.3498, lng: 6.2603 },
    "Lisbon": { lat: 38.7223, lng: 9.1393 },
    "Zurich": { lat: 47.3769, lng: 8.5417 },
    "Bogota": { lat: 4.7110, lng: 74.0721 },
    "Melbourne": { lat: 37.8136, lng: 144.9631 },
    "Nairobi": { lat: 1.2921, lng: 36.8219 },
    "Stockholm": { lat: 59.3327, lng: 18.0656 },
    "Vienna": { lat: 48.2081, lng: 16.3713 },
    "Brussels": { lat: 50.8260, lng: 4.3802 },
    "San Francisco": { lat: 37.7749, lng: 122.4194 },
    "Geneva": { lat: 46.2044, lng: 6.1432 },
    "Cannes": { lat: 43.5539, lng: 7.0170 },
    "Berlin": { lat: 52.5200, lng: 13.4050 },
    "Havana": { lat: 23.1339, lng: 82.3586 },
    "Montreal": { lat: 45.5019, lng: 73.5674 },
    "Antananarivo": { lat: 18.9185, lng: 47.5211 },
    "Cape Town": { lat: 33.9221, lng: 18.4231 },
    "Boston": { lat: 42.3601, lng: 71.0589 },
    "Milan": { lat: 45.4685, lng: 9.1824 },
    "Bangkok": { lat: 13.7563, lng: 100.5018 },
    "Mumbai": { lat: 19.0760, lng: 72.8777 },
    "Barcelona": { lat: 41.3874, lng: 2.1686 },
    "Amsterdam": { lat: 52.3676, lng: 4.9041 },
    "Athens": { lat: 37.9838, lng: 23.7275 },
    "Monaco": { lat: 43.7384, lng: 7.4246 },
    "Venice": { lat: 45.4404, lng: 12.3160 },
    "Peru": { lat: 9.1900, lng: 75.0152 },
};

  // Function to get token from the server
  const getToken = async (playerId: string) => {
    try {
      const response = await fetch('https://krashbox.glitch.me/getToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get token from server');
      }

      const { token } = await response.json(); // Extract token from response
      localStorage.setItem('token', token); // Store token in localStorage
      setToken(token); // Set token in state

      // console.log('Token received and stored:', token);
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  // Handle disconnection and refresh the page
  // useEffect(() => {
  //   if (!isConnected && hasAppInitialized) {

  //     const userDisplay = document.getElementById('userDisplay');
  //     const batteryStatus = document.getElementById('battery-status');
  //     const scoreElement = document.getElementById('score-status');
  //     const coinMarket = document.getElementById('coin-market');
  //     const inviteButton = document.getElementById('invite-button');
  //     const tradeButton = document.getElementById('trade-button');
  //     const partyElement = document.getElementById('party-info');

  //     if (userDisplay) {
  //       userDisplay.style.display = 'none';
  //     }

  //     console.log('Wallet disconnected, refreshing the page...');
  //     // window.location.reload(); // Refresh the page when the user disconnects
  //     window.location.href = 'https://krashbox.world'
  //   }
  // }, [isConnected, hasAppInitialized]);

  const initializeWebSocket = useCallback((playerId: string) => {

    if (!playerId) {
        console.error("Cannot initialize WebSocket: playerId is missing");
        return;
    }

    if (wsRef.current) {
      // Avoid reinitializing if already connected
      // console.log("WebSocket already initialized");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
    
    const serverAddress = `wss://krashbox.glitch.me?token=${token}`;
    wsRef.current = new WebSocket(serverAddress);

    setWs(wsRef.current); 

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsWebSocketReady(true);
      setRetryCount(0);

      if (playerId) {
          // console.log('Requesting selected car for playerId:', playerId);
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

    // Initialize a flag to prevent repeated updates
    let hasReceivedWorldCounts = false;

    wsRef.current.onmessage = (event) => {

      let message;
        try {
            // Parse the message from the WebSocket event
            message = JSON.parse(event.data);
        } catch (error) {
            console.error("Error parsing message:", event.data);
            return;
        }
    
        // Debug log to check the full message structure
        // console.log("Received message:", message);
    
        // Check if the 'counts' property exists
        if (!message.hasOwnProperty('counts')) {
            // console.log("No 'counts' property found in message.");
        } else {
            // console.log("Counts found:", message.counts);
        }

        // Handle `selectedCar` message
        if (message.type === 'selectedCar') {
          // console.log('SelectedCar message received:', message); // Log full message
          if (message.selectedCar) {
              setCarName(message.selectedCar);
              // console.log('Selected car set to:', message.selectedCar);
      
              if (message.matcaps) {
                  // console.log('Matcaps before setting state:', message.matcaps); // Log matcaps
                  setMatcaps(message.matcaps);
                  // console.log('Matcaps state updated to:', message.matcaps);
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

      // User count
      if (message.type === 'playerCount') {
        updatePlayerCount(message.count);
      }
  
      // Handle the 'worldCounts' type message
      if (message.type === 'worldCounts') {
          // Validate counts property
          if (!message.hasOwnProperty('counts') || typeof message.counts !== 'object' || message.counts === null) {
              // console.log("Invalid counts in worldCounts message:", message.counts);
              return;
          }
  
          // Only update the world list if no world has been selected
          if (!selectedWorldId) {
              // console.log("Updating world list with counts:", message.counts);
              updateWorldList(message.counts);

              Object.entries(message.counts).forEach(([worldId, count]) => {
                const location = worldLocations[worldId as keyof typeof worldLocations];
                const previousCount = worldPlayerCounts.get(worldId) || 0; // Get previous count or default to 0
                const newCount = typeof count === 'number' ? count : 0;
            
                // Update the count in the map
                worldPlayerCounts.set(worldId, newCount);
            
                // Add signal if count > 0 and signal doesn't already exist
                if (newCount > 0 && previousCount === 0) {
                    if (location) {
                        // console.log(`Adding signal for ${worldId} at ${location.lat}, ${location.lng}`);
                        addSignalEffect(worldId, location);
                    }
                }
            
                // Remove signal if count becomes 0
                if (newCount === 0 && previousCount > 0) {
                    // console.log(`Removing signal for ${worldId}, no players remaining.`);
                    removeSignalEffect(worldId);
                }
            });            

              hasReceivedWorldCounts = true;

          } else {
              // console.log("World has already been selected, not updating list.");
          }
  
          // Log the received world counts
          // console.log("Received world counts:", message.counts);
      } else {
          // console.log("Received message of an unexpected type:", message.type);
      }
  };
  

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

     wsRef.current.onclose = (event) => {
      console.log('WebSocket closed', event);
      // if (event.code !== 1000) {
      //   console.error('WebSocket closed unexpectedly with code:', event.code);
      //   console.error('Reason:', event.reason);
      // }
      
      // setIsWebSocketReady(false);
    };
    // localStorage.removeItem('token');
  }, []);

  let searchQuery = '';

const filterWorlds = (event: React.FormEvent<HTMLInputElement>) => {
  const target = event.target as HTMLInputElement;
  searchQuery = target.value.toLowerCase();
  updateWorldList(currentCounts); // Reapply filtering based on the updated search query
};

let currentCounts: Record<string, number> = {}; // Define the shape of `counts`

const updatePlayerCount = (count: number) => {
  const playerCountElement = document.getElementById('userCountDisplay');
  if (playerCountElement) {
    playerCountElement.innerText = `${count}`;
  }

  const barThresholds = [1, 150, 300, 500];
  const signalBars = document.querySelectorAll('.signal-bars .bar');

  signalBars.forEach((bar, index) => {
    const htmlBar = bar as HTMLElement;
    if (count >= barThresholds[index]) {
      htmlBar.style.opacity = '1';
    } else {
      htmlBar.style.opacity = '0.5';
    }
  });
};

const updateWorldList = (counts: Record<string, number>) => {
  currentCounts = counts; // Store the counts for reuse
  const worldList = document.getElementById('world-list');

  if (worldList) {
    worldList.innerHTML = ''; // Clear existing list items

    predefinedWorldIds
      .filter((worldId) => worldId.toLowerCase().includes(searchQuery)) // Filter worlds by search query
      .forEach((worldId) => {
        const index = predefinedWorldIds.indexOf(worldId); // Get the index for flag lookup
        const playerCount = counts[worldId] || 0; // Default to 0 if no count available

        // Create a list item for the world
        const listItem = document.createElement('li');

        // Create a container div for player count, flag, and world ID
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('content-container');

        // Player count div
        const playerCountDiv = document.createElement('div');
        playerCountDiv.textContent = `${playerCount}/20`;
        playerCountDiv.classList.add('player-count');

        // Flag div
        const flagDiv = document.createElement('div');
        const flagImg = document.createElement('img');

        // Use cityToFlagMapping to get the correct flag
        const flagFile = cityToFlagMapping[worldId] || 'zz.svg'; // Fallback to default.svg if not found
        flagImg.src = `/flags/${flagFile.toLowerCase().replace(/\s+/g, '_')}`; // Dynamically set the SVG path
        flagImg.alt = `${worldId} flag`;
        flagImg.classList.add('flag-icon');

        flagDiv.appendChild(flagImg);

        // World ID div
        const worldIdDiv = document.createElement('div');
        worldIdDiv.textContent = worldId;
        worldIdDiv.classList.add('world-id');

        // Append components to the content container
        contentContainer.appendChild(playerCountDiv);
        contentContainer.appendChild(flagDiv);
        contentContainer.appendChild(worldIdDiv);

        // Append the content container to the list item
        listItem.appendChild(contentContainer);

        // Apply classes based on selection status
        if (selectedWorldId && selectedWorldId !== worldId) {
          listItem.classList.add('disabled');
        }

        if (selectedWorldId === worldId) {
          listItem.classList.add('selected');
        }

        // Add click event to list item
        listItem.onclick = () => handleWorldSelection(worldId, listItem, worldList);

        // Append the list item to the world list
        worldList.appendChild(listItem);
      });
  }
};

const handleWorldSelection = (worldId: string, listItem: HTMLLIElement, worldList: HTMLElement) => {
  if (!selectedWorldId) {
    setSelectedWorldId(worldId);
    setIsWorldSelected(true); // Mark as selected by user
    setIsCanvasInitialized(false);
    setApplication(false);
    setTimeout(() => setApplication(true), 500);

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Disable all other items visually and clear their onclick events
    Array.from(worldList.children).forEach((item) => {
      const element = item as HTMLElement;
      element.classList.add('disabled');
      element.classList.remove('selected');
      element.onclick = null; // Prevent further clicks
    });

    // Apply 'selected' class to the clicked item
    listItem.classList.remove('disabled');
    listItem.classList.add('selected');
  }
};

    // Initialize the application only when the wallet connects
    useEffect(() => {
      setIsMounted(true);
      setShowLoadingLayer(true);

      // If the wallet is disconnected, trigger page reload
      if (isDisconnected) {
        // console.log('Wallet disconnected. Reloading the page...');
        window.location.reload();
      }

      if (isConnected && address && !hasAppInitialized) {
        setPlayerId(address);

        // localStorage.setItem('playerId', address);
        console.log('Wallet connected:', address);
        localStorage.removeItem('playerId');
        localStorage.removeItem('worldId');

        setHasAppInitialized(true);
  
        // Step 1: Fetch the token first
        getToken(address)
        .then(() => {
          // Step 2: Initialize WebSocket after token is fetched
          initializeWebSocket(address);

          // Initialize Globe with Retry Logic
          let retryCount = 0;
          const interval = setInterval(() => {
            const container = document.getElementById('loading-layer');
            if (container) {
              // console.log('Initializing Globe...');
              initGlobe('loading-layer');
              clearInterval(interval); // Stop retrying
            } else if (retryCount >= 5) {
              console.warn('Failed to find #loading-layer after 5 retries.');
              clearInterval(interval); // Stop retrying
            }
            retryCount++;
          }, 500);
        })
        .catch((error) => {
          console.error('Error fetching token:', error);
        });

        // Track when everything is ready
        setIsEverythingReady(true);

        // Switch off the loading layer when everything is ready
        if (isEverythingReady) {
          setShowLoadingLayer(false);
        }
      }
      
    }, [isConnected, address, hasAppInitialized, isEverythingReady]);
    
    // Flag to check WS connection
    if (!showLoadingLayer && !isWebSocketReady) {
      return (
        <div className="pulse">
      </div>
      );
    }

  if (!isMounted) {
    // Return null on the server (or before the component is mounted on the client)
    return null;
  }

  // Toggle the wallet button visibility when userDisplay is clicked
  const handleUserDisplayClick = () => {
    setShowWalletButton(prevState => !prevState);  // Toggle visibility
  };
  
  const handleGarageButtonClick = () => {
      if (playerId) {
        router.push(`/garage?playerId=${encodeURIComponent(playerId)}`);
          
          // Clean up WebSocket connection
          if (wsRef.current) {
              wsRef.current.close();
          }

    } else {
        console.error('Player ID is missing');
    }
  };

  // Utility function to format playerId
  function formatPlayerId(address: string): string {
    if (!address) return '';
    const firstPart = address.substring(0, 6);
    const lastPart = address.substring(address.length - 6);
    return `${firstPart}...${lastPart}`;
  }

  return (
    <main className="overflow-hidden flex flex-col items-center" style={{ backgroundColor: '#000', fontFamily: "'Orbitron', sans-serif" }}>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

      {/* Show the connectWalletDiv initially if wallet is not connected */}
      {!isConnected && (
        <div className="connectWalletDiv flex flex-col justify-between items-center h-screen p-4">
          <div className="flex-grow flex justify-center items-center">
            <button className="connectWalletButton flex flex-col justify-center items-center" onClick={handleModal}>
              <span></span><span></span><span></span><span></span>
              CONNECT WALLET
            </button>
          </div>
          <div className="w-full flex justify-center pb-10">
            <h2 style={{
              width: '480px', textAlign: 'center', color: '#F2F0EF', fontSize: '10px', padding: '10px',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)', borderRadius: '10px'
            }}>
              Powered by Nossumus Foundation. Netscuro is a real-time on-chain playground. ©2025
            </h2>
          </div>
        </div>
      )}

      {/* Show the loading layer if wallet is connected but the canvas isn't initialized */}
      {isConnected && !isCanvasInitialized && (
        <div id="loading-container">
          <div id="loading-layer" className="loading-layer overflow-hidden"></div>
          <div id="w3m-layer" className='w3m-layer flex-container'>
            <button className='my-wallet' onClick={handleModal}>
              <FaEthereum size={15} style={{ color: '#fff' }} />
               {playerId ? formatPlayerId(playerId) : 'Connect Wallet'} 
               </button>
            <div className="user-count-wrapper">
              <span id="userCountDisplay" className="user-count-display">0</span>
            </div>
          </div>
          {/* Show pulsing message while setting up WebSocket */}
          {isWebSocketReady && (
            <>
              <div id="world-layer">
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <input
                    type="text"
                    id="search-bar"
                    placeholder="Search destination..."
                    onInput={(event) => filterWorlds(event)}
                  />
                  <button
                    onClick={() => window.location.reload()} // Reload the page
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '40px',
                      height: '40px',
                      background: 'none',
                      cursor: 'pointer',
                      // paddingRight: '10px'
                    }}
                  >
                    <FaRedo size={12} style={{ color: '#fff' }} />
                  </button>
                </div>

                <div className="scroll-container">
                  <ul id="world-list"></ul>
                </div>
              </div>
              <div id='garage' className='garage'>
                <button id='garage-button' onClick={handleGarageButtonClick}>NET—ROOM</button>
                <button id='chatbox-button'>NET—LINK</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Conditionally render the Application once the wallet is connected, playerId and world selected */}
      {isConnected && playerId && selectedWorldId && token && application && (
        <Application playerId={playerId} selectedWorldId={selectedWorldId} token={token} carName={carName} matcaps={matcaps} />
      )}

      {/* Once connected, display the game UI */}
      {isConnected && (
        <div className="grid bg-transparent overflow-hidden shadow-sm">
          <div className="flex justify-center items-center p-4">
            {/* <div id="userDisplay" onClick={handleUserDisplayClick} className="cursor-pointer z-50"></div> */}
            <div id="userDisplay" className="cursor-pointer z-50"></div>
            <div id="playerCountDisplay"></div>

            {/* Battery Status */}
            <div id="battery-status" className="battery-container">
              <div id="battery-percentage" className="battery-percentage"></div>
              <div className="battery-bar"></div>
            </div>

            {/*Friend List */}
            <div id="contact-list-container">
                <button id="toggle-contact-list" className='toggle-contact-list'></button>
                <div id="contact-list">
                  <h1 style={{textAlign: 'center', paddingBottom: '10px'}}>CONNECTED LINKS</h1>
                  <button id='toggle-contact' className='toggle-contact'></button>
                </div>
            </div>

            {/*Controller Settings */}
            <div id="settings-container">
                <button id="toggle-settings" className="toggle-settings"></button>
                <div id="settings-window" className='display: block;'>
                  <h1 style={{textAlign: 'center', paddingBottom: '10px'}}>CONTROLLER</h1>
                  <button id='toggle-settings-window' className='toggle-settings-window'></button>
                  <div id='joystick-setup-container' className='joystick-setup-container'>
                    {/* <button id="move-joystick-left"><i data-feather="arrow-down-left"></i> </button> */}
                    {/* <button id="move-joystick-right"><i data-feather="arrow-down-right"></i> </button> */}
                    </div>
                    {/* First div with 8 buttons to drag */}
                    <div id="button-setup" className="customize-button-container">
                        {/*  Create 8 draggable buttons */}
                        <button className="draggable btn1" id="btn1" draggable="true">
                          <div
                              className="button-icon"
                              style={{
                                  backgroundImage: `url('/images/mobile/paperPlane.png')`,
                              }}
                            />
                        </button>
                        <button className="draggable btn2" id="btn2" draggable="true">
                          <div
                              className="button-icon"
                              style={{
                                  backgroundImage: `url('/images/mobile/doubleTriangle.png')`,
                              }}
                              />
                        </button>
                        <button className="draggable btn3" id="btn3" draggable="true">
                          <div
                                className="button-icon"
                                style={{
                                    backgroundImage: `url('/images/mobile/siren.png')`,
                                }}
                              />
                        </button>
                        <button className="draggable btn4" id="btn4" draggable="true">
                          <div
                                  className="button-icon"
                                  style={{
                                      backgroundImage: `url('/images/mobile/triangle.png')`,
                                  }}
                                />
                        </button>
                        <button className="draggable btn5" id="btn5" draggable="true">
                          <div
                                    className="button-icon"
                                    style={{
                                        backgroundImage: `url('/images/mobile/triangle.png')`,
                                        rotate: '180deg'
                                    }}
                                />
                        </button>
                        <button className="draggable btn6" id="btn6" draggable="true">
                          <div
                                    className="button-icon"
                                    style={{
                                        backgroundImage: `url('/images/mobile/cross.png')`,
                                    }}
                                />
                        </button>
                        <button className="draggable btn7" id="btn7" draggable="true">
                          <div
                                      className="button-icon"
                                      style={{
                                          backgroundImage: `url('/images/mobile/warning.png')`,
                                      }}
                                />
                        </button>
                        <button className="draggable btn8" id="btn8" draggable="true">
                          <div
                                        className="button-icon"
                                        style={{
                                            width: '70%',
                                            height: '70%',
                                            backgroundImage: `url('/images/mobile/start.png')`,
                                        }}
                                />
                        </button>
                    </div>

                    {/* Drop area container */}
                    <div id="drop-area" className="drop-container">
                        <div className="drop-slot" id="slot1" data-slot="1">
                            <span className="slot-label">1</span>
                        </div>
                        <div className="drop-slot" id="slot2" data-slot="2">
                            <span className="slot-label">2</span>
                        </div>
                        <div className="drop-slot" id="slot3" data-slot="3">
                            <span className="slot-label">3</span>
                        </div>
                        <div className="drop-slot" id="slot4" data-slot="4">
                            <span className="slot-label">4</span>
                        </div>
                        <div className="drop-slot" id="slot5" data-slot="5">
                            <span className="slot-label">5</span>
                        </div>
                        <div className="drop-slot" id="slot6" data-slot="6">
                            <span className="slot-label">6</span>
                        </div>
                        <div className="drop-slot" id="slot7" data-slot="7">
                            <span className="slot-label">7</span>
                        </div>
                        <div className="drop-slot" id="slot8" data-slot="8">
                            <span className="slot-label">8</span>
                        </div>
                    </div>

                    <div className='flex justify-center'>
                      <button style={{paddingTop: '30px', paddingRight: '10px'}} id="reset-button">RESET</button>
                      <button style={{paddingTop: '30px', paddingLeft: '10px'}} id="save-settings-button">SAVE</button>
                    </div>
                </div>
            </div>

            {/*Popup Window */}
            <div id="no-target-popup" className="popup-container" style={{display: 'none'}}>
              <div className="popup-content">
                <p id="popup-message">Default message</p>
                <button id="ok-button">KK</button>
              </div>
            </div>

            {/* Speedometer */}
            <div id="speedometer">
              <div id="needle"></div>
              <div id="speed-value"></div>
            </div>

            {/* Score Display */}
            <div id="score-status" className="player-score"></div>

            {/* Party Chat */}
            <button id="toggle-party-list"></button>
            <button id="party-call-button" style={{display: 'none'}}>VOICE</button>
            <button id="toggle-lobby">INBOX</button>
            <div id="party-chat-container" className="chat-box" style={{ display: 'none' }}>
              <div id="party-chat-box" className="chat-box-body"></div>
              <div className="chat-box-footer">
                <input id="party-message-input" type="text" placeholder="Typing..." className="chat-input" />
                <button id="send-message-button" className="send-button">
                  <i data-feather="send"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Hidden UI Elements */}
      <div id="coin-market"></div>
      <div id="target-player-id"></div>
      <button id="invite-button" style={{ opacity: 0 }}></button>
      <button id="friend-invite-button" style={{ opacity: 0 }}></button>
      <div id="touch-radio" style={{ opacity: 0 }}></div>
      <div id="touch-previous" style={{ opacity: 0 }}></div>
      <div id="touch-next" style={{ opacity: 0 }}></div>
      <div id="touch-mute" style={{ opacity: 0 }}></div>
      <input
        id="touch-slider"
        type="range"
        className="opacity-0"
        min="0"
        max="1"
        step="0.01"
      />
      <div id="score-animation-container"></div>

      {/* Switch Container */}
      <div id="switch-container">
        <div id="switch">
          <div id="switch-toggle"></div>
        </div>
      </div>

      {/* Conditionally render the w3m-button at the top-left corner */}
      {showWalletButton && (
        <div className="fixed inset-0 z-50000 flex items-center justify-center">
          <w3m-button />
        </div>
      )}
    </main>
  );
};