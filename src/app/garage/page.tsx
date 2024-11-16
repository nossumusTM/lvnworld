'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { useSearchParams } from 'next/navigation';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import gsap from 'gsap';

export default function GaragePage() {
    const searchParams = useSearchParams();
    const [playerBalance, setPlayerBalance] = useState<number>(365747);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const carGroupRef = useRef<THREE.Group>(new THREE.Group());
    const rocketGroupRef = useRef<THREE.Group>(new THREE.Group());
    const showroomGroupRef = useRef<THREE.Group>(new THREE.Group());
    const [currentCarIndex, setCurrentCarIndex] = useState(0);
    const [isOrbitEnabled, setIsOrbitEnabled] = useState(false);
    const [showCustomizationMenu, setShowCustomizationMenu] = useState(false);
    const [view, setView] = useState<'menu' | 'car' | 'rocket' | 'showroom' | 'customize'>('menu');
    const [showMatcapMenu, setShowMatcapMenu] = useState(false);
    const [selectedPart, setSelectedPart] = useState<string | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); // Reference for camera

    const cars = [
        {
            name: 'Kybertruck',
            price: 1000,
            parts: {
                chassisbottom: '/models/car/default/chassisbottom.glb',
                chassis: '/models/car/default/chassisbody.glb',
                bumper: '/models/car/default/bumper.glb',
                spoiler: '/models/car/default/spoiler.glb',
                window: '/models/car/default/window.glb',
                wheels: '/models/car/default/wheels.glb',
                tire: '/models/car/default/tire.glb',
                antena: '/models/car/default/antena.glb',
                // rocket: '/models/rocket/base.glb',
            },
        },
        {
            name: 'Aventador',
            price: 500000,
            parts: {
                chassisbottom: '/models/car/default/chassisbottom.glb',
                chassis: '/models/car/default/chassisbody.glb',
                bumper: '/models/car/default/bumper.glb',
                spoiler: '/models/car/default/spoiler.glb',
                window: '/models/car/default/window.glb',
                wheels: '/models/car/default/wheels.glb',
                tire: '/models/car/default/tire.glb',
                antena: '/models/car/default/antena.glb',
                // rocket: '/models/rocket/base.glb',
            },
        },
        // Add more cars here later
    ];

    const toggleView = (selectedView: 'menu' | 'car' | 'rocket' | 'showroom' | 'customize') => {
        console.log('Toggling view to:', selectedView);
    
        setView(selectedView); // Update the state
    
        if (selectedView === 'car') {

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
                    child.visible = false; // Hide the rocket
                }
            });

            setView('customize');

        } else if (selectedView === 'rocket') {

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
                    child.visible = false; // Hide the rocket
                }
            });
    
            setView('rocket');
        } else if (selectedView === 'showroom') {
            // Clear previous showroom content and load fresh showroom cars
            console.log('Loading showroom cars...');

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
                    child.visible = true; // Hide the rocket
                }
            });
    
            console.log('Entering showroom view');
            setView('showroom');
        } else if (selectedView === 'menu') {
            setView('menu');
        }
    
        console.log('Rocket group visibility:', rocketGroupRef.current.children.map((c) => c.visible)); // Debug log
    };    

    useEffect(() => {
        // toggleView('car'); // Default to car view when the scene initializes

        const balance = searchParams.get('balance');

        // Parse the balance and set it in state
        if (balance && !isNaN(Number(balance))) {
            setPlayerBalance(Number(balance));
        }
    }, [searchParams]); // Run when searchParams change

    const kybertruck = [
        { 
            chassisbottom: '/models/car/default/chassisbottom.glb',
            chassis: '/models/car/default/chassisbody.glb',
            bumper: '/models/car/default/bumper.glb',
            spoiler: '/models/car/default/spoiler.glb',
            window: '/models/car/default/window.glb',
            wheels: '/models/car/default/wheels.glb', 
            tire: '/models/car/default/tire.glb', 
            antena: '/models/car/default/antena.glb',
            // rocket: '/models/rocket/base.glb', // Ensure this path is correct
        },
    ];

    const controlsRef = useRef<OrbitControls | null>(null);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const customizationPoints = useRef<THREE.Mesh[]>([]);
    const matcapTextures = useRef<{ [key: string]: THREE.Texture }>({});

    const pngIcons: { [key: string]: string } = {
        chassis: '/garage/chassis.png',
        wheels: '/garage/wheel.png',
        chassisbottom: '/garage/bottom.png',
        spoiler: '/garage/spoiler.png',
        window: '/garage/window.png',
    };     

    // Load matcap textures
    useEffect(() => {
        const textureLoader = new THREE.TextureLoader();
        const matcaps = ['elevator', 'blueGlass', 'metal', 'volcano', 'amazon', 'black', 'blacksea',
                          'blue', 'blueeye', 'bw', 'charcoal', 'darkEmerald', 'darkMetal', 'divo',
                          'emeraldGreen', 'exotic', 'gold', 'gray', 'green', 'greenBulb', 'indigo',
                          'lemonblue', 'line', 'marble', 'mixature', 'offwhite', 'panacea', 'purple',
                          'red', 'sky', 'sunearth', 'transparentLand', 'valakas', 'violetorange',
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
        scene.background = new THREE.Color('#0213f7'); // Updated background color
        cameraRef.current = new THREE.PerspectiveCamera(1.2, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraRef.current.position.set(0, -200, 2);
    
        const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
    
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
    
        // Initialize carGroup and load car parts
        // carGroupRef.current = new THREE.Group();
        // rocketGroupRef.current = new THREE.Group();
        // showroomGroupRef.current = new THREE.Group();

        // Initially hide showroom group
        showroomGroupRef.current.visible = false;
        rocketGroupRef.current.visible = false;

        // Load assets
        const loadAssets = async () => {
            await Promise.all([loadCar(currentCarIndex), loadShowroomCar(cars), loadRocket()]);
            scene.add(carGroupRef.current);
            scene.add(rocketGroupRef.current);
            scene.add(showroomGroupRef.current);
        };

        loadAssets();

        const animate = () => {
            requestAnimationFrame(animate);

            // Spin the car group
            if (carGroupRef.current) {
                // carGroupRef.current.rotation.x += 0.001; // Adjust speed as needed
                // carGroupRef.current.rotation.y += 0.001;
                // carGroupRef.current.rotation.z += 0.01;
            }

            // Spin the rocket group
            if (rocketGroupRef.current) {
                rocketGroupRef.current.rotation.x += 0.005; // Adjust speed as needed
                rocketGroupRef.current.rotation.y += 0.005;
                rocketGroupRef.current.rotation.z += 0.005;
            }

            if (controlsRef.current) {
                controlsRef.current.update();
            }
            if (cameraRef.current) {
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
        };
    }, [currentCarIndex]);

    
    // const loadCar = async (index: number) => {
    //     carGroupRef.current.clear();

    //     const loader = new GLTFLoader();
    //     // const carParts = kybertruck[index];
    //     const carParts = index < kybertruck.length ? kybertruck[index] : cars[index]?.parts;
    //     if (!carParts) {
    //         console.warn(`No parts found for car index: ${index}. Defaulting to Kybertruck.`);
    //         setCurrentCarIndex(0); // Default to Kybertruck
    //         return;
    //     }

        // Function to apply a matcap texture to parts
        // const applyMatcap = (part: THREE.Object3D, matcapName: string) => {
        //     const texture = matcapTextures.current[matcapName];
        //     if (texture) {
        //         part.traverse((child) => {
        //             if (child instanceof THREE.Mesh) {
        //                 child.material = new THREE.MeshMatcapMaterial({ matcap: texture });
        //                 child.material.needsUpdate = true;
        //             }
        //         });
        //     }
        // };

        // const loadingPromises: Promise<THREE.Object3D>[] = [];

        // Object.entries(carParts).forEach(([partName, partPath]) => {
        //     const promise: Promise<THREE.Object3D> = new Promise((resolve) => {
        //         loader.load(partPath, (gltf) => {
        //             const part = gltf.scene as THREE.Object3D;
        //             part.name = partName;
                    
        //             if (partName === 'chassis') {
        //                 applyMatcap(part, 'blueGlass');
        //             } else if (partName === 'wheels') {
        //                 applyMatcap(part, 'metal');
        //             } else if (partName === 'tire') {
        //                 applyMatcap(part, 'black');
        //             } else if (partName === 'chassisbottom') {
        //                 applyMatcap(part, 'black');
        //             } else if (partName === 'bumper') {
        //                 applyMatcap(part, 'black');
        //             } else if (partName === 'spoiler') {
        //                 applyMatcap(part, 'black');
        //             } else if (partName === 'window') {
        //                 applyMatcap(part, 'black');
        //             }

        //             if (partName === 'rocket') {
        //                 console.log('Adding rocket to rocketGroupRef:', part); // Debug log
        //                 rocketGroupRef.current.add(part);
        //                 part.visible = false; // Hide rocket initially
        //                 part.position.set(-1, 0, 0); // Scale down the rocket
        //                 part.scale.set(0.5, 0.5, 0.5); // Scale down the rocket
        //                 applyMatcap(part, 'valakas');
        //             } else {
        //                 carGroupRef.current.add(part); // Add other parts to car group
        //             }
    
        //             // carGroupRef.current.add(part);
        //             resolve(part); // Resolve the promise once the part is loaded
        //             });
        //         });

        //         loadingPromises.push(promise);
        //     });

        //     // Wait for all parts to finish loading
        //     await Promise.all(loadingPromises);
        //     scene.add(carGroupRef.current);
        //     scene.add(rocketGroupRef.current);
        //     // scene.add(showroomGroupRef.current);

        // };

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

        const loadCar = async (index: number) => {
            carGroupRef.current.clear();

            showroomGroupRef.current.visible = false;
            rocketGroupRef.current.visible = false;
        
            const loader = new GLTFLoader();
            const carParts = index < kybertruck.length ? kybertruck[index] : cars[index]?.parts;
            if (!carParts) return;
        
            const loadingPromises = Object.entries(carParts).map(([partName, partPath]) =>
                new Promise<void>((resolve) => {
                    loader.load(partPath, (gltf) => {
                        const part = gltf.scene;
                        part.name = partName;

                        
                        if (partName === 'chassis') {
                            applyMatcap(part, 'volcano');
                        } else if (partName === 'wheels') {
                            applyMatcap(part, 'green');
                        } else if (partName === 'tire') {
                            applyMatcap(part, 'black');
                        } else if (partName === 'chassisbottom') {
                            applyMatcap(part, 'black');
                        } else if (partName === 'bumper') {
                            applyMatcap(part, 'black');
                        } else if (partName === 'spoiler') {
                            applyMatcap(part, 'black');
                        } else if (partName === 'window') {
                            applyMatcap(part, 'black');
                        }
                        
                        carGroupRef.current.add(part);
                        resolve();
                    });
                })
            );
        
            await Promise.all(loadingPromises);
        };
    
        const loadShowroomCar = async (cars: Array<{ name: string; parts: Record<string, string>; price: number }>) => {
            showroomGroupRef.current.clear();
        
            const loader = new GLTFLoader();
        
            await Promise.all(
                cars.map((car, i) =>
                    new Promise<void>((resolve) => {
                        const carGroup = new THREE.Group();
                        Object.entries(car.parts).forEach(([partName, partPath]) => {
                            loader.load(partPath, (gltf) => {
                                const part = gltf.scene;
                                carGroup.add(part);
                            });
                        });
                        carGroup.position.set(i * 10, 0, 0); // Position cars side by side
                        showroomGroupRef.current.add(carGroup);
                        resolve();
                    })
                )
            );
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
                applyMatcap(rocket, 'valakas');
                rocket.scale.set(0.5, 0.5, 0.5);
                rocket.position.set(-1, 0, 0);
                rocketGroupRef.current.add(rocket);
            });
        };
        

    useEffect(() => {
        const loadAssets = async () => {
            await loadCar(currentCarIndex); // Load the dynamically selected car
            await loadShowroomCar(cars);   // Load all cars in the showroom
        };

        loadAssets();
    }, [currentCarIndex]);

    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.enabled = isOrbitEnabled;
        }
    }, [isOrbitEnabled]);

    const handleNextCar = () => {
        setCurrentCarIndex((prevIndex) => (prevIndex + 1) % kybertruck.length);
        setIsOrbitEnabled(false);
    };

    const handlePreviousCar = () => {
        setCurrentCarIndex((prevIndex) => (prevIndex - 1 + kybertruck.length) % kybertruck.length);
        setIsOrbitEnabled(false);
    };

    const handleCarClick = () => {
        setIsOrbitEnabled(true);
        setShowCustomizationMenu(true);
    };

    const handleCarSelection = (carName: string) => {
        const selectedCar = cars.find((car) => car.name === carName);
        if (selectedCar) {
            // loadCarParts(selectedCar.parts); // Load the selected car's parts
            const carIndex = cars.indexOf(selectedCar);
            setCurrentCarIndex(carIndex);
            toggleView('car'); // Switch back to the car view
        } else {
            console.warn(`Car not found for name: ${carName}. Defaulting to Kybertruck.`);
            setCurrentCarIndex(0); // Default to Kybertruck
        }
    };

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
        // setSelectedPart(null);
    };

    const sliderSettings = {
        arrows: true,         // No navigation dots
        infinite: true,      // Disable infinite loop
        speed: 500,           // Transition speed
        slidesToShow: 3,      // Show 3 icons per slide
        slidesToScroll: 1,    // Scroll 1 icon at a time
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

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />

            {/* <div style={{ position: 'absolute', bottom: '15%', left: '10%', transform: 'translateY(-50%)' }}>
                <button onClick={handlePreviousCar}>←</button>
            </div>
            <div style={{ position: 'absolute', bottom: '15%', right: '10%', transform: 'translateY(-50%)' }}>
                <button onClick={handleNextCar}>→</button>
            </div> */}

            <div className="coin-layer">
                ❖ {playerBalance} ❖
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
                            AUTO
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

                {/* Customize View */}
                {view === 'customize' && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            justifyContent: 'center',
                            alignItems: 'center',
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
                {view !== 'menu' && (
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
            </div>

            {/* <div style={{ position: 'absolute', bottom: '50px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', color: '#fff', fontFamily: 'Orbitron' }}>
                {view === 'car' && (
                    <h3 style={{ fontSize: '30px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)' }}>
                        Kybertruck
                    </h3>
                )}
                {view === 'rocket' && (
                    <h3 style={{ fontSize: '30px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)' }}>
                        Venerium
                    </h3>
                )}
                {view === 'showroom' && (
                    <h3 style={{ fontSize: '30px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)' }}>
                        Showroom
                    </h3>

                )}
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <button
                        style={{
                            padding: '20px 0',
                            animation: 'pulse 1.5s infinite',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                            // backgroundColor: '#18ff00',
                            // color: '#000',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            toggleView('car'); // Toggle the view to car
                            handleCarClick();  // Handle car customization click
                        }}
                    >
                        CUSTOMIZE
                    </button>
                    <button
                        style={{
                            padding: '20px 0',
                            animation: 'pulse 1.5s infinite',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',
                            // backgroundColor: '#ff0018',
                            color: '#fff',
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
                            color: '#fff',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                        // onClick={() => toggleView('showroom')}
                    >
                        SHOWROOM
                    </button>
                </div>
            </div> */}

            {view === 'showroom' && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '0',
                        marginBottom: '120px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: '#fff',
                        textAlign: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'left' }}>
                        {cars.map((car) => (
                            <div
                                key={car.name}
                                style={{
                                    padding: '20px 80px 20px 80px',
                                    background: 'transparent',
                                    borderRadius: '10px',
                                    backdropFilter: 'blur(5px)',
                                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleCarSelection(car.name)}
                            >
                                <h4 style={{ fontFamily: 'Orbitron', fontSize: '30px', marginBottom: '10px' }}>{car.name}</h4>
                                <p style={{ fontFamily: 'Orbitron', marginBottom: '10px', fontSize: '30px' }}>{car.price} ❖</p>
                                <button
                                    style={{
                                        padding: '10px',
                                        borderRadius: '5px',
                                        // background: '#18ff00',
                                        // color: '#000',
                                        cursor: 'pointer',
                                        fontFamily: 'Orbitron',
                                        animation: 'pulse 1.5s infinite'
                                    }}
                                >
                                    SELECT
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Customization Menu */}
            {showCustomizationMenu && (
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
            )}

            {/* Material Selection Menu */}
                {selectedPart && (
                <div className="texture-menu">
                    <div className="menu-header">
                    {/* <h4 style={{  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',}}>{selectedPart.toUpperCase()}</h4> */}
                    {/* <h4 style={{  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',}}>TEXTURE</h4> */}
                    </div>
                    <Slider
                    className="texture-slider"
                    slidesToShow={5}
                    slidesToScroll={1}
                    infinite={true}
                    arrows={true}
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
