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
import CrossroadsSection from './Sections/CrossroadsSection.js'
import InformationSection from './Sections/InformationSection.js'
import PlaygroundSection from './Sections/PlaygroundSection.js'
import Controls from './Controls.js'
import Controls1 from './Controls1.js'
import Sounds from './Sounds.js'
const videoAdsSource = 'images/videos/video.mp4';
const videoAdSource = 'images/videos/kyberscrolling.mp4';
import feather from 'feather-icons'
import LazyLoad from 'react-lazy-load';
import interact from 'interactjs'

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

        this.ws = _options.ws
        this.playerId = _options.playerId;
        this.worldId = _options.worldId;
        this.token = _options.token;
        this.carName = _options.carName;
        this.matcaps = _options.matcaps;
        this.otherPlayers = [];
        this.otherPlayerSelectedCars = {};
        this.playerScores = {};
        this.friends = [];
        this.bullets = [];
        this.partyLeaderId = null;

        this.messageQueue = [];
        
        this.lastKnownPositions = {};
        this.coinActive = false;

        this.messengerVisible = false;

        this.peerConnections = {};
        this.localStream = null;
        this.timerInterval = null;

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

    animateScoreGain = (car) => {
        if (!car || car.__removing) return;

        const target = car.container || car.chassis?.object;
        if (!target) return;

        gsap.killTweensOf(target.scale);
        gsap.to(target.scale, {
            duration: 0.12,
            x: 1.08,
            y: 1.08,
            z: 1.08,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1
        });

        target.traverse((child) => {
            if (!child || !child.material) return;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
                if (!mat || !('emissive' in mat)) return;
                const originalIntensity = typeof mat.emissiveIntensity === 'number' ? mat.emissiveIntensity : 1;
                gsap.killTweensOf(mat);
                gsap.fromTo(
                    mat,
                    { emissiveIntensity: originalIntensity + 1.25 },
                    {
                        duration: 0.25,
                        emissiveIntensity: originalIntensity,
                        ease: 'power2.out'
                    }
                );
            });
        });
    };

    getCarByPlayerId = (playerId) => {
        if (!playerId) return null;
        if (playerId === this.playerId) return this.car || null;
        return this.otherPlayers?.[playerId] || null;
    };

    playCarDestroyedFx = (car, durationMs = 5000) => {
        if (!car) return;
        const target = car.container || car.chassis?.object;
        if (!target) return;

        if (typeof car.createCrashEffect === 'function' && car.chassis?.object) {
            car.createCrashEffect(car.chassis.object.position, car.chassis.object.quaternion, car.chassis.object);
        }

        gsap.killTweensOf(target.scale);
        gsap.to(target.scale, {
            duration: 0.25,
            x: 0.72,
            y: 0.72,
            z: 0.72,
            ease: 'power2.out'
        });

        target.traverse((child) => {
            if (!child || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat) => {
                if (!mat) return;
                mat.transparent = true;
                gsap.fromTo(mat, { opacity: 1 }, { duration: 0.22, opacity: 0.35, yoyo: true, repeat: 4, ease: 'power1.inOut' });
            });
        });
    };

    playCarRestoreFx = (car) => {
        if (!car) return;
        const target = car.container || car.chassis?.object;
        if (!target) return;

        if (typeof car.createSparkEffect === 'function') {
            car.createSparkEffect();
        }

        gsap.killTweensOf(target.scale);
        gsap.fromTo(
            target.scale,
            { x: 0.8, y: 0.8, z: 0.8 },
            { duration: 0.35, x: 1, y: 1, z: 1, ease: 'back.out(2.2)' }
        );

        target.traverse((child) => {
            if (!child || !child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat) => {
                if (!mat) return;
                mat.transparent = true;
                gsap.to(mat, { duration: 0.3, opacity: 1, ease: 'power2.out' });
            });
        });
    };

    applyRandomMatcapsIfMissing = () => {
        const hasMatcaps = this.matcaps && typeof this.matcaps === 'object' && Object.keys(this.matcaps).length > 0;
        if (hasMatcaps) return;

        const pool = ['black', 'metal', 'blueGlass', 'volcano', 'amazon', 'blacksea', 'elevator'];
        const pick = () => pool[Math.floor(Math.random() * pool.length)];
        this.matcaps = {
            chassis: pick(),
            chassisbottom: pick(),
            wheels: pick(),
            window: pick(),
            spoiler: pick()
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem('matcaps', JSON.stringify(this.matcaps));
        }
    };

    getCarKey = (car) => {
        if (!car || !car.physics) return null;
        if (car.physics.car?.chassis?.body) return 'car';

        for (let i = 1; i <= 20; i++) {
            const key = `car${i}`;
            if (car.physics[key]?.chassis?.body) return key;
        }

        return null;
    };

    getCarBody = (car) => {
        const key = this.getCarKey(car);
        if (!key) return null;
        return car.physics[key]?.chassis?.body || null;
    };

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
        this.clockContainer.position.set(0, 0, 0); // Set the clock at (0, 0, 0)

        // Import and apply material to hands, and store them for updating later
        this.hourHand = this.importAndApplyHandMaterial(
            this.resources.items.clockHourBase.scene, 
            5, 0.8, this.materials.shades.items.blueGlass
        ); // Hour hand
        
        this.minuteHand = this.importAndApplyHandMaterial(
            this.resources.items.clockMinuteBase.scene, 
            7, 0.5, this.materials.shades.items.blueGlass
        ); // Minute hand

        this.secondHand = this.importAndApplyHandMaterial(
            this.resources.items.clockSecondBase.scene, 
            9, 0.3, this.materials.shades.items.volcano
        ); // Second hand

        // Ensure hands start at (0, 0, 0) and rotate around the center
        this.hourHand.position.set(0, 0, 0.05);
        this.minuteHand.position.set(0, 0, 0.06);
        this.secondHand.position.set(0, 0, 0.07);
    }

    /**
     * Helper method to import hand objects and apply material
     * @param {THREE.Object3D} handObject - Imported 3D hand model
     * @param {Number} length - Length of the hand (to scale)
     * @param {Number} width - Width of the hand (to scale)
     * @param {THREE.Material} material - Material to apply
     * @returns {THREE.Object3D} - The hand object with material applied and positioned correctly
     */
    importAndApplyHandMaterial(handObject, length, width, material) {
        const scaleFactor = length / 5; // Scale hand based on length
        handObject.scale.set(scaleFactor, scaleFactor, scaleFactor); // Scale to match custom hand size

        handObject.traverse((child) => {
            if (child.isMesh) {
                child.material = material; // Apply blueGlass material
            }
        });

        // Adjust the position for the hand’s pivot to be at the bottom, centered for rotation
        handObject.position.y = length / 2; // This makes it rotate from the bottom like a real clock hand

        // Add the hand to the clock container
        this.clockContainer.add(handObject);

        return handObject; // Return the hand object so it can be updated later
    }

    /**
     * Method to update the clock based on real time
     */
    updateClock() {
        const now = new Date();
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours() % 12;

        // Update rotation for each hand based on time
        if (this.secondHand && this.minuteHand && this.hourHand) {
            this.secondHand.rotation.z = -((seconds / 60) * Math.PI * 2); // Full rotation in 60 seconds
            this.minuteHand.rotation.z = -((minutes / 60) * Math.PI * 2); // Full rotation in 60 minutes
            this.hourHand.rotation.z = -((hours / 12) * Math.PI * 2 + (minutes / 720) * Math.PI * 2); // 12-hour rotation with minute adjustment
        } else {
            console.log("Clock hands are not found");
        }
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
            const localBody = this.getCarBody(this.car);
            const remoteBody = this.getCarBody(car);
            if (!localBody || !remoteBody) return;
            const distance = localBody.position.distanceTo(remoteBody.position);
    
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
            // targetElement.innerText = '⫷⫸'
            targetElement.innerText = 'TARGET'
        }
    }

    start() {
        this.signIn(this.playerId, this.token);

        if (typeof window !== 'undefined') {
            window.setTimeout(() => {
                this.camera.pan.enable();
            }, 2000);
        }

        this.setAds();
        this.setCityTour();
        this.setMaterials();
        this.setShadows();
        this.setZones();
        this.setPhysics();
        this.setObjects();
        this.setTiles();
        this.setWalls();
        this.setSections();

        this.setupMultiplayer(this.playerId, this.token, this.carName, this.matcaps);

        this.createMiniMap();
        this.setReveal();
        this.setClock();
        this.partyToggle();
    }

    setCar(carName, matcaps) {
        console.log("This car car name", carName)

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
            score: this.score || 0,
            ws: this.ws,
            isRemotePlayer: false,
            carName: this.carName,
            matcaps: this.matcaps
        });
        this.container.add(this.car.container);
        this.updateBatteryStatus(this.car.battery);
        console.log("This car car name", this.car.carName)
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
        videoPlane.position.set(-25.0363, -30.8, 1.2); // Adjust the position as needed
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

    setCityTour() {
        // Create a video element
        const video = document.createElement('video');
        video.src = videoAdSource; // Replace with your video source
        video.id = 'video-ad';
        video.crossOrigin = 'anonymous';
        video.playsInline = true;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.style = 'display: none'; // Hide the video element itself
    
        // Append the video to the DOM
        document.body.appendChild(video);
    
        // Create a VideoTexture from the video element
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;
    
        // Plane dimensions
        const planeWidth = 1190; // Covers the world size
        const planeHeight = 180;
        const borderCenterZ = 48;
        const roofZ = 84;
    
        // Create the plane geometry
        const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    
        // Create and position the planes
        const planes = [];
    
        // Top and Bottom Panels
        const topBottomMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            side: THREE.DoubleSide,
            toneMapped: false,
        });
    
        // Bottom border
        const bottomPlane = new THREE.Mesh(planeGeometry, topBottomMaterial);
        bottomPlane.position.set(0, -595, borderCenterZ);
        bottomPlane.rotation.x = Math.PI / 2;
        bottomPlane.rotation.y = Math.PI;
        planes.push(bottomPlane);
    
        // Top border
        const topPlane = new THREE.Mesh(planeGeometry, topBottomMaterial);
        topPlane.position.set(0, 595, borderCenterZ);
        topPlane.rotation.x = Math.PI / 2; // Rotate to face the correct direction
        planes.push(topPlane);
    
        // Left and Right Panels
        const sidePlaneGeometry = new THREE.PlaneGeometry(planeHeight, planeWidth); // Swap dimensions for vertical alignment
    
        // Material for the left and right panels
        const sideMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            side: THREE.DoubleSide,
            toneMapped: false,
        });
    
        // Left border
        const leftPlane = new THREE.Mesh(sidePlaneGeometry, sideMaterial.clone());
        leftPlane.material.map = videoTexture.clone(); // Clone the texture for independent transformation
        leftPlane.material.map.center.set(0.5, 0.5); // Set the pivot point for rotation
        leftPlane.material.map.rotation = Math.PI / 2; // Rotate the texture to align correctly
        leftPlane.position.set(-595, 0, borderCenterZ);
        leftPlane.rotation.y = Math.PI / 2; // Align the plane geometry
        planes.push(leftPlane);
    
        // Right border
        const rightPlane = new THREE.Mesh(sidePlaneGeometry, sideMaterial.clone());
        rightPlane.material.map = videoTexture.clone(); // Clone the texture for independent transformation
        rightPlane.material.map.center.set(0.5, 0.5); // Set the pivot point for rotation
        rightPlane.material.map.rotation = -Math.PI / 2; // Rotate the texture to align correctly
        rightPlane.position.set(595, 0, borderCenterZ);
        rightPlane.rotation.y = -Math.PI / 2; // Align the plane geometry
        planes.push(rightPlane);

        // Roof panel to visually close the arena from the top
        const roofPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(planeWidth, planeWidth),
            new THREE.MeshBasicMaterial({
                map: videoTexture,
                side: THREE.DoubleSide,
                toneMapped: false,
                transparent: true,
                opacity: 0.55
            })
        );
        roofPlane.position.set(0, 0, roofZ);
        planes.push(roofPlane);

        // Corner panels so there are no visible gaps at border intersections
        const cornerGeometry = new THREE.PlaneGeometry(planeHeight, planeHeight);
        const cornerConfigs = [
            { x: -595, y: -595, ry: Math.PI / 4 },
            { x: 595, y: -595, ry: -Math.PI / 4 },
            { x: -595, y: 595, ry: -Math.PI / 4 },
            { x: 595, y: 595, ry: Math.PI / 4 }
        ];
        cornerConfigs.forEach((corner) => {
            const cornerPlane = new THREE.Mesh(cornerGeometry, sideMaterial.clone());
            cornerPlane.material.map = videoTexture.clone();
            cornerPlane.position.set(corner.x, corner.y, borderCenterZ);
            cornerPlane.rotation.y = corner.ry;
            planes.push(cornerPlane);
        });
    
        // Add planes to the scene
        planes.forEach(plane => this.container.add(plane));
    
        // Ensure the video textures update on each frame
        this.time.on('tick', () => {
            if (videoTexture && video.readyState >= video.HAVE_CURRENT_DATA) {
                videoTexture.needsUpdate = true;
            }
        });
    }

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

        requestControllerPrefs(playerId) {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'getControllerPrefs',
                    playerId
                }));
            }
        }

        saveControllerPrefs(buttonPositions) {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'saveControllerPrefs',
                    playerId: this.playerId,
                    buttonPositions
                }));
            }
        }

        populateFriendList(friendList) {
            const friendListContainer = document.getElementById('contact-list');
            this.friends = Array.isArray(friendList)
                ? friendList.map((friend) => (
                    typeof friend === 'string'
                        ? { friendId: friend, label: '' }
                        : { friendId: friend.friendId, label: friend.label || '' }
                ))
                : [];
        
            if (friendListContainer) {
                // Find or create the friend list block
                let friendListBlock = document.getElementById('friend-list-block');
                if (!friendListBlock) {
                    friendListBlock = document.createElement('div');
                    friendListBlock.id = 'friend-list-block';
                    friendListBlock.style.cssText = `
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        margin-top: 10px;
                        padding: 10px;
                        gap: 20px;
                        cursor: pointer;
                    `;
                    friendListContainer.appendChild(friendListBlock);
                }
        
                // Clear the friend list block only
                friendListBlock.innerHTML = '';
        
                // Add each friend to the block
                friendList.forEach(friend => {
                    const { friendId, label } = typeof friend === 'string' ? { friendId: friend, label: '' } : friend;
        
                    // Create a container for the friend
                    const friendElement = document.createElement('div');
                    friendElement.classList.add('friend-item');
                    friendElement.style.cssText = `
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        position: relative;
                        width: 100%;
                        padding: 10px;
                        box-shadow: 0 0 2px 1px #FFFFFF;
                        transition: all 0.5s ease-in-out;
                        color: white;
                        cursor: pointer;
                    `;
        
                    const friendText = document.createElement('span');
                    friendText.textContent = `${label || friendId}`;
                    friendText.style.cssText = `
                        font-size: 8px;
                        color: white;
                    `;
        
                    // Add a container for buttons
                    const buttonContainer = document.createElement('div');
                    buttonContainer.style.cssText = `
                        display: none;
                        justify-content: center;
                        align-items: center;
                        position: absolute;
                        background: rgba(0, 0, 0);
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) scale(0);
                        transition: transform 0.5s ease, opacity 0.5s ease; /* Extend animation duration */
                        backdrop-filter: blur(10px) saturate(180%); /* Glassmorphism effect */
                        border-radius: 5px; /* Adjust border-radius */
                        gap: 10px;
                        padding: 10px; /* Add padding for spacing */
                    `;
        
                    // Add a copy button
                    const copyButton = document.createElement('button');
                    copyButton.innerHTML = `${feather.icons['copy'].toSvg({ width: 15, height: 15 })}`;
                    copyButton.style.cssText = `
                        border: none;
                        color: white;
                        padding: 5px 10px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 12px;
                    `;
                    copyButton.onclick = (event) => {
                        navigator.clipboard.writeText(friendId).then(() => {
                            this.showPopup(`Address copied to clipboard.`);
                        }).catch(err => {
                            console.error('Failed to copy text:', err);
                        });
                        event.stopPropagation(); // Prevent hiding when clicking the button
                    };
        
                    // Add a label button
                    const labelButton = document.createElement('button');
                    labelButton.innerHTML = `${feather.icons['tag'].toSvg({ width: 15, height: 15 })}`;
                    labelButton.style.cssText = `
                        border: none;
                        color: white;
                        padding: 5px 10px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 12px;
                    `;
                    labelButton.onclick = (event) => {
                        const newLabel = prompt('Enter a label for this friend:', label || friendId);
                        if (newLabel) {
                            this.updateFriendLabel(friendId, newLabel);
                        }
                        event.stopPropagation(); // Prevent hiding when clicking the button
                    };
        
                    // Add a remove button
                    const removeButton = document.createElement('button');
                    removeButton.innerHTML = `${feather.icons['trash'].toSvg({ width: 15, height: 15 })}`;
                    removeButton.style.cssText = `
                        border: none;
                        color: white;
                        padding: 5px 10px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 12px;
                    `;
                    removeButton.onclick = (event) => {
                        this.removeFriend(friendId, this.ws);
                        event.stopPropagation(); // Prevent hiding when clicking the button
                    };
        
                    // Append buttons to the button container
                    buttonContainer.appendChild(copyButton);
                    buttonContainer.appendChild(labelButton);
                    buttonContainer.appendChild(removeButton);
        
                    // Add event listeners for showing and hiding buttons
                    friendElement.addEventListener('click', () => {
                        // Hide other button containers
                        document.querySelectorAll('.friend-item > div').forEach(container => {
                            container.style.transform = 'translate(-50%, -50%) scale(0)';
                            container.style.opacity = '0';
                            container.style.display = 'none';
                        });
        
                        // Highlight the selected friend-item container
                        setTimeout(() => {
                            friendElement.style.boxShadow = '0 0 2px 1px #808080';
                        }, 50);
        
                        // Show the button container
                        setTimeout(() => {
                            buttonContainer.style.transform = 'translate(-50%, -50%) scale(0)';
                            buttonContainer.style.display = 'flex';
                            buttonContainer.style.opacity = '1'; // Fade in
                            setTimeout(() => {
                                buttonContainer.style.transform = 'translate(-50%, -50%) scale(1.25)';
                            }, 10); // Match the transition duration
                        }, 0);
                    });
        
                    document.addEventListener('click', (event) => {
                        if (!friendElement.contains(event.target)) {
                            // Reset the button container
                            buttonContainer.style.transform = 'translate(-50%, -50%) scale(0)';
                            buttonContainer.style.opacity = '0'; // Fade out
                            setTimeout(() => {
                                buttonContainer.style.display = 'none'; // Ensure it's hidden after animation
                            }, 500); // Match the transition duration
        
                            // Reset the box shadow of the friend-item container
                            friendElement.style.boxShadow = '0 0 2px 1px #FFFFFF';
                        }
                    });

                    // Set the display text based on the label
                    if (label) {
                        friendText.textContent = `${label}`; // Show label only if it exists
                    } else {
                        friendText.textContent = `${friendId}`; // Show friendId if no label is set
                    }
                    friendText.style.cssText = `
                        font-size: 10px;
                        color: white;
                        margin-left: 10px; /* Optional spacing */
                    `;
        
                    // Append elements
                    friendElement.appendChild(friendText);
                    friendElement.appendChild(buttonContainer);
                    friendListBlock.appendChild(friendElement);
                });
            }
        }

        isAlreadyLinked(targetPlayerId) {
            if (!targetPlayerId || !Array.isArray(this.friends)) return false;
            return this.friends.some((friend) => {
                const friendId = typeof friend === 'string' ? friend : friend?.friendId;
                return friendId === targetPlayerId;
            });
        }        
        
        updateFriendLabel(friendId, label) {
            const updateRequest = {
                type: 'updateFriendLabel',
                playerId: this.playerId,
                friendId,
                label,
            };
        
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(updateRequest));
                console.log(`Requested to update label for friend ${friendId} to '${label}'`);
            } else {
                console.error('WebSocket is not open or undefined.');
            }
        }        
        
        requestFriendListUpdate() {
            const updateRequest = {
                type: 'updateFriendList',
                playerId: this.playerId
            };
        
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(updateRequest));
                console.log('Requested friend list update from the server.');
            } else {
                console.error('WebSocket is not open. Unable to request friend list update.');
            }
        }  

        removeFriend(friendId, ws) {
            const removeRequest = {
                type: 'removeFriend',
                playerId: this.playerId,
                friendId: friendId
            };

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(removeRequest));
                console.log(`Requested to remove friend ${friendId}`);

                // Request updated friend list
                this.requestFriendListUpdate();

            } else {
                console.error('WebSocket is not open or undefined.');
            }

        }

        clearPartyState() {
            this.inParty = false;
            this.isPartyLeader = false;
            this.partyLeaderId = null;
            this.partyMembers = [];
            this.clearChatContainer();
            this.hideChatContainer();
            this.updateToggleButtonVisibility(this.inParty);
            this.updateInviteButtonState();
        
            const partyInfoElement = document.getElementById('party-info');
            if (partyInfoElement) {
                partyInfoElement.innerHTML = '';
                // partyInfoElement.style.display = 'none'; // Hide the party-info UI
            }
        
            // Additional clear logic for other players
            if (this.otherPlayers) {
                Object.keys(this.otherPlayers).forEach(playerId => {
                    if (this.partyMembers.includes(playerId)) {
                        delete this.otherPlayers[playerId];
                    }
                });
            }
        
            // Clear physics non-collidable pairs
            if (this.physics) {
                this.physics.nonCollidablePlayers.clear();
            }
        
            console.log('Party state cleared');
        }

        setupWebSocketHandlers(ws) {

            ws.onopen = () => {

                // Maintain a cache of used nonces
                // this.usedNonces = new Set();

                // // Add a cleanup mechanism for nonces
                // setInterval(() => {
                //     const now = Date.now();
                //     for (const nonce of this.usedNonces) {
                //         if (nonce.timestamp < now - 5000) {
                //             this.usedNonces.delete(nonce);
                //         }
                //     }
                // }, 5000);

                // Clear old party state in case the player was previously in a party
                this.inParty = false;
                this.partyMembers = [];
                this.isPartyLeader = false;
                this.partyLeaderId = null;
                this.updateInviteButtonState();

                ws.send(JSON.stringify({
                    type: 'join',
                    playerId: this.playerId,
                    worldId: this.worldId,
                    selectedCar: this.carName || null,
                    matcaps: this.matcaps || {}
                }));
                console.log('Connected to WebSocket server with worldId', this.worldId);

                // Request the player's score from the server
                this.requestPlayerScore(this.playerId);

                // Send a request to the server to get the friend list for the player
                const getContact = {
                    type: 'getFriends',
                    playerId: this.playerId
                };

                ws.send(JSON.stringify(getContact));
                this.requestControllerPrefs(this.playerId);

                while (this.messageQueue.length > 0) {
                    ws.send(JSON.stringify(this.messageQueue.shift()));
                }
            };
    
            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);

                // Validate timestamp and nonce early to catch potential replay attacks
                const now = Date.now();
                // const { timestamp, nonce } = message;

                // Validate timestamp
                // if (Math.abs(now - timestamp) > 5000) {
                //     console.error('Replay attack detected: Invalid timestamp.');
                //     return;
                // }

                // // Validate nonce
                // if (this.usedNonces.has(nonce)) {
                //     console.error('Replay attack detected: Nonce already used.');
                //     return;
                // }

                // // Store nonce to prevent reuse
                // this.usedNonces.add(nonce);

                if (message.type === 'playerCount') {
                    // Safely access the element and update its text content
                    const playerCountElement = document.getElementById('playerCountDisplay');
                    if (playerCountElement) {
                        playerCountElement.innerText = `${message.count}`;
                    } else {
                        console.warn('playerCountDisplay element not found');
                    }
                }

                if (message.type === 'friendList') {
                    // Populate the contact list with the retrieved friends
                    this.populateFriendList(message.friends);
                    console.log("Friends", message.friends)
                }

                if (message.type === 'friendListUpdate') {
                    // Populate the contact list with the retrieved friends
                    this.populateFriendList(message.friends);
                    console.log('Friend list updated:', message.friends);
                }

                if (message.type === 'controllerPrefs') {
                    if (typeof window !== 'undefined') {
                        if (message.buttonPositions && typeof message.buttonPositions === 'object') {
                            localStorage.setItem('buttonPositions', JSON.stringify(message.buttonPositions));
                        } else {
                            localStorage.removeItem('buttonPositions');
                        }
                    }
                    if (this.controls && this.controls.touch) {
                        this.controls.updateController();
                    }
                }
    
                switch (message.type) {
                    case 'stateUpdate':
                        // Initialize all existing players' cars
                        message.state.forEach(playerState => {
                            this.playerScores[playerState.playerId] = playerState.score || 0;
                            if (playerState.playerId !== this.playerId) {
                                // const { selectedCar, matcaps } = playerState;
                                this.createOtherPlayerCar(playerState.playerId, playerState);
                            }
                        });
                        break;
    
                    case 'playerJoined':
                            if (message.playerId !== this.playerId) {
                                console.log("Message for other player car", message)
                                // const { selectedCar, matcaps } = message;  // Use default value for matcaps
                                this.createOtherPlayerCar(message.playerId, message.state);
                                this.playerScores[message.playerId] = message?.state?.score || 0;
                            }
                        break;

                    case 'playerSelectionUpdate':
                            if (message.playerId !== this.playerId) {
                                this.createOtherPlayerCar(message.playerId, message);
                            }
                        break;

                    case 'worldFull':
                            console.error(`The world ${message.worldId} is full. Please try joining another world.`);
                            this.showPopup(`The world ${message.worldId} is full. Please try joining another world.`)
                            // Handle world full situation (e.g., prompt the user to join another world or retry)
                            // For example, you might want to retry joining with a different worldId or notify the user
                            break;

                    case 'playerScore':
                            // Update the player's score upon retrieval from the server
                            if (message.playerId === this.playerId) {
                                if (!this.cars[message.playerId]) {
                                    this.cars[message.playerId] = {}; // Initialize if not present
                                }
                                    this.cars[message.playerId].score = message.score;
                                    this.updateScoreStatus(this.cars[message.playerId].score); // Display updated score
                                if(this.cars[message.playerId.score] !== 0) {
                                    // dropAirdrop(this.cars[message.playerId]);
                                } else {
                                    console.log("Player score is 0")
                                }
                            }
                            break;

                    case 'inviteFriendship':
                            console.log(`Received friendship invite from ${message.friendRequestId}`);
                            this.showFriendListPrompt(message.friendRequestId, message.targetPlayerId, ws);
                            break;

                    case 'friendshipResponse':
                            if (message.response === 'yes') {
                                console.log(`${message.playerId} accepted friendship invite from ${message.friendRequestId}`);
                                this.showPopup(`You are now connected with ${message.friendRequestId.slice(0, 6)}`);
                            } else {
                                console.log(`${message.playerId} denied friendship invite from ${message.friendRequestId}`);
                                this.showPopup(`Connection invite denied.`);
                            }
                            break;

                    case 'friendListUpdate':
                            console.log('Friend list updated:', message.friends);
                            this.populateFriendList(message.friends); // Dynamically update the UI
                            break;

                    case 'update':
                        if (message.playerId !== this.playerId) {
                            const remoteSelectedCar = this.normalizeCarName(
                                message.selectedCar ||
                                this.otherPlayerSelectedCars[message.playerId] ||
                                'Kybertruck'
                            );
                            const currentSelectedCar = this.otherPlayerSelectedCars[message.playerId];

                            if (!this.otherPlayers[message.playerId] || currentSelectedCar !== remoteSelectedCar) {
                                this.createOtherPlayerCar(message.playerId, message);
                            }

                            const car = this.otherPlayers[message.playerId];
                            if (car) {
                                const previousScore = this.playerScores[message.playerId] || 0;
                                const nextScore = typeof message.score === 'number' ? message.score : previousScore;
                                this.updateCarState(car, message);
                                if (nextScore > previousScore) {
                                    this.animateScoreGain(car);
                                }
                                this.playerScores[message.playerId] = nextScore;
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

                    case 'coinUpdate':
                            const { position: coinPosition } = message;
                            if (this.currentCoin) {
                                this.currentCoin.position.set(coinPosition.x, coinPosition.y, coinPosition.z);
                            } else {
                                console.log('Coin is not defined')
                            }
                            break;

                    case 'bulletFired':
                            if (message.shooterId !== this.playerId) {
                                const shooterCar = this.otherPlayers[message.shooterId];
                                if (shooterCar) {
                                    shooterCar.createAndShootBullet({
                                        shooterId: message.shooterId,
                                        bulletData: {
                                            shooterId: message.shooterId,
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
                                // this.updateScoreStatus(message.score);
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
                        if (!this.inParty) {
                            console.log(`Received invite from ${message.inviterId}`);
                            this.showInvitePrompt(message.inviterId, message.targetPlayerId, ws);
                        } else {
                            console.log('Already in a party. Ignoring invite.');
                            // alert('You are already in a party and cannot be invited.');
                            this.showPopup('Target player is already in a party and cannot be invited.');
                        }
                        break;

                    case 'inviteResponse':
                        if (message.response === 'yes') {
                            console.log('Invite response received. Adding player to party...');
                            this.addPlayerToParty(message.inviterId, message.playerId);
                        } else {
                            this.showPopup(`Party invite denied.`);
                        }
                        break;

                    case 'partyUpdate':
                        this.inParty = true;
                        this.partyLeaderId = message.party.leader;
                        this.isPartyLeader = message.party.leader === this.playerId;  // Check if current player is the leader
                        console.log(`Party update received. Current player: ${this.playerId}, Party leader: ${message.party.leader}`);
                        console.log(`Is party leader: ${this.isPartyLeader}`);

                        this.updateToggleButtonVisibility(this.inParty);
                        this.updateInviteButtonState();

                        const partyInfo = document.getElementById('party-info');
                        if (partyInfo) {
                            partyInfo.style.opacity = 1;
                            partyInfo.style.display = 'flex';
                        }

                        const messenger = document.getElementById('toggle-lobby');
                        if (messenger && this.inParty) {
                            messenger.style.opacity = 1;
                    
                            // Add event listener to toggle chat visibility
                            messenger.replaceWith(messenger.cloneNode(true));
                            document.getElementById('toggle-lobby').addEventListener('click', () => {
                                this.toggleChatVisibility();
                            });
                        }
                        
                        // Ensure no duplicate players are added
                        const uniqueMembers = new Set([...this.partyMembers, ...message.party.members]);
                        this.partyMembers = Array.from(uniqueMembers); // Deduplicate members

                        // Remove the player who left from the local list
                        this.partyMembers = this.partyMembers.filter(memberId => message.party.members.includes(memberId));
                        
                        this.updatePartyUI(message.party.leader, this.partyMembers, this.physics, ws);

                        // Handle the party call button functionality
                        const partyCallButton = document.getElementById('party-call-button');
                        if (partyCallButton) {
                            partyCallButton.style.display = this.isPartyLeader ? 'flex' : 'none';

                            if (this.isPartyLeader) {
                                console.log('Party call button displayed for the party leader.');

                                // Remove any existing event listeners and add a new one
                                partyCallButton.replaceWith(partyCallButton.cloneNode(true));
                                document.getElementById('party-call-button').addEventListener('click', () => {
                                    console.log('Party call button clicked. Initiating party call...');
                                    this.initiatePartyCall(message.party.leader, message.party.members);  // Pass leader and members
                                });
                            } else {
                                console.log('Party call button hidden for non-leaders.');
                            }
                        } else {
                            console.error('Party call button not found in the DOM.');
                        }
                        
                        break;

                    case 'partyMessage':  // New case for party messages
                        if (this.inParty) {
                            this.displayPartyMessage(message.senderId, message.text, message.senderId === this.playerId); // Display the incoming message in chat
                        }
                        break;

                    case 'partyCall':
                        console.log("Handling partyCall message...");
                        if (this.inParty && message.senderId === message.party.leader) {
                            this.promptPartyCallParticipation(message.senderId);
                        }

                        break;

                    // Party member Ice Candidate exchange
                    // case 'iceCandidate':
                    //     console.log("📨 Received ICE candidate from:", message.senderId);

                    //     this.peerConnections = this.peerConnections || {};
                    //     let peerConnection = this.peerConnections[message.senderId];

                    //     if (!peerConnection) {
                    //         console.warn(`PeerConnection not found for sender: ${message.senderId}. Queuing ICE candidate.`);
                    //         this.iceCandidateQueue = this.iceCandidateQueue || {};
                    //         this.iceCandidateQueue[message.senderId] = this.iceCandidateQueue[message.senderId] || [];
                    //         this.iceCandidateQueue[message.senderId].push(message.candidate);
                    //         return;
                    //     }

                    //     if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
                    //         peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate))
                    //             .then(() => console.log("✅ ICE candidate added."))
                    //             .catch(error => console.error("❌ Error adding ICE candidate:", error));
                    //     } else {
                    //         console.warn("⚠️ Remote description not set. Queuing ICE candidate...");
                    //         peerConnection.iceCandidateQueue = peerConnection.iceCandidateQueue || [];
                    //         peerConnection.iceCandidateQueue.push(message.candidate);
                    //     }

                    //     // ✅ Forward the ICE candidate to other members
                    //     this.partyMembers.forEach(memberId => {
                    //         if (memberId !== message.senderId && memberId !== this.playerId) {
                    //             this.ws.send(JSON.stringify({
                    //                 type: 'iceCandidate',
                    //                 senderId: message.senderId,
                    //                 receiverId: memberId,
                    //                 candidate: message.candidate,
                    //             }));
                    //         }
                    //     });
                    //     break;

                    case 'iceCandidate':
                        console.log("Received ICE candidate from:", message.senderId);

                        this.peerConnections = this.peerConnections || {};
                        let peerConnection = this.peerConnections[message.senderId];

                        if (!peerConnection) {
                            console.warn(`PeerConnection not found for sender: ${message.senderId}. Queuing ICE candidate.`);
                            this.iceCandidateQueue = this.iceCandidateQueue || {};
                            this.iceCandidateQueue[message.senderId] = this.iceCandidateQueue[message.senderId] || [];
                            this.iceCandidateQueue[message.senderId].push(message.candidate);
                            return;
                        }

                        if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
                            peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate))
                                .then(() => console.log("ICE candidate added."))
                                .catch(error => console.error("Error adding ICE candidate:", error));
                        } else {
                            console.warn("Remote description not set. Queuing ICE candidate...");
                            peerConnection.iceCandidateQueue = peerConnection.iceCandidateQueue || [];
                            peerConnection.iceCandidateQueue.push(message.candidate);
                        }
                        break;

                   case 'partyCallResponse':
                        console.log(`Handling partyCallResponse from ${message.senderId}: ${message.response}`);

                        // Handle offer and answer correctly
                        if (message.response === 'offer') {
                            this.handlePartyCallResponse(message.senderId, 'offer', message.offer, null);
                            console.log(`OFFER: Sender is ${message.senderId}`);

                        } else if (message.response === 'answer') {
                            this.handlePartyCallResponse(message.senderId, 'answer', null, message.answer);
                            console.log(`ANSWER: Sender is ${message.senderId}`);

                        } else if (message.response === 'yes') {
                            this.handlePartyCallResponse(message.senderId, 'offer', message.offer, null);
                        } else if (message.response === 'no') {
                            console.log("Call declined by member.");

                            // Play sound after displaying the prompt
                            if (this.sounds && typeof this.sounds.beep.sound.play === 'function') {
                                this.sounds.beep.sound.play();
                                console.log("Playing", this.sounds);
                            };

                            setTimeout(() => {
                                // Stop sound after displaying the prompt
                                if (this.sounds && typeof this.sounds.beep.sound.stop === 'function') {
                                    this.sounds.beep.sound.stop();
                                    console.log("Stoping", this.sounds);
                                };
                            }, 2000);
                        }
                        break;
                        
                    case 'partyCallStarted':
                        console.log(`Party call started. Leader: ${message.leaderId}, member ${message.memberId}`);
                        this.displayPartyMessage(message.leaderId, "Audiocast initialized.", false);

                        // Start the call session
                        this.startPartyCallSession(message.leaderId, message.memberId);

                        // ✅ Set the audio stream for the member
                        if (this.peerConnections && this.peerConnections[message.memberId]) {
                            const peerConnection = this.peerConnections[message.memberId];
                            const remoteStream = new MediaStream();
                            
                            peerConnection.getReceivers().forEach(receiver => {
                                if (receiver.track && receiver.track.kind === 'audio') {
                                    remoteStream.addTrack(receiver.track);
                                }
                            });

                            if (remoteStream.getTracks().length > 0) {
                                this.setAudioStreamForMember(message.memberId, remoteStream);
                            }
                        }
                        
                        break;

                    case 'partyCallDeclined':
                        console.log(`${message.senderId} declined the party call.`);
                        this.displayPartyMessage(message.leaderId, `${this.formatPlayerId(message.senderId)} declined the call.`, false);
                        break;

                    case 'partyCallEnded':
                        console.log("Handling partyCallEnded message...");
                        this.displayPartyMessage(message.leaderId, "Audiocast has been terminated.", false);
                        this.cleanUpCallSession();
                        break;

                    case 'partyCallEndedForMember':
                        console.log("Handling partyCallEndedForMember message...");
                        this.displayPartyMessage(message.senderId, "You have left the audiocast.", false);
                        this.cleanUpCallSession();
                        break;

                    case 'partyDisbanded':
                        this.clearPartyState();
                        this.showPopup("The party has been disbanded."); // Notify the player visually

                        let partyContainer = document.getElementById('party-info')
                        if (partyContainer && partyContainer.style.display === 'flex') {
                            this.togglePartyList();
                        }
                        console.log("Party disbanded");
                        break;

                    case 'partyTwoLeft':
                        alert("Only two players are left in the party.");
                        break;

                    case 'playerRemoved':
                        this.removePlayerCar(message.playerId);
                        break;

                    case 'partyInviteDenied':
                        if (message.reason === 'onlyLeaderCanInvite') {
                            this.showPopup('Only party leader can invite players.');
                        } else if (message.reason === 'partyFull') {
                            this.showPopup('Party is full.');
                        } else if (message.reason === 'targetAlreadyInParty') {
                            this.showPopup('Target player is already in a party.');
                        } else {
                            this.showPopup('Party invite denied.');
                        }
                        break;

                    case 'dropKrashcoin':
                        // Check if a coin is already active
                        if (this.coinActive) {
                            console.log("Coin is already active, skipping drop.");
                            return; // Exit the function to prevent multiple coins
                        }

                        const { position } = message;
                        console.log("Client side position", position)
                        
                        this.dropCoinAtPosition(position); // Use the server-sent position
                        this.coinActive = true;
                        break;  
                            
                    case 'hideCoin':
                        if (this.coinActive) {
                            this.hideCoin();
                            this.coinActive = false;
                        }
                        break;

                    // case 'batteryStatus':
                    //     updateBatteryStatus(message.playerId, message.battery);
                    //     break;

                    case 'updateNonCollidablePairs':
                        // Update the local non-collidable pairs list on the client side
                        const newNonCollidablePairs = new Set(message.nonCollidablePairs);

                        // Update the physics or collision detection logic with the new non-collidable pairs
                        this.physics.nonCollidableCars = newNonCollidablePairs;
                        break;

                    case 'checkBattery':
                        // const car = this.otherPlayers[message.carId];
                        const car = playerCar
                    
                        if (car && message.battery <= 0) {
                        // Update non-collidable cars since battery is zero
                        this.physics.updateNonCollidableCars(car, Object.values(this.otherPlayers));
                        console.log("Non collidable cars", this.physics.nonCollidableCars)
                    
                        // Trigger crash effect and put the car to sleep (optional, based on desired behavior)
                        if (typeof car.createCrashEffect === 'function') {
                            car.createCrashEffect(car.chassis.object.position, car.chassis.object.quaternion);
                        }
                        // Set a timeout to recreate the car after 5 seconds
                        setTimeout(() => {
                            car.recreate(); // Recreate the car
                            car.battery = 100; // Reset battery after recreation
                            }, 15000); // 5 seconds delay
                        }
                        break;

                    case 'destroyCar':
                        {
                            const durationMs = typeof message.durationMs === 'number' ? message.durationMs : 5000;
                            const targetCar = this.getCarByPlayerId(message.carId);
                            if (targetCar) {
                                this.physics.applyDestroyedState(targetCar, durationMs);
                                this.playCarDestroyedFx(targetCar, durationMs);
                                setTimeout(() => {
                                    this.playCarRestoreFx(targetCar);
                                }, durationMs);
                            }
                        }
                        break;
    
                    default:
                        // console.error('Unknown message type:', message.type);
                }
            };

            // Use this function to ensure the score is updated before closing the WebSocket connection
            // window.addEventListener("beforeunload", () => {
            //     // Send the final score when the player is leaving or reloading the page
            //     const finalScore = this.car.score; // Get the player's score from the car object
            //     this.updateDataScore(finalScore); // Send the final score to the server
            // });
    
            ws.onclose = () => {
                console.log('Disconnected from WebSocket server');
    
                if (this.inParty) {
                    console.log('Player was in a party. Clearing party state.');
                    this.clearPartyState();
                }

                // Redirect to the home or wallet connection page
                if (typeof window !== 'undefined') {
                    // window.location.href = 'https://krashbox.world';
                    window.location.href = 'localhost:3000';
                }
            };
        }

        normalizeCarName = (carName) => {
            if (!carName || typeof carName !== 'string') return 'kybertruck';
            return carName.trim().toLowerCase();
        };

        resolveCarClass = (carName) => {
            const normalized = this.normalizeCarName(carName);
            const selectedCarToClass = {
                'kybertruck': Car1,
                'charger power bank': Car2,
                'charger': Car2,
                'wreckslinger': Car3
            };

            if (selectedCarToClass[normalized]) {
                return selectedCarToClass[normalized];
            }

            const fallbackPool = [Car1, Car2, Car3];
            const hash = normalized
                .split('')
                .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
            return fallbackPool[hash % fallbackPool.length];
        };

        createOtherPlayerCar = (playerId, data) => {

            // if (this.otherPlayers[playerId]) {
            //     removePlayerCar(playerId);
            // }

            const selectedCar = data?.selectedCar || data?.carName || 'Kybertruck';
            const normalizedSelectedCar = this.normalizeCarName(selectedCar);
            const currentSelectedCar = this.otherPlayerSelectedCars[playerId];

            if (this.otherPlayers[playerId] && currentSelectedCar === normalizedSelectedCar) {
                this.updateCarState(this.otherPlayers[playerId], data);
                return;
            }

            if (this.otherPlayers[playerId] && currentSelectedCar !== normalizedSelectedCar) {
                this.removePlayerCar(playerId);
            }

            const remoteControls = {
                actions: {
                    boost: false,
                    brake: false,
                    down: false,
                    left: false,
                    right: false,
                    up: false,
                    shoot: false,
                    siren: false
                },
                on: () => {},
                off: () => {}
            };
            const remotePhysics = Object.create(this.physics);
            remotePhysics.controls = remoteControls;
            remotePhysics.setCar(playerId, selectedCar);

            const otherPlayerCar = new Car({
                time: this.time,
                resources: this.resources,
                objects: this.objects,
                physics: remotePhysics,
                shadows: this.shadows,
                materials: this.materials,
                renderer: this.renderer,
                camera: this.camera,
                controls: remoteControls,
                sounds: this.sounds,
                config: this.config,
                playerId: playerId,
                bullets: this.bullets,
                battery: this.battery,
                worldId: this.worldId,
                score: this.score,
                ws: null,
                isRemotePlayer: true,
                carName: selectedCar,
                matcaps: data?.matcaps || {}
            });

            this.otherPlayers[playerId] = otherPlayerCar;
            this.otherPlayerSelectedCars[playerId] = normalizedSelectedCar;

            this.container.add(otherPlayerCar.container);
            
            console.log("Other player car container", otherPlayerCar)
            this.physics.cars[playerId] = otherPlayerCar;
            this.updateCarState(otherPlayerCar, data);
        };
        
        updateCarState = (car, data) => {
            if (!car || !data) return;

            const carKey = this.getCarKey(car);
            if (!carKey || !car.physics?.[carKey]) return;

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

            const remoteSpeed = data.velocity
                ? Math.sqrt(
                    (data.velocity.x || 0) * (data.velocity.x || 0) +
                    (data.velocity.y || 0) * (data.velocity.y || 0) +
                    (data.velocity.z || 0) * (data.velocity.z || 0)
                )
                : 0;
            const remoteControlsActive = Boolean(
                data.controls?.up ||
                data.controls?.down ||
                data.controls?.boost
            );
            const shouldSpinWheels = remoteControlsActive || remoteSpeed > 0.35;

            if (data.wheels) {
                data.wheels.forEach((wheelData, index) => {
                    const wheelBody = car.physics[carKey].wheels.bodies[index];
                    wheelBody.position.set(wheelData.position.x, wheelData.position.y, wheelData.position.z);
                    if (shouldSpinWheels) {
                        wheelBody.quaternion.set(wheelData.rotation.x, wheelData.rotation.y, wheelData.rotation.z, wheelData.rotation.w);
                        car.physics[carKey].vehicle.wheelInfos[index].rotation = wheelData.rotationAngle;
                    }
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
                car.controls.actions.siren = data.controls.siren;

                const carSteeringValue = data.controls.steering;
                const shouldApplyRemoteForces = false;
                if (shouldApplyRemoteForces) {
                    car.physics[carKey].vehicle.setSteeringValue(-carSteeringValue, 0);
                    car.physics[carKey].vehicle.setSteeringValue(-carSteeringValue, 1);
                }

                if (data.controls.boost) {
                    car.createNitroEffect(car.physics[carKey].chassis.body.position, car.physics[carKey].chassis.body.quaternion, car.chassis.object)
                }

                if (data.controls.siren) {
                    car.createSirenEffect()
                }

                if (shouldApplyRemoteForces) {
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

        removePlayerCar = (playerId) => {
            const removedPlayerCar = this.otherPlayers[playerId];

            if (!removedPlayerCar) {
                delete this.physics.cars[playerId];
                delete this.otherPlayers[playerId];
                delete this.otherPlayerSelectedCars[playerId];
                this.removeFromMiniMap(playerId);
                return;
            }

            if (removedPlayerCar.__removing) return;
            removedPlayerCar.__removing = true;

            const carKey = this.getCarKey(removedPlayerCar);

            const carContainer = removedPlayerCar.container || removedPlayerCar.chassis?.object;
            const setOpacity = (value) => {
                if (!carContainer) return;
                carContainer.traverse((child) => {
                    if (child && child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((mat) => {
                                if (!mat) return;
                                mat.transparent = true;
                                mat.opacity = value;
                            });
                        } else {
                            child.material.transparent = true;
                            child.material.opacity = value;
                        }
                    }
                });
            };

            const finalizeRemoval = () => {
                try {
                    const chassisBody = carKey ? removedPlayerCar.physics?.[carKey]?.chassis?.body : null;
                    if (chassisBody) {
                        this.physics.world.removeBody(chassisBody);
                    }
                } catch (_err) {
                    // no-op
                }

                if (carContainer) {
                    this.container.remove(carContainer);
                }

                delete this.physics.cars[playerId];
                delete this.otherPlayers[playerId];
                delete this.otherPlayerSelectedCars[playerId];
                this.removeFromMiniMap(playerId);
                console.log(`Player ${playerId} removed`);
            };

            if (!carContainer) {
                finalizeRemoval();
                return;
            }

            const fadeState = { opacity: 1 };
            gsap.to(fadeState, {
                duration: 0.35,
                opacity: 0,
                ease: 'power2.out',
                onUpdate: () => setOpacity(fadeState.opacity)
            });

            gsap.to(carContainer.scale, {
                duration: 0.4,
                x: 0.01,
                y: 0.01,
                z: 0.01,
                ease: 'power2.in',
                onComplete: finalizeRemoval
            });
        };

        // Show invite prompt
        showInvitePrompt(inviterId, playerId, ws) {

            // Play sound after displaying the prompt
            if (this.sounds && typeof this.sounds.popup.sound.play === 'function') {
                this.sounds.popup.sound.play();
                console.log("Playing", this.sounds);
            };

            setTimeout(() => {
                // Stop sound after displaying the prompt
                if (this.sounds && typeof this.sounds.popup.sound.stop === 'function') {
                    this.sounds.popup.sound.stop();
                    console.log("Stoping", this.sounds);
                };
            }, 2000);

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
                inviteElement.style.width = '350px';
                inviteElement.style.animation = 'pulse 2s infinite';

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
                progressBar.style.backgroundColor = '#18FF00';
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
                yesButton.style.alignItems = 'center';
                // yesButton.style.backgroundColor = '#18FF00';
                yesButton.style.backgroundColor = 'transparent';
                // yesButton.style.border = '2px solid #18FF00';
                yesButton.style.color = '#fff';
                yesButton.style.flex = '1';
                yesButton.style.fontFamily = 'Orbitron, sans-serif';
                yesButton.onclick = () => this.respondToInvite('yes', inviterId, playerId, ws);
                buttonContainer.appendChild(yesButton);
                feather.replace();

                const noButton = document.createElement('button');
                noButton.id = 'ordinaryButton';
                noButton.innerHTML = `${feather.icons['x-square'].toSvg({ width: 15, height: 15 })} DENY`;
                noButton.style.whiteSpace = 'pre';
                // noButton.style.backgroundColor = '#FF5733';
                noButton.style.display = 'flex';
                noButton.style.fontFamily = 'Orbitron, sans-serif';
                noButton.style.justifyContent = 'center';
                noButton.style.alignItems = 'center';
                noButton.style.flex = '1';
                noButton.onclick = () => this.respondToInvite( 'DENY', inviterId, playerId, ws);
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
                // const countdownInterval = setInterval(() => {
                //     timeLeft -= 1;
                //     if (timeLeft <= 0) {
                //         clearInterval(countdownInterval);
                //         this.hideInvitePrompt(inviteElement); // Automatically hide the invite prompt after timeout
                //     }
                // }, 1000);
            }

            const messageElement = document.getElementById('invite-message');
            messageElement.innerText = `${inviterId.slice(0, 6)} invited you to a party. Would you like to join?`;
            messageElement.style.textAlign = 'left';
            messageElement.style.marginLeft = '10px';
            messageElement.style.fontSize = '15px';
            inviteElement.style.display = 'flex';
            inviteElement.style.opacity = '1';
            inviteElement.style.fontSize = '12px';
        }

        // Hide invite prompt
        hideInvitePrompt(inviteElement) {
            inviteElement.style.opacity = '0';
            setTimeout(() => {
                if (inviteElement && inviteElement.parentNode) {
                    inviteElement.parentNode.removeChild(inviteElement);
                }
            }, 500); // Smooth fade out
        }

        // Respond to invite
        respondToInvite(response, inviterId, playerId, ws) {
            if (ws) {
                ws.send(JSON.stringify({
                    type: 'inviteResponse',
                    response: response,
                    inviterId: inviterId,
                    playerId: playerId
                }));
            }

            const inviteElement = document.getElementById('invite-prompt');
            if (inviteElement) {
                inviteElement.style.display = 'none';
            }
        }     

        showFriendListPrompt(friendRequestId, targetPlayerId, ws) {
            let inviteElement = document.getElementById('friend-invite-prompt');
            if (!inviteElement) {
                // Create the prompt container
                inviteElement = document.createElement('div');
                inviteElement.id = 'friend-invite-prompt';
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
                inviteElement.style.width = '350px';
                inviteElement.style.animation = 'pulse 2s infinite';
        
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
                progressBar.style.backgroundColor = '#18FF00';
                progressBarContainer.appendChild(progressBar);
        
                inviteElement.appendChild(progressBarContainer);
        
                // Message element
                const messageElement = document.createElement('div');
                messageElement.id = 'friend-invite-message';
                messageElement.style.fontFamily = 'Orbitron, sans-serif';
                inviteElement.appendChild(messageElement);
        
                // Button container
                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.justifyContent = 'space-between';
                buttonContainer.style.width = '100%';
        
                // Accept button
                const acceptButton = document.createElement('button');
                acceptButton.innerHTML = `${feather.icons['check-square'].toSvg({ width: 15, height: 15 })} ACCEPT`;
                acceptButton.id = 'ordinaryButton';
                acceptButton.style.marginRight = '10px';
                acceptButton.style.whiteSpace = 'pre';
                acceptButton.style.display = 'flex';
                acceptButton.style.justifyContent = 'center';
                acceptButton.style.color = '#fff';
                acceptButton.style.alignItems = 'center';
                acceptButton.style.flex = '1';
                acceptButton.style.fontFamily = 'Orbitron, sans-serif';
                acceptButton.onclick = () => this.respondToFriendshipInvite('yes', friendRequestId, targetPlayerId, ws);
                buttonContainer.appendChild(acceptButton);
                feather.replace();
        
                // Deny button
                const denyButton = document.createElement('button');
                denyButton.innerHTML = `${feather.icons['x-square'].toSvg({ width: 15, height: 15 })} DENY`;
                denyButton.id = 'ordinaryButton';
                denyButton.style.whiteSpace = 'pre';
                denyButton.style.display = 'flex';
                denyButton.style.fontFamily = 'Orbitron, sans-serif';
                denyButton.style.justifyContent = 'center';
                denyButton.style.alignItems = 'center';
                denyButton.style.flex = '1';
                denyButton.onclick = () => this.respondToFriendshipInvite('no', friendRequestId, targetPlayerId, ws);
                buttonContainer.appendChild(denyButton);
        
                inviteElement.appendChild(buttonContainer);
                document.body.appendChild(inviteElement);
        
                // Start the progress bar animation (decrease width over 20 seconds)
                setTimeout(() => {
                    progressBar.style.transition = 'width 20s linear'; // Smooth transition for 20 seconds
                    progressBar.style.width = '0%'; // Decrease the width to 0%
                }, 100); // Small delay to trigger the transition
        
                // Auto-remove after 20 seconds
                let timeLeft = 20;
                const countdownInterval = setInterval(() => {
                    timeLeft -= 1;
                    if (timeLeft <= 0) {
                        clearInterval(countdownInterval);
                        this.hideInvitePrompt(inviteElement); // Automatically hide the invite prompt after timeout
                    }
                }, 1000);
            }
        
            const messageElement = document.getElementById('friend-invite-message');
            messageElement.innerText = `${friendRequestId.slice(0, 6)} wants to add your wallet address to connect list. Accept?`;
            messageElement.style.textAlign = 'left';
            messageElement.style.marginLeft = '10px';
            messageElement.style.fontSize = '15px';
            inviteElement.style.display = 'flex';
            inviteElement.style.opacity = '1';
            inviteElement.style.fontSize = '12px';
        }        

        respondToFriendshipInvite(response, friendRequestId, playerId, ws) {
            if (ws) {
                ws.send(JSON.stringify({
                    type: 'friendshipResponse',
                    response: response,
                    friendRequestId: friendRequestId,
                    playerId: playerId
                }));
            }
        
            const inviteElement = document.getElementById('friend-invite-prompt');
            if (inviteElement) {
                inviteElement.style.display = 'none';
            }
        }           

        // Function to clear the chat container
        clearChatContainer = () => {
            const chatBox = document.getElementById('party-chat-box');
            chatBox.innerHTML = ''; // Clear the chat messages
        };

        // Function to show the chat container
        showChatContainer = () => {
            const chatContainer = document.getElementById('party-chat-container');
            if (chatContainer) {
            chatContainer.style.display = 'block'; // Show the chat container
            this.messengerVisible = true;
            }
        };

        // Function to hide the chat container
        hideChatContainer = () => {
            const chatContainer = document.getElementById('party-chat-container');
            if (chatContainer) {
            chatContainer.style.display = 'none'; // Hide the chat container
            this.messengerVisible = false;
            }
        };

        // Function to show the toggle button
        showToggleButton = () => {
            const toggleButton = document.getElementById('toggle-chat-button');
            if (toggleButton) {
                toggleButton.style.display = 'block';
            }
        };

        // Function to hide the toggle button
        hideToggleButton = () => {
            const toggleButton = document.getElementById('toggle-chat-button');
            if (toggleButton) {
                toggleButton.style.display = 'none';
            }
        };

        // Function to check if the player is in a party and update the toggle button visibility
        updateToggleButtonVisibility = (inParty) => {
            if (inParty) {
                console.log('Player is in a party. Showing toggle button.');
                this.showToggleButton();  // Show the button if the player is in a party
            } else {
                console.log('Player is not in a party. Hiding toggle button.');
                this.hideToggleButton();  // Hide the button if the player is not in a party
            }
            this.updateInviteButtonState();
        };

        updateInviteButtonState = () => {
            const inviteButton = document.getElementById('invite-button');
            if (!inviteButton) return;

            const canInvite = !this.inParty || this.isPartyLeader;
            inviteButton.style.opacity = canInvite ? '1' : '0.35';
            inviteButton.style.pointerEvents = canInvite ? 'auto' : 'none';
            inviteButton.title = canInvite ? '' : 'Only party leader can invite';
        };

        getPartyMemberBattery = (memberId) => {
            if (memberId === this.playerId) {
                return this.car?.battery;
            }
            return this.otherPlayers?.[memberId]?.battery;
        };

        refreshPartyMemberHpUI = () => {
            if (!this.inParty || !Array.isArray(this.partyMembers) || this.partyMembers.length === 0) return;

            this.partyMembers.forEach((memberId) => {
                const memberRow = document.getElementById(`member-${memberId}`);
                if (!memberRow) return;

                const battery = this.getPartyMemberBattery(memberId);
                const hp = Number.isFinite(battery) ? Math.max(0, Math.min(100, Math.round(battery))) : 100;
                const leaderTag = memberId === this.partyLeaderId ? ' [LEADER]' : '';
                memberRow.innerText = `> ${this.formatPlayerId(memberId)}${leaderTag} | HP ${hp}%`;
            });
        };

        // Add player to party
        addPlayerToParty(inviterId, playerId) {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                console.error('WebSocket connection is not open. Cannot add player to party.');
                return;
            }

            this.ws.send(JSON.stringify({
                type: 'addToParty',
                inviterId: inviterId,
                playerId: playerId
            }));
        }  

        updatePartyUI(inviterId, members, physics, ws) {
            let partyElement = document.getElementById('party-info');
            if (!partyElement) {
                // Create the party-info container
                partyElement = document.createElement('div');
                partyElement.id = 'party-info';
                partyElement.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: -webkit-fill-available;
                    height: 200px;
                    max-height: calc(100% - 40px);
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    background-color: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    box-shadow: 0 5px 8px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    z-index: 10000;
                    backdrop-filter: blur(5px);
                    transition: all 0.5s ease-in-out;
                    align-items: center;
                `;
                document.body.appendChild(partyElement);
            }
        
            // Clear previous content
            partyElement.innerHTML = '';
        
            // Add live clock at the top
            const timeElement = document.createElement('div');
            timeElement.id = 'party-time-display';
            timeElement.innerHTML = `PARTY MEMBERS`;
            timeElement.style.cssText = `
                font-size: 1em;
                font-weight: 500;
                margin-bottom: 10px;
                color: white;
                text-align: center;
                margin: 5px;
                padding-left: 10px;
            `;
            partyElement.appendChild(timeElement);
        
            // Update the clock every second
            // setInterval(() => {
            //     const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            //     timeElement.innerText = `TIME: ${currentTime}`;
            // }, 1000);
        
            // Add a toggle chat button
            const toggleChatButton = document.createElement('button');
            toggleChatButton.id = 'toggle-chat-button';
            toggleChatButton.innerHTML = `${feather.icons['mail'].toSvg({ width: 20, height: 20 })}`;
            toggleChatButton.style.cssText = `
                margin: 14px 20px;
                font-family: 'Orbitron', sans-serif;
                font-size: 10px;
                color: #FF5733;
                background: unset;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                transition: all 0.5s ease-in-out;
            `;
            // toggleChatButton.addEventListener('click', this.toggleChatVisibility);
            toggleChatButton.addEventListener('click', () => {
                this.togglePartyList(); // First toggle the party list
                setTimeout(() => {
                    this.toggleChatVisibility(); // Then toggle the chat visibility with a delay to ensure smooth animation
                }, 500); // Adjust delay if necessary to match the animation duration
            });
            partyElement.appendChild(toggleChatButton);

            // Add a toggle call button
            const toggleCallButton = document.createElement('button');
            toggleCallButton.id = 'toggle-call-button';
            toggleCallButton.innerHTML = `${feather.icons['mic'].toSvg({ width: 20, height: 20 })}`;
            toggleCallButton.style.cssText = `
                margin: 14px;
                font-family: 'Orbitron', sans-serif;
                font-size: 10px;
                color: #FF5733;
                background: unset;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                padding-left: 10px;
                transition: all 0.5s ease-in-out;
            `;
            // Update the event listener to initiate the party call
            // toggleCallButton.addEventListener('click', () => {
            //     this.initiatePartyCall();
            // });
            partyElement.appendChild(toggleCallButton);
        
            // Populate party info
            members.forEach((memberId) => {
                const memberDiv = document.createElement('div');
                memberDiv.id = `member-${memberId}`;
                memberDiv.style.paddingTop = '10px';
                memberDiv.style.fontSize = '12px';
                memberDiv.style.color = 'white';
                memberDiv.style.paddingLeft = "5px";
                const battery = this.getPartyMemberBattery(memberId);
                const hp = Number.isFinite(battery) ? Math.max(0, Math.min(100, Math.round(battery))) : 100;
                const leaderTag = memberId === inviterId ? ' [LEADER]' : '';
                memberDiv.innerText = `> ${this.formatPlayerId(memberId)}${leaderTag} | HP ${hp}%`;
                partyElement.appendChild(memberDiv);
            });
        
            // Add Leave Party button
            const leaveButton = document.createElement('button');
            leaveButton.innerHTML = `LEAVE PARTY`;
            leaveButton.style.cssText = `
                margin: 20px 0 10px 10px;
                padding: 5px 10px;
                font-family: 'Orbitron', sans-serif;
                font-size: 12px;
                font-weight: bold;
                color: rgb(255, 87, 51);
                background: unset;
                border: 1px solid rgb(255, 87, 51);
                border-radius: 5px;
                cursor: pointer;
            `;
            leaveButton.onclick = () => this.leaveParty(this.cars[this.playerId], ws);
            partyElement.appendChild(leaveButton);

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

            partyToggle = () => {
                let partyToggleButton = document.getElementById('toggle-party-list');
            
                if (!partyToggleButton) {
                    // Create the button if it doesn't exist
                    partyToggleButton = document.createElement('button');
                    partyToggleButton.id = 'toggle-party-list';
                    partyToggleButton.innerText = 'PARTY';
                    partyToggleButton.style.cssText = `
                        position: absolute;
                        bottom: 10px;
                        right: 10px;
                        padding: 5px 10px;
                        font-family: 'Orbitron', sans-serif;
                        font-size: 12px;
                        display: flex;
                        font-weight: bold;
                        color: rgb(255, 255, 255);
                        background-color: rgba(0, 0, 0, 0.5);
                        border: 1px solid rgb(255, 255, 255);
                        border-radius: 5px;
                        cursor: pointer;
                        opacity: 0;
                    `;
                    document.body.appendChild(partyToggleButton);
                }
                partyToggleButton.innerText = 'PARTY';
            
                // Add event listener to toggle party list
                partyToggleButton.onclick = this.togglePartyList;
            
                // Ensure button is visible
                // partyToggleButton.style.display = 'flex';
                // partyToggleButton.style.opacity = '1';
            };

            formatPlayerId(id) {
                const firstPart = id.substring(0, 4);
                const lastPart = id.substring(id.length - 4);
                return `${firstPart}...${lastPart}`;
            }

            // Function to send a message to party members
            sendPartyMessage = (text) => {
                if (text && this.ws && this.ws.readyState === WebSocket.OPEN && this.inParty) {
                this.ws.send(JSON.stringify({
                    type: 'partyMessage',
                    senderId: this.playerId,
                    text: text
                }));
                }
            };

            displayPartyMessage = (senderId, text, isOwnMessage) => {
                const chatBox = document.getElementById('party-chat-box');
                const chatContainer = document.getElementById('party-chat-container');
            
                // Check if the chat is hidden and show the notification badge
                if (chatContainer.style.display !== 'block') {
                    this.showNotificationBadge();  // Trigger notification if chat is hidden

                    // Play sound after displaying the prompt
                    if (this.sounds && typeof this.sounds.notification.sound.play === 'function') {
                        this.sounds.notification.sound.play();
                        console.log("Playing", this.sounds);
                    };

                    setTimeout(() => {
                        // Stop sound after displaying the prompt
                        if (this.sounds && typeof this.sounds.notification.sound.stop === 'function') {
                            this.sounds.notification.sound.stop();
                        };
                    }, 1500);
                }

                // Check if the chat is hidden and show the notification badge
                if (chatContainer.style.display === 'flex') {
                    // Stop sound after displaying the prompt
                    if (this.sounds && typeof this.sounds.notification.sound.stop === 'function') {
                        this.sounds.notification.sound.stop();
                    };
                } else if (chatContainer.style.display === 'block'){
                    // Stop sound after displaying the prompt
                    if (this.sounds && typeof this.sounds.notification.sound.stop === 'function') {
                        this.sounds.notification.sound.stop();
                    };
                }
            
                // Create a container for the message
                const messageElement = document.createElement('div');
                messageElement.classList.add('chat-message');
            
                // Apply the appropriate class for sent/received messages
                if (isOwnMessage) {
                    messageElement.classList.add('my-message');  // Apply style for own message
                    // Stop sound after displaying the prompt
                    if (this.sounds && typeof this.sounds.notification.sound.stop === 'function') {
                        this.sounds.notification.sound.stop();
                    };
                } else {
                    messageElement.classList.add('other-message');  // Apply style for received message
                }
            
                // Format the senderId and create a sender element
                const senderElement = document.createElement('span');
                senderElement.classList.add('sender-id');
                senderElement.innerText = `${this.formatPlayerId(senderId)}: `;
            
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
            
                // Apply the scaling animation
                messageElement.style.transform = 'scale(0)';
                messageElement.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                messageElement.style.opacity = '0';
            
                // Append the message element to the chat box
                chatBox.appendChild(messageElement);
                chatBox.scrollTop = chatBox.scrollHeight;  // Auto-scroll to the latest message
            
                // Trigger the scale-in animation
                setTimeout(() => {
                    messageElement.style.transform = 'scale(1)';
                    messageElement.style.opacity = '1';
                }, 10);
            };         

            // Update battery status in the UI
            updateBatteryStatus(playerId, battery) {
                const memberInfo = document.getElementById(`member-${playerId}`);
                if (memberInfo) {
                    memberInfo.innerText += `, HP: ${battery}%`;
                }
            }

            // Leave party function
            leaveParty(playerCar, ws) {

                if (!playerCar) {
                    console.error("Player car is not defined");
                    return;
                  }

                const playerId = playerCar.playerId;
                if (ws) {
                    ws.send(JSON.stringify({ type: 'leaveParty', playerId }));
                  } else {
                    console.error("WebSocket connection is not available");
                  }

                // Update the UI for the player leaving
                this.inParty = false;
                this.partyMembers = [];
                this.isPartyLeader = false;

                const partyElement = document.getElementById('party-info');
                if (partyElement) {
                    // partyElement.style.display = 'none';
                    partyElement.innerHTML = '';
                }

                // Clear the non-collidable players set to ensure all players can collide again
                if (this.physics) {
                    this.physics.nonCollidablePlayers.clear();
                }

                // Play sound after displaying the prompt
                if (this.sounds && typeof this.sounds.terminatedNotification.sound.play === 'function') {
                    this.sounds.terminatedNotification.sound.play();
                    console.log("Playing", this.sounds);
                };

                setTimeout(() => {
                    // Stop sound after displaying the prompt
                    if (this.sounds && typeof this.sounds.terminatedNotification.sound.stop === 'function') {
                        this.sounds.terminatedNotification.sound.stop();
                        console.log("Stoping", this.sounds);
                    };
                }, 100);
            }

            // Function to format playerId
            formatPlayerId(playerId) {
                if (!playerId || typeof playerId !== 'string') {
                    console.error("Invalid playerId:", playerId);
                    return "Unknown";
                }
            
                const firstPart = playerId.substring(0, 4);
                const lastPart = playerId.substring(playerId.length - 4);
                return `${firstPart}...${lastPart}`;
            }
        
            // Function to show a notification badge on the toggle button
            showNotificationBadge = () => {
                const toggleButton = document.getElementById('toggle-chat-button');
                let notificationBadge = document.getElementById('chat-notification-badge');
            
                // If the badge doesn't exist, create it
                if (!notificationBadge) {
                    notificationBadge = document.createElement('div');
                    notificationBadge.id = 'chat-notification-badge';
                    notificationBadge.classList.add('pulse-notification');
                    toggleButton.appendChild(notificationBadge);
                }
            };            

            // Toggle chat visibility on button click with animation
            toggleChatVisibility = () => {
                const chatContainer = document.getElementById('party-chat-container');
                const notificationBadge = document.getElementById('chat-notification-badge');  // Badge element
            
                if (!chatContainer) {
                    console.error('Chat container not found!');
                    return;
                }
            
                console.log('Chat container found. Toggling visibility.');
            
                if (this.messengerVisible) {
                    // Hide chat with scaling animation
                    chatContainer.style.transform = 'scale(1.25)';
                    chatContainer.style.opacity = '1';
            
                    setTimeout(() => {
                        chatContainer.style.transform = 'scale(0)';
                        chatContainer.style.opacity = '0';
                    }, 10);
            
                    setTimeout(() => {
                        chatContainer.style.display = 'none';
                    }, 500);  // Match the animation duration

                    // Stop sound after displaying the prompt
                    if (this.sounds && typeof this.sounds.notification.sound.stop === 'function') {
                        this.sounds.notification.sound.stop();
                        console.log("Playing", this.sounds);
                    };
            
                    this.messengerVisible = false;  // Update flag
                } else {
                    const chatContainer = document.getElementById('party-chat-container');

                    // Show chat with scaling animation
                    if (chatContainer)  {
                        chatContainer.style.display = 'flex';
                        chatContainer.style.transform = 'scale(0)';
                        chatContainer.style.opacity = '0';
                
                        setTimeout(() => {
                            chatContainer.style.transform = 'scale(1)';
                            chatContainer.style.opacity = '1';
                        }, 10);

                        // Remove notification badge when chat is opened
                        if (notificationBadge) {
                            notificationBadge.remove();
                        }
                }
                    
            
                    this.messengerVisible = true;  // Update flag
                }
            };            

            toggleFriendList = () => {
                const friendListContainer = document.getElementById('contact-list');
            
                if (!friendListContainer) {
                    console.error('Friend list container not found!');
                    return;
                }
            
                console.log('Friend list container found. Toggling visibility.');
            
                // Toggle visibility with animation
                if (friendListContainer.style.display === 'flex') {
                    // Hide with scaling animation
                    friendListContainer.style.transform = 'scale(1.25)';
                    friendListContainer.style.opacity = '1';
            
                    setTimeout(() => {
                        friendListContainer.style.transform = 'scale(0)';
                        friendListContainer.style.opacity = '0';
                    }, 10);
            
                    // Set display to none after animation ends
                    setTimeout(() => {
                        friendListContainer.style.display = 'none';
                    }, 1000); // Match the animation duration
                } else {
                    // Show with scaling animation
                    friendListContainer.style.display = 'flex';
                    friendListContainer.style.transform = 'scale(0)';
                    friendListContainer.style.opacity = '0';
            
                    setTimeout(() => {
                        friendListContainer.style.transform = 'scale(1)';
                        friendListContainer.style.opacity = '1';
                    }, 10);
            
                    // Request the updated friend list from the server
                    this.requestFriendListUpdate();
                }
            };

            toggleSettings = () => {
                const settingsContainer = document.getElementById('settings-window');
            
                if (!settingsContainer) {
                    console.error('Settings container not found!');
                    return;
                }
            
                console.log('Settings container found. Toggling visibility.');
            
                // Toggle visibility with animation
                if (settingsContainer.style.display === 'flex') {
                    // Hide with scaling animation
                    settingsContainer.style.transform = 'scale(1.25)';
                    settingsContainer.style.opacity = '1';
            
                    setTimeout(() => {
                        settingsContainer.style.transform = 'scale(0)';
                        settingsContainer.style.opacity = '0';
                    }, 0);
            
                    // Set display to none after animation ends
                    setTimeout(() => {
                        settingsContainer.style.display = 'none';
                    }, 1000);
                } else {
                    // Show with scaling animation
                    settingsContainer.style.display = 'flex';
                    settingsContainer.style.transform = 'scale(0)';
                    settingsContainer.style.opacity = '0';
            
                    setTimeout(() => {
                        settingsContainer.style.transform = 'scale(1)';
                        settingsContainer.style.opacity = '1';
                    }, 0);
                }
            };            

            togglePartyList = () => {
                const partyElement = document.getElementById('party-info');
            
                if (!partyElement) {
                    console.error('Party info container not found!');
                    return;
                }
            
                console.log(`Before toggle: partyElement.style.display = '${partyElement.style.display}'`);
            
                // Toggle visibility with animation
                if (partyElement.style.display === 'flex') {
                    // Hide with scaling animation
                    partyElement.style.transform = 'scale(1.25)';
                    partyElement.style.opacity = '1';
            
                    setTimeout(() => {
                        partyElement.style.transform = 'scale(0)';
                        partyElement.style.opacity = '0';
                    }, 10);
            
                    // Set display to none after animation ends
                    setTimeout(() => {
                        partyElement.style.display = 'none';
                    }, 1000);
                } else {
                    // Show with scaling animation
                    partyElement.style.display = 'flex';
                    partyElement.style.transform = 'scale(0)';
                    partyElement.style.opacity = '0';
            
                    setTimeout(() => {
                        partyElement.style.transform = 'scale(1)';
                        partyElement.style.opacity = '1';
                    }, 10);
            
                    // Dynamically check if there are members
                    if (!this.partyMembers || this.partyMembers.length === 0) {
                        // Clear previous content and display the message
                        partyElement.innerHTML = ''; // Clear the container
                        const noPartyMessage = document.createElement('p');
                        noPartyMessage.innerText = 'No party found.';
                        noPartyMessage.style.cssText = `
                            font-family: 'Orbitron', sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 400px;
                            height: 400px;
                            font-size: 18px;
                            font-weight: 500;
                            color: white;
                            margin-top: 20px;
                            text-align: center;
                        `;
                        partyElement.appendChild(noPartyMessage);
                    }
                }
            
                console.log(`After toggle: partyElement.style.display = '${partyElement.style.display}'`);
            };

            showPopup(message) {
                const popup = document.getElementById('no-target-popup');
                const messageElement = document.getElementById('popup-message');
            
                // Update the message dynamically
                messageElement.textContent = message;
            
                // Ensure the popup is positioned correctly
                popup.style.position = 'fixed';
                popup.style.top = '50%';
                popup.style.left = '50%';
                popup.style.transform = 'translate(-50%, -50%) scale(0)';
                popup.style.opacity = '0';
            
                // Show the popup with scaling animation
                popup.style.display = 'flex';
            
                setTimeout(() => {
                    popup.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                    popup.style.transform = 'translate(-50%, -50%) scale(1)';
                    popup.style.opacity = '1';
                }, 10);
            }      
            
            initControllerSetup() {
                const draggableButtons = document.querySelectorAll('.draggable');
                const dropSlots = document.querySelectorAll('.drop-slot');
                const resetButton = document.getElementById('reset-button');
                const saveSettingsButton = document.getElementById('save-settings-button');
            
                // Define button actions
                const buttonActions = {
                    btn1: 'shoot',
                    btn2: 'boost',
                    btn3: 'siren',
                    btn4: 'forward',
                    btn5: 'backward',
                    btn6: 'brake',
                    btn7: 'camera',
                    btn8: 'reset'
                };
            
                // Store initial positions of the buttons
                const initialButtonPositions = {};
                draggableButtons.forEach(button => {
                    initialButtonPositions[button.id] = {
                        parent: button.parentElement,
                        index: Array.from(button.parentElement.children).indexOf(button)
                    };
                });
            
                // Drag start
                draggableButtons.forEach(button => {
                    button.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text', e.target.id); // Set the ID of the dragged element
                        e.target.classList.add('dragging');
                        e.target.style.opacity = '0.5'; // Change opacity of the dragged button
                    });
            
                    button.addEventListener('dragend', (e) => {
                        e.target.classList.remove('dragging');
                        e.target.style.opacity = '1'; // Reset opacity when dragging ends
                    });
                });
            
                // Enable dropping by adding event listeners to the drop slots
                dropSlots.forEach(slot => {
                    slot.addEventListener('dragover', (e) => {
                        e.preventDefault(); // Allow drop
                    });
            
                    slot.addEventListener('drop', (e) => {
                        e.preventDefault();
                        const draggedElementId = e.dataTransfer.getData('text');
                        const draggedElement = document.getElementById(draggedElementId);
            
                        // Check if the slot already contains a button
                        const existingButton = slot.querySelector('.draggable');
            
                        if (existingButton) {
                            // Swap positions between the dragged element and the existing button
                            const draggedParent = draggedElement.parentElement;
                            const existingParent = existingButton.parentElement;
            
                            existingParent.appendChild(draggedElement);
                            draggedParent.appendChild(existingButton);
            
                            console.log(`Swapped ${draggedElementId} with ${existingButton.id}`);
                        } else {
                            // If no button is in the slot, simply drop the dragged element into the slot
                            slot.appendChild(draggedElement);
                        }
            
                        slot.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Optional: Highlight the slot
                    });
            
                    // Double-click event to remove button
                    slot.addEventListener('dblclick', (e) => {
                        const button = e.target.querySelector('.draggable');
                        if (button) {
                            // Move the button back to the original container
                            document.getElementById('button-setup').appendChild(button);
                            e.target.style.backgroundColor = ''; // Reset background color of the slot
                        }
                    });
                });
            
                // Reset the positions of the buttons to their initial positions
                resetButton.addEventListener('click', () => {
                    draggableButtons.forEach(button => {
                        const initialPosition = initialButtonPositions[button.id];
                        const parent = initialPosition.parent;
                        const index = initialPosition.index;
                        parent.insertBefore(button, parent.children[index]); // Move the button back to its original position
                    });
                    this.controls.resetController();
                    this.saveControllerPrefs(null);
                    this.showPopup('Buttons reset to initial positions.');
                });
            
                // Save the current button positions
                saveSettingsButton.addEventListener('click', () => {
                    const buttonPositions = {};
            
                    dropSlots.forEach(slot => {
                        const slotNumber = slot.getAttribute('data-slot');
                        const button = slot.querySelector('.draggable');
            
                        if (button) {
                            const action = buttonActions[button.id]; // Map the button to its action
                            buttonPositions[slotNumber] = action;
                        } else {
                            buttonPositions[slotNumber] = null; // No button in this slot
                        }
                    });
            
                    console.log('Saved Button Positions:', buttonPositions);
            
                    // Save to localStorage
                    localStorage.setItem('buttonPositions', JSON.stringify(buttonPositions));
                    this.saveControllerPrefs(buttonPositions);
                    this.showPopup('Settings saved successfully.');
                    this.controls.updateController();
                });
            }
            
            initCustomController() {
                // Check if buttonPositions exist in localStorage
                const savedPositions = JSON.parse(localStorage.getItem('buttonPositions'));
            
                if (savedPositions && this.controls.touch) {
                    console.log('Applying saved button positions...');
                    this.controls.updateController(); // Apply saved positions
                } else {
                    console.log('Applying default button positions...');
                }
            }

            requestMicrophoneAccess = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    this.localStream = stream;
                    console.log("Microphone access granted.");
                } catch (error) {
                    console.error("Error accessing microphone:", error);
                    throw error;
                }
            };
            
            initiatePartyCall = async (leaderId, members) => {
                if (!this.playerId) {
                    console.error("Player ID is undefined. Cannot initiate party call.");
                    return;
                }
            
                console.log(`Attempting to initiate a party call. Leader: ${leaderId}, Members:`, members);
            
                if (this.isPartyLeader && this.ws && this.ws.readyState === WebSocket.OPEN) {
            
                    // ✅ Ensure the leader has local audio stream
                    if (!this.localStream) {
                        console.log("Requesting microphone access for leader...");
                        try {
                            await this.requestMicrophoneAccess();
                        } catch (error) {
                            console.error("Failed to get microphone access:", error);
                            return;
                        }
                    }
            
                    // ✅ Create PeerConnections for each member
                    this.peerConnections = this.peerConnections || {};
                    members.forEach(memberId => {
                        if (!this.peerConnections[memberId]) {
                            console.log(`Creating PeerConnection for member: ${memberId}`);
                            const peerConnection = new RTCPeerConnection();
                            this.peerConnections[memberId] = peerConnection;
            
                            // ✅ Handle incoming remote audio track
                            peerConnection.ontrack = (event) => {
                                console.log(`Received remote audio track from ${memberId}`);
                                this.setAudioStreamForMember(memberId, event.streams[0]);
                                console.log("Streams from initiate party call:", event.streams)
                            };
            
                            // ✅ Handle ICE candidates
                            peerConnection.onicecandidate = (event) => {
                                if (event.candidate) {
                                    this.ws.send(JSON.stringify({
                                        type: 'iceCandidate',
                                        senderId: this.playerId,
                                        receiverId: memberId,
                                        candidate: event.candidate,
                                    }));
                                }
                            };
            
                            // ✅ Add leader's local audio stream to the PeerConnection
                            this.localStream.getTracks().forEach(track => {
                                peerConnection.addTrack(track, this.localStream);
                            });
                            console.log(`✅ Added local audio stream to PeerConnection for ${memberId}`);
                        }
                    });
            
                    console.log("Party call conditions met. Sending partyCall message...");
            
                    // ✅ Send the partyCall message
                    this.ws.send(JSON.stringify({
                        type: 'partyCall',
                        senderId: this.playerId,
                        party: {
                            leader: leaderId || this.playerId,
                            members: members || this.partyMembers,
                        }
                    }));
            
                    // Notify in chat
                    this.displayPartyMessage(this.playerId, "Initializing audiocast...", true);
                } else {
                    console.error("Only the party leader can initiate a party call.");
                }
            };            

            promptPartyCallParticipation = (leaderId) => {
                console.log(`Received party call request from ${leaderId}. Displaying prompt...`);
                // Play sound after displaying the prompt
                if (this.sounds && typeof this.sounds.ringtone.sound.play === 'function') {
                    this.sounds.ringtone.sound.play();
                    console.log("Playing", this.sounds);
                };
                
                // Check if the prompt already exists
                let callPromptElement = document.getElementById('party-call-prompt');
                if (!callPromptElement) {
                    // Create the prompt container
                    callPromptElement = document.createElement('div');
                    callPromptElement.id = 'party-call-prompt';
                    callPromptElement.style.position = 'absolute';
                    callPromptElement.style.top = '50%';
                    callPromptElement.style.left = '50%';
                    callPromptElement.style.transform = 'translate(-50%, -50%)';
                    callPromptElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    callPromptElement.style.color = 'white';
                    callPromptElement.style.padding = '20px';
                    callPromptElement.style.borderRadius = '10px';
                    callPromptElement.style.zIndex = '1000';
                    callPromptElement.style.backdropFilter = 'blur(5px)';
                    callPromptElement.style.display = 'flex';
                    callPromptElement.style.alignItems = 'center';
                    callPromptElement.style.flexDirection = 'column';
                    callPromptElement.style.width = '350px';
                    callPromptElement.style.animation = 'pulse 2s infinite';
            
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
                    progressBar.style.backgroundColor = '#18FF00';
                    progressBarContainer.appendChild(progressBar);
            
                    callPromptElement.appendChild(progressBarContainer);
            
                    // Message
                    const messageElement = document.createElement('div');
                    messageElement.id = 'call-message';
                    messageElement.innerText = `${this.formatPlayerId(leaderId)} is initiating an audio stream. Accept?`;
                    messageElement.style.fontFamily = 'Orbitron, sans-serif';
                    messageElement.style.textAlign = 'left';
                    messageElement.style.marginLeft = '10px';
                    messageElement.style.fontSize = '15px';
                    messageElement.style.marginBottom = '10px';
                    callPromptElement.appendChild(messageElement);
            
                    // Button container
                    const buttonContainer = document.createElement('div');
                    buttonContainer.style.display = 'flex';
                    buttonContainer.style.justifyContent = 'space-between';
                    buttonContainer.style.width = '100%';
            
                    // Accept button
                    const acceptButton = document.createElement('button');
                    acceptButton.id = 'ordinaryButton';
                    acceptButton.innerHTML = `${feather.icons['check-square'].toSvg({ width: 15, height: 15 })} JOIN`;
                    acceptButton.style.marginRight = '10px';
                    acceptButton.style.whiteSpace = 'pre';
                    acceptButton.style.display = 'flex';
                    acceptButton.style.justifyContent = 'center';
                    acceptButton.style.alignItems = 'center';
                    acceptButton.style.color = '#fff';
                    acceptButton.style.fontSize = '14px';
                    acceptButton.style.flex = '1';
                    acceptButton.style.fontFamily = 'Orbitron, sans-serif';
                    acceptButton.onclick = () => {
                        console.log(`Accepting party call from ${leaderId}`);
                        this.respondToPartyCall('yes', leaderId);
                        if (this.sounds && typeof this.sounds.ringtone.sound.stop === 'function') {
                            this.sounds.ringtone.sound.stop();
                        };
                        document.body.removeChild(callPromptElement);
                    };
                    buttonContainer.appendChild(acceptButton);
                    feather.replace();
            
                    // Decline button
                    const declineButton = document.createElement('button');
                    declineButton.id = 'ordinaryButton';
                    declineButton.innerHTML = `${feather.icons['x-square'].toSvg({ width: 15, height: 15 })} DECLINE`;
                    declineButton.style.whiteSpace = 'pre';
                    // declineButton.style.backgroundColor = '#FF5733';
                    declineButton.style.display = 'flex';
                    declineButton.style.fontFamily = 'Orbitron, sans-serif';
                    declineButton.style.justifyContent = 'center';
                    declineButton.style.alignItems = 'center';
                    declineButton.style.fontSize = '14px';
                    declineButton.style.flex = '1';
                    declineButton.onclick = () => {
                        console.log(`Declining party call from ${leaderId}`);
                        this.respondToPartyCall('no', leaderId);
                        if (this.sounds && typeof  this.sounds.ringtone.sound.stop === 'function') {
                            this.sounds.ringtone.sound.stop();
                        };
                        document.body.removeChild(callPromptElement);
                    };
                    buttonContainer.appendChild(declineButton);
            
                    callPromptElement.appendChild(buttonContainer);
                    document.body.appendChild(callPromptElement);
            
                    // Progress bar animation
                    setTimeout(() => {
                        progressBar.style.transition = 'width 20s linear';
                        progressBar.style.width = '0%';
                    }, 100);
            
                    // Auto-remove after 20 seconds
                    let timeLeft = 20;
                    const countdownInterval = setInterval(() => {
                        timeLeft -= 1;
                        if (timeLeft <= 0) {
                            clearInterval(countdownInterval);
                            document.body.removeChild(callPromptElement);
                            if (this.sounds && typeof  this.sounds.ringtone.sound.stop === 'function') {
                                this.sounds.ringtone.sound.stop();
                            };
                        }
                    }, 1000);
                }
            };            

            respondToPartyCall = async (response, leaderId) => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    if (response === 'yes') {
                        console.log(`Accepting party call from leader: ${leaderId}. Creating WebRTC offer...`);
            
                        // ✅ Request microphone access if not already granted
                        if (!this.localStream) {
                            try {
                                await this.requestMicrophoneAccess();
                            } catch (error) {
                                console.error("Failed to get microphone access:", error);
                                return;
                            }
                        }
            
                        // ✅ Establish PeerConnection
                        const peerConnection = new RTCPeerConnection();
                        this.peerConnections = this.peerConnections || {};
                        this.peerConnections[leaderId] = peerConnection;
            
                        // ✅ Handle ICE candidates
                        peerConnection.onicecandidate = event => {
                            if (event.candidate) {
                                this.ws.send(JSON.stringify({
                                    type: 'iceCandidate',
                                    senderId: this.playerId,
                                    receiverId: leaderId,
                                    candidate: event.candidate
                                }));
                            }
                        };
            
                        // ✅ Handle incoming remote audio track
                        peerConnection.ontrack = (event) => {
                            console.log(`🎧 Received remote audio track from ${leaderId}`);
                            this.setAudioStreamForMember(leaderId, event.streams[0]);
                            console.log("Streams from respond to party call:", event.streams)

                        };
            
                        // ✅ Add local audio stream
                        this.localStream.getTracks().forEach(track => peerConnection.addTrack(track, this.localStream));
                        console.log("Respond local stream", this.localStream);
            
                        // ✅ Create and send the offer
                        const offer = await peerConnection.createOffer();
                        await peerConnection.setLocalDescription(offer);
            
                        this.ws.send(JSON.stringify({
                            type: 'partyCallResponse',
                            senderId: this.playerId,
                            leaderId: leaderId,
                            receiverId: leaderId,
                            response: 'yes',
                            offer: offer
                        }));
            
                        console.log("Sent WebRTC offer to leader:", leaderId);
                    } else {
                        this.ws.send(JSON.stringify({
                            type: 'partyCallResponse',
                            senderId: this.playerId,
                            leaderId: leaderId,
                            receiverId: leaderId,
                            response: 'no'
                        }));
                        console.log(`Declined party call from leader: ${leaderId}`);
                    }
                } else {
                    console.error("WebSocket connection is not open. Cannot send partyCallResponse.");
                }
            };            

            handlePartyCallResponse = async (senderId, response, offer = null, answer = null) => {
                console.log(`📥 Handling partyCallResponse from ${senderId}, response: ${response}`);
            
                // Ensure PeerConnection exists
                this.peerConnections = this.peerConnections || {};
                let peerConnection = this.peerConnections[senderId];
            
                if (!peerConnection) {
                    console.log(`🔗 Creating new PeerConnection for ${senderId}`);
                    peerConnection = new RTCPeerConnection();
                    this.peerConnections[senderId] = peerConnection;
            
                    // ✅ Handle incoming remote audio track
                    peerConnection.ontrack = (event) => {
                        console.log(`🎧 Received remote audio track from ${senderId}`);
                        this.setAudioStreamForMember(senderId, event.streams[0]);
                        console.log("Streams from handle party call response:", event.streams)

                    };
            
                    // ✅ Handle ICE candidates
                    peerConnection.onicecandidate = (event) => {
                        if (event.candidate) {
                            console.log("📡 Sending ICE candidate to:", senderId);
                            this.ws.send(JSON.stringify({
                                type: 'iceCandidate',
                                senderId: this.playerId,
                                receiverId: senderId,
                                candidate: event.candidate,
                            }));
                        }
                    };
                }

                // ✅ Share the leader's stream with all members
                if (this.isPartyLeader && this.localStream) {
                    console.log("Sharing leader's audio stream with all members...");
                    this.setAudioStreamForAllMembers(this.localStream);
                }
            
                // ✅ Handle WebRTC offer
                if (response === 'offer' && offer) {
                    try {
                        console.log("📨 Received WebRTC offer. Setting remote description...");
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                        console.log("✅ Remote description set. Creating WebRTC answer...");
            
                        // ✅ Add the leader's local audio track
                        if (this.localStream) {
                            const audioTrack = this.localStream.getAudioTracks()[0];
                            if (audioTrack && !peerConnection.getSenders().find((sender) => sender.track === audioTrack)) {
                                console.log("🔊 Adding leader's local audio track to PeerConnection...");
                                peerConnection.addTrack(audioTrack, this.localStream);
                            }
                        }
            
                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);
            
                        this.ws.send(JSON.stringify({
                            type: 'partyCallResponse',
                            senderId: this.playerId,
                            receiverId: senderId,
                            response: 'answer',
                            answer: answer,
                        }));
            
                        console.log("📨 Sent WebRTC answer to:", senderId);
                    } catch (error) {
                        console.error("❌ Error handling offer:", error);
                    }
                }
            
                // ✅ Handle WebRTC answer
                if (response === 'answer' && answer) {
                    try {
                        console.log("📨 Received WebRTC answer. Setting remote description...");
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                        console.log("✅ Remote description set for:", senderId);
            
                        // ✅ Add the leader's local audio track (again, to ensure it's available)
                        if (this.localStream) {
                            const audioTrack = this.localStream.getAudioTracks()[0];
                            if (audioTrack && !peerConnection.getSenders().find((sender) => sender.track === audioTrack)) {
                                console.log("🔊 Adding leader's local audio track to PeerConnection...");
                                peerConnection.addTrack(audioTrack, this.localStream);
                            }
                        }
                    } catch (error) {
                        console.error("❌ Error setting remote description:", error);
                    }
                }
            };            
            
            setAudioStreamForMember = (memberId, stream) => {
                let audioElement = document.querySelector(`#audio-${memberId}`);
                
                // ✅ Reset the audio element if it already exists
                if (audioElement) {
                    audioElement.srcObject = null;
                    audioElement.remove();
                    console.log(`🔄 Resetting audio element for ${memberId}`);
                }
            
                // ✅ Create a new audio element
                audioElement = document.createElement('audio');
                audioElement.id = `audio-${memberId}`;
                audioElement.autoplay = true;
                audioElement.playsInline = true;
                document.body.appendChild(audioElement);
            
                // ✅ Set the audio stream
                audioElement.srcObject = stream;
                console.log(`✅ Audio stream set for ${memberId}`);
            
                audioElement.onloadedmetadata = () => {
                    audioElement.play().catch((error) => {
                        console.error("Error playing audio:", error);
                    });
                };
            };            

            setAudioStreamForAllMembers = (stream) => {
                if (!this.peerConnections) {
                    console.error("No PeerConnections available.");
                    return;
                }
            
                Object.keys(this.peerConnections).forEach((peerId) => {
                    console.log(`🔊 Adding stream to PeerConnection with ID: ${peerId}`);
            
                    const peerConnection = this.peerConnections[peerId];
                    const existingTracks = peerConnection.getSenders().map(sender => sender.track);
            
                    // Only add tracks if they aren't already added
                    stream.getTracks().forEach(track => {
                        if (!existingTracks.includes(track)) {
                            peerConnection.addTrack(track, stream);
                            console.log(`✅ Added track to ${peerId}`);
                        }
                    });
                });
            };            
            
            startPartyCallSession = async (leaderId, memberId) => {
                console.log(`Starting party call session. Leader: ${leaderId}`);
            
                // Request microphone access and ensure the local stream is available
                try {
                    await this.requestMicrophoneAccess();
                } catch (error) {
                    console.error("Failed to get microphone access:", error);
                    return;
                }
            
                if (!this.localStream) {
                    console.error("No microphone stream available.");
                    return;
                }
            
                // Check if the session UI already exists
                if (document.getElementById('party-call-session')) {
                    console.warn("Party call session UI already exists.");
                    return;
                }
            
                // Create the call session display
                this.createCallSessionUI(this.isPartyLeader);
            
            };
            
            createCallSessionUI = (isPartyLeader) => {
                const sessionElement = document.createElement('div');
                sessionElement.id = 'party-call-session';
                sessionElement.style.cssText = `
                    position: absolute;
                    top: 16px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.7);
                    color: #fff;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 10px;
                    z-index: 999;
                `;
            
                const timerElement = document.createElement('span');
                timerElement.id = 'call-timer';
                timerElement.innerText = '00:00';
                sessionElement.appendChild(timerElement);
            
                const endCallButton = document.createElement('button');
                endCallButton.id = 'end-call-button';
                endCallButton.innerText = 'End Call';
                endCallButton.style.cssText = `
                    margin-left: 10px;
                    background: #ff4b4b;
                    color: #fff;
                    border: none;
                    padding: 3px 5px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 10px;
                `;
                sessionElement.appendChild(endCallButton);
            
                const chatBox = document.getElementById('party-chat-box');
                if (chatBox) {
                    chatBox.parentElement.insertBefore(sessionElement, chatBox);
                }
            
                let callStartTime = Date.now();
                const updateTimer = () => {
                    const elapsedTime = Date.now() - callStartTime;
                    const minutes = String(Math.floor(elapsedTime / 60000)).padStart(2, '0');
                    const seconds = String(Math.floor((elapsedTime % 60000) / 1000)).padStart(2, '0');
                    timerElement.innerText = `${minutes}:${seconds}`;
                };
            
                this.timerInterval = setInterval(updateTimer, 1000);
            
                endCallButton.addEventListener('click', () => {
                    console.log("Ending call session.");
                
                    // Notify the server based on whether the user is the party leader
                    if (isPartyLeader) {
                        this.ws.send(JSON.stringify({
                            type: 'endPartyCall',
                            senderId: this.playerId,
                            leaderId: this.playerId
                        }));
                    } else {
                        this.ws.send(JSON.stringify({
                            type: 'leavePartyCall',
                            senderId: this.playerId
                        }));
                    }
                
                    // Clean up the call session
                    this.cleanUpCallSession();
                });
            };

            cleanUpCallSession = () => {
                // Stop the timer
                clearInterval(this.timerInterval);
                document.getElementById('party-call-session')?.remove();
            
                // Stop the local microphone stream
                if (this.localStream) {
                    this.localStream.getTracks().forEach(track => track.stop());
                    console.log("Microphone stream stopped.");
                    this.localStream = null; // Reset the localStream
                }
            
                // Close all PeerConnections
                if (this.peerConnections) {
                    Object.keys(this.peerConnections).forEach(peerId => {
                        const peerConnection = this.peerConnections[peerId];
                        if (peerConnection) {
                            peerConnection.close();
                            console.log(`PeerConnection with ${peerId} closed.`);
                        }
                    });
                    this.peerConnections = {}; // Reset the PeerConnections
                }
            };            
            
        setupMultiplayer = async (playerId, token, carName, matcaps) => {
            try {
                // Check if the token is provided
                if (!token) {
                    console.error('JWT token is required for authentication');
                    return;
                }

                this.playerId = playerId;
                this.carName = carName;
                this.matcaps = matcaps;
                if (typeof window !== 'undefined') {
                    if (!this.carName) {
                        this.carName = localStorage.getItem('selectedCarName') || null;
                    }
                    if (!this.matcaps || Object.keys(this.matcaps).length === 0) {
                        try {
                            const savedMatcaps = localStorage.getItem('matcaps');
                            this.matcaps = savedMatcaps ? JSON.parse(savedMatcaps) : (this.matcaps || {});
                        } catch (error) {
                            this.matcaps = this.matcaps || {};
                        }
                    }
                }
                this.applyRandomMatcapsIfMissing();

                this.cars = {};
                this.otherPlayers = {};

                // Add the token to the WebSocket URL query parameter
                const wsBaseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8080';
                const serverAddress = `${wsBaseUrl}?token=${encodeURIComponent(token)}`;
                const ws = new WebSocket(serverAddress)
                this.ws = ws;  // Store the WebSocket connection

                // Set up WebSocket event handlers
                this.setupWebSocketHandlers(ws);     

                this.setCar(this.playerId, this.carName, this.matcaps);
                const playerCar = this.car;

                this.initializeTargetDetection();
                this.initControllerSetup();
                this.initCustomController();

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

                document.getElementById('friend-invite-button').addEventListener('click', () => {
                    const targetPlayerId = this.detectNearestTarget();
                    if (targetPlayerId) {
                        const playerId = this.car.playerId;

                        if (this.isAlreadyLinked(targetPlayerId)) {
                            this.showPopup(`You are already linked with ${this.formatPlayerId(targetPlayerId)}`);
                            return;
                        }
                
                        console.log(`Sending friendship invite from ${playerId} to ${targetPlayerId}`);
                        sendFriendInvite(targetPlayerId, playerId);
                    } else {
                        this.showPopup(`No target player found for the connection invite.`);
                        // console.error('No target player found for friendship invite.');
                    }
                });

                // Initialize the friend list toggle after the DOM is loaded
                document.addEventListener('DOMContentLoaded', () => {
                    this.createFriendListToggle();
                });     
                
                // Invite a target player to friendship
                function sendFriendInvite(targetPlayerId, playerId) {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'inviteFriendship',
                            friendRequestId: playerId,
                            targetPlayerId: targetPlayerId
                        }));
                
                        console.log(`Friendship invite sent from ${playerId} to ${targetPlayerId}`);
                    } else {
                        console.error('WebSocket connection is not open. Invite not sent.');
                    }
                }                            

                // Add the invite button event listener
                document.getElementById('invite-button').addEventListener('click', () => {
                    if (this.inParty && !this.isPartyLeader) {
                        this.showPopup('Only party leader can invite players.');
                        return;
                    }

                    const targetPlayerId = this.detectNearestTarget();
                    
                    if (targetPlayerId) {
                        const playerId = this.car.playerId;

                        // Check if the party is already full (2 players including leader)
                        if (this.partyMembers && this.partyMembers.length >= 2) {
                            this.showPopup('The party is full. You cannot invite more players.');
                            return;
                        }

                        // Check if the targetPlayerId is already in a party
                        if (this.partyMembers && this.partyMembers.includes(targetPlayerId)) {
                            this.showPopup(`Target player ${targetPlayerId} is already in party.`);
                        } else {
                            console.log(`Sending invite from ${playerId} to ${targetPlayerId}`);
                            sendInvite(targetPlayerId, playerId);
                        }
                    } else {
                        console.error('No target player found for invite.');
                        // Show the popup with a custom message
                        this.showPopup('No target player found for the party invite.');
                    }
                });

                // Add event listener to the OK button to close the popup
                document.getElementById('ok-button').addEventListener('click', () => {
                    const popup = document.getElementById('no-target-popup');

                    // Apply the scale-out animation
                    popup.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                    popup.style.transform = 'translate(-50%, -50%) scale(0)';
                    popup.style.opacity = '0';

                    // After the animation ends, hide the popup
                    setTimeout(() => {
                        popup.style.display = 'none';
                    }, 500); // Match the transition duration
                });

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

                // Create the toggle chat visibility button inside the chat box
                const toggleList = document.getElementById('toggle-contact')
                toggleList.innerHTML = `${feather.icons['x'].toSvg({ width: 15, height: 15 })}`;

                document.getElementById('toggle-contact-list').addEventListener('click', this.toggleFriendList);
                toggleList.addEventListener('click', this.toggleFriendList);

                // Create the toggle chat visibility button inside the chat box
                const toggleSettingsWindow = document.getElementById('toggle-settings-window')
                toggleSettingsWindow.innerHTML = `${feather.icons['x'].toSvg({ width: 15, height: 15 })}`;

                document.getElementById('toggle-settings').addEventListener('click', this.toggleSettings);
                toggleSettingsWindow.addEventListener('click', this.toggleSettings);
            
                // Event listener for sending a message
                document.getElementById('send-message-button').addEventListener('click', () => {
                    const messageInput = document.getElementById('party-message-input');
                    const messageText = messageInput.value;
                    if (messageText) {
                    this.sendPartyMessage(messageText);
                    messageInput.value = ''; // Clear the input after sending
                    }
                });

                // Event listener for sending a message with the Enter key
                document.getElementById('party-message-input').addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        const messageInput = event.target;
                        const messageText = messageInput.value;
                        if (messageText) {
                            this.sendPartyMessage(messageText);
                            messageInput.value = ''; // Clear the input after sending
                        }
                        event.preventDefault(); // Prevent the default behavior of Enter (like form submission)
                    }
                });

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
                toggleChatButton.innerHTML = `${feather.icons['x'].toSvg({ width: 15, height: 15 })}`;
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

                toggleChatButton.addEventListener('click', this.toggleChatVisibility);

                const messageInput = document.createElement('input');
                messageInput.id = 'party-message-input';
                messageInput.style.width = '80%';
                chatContainer.appendChild(messageInput);

                const sendButton = document.createElement('button');
                sendButton.id = 'send-message-button';
                sendButton.innerHTML = `${feather.icons['send'].toSvg({ width: 15, height: 15 })}`;
                sendButton.style.width = '20%';
                chatContainer.appendChild(sendButton);
        
                this.time.on('tick', () => {
                    
                    // Check if score has reached the next multiple of 500
                    // if (playerCar.score >= lastAirdropScore + 5) {
                    //     lastAirdropScore += 5;
                    //     dropAirdrop(playerCar);
                    // }
                    
                    // const coinPosition = this.currentCoin ? this.currentCoin.position : null; // Default values

                    const playerPosition = {
                        x: playerCar.physics.car.chassis.body.position.x,
                        y: playerCar.physics.car.chassis.body.position.y,
                        z: playerCar.physics.car.chassis.body.position.z
                    };

                    const playerRotation = {
                        x: playerCar.physics.car.chassis.body.quaternion.x,
                        y: playerCar.physics.car.chassis.body.quaternion.y,
                        z: playerCar.physics.car.chassis.body.quaternion.z,
                        w: playerCar.physics.car.chassis.body.quaternion.w
                    }

                    const playerVelocity = {
                        x: playerCar.physics.car.chassis.body.velocity.x,
                        y: playerCar.physics.car.chassis.body.velocity.y,
                        z: playerCar.physics.car.chassis.body.velocity.z
                    }
                    
                    const updateData = {
                        type: 'update',
                        playerId: this.playerId,
                        worldId: this.worldId,
                        selectedCar: this.carName || undefined,
                        position: playerPosition,
                        rotation: playerRotation,
                        velocity: playerVelocity,
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
                            siren: playerCar.controls.actions.siren
                        },
                        battery: playerCar.battery,
                        score: playerCar.score,
                    };

                    const previousLocalScore = this.playerScores[this.playerId] || 0;
                    if (playerCar.score > previousLocalScore) {
                        this.animateScoreGain(playerCar);
                    }
                    this.playerScores[this.playerId] = playerCar.score;

                    // Handle collision check if a coin is active
                    if (this.currentCoin) {
                        const coinPosition = this.currentCoin.position;
                        this.checkCoinCollision(playerCar, coinPosition, () => {
                            // Collision logic, e.g., increase score or collect the coin
                            playerCar.score += 10; // Example action for collision
                            // this.updateScoreStatus(playerCar.score);
                            // Reset coin visibility or position after pickup
                            this.currentCoin = null; // Remove the coin locally
                            this.coinActive = false;
                            // Notify server to hide the coin for other players
                            this.ws.send(JSON.stringify({ type: 'coinPickedUp', worldId: this.worldId }));
                        });
                    } else {
                        // console.log("No coin to check for collision.");
                    }

                    this.updateBatteryStatus(playerCar.battery);
                    this.updateScoreStatus(playerCar.score);
                    this.refreshPartyMemberHpUI();
        
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(updateData));
                    } else if (ws.readyState === WebSocket.CONNECTING) {
                        this.messageQueue.push(updateData);
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

    // Update the mini-map with player positions and coin position
    updateMiniMap(playerId, x, y, frontWheelQuaternion, isOtherPlayer, isCoin = false) {
        // Handle player updates
        if (!isCoin && !this.miniMapElements[playerId]) {
            const newElement = document.createElement('div');
            newElement.id = `player-${playerId}`;
            newElement.style.position = 'absolute';
            newElement.style.width = '5px'; // Adjust for visibility
            newElement.style.height = '5px';
            newElement.style.backgroundColor = isOtherPlayer ? '#FF5733' : 'white';
            newElement.style.borderRadius = '0'; // Player is not circular
            newElement.style.transformOrigin = 'center center';

            // Player arrow display code
            const triangle = document.createElement('div');
            triangle.style.position = 'absolute';
            triangle.style.width = '0';
            triangle.style.height = '0';
            triangle.style.borderLeft = '6px solid transparent';
            triangle.style.borderRight = '6px solid transparent';
            triangle.style.borderBottom = isOtherPlayer ? '10px solid #FF5733' : '10px solid white';
            triangle.style.bottom = '100%';
            triangle.style.left = '50%';
            triangle.style.transform = 'translateX(-50%)';
            newElement.appendChild(triangle);

            this.miniMap.appendChild(newElement);
            this.miniMapElements[playerId] = newElement;
        }

        // Update position of the player on the mini-map
        const miniMapSize = 100; // The size of the mini-map in pixels
        const mapScale = 0.05; // Scale factor to convert world coordinates to mini-map coordinates

        const mapX = miniMapSize / 2 + x * mapScale;
        const mapY = miniMapSize / 2 - y * mapScale;

        if (!isCoin) {
            const elementToUpdate = this.miniMapElements[playerId];
            elementToUpdate.style.left = `${mapX}px`;
            elementToUpdate.style.top = `${mapY}px`;

            // Rotate player icon if quaternion is provided
            if (frontWheelQuaternion) {
                const angle = Math.atan2(
                    2.0 * (frontWheelQuaternion.w * frontWheelQuaternion.z + frontWheelQuaternion.x * frontWheelQuaternion.y),
                    1.0 - 2.0 * (frontWheelQuaternion.y * frontWheelQuaternion.y + frontWheelQuaternion.z * frontWheelQuaternion.z)
                ) * (180 / Math.PI);

                const adjustedAngle = -angle + 90;
                elementToUpdate.style.transform = `rotate(${adjustedAngle}deg)`;
            }
        }

        // Handle coin updates
        if (isCoin) {
            let coinElement = this.miniMapElements['coin'];
            if (!coinElement) {
                // Create the coin element as a gun sight (crosshair) using Feather icons
                coinElement = document.createElement('div');
                coinElement.id = 'coin';
                coinElement.style.position = 'absolute';
                coinElement.style.width = '5px'; // Set the width
                coinElement.style.height = '5px'; // Set the height
                coinElement.style.color = 'rgb(255, 87, 51)'; // Set the height
                coinElement.style.transform = 'translate(-50%, -50%)'; // Center the element
                coinElement.innerHTML = `${feather.icons['x'].toSvg({ width: 5, height: 5 })}`; // Set the SVG as innerHTML
                coinElement.classList.add('pulsing'); // Add pulsing class for animation
                
                feather.replace();
                this.miniMap.appendChild(coinElement);
                this.miniMapElements['coin'] = coinElement; // Store the coin element
            }

            // Update coin position
            const coinMapX = miniMapSize / 2 + x * mapScale; // x for the coin position
            const coinMapY = miniMapSize / 2 - y * mapScale; // y for the coin position

            coinElement.style.left = `${coinMapX}px`;
            coinElement.style.top = `${coinMapY}px`;
        }
    }

    // To remove the coin from the mini-map when collected
    removeCoinFromMiniMap() {
        if (this.miniMapElements['coin']) {
            const coinElement = this.miniMapElements['coin'];
            this.miniMap.removeChild(coinElement);
            delete this.miniMapElements['coin']; // Remove it from the tracking object
        }
    }

    // Remove player from the mini-map
    removeFromMiniMap(playerId) {
        const playerElement = this.miniMapElements[playerId];
        if (playerElement) {
            this.miniMap.removeChild(playerElement);
            delete this.miniMapElements[playerId];
        }
    }

    generateNewPosition() {
        // Define boundaries for random position generation
        const xMin = -50;  // Minimum X boundary
        const xMax = 50;   // Maximum X boundary
        const zMin = -50;  // Minimum Z boundary
        const zMax = 50;   // Maximum Z boundary
        const yHeight = 1; // Fixed Y position (height) above the ground
    
        // Generate random coordinates within boundaries
        const x = Math.random() * (xMax - xMin) + xMin;
        const z = Math.random() * (zMax - zMin) + zMin;
    
        // Return the new position as an object
        return new THREE.Vector3(x, yHeight, z);
    }  

    dropCoinAtPosition(position) {

        // Set the position of the group based on the provided position
        const initialZPosition = 50; // Start above ground level
        const initialXPosition = position.x + (Math.random() - 0.5) * 20; // Random x offset
        const initialYPosition = position.y + (Math.random() - 0.5) * 20; // Random y offset
        const targetZPosition = 1.1;

        // Check if there's already a coin in the scene
        if (this.currentCoin && this.container.children.includes(this.currentCoin)) {
            // Reposition the existing coin
            this.currentCoin.position.set(position.x, position.y, position.z);
        } else {
            // Define the visual and collision components
            const coinVisual = this.resources.items.krashCoinBase.scene.clone();
            const coinCollision = this.resources.items.krashCoinCollision.scene.clone();
    
            // Create a group and add both components to it
            const coinGroup = new THREE.Group();
            coinGroup.add(coinVisual);
            coinGroup.add(coinCollision);
    
            coinGroup.position.set(initialXPosition, initialYPosition, initialZPosition);
            this.currentCoin = coinGroup;
    
            // Apply material to the visual component only
            coinVisual.traverse((child) => {
                if (child.isMesh) {
                    child.material = this.materials.shades.items.volcano;
                }
            });
    
            // Add the coin group to the scene
            this.container.add(coinGroup);

            // Add a rotation animation
            gsap.to(this.currentCoin.rotation, 10, {
                x: Math.PI * 2,
                // y: Math.PI * 2,
                z: Math.PI * 2, // Full rotation around the y-axis
                repeat: -1,     // Infinite repeat for continuous spinning
                ease: "linear"
            });
    
            // Animate the drop from initialZPosition to targetZPosition
            gsap.fromTo(
                coinGroup.position, 2,
                { 
                    x: this.currentCoin.position.x,
                    y: this.currentCoin.position.y,
                    z: initialZPosition
                },
                {
                    x: position.x,
                    y: position.y,
                    z: targetZPosition,
                    ease: "bounce.out",
                    onComplete: () => {
                        console.log("Coin has reached ground level:", targetZPosition);
                        coinGroup.position.set(position.x, position.y, targetZPosition);
                    }
                }
            );
        }
    
        // After setting the position, broadcast the updated coin position
        if (this.ws.readyState === WebSocket.OPEN) {
            const dropCoinMessage = {
                type: 'dropKrashcoin',
                position: { x: position.x, y: position.y, z: targetZPosition } // Use the given position
            };
            this.ws.send(JSON.stringify(dropCoinMessage));
        }
    
        // Update mini-map with the coin's position
        this.updateMiniMap('coin', position.x, position.y, null, false, true); // Pass 'true' for isCoin
    }    
    
    checkCoinCollision(playerCar, coinPosition, onCollision) {
        // Retrieve player position
        const playerPosition = playerCar?.physics?.car?.chassis?.body?.position;
    
        if (!playerPosition || typeof playerPosition !== 'object' || !('x' in playerPosition) || !('y' in playerPosition) || !('z' in playerPosition)) {
            console.error("Invalid player position: playerCar position is not defined or is not a valid object", playerPosition);
            return;
        }
    
        if (!coinPosition || typeof coinPosition !== 'object' || !('x' in coinPosition) || !('y' in coinPosition) || !('z' in coinPosition)) {
            console.error("Invalid coin position: coinPosition is not defined or is not a valid object", coinPosition);
            return;
        }
    
        // Define a collision threshold based on game scale
        const collisionThreshold = 1.5;

        // Calculate distance between player car and coin
        const dx = playerPosition.x - coinPosition.x;
        const dy = playerPosition.y - coinPosition.y;
        const dz = playerPosition.z - coinPosition.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
        // console.log("Distance between player car and coin:", distance);
    
        // If distance is within threshold, trigger collision logic
        if (distance <= collisionThreshold && !this.collisionLock) {
            // console.log("Collision detected with coin!");
            // onCollision();  // Execute the callback for when collision is detected

            this.collisionLock = true;

            // Notify the server that the coin has been picked up
            this.ws.send(JSON.stringify({
                type: 'coinPickedUp',
                worldId: this.worldId
            }));

            // Hide the coin locally
            this.hideCoin();

            // Run the optional onCollision callback if provided
            if (onCollision) onCollision();

            // Reset collision lock after a brief delay to handle next coin drops
            setTimeout(() => {
                this.collisionLock = false;
            }, 500); // Adjust timeout as needed based on game dynamics
        }
    }
    
    hideCoin() {
        if (this.currentCoin) {
            // Hide the coin visually
            this.currentCoin.visible = false;
    
            // Remove the coin from the container
            this.container.remove(this.currentCoin);

            // Remove from mini-map
            this.removeCoinFromMiniMap();
            
            // Set currentCoin to null after removing
            this.currentCoin = null;

            // Mark the coin as inactive
            this.coinActive = false; // Reset this flag

            console.log("Coin hidden from scene.");
        } else {
            console.warn("No current coin to hide.");
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
        if (score !== undefined && score !== null ) {
            scoreElement.textContent = `₭ ${score}`;
            this.car.score = score;
        }
    }

    // Function to update the score with the server (sync with server-side)
    updateDataScore(score) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const updateScoreMessage = {
                type: 'updateScore',
                playerId: this.playerId,
                score: score
            };
            console.log(`Updating score for player ${this.playerId} to ${score}`);
            this.ws.send(JSON.stringify(updateScoreMessage));
        } else {
            console.error('WebSocket connection is not open. Cannot update score');
        }
    }

    async signIn(playerId, token) {

        // Use playerId passed in or fallback to the one stored in class
        const id = playerId || this.playerId;

        try {
            // Ensure playerId is provided (from WalletConnect)
            if (!id) {
                throw new Error('No playerId found. Please ensure the wallet is connected.');
            }
        
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
            const inviteFriend = document.getElementById('friend-invite-button');
            const contactList = document.getElementById('toggle-contact-list');
            const settings = document.getElementById('toggle-settings');

            inviteButton.innerText = 'TEAM UP';
            inviteFriend.innerText = 'LINK UP';
            contactList.innerText = 'LINK BOX';
            settings.innerText = 'JOYSTICK';
            
            if (userDisplay) {
                userDisplay.innerHTML = formatPlayerId(playerId);
                batteryStatus.style.opacity = 1;
                scoreElement.style.opacity = 1;
                coinMarket.style.opacity = 1;
                inviteButton.style.opacity = 1;
                inviteFriend.style.opacity = 1;
                contactList.style.opacity = 1;
                settings.style.opacity = 1;
            }
            this.updateInviteButtonState();
    
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
        this.startingScreen.startLabel.image.src = '/images/mobile/start.png'
        // this.startingScreen.startLabel.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAFACAIAAABC8jL9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAZY0lEQVR4nO3dfVBU190H8LMbEAV5sYICGrtd6Uo2SDa8SQmxqFRiwVA1GIOGODYylMnMYzOko6RT01rGSVEJUePYaBIS8WU21FBDFBHRIENWhBWZlZflcjeNISZjUIxaqxnv8wcdk/rCm5xz7rn7/fzljMP9nXPv/e499+zdcwkBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANAOHe8GwNDIskx1+9evX3/kkUeoloAR5MG7ATBkBoOB3sZdLhe9jcOI0/NuAAAMHwIMIDAEGEBgCDCAwBBgAIEhwAACQ4ABBIYAAwgMAQYQGAIMIDAEGEBgCDCAwBBgAIEhwAACQ4ABBIYAAwgMAQYQGAIMIDAEGEBgCDB/P/vZz3g3YTiCg4N5NwEQYH7GjRuXl5d3/Pjxo0ePhoeH827OkL3yyisOh2Pjxo3x8fG82+K+sColB5mZmRkZGRaL5fb6knq9kJ+kZrPZbDYvXLjwwoULVqv1/fffP3/+PO9GAdARHh6+fft2p9Op3MVsNg9yI7Is3/3nI2jw605v3Ljx7r+trq5OT08f7h4CUKX4+Hir1dre3n6/2GgjwH0kSbLZbFlZWcPdWzAEGELTlZqamp2dHR4ebjKZeLeFEaPRaDQaJ0yY8Lvf/c5qtW7fvv3q1au8G6VZCDAtS5YseeGFF0wmk9Fo5N0WDgwGg8FgiI+Pf/bZZw8ePFhYWIgYgxgSEhLKysokSRr8wFVLQ+h7stlsubm5w92jcF+4Ao+k4ODggoKCpKQk97zq9iMuLm7ChAmLFi3asGHDwYMHeTdHOxDgkeHh4fHqq69mZma6z73uUPUNqo1G48mTJ//617+2tLTwbpEWIMAjYPHixWvWrLFYLLwbIoC+GMfFxX300Ue///3veTdHeEI+P6Ae/v7+paWlr7/+OtI7JAaD4Te/+U1jY2NqairvtogNAR6+rKysY8eOZWZmUn1hr1YZDIaoqKg33nhj27ZtHh4YCQ4Tdtxw+Pv7b9myJSEhAZNVDygsLCwsLCwqKuq1117D5NYw4Ao8ZPPnzz9y5MiyZcuQ3pESFxf35ptvFhYWCvpMOEfYX0OTn5+/YcOGmJgY3g3RmrCwsLy8vPLy8tDQUN5tEQkCPFi+vr4lJSUrV67EF0X0pKWllZeXp6Sk8G6IMBDgQYmOjv7kk0+ysrIwX0VbTEzMm2++mZ+fz7shYkCAB5adnb179+7ExETeDXEXJpNp5cqVpaWlOp2Od1vUDrPQAyguLn766adx4WWs73kPk8mUnJzc29vLuznqhStwf7Zv3470chQTE3Ps2LGpU6fyboh6IcD3ptfrS0pK5s6di/TyZbFYPvzwQyy7dT8I8D34+Pjs2bMHU1YqYbFYtm/fjocu7wkBvlNwcPDevXsXL17MuyHwg8jIyL/97W9YpudumMT6H+PHj//ggw+Sk5N5NwTuZDabX3311VGjRu3YsYN3W1QEV+AfeHl57d69G+lVLZPJ9Morr2Bw9GMI8A/+8Y9/zJ07l3croD8mk6mgoOBXv/oV74aoBQL8XxUVFYNfmAo4CgsL+/vf/x4XF8e7IaqAABNCSGlpqdlsxpyzKAwGQ0lJyWOPPca7IfwhwGTr1q0JCQlIr1jCw8Pfe+89/LDE3QP88ssv//rXv0Z6RWSxWLZt2+bj48O7ITy5dYDnzZu3cuVKpFdcs2fP3rJlC+9W8OS+AZ46depf/vIXEd/rCT+WlJS0du1a3q3gxk0DrNfrt2zZgoU1NMBgMCxbtiwzM5N3Q/hw0wC//fbbTz31FO9WwMgICwtbs2aNew6m3DHAf/zjH2fPns27FT84e/ZsT08P71YMWWtrq8vl4t2K/4qIiCgtLX3ooYd4NwQoi4yMbG1tpfdysCGRJKmoqGhI86jqebkZIcRkMpWVldFu0uC9++67Qz8jQCjHjx/nfZopiqJIkmS1WqdPnz7U9qsqwH3mz59fU1NDtVWDJMvyM888M9T2gzDWrl2rhstFQ0PDiy++OLwuqDDAhJCHHnqooKBADUMbu93u6+s7vH0LqhYbG+t0OvmeXk6ns6SkZPLkycPuhToD3CchIaGqqopq8wYDA2kN0uv13Id5LS0t2dnZD9gRNQeYEKLT6QoLC/l+UMqyjJ/+a826des4nlKKotTW1g7jjvduKg9wnyVLlvAdTtvt9qCgoAfvCKiC2Wxub2/ndTLJsrxnz56R6osQASaEBAcH19bWcpxx2Llz54h0BPizWq28TiOn0/mnP/1pBPsiSoD7lJSU8MqwJEn43b8WLFq0SJIkLueQw+EY8ZsxsQJMCFm3bh2vDFdWVo5sX4A1vV5fXV3N5expbGycM2fOiPdIuAATQnJzc7lMa0mSlJOTM+LdAXb+8Ic/sD9vFEVpaGiIjY2l0SMRA0wIWbFiBZdpCJvNNmbMGBo9AurGjx/f2NjI/qRpaGiIjo6m1ClBA0wIWb58OZcMFxYWUuoR0FVUVMT+dLHb7REREfQ6JW6ACSFZWVnsx9Ktra0P8uQM8OHn5+dwOBifK06nk961t4/QASaEvPzyy+znFDdv3ky1UzDy2D+54XQ6GTxJL3qACSHr169nPC8tyzLuhEWi0+kYf8w7nU42E54aCDAhpLi4mHGG169fz6BfMDJWr17N8uSQZZnZ+aGNABPmT9e0t7d7enqy6Ro8EJ1O19LSwvLk2LdvH7PeaSbAgYGBdXV1VPtyh/z8fDZdgwfy0ksvsTwtamtrWT43r5kAE0ISExNZTjTa7XYPD7yOU/VYrrnR2tpK43GrfmgpwISQVatWsbwZzs3NZdk7BrS2qF1iYuKUKVOYldu7d291dTWzctrzxhtvNDU1MSs3b948ZrVgOLZu3crs45xLdDV2BSaEhIaGMntCS5Zlqo/ZsKepK/CYMWMSExPZ1HK5XHl5eWxqaVt3d3dxcTGbFWoNBsNvf/tbBoWY0VSAn3/++cjISAaFXC7XB++/b7fbGdRyB2+99VZXVxebWgkJCV5eXmxqwdCUl5ezGYk1Nzfz6qP2htB9oqOjmT0mvWTJEi59pEE7V+CIiAiz2cygUFdXV1FREYNCbqWxsfHIkSNsamVkZLApxIB2ApyRkREWFsagUEdHx3vvvcegkLvJz89nMyMdHh7O8qsKqrQT4Li4OAZVOjs7N23axKCQG7p48WJ5eTmDQmazOTk5mUEhBjQSYIPBwOYzta2traqqikEh91RcXHzq1CkGhVJTUxlUYUAjAU5KSmJwA9zZ2enm74Onrbe39+OPP2ZQyGAw4LcNKlJWVsZg9vLAgQO8O6rZWejb/P392SyElJKSwrenI0ILV2BPT0+DwcCg0I4dOxhUcXO9vb1Hjx5lUCgtLY1BFRhYSkoKgw/s48eP6/X8P+80fwUmhJhMJgbfCTc2NvLu6Ajgf0Y+ODYL8FdWVt66dYtBIejo6GDwfZKfnx+bBweo0kKAZ8yYQbtEW1vbO++8Q7sK3MZgjYSwsLD4+HjaVWgTPsA6ne4nP/kJ7SpNTU3nz5+nXQVu++ijj86cOUO7CqXF91kSPsBRUVEMBkL47pexW7dunThxgnYVNg//UCV8gB9//HHaJTo7O61WK+0qcIdPPvmE9m8MGYzdaBM+wLQXUieENDU1Xb16lXYVuENFRcWNGzdoVxF9FC18gBMSEmiXwKI5vNAeRRsMBgSYMz8/P6rbd7lchw4doloC7qe+vp52ienTp9MuQZXYAbZYLLSfwbp8+fK//vUvqiXgfg4dOkT7NthisVDdPm1iB3jatGm0S5w8eZJ2Cbifc+fOXb9+nWqJCRMmUN0+bWIHOCQkhHYJBqM46AftXxfq9Xqh33uGAA8AV2C+aK8caDAYpk6dSrUEVWIHmPaP+F0ul8PhoFoC+sdg/zO4EaNH7AAbjUaq279y5YqiKFRLQP+am5vb2tqolvjpT39KdftUiR3gwMBAqttn8Dgu9O/8+fO0H+cQeh5L4AB7eXnR/oFuR0cH1e3DYFy+fJnq9hnMpNAjcIAnTpxI+0vgL7/8kur2YTC6u7upbp/2OI4qgQNM+xksQshXX31FuwQM6Ny5c1S37+3tTXX7VAkc4ICAANolvvjiC9olYEC0x0EIMB/+/v60S2AIrQa0l1IYPXo01e1TJXCAx44dS7vElStXaJeAAX333XdUt48A8+Hr60t1+2fPnr158ybVEjAYtB+H9vDwoLp9qgQOMO1bl1u3bmEZSjX497//TXX7RqNRDQsGD4+o7SaEjBo1incTgAXaASaE+Pj40C5BicABpv2picuv+xB3FC1wgGnfGqlzWOWGHysMfu537do12iUoEfWDh9CfItbr9Xq9Xm2BKd21a5z4aykOCe3ZSpfLxWD1PEoEDjDtbxfMZvOYMWPUth7ln9au5d0E1mgH+MaNG+L+5kyNo8RBunjxIu0SDL5qhgHRPgrijp+J0AHu6emhXQIBVgPaD70jwHxcuHCBdgkGj1vDgGgHWOjn7QQOMO2fiRJCQkNDaZeAAdFeMQNXYD6uXr1Ke9FgoZc704ywsDCq20eA+WDwoLLQy51pBu1XkCHA3Hz//fdUt6+BN7iLLigoiPZjUgzuxegRO8C012qYPHky1e3DgKZNmxYeHk61hNC/+hY7wGfPnqW6fb1e7+npSbUE9I/2DTAhpLW1lXYJesQOsCRJVLdvMBhEf/mV6Gi/PdDlcrW0tFAtQZXYAWawZtUvf/lL2iWgH0lJSbRL0L4Ro0rsAJ8+fZr2N0lPPPEE1e1DP3x8fGhPQdNecIs2sQPsdDppl4iIiKBdAu5n7ty5tJf+7uzspLp92sQOMCGE9g/BPDw8EhISqJaA+5k5cybtEggwZ7SH0AaDYfbs2VRLwP3Ex8fTLvH555/TLkGV8AFuamqiXSI6Opp2CbhbUFBQcHAw7Sqivz4WAR5YZGTk+PHjaVeBOyxdupT2DbDL5Tp16hTVErQJH+BPP/2U9vtjjUbjCy+8QLUE3G3evHm0S5w7d07ctTj6CB/gr7/+msGzrCkpKbRLwI9FRESYTCbaVaqqqmiXoE34ABNCTpw4QbuEyWSKjIykXQVue+6552iPnwkhn356nHYJGFhqaqpC38aNG3l31F3o9fq6ujraB9ThcKhz5eAhEb4DhBCbzXbmzBnaVeLj48Vd/lss8+bNY/Dd+7lz59S2ZvAwaCHAFy5cYLA+VkJCwrJly2hXAUJIVlYWgyo1NTUMqtCmhQATQk6ePMmgytKlSxlUcXOJiYlRUVEMCjGYOoHBmjVrFu1bJkVRZFnOyMjg3VeN27NnD4ND2dDQgBsiFRk7dmxDQwODA19dXc27r1oWHR3d3t7O4DiWlZXx7uvI0MgQ+sqVKwzmsQghBoNhwYIFDAq5p7y8PAZf/xJCdu3axaAKDMETTzzB4JNbURRtTH6o0IwZM1pbWxkcwfr6ei8vL97dhf+l0+lqamoYHH5JknJycnh3V4MOHjzI4PApirJ161befYV7WbduHZszwOFwYLG7kZWTkyNJEpvDl5iYyLu7cC9hYWHMToLNmzfz7q52eHp6trS0sDlwGpuG1MgkVp/Ozk7aC83elpaWNmPGDDa1NG/Dhg3Mli46fhzPP6vYqlWr2HyQK4pSWVnJu7taEBsbK8sym0MmSRLed6Vq3t7ezEbRsizn5+fz7rHY9Hp9bW0tm+OlKMr+/ft59xgG8vbbbzM7ISRJSk1N5d1jge3cuZPZwVIUZfny5bx7DAN55JFHmA3JFEWx2WxBQUG8Oy2kl156ieWRqq+v591jGBw2z9PeZrVaefdYPDNmzGA289wnNzeXd6dhcGJiYlh+tEuStHbtWt6dFomPj091dTWzA6Qoit1u1+l0vPsNg8bssZ4+7e3tmZmZvDstDMZDJEVR8vLyeHcahmLOnDnMpqP7tLe3Jycn8+63ABhPXPUdGlx+xcN4kKYoitPpxLuU+ldUVMTy7qbPn//8Z979hqFLT09nfBFWFKWlpSUkJIR311Vq9erV7NPb2trq7e3Nu+swLFVVVYxPF0VRbDbbxIkTeXdddRh/aXTb+vXreXcdhuvJJ59ks8LDHerr6zGW/rH8/Hz2oyFFURoaGnD5FdvmzZvZnzd9pw6Dt2MKYf369VzSK0nSihUrePceHkxgYCCb5bLu1tzcnJ6eznsHcLZt2zYu6VU0tPCVu8vJyeFy96UoSmtrK5tVjlXIy8urtLSUy25XFMXhcOC9sNpx4MABXmeSJEmFhYW8dwBrFouFzQpH91NQUMB7H8DIiYqK4jWQUxRFluWKigr3mZp+8cUXnU4nr72tKEpdXR2WrdOaoqIijqeUoigOh2P+/Pm8dwNdOp1u586dvG5Y+siy/Oyzz/LeEzDSdDod45+/3PPcKi4u1upjfTNnzrTZbHz3sKIo+/bt470ngI5Zs2bxvTj0sdlsGntFy7hx47Zt28Z32Nynubk5ICCA9/4AatatW6eGDDudTqvVajQaee+PEZCbm8vri7o7yLKMBVK0r7y8nPeZ9l8tLS35+fniLjEdHR1dUVGhhg9ERVFkWcZTk24hJCREJVeMPrW1tatWrRJr1jQ2Nvbdd9/l8pjq/VRUVPDeK8DKggULVHXyKYpis9lWr16t/hjPnDmztLRUDbe7P9bQ0PDwww/z3jfAkEpuhu/Q0tKydu1adU7DzJ8/f//+/Ry/Tr8fp9OJ743cEcfHs/ony/KBAweWLVvGew8RQojZbC4oKHA4HCr8vFMURZbl119/nfdOAh78/Pzq6+t5n4H3JcuyJEklJSUpKSnsd86UKVPy8vJsNps6c3ubm/9iQZtPFAyeyWTat2+fxWLh3ZD+dHV1Xbt2rbu7u6Kiwmaz2Ww2SoUmTpyYmJg4e/bsuLg4Pz8/Nu/afhCHDx9++umn//Of//BuCDfuHmBCyC9+8Yt33nknPDycd0MG6+TJk93d3TabzW63f/nll1999dW33347jO14eHiEhoZOmjRp2rRpjz32mMViCQwMFGgdghMnTqSnp/f09PBuCE8IMCGEpKenb9q0SdDHKk6fPt3T03Pp0qVvvvnmm2++6e3t7enp6e3tvXTp0uXLl2/evBkQEODr6+vv7+/n5xcQEODv7z958uTAwEA/P7+EhATezR+mpqamjIyMrq4u3g0BdcjOzlbbVyNwPw6HIzY2lvcpowoP8W6AWjQ2Nvr4+BiNxnHjxvFuC/Snra1tzZo1R48e5d0QVUCAf3DixImJEyc+/PDD6vwaFgghHR0dmzZt2r17N++GqAUC/D+OHj06ZcqUkJAQZFiFOjs733rrra1bt/JuiIogwHc6fPiwl5fXz3/+c2RYVdra2l577bUdO3bwboi6IMD3UFdXd/Xq1YiICNwPq8SZM2dWrfq/f/7zn7wbAuJYtGiR2n7w4J5sNpvKn7QBlZozZw73VXjcXG1tLX5mBMMXExOjhnWe3FN1dfXYsWN5nwIgOKPRyP5NpW5OkqSysjJx1yphBpNYA7t48eIHH3wwadKkgIAATGsx0NHRsWvXrtzc3Fu3bvFuC2gI9/XK3YHdbn/qqad4H2rQKKPRWFNTo/KfyApKlmWr1Yq3gQJ1mzdvRoZHliRJeXl5vA8suI2lS5c6HA7ep71G2Gy2J598kvchFRImsYappaXl8OHDEyZM8Pb2xszWsHV2dn744YfPP/+80+nk3RZwS88991xdXR3va5iQKisr586dy/sAgtsbPXr0+vXrW1tbeSdCGM3NzbjjBXV59NFHKysrMbnVP0mSSktLQ0JCeB8ugHvJzs7GpfieZFm22+0YM4Pa6XS6/Px8zFHfJstyQ0NDbm4u7yMDMGg6nW7VqlWqeosae7Is19TULF++nPfRABgWnU6Xk5NTW1vLO0qsybJ88OBBjb3HHNzXihUrqqqqeMeKBUmSDhw4kJaWxnuXA4y0tLS00tLS5uZm3imjoqGhYefOnbNmzeK9m90I3szAQWBg4DPPPLNgwQKDwaD+9w8N6OzZs11dXXv37i0vL79y5Qrv5rgXBJinRx99dPHixWlpaQEBAcK92KWzs7Onp2ffvn1Wq/WLL77g3Rw3hQCrwqxZsxYuXJiUlDR27FiDwcC7Of1xuVyXLl06dOhQWVnZqVOneDfH3SHA6hIQEJCamhoTE5OcnKyeMLtcrgsXLhw5cuTUqVMff/yxO7/OU20QYPUKDAxcuHDh9OnT4+PjAwMDGYe5q6vr/Pnzn3322enTp/fv34+bW3VCgMWg1+sjIyPj4+MnTZoUFBQ0derU0NBQs9k8Uts/c+ZMd3f3559//vXXX8uy/Nlnn3V0dGBJKvVDgEU1atQob2/v6Ojoxx9/3NfX19vbe/To0Z6enp6enn3/1WfmzJnHjh27du3a9evXr1+/fuPGje+//77v39euXfv222/tdrvD4fjuu+9u3rzJu08A8CM6nc7T01Onw8c0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICa/T/iOesDCMu57QAAAABJRU5ErkJggg=='
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
            const worldLayer = document.getElementById('world-layer');
            const garageLayer = document.getElementById('garage');
            const worldClock = document.getElementById('worldclock');

            if (loadingLayer) {
                loadingLayer.style.display = 'none';
            }

            if (w3mLayer) {
                w3mLayer.style.display = 'none';
            }

            if (worldLayer) {
                worldLayer.style.display = 'none';
            }

            if (garageLayer) {
                garageLayer.style.display = 'none';
            }

            if (worldClock) {
                worldClock.style.display = 'none';
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
        this.axis = new THREE.AxesHelper(50)
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
            carName: this.carName,
            ws: this.ws
        })
        this.physics.onCarDestroyed = (car, durationMs) => {
            this.playCarDestroyedFx(car, durationMs);
            setTimeout(() => {
                this.playCarRestoreFx(car);
            }, durationMs);
        };
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

