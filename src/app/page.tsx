'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { useAccount } from 'wagmi';

// Dynamically import the Application component and disable SSR
const Application = dynamic(() => import('./javascript/Application'), {
  ssr: false,
});

export default function Home() {
  const wsRef = useRef<WebSocket | null>(null);
  const { address, isConnected } = useAccount();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isCanvasInitialized, setIsCanvasInitialized] = useState(false); // State for canvas initialization
  const [application, setApplication] = useState(false); // State for canvas initialization
  const [showLoadingLayer, setShowLoadingLayer] = useState(false); // State for loading layer
  const [hasAppInitialized, setHasAppInitialized] = useState(false); // Ensure Application is only initialized once
  const [showWalletButton, setShowWalletButton] = useState(false); 
  const [isMounted, setIsMounted] = useState(false); // Track when the component is mounted
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null); // New state for selected world ID
  const [token, setToken] = useState<string | null>(null); // State to store the token
  const [playerCount, setPlayerCount] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const predefinedWorldIds = [
    'Bangkok', 'New York', 'New Delhi', 'Mumbai', 'Tel Aviv',
    'Tokyo', 'Munich', 'Florence', 'Beijing', 'Hong Kong',
    'Seoul', 'Los Angeles', 'Paris', 'Las Vegas', 'Istanbul',
    'Reykjavik', 'Doha', 'Lima', 'Singapore', 'Jakarta',
    'Mexico', 'Madrid', 'Prague', 'Oslo', 'Buenos Aires',
    'Budapest', 'Rio', 'Copenhagen', 'London', 'Dubai',
    'Sydney', 'Accra', 'Hellsinki', 'Dublin', 'Lisbon',
    'Zurich', 'Bogota', 'Melbourne', 'Nairobi', 'Stockholm',
    'Vienna', 'Brussels', 'San Francisco', 'Geneva', 'Cannes',
    'Berlin', 'Havana', 'Montreal', 'Antananarivo', 'Cape Town',
    'Boston', 'Milan', 'Baku', 'Rome', 'Barcelona',
    'Amsterdam', 'Athens', 'Monaco', 'Venice', 'Peru',
    'Munchen'
  ];

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
      console.log('Token received and stored:', token);
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  // Initialize the application only when the wallet connects
  useEffect(() => {
    setIsMounted(true);

    if (isConnected && address && !hasAppInitialized) {
      setPlayerId(address);
      // localStorage.setItem('playerId', address);
      console.log('Wallet connected:', address);

      // Show the loading layer when the wallet connects
      setShowLoadingLayer(true);

      // Set a flag to ensure the Application only initializes once
      setHasAppInitialized(true);

      // Fetch the token for the connected player
      getToken(address);
    }
  }, [isConnected, address, hasAppInitialized]);

  // Handle disconnection and refresh the page
  useEffect(() => {
    if (!isConnected && hasAppInitialized) {

      const userDisplay = document.getElementById('userDisplay');
      const batteryStatus = document.getElementById('battery-status');
      const scoreElement = document.getElementById('score-status');
      const coinMarket = document.getElementById('coin-market');
      const inviteButton = document.getElementById('invite-button');
      const tradeButton = document.getElementById('trade-button');
      const partyElement = document.getElementById('party-info');

      if (userDisplay) {
        userDisplay.style.display = 'none';
      }

      console.log('Wallet disconnected, refreshing the page...');
      // window.location.reload(); // Refresh the page when the user disconnects
      window.location.href = 'https://krashbox.world'
    }
  }, [isConnected, hasAppInitialized]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentTime(new Date());  // Update time every second
  //   }, 1000);

  //   // Populate the world list once the component is mounted
  //   if (isMounted) {
  //     const worldList = document.getElementById('world-list');

  //     if (worldList) {
  //       const predefinedWorldIds = [
  //         'Bangkok', 'New York', 'New Delhi', 'Mumbai', 'Tel Aviv',
  //         'Tokyo', 'Munich', 'Florence', 'Beijing', 'Hong Kong',
  //         'Seoul', 'Los Angeles', 'Paris', 'Las Vegas', 'Istanbul',
  //         'Reykjavik', 'Doha', 'Lima', 'Singapore', 'Jakarta',
  //         'Mexico', 'Madrid', 'Prague', 'Oslo', 'Buenos Aires',
  //         'Budapest', 'Rio', 'Copenhagen', 'London', 'Dubai',
  //         'Sydney', 'Accra', 'Hellsinki', 'Dublin', 'Lisbon',
  //         'Zurich', 'Bogota', 'Melbourne', 'Nairobi', 'Stockholm',
  //         'Vienna', 'Brussels', 'San Francisco', 'Geneva', 'Cannes',
  //         'Berlin', 'Havana', 'Montreal', 'Antananarivo', 'Cape Town',
  //         'Boston', 'Milan', 'Baku', 'Rome', 'Barcelona',
  //         'Amsterdam', 'Athens', 'Monaco', 'Venice', 'Peru',
  //         'Munchen'
  //       ];

  //       // Clear any existing list items
  //       worldList.innerHTML = '';

  //       // Create list items for each predefined world ID
  //     predefinedWorldIds.forEach(worldId => {
  //       const listItem = document.createElement('li');
  //       listItem.textContent = worldId;

  //       // If a world is already selected, add .disabled class to others
  //       if (selectedWorldId && selectedWorldId !== worldId) {
  //         listItem.classList.add('disabled');
  //       }

  //       // Add .selected class to the currently selected world
  //       if (selectedWorldId === worldId) {
  //         listItem.classList.add('selected');
  //       }

  //       // Only allow selection if no world is already selected
  //       listItem.onclick = () => {
  //         if (!selectedWorldId) {
  //           setSelectedWorldId(worldId);
  //           setIsCanvasInitialized(false);
  //           setApplication(false);
  //           setTimeout(() => setApplication(true), 0);
  //         }
  //       };

  //       worldList.appendChild(listItem);
  //       });
  //     }
  //   }

  //   return () => clearInterval(interval);  // Cleanup on component unmount
  // }, [isMounted, selectedWorldId]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentTime(new Date()); // Update time every second
  //   }, 1000);
  
  //   const predefinedWorldIds = [
  //     'Bangkok', 'New York', 'New Delhi', 'Mumbai', 'Tel Aviv',
  //     'Tokyo', 'Munich', 'Florence', 'Beijing', 'Hong Kong',
  //     'Seoul', 'Los Angeles', 'Paris', 'Las Vegas', 'Istanbul',
  //     'Reykjavik', 'Doha', 'Lima', 'Singapore', 'Jakarta',
  //     'Mexico', 'Madrid', 'Prague', 'Oslo', 'Buenos Aires',
  //     'Budapest', 'Rio', 'Copenhagen', 'London', 'Dubai',
  //     'Sydney', 'Accra', 'Hellsinki', 'Dublin', 'Lisbon',
  //     'Zurich', 'Bogota', 'Melbourne', 'Nairobi', 'Stockholm',
  //     'Vienna', 'Brussels', 'San Francisco', 'Geneva', 'Cannes',
  //     'Berlin', 'Havana', 'Montreal', 'Antananarivo', 'Cape Town',
  //     'Boston', 'Milan', 'Baku', 'Rome', 'Barcelona',
  //     'Amsterdam', 'Athens', 'Monaco', 'Venice', 'Peru',
  //     'Munchen'
  //   ];
  
  //   const token = localStorage.getItem('token');
  //   // Initialize WebSocket to fetch player count per world
  //   const serverAddress = `wss://krashbox.glitch.me?token=${token}`;
  //   const ws = new WebSocket(serverAddress)
  
  //   ws.onopen = () => {
  //     console.log('WebSocket connected');
  //     // Request player count for all worlds
  //     ws.send(JSON.stringify({ type: 'worldCounts' }));
  //   };

  //   ws.onerror = (error) => {
  //     console.error('WebSocket error:', error);
  //   };
  
  //   ws.onmessage = (event) => {
  //     const message = JSON.parse(event.data);
  //     if (message.type === 'worldCounts') {
  //       const { counts } = message; // e.g., { "Bangkok": 5, "New York": 8, ... }
  //       const worldList = document.getElementById('world-list');
  
  //       if (worldList) {
  //         // Clear existing list items
  //         worldList.innerHTML = '';
  
  //         // Populate world list with player counts
  //         predefinedWorldIds.forEach((worldId) => {
  //           const listItem = document.createElement('li');
  //           const playerCount = counts[worldId] || 0; // Default to 0 if no count available
  
  //           listItem.textContent = `${worldId} - ${playerCount}/20`;
  
  //           // If a world is already selected, add .disabled class to others
  //           if (selectedWorldId && selectedWorldId !== worldId) {
  //             listItem.classList.add('disabled');
  //           }
  
  //           // Add .selected class to the currently selected world
  //           if (selectedWorldId === worldId) {
  //             listItem.classList.add('selected');
  //           }
  
  //           // Only allow selection if no world is already selected
  //           listItem.onclick = () => {
  //             if (!selectedWorldId) {
  //               setSelectedWorldId(worldId);
  //               setIsCanvasInitialized(false);
  //               setApplication(false);
  //               setTimeout(() => setApplication(true), 50);
  //             }
  //           };
  
  //           worldList.appendChild(listItem);
  //         });
  //       }
  //     }
  //   };
  
  //   ws.onclose = () => {
  //     console.log('WebSocket closed');
  //   };
  
  //   return () => {
  //     clearInterval(interval); // Cleanup interval on unmount
  //     ws.close(); // Close WebSocket on component unmount
  //   };
  // }, [isMounted, selectedWorldId]);  

  const initializeWebSocket = () => {
    const token = localStorage.getItem('token');
    const serverAddress = `wss://krashbox.glitch.me?token=${token}`;
    wsRef.current = new WebSocket(serverAddress);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setTimeout(() => {
        wsRef.current?.send(JSON.stringify({ type: 'worldCounts' }));
      }, 1000);
    };

    localStorage.removeItem('token');

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Message", message)
      if (message.type === 'worldCounts') {
        if (!message.hasOwnProperty('counts') || typeof message.counts !== 'object' || message.counts === null) {
          console.log("Invalid counts in worldCounts message:", message.counts);
          return;
      }
        // Only update the world list if no world has been selected
        if (!selectedWorldId) {
          updateWorldList(message.counts);
        }
        console.log("Received world counts:", message.counts);

      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket closed');
    };
  };

  const updateWorldList = (counts: Record<string, number>) => {
    const worldList = document.getElementById('world-list');
    if (worldList) {
      worldList.innerHTML = ''; // Clear existing list items

      predefinedWorldIds.forEach((worldId) => {
        const listItem = document.createElement('li');
        const playerCount = counts[worldId] || 0; // Default to 0 if no count available
        listItem.textContent = `${worldId} - ${playerCount}/20`;

        // Disable other worlds if one is already selected
        if (selectedWorldId && selectedWorldId !== worldId) {
          listItem.classList.add('disabled');
        }

        // Highlight the selected world
        if (selectedWorldId === worldId) {
          listItem.classList.add('selected');
        }

        // Allow selection only if no world is currently selected
        listItem.onclick = () => {
          if (!selectedWorldId) {
              setSelectedWorldId(worldId);
              setIsCanvasInitialized(false);
              setApplication(false);
              setTimeout(() => setApplication(true), 50);

              // Disable all other items visually and clear their onclick events
              Array.from(worldList.children).forEach((item) => {
                  item.classList.add('disabled');
                  item.classList.remove('selected');
                  (item as HTMLElement).onclick = null; // Prevent further clicks
              });

              // Apply 'selected' class to the clicked item
              listItem.classList.add('selected');
          }
      };
        worldList.appendChild(listItem);
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    initializeWebSocket(); // Initialize WebSocket when component mounts

    return () => {
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close(); // Clean up WebSocket connection on unmount
    };
  }, []); // Initialize once on mount

  useEffect(() => {
    if (selectedWorldId && wsRef.current) {
      console.log("Closing WebSocket early due to world selection.");
      wsRef.current.close();
    }
  }, [selectedWorldId]); // Close WebSocket as soon as a world is selected

  if (!isMounted) {
    // Return null on the server (or before the component is mounted on the client)
    return null;
  }

  // Toggle the wallet button visibility when userDisplay is clicked
  const handleUserDisplayClick = () => {
    setShowWalletButton(prevState => !prevState);  // Toggle visibility
  };

  return (
    //<main className="min-h-screen px-8 py-0 pb-12 flex-1 flex flex-col items-center" style={{ backgroundColor: '#fff', fontFamily: "'Orbitron', sans-serif" }}>
    <main className="overflow-hidden flex flex-col items-center" style={{ backgroundColor: '#0213f7', fontFamily: "'Orbitron', sans-serif" }}>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

      {/* Show the connectWalletDiv initially */}
      {!isConnected && (
                // <div className="connectWalletDiv flex flex-col justify-between items-center h-screen p-4">

        <div className="connectWalletDiv flex flex-col justify-between items-center h-screen p-4">
          {/* Centered Connect Wallet Button */}
          <div className="flex-grow flex justify-center items-center">
          {/* <div className=""> */}
          
            <button className="connectWalletButton flex flex-col justify-center items-center">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              {/* Web3Modal button */}
              <w3m-button />
            </button>
          </div>

          {/* Bottom-centered h2 */}
          <div className="w-full flex justify-center pb-10">
            <h2 style={{
              width: '480px',
              textAlign: 'center',
              color: '#F2F0EF',
              fontSize: '10px',
              padding: '10px',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
              // backdropFilter: 'blur(10px)',
              borderRadius: '10px'
            }}>
              Powered by Nossumus Foundation. Krashbox is a real-time on-chain playground. ©2024
            </h2>
          </div>
        </div>
      )}
      
      {/* Show the loading layer if the wallet is connected but the canvas isn't initialized */}
      {isConnected && !isCanvasInitialized && (
        <div id="loading-container">
          
          <div id="loading-layer" className="loading-layer overflow-hidden">
            {/* <h3 style={{paddingLeft: '12px', fontSize: '50px', fontFamily: 'Orbitron, sans-serif'}}>6,363,000–12,663,000 km</h3> */}
          </div>

          <div id="w3m-layer" className='w3m-layer overflow-hidden'>

            <w3m-button />
              
                
            </div>

            <div id="world-layer" className="world-layer-container">
            <h1 style={{ paddingLeft: '15px', fontWeight: '500', fontFamily: 'Orbitron, sans-serif', color: '#fff'}}>
              
              {new Date().toLocaleString()}
              </h1>
                    {/* <h2>Select a World</h2> */}
                    <ul id="world-list"></ul>
                </div>
        </div>
      )}

      {/* <header className="w-full py-4 flex justify-between items-center">
      </header> */}

      {/* Wallet connection button (Web3Modal) */}
      <div className="max-w-4xl">
      {/* <div> */}


        <br />

      {/* Pulsing "Select World" message */}
      {isConnected && !selectedWorldId && (
              <div className="pulsing-message">
                <h2>Select Server</h2>
              </div>
            )}

        {/* Conditionally render the Application only once */}
        {isConnected && playerId && selectedWorldId && token && application && (
          <Application playerId={playerId} selectedWorldId={selectedWorldId} token={token}/>
        )}

        {/* Once connected, display the game UI */}
        {isConnected && (
          <div className="grid bg-transparent overflow-hidden shadow-sm">
            <div className="flex justify-center items-center p-4">

              {/* Game Canvas */}
              {/* <canvas className="canvas js-canvas"></canvas> */}

              {/* Player Info, Speedometer, Score Display, etc. */}
              <div id="userDisplay" onClick={handleUserDisplayClick} className="cursor-pointer z-50">
              </div>
              <div id="playerCountDisplay"></div>

              {/* Battery Status */}
              <div id="battery-status" className="battery-container">
                <div id="battery-percentage" className="battery-percentage"></div>
                <div className="battery-bar"></div>
              </div>

              {/* Party Status */}
              {/* <div id="party-info" className="party-info" style={{opacity: 0}}>
              </div> */}

              {/* Speedometer */}
              <div id="speedometer">
                <div id="needle"></div>
                <div id="speed-value"></div>
              </div>

              {/* Score Display */}
              <div id="score-status" className="player-score"></div>

              {/* Party Chat */}
              <div id="party-chat-container" className="chat-box" style={{ display: 'none' }}>
                <div id="party-chat-box" className="chat-box-body"></div>
                <div className="chat-box-footer">
                  <input id="party-message-input" type="text" placeholder="Type a message..." className="chat-input" />
                  <button id="send-message-button" className="send-button">
                    <i data-feather="send"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Other Hidden UI Elements */}
      <div id="coin-market"></div>
      <div id="target-player-id"></div>
      <button id="invite-button" style={{ opacity: 0 }}></button>
      <button id="trade-button" style={{ opacity: 0 }}></button>
      <div id="touch-radio" style={{ opacity: 0 }}></div>
      <div id="touch-previous" style={{ opacity: 0 }}></div>
      <div id="touch-next" style={{ opacity: 0 }}></div>
      <div id="touch-mute" style={{ opacity: 0 }}></div>
      <input
        id="touch-slider"
        type="range"
        className="opacity-0"  // Adjust the opacity as needed
        min="0"
        max="1"
        step="0.01"
      />
      <div id="score-animation-container"></div>
      {/* <div id="loadingLayer" className="loading-layer"></div> */}

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
}
