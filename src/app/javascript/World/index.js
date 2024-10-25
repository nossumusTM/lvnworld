import * as THREE from 'three'
import Materials from './Materials.js'
import Floor from './Floor.js'
import Shadows from './Shadows.js'
import Physics from './Physics.js'
import Zones from './Zones.js'
import Objects from './Objects.js'
import Car from './Car.js'
import Car1 from './Car1.js'
import Car2 from './Car2.js'
import Car3 from './Car3.js'
import Car4 from './Car4.js'
import Car5 from './Car5.js'
import Car6 from './Car6.js'
import Car7 from './Car7.js'
import Car8 from './Car8.js'
import Car9 from './Car9.js'
import Car10 from './Car10.js'
import Car11 from './Car11.js'
import Car12 from './Car12.js'
import Car13 from './Car13.js'
import Car14 from './Car14.js'
import Car15 from './Car15.js'
import Car16 from './Car16.js'
import Car17 from './Car17.js'
import Car18 from './Car18.js'
import Car19 from './Car19.js'
import Areas from './Areas.js'
import Tiles from './Tiles.js'
import Walls from './Walls.js'
import IntroSection from './Sections/IntroSection.js'
import IntroPartSection from './Sections/IntroPartSection.js'
import IntroGuestSection from './Sections/IntroGuestSection.js'
import CrossroadsSection from './Sections/CrossroadsSection.js'
import InformationSection from './Sections/InformationSection.js'
import PlaygroundSection from './Sections/PlaygroundSection.js'
import Controls from './Controls.js'
import Controls1 from './Controls1.js'
import Sounds from './Sounds.js'
const videoAdsSource = 'images/videos/video.mp4';
import feather from 'feather-icons'
import LazyLoad from 'react-lazy-load';

import detectEthereumProvider from '@metamask/detect-provider'
import gsap from 'gsap'
import { Power2 } from 'gsap/EasePack'

import * as CANNON from 'cannon'


export default class
{
    constructor(_options)
    {
        // Options
        this.config = _options.config
        this.debug = _options.debug
        this.resources = _options.resources
        this.time = _options.time
        this.sizes = _options.sizes
        this.camera = _options.camera
        this.renderer = _options.renderer
        this.passes = _options.passes

        this.playerId = _options.playerId;
        this.worldId = _options.worldId;
        this.otherPlayers = [];
        this.bullets = [];
        
        this.lastKnownPositions = {};

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('world')
            this.debugFolder.open()
        }

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false

        // this.setAxes()
        this.setSounds()
        this.setControls()
        // this.setFloor()
        this.setAreas()
        this.setStartingScreen()

    }

    /**
     * Clock
     */
    setClock() {
        this.clockContainer = new THREE.Object3D();
        this.container.add(this.clockContainer);

        // Create transparent clock face
        const clockFaceGeometry = new THREE.CircleGeometry(1, 32); // Clock face
        const clockFaceMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }); // Transparent clock face
        const clockFace = new THREE.Mesh(clockFaceGeometry, clockFaceMaterial);
        this.clockContainer.add(clockFace);
        this.clockContainer.position.set(0, 1, -2); // Adjust the clock position

        // Create clock hands (scaled 10 times bigger)
        this.hourHand = this.createHand(5, 0.8, 0xffffff); // Hour hand (10x bigger)
        this.minuteHand = this.createHand(7, 0.5, 0xffffff); // Minute hand (10x bigger)
        this.secondHand = this.createHand(9, 0.3, 0xff5733); // Second hand (red, 10x bigger)

        // Attach hands to the clock container (pivot points will now be at the center)
        this.clockContainer.add(this.hourHand);
        this.clockContainer.add(this.minuteHand);
        this.clockContainer.add(this.secondHand);

        // Set position of hands at the center of the clock face
        this.hourHand.position.set(0, 0, 0.05);
        this.minuteHand.position.set(0, 0, 0.06);
        this.secondHand.position.set(0, 0, 0.07);
    }

    // Helper method to create clock hands with pivot at the bottom
    createHand(length, width, color) {
        const geometry = new THREE.BoxGeometry(width, length, 0.05); // Rectangular hand
        const material = new THREE.MeshBasicMaterial({ color });
        const hand = new THREE.Mesh(geometry, material);

        // Adjust the hand geometry to have its pivot point at the bottom
        const pivot = new THREE.Object3D(); // Create a pivot point
        pivot.add(hand); // Add the hand to the pivot
        hand.position.y = length / 2; // Move hand up so the bottom is at the pivot point

        return pivot; // Return the pivot with the hand attached
    }

    // Method to update the clock based on real time
    updateClock() {
        const now = new Date();
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours() % 12;

        // Update rotation for each hand based on time
        this.secondHand.rotation.z = -((seconds / 60) * Math.PI * 2); // Full rotation in 60 seconds
        this.minuteHand.rotation.z = -((minutes / 60) * Math.PI * 2); // Full rotation in 60 minutes
        this.hourHand.rotation.z = -((hours / 12) * Math.PI * 2 + (minutes / 720) * Math.PI * 2); // 12-hour rotation with minute adjustment
    }

    // Function to add walls visually in Three.js
    addWallsToScene(walls) {
        walls.forEach(wall => {
            const geometry = new THREE.BoxGeometry(wall.size.x * 2, wall.size.y * 2, wall.size.z * 2);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });  // Green wireframe walls
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(wall.position.x, wall.position.y, wall.position.z);
            this.container.add(mesh);
        });
    }

    initializeTargetDetection() {
        if (!this.car) {
            console.warn('PlayerCar is not initialized');
            return;
        }
    
        let lastTargetPlayerId = null;
        
        this.time.on('tick', () => {
            const targetPlayerId = this.detectNearestTarget();
            if (targetPlayerId && targetPlayerId !== lastTargetPlayerId) {
                this.showTargetPlayerId(targetPlayerId);
                lastTargetPlayerId = targetPlayerId;
            } else if (!targetPlayerId) {
                this.hideTargetPlayerId();
                lastTargetPlayerId = null;
            }
        });
    }
    

    // New function to detect the nearest target player
    detectNearestTarget() {
        if (!this.car) {
            console.warn('PlayerCar is not initialized');
            return null;
        } else {
            let targetElement = document.getElementById('target-player-id');
            targetElement.style.opacity = '1';
        }
    
        let nearestPlayerId = null;
        let nearestDistance = Infinity;
    
        Object.keys(this.physics.cars || {}).forEach(playerId => {
            if (playerId === this.playerId) return; // Skip the player's own car
    
            const car = this.physics.cars[playerId];
            const distance = this.car.physics.car.chassis.body.position.distanceTo(
                car instanceof Car1 ? car.physics.car1.chassis.body.position :
                car instanceof Car2 ? car.physics.car2.chassis.body.position :
                car instanceof Car3 ? car.physics.car3.chassis.body.position :
                car.physics.car4.chassis.body.position
            );
    
            if (distance < 5 && distance < nearestDistance) { // Adjust the distance radius as needed
                nearestDistance = distance;
                nearestPlayerId = playerId;
            }
        });
    
        return nearestPlayerId;
    }
    
    
    // Other methods remain unchanged
    showTargetPlayerId(targetPlayerId) {
        let targetElement = document.getElementById('target-player-id');
        if (!targetElement) {
            targetElement = document.createElement('div');
            targetElement.id = 'target-player-id';
            document.body.appendChild(targetElement);
        }

        // Function to format playerId
        function formatPlayerId(targetPlayerId) {
            const firstPart = targetPlayerId.substring(0, 4);
            const lastPart = targetPlayerId.substring(targetPlayerId.length - 4);
            return `${firstPart}...${lastPart}`;
        }
    
        // Update the content and show the element
        targetElement.innerText = '' + formatPlayerId(targetPlayerId) + '';
        targetElement.style.display = 'block';
        targetElement.style.opacity = '1';
    }

    // Function to dynamically update the display style based on orientation
    updateTargetPlayerDisplay() {
        const isHorizontal = window.innerWidth > window.innerHeight;
        
        if (isHorizontal) {
            // Display for horizontal (desktop/landscape mode)
            targetElement.style.display = 'block';
            targetElement.style.position = 'absolute';
            targetElement.style.textAlign = 'center';
            targetElement.style.fontFamily = 'Orbitron, sans-serif'
            targetElement.style.fontSize = '10px';
            targetElement.style.top = '48px';
            targetElement.style.left = '269px';
            targetElement.style.background = 'rgba(0, 0, 0, 0.5);';
            targetElement.style.color = '#fff';
            targetElement.style.padding = '10px 10px';
            targetElement.style.borderRadius = '5px';
            targetElement.style.zIndex = '10px';
            targetElement.style.opacity = '0';
            targetElement.style.rotate = '90deg';
        }
    }
    
    hideTargetPlayerId() {
        const targetElement = document.getElementById('target-player-id');
        if (targetElement) {
            // targetElement.style.display = 'none';
            targetElement.innerText = '⫷⫸'
            // targetElement.innerHTML = `${feather.icons['crosshair'].toSvg({ width: 15, height: 15 })}`;
        }
    }

    start() {
        this.signIn(this.playerId);

        if (typeof window !== 'undefined') {
            window.setTimeout(() => {
                this.camera.pan.enable();
            }, 2000);
        }

        this.setAds();
        this.setMaterials();
        this.setShadows();
        this.setZones();
        this.setPhysics();
        this.setObjects();
        this.setTiles();
        this.setWalls();
        this.setSections();
        this.createMiniMap();
        this.setReveal();
        this.setClock();
    }

    setCar() {
        this.car = new Car({
            time: this.time,
            resources: this.resources,
            objects: this.objects,
            physics: this.physics,
            shadows: this.shadows,
            materials: this.materials,
            controls: this.controls,
            sounds: this.sounds,
            renderer: this.renderer,
            camera: this.camera,
            debug: this.debugFolder,
            config: this.config,
            playerId: this.playerId,
            worldId: this.worldId,
            bullets: this.bullets,
            battery: this.battery,
            score: this.score,
            ws: this.ws
        });
        this.container.add(this.car.container);
        this.updateBatteryStatus(this.car.battery);
        this.updateScoreStatus(this.car.score);

      }

      setAds() {
        const video = document.createElement('video');
        video.src = videoAdsSource;
        video.id = 'video';
        video.crossOrigin = 'anonymous';
        video.playsInline = true;
        video.width = 500; 
        video.height = 500; 
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.style = 'display: none';

        // Event listeners to prevent unwanted behavior
        const preventDefaultHandler = (event) => event.preventDefault();
        ['click', 'contextmenu', 'mousedown', 'mouseup', 'touchstart', 'touchend'].forEach(event => 
            video.addEventListener(event, preventDefaultHandler)
        );
    
        document.body.appendChild(video);
    
        const videoTexture = new THREE.VideoTexture(video);
    
        // Create a video texture from the video element
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;
    
        // Create a plane with video texture
        const planeGeometry = new THREE.PlaneGeometry(2, 2); // Adjust the aspect ratio as needed
        const planeMaterial = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide, toneMapped: false });
        const videoPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    
        // Position the plane
        videoPlane.position.set(0, -30.8, 1.2); // Adjust the position as needed
        videoPlane.rotation.x = Math.PI / 2; // Rotate 45 degrees; adjust as needed
    
        // Add the plane to the scene
        this.container.add(videoPlane);
    
        // Ensure the texture updates
        this.time.on('tick', () => {
            if (videoTexture && video.readyState >= video.HAVE_CURRENT_DATA) {
                videoTexture.needsUpdate = true;
            }
        });
    }  
        
        generateWorldId = async () => {
            await this.ensureWebSocketReady();
        
            return new Promise((resolve) => {
                const predefinedWorldIds = [
                    'world-1', 'world-2', 'world-3', 'world-4', 'world-5',
                    'world-6', 'world-7', 'world-8', 'world-9', 'world-10'
                ];
        
                const message = JSON.stringify({
                    type: 'generateWorldId',
                    predefinedWorldIds: predefinedWorldIds
                });
        
                console.log("Sending worldId generation request..."); // Debug log
                this.ws.send(message);
        
                this.ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    console.log("Received worldId generation result", data); // Debug log
                    if (data.type === 'generateWorldIdResult' && data.success && data.worldId) {
                        console.log("Resolved worldId:", data.worldId); // Debug log
                        resolve(data.worldId);
                    } else {
                        console.error("Failed to generate worldId"); // Error handling
                        resolve(null);
                    }
                };
            });
        };
        
        
        // Ensures WebSocket is ready before proceeding
        ensureWebSocketReady = () => {
            return new Promise((resolve) => {
                if (this.ws.readyState === WebSocket.OPEN) {
                    resolve();
                } else {
                    this.ws.addEventListener('open', () => {
                        resolve();
                    });
                }
            });
        };

        requestPlayerScore(playerId) {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                const getScoreMessage = {
                    type: 'getScore',
                    playerId: playerId
                };
                console.log(`Requesting score for player ${playerId}`);
                this.ws.send(JSON.stringify(getScoreMessage));
            } else {
                console.error('WebSocket connection is not open. From request player score');
            }
        }       

        setupMultiplayer = async (playerId, token) => {
            try {

                // Retrieve the token from localStorage
                token = localStorage.getItem('token');

                // Check if the token is provided
                if (!token) {
                    console.error('JWT token is required for authentication');
                    return;
                }

                // Add the token to the WebSocket URL query parameter
                const serverAddress = `wss://krashbox.glitch.me?token=${token}`;
                const ws = new WebSocket(serverAddress)
                this.ws = ws;  // Store the WebSocket connection

                this.worldId = "world-1"

                this.playerId = playerId;
                this.otherPlayers = {};
                this.cars = {};
                this.inParty = false;
                this.partyMembers = [];
                this.isPartyLeader = false;

                const messageQueue = [];
        
                ws.onopen = () => {

                    // Clear old party state in case the player was previously in a party
                    this.inParty = false;
                    this.partyMembers = [];

                    ws.send(JSON.stringify({ type: 'join', playerId: this.playerId, worldId: this.worldId }));
                    console.log('Connected to WebSocket server with worldId', this.worldId);

                    // Request the player's score from the server
                    this.requestPlayerScore(this.playerId);

                    while (messageQueue.length > 0) {
                        ws.send(JSON.stringify(messageQueue.shift()));
                    }
                };
        
                ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);

                    if (message.type === 'playerCount') {
                        // Update the player count display
                        document.getElementById('playerCountDisplay').innerText = `${message.count}`;
                    }
        
                    switch (message.type) {
                        case 'stateUpdate':
                            // Initialize all existing players' cars
                            message.state.forEach(playerState => {
                                if (playerState.playerId !== this.playerId) {
                                    createOtherPlayerCar(playerState.playerId, playerState);
                                }
                            });
                            break;

                        case 'playerScore':
                            // Update the player's score upon retrieval from the server
                            if (message.playerId === this.playerId) {
                                if (!this.cars[message.playerId]) {
                                    this.cars[message.playerId] = {}; // Initialize if not present
                                }
                                this.cars[message.playerId].score = message.score;
                                this.updateScoreStatus(this.cars[message.playerId].score); // Display updated score
                                dropAirdrop(this.cars[message.playerId]);
                            }
                            break;
        
                        case 'playerJoined':
                            if (message.playerId !== this.playerId) {
                                createOtherPlayerCar(message.playerId, message.state);
                            }
                            break;

                        case 'worldFull':
                                console.error(`The world ${message.worldId} is full. Please try joining another world.`);
                                // Handle world full situation (e.g., prompt the user to join another world or retry)
                                // For example, you might want to retry joining with a different worldId or notify the user
                                break;
        
                        case 'update':
                            if (message.playerId !== this.playerId) {
                                const car = this.otherPlayers[message.playerId];
                                if (car) {
                                    updateCarState(car, message);
                                    this.updateMiniMap(
                                        message.playerId,
                                        message.position.x,
                                        message.position.y,
                                        message.rotation,
                                        true
                                    );
                                }
                            }
                            break;

                        case 'bulletFired':
                                if (message.shooterId !== this.playerId) {
                                    const shooterCar = this.otherPlayers[message.shooterId];
                                    if (shooterCar) {
                                        shooterCar.createAndShootBullet({
                                            shooterId: message.shooterId,
                                            bulletData: {
                                                position: message.position,
                                                rotation: message.rotation,
                                                velocity: message.velocity
                                            }
                                        });
                                    } else {
                                        console.error(`Shooter's car not found for playerId: ${message.shooterId}`);
                                    }
                                }
                                break;

                        // Client-side bulletCollision handling in setupMultiplayer
                        case 'bulletCollision':
                            console.log("Bullet collision detected:", message);
                            
                            if (message.carId !== this.playerId) { // Ensure we update the correct car
                                const car = this.otherPlayers[message.carId];
                                if (car) {
                                    car.battery = message.battery;
                                    car.createSparkEffect();
                                    this.updateScoreStatus(message.score);
                                    console.log("Updating bullet collision score info", message.score)

                                
                                    if (message.battery <= 0) {
                                        // Trigger the crash effect before putting the car to sleep
                                        // car.createCrashEffect(car.chassis.object.position, car.chassis.object.quaternion);
                                    
                                        // Put the car to sleep
                                        // car.physics.car.sleep();
                                    
                                        // Set a timeout to recreate the car after 5 seconds
                                        // setTimeout(() => {
                                        //     // Recreate the car
                                        //     car.physics.car.recreate();
                                    
                                        //     // Reset the battery to 100
                                        //     car.battery = 100;
                                        // }, 5000); // 5 seconds delay
                                    }                                
                                
                                    const twitchForce = new CANNON.Vec3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
                                    car.physics.car.chassis.body.applyImpulse(twitchForce, car.physics.car.chassis.body.position);
                                }
                            }
                            break;

                        case 'invite':
                            console.log(`Received invite from ${message.inviterId}`);
                            showInvitePrompt(message.inviterId, message.targetPlayerId);
                            break;

                        case 'inviteResponse':
                                if (message.response === 'yes') {
                                    addPlayerToParty(message.inviterId, message.playerId);
                                }
                            break;

                        case 'partyUpdate':
                            this.inParty = true;
                            this.isPartyLeader = message.party.leader === this.playerId;  // Check if current player is the leader
                            updateToggleButtonVisibility(this.inParty);

                            const partyInfo = document.getElementById('party-info');
                            if (partyInfo) {
                                partyInfo.style.opacity = 1;
                            }
                            
                            // Ensure no duplicate players are added
                            const uniqueMembers = new Set([...this.partyMembers, ...message.party.members]);
                            this.partyMembers = Array.from(uniqueMembers); // Deduplicate members
                            
                            updatePartyUI(message.party.leader, this.partyMembers, this.physics);
                            
                            break;                            

                        case 'partyMessage':  // New case for party messages
                            if (this.inParty) {
                                displayPartyMessage(message.senderId, message.text, message.senderId === this.playerId); // Display the incoming message in chat
                                // handleNewMessage(message);
                            }
                            break;

                        // case 'partyCall':
                        //     if (this.inParty && message.senderId === message.party.leader) {
                        //         promptPartyCallParticipation(message.senderId);  // Prompt other party members to join the call
                        //     }
                        //     break;

                        // case 'partyCallResponse':
                        //     handlePartyCallResponse(message.senderId, message.response);
                        //     break;

                        // case 'batteryStatus':
                        //     updateBatteryStatus(message.playerId, message.battery);
                        //     break;
                        
                        // case 'partyDisbanded':
                        //     this.inParty = false;
                        //     this.partyMembers = [];
                        //     clearChatContainer();
                        //     hideChatContainer();
                        //     updateToggleButtonVisibility(this.inParty);
                        //     document.getElementById('party-info').style.display = 'none';
                        //     if (this.physics) {
                        //         this.physics.nonCollidablePlayers.clear(); // Clear all non-collidable pairs
                        //         console.log("Party disbanded")
                        //     }
                        //     break;

                        case 'partyDisbanded':
                            this.inParty = false;
                            this.partyMembers = [];
                            clearChatContainer();
                            hideChatContainer();
                            updateToggleButtonVisibility(this.inParty);

                            document.getElementById('party-info').style.display = 'none';

                            // Additional clear logic
                            if (this.otherPlayers) {
                                Object.keys(this.otherPlayers).forEach(playerId => {
                                    if (this.partyMembers.includes(playerId)) {
                                        delete this.otherPlayers[playerId];
                                    }
                                });
                            }

                            if (this.physics) {
                                this.physics.nonCollidablePlayers.clear(); // Clear all non-collidable pairs
                                console.log("Party disbanded")
                            }
                        break;

                        case 'partyTwoLeft':
                            alert("Only two players are left in the party.");
                            break;

                        case 'playerRemoved':
                            removePlayerCar(message.playerId);
                            this.inParty = false;
                            this.partyMembers = [];
                            clearChatContainer();
                            hideChatContainer();
                            updateToggleButtonVisibility(this.inParty);

                            const partyInfoElement = document.getElementById('party-info');
                                if (partyInfoElement) {
                                    partyInfoElement.style.display = 'none';
                                }
                                if (this.physics) {
                                this.physics.nonCollidablePlayers.clear(); // Clear all non-collidable pairs
                                console.log("Party disbanded")
                            }
                            break;
        
                        default:
                            // console.error('Unknown message type:', message.type);
                    }
                };
        
                ws.onclose = () => {
                    console.log('Disconnected from WebSocket server');
                    
                        // Clear party state on disconnect
                        this.inParty = false;
                        this.partyMembers = [];
                        clearChatContainer();
                        hideChatContainer();
                        updateToggleButtonVisibility(this.inParty);

                        const partyInfoElement = document.getElementById('party-info');
                        if (partyInfoElement) {
                            partyInfoElement.style.display = 'none';
                        }
                    
                        // Clear physics non-collidable pairs if necessary
                        if (this.physics) {
                            this.physics.nonCollidablePlayers.clear();
                        }         
                        
                        // Redirect to the home or wallet connection page
                        if (typeof window !== 'undefined') {
                            // window.location.href = 'https://krashbox.world';
                            window.location.href = 'localhost:3000';
                        }
                };

                this.setCar(this.playerId);
                const playerCar = this.car;

                this.initializeTargetDetection();

                // Update the Areas instance with the correct car after initialization
                if (this.areas) {
                    this.areas.updateCar(this.car);
                }

                this.physics.cars[playerId] = playerCar;
                this.cars[playerId] = playerCar;

                // Airdrop
                const airdropObj = this.resources.items.airdropBase.scene;
                
                // Set color to orange
                airdropObj.traverse((child) => {
                    if (child.isMesh) {
                        child.material = this.materials.shades.items.blueGlass;
                    }
                });
                
                // Airdrop
                const airdropObj1 = this.resources.items.airdropBase.scene;
                
                // Set color to orange
                airdropObj1.traverse((child) => {
                    if (child.isMesh) {
                        child.material = this.materials.shades.items.greenBulb;
                    }
                });

                const airdropObjects = [
                    { object: airdropObj, chance: 0.49 },
                    { object: airdropObj1, chance: 0.51 }
                ];
                
                const getRandomAirdrop = () => {
                    const rand = Math.random();
                    let cumulativeChance = 0;
                    for (const airdrop of airdropObjects) {
                        cumulativeChance += airdrop.chance;
                        if (rand < cumulativeChance) {
                            return airdrop.object;
                        }
                    }
                    return airdropObjects[airdropObjects.length - 1].object; // Default to the last object in case of rounding errors
                };
        
                const dropAirdrop = (playerCar) => {
                    // Randomly select an airdrop object
                    const airdropObject = getRandomAirdrop();

                    if (!airdropObject) {
                        console.error('Selected airdrop object is not defined.');
                        return;
                    }
        
                    // Create a clone of the airdrop object to add to the scene
                    const airdropClone = airdropObject.clone();
                    this.container.add(airdropClone);
        
                    // Set the initial position of the airdrop (above the car)
                    airdropClone.position.set(playerCar.physics.car.chassis.body.position.x * Math.random() * Math.PI * 2, playerCar.physics.car.chassis.body.position.y * Math.random() * Math.PI * 2, playerCar.physics.car.chassis.body.position.z * Math.random() * Math.PI * 2);
        
                    // Animate the airdrop to move to the car's position
                    const targetPosition = {
                        x: playerCar.physics.car.chassis.body.position.x,
                        y: playerCar.physics.car.chassis.body.position.y,
                        z: playerCar.physics.car.chassis.body.position.z
                    };

                    // Add random spin animation
                    gsap.to(airdropClone.rotation, 2, {
                        x: Math.random() * Math.PI * 2,
                        y: Math.random() * Math.PI * 2,
                        z: Math.random() * Math.PI * 2,
                    });
        
                    gsap.to(airdropClone.position, 2, {
                        x: targetPosition.x,
                        y: targetPosition.y,
                        z: targetPosition.z,
                        onComplete: () => {
                            // Remove the airdrop from the scene after reaching the target
                            this.container.remove(airdropClone);
                        }
                    });
                }

                let lastAirdropScore = playerCar.score;

                const checkForAirdrop = () => {
                    if (playerCar.score >= lastAirdropScore + 5) {
                        lastAirdropScore += 5;
                        this.dropAirdrop(playerCar);
                    }
                };

                // Add the invite button event listener
                document.getElementById('invite-button').addEventListener('click', () => {
                    const targetPlayerId = this.detectNearestTarget();
                    
                    if (targetPlayerId) {
                        const playerId = this.car.playerId;

                        // Check if the targetPlayerId is already in a party
                        if (this.partyMembers && this.partyMembers.includes(targetPlayerId)) {
                            alert(`Target player ${targetPlayerId} is already in party.`);
                        } else {
                            console.log(`Sending invite from ${playerId} to ${targetPlayerId}`);
                            sendInvite(targetPlayerId, playerId);
                        }
                    } else {
                        console.error('No target player found for invite.');
                    }
                });

                // Add party call button functionality
                // if (this.isPartyLeader) {
                //     document.getElementById('party-call-button').addEventListener('click', () => {
                //         initiatePartyCall();  // Party leader initiates the call
                //     });
                // }

                // Invite target player
                function sendInvite(targetPlayerId, playerId) {
                    if (typeof window !== 'undefined') {

                        if (window.pendingInvite) return;
                        
                        window.pendingInvite = true;
                    }
                
                    // Check if the WebSocket is open before sending the invite
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'invite',
                            inviterId: playerId,
                            targetPlayerId: targetPlayerId
                        }));
                
                        console.log(`Invite sent from ${playerId} to ${targetPlayerId}`);
                    } else {
                        console.error('WebSocket connection is not open. Invite not sent.');
                    }
                
                    if (typeof window !== 'undefined') {
                        // Timeout after 20 seconds if no response
                        setTimeout(() => {
                            window.pendingInvite = false;
                        }, 20000);
                    }
                }

                // Show invite prompt
                function showInvitePrompt(inviterId, playerId) {
                    let inviteElement = document.getElementById('invite-prompt');
                    if (!inviteElement) {
                        inviteElement = document.createElement('div');
                        inviteElement.id = 'invite-prompt';
                        inviteElement.style.position = 'absolute';
                        inviteElement.style.top = '50%';
                        inviteElement.style.left = '50%';
                        inviteElement.style.transform = 'translate(-50%, -50%)';
                        inviteElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                        inviteElement.style.color = 'white';
                        inviteElement.style.padding = '10px';
                        inviteElement.style.borderRadius = '10px';
                        inviteElement.style.zIndex = '1000';
                        inviteElement.style.backdropFilter = 'blur(5px)';
                        inviteElement.style.display = 'flex';
                        inviteElement.style.alignItems = 'center';
                        inviteElement.style.flexDirection = 'column';
                        inviteElement.style.width = '250px';

                        // Progress bar container
                        const progressBarContainer = document.createElement('div');
                        progressBarContainer.style.width = '100%';
                        progressBarContainer.style.height = '10px';
                        progressBarContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                        progressBarContainer.style.borderRadius = '5px';
                        progressBarContainer.style.overflow = 'hidden';
                        progressBarContainer.style.marginBottom = '10px';

                        // Progress bar
                        const progressBar = document.createElement('div');
                        progressBar.style.width = '100%';
                        progressBar.style.height = '100%';
                        progressBar.style.backgroundColor = '#8CFF80';
                        progressBarContainer.appendChild(progressBar);

                        inviteElement.appendChild(progressBarContainer);

                        const messageElement = document.createElement('div');
                        messageElement.id = 'invite-message';
                        messageElement.style.fontFamily = 'Orbitron, sans-serif';
                        inviteElement.appendChild(messageElement);

                        const buttonContainer = document.createElement('div');
                        buttonContainer.style.display = 'flex';
                        buttonContainer.style.justifyContent = 'space-between';
                        buttonContainer.style.width = '100%';

                        const yesButton = document.createElement('button');
                        yesButton.id = 'ordinaryButton';
                        yesButton.innerHTML = `${feather.icons['check-square'].toSvg({ width: 15, height: 15 })} CONFIRM`;
                        yesButton.style.marginRight = '10px';
                        yesButton.style.whiteSpace = 'pre';
                        yesButton.style.display = 'flex';
                        yesButton.style.justifyContent = 'center';
                        yesButton.style.backgroundColor = '#8CFF80';
                        yesButton.style.color = '#000';
                        yesButton.style.flex = '1';
                        yesButton.style.fontFamily = 'Orbitron, sans-serif';
                        yesButton.onclick = () => respondToInvite('yes', inviterId, playerId);
                        buttonContainer.appendChild(yesButton);
                        feather.replace();

                        const noButton = document.createElement('button');
                        noButton.id = 'ordinaryButton';
                        noButton.innerHTML = `${feather.icons['x-square'].toSvg({ width: 15, height: 15 })} DENY`;
                        noButton.style.whiteSpace = 'pre';
                        noButton.style.backgroundColor = '#FF5733';
                        noButton.style.display = 'flex';
                        noButton.style.fontFamily = 'Orbitron, sans-serif';
                        noButton.style.justifyContent = 'center';
                        noButton.style.flex = '1';
                        noButton.onclick = () => respondToInvite( 'DENY', inviterId, playerId);
                        buttonContainer.appendChild(noButton);

                        inviteElement.appendChild(buttonContainer);
                        document.body.appendChild(inviteElement);

                        // Start the progress bar animation (decrease width over 20 seconds)
                        setTimeout(() => {
                            progressBar.style.transition = 'width 20s linear';  // Smooth transition for 20 seconds
                            progressBar.style.width = '0%';  // Decrease the width to 0%
                        }, 100);  // Small delay to trigger the transition

                        // Auto-remove after 20 seconds
                        let timeLeft = 20;
                        const countdownInterval = setInterval(() => {
                            timeLeft -= 1;
                            if (timeLeft <= 0) {
                                clearInterval(countdownInterval);
                                hideInvitePrompt(inviteElement); // Automatically hide the invite prompt after timeout
                            }
                        }, 1000);
                    }

                    const messageElement = document.getElementById('invite-message');
                    messageElement.innerText = `${inviterId.slice(0, 6)} invited you to a party. Accept?`;
                    messageElement.style.textAlign = 'left';
                    messageElement.style.marginLeft = '10px';
                    inviteElement.style.display = 'flex';
                    inviteElement.style.opacity = '1';
                    inviteElement.style.fontSize = '12px';
                }

                // Hide invite prompt
                function hideInvitePrompt(inviteElement) {
                    inviteElement.style.opacity = '0';
                    setTimeout(() => {
                        if (inviteElement && inviteElement.parentNode) {
                            inviteElement.parentNode.removeChild(inviteElement);
                        }
                    }, 500); // Smooth fade out
                }

                // Respond to invite
                function respondToInvite(response, inviterId, playerId) {
                    ws.send(JSON.stringify({
                        type: 'inviteResponse',
                        response: response,
                        inviterId: inviterId,
                        playerId: playerId
                    }));

                    const inviteElement = document.getElementById('invite-prompt');
                    if (inviteElement) {
                        inviteElement.style.display = 'none';
                    }
                }

                // Add player to party
                function addPlayerToParty(inviterId, playerId) {
                    ws.send(JSON.stringify({
                        type: 'addToParty',
                        inviterId: inviterId,
                        playerId: playerId
                    }));
                    // updatePartyUI(inviterId, playerId);
                }
                
                // Update party UI
                function updatePartyUI(inviterId, members, physics) {
                    let partyElement = document.getElementById('party-info');              

                    if (!partyElement) {
                        partyElement = document.createElement('div');
                        partyElement.id = 'party-info';
                        
                        const updateStylesForOrientation = (orientation) => {
                            if (orientation === 'portrait') {
                                partyElement.style.top = '180px';
                                partyElement.style.left = '235px';
                                partyElement.style.width = '35%';
                                partyElement.style.fontSize = '13px';
                                partyElement.style.textAlign = 'left';
                                partyElement.style.borderRadius = '5px';
                                partyElement.style.display = 'block';
                                partyElement.style.fontFamily = 'Orbitron, sans-serif';
                                partyElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                            } else if (orientation === 'landscape') {
                                partyElement.style.display = 'none';
                                partyElement.style.top = '15px';
                                partyElement.style.left = '345px';
                                partyElement.style.width = '15%';
                            }
                        };
                    
                        // Check initial orientation
                        let portrait = window.matchMedia("(orientation: portrait)");
                        updateStylesForOrientation(portrait.matches ? 'portrait' : 'landscape');
                    
                        // Listen for orientation changes
                        portrait.addEventListener("change", (e) => {
                            if (e.matches) {
                                updateStylesForOrientation('portrait');
                            } else {
                                updateStylesForOrientation('landscape');
                            }
                        });
                    
                        // Alternatively, using screen.orientation (if supported)
                        if (screen.orientation) {
                            screen.orientation.addEventListener("change", (e) => {
                                updateStylesForOrientation(screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape');
                            });
                        }
                    
                        // Set the common styles for the partyElement
                        partyElement.style.position = 'absolute';
                        partyElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                        partyElement.style.color = 'white';
                        partyElement.style.padding = '10px';
                        partyElement.style.zIndex = '1000';
                        partyElement.style.backdropFilter = 'blur(10px)';
                        partyElement.style.fontFamily = 'Orbitron, sans-serif';
                        partyElement.style.borderRadius = '5px';
                    
                        const leaveButton = document.createElement('button');
                        leaveButton.id = 'ordinaryButton';
                        leaveButton.onclick = leaveParty;
                        partyElement.appendChild(leaveButton);
                    
                        document.body.appendChild(partyElement);
                    }
                    
                    // Ensure the party UI is visible
                    partyElement.style.display = 'block';

                    // Clear previous content except for the leave button
                    partyElement.innerHTML = '';

                    // Create the leave button
                    const leaveButton = document.createElement('button');
                    leaveButton.innerHTML = `${feather.icons['log-out'].toSvg({ width: 15, height: 15 })}`;
                    leaveButton.style.display = 'flex';
                    leaveButton.style.rotate = '180deg';
                    leaveButton.style.marginBottom = '5px';
                    leaveButton.style.paddingLeft = '5px';
                    leaveButton.style.color = 'rgb(255, 87, 51)';
                    leaveButton.style.background = 'unset';
                    leaveButton.style.border = 'none';
                    leaveButton.style.fontSize = '10px';
                    leaveButton.style.fontWeight = 'bold';
                    leaveButton.style.fontFamily = 'Orbitron, sans-serif';
                    leaveButton.onclick = leaveParty;
                    partyElement.appendChild(leaveButton);

                    // Conditionally attach it to the switch button
                    // const switchContainer = document.getElementById('switch-container');
                    // if (switchContainer) {
                    //     switchContainer.appendChild(partyElement);  // Append to the switch-container
                    // }

                    function formatPlayerId(id) {
                        const firstPart = id.substring(0, 4);
                        const lastPart = id.substring(id.length - 4);
                        return `${firstPart}...${lastPart}`;
                    }

                    // Create time display element
                    const timeElement = document.createElement('div');
                    timeElement.id = 'party-time-display';
                    timeElement.style.position = 'absolute';
                    timeElement.style.top = '8px';
                    timeElement.style.left = '50%';
                    timeElement.style.transform = 'translateX(-50%)';
                    timeElement.style.fontSize = '14px';
                    timeElement.style.padding = '3px';
                    timeElement.style.fontWeight = 'bold';
                    timeElement.style.marginLeft = '3px';
                    timeElement.style.fontSize = '10px';
                    partyElement.appendChild(timeElement);

                    // Update time every second
                    setInterval(() => {
                        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        timeElement.innerText = currentTime;
                    }, 1000);

                    // Add inviter info
                    // const inviterInfo = document.createElement('div');
                    // inviterInfo.innerText = `♔ ${formatPlayerId(inviterId)}`;
                    // partyElement.appendChild(inviterInfo);

                    // Add the toggle chat button if it doesn't already exist
                    const toggleButton = document.createElement('button');
                    toggleButton.id = 'toggle-chat-button';
                    toggleButton.innerHTML = `${feather.icons['mail'].toSvg({ width: 15, height: 15 })}`;  // Chat icon
                    toggleButton.style.color = '#FF5733';
                    toggleButton.style.background = 'unset';
                    toggleButton.style.border = 'none';
                    toggleButton.style.marginLeft = '35%';
                    toggleButton.style.top = '0';
                    toggleButton.style.cursor = 'pointer';
                    partyElement.appendChild(toggleButton);

                    // Add event listener for toggling the chat visibility
                    toggleButton.addEventListener('click', toggleChatVisibility);

                    // Add member info
                    members.forEach(memberId => {
                        const memberInfo = document.createElement('div');
                        memberInfo.id = `member-${memberId}`;
                        memberInfo.style.marginTop = '5px';
                        memberInfo.innerText = `➤ ${formatPlayerId(memberId)}`;
                        partyElement.appendChild(memberInfo);
                    });

                    // Pass the updated members to the physics engine
                    if (physics) {
                        // Update non-collidable pairs only if there are remaining members
                        if (members.length > 1) {
                            physics.updateNonCollidablePlayers(members);
                        } else {
                            physics.nonCollidablePlayers.clear(); // Clear all non-collidable pairs if the party is disbanded
                        }
                    } else {
                        console.error('Physics engine is not defined.');
                    }  
                }

                // const initiatePartyCall = () => {
                //     if (this.isPartyLeader && this.ws && this.ws.readyState === WebSocket.OPEN) {
                //         this.ws.send(JSON.stringify({
                //             type: 'partyCall',
                //             senderId: this.playerId,
                //             party: {
                //                 leader: this.playerId,
                //                 members: this.partyMembers
                //             }
                //         }));
                //         displayPartyMessage(this.playerId, "You initiated a party call.", true);  // Notify in the chat
                //     } else {
                //         console.error("Only the party leader can initiate a party call.");
                //     }
                // };

                // const promptPartyCallParticipation = (senderId) => {
                //     const callPromptElement = document.createElement('div');
                //     callPromptElement.id = 'party-call-prompt';
                //     callPromptElement.style.position = 'absolute';
                //     callPromptElement.style.top = '50%';
                //     callPromptElement.style.left = '50%';
                //     callPromptElement.style.transform = 'translate(-50%, -50%)';
                //     callPromptElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                //     callPromptElement.style.color = 'white';
                //     callPromptElement.style.padding = '20px';
                //     callPromptElement.style.borderRadius = '10px';
                //     callPromptElement.style.zIndex = '1000';
                //     callPromptElement.innerText = `${formatPlayerId(senderId)} is initiating a party call. Do you want to join?`;
                
                //     const buttonContainer = document.createElement('div');
                //     buttonContainer.style.display = 'flex';
                //     buttonContainer.style.justifyContent = 'space-between';
                //     buttonContainer.style.marginTop = '10px';
                
                //     const acceptButton = document.createElement('button');
                //     acceptButton.innerText = 'Join Call';
                //     acceptButton.style.flex = '1';
                //     acceptButton.style.marginRight = '10px';
                //     acceptButton.onclick = () => {
                //         respondToPartyCall('yes', senderId);
                //         document.body.removeChild(callPromptElement);  // Remove the prompt
                //     };
                
                //     const declineButton = document.createElement('button');
                //     declineButton.innerText = 'Decline';
                //     declineButton.style.flex = '1';
                //     declineButton.onclick = () => {
                //         respondToPartyCall('no', senderId);
                //         document.body.removeChild(callPromptElement);  // Remove the prompt
                //     };
                
                //     buttonContainer.appendChild(acceptButton);
                //     buttonContainer.appendChild(declineButton);
                //     callPromptElement.appendChild(buttonContainer);
                
                //     document.body.appendChild(callPromptElement);
                // };        
                
                // const respondToPartyCall = (response, leaderId) => {
                //     if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                //         this.ws.send(JSON.stringify({
                //             type: 'partyCallResponse',
                //             senderId: this.playerId,
                //             leaderId: leaderId,
                //             response: response
                //         }));
                //     }
                // };                

                // Function to send a message to party members
                const sendPartyMessage = (text) => {
                    if (text && this.ws && this.ws.readyState === WebSocket.OPEN && this.inParty) {
                    ws.send(JSON.stringify({
                        type: 'partyMessage',
                        senderId: this.playerId,
                        text: text
                    }));
                    }
                };
            
                // Event listener for sending a message
                document.getElementById('send-message-button').addEventListener('click', () => {
                    const messageInput = document.getElementById('party-message-input');
                    const messageText = messageInput.value;
                    if (messageText) {
                    sendPartyMessage(messageText);
                    messageInput.value = ''; // Clear the input after sending
                    }
                });

                // const handlePartyCallResponse = (senderId, response) => {
                //     const message = response === 'yes'
                //         ? `${formatPlayerId(senderId)} joined the party call.`
                //         : `${formatPlayerId(senderId)} declined the party call.`;
                //     displayPartyMessage(senderId, message, false);
                // };
                
            
                // Function to display a party message in the chat UI
                const displayPartyMessage = (senderId, text, isOwnMessage) => {
                    const chatBox = document.getElementById('party-chat-box');
                    const chatContainer = document.getElementById('party-chat-container');

                    // Check if the chat is hidden and show the notification badge
                    if (chatContainer.style.display !== 'block') {
                        showNotificationBadge();  // Trigger notification if chat is hidden
                    }

                    // Create a container for the message
                    const messageElement = document.createElement('div');
                    messageElement.classList.add('chat-message');

                    // Apply the appropriate class for sent/received messages
                    if (isOwnMessage) {
                        messageElement.classList.add('my-message');  // Apply style for own message
                    } else {
                        messageElement.classList.add('other-message');  // Apply style for received message
                    }

                    // Format the senderId and create a sender element
                    const senderElement = document.createElement('span');
                    senderElement.classList.add('sender-id');
                    senderElement.innerText = `${formatPlayerId(senderId)}: `;

                    // Create a text element for the message text
                    const textElement = document.createElement('span');
                    textElement.classList.add('message-text');
                    textElement.innerText = text;

                    // Create a timestamp element
                    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const timeElement = document.createElement('span');
                    timeElement.classList.add('message-timestamp');
                    timeElement.innerText = ` ${timestamp}`;
                    timeElement.style.marginLeft = '8px';
                    timeElement.style.color = '#888';
                    timeElement.style.fontSize = '8px';

                    // Append sender, text, and timestamp to the message element
                    messageElement.appendChild(senderElement);
                    messageElement.appendChild(textElement);
                    messageElement.appendChild(timeElement);

                    // Append the message element to the chat box
                    chatBox.appendChild(messageElement);
                    chatBox.scrollTop = chatBox.scrollHeight;  // Auto-scroll to the latest message
                };

                // Function to format playerId
                function formatPlayerId(playerId) {
                    const firstPart = playerId.substring(0, 4);
                    const lastPart = playerId.substring(playerId.length - 4);
                    return `${firstPart}...${lastPart}`;
                }

                // Function to clear the chat container
                const clearChatContainer = () => {
                    const chatBox = document.getElementById('party-chat-box');
                    chatBox.innerHTML = ''; // Clear the chat messages
                };

                // Function to show the chat container
                const showChatContainer = () => {
                    const chatContainer = document.getElementById('party-chat-container');
                    if (chatContainer) {
                    chatContainer.style.display = 'block'; // Show the chat container
                    }
                };

                // Function to hide the chat container
                const hideChatContainer = () => {
                    const chatContainer = document.getElementById('party-chat-container');
                    if (chatContainer) {
                    chatContainer.style.display = 'none'; // Hide the chat container
                    }
                };

                // Function to show the toggle button
                const showToggleButton = () => {
                    const toggleButton = document.getElementById('toggle-chat-button');
                    if (toggleButton) {
                        toggleButton.style.display = 'block';
                    }
                };

                // Function to hide the toggle button
                const hideToggleButton = () => {
                    const toggleButton = document.getElementById('toggle-chat-button');
                    if (toggleButton) {
                        toggleButton.style.display = 'none';
                    }
                };

                // Function to check if the player is in a party and update the toggle button visibility
                const updateToggleButtonVisibility = (inParty) => {
                    if (inParty) {
                        console.log('Player is in a party. Showing toggle button.');
                        showToggleButton();  // Show the button if the player is in a party
                    } else {
                        console.log('Player is not in a party. Hiding toggle button.');
                        hideToggleButton();  // Hide the button if the player is not in a party
                    }
                };

                // Function to show a notification badge on the toggle button
                const showNotificationBadge = () => {
                    const toggleButton = document.getElementById('toggle-chat-button');
                    let notificationBadge = document.getElementById('chat-notification-badge');

                    if (toggleButton && !notificationBadge) {
                        // Create a new notification badge if it doesn't exist
                        notificationBadge = document.createElement('div');
                        notificationBadge.id = 'chat-notification-badge';
                        notificationBadge.style.position = 'absolute';
                        notificationBadge.style.top = '-15px';
                        notificationBadge.innerHTML = `${feather.icons['mouse-pointer'].toSvg({ width: 15, height: 15 })}`;
                        notificationBadge.style.right = '2px';
                        notificationBadge.style.rotate = '270deg';
                        notificationBadge.style.backgroundColor = 'transparent';
                        notificationBadge.style.borderRadius = '50%';
                        notificationBadge.style.zIndex = '1000';
                        notificationBadge.style.fontSize = '30px';
                        notificationBadge.style.color = '#18FF00';
                        // toggleButton.style.position = 'relative'; // Ensure relative positioning
                        toggleButton.appendChild(notificationBadge);
                    }

                    // Ensure the badge is visible
                    if (notificationBadge) {
                        notificationBadge.style.display = 'block';
                    }
                };
            
                // Toggle chat visibility on button click
                const toggleChatVisibility = () => {
                    const chatContainer = document.getElementById('party-chat-container');
                    const notificationBadge = document.getElementById('chat-notification-badge'); // Badge element

                    if (!chatContainer) {
                        console.error('Chat container not found!');
                        return;
                    }

                    console.log('Chat container found. Toggling visibility.');

                    // Toggle chat visibility
                    if (chatContainer.style.display === 'block') {
                        chatContainer.style.display = 'none';
                    } else {
                        chatContainer.style.display = 'block';
                        // Hide the notification badge when the chat is opened
                        if (notificationBadge) {
                            notificationBadge.style.display = 'none';
                        }
                    }
                };

                // Add event listener to existing button (no need to create it dynamically)
                // document.getElementById('toggle-chat-button').addEventListener('click', toggleChatVisibility);

                // Create chat UI but hide it initially
                const chatContainer = document.createElement('div');
                chatContainer.id = 'party-chat-container';
                chatContainer.style.position = 'absolute';
                chatContainer.style.bottom = '0';
                chatContainer.style.right = '0';
                chatContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                chatContainer.style.width = '300px';
                chatContainer.style.height = '200px';
                chatContainer.style.overflowY = 'auto';
                chatContainer.style.display = 'none';
                chatContainer.style.transform = 'translateY(100%)';
                chatContainer.style.transition = 'transform 0.4s ease, opacity 0.4s ease';

                document.body.appendChild(chatContainer);

                const chatBox = document.createElement('div');
                chatBox.id = 'party-chat-box';
                chatBox.style.height = '80%';
                chatBox.style.overflowY = 'auto';
                chatContainer.appendChild(chatBox);

                // Create the toggle chat visibility button inside the chat box
                const toggleChatButton = document.createElement('button')
                toggleChatButton.id = 'toggle-chat-visibility-button';
                toggleChatButton.innerHTML = `${feather.icons['minimize'].toSvg({ width: 15, height: 15 })}`;
                toggleChatButton.style.position = 'absolute';
                toggleChatButton.style.top = '10px';
                toggleChatButton.style.right = '10px';
                toggleChatButton.style.backgroundColor = 'transparent';
                toggleChatButton.style.color = 'rgb(255, 87, 51)';
                toggleChatButton.style.border = 'none';
                toggleChatButton.style.padding = '10px 5px';
                toggleChatButton.style.cursor = 'pointer';
                toggleChatButton.style.borderRadius = '5px';
                // toggleChatButton.onclick = toggleChatVisibility; // Call the toggle function

                // Append the button to the chat container
                document.getElementById('party-chat-container').appendChild(toggleChatButton);

                toggleChatButton.addEventListener('click', toggleChatVisibility);

                const messageInput = document.createElement('input');
                messageInput.id = 'party-message-input';
                messageInput.style.width = '80%';
                chatContainer.appendChild(messageInput);

                const sendButton = document.createElement('button');
                sendButton.id = 'send-message-button';
                sendButton.innerHTML = `${feather.icons['send'].toSvg({ width: 15, height: 15 })}`;
                sendButton.style.width = '20%';
                chatContainer.appendChild(sendButton);

                // Update battery status in the UI
                function updateBatteryStatus(playerId, battery) {
                    const memberInfo = document.getElementById(`member-${playerId}`);
                    if (memberInfo) {
                        memberInfo.innerText += `, HP: ${battery}%`;
                    }
                }

                // Leave party function
                function leaveParty() {
                    const playerId = playerCar.playerId;
                    ws.send(JSON.stringify({ type: 'leaveParty', playerId }));

                    const partyElement = document.getElementById('party-info');
                    if (partyElement) {
                        partyElement.style.display = 'none';
                    }

                    // Clear the non-collidable players set to ensure all players can collide again
                    if (this.physics) {
                        this.physics.nonCollidablePlayers.clear();
                    }
                }
        
                this.time.on('tick', () => {
                    
                    // Check if score has reached the next multiple of 500
                    // if (playerCar.score >= lastAirdropScore + 5) {
                    //     lastAirdropScore += 5;
                    //     dropAirdrop(playerCar);
                    // }

                    const updateData = {
                        type: 'update',
                        playerId: this.playerId,
                        worldId: this.worldId,
                        position: {
                            x: playerCar.physics.car.chassis.body.position.x,
                            y: playerCar.physics.car.chassis.body.position.y,
                            z: playerCar.physics.car.chassis.body.position.z
                        },
                        rotation: {
                            x: playerCar.physics.car.chassis.body.quaternion.x,
                            y: playerCar.physics.car.chassis.body.quaternion.y,
                            z: playerCar.physics.car.chassis.body.quaternion.z,
                            w: playerCar.physics.car.chassis.body.quaternion.w
                        },
                        velocity: {
                            x: playerCar.physics.car.chassis.body.velocity.x,
                            y: playerCar.physics.car.chassis.body.velocity.y,
                            z: playerCar.physics.car.chassis.body.velocity.z
                        },
                        wheels: playerCar.physics.car.vehicle.wheelInfos.map(wheelInfo => ({
                            position: {
                                x: wheelInfo.worldTransform.position.x,
                                y: wheelInfo.worldTransform.position.y,
                                z: wheelInfo.worldTransform.position.z
                            },
                            rotation: {
                                x: wheelInfo.worldTransform.quaternion.x,
                                y: wheelInfo.worldTransform.quaternion.y,
                                z: wheelInfo.worldTransform.quaternion.z,
                                w: wheelInfo.worldTransform.quaternion.w,
                            },
                            rotationAngle: wheelInfo.rotation,
                            brake: wheelInfo.brake
                        })),
                        controls: {
                            boost: playerCar.controls.actions.boost,
                            brake: playerCar.controls.actions.brake,
                            down: playerCar.controls.actions.down,
                            left: playerCar.controls.actions.left,
                            right: playerCar.controls.actions.right,
                            up: playerCar.controls.actions.up,
                            shoot: playerCar.controls.actions.shoot,
                            steering: playerCar.physics.car.steering,
                        },
                        battery: playerCar.battery,
                        score: playerCar.score,
                    };

                    this.updateBatteryStatus(playerCar.battery);
                    this.updateScoreStatus(playerCar.score);
        
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(updateData));
                    } else if (ws.readyState === WebSocket.CONNECTING) {
                        messageQueue.push(updateData);
                    }
        
                    this.updateMiniMap(
                        this.playerId,
                        updateData.position.x,
                        updateData.position.y,
                        updateData.rotation,
                        false
                    );
                });

                if (typeof window !== 'undefined') {
        
                    window.addEventListener("beforeunload", () => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'remove',
                                playerId: this.playerId,
                            }));
                        }
                    });
                }
        
                const createOtherPlayerCar = (playerId, data) => {

                    // if (this.otherPlayers[playerId]) {
                    //     removePlayerCar(playerId);
                    // }

                    const carClasses = [
                        Car1, 
                        Car2, 
                        Car3, 
                        Car4, 
                        Car5, 
                        Car6, 
                        Car7, 
                        Car8, 
                        Car9, 
                        Car10, 
                        Car11, 
                        Car12, 
                        Car13, 
                        Car14, 
                        Car15,
                        Car16,
                        Car17,
                        Car18,
                        Car19
                    ];
                    const carClassIndex = Object.keys(this.otherPlayers).length % carClasses.length;
                    const CarClass = carClasses[carClassIndex];
        
                    this.physics.updateCarClass(CarClass);
        
                    const otherPlayerCar = new CarClass({
                        time: this.time,
                        resources: this.resources,
                        objects: this.objects,
                        physics: this.physics,
                        shadows: this.shadows,
                        materials: this.materials,
                        renderer: this.renderer,
                        camera: this.camera,
                        controls: this.controls,
                        playerId: playerId,
                        bullets: this.bullets,
                        battery: this.battery,
                        worldId: this.worldId,
                        score: this.score,
                        ws: this.ws
                    });
        
                    this.otherPlayers[playerId] = otherPlayerCar;

                    this.container.add(otherPlayerCar.container);
                    
                    console.log("Other player car container", otherPlayerCar)
                    this.physics.cars[playerId] = otherPlayerCar;
                    updateCarState(otherPlayerCar, data);
                };
        
                const updateCarState = (car, data) => {
                    if (!car || !data) return;
        
                    let carKey;
                    if (car instanceof Car1) carKey = 'car1';
                    else if (car instanceof Car2) carKey = 'car2';
                    else if (car instanceof Car3) carKey = 'car3';
                    else if (car instanceof Car4) carKey = 'car4';
                    else if (car instanceof Car5) carKey = 'car5';
                    else if (car instanceof Car6) carKey = 'car6';
                    else if (car instanceof Car7) carKey = 'car7';
                    else if (car instanceof Car8) carKey = 'car8';
                    else if (car instanceof Car9) carKey = 'car9';
                    else if (car instanceof Car10) carKey = 'car10';
                    else if (car instanceof Car11) carKey = 'car11';
                    else if (car instanceof Car12) carKey = 'car12';
                    else if (car instanceof Car13) carKey = 'car13';
                    else if (car instanceof Car14) carKey = 'car14';
                    else if (car instanceof Car15) carKey = 'car15';
                    else if (car instanceof Car16) carKey = 'car16';
                    else if (car instanceof Car17) carKey = 'car17';
                    else if (car instanceof Car18) carKey = 'car18';
                    else if (car instanceof Car19) carKey = 'car19';
        
                    if (data.position) car.physics[carKey].chassis.body.position.set(data.position.x, data.position.y, data.position.z);
                    if (data.rotation) car.physics[carKey].chassis.body.quaternion.set(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);
                    if (data.battery !== undefined) car.battery = data.battery;
                    if (data.score !== undefined) car.score = data.score;

                    if (data.battery) {
                        car.battery = data.battery;
                        const batteryLevelWidth = data.battery / 100;
                    
                        if (!car.chassis.object.children.includes(car.backLightsBattery.object)) {
                            car.chassis.object.add(car.backLightsBattery.object);
                            car.chassis.object.add(car.objects.getConvertedMesh(car.models.chassis.scene.children));
                        }
                    
                        if (car.backLightsBattery) {
                            // Add the battery visual representation
                            if (car.backLightsBattery.object.children.length === 0) {
                                const defaultChild = new THREE.Mesh(new THREE.BoxGeometry(0.055, 2.32, 0.18), car.backLightsBattery.materialRed);
                                car.backLightsBattery.object.add(defaultChild);
                                car.backLightsBattery.object.position.set(-0.22, 0, 1.1);
                                car.backLightsBattery.object.rotation.set(0, 1, 0);
                            }
                    
                            // Update the battery color and scale based on battery level
                            car.backLightsBattery.object.children.forEach(child => {
                                const greenColor = data.battery / 100;
                                const redValue = 1 - greenColor;
                                child.material.color.setRGB(redValue, greenColor, 0.5);
                                child.scale.set(batteryLevelWidth, 4, 3);
                                child.material.opacity = 1;
                            });
                    
                            // Format playerId for display
                            const formatPlayerId = (playerId) => {
                                const firstPart = playerId.substring(0, 4);
                                const lastPart = playerId.substring(playerId.length - 4);
                                return `${firstPart}...${lastPart}`;
                            };
                    
                            // Create or update playerId text separately, positioned above the battery
                            let playerIdText = car.playerIdText; // Use car.playerIdText for storing the text mesh
                            const font = this.resources.items.orbitronFont; // Ensure the font is correctly loaded
                            
                            if (!playerIdText && font) {
                                // Only create new text if it doesn't exist and the font is loaded
                                const playerIdMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
                                const playerIdGeometry = new THREE.TextGeometry(formatPlayerId(data.playerId), {
                                    font: font, 
                                    size: 0.1, // Adjust size as needed
                                    height: 0.02, // Adjust depth of the text
                                    curveSegments: 12,
                                    bevelEnabled: false
                                });
                    
                                playerIdText = new THREE.Mesh(playerIdGeometry, playerIdMaterial);
                                car.playerIdText = playerIdText; // Store reference to update later
                    
                                // Add playerIdText separately, not as a child of the battery
                                car.chassis.object.add(playerIdText); 
                            }
                    
                            if (playerIdText) {
                                // Update the position of the playerId text to be just above the battery
                                const batteryPosition = car.backLightsBattery.object.position; // Get the battery's position
                                playerIdText.position.set(batteryPosition.x, batteryPosition.y - 0.45, batteryPosition.z + 0.3); // Offset on z-axis above the battery
                                playerIdText.rotation.set(1.56, 1.56, 0); // Rotate to horizontal display
                            }
                    
                        } else {
                            console.error("We cannot find the battery object");
                        }
                    }                                                  

                    if (data.wheels) {
                        data.wheels.forEach((wheelData, index) => {
                            const wheelBody = car.physics[carKey].wheels.bodies[index];
                            wheelBody.position.set(wheelData.position.x, wheelData.position.y, wheelData.position.z);
                            wheelBody.quaternion.set(wheelData.rotation.x, wheelData.rotation.y, wheelData.rotation.z, wheelData.rotation.w);
                            car.physics[carKey].vehicle.wheelInfos[index].rotation = wheelData.rotationAngle;
                            car.physics[carKey].vehicle.wheelInfos[index].brake = wheelData.brake
                        })
                    }
        
                    if (data.controls) {
                        car.controls.actions.left = data.controls.left;
                        car.controls.actions.right = data.controls.right;
                        car.controls.actions.up = data.controls.up;
                        car.controls.actions.down = data.controls.down;
                        car.controls.actions.boost = data.controls.boost;
                        car.controls.actions.brake = data.controls.brake;
                        car.controls.actions.shoot = data.controls.shoot;
        
                        const carSteeringValue = data.controls.steering;
                        car.physics[carKey].vehicle.setSteeringValue(-carSteeringValue, 0);
                        car.physics[carKey].vehicle.setSteeringValue(-carSteeringValue, 1);

                        if (data.controls.boost) {
                            car.createNitroEffect(car.physics[carKey].chassis.body.position, car.physics[carKey].chassis.body.quaternion, car.chassis.object)
                        }
        
                        if (data.controls.up) {
                            car.physics[carKey].vehicle.applyEngineForce(car.physics[carKey].options.controlsAcceleratingSpeed, 2);
                            car.physics[carKey].vehicle.applyEngineForce(car.physics[carKey].options.controlsAcceleratingSpeed, 3);
                        } else if (data.controls.down) {
                            car.physics[carKey].vehicle.applyEngineForce(-car.physics[carKey].options.controlsAcceleratingSpeed, 2);
                            car.physics[carKey].vehicle.applyEngineForce(-car.physics[carKey].options.controlsAcceleratingSpeed, 3);
                            car.backLightsReverse.material.opacity = data.controls.down ? 1 : 0.5;
                        } else {
                            car.physics[carKey].vehicle.applyEngineForce(0, 2);
                            car.physics[carKey].vehicle.applyEngineForce(0, 3);
                        }
        
                        if (data.controls.brake) {
                            car.physics[carKey].vehicle.setBrake(car.physics[carKey].options.controlsBrakeStrength, 0);
                            car.physics[carKey].vehicle.setBrake(car.physics[carKey].options.controlsBrakeStrength, 1);
                            car.physics[carKey].vehicle.setBrake(car.physics[carKey].options.controlsBrakeStrength, 2);
                            car.physics[carKey].vehicle.setBrake(car.physics[carKey].options.controlsBrakeStrength, 3);

                            car.backLightsBrake.material.opacity = data.controls.brake ? 1 : 0.5;

                        } else {
                            car.physics[carKey].vehicle.setBrake(0, 0);
                            car.physics[carKey].vehicle.setBrake(0, 1);
                            car.physics[carKey].vehicle.setBrake(0, 2);
                            car.physics[carKey].vehicle.setBrake(0, 3);
                        }
                    }
                    
                    if (car.backLightsBattery) {
                        const batteryLevelWidth = car.battery / 100;
                        car.backLightsBattery.object.children.forEach(child => {
                            child.material = car.battery === 100 ? car.backLightsBattery.materialWhite : car.backLightsBattery.materialRed;
                            child.scale.set(batteryLevelWidth, 0.41, 0.41);
                            child.material.opacity = 1;
                        });
                    } else {
                        console.error("Cannot find the battery object");
                    }
                };
        
                const removePlayerCar = (playerId) => {
                    const removedPlayerCar = this.otherPlayers[playerId];
        
                    if (removedPlayerCar) {
                        const carKey = removedPlayerCar instanceof Car ? 'car' :
                                       removedPlayerCar instanceof Car1 ? 'car1' :
                                       removedPlayerCar instanceof Car2 ? 'car2' :
                                       removedPlayerCar instanceof Car3 ? 'car3' :
                                       removedPlayerCar instanceof Car4 ? 'car4' :
                                       removedPlayerCar instanceof Car5 ? 'car5' :
                                       removedPlayerCar instanceof Car6 ? 'car6' :
                                       removedPlayerCar instanceof Car7 ? 'car7' :
                                       removedPlayerCar instanceof Car8 ? 'car8' :
                                       removedPlayerCar instanceof Car9 ? 'car9' :
                                       removedPlayerCar instanceof Car10 ? 'car10' :
                                       removedPlayerCar instanceof Car11 ? 'car11' :
                                       removedPlayerCar instanceof Car12 ? 'car12' :
                                       removedPlayerCar instanceof Car13 ? 'car13' :
                                       removedPlayerCar instanceof Car14 ? 'car14' :
                                       removedPlayerCar instanceof Car15 ? 'car15' :
                                       removedPlayerCar instanceof Car16 ? 'car16' :
                                       removedPlayerCar instanceof Car17 ? 'car17' :
                                       removedPlayerCar instanceof Car18 ? 'car18' :
                                       removedPlayerCar instanceof Car19 ? 'car19' : 'car20';

                        this.physics.world.removeBody(removedPlayerCar.physics[carKey].chassis.body);
                        // this.container.remove(removedPlayerCar.container)
                        // removedPlayerCar.physics[carKey].destroy();
                    }
        
                    delete this.physics.cars[playerId];
                    delete this.otherPlayers[playerId];
                    this.removeFromMiniMap(playerId);
                    console.log(`Player ${playerId} removed`);
                };
        
            } catch (error) {
                console.error('Error in setupMultiplayer:', error);
            }
        };

    // Create the mini-map
    createMiniMap() {

        if (typeof window !== 'undefined') {
            // Function to determine if the display is vertical or horizontal
            this.isVerticalDisplay = () => window.innerHeight > window.innerWidth;
        }

        const miniMap = document.createElement('div');
        miniMap.id = 'mini-map';
        miniMap.style.position = 'absolute';
        miniMap.style.top = '15px';
        miniMap.style.left = '181px';
        // miniMap.style.right = '20px';
        miniMap.style.width = '110px';
        miniMap.style.height = '100px';
        miniMap.style.borderRadius = '5px';
        miniMap.style.backdropFilter = 'blur(10px)';
        // miniMap.style.border = '1px solid white';
        miniMap.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        document.body.appendChild(miniMap);

        this.miniMap = miniMap;
        this.miniMapElements = {}; // Store references to mini-map elements
    }

    // Update the mini-map with player positions
    updateMiniMap(playerId, x, y, rotation, isOtherPlayer) {
        if (!this.miniMapElements[playerId]) {
            const newPlayerElement = document.createElement('div');
            newPlayerElement.id = `player-${playerId}`;
            newPlayerElement.style.position = 'absolute';
            newPlayerElement.style.width = '8px';
            newPlayerElement.style.height = '8px';
            newPlayerElement.style.backgroundColor = isOtherPlayer ? '#FF5733' : 'white';
            newPlayerElement.style.transformOrigin = 'center center';
            this.miniMap.appendChild(newPlayerElement);
            this.miniMapElements[playerId] = newPlayerElement;
        }

        const miniMapSize = 100; // The size of the mini-map in pixels
        const mapScale = 0.05; // Scale factor to convert world coordinates to mini-map coordinates

        const mapX = miniMapSize / 2 + x * mapScale;
        const mapY = miniMapSize / 2 - y * mapScale;

        const playerElementToUpdate = this.miniMapElements[playerId];
        playerElementToUpdate.style.left = `${mapX}px`;
        playerElementToUpdate.style.top = `${mapY}px`;

        // Calculate the rotation angle in degrees and apply it to the mini-map element
        const angle = rotation.y * (180 / Math.PI); // Convert radians to degrees
        playerElementToUpdate.style.transform = `rotate(${angle}deg)`;
    }

    // Remove player from the mini-map
    removeFromMiniMap(playerId) {
        const playerElement = this.miniMapElements[playerId];
        if (playerElement) {
            this.miniMap.removeChild(playerElement);
            delete this.miniMapElements[playerId];
        }
    }

    // createToggleButton() {
    //     const button = document.createElement('button');
    //     button.innerHTML = 'Toggle Map';
    //     button.style.position = 'fixed';
    //     button.style.top = '10px';
    //     button.style.right = '10px';
    //     button.style.zIndex = 1000; // Ensure the button is on top
    //     document.body.appendChild(button);

    //     button.addEventListener('click', () => {
    //         this.toggleMiniMap();
    //     });
    // }

    // toggleMiniMap() {
    //     const mapElement = document.getElementById('mini-map');
    //     if (mapElement) {
    //         if (mapElement.style.display === 'none') {
    //             mapElement.style.display = 'block';
    //         } else {
    //             mapElement.style.display = 'none';
    //         }
    //     }
    // }
    
    
    // Function to update battery status in HTML
    updateBatteryStatus(battery) {
        const batteryStatusElement = document.getElementById('battery-status');

        if (batteryStatusElement) {
            const batteryPercentageElement = document.getElementById('battery-percentage');
            const batteryBar = batteryStatusElement.querySelector('.battery-bar');
            if (batteryBar) {
                // Set the width of the battery bar based on the battery percentage
                batteryBar.style.width = `${battery}%`;
                batteryPercentageElement.textContent = `${battery}%`;
            }
        }
    }

    updateBatteryPosition() {
        if (this.batteryVector && this.backLightsBattery.object) {
            this.batteryVector.copy(this.backLightsBattery.object.position);
        }
    }

    // Function to update battery status in HTML
    updateScoreStatus(score) {
        const scoreElement= document.getElementById('coin-market');
        scoreElement.textContent = `❖ ${score}`;
    }

    // Function to detect MetaMask
    // async detectEthereumProvider() {
    //     if (typeof window.ethereum !== 'undefined') {
    //         return window.ethereum;
    //     } else {
    //         throw new Error('Ethereum provider not found');
    //     }
    // }

    async signIn(playerId) {

        // Use playerId passed in or fallback to the one stored in class
        const id = playerId || this.playerId;

        try {
            // Ensure playerId is provided (from WalletConnect)
            if (!id) {
                throw new Error('No playerId found. Please ensure the wallet is connected.');
            }
    
            // Store the playerId in localStorage
            localStorage.setItem('playerId', playerId);
    
            // Format playerId for display
            const formatPlayerId = (playerId) => {
                const firstPart = playerId.substring(0, 4);
                const lastPart = playerId.substring(playerId.length - 4);
                return `${firstPart}...${lastPart}`;
            };
    
            // Update UI with player information
            const userDisplay = document.getElementById('userDisplay');
            const batteryStatus = document.getElementById('battery-status');
            const scoreElement = document.getElementById('score-status');
            const coinMarket = document.getElementById('coin-market');
            const inviteButton = document.getElementById('invite-button');
            const tradeButton = document.getElementById('trade-button');

            inviteButton.innerText = 'INVITE';
            tradeButton.innerText = 'TRADE';
            
            if (userDisplay) {
                userDisplay.innerHTML = formatPlayerId(playerId);
                batteryStatus.style.opacity = 1;
                scoreElement.style.opacity = 1;
                coinMarket.style.opacity = 1;
                inviteButton.style.opacity = 1;
                tradeButton.style.opacity = 1;
            }
    
            // Request token from your server using `playerId`
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
    
            const { token } = await response.json();  // Extract token from response
            localStorage.setItem('token', token);  // Store token in localStorage
    
            // Retrieve the token from localStorage for WebSocket connection
            const savedToken = localStorage.getItem('token');
            console.log('Token:', savedToken);
    
            // Call setupMultiplayer and pass playerId and token
            await this.setupMultiplayer(playerId, savedToken);
    
            return playerId;
        } catch (error) {
            console.error('Error signing in:', error);
            alert('Sign-in failed. Please ensure the wallet is connected and try again.');
        }
    }    
    

  setReveal()
  {
      this.reveal = {}
      this.reveal.matcapsProgress = 0
      this.reveal.floorShadowsProgress = 0
      this.reveal.previousMatcapsProgress = null
      this.reveal.previousFloorShadowsProgress = null

      // Go method
      this.reveal.go = () =>
      {
          gsap.fromTo(this.reveal, 3, { matcapsProgress: 0 }, { matcapsProgress: 1 })
          gsap.fromTo(this.reveal, 3, { floorShadowsProgress: 0 }, { floorShadowsProgress: 1, delay: 0.5 })
          gsap.fromTo(this.shadows, 3, { alpha: 0 }, { alpha: 0.5, delay: 0.5 })

          if(this.sections.intro)
          {
              gsap.fromTo(this.sections.intro.instructions.arrows.label.material, 0.3, { opacity: 0 }, { opacity: 1, delay: 0.5 })
              if(this.sections.intro.otherInstructions)
              {
                  gsap.fromTo(this.sections.intro.otherInstructions.label.material, 0.3, { opacity: 0 }, { opacity: 1, delay: 0.75 })
              }
          }

          // Car
          this.physics.car.chassis.body.sleep()
          this.physics.car.chassis.body.position.set(0, 0, 12)

        if (typeof window !== 'undefined') {
          window.setTimeout(() =>
          {
              this.physics.car.chassis.body.wakeUp()
              this.physics.car.chassis.body.battery = 100;
          }, 300)
        }

          // Sound
        //   gsap.fromTo(this.sounds.engine.volume, 0.5, { master: 0 }, { master: 0.7, delay: 0.3, ease: Power2.easeIn })
          if (typeof window !== 'undefined') {

                window.setTimeout(() =>
                {
                    this.sounds.play('reveal')
                }, 400)
            }

          // Controls
          if(this.controls.touch)
          {
            if (typeof window !== 'undefined') {
                window.setTimeout(() =>
                {
                    this.controls.touch.reveal()
                }, 400)
            }
          }
      }
      
      if (userDisplay) {
        userDisplay.style.opacity = 1;
    }

      // Time tick
      this.time.on('tick',() =>
      {
          // Matcap progress changed
          if(this.reveal.matcapsProgress !== this.reveal.previousMatcapsProgress)
          {
              // Update each material
              for(const _materialKey in this.materials.shades.items)
              {
                  const material = this.materials.shades.items[_materialKey]
                  material.uniforms.uRevealProgress.value = this.reveal.matcapsProgress
              }

              // Save
              this.reveal.previousMatcapsProgress = this.reveal.matcapsProgress
          }

          // Matcap progress changed
          if(this.reveal.floorShadowsProgress !== this.reveal.previousFloorShadowsProgress)
          {
              // Update each floor shadow
            //   for(const _mesh of this.objects.floorShadows)
            //   {
            //       _mesh.material.uniforms.uAlpha.value = this.reveal.floorShadowsProgress
            //   }

              // Save
              this.reveal.previousFloorShadowsProgress = this.reveal.floorShadowsProgress
          }
      })

      // Debug
      if(this.debug)
      {
          this.debugFolder.add(this.reveal, 'matcapsProgress').step(0.0001).min(0).max(1).name('matcapsProgress')
          this.debugFolder.add(this.reveal, 'floorShadowsProgress').step(0.0001).min(0).max(1).name('floorShadowsProgress')
          this.debugFolder.add(this.reveal, 'go').name('reveal')
      }
  }
    

    setStartingScreen()
    {
        this.startingScreen = {}

        // Area
        this.startingScreen.area = this.areas.add({
            position: new THREE.Vector2(0, 0),
            halfExtents: new THREE.Vector2(2.5, 2.5),
            hasKey: false,
            testCar: false,
            active: false
        })

        this.startingScreen.area.floorBorder.material.uniforms.uAlpha.value = 0

        // Loading line
        this.startingScreen.loadingLine = {}
        this.startingScreen.loadingLine.geometry = new THREE.PlaneGeometry(0, 0.1) // Initial width is 0, adjust height to be a thin line
        this.startingScreen.loadingLine.material = new THREE.MeshBasicMaterial({ color: 0xffffff })
        this.startingScreen.loadingLine.mesh = new THREE.Mesh(this.startingScreen.loadingLine.geometry, this.startingScreen.loadingLine.material)
        this.startingScreen.loadingLine.mesh.position.set(0, -1, 0) // Adjust position if needed
        this.startingScreen.loadingLine.mesh.rotation.set(0, 0, 0.65) 
        this.container.add(this.startingScreen.loadingLine.mesh)

        // Percentage label
        this.startingScreen.percentageLabel = document.createElement('div')
        this.startingScreen.percentageLabel.style.position = 'absolute'
        this.startingScreen.percentageLabel.style.color = '#ffffff'
        this.startingScreen.percentageLabel.style.top = '50%'
        this.startingScreen.percentageLabel.style.left = '50%'
        this.startingScreen.percentageLabel.style.transform = 'translate(-50%, -50%)'
        this.startingScreen.percentageLabel.style.fontSize = '50px'
        this.startingScreen.percentageLabel.style.fontFamily = 'Orbitron, sans-serif'
        document.body.appendChild(this.startingScreen.percentageLabel)

        // Start label
        this.startingScreen.startLabel = {}
        this.startingScreen.startLabel.geometry = new THREE.PlaneGeometry(2, 6 / 3)
        this.startingScreen.startLabel.image = new Image()
        this.startingScreen.startLabel.image.src = 'data:image/png;base64,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'
        this.startingScreen.startLabel.texture = new THREE.Texture(this.startingScreen.startLabel.image)
        this.startingScreen.startLabel.texture.magFilter = THREE.NearestFilter
        this.startingScreen.startLabel.texture.minFilter = THREE.LinearFilter
        this.startingScreen.startLabel.texture.needsUpdate = true
        this.startingScreen.startLabel.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff, alphaMap: this.startingScreen.startLabel.texture })
        this.startingScreen.startLabel.material.opacity = 0
        this.startingScreen.startLabel.mesh = new THREE.Mesh(this.startingScreen.startLabel.geometry, this.startingScreen.startLabel.material)
        this.startingScreen.startLabel.mesh.matrixAutoUpdate = false

        this.container.add(this.startingScreen.startLabel.mesh)

        // Progress
        this.resources.on('progress', (_progress) => {

            // Update percentage label
            this.startingScreen.percentageLabel.innerText = `${Math.round(_progress * 101)}%`

        })

        // Ready
        this.resources.on('ready', () => {
            if (typeof window !== 'undefined') {

                window.requestAnimationFrame(() => {
                    this.startingScreen.area.activate()

                    gsap.to(this.startingScreen.loadingLine.material, 0.3, { opacity: 0 })
                    this.startingScreen.loadingLine.mesh.visible = false
                    gsap.to(this.startingScreen.startLabel.material, 0.3, { opacity: 1, delay: 0.3 })
                    
                    // Hide percentage label
                    this.startingScreen.percentageLabel.style.display = 'none'
                })
            }
        })

        // On interact, reveal
        this.startingScreen.area.on('interact', () => {

            const loadingLayer = document.getElementById('loading-layer');
            const w3mLayer = document.getElementById('w3m-layer');

            if (loadingLayer) {
                loadingLayer.style.display = 'none';
            }

            if (w3mLayer) {
                w3mLayer.style.display = 'none';
            }

            this.startingScreen.area.deactivate()
            
            // Hide the loading line
            this.startingScreen.loadingLine.mesh.visible = false

            gsap.to(this.startingScreen.startLabel.material, 0.3, { opacity: 0, delay: 0.4 })

            this.start()

            if (typeof window !== 'undefined') {
                window.setTimeout(() => {
                    this.reveal.go()
                }, 600)
            }
        })
    }

    setSounds()
    {
        this.sounds = new Sounds({
            debug: this.debugFolder,
            time: this.time
        })
    }

    setAxes()
    {
        this.axis = new THREE.AxesHelper()
        this.container.add(this.axis)
    }

    setControls()
    {
        this.controls = new Controls({
            config: this.config,
            sizes: this.sizes,
            time: this.time,
            camera: this.camera,
            sounds: this.sounds
        })
    }

    setMaterials()
    {
        this.materials = new Materials({
            resources: this.resources,
            debug: this.debugFolder
        })
    }

    setFloor()
    {
        this.floor = new Floor({
            debug: this.debugFolder
        })

        this.container.add(this.floor.container)
    }

    setShadows()
    {
        this.shadows = new Shadows({
            time: this.time,
            debug: this.debugFolder,
            renderer: this.renderer,
            camera: this.camera
        })
        this.container.add(this.shadows.container)
    }

    setPhysics()
    {
        this.physics = new Physics({
            config: this.config,
            debug: this.debug,
            time: this.time,
            sizes: this.sizes,
            controls: this.controls,
            sounds: this.sounds,
            physics: this.physics,
            worldId: this.worldId,
            carClass: this.carClass,
            ws: this.ws
        })
        this.container.add(this.physics.models.container)
    }
    

    setZones()
    {
        this.zones = new Zones({
            time: this.time,
            physics: this.physics,
            debug: this.debugFolder
        })
        this.container.add(this.zones.container)
    }

    setAreas()
    {
        this.areas = new Areas({
            config: this.config,
            resources: this.resources,
            debug: this.debug,
            renderer: this.renderer,
            camera: this.camera,
            car: null,
            sounds: this.sounds,
            time: this.time,
            cars: [this.car, this.car1, this.car2]
        })
        this.container.add(this.areas.container)
    }

    setTiles()
    {
        this.tiles = new Tiles({
            resources: this.resources,
            objects: this.objects,
            debug: this.debug
        })
    }

    setWalls()
    {
        this.walls = new Walls({
            resources: this.resources,
            objects: this.objects
        })
    }

    setObjects()
    {
        this.objects = new Objects({
            time: this.time,
            resources: this.resources,
            materials: this.materials,
            physics: this.physics,
            shadows: this.shadows,
            sounds: this.sounds,
            debug: this.debugFolder
        })
        this.container.add(this.objects.container)

    }


    setSections()
    {
        this.sections = {}

        // Generic options
        const options = {
            config: this.config,
            time: this.time,
            resources: this.resources,
            camera: this.camera,
            passes: this.passes,
            objects: this.objects,
            areas: this.areas,
            zones: this.zones,
            walls: this.walls,
            tiles: this.tiles,
            debug: this.debugFolder
        }

        // Intro
        this.sections.intro = new IntroSection({
            ...options,
            x: 0,
            y: 0
        })
        this.container.add(this.sections.intro.container)

        // Intro Part
        this.sections.introPart = new IntroPartSection({
            ...options,
            x: 0,
            y: 0
        })
        this.container.add(this.sections.introPart.container)

        // Intro Guest
        // this.sections.introGuest = new IntroGuestSection({
        //     ...options,
        //     x: 0,
        //     y: 0
        // })
        // this.container.add(this.sections.introGuest.container)

        // Crossroads
        this.sections.crossroads = new CrossroadsSection({
            ...options,
            x: 0,
            y: - 30
        })
        this.container.add(this.sections.crossroads.container)

        // Information
        this.sections.information = new InformationSection({
            ...options,
            x: 1.2,
            y: - 55
            // x: 0,
            // y: - 10
        })
        this.container.add(this.sections.information.container)

        // Playground
        this.sections.playground = new PlaygroundSection({
            ...options,
            x: 0,
            y: 0
            // x: - 15,
            // y: - 4
        })
        this.container.add(this.sections.playground.container)
    }

}
