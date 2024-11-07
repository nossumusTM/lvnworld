'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

// Dynamically import the Application component and disable SSR
const Application = dynamic(() => import('./javascript/Application'), {
  ssr: false,
});

export default function Home() {
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());  // Update time every second
    }, 1000);

    // Populate the world list once the component is mounted
    if (isMounted) {
      const worldList = document.getElementById('world-list');

      if (worldList) {
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

        // Clear any existing list items
        worldList.innerHTML = '';

        // Create list items for each predefined world ID
        predefinedWorldIds.forEach(worldId => {
          const listItem = document.createElement('li');
          listItem.textContent = worldId;
          listItem.onclick = () => {
            console.log(`World selected: ${worldId}`);
            
            if (selectedWorldId !== worldId) { // Reset Application if new world is selected
              setSelectedWorldId(worldId);
              setIsCanvasInitialized(false); // Clear current Application state
              setApplication(false);

              setTimeout(() => setApplication(true), 0); // Reinitialize Application with new worldId
            }
          };
          worldList.appendChild(listItem);
        });
      }
    }

    return () => clearInterval(interval);  // Cleanup on component unmount
  }, [isMounted, selectedWorldId]);

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
        <div>
          
          <div id="loading-layer" className="loading-layer overflow-hidden">
            {/* <h3 style={{paddingLeft: '12px', fontSize: '50px', fontFamily: 'Orbitron, sans-serif'}}>6,363,000–12,663,000 km</h3> */}
          </div>

          <div id="w3m-layer" className='w3m-layer overflow-hidden'>

            <w3m-button />
              <h1 style={{ paddingTop: '20px', paddingLeft: '15px', fontWeight: '700', fontFamily: 'Orbitron, sans-serif', opacity: '0.8', color: '#B4B4B8'}}>
              
                {new Date().toLocaleString()}
                </h1>
                
            </div>

            <div id="world-layer">
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
