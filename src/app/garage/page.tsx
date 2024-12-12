'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { useSearchParams, useRouter } from 'next/navigation';
import feather from 'feather-icons'

import { FontLoader } from '../javascript/Utils/FontLoader';
import { TextGeometry } from '../javascript/Utils/TextGeometry';

import Slider from 'react-slick';
import { CustomArrowProps } from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import gsap from 'gsap';

export default function GaragePage() {
    const router = useRouter();
    const [navigateToPage, setNavigateToPage] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const playerId = searchParams.get('playerId');
    const [playerAccount, setPlayerAccount] = useState<number>(0);
    const [isWebSocketReady, setIsWebSocketReady] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const [loadingAccount, setLoadingAccount] = useState<boolean>(true); // Initially loading
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const carGroupRef = useRef<THREE.Group>(new THREE.Group());
    const rocketGroupRef = useRef<THREE.Group>(new THREE.Group());
    const showroomGroupRef = useRef<THREE.Group>(new THREE.Group());
    const backgroundGroupRef = useRef<THREE.Group>(new THREE.Group());
    const [currentCarIndex, setCurrentCarIndex] = useState(0);
    const [isOrbitEnabled, setIsOrbitEnabled] = useState(false);
    const [showCustomizationMenu, setShowCustomizationMenu] = useState(false);
    const [view, setView] = useState<'menu' | 'car' | 'rocket' | 'showroom' | 'customize'>('menu');
    const [showMatcapMenu, setShowMatcapMenu] = useState(false);
    const [selectedPart, setSelectedPart] = useState<string | null>(null);
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [currentCarAttributes, setCurrentCarAttributes] = useState<{ [key: string]: number } | null>(null);
    const [filteredPngIcons, setFilteredPngIcons] = useState<{ [key: string]: string }>({});
    const [isBlinking, setIsBlinking] = useState(false);
    const [isButtonActive, setIsButtonActive] = useState(false); // State for button activity
    const [isNitroActive, setIsNitroActive] = useState(false); // State for button activity
    const [isCarLoading, setIsCarLoading] = useState(false); // State for button activity
    const showroomLoaded = useRef(false);

    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); // Reference for camera
    const coinCanvasRef = useRef<HTMLCanvasElement | null>(null);  

    type Car = {
        name: string;
        price: number;
        parts: Record<string, string>;
        attributes: {
            PWR: number; // Strength
            HP: number;  // Health
            SPD: number; // Speed
            BRK: number; // Brake Strength
        };
    };

    const cars: Car[] = [
        {
            name: 'Kybertruck',
            price: 378000,
            parts: {
                backlights: '/models/car/default/showroombacklights.glb',
                headlights: '/models/car/default/showroomheadlights.glb',
                chassisbottom: '/models/car/default/showroomchassisbottom2.glb',
                chassis: '/models/car/default/chassisbody.glb',
                spoiler: '/models/car/default/spoiler.glb',
                window: '/models/car/default/window.glb',
                wheels: '/models/car/default/showroomwheels.glb',
                tire: '/models/car/default/showroomtire.glb',
                antena: '/models/car/default/antena.glb',
            },
            attributes: {
                PWR: 55,
                HP: 70,
                SPD: 80,
                BRK: 95,
            },
        },
        {
            name: 'Charger Power Bank',
            price: 998000,
            parts: {
                chassis: '/models/charger/showroomchassis.glb',
                chassisbottom: '/models/charger/showroomchassisbottom.glb',
                backlights: '/models/charger/showroombacklights.glb',
                headlights: '/models/charger/showroomheadlights.glb',
                window: '/models/charger/showroomwindow.glb',
                wheels: '/models/charger/wheels.glb',
                tire: '/models/charger/tire.glb',
                antena: '/models/charger/showroomantena.glb',
            },
            attributes: {
                PWR: 55,
                HP: 70,
                SPD: 35,
                BRK: 40,
            },
        },
        {
            name: 'Wreckslinger',
            price: 7500000,
            parts: {
                backlights: '/models/wreckslinger/showroombacklights.glb',
                chassis: '/models/wreckslinger/showroomchassis.glb',
                chassisbottom: '/models/wreckslinger/showroomchassisbottom.glb',
                headlights: '/models/wreckslinger/showroomheadlights.glb',
                tire: '/models/wreckslinger/tire.glb',
                wheel: '/models/wreckslinger/wheel.glb',
                window: '/models/wreckslinger/showroomwindow.glb',
                antena: '/models/wreckslinger/showroomantena.glb',
            },
            attributes: {
                PWR: 110,
                HP: 80,
                SPD: 110,
                BRK: 90,
            },
        },
        {
            name: 'Gangover',
            price: 7500000,
            parts: {
                backlights: '/models/gangover/showroombacklights.glb',
                chassis: '/models/gangover/showroomchassis.glb',
                chassisbottom: '/models/gangover/showroomchassisbottom.glb',
                headlights: '/models/gangover/showroomheadlights.glb',
                rims: '/models/gangover/rims.glb',
                tire: '/models/gangover/tire.glb',
                windows: '/models/gangover/showroomwindows.glb',
                antena: '/models/gangover/showroomantena.glb',
            },
            attributes: {
                PWR: 110,
                HP: 80,
                SPD: 110,
                BRK: 90,
            },
        },
        {
            name: 'McLaren',
            price: 7500000,
            parts: {
                backlights: '/models/mclaren/showroombacklights.glb',
                chassis: '/models/mclaren/showroomchassis.glb',
                chassisbottom: '/models/mclaren/showroomchassisbottom.glb',
                headlights: '/models/mclaren/showroomheadlights.glb',
                mirrors: '/models/mclaren/showroommirrors.glb',
                wheels: '/models/mclaren/wheels.glb',
                antena: '/models/mclaren/showroomantena.glb',
            },
            attributes: {
                PWR: 110,
                HP: 80,
                SPD: 110,
                BRK: 90,
            },
        },
        {
            name: '240 GTI',
            price: 7500000,
            parts: {
                chassis: '/models/240gti/chassis.glb',
                chassisbottom: '/models/240gti/chassisbottom.glb',
                headlights: '/models/240gti/showroomheadlights.glb',
                backlights: '/models/240gti/showroombacklights.glb',
                tire: '/models/240gti/tire1.glb',
                wheels: '/models/240gti/wheels1.glb',
                windows: '/models/240gti/windows.glb',
                antena: '/models/240gti/antena.glb',
            },
            attributes: {
                PWR: 110,
                HP: 80,
                SPD: 110,
                BRK: 90,
            },
        },
        // {
        //     name: 'Wran Wreckstone',
        //     price: 378000,
        //     parts: {
        //         backhoodtire: '/models/jeep/backhoodtire.glb',
        //         chassisbody: '/models/jeep/chassisbody.glb',
        //         chassis: '/models/jeep/chassis.glb',
        //         chassispart: '/models/jeep/chassispart.glb',
        //         headlights: '/models/jeep/headlights.glb',
        //         backlights: '/models/jeep/backlights.glb',
        //         hoodhandle: '/models/jeep/hoodhandle.glb',
        //         wheels: '/models/jeep/wheels.glb',
        //         tire: '/models/jeep/tire.glb',
        //         vehicle: '/models/jeep/vehicle1.glb',
        //     },
        //     attributes: {
        //         PWR: 100,
        //         HP: 150,
        //         SPD: 110,
        //         BRK: 70,
        //     },
        // },
        {
            name: 'Goodwing',
            price: 378000,
            parts: {
                backlights: '/models/goodwing/backlights.glb',
                chassisbottom: '/models/goodwing/chassisbottom.glb',
                chassis: '/models/goodwing/chassisobject.glb',
                foglights: '/models/goodwing/foglights.glb',
                headlights: '/models/goodwing/showroomheadlights.glb',
                showroomtire: '/models/goodwing/showroomtire.glb',
                showroomwheel: '/models/goodwing/showroomwheel.glb',
                windows: '/models/goodwing/windows.glb',
                antena: '/models/goodwing/antena.glb',
            },
            attributes: {
                PWR: 100,
                HP: 150,
                SPD: 110,
                BRK: 70,
            },
        },
        {
            name: 'Howler Packard',
            price: 378000,
            parts: {
                backlights: '/models/howler/backlights1.glb',
                bumper: '/models/howler/bumper.glb',
                chassis: '/models/howler/chassis.glb',
                chassisbottom: '/models/howler/chassisbottom.glb',
                headlights: '/models/howler/headlights.glb',
                rocket: '/models/howler/rocket.glb',
                tire: '/models/howler/tire.glb',
                wheels: '/models/howler/wheels.glb',
                antena: '/models/howler/showroomantena.glb',
            },
            attributes: {
                PWR: 150,
                HP: 110,
                SPD: 90,
                BRK: 70,
            },
        },
        {
            name: 'RC TraxShark',
            price: 4800000,
            parts: {
                // tire: '/models/rctruck/tire.glb',
                chassisbottom: '/models/rctruck/chassisbottom.glb',
                chassis: '/models/rctruck/chassis.glb',
                window: '/models/rctruck/window.glb',
                headlights: '/models/rctruck/headlights.glb',
                backlights: '/models/rctruck/backlights.glb',
                wheels: '/models/rctruck/truckwheels.glb',
                tair: '/models/rctruck/trucktair.glb',
                antena: '/models/rctruck/antena.glb',
            },
            attributes: {
                PWR: 70,
                HP: 150,
                SPD: 110,
                BRK: 80,
            },
        },
        {
            name: 'Pusher Crowd',
            price: 7500000,
            parts: {
                backlights: '/models/pushpushpush/backlights.glb',
                chassis: '/models/pushpushpush/chassis1.glb',
                chassisbottom: '/models/pushpushpush/chassisbottom.glb',
                headlights: '/models/pushpushpush/headlights.glb',
                tire: '/models/pushpushpush/showroomtire.glb',
                wheels: '/models/pushpushpush/showroomwheels.glb',
                windows: '/models/pushpushpush/window.glb',
                turbo: '/models/pushpushpush/turbo.glb',
                antena: '/models/pushpushpush/showroomantena.glb',
            },
            attributes: {
            PWR: 80,
            HP: 150,
            SPD: 110,
            BRK: 90,
        },
        },
        {
            name: 'Impactus',
            price: 7500000,
            parts: {
                backlights: '/models/impactus/backlights.glb',
                chassis: '/models/impactus/chassis1.glb',
                brake: '/models/impactus/brake.glb',
                headlights: '/models/impactus/headlights2.glb',
                rims: '/models/impactus/showroomwheel.glb',
                tire: '/models/impactus/showroomtire.glb',
                windows: '/models/impactus/windows.glb',
                roof: '/models/impactus/roof.glb',
                antena: '/models/impactus/showroomantena.glb',
            },
            attributes: {
            PWR: 140,
            HP: 190,
            SPD: 110,
            BRK: 90,
        },
        },
        {
            name: 'Crushinator',
            price: 7500000,
            parts: {
                backlights: '/models/zimbow/backlights.glb',
                chassis: '/models/zimbow/showroomchassis.glb',
                chassisbottom: '/models/zimbow/chassisbottom.glb',
                chassisstructure: '/models/zimbow/chassisstructure.glb',
                headlights: '/models/zimbow/headlights.glb',
                wheel: '/models/zimbow/wheel.glb',
                tire: '/models/zimbow/tire.glb',
                window: '/models/zimbow/window.glb',
                antena: '/models/zimbow/showroomantena.glb',
            },
            attributes: {
            PWR: 110,
            HP: 170,
            SPD: 110,
            BRK: 90,
        },
        }
        // Add more cars here later
    ];

    const toggleView = (selectedView: 'menu' | 'car' | 'rocket' | 'showroom' | 'customize') => {
        console.log('Toggling view to:', selectedView);
    
        setView(selectedView); // Update the state
    
        if (selectedView === 'car') {
            handleCarView();
        } else if (selectedView === 'rocket') {
            handleRocketView();
        } else if (selectedView === 'showroom') {
            handleShowroomView();
        } else if (selectedView === 'menu') {
            setView('menu');
        }
    
        console.log('Rocket group visibility:', rocketGroupRef.current.children.map((c) => c.visible)); // Debug log
    };

    const handleCarView = () => {
        carGroupRef.current.traverse((child) => {
            if (child instanceof THREE.Object3D) {
                child.visible = true; // Show all car parts
            }
        });
    
        rocketGroupRef.current.traverse((child) => {
            if (child instanceof THREE.Object3D) {
                child.visible = false; // Hide the rocket
            }
        });
    
        showroomGroupRef.current.traverse((child) => {
            if (child instanceof THREE.Object3D) {
                child.visible = false; // Hide the showroom cars
            }
        });
    
        setView('customize');
    };

    const handleRocketView = () => {
        setIsOrbitEnabled(true);
    
        carGroupRef.current.traverse((child) => {
            if (child instanceof THREE.Object3D) {
                child.visible = false; // Hide all car parts
            }
        });
    
        rocketGroupRef.current.traverse((child) => {
            console.log(`Setting rocket visibility to true for: ${child.name}`); // Debug log
            if (child instanceof THREE.Object3D) {
                child.visible = true; // Show the rocket
            }
        });
    
        showroomGroupRef.current.traverse((child) => {
            if (child instanceof THREE.Object3D) {
                child.visible = false; // Hide the showroom cars
            }
        });
    
        setView('rocket');
    };

    const handleShowroomView = () => {
        console.log('Loading showroom cars...', showroomGroupRef.current);
    
        setIsOrbitEnabled(true);
    
        carGroupRef.current.traverse((child) => {
            if (child instanceof THREE.Object3D) {
                child.visible = false; // Hide all car parts
            }
        });
    
        rocketGroupRef.current.traverse((child) => {
            if (child instanceof THREE.Object3D) {
                child.visible = false; // Hide the rocket
            }
        });
    
        showroomGroupRef.current.traverse((child) => {
            if (child instanceof THREE.Object3D) {
                child.visible = true; // Show showroom cars
            }
        });
    
        // Load the showroom cars only if they haven't been loaded
        if (!showroomLoaded.current) {
            loadShowroomCar(cars).then(() => {
                showroomLoaded.current = true; // Mark as loaded
                console.log('Showroom cars loaded.');
            });
        }
    
        // Ensure only the first car in the slider is displayed initially
        if (showroomGroupRef.current.children.length > 0) {
            const firstCarName = cars[0].name; // Get the name of the first car
            showroomGroupRef.current.children.forEach((carGroup) => {
                if (carGroup instanceof THREE.Object3D) {
                    carGroup.visible = carGroup.name === firstCarName;
                }
            });
        }
    
        console.log('Entering showroom view');
        setView('showroom');
    };    

    const formatBalance = (account: number) => {
        if (!account || isNaN(account)) return '0'; // Handle invalid account values
        return account.toLocaleString('en-US').replace(/,/g, ' '); // Replace commas with spaces
    };

    const kybertruck: Car[] = [
        {
            name: 'Kybertruck',
            price: 378000,
            parts: {
                accessories: '/models/car/default/empty.glb',
                backlights: '/models/car/default/backLightsBrake.glb',
                chassisinside: '/models/car/default/empty.glb',
                engine: '/models/car/default/empty.glb',
                headlights: '/models/car/default/headlights.glb',
                saloon: '/models/car/default/empty.glb',
                chassisbottom: '/models/car/default/showroomchassisbottom2.glb',
                chassis: '/models/car/default/chassisbody.glb',
                spoiler: '/models/car/default/spoiler.glb',
                window: '/models/car/default/window.glb',
                wheels: '/models/car/default/showroomwheels.glb',
                tire: '/models/car/default/showroomtire.glb',
                antena: '/models/car/default/antena.glb',
            },
            attributes: {
                PWR: 55,
                HP: 70,
                SPD: 80,
                BRK: 95,
            },
        },
    ];    

    const controlsRef = useRef<OrbitControls | null>(null);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const customizationPoints = useRef<THREE.Mesh[]>([]);
    const matcapTextures = useRef<{ [key: string]: THREE.Texture }>({});

    // const pngIcons: { [key: string]: string } = {
    //     chassis: '/garage/chassis.png',
    //     wheels: '/garage/wheel.png',
    //     chassisbottom: '/garage/bottom.png',
    //     spoiler: '/garage/spoiler.png',
    //     window: '/garage/window.png',
    // };  
    
    const constructPngIconPath = (carName: string, partName: string): string => {
        return `/garage/${carName.toLowerCase()}/${partName}.png`;
    };    
    
    const createNitroEffect = (position: THREE.Vector3, quaternion: THREE.Quaternion, carChassis: THREE.Object3D) => {
        const nitroTexture = '/garage/nitro.png';
        const base64Texture = nitroTexture; // Ensure this texture is defined or imported
        const img = new Image();
        img.src = base64Texture;
        img.crossOrigin = "anonymous";
    
        img.onload = () => {
            const texture = new THREE.Texture(img);
            texture.needsUpdate = true;
    
            const material = new THREE.PointsMaterial({
                size: 30,
                map: texture,
                vertexColors: true,
                sizeAttenuation: true,
                transparent: true,
                opacity: 1,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
    
            const particleCount = 100;
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const colors = [];
            const sizes = [];
    
            // Initialize particle vertices, colors, and sizes
            for (let i = 0; i < particleCount; i++) {
                vertices.push(0, 0, 0);
    
                const randomColor = Math.random();
                if (randomColor < 0.33) {
                    colors.push(0.0, 0.5 + Math.random() * 0.5, 1.0);
                } else if (randomColor < 0.66) {
                    colors.push(1.0, 1.0 + Math.random() * 0.5, 0.0);
                } else {
                    colors.push(0.0, 1.0, 0.5 + Math.random() * 0.5);
                }
    
                sizes.push(Math.random() * 0.1 + 0.05);
            }
    
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
            const particles = new THREE.Points(geometry, material);
    
            carChassis.add(particles);
    
            // Rotate the particle system for exhaust alignment
            particles.rotation.x = Math.PI / 2;
            particles.position.copy(position).add(new THREE.Vector3(-0.95, 0, 0.6));
    
            let isBoostActive = true;
    
            const animateParticles = () => {
                if (!isBoostActive) return;
    
                const positions = geometry.attributes.position.array as Float32Array;
                for (let i = 0; i < particleCount; i++) {
                    const localMovement = new THREE.Vector3(
                        1 * (Math.random() - 0.5) * 0.1,
                        1 * (Math.random() - 0.5) * 0.1,
                        1 * (Math.random() * 0.05)
                    );
                    localMovement.applyQuaternion(quaternion);
                    positions[i * 3 + 0] += localMovement.x * 3;
                    positions[i * 3 + 1] += localMovement.y;
                    positions[i * 3 + 2] += localMovement.z;
                }
    
                geometry.attributes.position.needsUpdate = true;
    
                particles.position.copy(carChassis.position).add(new THREE.Vector3(-1.5, 0, 0.6));
                requestAnimationFrame(animateParticles);
            };
    
            animateParticles();
    
            setTimeout(() => {
                isBoostActive = false;
                carChassis.remove(particles);
                geometry.dispose();
                material.dispose();
            }, 200);
        };
    
        img.onerror = (error) => {
            console.error('Failed to load base64 texture:', error);
        };
    };

    // Load matcap textures
    useEffect(() => {
        const textureLoader = new THREE.TextureLoader();
        const matcaps = ['elevator', 'blueGlass', 'metal', 'volcano', 'amazon', 'black', 'blacksea',
                          'blue', 'blueeye', 'bw', 'charcoal', 'darkEmerald', 'darkMetal', 'divo',
                          'emeraldGreen', 'exotic', 'gold', 'gray', 'green', 'greenBulb', 'indigo',
                          'lemonblue', 'line', 'marble', 'mixature', 'offwhite', 'panacea',
                          'red', 'sky', 'sunearth', 'transparentLand', 'valakas',
                          'white', 'whiteblue', 'wine', 'yellow'];
        matcaps.forEach((matcap) => {
            matcapTextures.current[matcap] = textureLoader.load(`/models/matcaps/${matcap}.png`);
        });
    }, []);

    // Declare scene and camera globally
    let scene: THREE.Scene;

    useEffect(() => {
        if (!canvasRef.current) return;
    
        // Initialize the scene
        scene = new THREE.Scene();
        // scene.background = new THREE.Color('#0213f7'); // Updated background color
        scene.background = null; // Make the scene's background transparent
        cameraRef.current = new THREE.PerspectiveCamera(2.0, window.innerWidth / window.innerHeight, 1, 500);
        cameraRef.current.position.set(0, -200, 1);

        // Background scene and camera
        const backgroundScene = new THREE.Scene();
        const backgroundCamera = new THREE.OrthographicCamera(
            -window.innerWidth / 2,
            window.innerWidth / 2,
            window.innerHeight / 2,
            -window.innerHeight / 2,
            -1000,
            1000
        );
        backgroundCamera.position.set(0, 0, 0);
        backgroundCamera.lookAt(0, 0, 0);

        // Add lighting to the background scene
        const backgroundAmbientLight = new THREE.AmbientLight(0xffffff, 0.7); // Soft light for background
        backgroundScene.add(backgroundAmbientLight);

        const backgroundDirectionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        backgroundDirectionalLight.position.set(0, 0, 0);
        backgroundScene.add(backgroundDirectionalLight);
        backgroundScene.background = new THREE.Color('#000'); // Updated background color

        // Load the video and apply it as a texture
        const video = document.createElement('video');
        video.src = '/images/videos/video.mp4'; // Replace with the actual path to your video file
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.play();

        // Prevent video interaction
        video.controls = false; // Disable video controls
        video.style.display = 'none'; // Hide the video element

        // Prevent unwanted interactions
        const preventDefaultHandler = (event: Event): void => event.preventDefault();
        ['click', 'contextmenu', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'dragstart'].forEach((event) =>
            video.addEventListener(event, preventDefaultHandler)
        );

        // Additionally, prevent right-click menu on the video element
        video.addEventListener('contextmenu', (event: MouseEvent) => event.preventDefault());

        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat;

        // Calculate dimensions for 1920x1080
        const targetWidth = 1920 / 4.2; // Adjust the divisor based on the desired scaling
        const targetHeight = 1080 / 3.5; // Adjust the divisor based on the desired scaling

        const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
        const videoPlaneGeometry = new THREE.PlaneGeometry(targetWidth, targetHeight);
        const videoPlane = new THREE.Mesh(videoPlaneGeometry, videoMaterial);
        // Positioning: Adjust based on the 1920x1080 reference
        videoPlane.position.set(-170, -145, 0); // Offset values are also calculated relative to 1920x1080

        // const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
        // const videoPlaneGeometry = new THREE.PlaneGeometry(window.innerWidth / 0.9, window.innerHeight / 3.2);
        // const videoPlane = new THREE.Mesh(videoPlaneGeometry, videoMaterial);
        // videoPlane.position.set(-170, -144, 0); // Position the video plane behind other objects
        backgroundScene.add(videoPlane);

        // const textureLoader = new THREE.TextureLoader();
        // textureLoader.load(
        //     '/garage/skybackground.jpg', // Replace with the actual path to your background image
        //     (texture) => {
        //         backgroundScene.background = texture; // Set the loaded texture as the background
        //         console.log('Background image loaded successfully');
        //     },
        //     undefined,
        //     (error) => {
        //         console.error('Error loading background image:', error);
        //     }
        // );

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas: canvasRef.current, logarithmicDepthBuffer: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.autoClear = false;

        // Load background
        const loadBackground = async () => {
            const loader = new GLTFLoader();
            loader.load(
                '/garage/background1.glb',
                (gltf) => {
                    const backgroundMesh = gltf.scene;
                    backgroundMesh.position.set(0, 0, 0);
                    backgroundMesh.rotation.x = -Math.PI / 2
                    backgroundMesh.scale.set(50, 50, 50);

                    // Iterate over child meshes and apply random matcap materials
                    backgroundMesh.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            const randomMatcapName = 'darkMetal'
                            const matcapTexture = matcapTextures.current[randomMatcapName];
                            child.material = new THREE.MeshMatcapMaterial({
                                matcap: matcapTexture,
                            });
                        }
                    });
                    backgroundScene.add(backgroundMesh);
                    console.log('Background loaded successfully');
                },
                undefined,
                (error) => {
                    console.error('Error loading background:', error);
                }
            );
        };

        loadBackground();
    
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
    
        // Initialize OrbitControls for the car group only
        controlsRef.current = new OrbitControls(cameraRef.current, renderer.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.01;
        controlsRef.current.enabled = isOrbitEnabled;
        controlsRef.current.minDistance = 100; // Minimum zoom distance
        controlsRef.current.maxDistance = 200; // Maximum zoom distance

        // Initially hide showroom group
        showroomGroupRef.current.visible = false;
        rocketGroupRef.current.visible = false;

        // Add groups to the scene if not already added
        if (!scene.children.includes(carGroupRef.current)) {
            scene.add(carGroupRef.current);
        }
        if (!scene.children.includes(rocketGroupRef.current)) {
            scene.add(rocketGroupRef.current);
        }
        // if (!scene.children.includes(showroomGroupRef.current)) {
        //     scene.add(showroomGroupRef.current);
        // }

        let animationFrameId: number;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // Spin the car group
            if (carGroupRef.current) {
                // carGroupRef.current.rotation.x += 0.001; // Adjust speed as needed
                // carGroupRef.current.rotation.y += 0.001;
                carGroupRef.current.rotation.z += 0.001;
            }

            // Spin the rocket group
            if (rocketGroupRef.current) {
                rocketGroupRef.current.rotation.x += 0.0005; // Adjust speed as needed
                rocketGroupRef.current.rotation.y += 0.0005;
                rocketGroupRef.current.rotation.z += 0.0005;
            }

            if (controlsRef.current) {
                controlsRef.current.update();
            }

            // Render background first
            renderer.clear();
            if (backgroundCamera) {
                renderer.render(backgroundScene, backgroundCamera);
            }
            
            if (cameraRef.current) {
                // Render the main scene on top
                renderer.clearDepth();
                renderer.render(scene, cameraRef.current);
            }
        };
        animate();

        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            if (cameraRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
            }
        };
        window.addEventListener('resize', handleResize);

        const handleMouseClick = (event: MouseEvent) => {
            if (!canvasRef.current) return;
        
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            if (cameraRef.current) {
                raycaster.setFromCamera(mouse, cameraRef.current);
            }
            const intersects = raycaster.intersectObjects(customizationPoints.current);
        
            if (intersects.length > 0) {
                const clickedPoint = intersects[0].object;
                const partName = clickedPoint.userData.partName; // Fetch part name from userData
                console.log("Customization point clicked for:", partName); // Debugging log
                setSelectedPart(partName);
                setShowMatcapMenu(true);
            }
        };
        window.addEventListener('click', handleMouseClick);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('click', handleMouseClick);
            renderer.dispose();
            video.pause();
            video.src = '';
        };
    }, [currentCarIndex]);

        // Function to apply a matcap texture to parts
        const applyMatcap = (part: THREE.Object3D, matcapName: string) => {
            const texture = matcapTextures.current[matcapName];
            if (texture) {
                part.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshMatcapMaterial({ matcap: texture });
                        child.material.needsUpdate = true;
                    }
                });
            }
        };

        // const loadCar = async (index: number) => {
        //     carGroupRef.current.clear();

        //     showroomGroupRef.current.visible = false;
        //     rocketGroupRef.current.visible = false;
        
        //     const loader = new GLTFLoader();
        //     const carParts = index < kybertruck.length ? kybertruck[index] : cars[index]?.parts;
        //     if (!carParts) return;
        
        //     const loadingPromises = Object.entries(carParts).map(([partName, partPath]) =>
        //         new Promise<void>((resolve) => {
        //             loader.load(partPath, (gltf) => {
        //                 const part = gltf.scene;
        //                 part.name = partName;

        //                 // Apply a random matcap from the available options
        //                 const randomMatcap = () => {
        //                     const matcapKeys = Object.keys(matcapTextures.current);
        //                     const randomIndex = Math.floor(Math.random() * matcapKeys.length);
        //                     return matcapKeys[randomIndex];
        //                 };

        //                 const randomMatcapName = randomMatcap();

        //                 // Apply transformations or material settings
        //                 if (partName === 'headlights') {
        //                     part.traverse((child) => {
        //                         if (child instanceof THREE.Mesh) {
        //                             child.material = new THREE.MeshStandardMaterial({
        //                                 emissive: new THREE.Color(0xffffff),
        //                                 metalness: 1,
        //                                 emissiveIntensity: 1.5,
        //                             });
        //                         }
        //                     });
        //                 } else if (partName === 'backlights') {
        //                     part.traverse((child) => {
        //                         if (child instanceof THREE.Mesh) {
        //                             child.material = new THREE.MeshStandardMaterial({
        //                                 emissive: new THREE.Color(0xFF0000),
        //                                 metalness: 1,
        //                                 emissiveIntensity: 1.5,
        //                             });
        //                         }
        //                     });
        //                 }
                        
        //                 if (partName === 'chassis') {
        //                     applyMatcap(part, 'darkEmerald');
        //                 } else if (partName === 'wheels') {
        //                     applyMatcap(part, 'darkEmerald');
        //                 } else if (partName === 'tire') {
        //                     applyMatcap(part, 'black');
        //                 } else if (partName === 'chassisbottom') {
        //                     applyMatcap(part, 'black');
        //                 } else if (partName === 'bumper') {
        //                     applyMatcap(part, 'black');
        //                 } else if (partName === 'spoiler') {
        //                     applyMatcap(part, 'black');
        //                 } else if (partName === 'window') {
        //                     applyMatcap(part, 'black');
        //                 }
                        
        //                 carGroupRef.current.add(part);
        //                 resolve();
        //             });
        //         })
        //     );
        
        //     await Promise.all(loadingPromises);

        //     // Position the car in the center
        //     carGroupRef.current.position.set(0, 0, -0.5);

        //      // Adjust camera to look at the car
        //     if (cameraRef.current) {
        //         cameraRef.current.position.set(0, -200, 5); // Pull camera twice the distance out
        //         cameraRef.current.lookAt(carGroupRef.current.position);
        //     }

        //     addHeadlightEffect(carGroupRef.current);
        // };  

        // const loadBackground = async () => {
        //     const loader = new GLTFLoader();
        
        //     // Initialize or clear the background group
        //     if (backgroundGroupRef?.current) {
        //         backgroundGroupRef.current.clear();
        //     } else {
        //         backgroundGroupRef.current = new THREE.Group();
        //     }
        
        //     // Load the background GLB
        //     loader.load(
        //         '/garage/background1.glb',
        //         (gltf) => {
        //             const backgroundMesh = gltf.scene;
        
        //             // Position and scale the background
        //             backgroundMesh.position.set(0, 0, 0); // Place the background behind other objects
        //             backgroundMesh.scale.set(1, 1, 1);  // Scale appropriately
        
        //             backgroundGroupRef.current.add(backgroundMesh);
        
        //             // Add the background to the scene
        //             if (scene) {
        //                 scene.add(backgroundGroupRef.current);
        //             }
        
        //             console.log('Background loaded successfully');
        //         },
        //         undefined,
        //         (error) => {
        //             console.error('Error loading background:', error);
        //         }
        //     );
        // };

        const loadCar = async (index: number) => {

            setIsCarLoading(true); // Start loading animation

            // Update car attributes based on the index
            if (index >= 0 && index < cars.length) {
                setCurrentCarAttributes(cars[index].attributes); // Update the attributes state
            } else {
                setCurrentCarAttributes(kybertruck[0].attributes); // Default to kybertruck attributes
            }

            carGroupRef.current.clear();
        
            showroomGroupRef.current.visible = false;
            rocketGroupRef.current.visible = false;
        
            const loader = new GLTFLoader();
        
            // Safely access car parts
            const carParts =
                index >= 0 && index < cars.length
                    ? cars[index]?.parts
                    : kybertruck[0]?.parts; // Default to kybertruck if index is invalid
            if (!carParts) return;
        
            if (!carParts) {
                console.error('Car parts not found for the specified index.');
                return;
            }
        
            const loadingPromises = Object.entries(carParts).map(([partName, partPath]) =>
                new Promise<void>((resolve) => {
                    loader.load(partPath, (gltf) => {
                        const part = gltf.scene;
                        part.name = partName;
        
                        // Apply material or transformations based on part type
                        if (partName === 'headlights') {
                            part.traverse((child) => {
                                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                                    const headlightMaterial = child.material;
                        
                                    // Set static headlights
                                    headlightMaterial.emissive = new THREE.Color(0xffffff);
                                    headlightMaterial.metalness = 1;
                                    headlightMaterial.emissiveIntensity = 1.5;
                                }
                            });
                        } else if (partName === 'backlights') {
                            part.traverse((child) => {
                                if (child instanceof THREE.Mesh) {
                                    child.material = new THREE.MeshStandardMaterial({
                                        emissive: new THREE.Color(0xff0000),
                                        metalness: 1,
                                        emissiveIntensity: 1.5,
                                    });
                                }
                            });
                        }
        
                        // Apply matcap materials
                        if (['chassis', 'wheels'].includes(partName)) {
                            applyMatcap(part, 'darkEmerald');
                        } else if (['tire', 'bumper', 'spoiler', 'window'].includes(partName)) {
                            applyMatcap(part, 'black');
                        } else if (['chassisbottom'].includes(partName)) {
                            applyMatcap(part, 'darkEmerald');
                        }
        
                        carGroupRef.current.add(part);
                        resolve();
                    });
                })
            );
        
            await Promise.all(loadingPromises);
        
            // Position the car in the center
            carGroupRef.current.position.set(0, 0, -0.5);
        
            // Adjust the camera to look at the car
            if (cameraRef.current) {
                cameraRef.current.position.set(0, -200, 0);
                cameraRef.current.lookAt(carGroupRef.current.position);
            }
                    
            setIsCarLoading(false);
            addHeadlightEffect(carGroupRef.current);
        };        

        const addHeadlightEffect = (carGroup: THREE.Group) => {
            const headlightLight = new THREE.PointLight(0xffffff, 2, 50); // Adjust intensity and distance
            headlightLight.position.set(0, 2, 5); // Adjust position relative to the car
            carGroup.add(headlightLight);
        };

        let blinkAnimationFrame: number | null = null; // Global variable for animation frame
        let isBlinkingActive = false; // Global flag to track if blinking is active

        const toggleHeadlightEffect = () => {
            if (carGroupRef.current) {
                if (isBlinking) {
                    applyStaticEffect(carGroupRef.current); // Switch to static
                } else {
                    applyBlinkEffect(carGroupRef.current); // Switch to blinking
                }
                setIsBlinking(!isBlinking); // Toggle the blinking state
            } else {
                console.error('Car group reference is null.');
            }
        };

        const applyStaticEffect = (carGroup: THREE.Group) => {
            // Stop blinking effect
            isBlinkingActive = false;
            if (blinkAnimationFrame !== null) {
                cancelAnimationFrame(blinkAnimationFrame); // Cancel any pending animation frame
                blinkAnimationFrame = null;
            }

            // Reset all headlight materials to static
            carGroup.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    const material = child.material;
                    material.emissiveIntensity = 1.5; // Set static light intensity
                }
            });
        };

        const applyBlinkEffect = (carGroup: THREE.Group) => {
            isBlinkingActive = true; // Mark blinking as active
            const blinkDuration = 0.7; // Duration for each state (on/off) in seconds
            let isBlinkingOn = true;

            const blink = () => {
                if (!isBlinkingActive) {
                    return; // Stop blinking if blinking is no longer active
                }

                carGroup.traverse((child) => {
                    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                        const material = child.material;
                        material.emissiveIntensity = isBlinkingOn ? 1.5 : 0.3; // Toggle intensity
                    }
                });

                isBlinkingOn = !isBlinkingOn; // Toggle the blinking state

                // Schedule the next frame
                blinkAnimationFrame = requestAnimationFrame(() => {
                    setTimeout(blink, blinkDuration * 1000); // Delay for the blink duration
                });
            };

            blink(); // Start blinking
        };


        const handleNitroEffect = () => {
            if (carGroupRef.current && carGroupRef.current.children.length > 0) {
                const activeCar = carGroupRef.current.children[0]; // Assuming the first car is active
                const position = new THREE.Vector3().copy(activeCar.position); // Get car position
                const quaternion = new THREE.Quaternion().copy(activeCar.quaternion); // Get car orientation
    
                createNitroEffect(position, quaternion, activeCar); // Trigger nitro effect
            } else {
                console.error("No car found to apply nitro effect.");
            }
        };
    
        const handleNitroToggle = () => {
            setIsNitroActive(!isNitroActive); // Toggle button activity
            handleNitroEffect(); // Call the nitro effect function
            setTimeout(() => setIsNitroActive(false), 100);
        };
        
        const handleBlinkToggle = () => {
            setIsButtonActive(!isButtonActive); // Toggle button activity
            toggleHeadlightEffect(); // Call the existing headlight toggle function
            setTimeout(() => setIsButtonActive(false), 100);
        };

        const loadShowroomCar = async (
            cars: Array<{ name: string; parts: Record<string, string>; price: number }>
        ) => {

            if (!showroomGroupRef.current) {
                console.error('Showroom group reference is not initialized.');
                return;
            }

            showroomGroupRef.current.clear(); // Clear existing cars from the showroom

            if (!scene) {
                console.error('Scene is not initialized.');
                return;
            }
        
            const loader = new GLTFLoader();
        
            await Promise.all(
                cars.map(async (car, i) => {
                    const carGroup = new THREE.Group(); // Create a group for the car
                    carGroup.name = car.name;

                    // Load all parts of the car
                    await Promise.all(
                        Object.entries(car.parts).map(([partName, partPath]) => {
                            return new Promise<void>((resolve, reject) => {
                                loader.load(
                                    partPath,
                                    (gltf) => {
                                        const part = gltf.scene;
                                        part.name = `${car.name}_${partName}`; // Set a unique name for each part

                                        // Apply a random matcap from the available options
                                        const randomMatcap = () => {
                                            const matcapKeys = Object.keys(matcapTextures.current);
                                            const randomIndex = Math.floor(Math.random() * matcapKeys.length);
                                            return matcapKeys[randomIndex];
                                        };

                                        const randomMatcapName = randomMatcap();
                                        
                                        if (partName === 'chassis') {
                                            applyMatcap(part, 'darkEmerald');
                                        } else if (partName === 'wheels') {
                                            applyMatcap(part, 'darkEmerald');
                                        } else if (partName === 'tire') {
                                            applyMatcap(part, 'black');
                                        } else if (partName === 'chassisbottom') {
                                            applyMatcap(part, 'darkEmerald');
                                        } else if (partName === 'bumper') {
                                            applyMatcap(part, 'black');
                                        } else if (partName === 'spoiler') {
                                            applyMatcap(part, 'black');
                                        } else if (partName === 'window') {
                                            applyMatcap(part, 'black');
                                        } else if (partName === 'headlights') {
                                            part.traverse((child) => {
                                                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                                                    const headlightMaterial = child.material;
                                        
                                                    // Set static headlights
                                                    headlightMaterial.emissive = new THREE.Color(0xffffff);
                                                    headlightMaterial.metalness = 1;
                                                    headlightMaterial.emissiveIntensity = 1.5;
                                                }
                                            });
                                        } else if (partName === 'backlights') {
                                            part.traverse((child) => {
                                                if (child instanceof THREE.Mesh) {
                                                    child.material = new THREE.MeshStandardMaterial({
                                                        emissive: new THREE.Color(0xFF0000),
                                                        metalness: 1,
                                                        emissiveIntensity: 1.5,
                                                    });
                                                }
                                            });
                                        }

                                        carGroup.add(part); // Add the part to the car group
                                        resolve();
                                    },
                                    undefined,
                                    (error) => {
                                        console.error(`Failed to load ${partName} for ${car.name}:`, error);
                                        reject(error);
                                    }
                                );
                            });
                        })
                    );
        
                    // Initially hide all cars
                    carGroup.visible = i === 0; // Only show the first car
                    showroomGroupRef.current.position.set(-0.07, 0, -0.5);
                    // Add the car group to the showroom group
                    showroomGroupRef.current.add(carGroup);
                })
            );
        
            // Add the showroom group to the scene
            scene.add(showroomGroupRef.current);
            
        };        
        
        const loadRocket = async () => {
            rocketGroupRef.current.clear();
        
            const loader = new GLTFLoader();
            loader.load('/models/rocket/base.glb', (gltf) => {
                const rocket = gltf.scene;
                rocket.name = 'rocket';

                // if (partName === 'rocket') {
                //     console.log('Adding rocket to rocketGroupRef:', part); // Debug log
                //     part.visible = false; // Hide rocket initially
                //     part.position.set(-1, 0, 0); // Scale down the rocket
                //     part.scale.set(0.5, 0.5, 0.5); // Scale down the rocket
                //     applyMatcap(part, 'valakas');
                // }

                // Apply a random matcap from the available options
                const randomMatcap = () => {
                    const matcapKeys = Object.keys(matcapTextures.current);
                    const randomIndex = Math.floor(Math.random() * matcapKeys.length);
                    return matcapKeys[randomIndex];
                };

                const randomMatcapName = randomMatcap();

                applyMatcap(rocket, 'transparentLand');
                rocket.scale.set(0.5, 0.5, 0.5);
                rocket.position.set(-1, 0, 0);
                rocketGroupRef.current.add(rocket);
            });
        };
        
        const handleSliderChange = (index: number) => {
            switchShowroomCar(index); // Toggle visibility of cars
            setCurrentCarIndex(index); // Update the selected car index
        };

        // const loadCoinModel = async () => {
        //     if (!coinCanvasRef.current) return;
        
        //     const canvas = coinCanvasRef.current;
        //     const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
        //     renderer.setSize(window.innerWidth, window.innerHeight);
        //     renderer.setPixelRatio(window.devicePixelRatio);
        
        //     // Create scene, camera, and lighting
        //     const scene = new THREE.Scene();
        //     const camera = new THREE.PerspectiveCamera(
        //         45,
        //         window.innerWidth / window.innerHeight,
        //         0.1,
        //         1000
        //     );
        //     camera.position.set(0, 0, 5);
        
        //     const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        //     scene.add(ambientLight);
        
        //     const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        //     directionalLight.position.set(10, 10, 10);
        //     scene.add(directionalLight);
        
        //     // Load the coin model
        //     const loader = new GLTFLoader();
        //     loader.load(
        //         "/models/coin/coin.glb", // Path to your coin model
        //         (gltf) => {
        //             const coin = gltf.scene;
        //             coin.scale.set(1.5, 1.5, 1.5);
        //             coin.rotation.set(0, 0, 0); // Initial rotation
        //             scene.add(coin);
        
        //             // Render the coin
        //             const animate = () => {
        //                 requestAnimationFrame(animate);
        
        //                 // Add rotation for animation later
        //                 coin.rotation.y += 0.01;
        
        //                 renderer.render(scene, camera);
        //             };
        
        //             animate();
        //         },
        //         undefined,
        //         (error) => {
        //             console.error("Error loading coin model:", error);
        //         }
        //     );
        
        //     // Adjust on resize
        //     const handleResize = () => {
        //         renderer.setSize(window.innerWidth, window.innerHeight);
        //         camera.aspect = window.innerWidth / window.innerHeight;
        //         camera.updateProjectionMatrix();
        //     };
        
        //     window.addEventListener("resize", handleResize);
        
        //     return () => {
        //         window.removeEventListener("resize", handleResize);
        //         renderer.dispose();
        //     };
        // };
        

    useEffect(() => {
        const loadAssets = async () => {
            // await loadStaticShowroom();
            // await loadCar(currentCarIndex); // Load the dynamically selected car
            // await loadBackground();
            await loadShowroomCar(cars);   // Load all cars in the showroom
            await loadRocket();
            showroomLoaded.current = true;
            // switchShowroomCar(1);
        };

        loadAssets();
    }, [currentCarIndex]);  

    // const loadStaticShowroom = async () => {
    //     const loader = new GLTFLoader();
    
    //     loader.load(
    //         '/garage/background.glb',
    //         (gltf) => {
    //             const showroomModel = gltf.scene;
    
    //             // Position the showroom model
    //             showroomModel.position.set(0, 0, 0);
    //             showroomModel.rotation.set(0, 0, 0);
    //             showroomModel.scale.set(1, 1, 1);
    
    //             // Add the model to the scene
    //             scene.add(showroomModel);
    
    //             // Ensure it's static by not attaching OrbitControls
    //             showroomModel.traverse((child) => {
    //                 if (child instanceof THREE.Mesh) {
    //                     child.castShadow = false;
    //                     child.receiveShadow = true;
    //                 }
    //             });
    //         },
    //         undefined,
    //         (error) => {
    //             console.error('Error loading showroom GLTF:', error);
    //         }
    //     );
    // };    

    const switchShowroomCar = (index: number) => {
        const selectedCar = cars[index]; // Get the car associated with the current slide
        if (!selectedCar) {
            console.error(`No car found for index ${index}`);
            return;
        }

        setCurrentCarAttributes(selectedCar.attributes);
    
        const outDuration = 0.7; // Duration for the outgoing animation in seconds
        const inDuration = 0.4; // Duration for the incoming animation in seconds
        const clock = new THREE.Clock();
    
        let currentAnimatingCar: THREE.Object3D | null = null;
    
        showroomGroupRef.current.children.forEach((carGroup) => {
            if (carGroup instanceof THREE.Object3D) {
                if (carGroup.visible) {
                    // Animate the currently visible car out
                    console.log(`Animating out car: ${carGroup.name}`);
                    currentAnimatingCar = carGroup;
    
                    const startPosition = new THREE.Vector3(0, 0, 0); // Current position (center)
                    const endPosition = new THREE.Vector3(-5, 0, 0); // End position (off-screen left)
                    const startRotation = carGroup.rotation.clone();
                    const endRotation = new THREE.Euler(
                        startRotation.x + Math.PI,
                        startRotation.y + Math.PI,
                        startRotation.z + Math.PI
                    );
    
                    let elapsed = 0;
    
                    const animateOut = () => {
                        elapsed += clock.getDelta();
                        const progress = Math.min(elapsed / outDuration, 1);
    
                        // Update position and rotation
                        carGroup.position.lerpVectors(startPosition, endPosition, progress);
                        carGroup.rotation.x = THREE.MathUtils.lerp(startRotation.x, endRotation.x, progress);
                        carGroup.rotation.y = THREE.MathUtils.lerp(startRotation.y, endRotation.y, progress);
                        carGroup.rotation.z = THREE.MathUtils.lerp(startRotation.z, endRotation.z, progress);
    
                        if (progress < 1) {
                            requestAnimationFrame(animateOut);
                        } else {
                            carGroup.visible = false; // Hide after animation completes
                            console.log(`Car ${carGroup.name} is now hidden.`);
                        }
                    };
    
                    animateOut();
                }
    
                if (carGroup.name === selectedCar.name) {
                    // Animate the selected car in with a delay
                    console.log(`Animating in car: ${carGroup.name}`);
                    const startPosition = new THREE.Vector3(5, 0, 0); // Start position (off-screen right)
                    const endPosition = new THREE.Vector3(0, 0, 0); // End position (center)
                    const startRotation = new THREE.Euler(
                        carGroup.rotation.x - Math.PI,
                        carGroup.rotation.y - Math.PI,
                        carGroup.rotation.z - Math.PI
                    );
                    const endRotation = carGroup.rotation.clone();
    
                    const animateIn = () => {
                        let elapsed = 0;
    
                        const animate = () => {
                            elapsed += clock.getDelta();
                            const progress = Math.min(elapsed / inDuration, 1);
    
                            // Update position and rotation
                            carGroup.position.lerpVectors(startPosition, endPosition, progress);
                            carGroup.rotation.x = THREE.MathUtils.lerp(startRotation.x, endRotation.x, progress);
                            carGroup.rotation.y = THREE.MathUtils.lerp(startRotation.y, endRotation.y, progress);
                            carGroup.rotation.z = THREE.MathUtils.lerp(startRotation.z, endRotation.z, progress);
    
                            if (progress < 1) {
                                requestAnimationFrame(animate);
                            } else {
                                console.log(`Animation complete for car: ${carGroup.name}`);
                            }
                        };
    
                        // Ensure the car is visible before animating
                        carGroup.visible = true;
                        animate();
                    };
    
                    // Delay the incoming car animation until the outgoing animation completes
                    setTimeout(() => animateIn(), outDuration * 1000);
                }
            }
        });
    };
    
    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.enabled = isOrbitEnabled;
        }
    }, [isOrbitEnabled]);

    // const handleNextCar = () => {
    //     setCurrentCarIndex((prevIndex) => (prevIndex + 1) % kybertruck.length);
    //     setIsOrbitEnabled(false);
    // };

    // const handlePreviousCar = () => {
    //     setCurrentCarIndex((prevIndex) => (prevIndex - 1 + kybertruck.length) % kybertruck.length);
    //     setIsOrbitEnabled(false);
    // };

    const handleCarClick = () => {
        setIsOrbitEnabled(true);
        setShowCustomizationMenu(true);
    };

    // const updateCustomizationIcons = (selectedCar: Car) => {
    //     const filteredIcons = Object.keys(selectedCar.parts).reduce((icons, partName) => {
    //         if (pngIcons[partName]) {
    //             icons[partName] = pngIcons[partName];
    //         }
    //         return icons;
    //     }, {} as { [key: string]: string });
    
    //     setFilteredPngIcons(filteredIcons);
    // };
    
    const handleCarSelection = async (carName: string) => {
        const selectedCar = cars.find((car) => car.name === carName);
        if (selectedCar) {
            const selectedIndex = cars.indexOf(selectedCar);
            setIsCarLoading(true); // Set loading state to true before loading parts
            setCurrentCarIndex(selectedIndex);
    
            // Dynamically generate icon paths based on the selected car
            const filteredIcons = Object.keys(selectedCar.parts).reduce((icons, partName) => {
                icons[partName] = constructPngIconPath(carName, partName);
                return icons;
            }, {} as { [key: string]: string });
    
            setFilteredPngIcons(filteredIcons);
    
            // Send the selected car to the server
            const playerId = new URLSearchParams(window.location.search).get('playerId');
            if (playerId) {
                wsRef.current?.send(
                    JSON.stringify({
                        type: 'setSelectedCar',
                        playerId,
                        carName,
                    })
                );
            }
    
            // Load the car and toggle the view to 'car' only when it's ready
            await loadCar(selectedIndex);
            setIsCarLoading(false); // Set loading state to false once the car is fully loaded
            toggleView('car');
        } else {
            console.warn(`Car not found for name: ${carName}`);
        }
    };    

    // const handleCarSelection = async (carName: string) => {

    //     const selectedCar = cars.find((car) => car.name === carName);
    //     if (selectedCar) {
    //         const selectedIndex = cars.indexOf(selectedCar);
    //         setCurrentCarIndex(selectedIndex);

    //         // Send the selected car to the server
    //         const playerId = new URLSearchParams(window.location.search).get('playerId');
    //         if (playerId) {
    //             wsRef.current?.send(
    //                 JSON.stringify({
    //                     type: 'setSelectedCar',
    //                     playerId,
    //                     carName,
    //                 })
    //             );
    //         }
            
    //         toggleView('car');
    //         await loadCar(selectedIndex);
    
    //     } else {
    //         console.warn(`Car not found for name: ${carName}`);
    //     }
    // };    

    // Trigger navigation when `navigateToPage` is set
    React.useEffect(() => {
        if (navigateToPage) {
            router.push(navigateToPage); // Perform navigation
            setNavigateToPage(null); // Reset navigation state
        }
    }, [navigateToPage, router]);

    // Smooth camera transition function
    const smoothCameraTransition = (position: THREE.Vector3, lookAt: THREE.Vector3) => {
        if (!cameraRef.current) return;
        
        gsap.to(cameraRef.current.position, {
            duration: 1.5, // Duration in seconds
            x: position.x,
            y: position.y,
            z: position.z,
            onUpdate: () => {
                cameraRef.current?.lookAt(lookAt);
                controlsRef.current?.update();
            }
        });
    };

    const handlePartSelection = (partName: string) => {
        setSelectedPart(partName);            

        // Define target positions and lookAt based on part
        let targetPosition = new THREE.Vector3(0, -200, 2);
        let targetLookAt = new THREE.Vector3(0, -100, 2);
            
        if (partName === 'chassis') {
            targetPosition = new THREE.Vector3(0, -200, 50);
            targetLookAt = new THREE.Vector3(0, -100, 0);
        } else if (partName === 'wheels') {
            targetPosition = new THREE.Vector3(0, -200, 50);
            targetLookAt = new THREE.Vector3(15, 20, 40);
        } else if (partName === 'rocket') {
            setShowCustomizationMenu(false);
            targetPosition = new THREE.Vector3(0, -200, 2); // Adjust for rocket view
            targetLookAt = new THREE.Vector3(0, -200, 2);
        }

        smoothCameraTransition(targetPosition, targetLookAt)
        setShowCustomizationMenu(false);
    };

    const handlePartCustomization = (matcapName: string) => {
        const texture = matcapTextures.current[matcapName];
        
        if (!texture) {
            console.warn("Matcap texture not found:", matcapName);
            return;
        }
        if (!selectedPart) {
            console.warn("No selected part for customization.");
            return;
        }
    
        console.log("Applying texture to part:", selectedPart);
    
        // Separate traversal for chassis and wheels
        if (selectedPart === 'chassis') {
            // Apply the texture only to chassis
            carGroupRef.current.traverse((child) => {
                console.log("Checking child for chassis:", child.name); // Debugging log

                if (child instanceof THREE.Mesh && child.name === 'shadeTransparentLand003') {
                    console.log(`Applying matcap texture to chassis: ${child.name}`);
                    child.material = new THREE.MeshMatcapMaterial({ matcap: texture });
                    child.material.needsUpdate = true;
                    console.log(`Updated chassis with ${matcapName} matcap`);
                }
            });
        } else if (selectedPart === 'wheels') {
        // Apply the texture only to wheels
        carGroupRef.current.traverse((child) => {
            console.log("Checking child for wheels:", child.name); // Debugging log
            if (child instanceof THREE.Mesh 
                    && (child.name.includes('wheels') 
                    || child.name === 'shadeelevator005' 
                    || child.name === 'shadeelevator006'
                    || child.name === 'shadeelevator007'
                    || child.name === 'shadeelevator008'
                    || child.name === 'shadeelevator009' 
                    || child.name === 'shadeelevator010'
                    || child.name === 'shadeelevator011'
                    || child.name === 'shadeelevator012'
                )) {
                console.log(`Applying matcap texture to wheel: ${child.name}`);
                child.material = new THREE.MeshMatcapMaterial({ matcap: texture });
                child.material.needsUpdate = true;
                console.log(`Updated wheel ${child.name} with ${matcapName} matcap`);
            }
        });
    } else if (selectedPart === 'tires') {
        // Apply the texture only to tires
        carGroupRef.current.traverse((child) => {
            console.log("Checking child for tires:", child.name); // Debugging log
            if (child instanceof THREE.Mesh && 
                (child.name.includes('tires') || 
                 ['tirePart1', 'tirePart2', 'tirePart3', 'tirePart4'].includes(child.name))
            ) {
                console.log(`Applying matcap texture to tire: ${child.name}`);
                child.material = new THREE.MeshMatcapMaterial({ matcap: texture });
                child.material.needsUpdate = true;
                console.log(`Updated tire ${child.name} with ${matcapName} matcap`);
            }
        });
    }
    
        setShowMatcapMenu(false);
    };

    function SampleNextArrow({ onClick }: { onClick?: () => void }) {
        return (
            <div
                className="custom-next-arrow"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "absolute",
                    top: "50%",
                    right: "-20px",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                }}
                onClick={onClick}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    width="40px"
                    height="40px"
                >
                    <path d="M9.29 16.29a1 1 0 001.41 0L15 12l-4.3-4.3a1 1 0 00-1.4 1.42L12.18 12l-2.89 2.88a1 1 0 000 1.41z" />
                </svg>
            </div>
        );
    }
    
    function SamplePrevArrow({ onClick }: { onClick?: () => void }) {
        return (
            <div
                className="custom-prev-arrow"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "absolute",
                    top: "50%",
                    left: "-20px",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                }}
                onClick={onClick}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    width="40px"
                    height="40px"
                >
                    <path d="M14.71 16.29a1 1 0 01-1.42 0L9 12l4.3-4.3a1 1 0 011.4 1.42L11.82 12l2.89 2.88a1 1 0 010 1.41z" />
                </svg>
            </div>
        );
    }    

    const sliderSettings = {
        arrows: true,         // No navigation dots
        dots: false,
        infinite: true,      // Disable infinite loop
        speed: 500,           // Transition speed
        lazyload: true,
        slidesToShow: 3,      // Show 3 icons per slide
        slidesToScroll: 1,    // Scroll 1 icon at a time
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2, // Show 2 icons on smaller screens
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2, // Show 1 icon on very small screens
                    slidesToScroll: 1,
                }
            }
        ]
    };    

    const showroomSliderSettings = {
        arrows: true,         // No navigation dots
        infinite: true,      // Disable infinite loop
        fade: true,
        dots: false,
        autoplay: true,
        autoplaySpeed: 10000,
        speed: 1000,           // Transition speed
        slidesToShow: 1,      // Show 3 icons per slide
        slidesToScroll: 1,    // Scroll 1 icon at a time
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        afterChange: (index: number) => {
            switchShowroomCar(index); // Update visible car based on slider index
        },
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1, // Show 2 icons on smaller screens
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1, // Show 1 icon on very small screens
                    slidesToScroll: 1,
                }
            }
        ]
    }; 

     // WebSocket initialization
     const initializeWebSocket = useCallback(() => {
        if (wsRef.current) {
            console.log('WebSocket already initialized');
            return;
        }

        const token = localStorage.getItem('token');
        const serverAddress = `wss://krashbox.glitch.me?token=${token}`;
        wsRef.current = new WebSocket(serverAddress);

        wsRef.current.onopen = () => {
            console.log('WebSocket connected');
            setIsWebSocketReady(true);

            // Request player score after WebSocket connects
            if (playerId) {
                wsRef.current?.send(
                    JSON.stringify({
                        type: 'getScore',
                        playerId,
                    })
                );
            } else {
                console.error('Player ID not found in localStorage');
            }

            if (playerId) {
                wsRef.current?.send(
                    JSON.stringify({
                        type: 'getSelectedCar',
                        playerId,
                    })
                );
            } else {
                console.error('Selected car not found in localStorage');
            }
        };

        wsRef.current.onmessage = (event) => {
            let message;
            try {
                message = JSON.parse(event.data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', event.data);
                return;
            }

            console.log('Received WebSocket message:', message);

            // Handle player score message
            if (message.type === 'playerScore') {
                if (typeof message.score === 'number') {
                    console.log(`Player score received: ${message.score}`);
                    setPlayerAccount(message.score);
                    setLoadingAccount(false);
                } else {
                    console.error('Invalid score received:', message.score);
                    setLoadingAccount(false);
                }
            }

            // Handle selectedCar message
            if (message.type === 'selectedCar') {
                const selectedCar = message.selectedCar || 'kybertruck'; // Default to kybertruck
                setSelectedCar(selectedCar);

                const carIndex = cars.findIndex((car) => car.name === selectedCar);
                setCurrentCarIndex(carIndex !== -1 ? carIndex : 0); // Default to the first car if not found
                loadCar(carIndex !== -1 ? carIndex : 0);
            }
        };

        wsRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setLoadingAccount(false);
        };

        wsRef.current.onclose = () => {
            console.log('WebSocket closed');
        };
    }, []);

    // Initialize WebSocket when component mounts
    useEffect(() => {
        initializeWebSocket();

        return () => {
            // Clean up WebSocket connection
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [initializeWebSocket]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />

            {/* <div style={{ position: 'absolute', bottom: '15%', left: '10%', transform: 'translateY(-50%)' }}>
                <button onClick={handlePreviousCar}>←</button>
            </div>
            <div style={{ position: 'absolute', bottom: '15%', right: '10%', transform: 'translateY(-50%)' }}>
                <button onClick={handleNextCar}>→</button>
            </div> */}
            {/* <div className="coin-element">
                <div className="coin-container">
                    <div className="coin-icon" style={{ fontSize: "25px", animation: "rotateClockwise 6s linear infinite" }}>❖</div>
                    <div className="coin-layer">{playerAccount}</div>
                </div>          
            </div> */}
            <div className="coin-element">
                <div className="coin-container">
                    <div
                        className="button-element"
                        style={{
                            left: "-100px",
                            backdropFilter: "blur(10px)",
                            backgroundColor: isNitroActive ? "#8CFF80" : "transparent", // Dynamically set background color
                            transition: "background-color 0.3s ease", // Smooth transition for background color
                        }}
                        onClick={handleNitroToggle} // Call the toggle function
                    >
                        <div
                            className="button-icon"
                            style={{
                                backgroundImage: `url('/images/mobile/doubleTriangle.png')`,
                            }}
                        />
                    </div>
                    <div className="coin-icon" style={{ fontSize: "25px", animation: "rotateClockwise 5s linear infinite" }}>
                    
                    </div>
                    {/* <div className="coin-layer">{loadingAccount ? 'Loading...' : formatBalance(playerAccount)}</div> */}
                    <div className="coin-layer-wrapper">
                        <h2 className="account-title">ACCOUNT FUNDS</h2>
                        <div className="coin-layer">{loadingAccount ? 'Loading...' : formatBalance(playerAccount)}</div>
                    </div>
                    <div
                        className="button-element"
                        style={{
                            right: "-100px",
                            backdropFilter: "blur(10px)",
                            backgroundColor: isButtonActive ? "#8CFF80" : "transparent", // Dynamically set background color
                            transition: "background-color 0.3s ease", // Smooth transition for background color
                        }}
                        onClick={handleBlinkToggle}
                    >
                        <div
                            className="button-icon"
                            style={{
                                backgroundImage: `url('/images/mobile/warning.png')`,
                            }}
                        />
                    </div>
                </div>
            </div>

                <div
                    style={{
                        position: 'absolute',
                        top: '80px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                        color: '#fff',
                        fontFamily: 'Orbitron',
                    }}
                >
                    {currentCarAttributes && (
                        <div className="flex flex-col items-center" style={{ marginTop: '40px', width: '100%' }}>
                            {(Object.keys(currentCarAttributes) as Array<keyof typeof currentCarAttributes>).map((attr) => {
                                const value = currentCarAttributes[attr];
                                const getBarColor = (value: number) => {
                                    if (value <= 30) return '#FF8000';
                                    if (value <= 60) return '#FF8000';
                                    return '#18FF00';
                                };

                                return (
                                    <div key={attr} className="flex items-center" style={{ marginBottom: '10px', width: '100%', display: 'flex', alignItems: 'center' }}>
                                        <p
                                            style={{
                                                fontFamily: 'Orbitron',
                                                fontSize: '10px',
                                                marginBottom: '0px',
                                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                                                textAlign: 'left',
                                                width: '250px',
                                                flex: '1',
                                                marginRight: '10px',
                                            }}
                                        >
                                            {attr}: {value}
                                        </p>
                                        <div
                                            style={{
                                                position: 'relative',
                                                height: '5px',
                                                flex: '3',
                                                width: '100%',
                                                background: 'transparent',
                                                borderRadius: '2px',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div
                                                className="battery-bar"
                                                style={{
                                                    height: '5px',
                                                    width: `${Math.min(value, 100)}%`, // Cap value to 100%
                                                    background: getBarColor(value),
                                                    transition: 'width 0.3s ease',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            <div
                style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    color: '#fff',
                    fontFamily: 'Orbitron',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '100px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                        color: '#fff',
                        fontFamily: 'Orbitron',
                    }}
                >
                                
                </div>

                {view === 'car' && (
                    <h3
                        style={{
                            fontSize: '30px',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                        }}
                    >
                        Kybertruck
                    </h3>
                )}
                {view === 'rocket' && (
                    <h3
                        style={{
                            fontSize: '30px',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                        }}
                    >
                        Venerium
                    </h3>
                )}
                {/* {view === 'showroom' && (
                    <h3
                        style={{
                            fontSize: '30px',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                        }}
                    >
                        Showroom
                    </h3>
                )} */}

                {/* Main Menu Buttons */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        position: 'relative', // Allow absolute positioning of child elements
                    }}
                >
                    {/* READY Button - Hidden in non-menu views */}
                    {view === 'menu' && (
                        <button
                        onClick={() => setNavigateToPage('/')}
                        >
                            <div className="container">
                            <div className="btn" id="btn-main-div">
                            <div id="btn-bg">
                                
                            </div>
                            <a onClick={() => setNavigateToPage('/')}>LET'S KRASH</a>
                            </div>
                        </div>
                      </button>
                    
                        // <button
                        //     style={{
                        //         paddingTop: '5px',
                        //         textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                        //         borderRadius: '8px',
                        //         cursor: 'pointer',
                        //         fontSize: '20px',
                        //         fontFamily: 'Orbitron',
                        //         // animation: 'pulse 1.5s infinite',
                        //         display: 'flex',
                        //         justifyContent: 'center',
                        //         alignItems: 'center',
                        //         position: 'absolute', // Position above the menu
                        //         top: '-50px', // Adjust spacing above the menu
                        //         zIndex: 10, // Ensure it's above other elements
                        //     }}
                        //     onClick={() => setNavigateToPage('/')}
                        // >
                        //     LET'S KRASH
                        //     {/* <span
                        //         style={{
                        //             marginLeft: '10px',
                        //         }}
                        //         dangerouslySetInnerHTML={{
                        //             __html: feather.icons['play-circle'].toSvg({ width: 20, height: 20 }),
                        //         }}
                        //     /> */}
                        // </button>
                    )}

                    {/* Main Menu Buttons */}
                    {view === 'menu' && (
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            <button
                                style={{
                                    padding: '20px 0',
                                    animation: 'pulse 1.5s infinite',
                                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                }}
                                onClick={() => toggleView('car')}
                            >
                                VEHICLE
                            </button>
                            <button
                                style={{
                                    padding: '20px 0',
                                    animation: 'pulse 1.5s infinite',
                                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                }}
                                onClick={() => toggleView('rocket')}
                            >
                                WEAPON
                            </button>
                            <button
                                style={{
                                    padding: '20px 0',
                                    animation: 'pulse 1.5s infinite',
                                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                }}
                                onClick={() => toggleView('showroom')}
                            >
                                SHOWROOM
                            </button>
                        </div>
                    )}
                </div>

                {/* Customize View */}
                {view === 'customize' && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row', // Change to 'row' for horizontal alignment
                            gap: '20px',          // Space between buttons
                            justifyContent: 'center', // Center-align buttons horizontally
                            alignItems: 'center', // Center-align buttons vertically
                        }}
                >
                        <button
                            style={{
                                padding: '0',
                                // animation: 'pulse 1.5s infinite',
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '30px'
                            }}
                            onClick={handleCarClick}
                        >
                            Customize
                        </button>
                        {/* <button
                            style={{
                                padding: '10px 20px',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                            }}
                            onClick={() => toggleView('menu')}
                        >
                            BACK TO MENU
                        </button> */}
                    </div>
                )}

                {/* Back to Menu button for all other views */}
                {view !== 'menu' && view !== 'showroom' && (
                    <button
                        style={{
                            padding: '20px 0',
                            animation: 'pulse 1.5s infinite',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                            color: '#fff',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                        onClick={() => toggleView('menu')}
                    >
                        BACK TO MENU
                    </button>
                )}

                {/* {view === 'showroom' && (
                    <button
                        style={{
                            padding: '230px 0',
                            animation: 'pulse 1.5s infinite',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                            color: '#fff',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            zIndex: '10000',
                            }}
                            onClick={() => toggleView('menu')}
                            >
                                BACK TO MENU
                            </button>
                                )} */}
            </div>

            {view === 'showroom' && (
                <div className='showroom-layer'
                    style={{
                        position: 'absolute',
                        bottom: '-50px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '30px',
                        paddingTop: '70px',
                        backdropFilter: 'blur(5px)',
                        borderRadius: '0px',
                        color: '#fff',
                        textAlign: 'center',
                        zIndex: 1000,
                        maxWidth: '100%',
                        height: '30%',
                    }}
                >
                    <Slider {...showroomSliderSettings}>
                        {cars.map((car, index) => (
                            <div
                                key={car.name}
                                style={{
                                    display: 'flex',
                                    textAlign: 'left',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '20px',
                                    background: 'rgba(0, 0, 0, 0.5)',
                                    borderRadius: '10px',
                                    // boxShadow: '0px 0px 10px rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                }}
                            >
                                {/* <p style={{ fontFamily: 'Orbitron', fontSize: '20px', marginTop: '10px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)'}}>
                                    {car.price} ❖
                                </p> */}
                                {/* Car Name and Price */}
                                <h4 style={{ fontFamily: 'Orbitron', fontSize: '21px', marginBottom: '0px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)' }}>
                                    {car.name}
                                </h4>
                                {/* Select Button */}
                                <button
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '5px',
                                        color: '#fff',
                                        fontFamily: 'Orbitron',
                                        fontSize: '12px',
                                        marginTop: '0px',
                                        cursor: 'pointer',
                                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                                        animation: 'pulse 1.5s infinite'
                                    }}
                                    onClick={() => handleCarSelection(car.name)}
                                >
                                    SELECT
                                </button>
                            </div>
                        ))}
                    </Slider>
                </div>
            )}

            {/* Customization Menu */}
            {/* {showCustomizationMenu && (
                <div className="customization-menu">
                    <Slider {...sliderSettings} className="customization-slider">
                        {Object.keys(pngIcons).map((partName) => (
                            <button
                                key={partName}
                                onClick={() => handlePartSelection(partName)}
                                className="customization-button"
                            >
                                <img
                                    src={pngIcons[partName]}
                                    alt={`${partName} icon`}
                                    className="customization-icon"
                                />
                            </button>
                        ))}
                    </Slider>
                </div>
            )} */}

            {/* Customization Menu */}
            {showCustomizationMenu && (
                <div className="customization-menu">
                    <Slider {...sliderSettings} className="customization-slider">
                        {Object.entries(filteredPngIcons).map(([partName, iconPath]) => (
                            <button
                                key={partName}
                                onClick={() => handlePartSelection(partName)}
                                className="customization-button"
                            >
                                <img
                                    src={iconPath}
                                    alt={`${partName} icon`}
                                    className="customization-icon"
                                />
                            </button>
                        ))}
                    </Slider>
                </div>
            )}

            {/* Material Selection Menu */}
                {selectedPart && (
                    <div className="texture-menu">
                        <div className="menu-header">
                        </div>
                        <Slider
                        className="texture-slider"
                        slidesToShow={4}
                        slidesToScroll={5}
                        infinite={true}
                        arrows={false}
                        >
                        {Object.keys(matcapTextures.current).map((matcapName) => (
                            <div key={matcapName} className="texture-slider-item">
                                <div>
                            
                            </div>
                            <button
                                onClick={() => handlePartCustomization(matcapName)}
                                className="texture-button"
                            >
                                <img
                                src={matcapTextures.current[matcapName].image.currentSrc}
                                alt={matcapName}
                                className="texture-icon"
                                />
                            </button>
                            </div>
                        ))}
                        </Slider>
                        <div className="x-button">
                            <button
                                onClick={() => setSelectedPart(null)}
                                className="close-button"
                            >
                                CONFIRM
                            </button>
                            </div>
                    </div>
                
                )}
        </div>
    );
}
