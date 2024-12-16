'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  const [isWorldSelected, setIsWorldSelected] = useState(false);
  const [token, setToken] = useState<string | null>(null); // State to store the token
  const [carName, setCarName] = useState<string | null>(null);
  // const [popupGarage, setPopupGarage] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isWebSocketReady, setIsWebSocketReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [playerAccount, setPlayerAccount] = useState(0);
  // const [matcaps, setMatcaps] = useState<{ [key: string]: { matcap: string } }>({});
  const [matcaps, setMatcaps] = useState({});

  const router = useRouter();
  const maxRetries = 5;  // Limit retries to avoid infinite reconnect loop
  const retryDelay = 2000; // Delay between retries (ms)

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

  // const worldIcons = predefinedWorldIds.map(
  //   (worldId) => `/flags/${worldId.toLowerCase().replace(/\s+/g, '_')}.svg`
  // );
  

  const worldIcons = [
    '🇦🇿', '🇺🇸', '🇯🇵', '🇮🇹', '🇮🇱',
    '🇮🇳', '🇩🇪', '🇮🇹', '🇨🇳', '🇨🇳',
    '🇰🇷', '🇺🇸', '🇫🇷', '🇺🇸', '🇹🇷',
    '🇮🇸', '🇶🇦', '🇷🇺', '🇸🇬', '🇮🇩',
    '🇲🇽', '🇪🇸', '🇨🇿', '🇳🇴', '🇦🇷',
    '🇭🇺', '🇧🇷', '🇩🇰', '🇬🇧', '🇦🇪',
    '🇦🇺', '🇬🇭', '🇫🇮', '🇮🇪', '🇵🇹',
    '🇨🇭', '🇨🇴', '🇦🇺', '🇰🇪', '🇸🇪',
    '🇦🇹', '🇧🇪', '🇺🇸', '🇨🇭', '🇫🇷',
    '🇩🇪', '🇨🇺', '🇨🇦', '🇲🇬', '🇿🇦',
    '🇺🇸', '🇮🇹', '🇹🇭', '🇮🇳', '🇪🇸',
    '🇳🇱', '🇬🇷', '🇲🇨', '🇮🇹', '🇵🇪',
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

      // const storedCarName = localStorage.getItem('selectedCar');
      // console.log(`Selected car "${localStorage}"`);

    //   if (storedCarName) {
    //     setCarName(storedCarName);
    //     // Optionally delete carName after loading
    //     // localStorage.removeItem('selectedCar');
    //     console.log(`Car name "${storedCarName}" loaded and removed from localStorage.`);
    // }
      // console.log("SELECTED CAR NAME", carName);
      console.log('Token received and stored:', token);
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

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

  const initializeWebSocket = useCallback((playerId: string) => {

    if (!playerId) {
        console.error("Cannot initialize WebSocket: playerId is missing");
        return;
    }

    if (wsRef.current) {
      // Avoid reinitializing if already connected
      console.log("WebSocket already initialized");
      return;
    }

    const token = localStorage.getItem('token');
    const serverAddress = `wss://krashbox.glitch.me?token=${token}`;
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

    // Initialize a flag to prevent repeated updates
    let hasReceivedWorldCounts = false;

    wsRef.current.onmessage = (event) => {

      // Check if the message should be ignored
      if (hasReceivedWorldCounts) {
          console.log("World counts already received, ignoring further messages.");
          return;
      }

      let message;
        try {
            // Parse the message from the WebSocket event
            message = JSON.parse(event.data);
        } catch (error) {
            console.error("Error parsing message:", event.data);
            return;
        }
    
        // Debug log to check the full message structure
        console.log("Received message:", message);
    
        // Check if the 'counts' property exists
        if (!message.hasOwnProperty('counts')) {
            console.log("No 'counts' property found in message.");
        } else {
            console.log("Counts found:", message.counts);
        }

        // Handle `selectedCar` message
        if (message.type === 'selectedCar') {
          console.log('SelectedCar message received:', message); // Log full message
          if (message.selectedCar) {
              setCarName(message.selectedCar);
              console.log('Selected car set to:', message.selectedCar);
      
              if (message.matcaps) {
                  console.log('Matcaps before setting state:', message.matcaps); // Log matcaps
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

      // User count
      if (message.type === 'playerCount') {
        // Update the player count display
        const playerCountElement = document.getElementById('userCountDisplay');
        if (playerCountElement) {
          playerCountElement.innerText = `${message.count}`;
        }

        // Update the signal bars
        const playerCount = message.count;
        const barThresholds = [1, 150, 300, 500]; // Thresholds for bar activation
        const signalBars = document.querySelectorAll('.signal-bars .bar');

        signalBars.forEach((bar, index) => {
          const htmlBar = bar as HTMLElement; // Cast Element to HTMLElement
          if (playerCount >= barThresholds[index]) {
            htmlBar.style.opacity = '1'; // Fully visible
          } else {
            htmlBar.style.opacity = '0.5'; // Dimmed
          }
        });

      }

      // Player score
      if (message.type === 'playerScore') {
          if (typeof message.score === 'number') {
              console.log(`Player score received for player ${message.playerId}:`, message.score);
              setPlayerAccount(message.score); // Update the state with the player's score
          } else {
              console.error("Invalid score received:", message.score);
          }

      } else {
          console.log("Unknown message type:", message.type);
      }
  
      // Handle the 'worldCounts' type message
      if (message.type === 'worldCounts') {
          // Validate counts property
          if (!message.hasOwnProperty('counts') || typeof message.counts !== 'object' || message.counts === null) {
              console.log("Invalid counts in worldCounts message:", message.counts);
              return;
          }
  
          // Only update the world list if no world has been selected
          if (!selectedWorldId) {
              console.log("Updating world list with counts:", message.counts);
              updateWorldList(message.counts);

              hasReceivedWorldCounts = true;

          } else {
              console.log("World has already been selected, not updating list.");
          }
  
          // Log the received world counts
          console.log("Received world counts:", message.counts);
      } else {
          console.log("Received message of an unexpected type:", message.type);
      }
  };
  

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket closed');
      // setIsWebSocketReady(false);
      // if (retryCount < maxRetries) {
      //     setTimeout(() => {
      //         setRetryCount((prev) => prev + 1);
      //         initializeWebSocket();  // Retry connection
      //     }, retryDelay * 2);
      // } else {
      //     console.warn('Max retries reached. WebSocket not reconnected.');
      // }
  };

    // localStorage.removeItem('token');

  }, [retryCount]);

  let searchQuery = '';

const filterWorlds = (event: React.FormEvent<HTMLInputElement>) => {
  const target = event.target as HTMLInputElement;
  searchQuery = target.value.toLowerCase();
  updateWorldList(currentCounts); // Reapply filtering based on the updated search query
};

let currentCounts: Record<string, number> = {}; // Define the shape of `counts`

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
        flagDiv.textContent = worldIcons[index] || '🏳️'; // Use corresponding flag or default
        flagDiv.classList.add('flag');

        // Flag div
        // const flagDiv = document.createElement('div');
        // const flagImg = document.createElement('img');
        // flagImg.src = `/flags/${worldId.toLowerCase().replace(/\s+/g, '_')}.svg`; // Dynamically set the SVG path
        // flagImg.alt = `${worldId} flag`;
        // flagImg.classList.add('flag-icon');
        // flagDiv.appendChild(flagImg);

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

    // Close WebSocket on world selection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }
};


  // const updateWorldList = (counts: Record<string, number>) => {
  //   const worldList = document.getElementById('world-list');
  //   if (worldList) {
  //     worldList.innerHTML = ''; // Clear existing list items

  //     predefinedWorldIds.forEach((worldId, index) => {
  //       const listItem = document.createElement('li');
  //       const playerCount = counts[worldId] || 0; // Default to 0 if no count available

  //       // Create a container div for player count, flag, and world ID
  //       const contentContainer = document.createElement('div');
  //       contentContainer.classList.add('content-container');

  //       // Player count div
  //       const playerCountDiv = document.createElement('div');
  //       playerCountDiv.textContent = `${playerCount}/20`;
  //       playerCountDiv.classList.add('player-count');

  //       // Flag div
  //       const flagDiv = document.createElement('div');
  //       flagDiv.textContent = worldIcons[index] || '🏳️'; // Default flag if none found
  //       flagDiv.classList.add('flag');

  //       // World ID div
  //       const worldIdDiv = document.createElement('div');
  //       worldIdDiv.textContent = worldId;
  //       worldIdDiv.classList.add('world-id');

  //       // Append playerCountDiv, flagDiv, and worldIdDiv to the container
  //       contentContainer.appendChild(playerCountDiv);
  //       contentContainer.appendChild(flagDiv);
  //       contentContainer.appendChild(worldIdDiv);

  //       // Append the container to the list item
  //       listItem.appendChild(contentContainer);

  //       // Disable other worlds if one is already selected
  //       if (selectedWorldId && selectedWorldId !== worldId) {
  //         listItem.classList.add('disabled');
  //       }

  //       // Highlight the selected world
  //       if (selectedWorldId === worldId) {
  //         listItem.classList.add('selected');
  //       }

  //       // Allow selection only if no world is currently selected
  //       listItem.onclick = () => {
  //         if (!selectedWorldId) {
  //             setSelectedWorldId(worldId);
  //             setIsWorldSelected(true); // Mark as selected by user
  //             setIsCanvasInitialized(false);
  //             setApplication(false);
  //             setTimeout(() => setApplication(true), 500);

  //             // Disable all other items visually and clear their onclick events
  //             Array.from(worldList.children).forEach((item) => {
  //                 item.classList.add('disabled');
  //                 item.classList.remove('selected');
  //                 (item as HTMLElement).onclick = null; // Prevent further clicks
  //             });

  //             // Apply 'selected' class to the clicked item
  //             listItem.classList.remove('disabled');
  //             listItem.classList.add('selected');

  //             // Close WebSocket on world selection
  //             if (wsRef.current) {
  //               wsRef.current.close();
  //               wsRef.current = null;
  //             }
  //         }
  //     };
  //       worldList.appendChild(listItem);
  //     });
  //   }
  // };

    // Initialize the application only when the wallet connects
    useEffect(() => {
      setIsMounted(true);
  
      if (isConnected && address && !hasAppInitialized) {
        setPlayerId(address);
        // localStorage.setItem('playerId', address);
        console.log('Wallet connected:', address);
        // localStorage.removeItem('playerId');
        localStorage.removeItem('worldId');
        // Show the loading layer when the wallet connects
        setShowLoadingLayer(true);
  
        // Set a flag to ensure the Application only initializes once
        setHasAppInitialized(true);
  
        // Only initialize WebSocket once after wallet connects and app initializes
        initializeWebSocket(address);
  
        // Fetch the token for the connected player
        getToken(address);

      }
    }, [isConnected, address, hasAppInitialized, initializeWebSocket]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []); // Initialize once on mount

  // useEffect(() => {
  //   if (selectedWorldId && wsRef.current) {
  //     console.log("Closing WebSocket early due to world selection.");
  //     // wsRef.current.close();
  //   }
  // }, [selectedWorldId]); // Close WebSocket as soon as a world is selected

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
    } else {
        console.error('Player ID is missing');
    }
  };

  return (
    //<main className="min-h-screen px-8 py-0 pb-12 flex-1 flex flex-col items-center" style={{ backgroundColor: '#fff', fontFamily: "'Orbitron', sans-serif" }}>
    <main className="overflow-hidden flex flex-col items-center" style={{ backgroundColor: '#000', fontFamily: "'Orbitron', sans-serif" }}>
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

          <div id="w3m-layer" className='w3m-layer overflow-hidden flex-container'>
          {/* <div id="signalBars" className="signal-bars">
              <div className="bar bar-1"></div>
              <div className="bar bar-2"></div>
              <div className="bar bar-3"></div>
              <div className="bar bar-4"></div>
            </div> */}
            <w3m-button />
            <div className="user-count-wrapper">
                {/* <span id="streamLabel" className="stream-label">STREAM</span> */}
                <span id="userCountDisplay" className="user-count-display">0</span>
            </div>
            
            </div>
            {/* Show pulsing message while setting up WebSocket */}
            {!isWebSocketReady ? (
              <div id="world-layer">
                  <h1 className="server-message">Setting up servers...</h1>
                </div>
            ) : (
            <>
            {/* <div id='worldclock'>
              <h1 style={{ paddingTop: '10px', fontSize: '15px', fontWeight: '500', fontFamily: 'Orbitron, sans-serif', color: '#fff', textAlign: 'center'}}>
                {new Date().toLocaleString()}
                </h1>
            </div> */}
            <div id="world-layer">
              <input 
                type="text" 
                id="search-bar" 
                placeholder="Search destination..." 
                onInput={(event) => filterWorlds(event)} 
              />
            
                    {/* <h2>Select a World</h2> */}
                    <div className="scroll-container">
                      <ul id="world-list"></ul>
                    </div>
                    </div>
                      <div id='garage' className='garage'>
                        <button id='garage-button' onClick={handleGarageButtonClick}>SHOWROOM</button>
                        <button id='chatbox-button' onClick={handleGarageButtonClick}>MESSENGER</button>
                      </div>
                    </>
                        )}
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
                <h2 style={{textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)'}}>Select Server</h2>
              </div>
            )}

        {/* Conditionally render the Application only once */}
        {isConnected && playerId && selectedWorldId && token && application && (
          <Application playerId={playerId} selectedWorldId={selectedWorldId} token={token} carName={carName} matcaps={matcaps}/>
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
