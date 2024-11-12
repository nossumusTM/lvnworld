'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAccount } from 'wagmi';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Object3D, Mesh } from 'three';

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
  const [popupGarage, setPopupGarage] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isWebSocketReady, setIsWebSocketReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const [activeCarIndex, setActiveCarIndex] = useState(0); // Track which car is displayed
  const [isOrbitEnabled, setIsOrbitEnabled] = useState(false); // Orbit controls state

  const carModels = useRef<THREE.Object3D[]>([]); // Store all loaded car models

  const [customizations, setCustomizations] = useState({
    chassis: 'default',
    window: 'default',
    tire: 'default',
    plate: 'default',
    wiper: 'default',
    weapon: 'default',
    armor: 'default',
    headlight: 'default',
});

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
    'Kyiv'
  ];

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
    '🇺🇦'
  ];

  useEffect(() => {
    setIsMounted(true); // To handle SSR and ensure the component renders only on the client
  }, []);

  useEffect(() => {

    if (!canvasRef.current) return;

    if (canvasRef.current && !sceneRef.current) {
      // Scene, Camera, Renderer setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 2, 5);
      const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current as HTMLCanvasElement });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Load car model
      const loader = new GLTFLoader();
      const carPaths = ['/garage/car1.glb', '/garage/car2.glb', '/garage/car3.glb']; // Paths to car models

      // Load each car model
      carPaths.forEach((path, index) => {
        loader.load(path, (gltf) => {
          const carModel = gltf.scene;
          carModel.visible = index === activeCarIndex; // Show only the active car
          carModels.current.push(carModel);
          scene.add(carModel);
        });
      });

      // Initialize OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enabled = isOrbitEnabled;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controlsRef.current = controls;

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update(); // Update OrbitControls
        renderer.render(scene, camera);
      };
      animate();
    }

    const handleResize = () => {
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef.current]);

  useEffect(() => {
    // Update car parts when customizations change
    if (sceneRef.current) {
      const carModel = sceneRef.current.getObjectByName('carModel');
      if (carModel) {
        updateCarParts(carModel, customizations);
      }
    }
  }, [customizations]);

  // Toggle orbit controls on click
  const handleModelClick = () => {
    setIsOrbitEnabled(true);
    if (controlsRef.current) controlsRef.current.enabled = true;
  };

  // Switch the visible car model
  const handleCarSelection = (index: number) => {
    carModels.current.forEach((car, idx) => {
      car.visible = idx === index; // Show only the selected car
    });
    setActiveCarIndex(index);
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

  const initializeWebSocket = useCallback(() => {
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
  };

  }, [retryCount]);

  const updateWorldList = (counts: Record<string, number>) => {
    const worldList = document.getElementById('world-list');
    if (worldList) {
      worldList.innerHTML = ''; // Clear existing list items

      predefinedWorldIds.forEach((worldId, index) => {
        const listItem = document.createElement('li');
        const playerCount = counts[worldId] || 0; // Default to 0 if no count available

        // Create a container div for player count, flag, and world ID
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('content-container');

        // Player count div
        const playerCountDiv = document.createElement('div');
        playerCountDiv.textContent = `${playerCount}/20`;
        playerCountDiv.classList.add('player-count');

        // Flag div
        const flagDiv = document.createElement('div');
        flagDiv.textContent = worldIcons[index] || '🏳️'; // Default flag if none found
        flagDiv.classList.add('flag');

        // World ID div
        const worldIdDiv = document.createElement('div');
        worldIdDiv.textContent = worldId;
        worldIdDiv.classList.add('world-id');

        // Append playerCountDiv, flagDiv, and worldIdDiv to the container
        contentContainer.appendChild(playerCountDiv);
        contentContainer.appendChild(flagDiv);
        contentContainer.appendChild(worldIdDiv);

        // Append the container to the list item
        listItem.appendChild(contentContainer);

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
              setIsWorldSelected(true); // Mark as selected by user
              setIsCanvasInitialized(false);
              setApplication(false);
              setTimeout(() => setApplication(true), 500);

              // Disable all other items visually and clear their onclick events
              Array.from(worldList.children).forEach((item) => {
                  item.classList.add('disabled');
                  item.classList.remove('selected');
                  (item as HTMLElement).onclick = null; // Prevent further clicks
              });

              // Apply 'selected' class to the clicked item
              listItem.classList.remove('disabled');
              listItem.classList.add('selected');

              // Close WebSocket on world selection
              if (wsRef.current) {
                wsRef.current.close();
              }
          }
      };
        worldList.appendChild(listItem);
      });
    }
  };

    // Initialize the application only when the wallet connects
    useEffect(() => {
  
      if (isConnected && address && !hasAppInitialized) {
        setPlayerId(address);
        // localStorage.setItem('playerId', address);
        console.log('Wallet connected:', address);
  
        // Show the loading layer when the wallet connects
        setShowLoadingLayer(true);
  
        // Set a flag to ensure the Application only initializes once
        setHasAppInitialized(true);
  
        // Only initialize WebSocket once after wallet connects and app initializes
        initializeWebSocket();
  
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
    setPopupGarage(prevState => !prevState); // Toggle visibility of the garage popup
    console.log("Opening pop up")
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
            {/* Show pulsing message while setting up WebSocket */}
            {!isWebSocketReady ? (
              <div id="world-layer">
                  <h1 className="server-message">Setting up servers...</h1>
                </div>
            ) : (
            <>
            <div id="world-layer">
            <h1 style={{ fontSize: '15px', fontWeight: '500', fontFamily: 'Orbitron, sans-serif', color: '#fff', textAlign: 'center'}}>
              {new Date().toLocaleString()}
              </h1>
                    {/* <h2>Select a World</h2> */}
                    <div className="scroll-container">
                      <ul id="world-list"></ul>
                    </div>
                    </div>
                      <div id='garage' className='garage'>
                        <button id='garage-button' onClick={handleGarageButtonClick}>GARAGE</button>
                        {/* <button id='garage-button'>GARAGE</button> */}
                      </div>

                      {popupGarage && (
                          <div id="garage-popup" className="garage-popup">
                            <button className="close-button" onClick={() => setPopupGarage(false)}>X</button>
                              <div className="car-selection">
                                <button onClick={() => handleCarSelection(0)}>Car 1</button>
                                <button onClick={() => handleCarSelection(1)}>Car 2</button>
                                <button onClick={() => handleCarSelection(2)}>Car 3</button>
                              </div>
                            <div className="car-model" onClick={handleModelClick}>
                              <canvas ref={canvasRef} id="car-model-canvas" />
                            </div>
                          </div>
                        )}
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
