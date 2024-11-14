'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

export default function GaragePage() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const carGroupRef = useRef<THREE.Group>(new THREE.Group());
    const [currentCarIndex, setCurrentCarIndex] = useState(0);
    const [isOrbitEnabled, setIsOrbitEnabled] = useState(false);
    const [showCustomizationMenu, setShowCustomizationMenu] = useState(false);
    const [showMatcapMenu, setShowMatcapMenu] = useState(false);
    const [selectedPart, setSelectedPart] = useState<string | null>(null);

    const carModels = [
        { 
            chassisbottom: '/models/car/default/chassisbottom.glb',
            chassis: '/models/car/default/chassisbody.glb',
            bumper: '/models/car/default/bumper.glb',
            spoiler: '/models/car/default/spoiler.glb',
            window: '/models/car/default/window.glb',
            wheels: '/models/car/default/wheels.glb', 
            tire: '/models/car/default/tire.glb', 
            antena: '/models/car/default/antena.glb'
        },
    ];

    const controlsRef = useRef<OrbitControls | null>(null);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const customizationPoints = useRef<THREE.Mesh[]>([]);
    const matcapTextures = useRef<{ [key: string]: THREE.Texture }>({});
    // const svgIcons = {
    //     chassis: '/garage/chassis.svg',
    //     wheels: '/garage/wheel.svg',
    //     tire: '/garage/rocket.svg',
    // };

    const svgIcons: { [key: string]: string } = {
        chassis: '/garage/chassis.svg',
        chassisbottom: '/garage/chassisbottom.svg',
        bumper: '/garage/bumper.svg',
        spoiler: '/garage/spoiler.svg',
        window: '/garage/window.svg',
        wheels: '/garage/wheel.svg',
        tire: '/garage/tire.svg',
        antena: '/garage/antena.svg',
    };    

    // Load matcap textures
    useEffect(() => {
        const textureLoader = new THREE.TextureLoader();
        const matcaps = ['elevator', 'blueGlass', 'metal', 'volcano'];
        matcaps.forEach((matcap) => {
            matcapTextures.current[matcap] = textureLoader.load(`/models/matcaps/${matcap}.png`);
        });
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;
    
        // Initialize the scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#0213f7'); // Updated background color
        const camera = new THREE.PerspectiveCamera(1.2, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, -200, 2);
    
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
        controlsRef.current = new OrbitControls(camera, renderer.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.05;
        controlsRef.current.enabled = isOrbitEnabled;

        // Limit zoom in and zoom out distance
        controlsRef.current.minDistance = 100; // Minimum zoom distance
        controlsRef.current.maxDistance = 200; // Maximum zoom distance
    
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
    
        // Initialize carGroup and load car parts
        carGroupRef.current = new THREE.Group();
        const loadCar = (index: number) => {
            carGroupRef.current.clear();
            const loader = new GLTFLoader();
            const carParts = carModels[index];
    
            Object.entries(carParts).forEach(([partName, partPath]) => {
                loader.load(partPath, (gltf) => {
                    const part = gltf.scene;
                    part.name = partName;
                    
                    if (partName === 'chassis') {
                        applyMatcap(part, 'blueGlass');
                    } else if (partName === 'wheels') {
                        applyMatcap(part, 'elevator');
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
                });
            });
    
            scene.add(carGroupRef.current);

        };

        loadCar(currentCarIndex);

        const animate = () => {
            requestAnimationFrame(animate);
            if (controlsRef.current) {
                controlsRef.current.update();
            }
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        const handleMouseClick = (event: MouseEvent) => {
            if (!canvasRef.current) return;
        
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
            raycaster.setFromCamera(mouse, camera);
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

    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.enabled = isOrbitEnabled;
        }
    }, [isOrbitEnabled]);

    const handleNextCar = () => {
        setCurrentCarIndex((prevIndex) => (prevIndex + 1) % carModels.length);
        setIsOrbitEnabled(false);
    };

    const handlePreviousCar = () => {
        setCurrentCarIndex((prevIndex) => (prevIndex - 1 + carModels.length) % carModels.length);
        setIsOrbitEnabled(false);
    };

    const handleCarClick = () => {
        setIsOrbitEnabled(true);
        setShowCustomizationMenu(true);
    };

    const handlePartSelection = (partName: string) => {
        setSelectedPart(partName);
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

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />

            <div style={{ position: 'absolute', bottom: '15%', left: '10%', transform: 'translateY(-50%)' }}>
                <button onClick={handlePreviousCar}>←</button>
            </div>
            <div style={{ position: 'absolute', bottom: '15%', right: '10%', transform: 'translateY(-50%)' }}>
                <button onClick={handleNextCar}>→</button>
            </div>

            <div
                style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    color: '#fff',
                    fontFamily: 'Orbitron'
                }}
            >
                <h3 style={{fontSize: '30px'}}>Cybertruck</h3>
                <button style={{paddingTop: '30px'}} onClick={handleCarClick}>CUSTOMIZE</button>
            </div>

            {/* Customization Menu */}
            {showCustomizationMenu && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '10%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '20px',
                        backgroundColor: 'transparent',
                        backdropFilter: 'blur(5px)',
                        padding: '10px',
                        borderRadius: '20px',
                        overflowX: 'auto',
                        maxWidth: '90%', // Restrict the menu width and make it scrollable
                        alignItems: 'center',
                    }}
                >
                    {Object.keys(svgIcons).map((partName) => (
                        <button
                        key={partName}
                        onClick={() => handlePartSelection(partName)}
                        style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '120px', // Adjusted for outer circle padding
                            height: '120px',
                            backgroundColor: 'rgba(24, 255, 0, 0.15)', // Slight transparent green overlay
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px',
                            overflow: 'hidden',
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0px 0px 10px rgba(24, 255, 0, 0.3)', // Subtle glow
                        }}
                    >
                        {/* Highlighted Circle */}
                        {/* <div
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                backgroundColor: '#18ff00',
                                opacity: 0.3, // Slight transparency to see through
                                top: 0,
                                left: 0,
                                zIndex: 1,
                            }}
                        ></div> */}
                    
                        {/* Icon Image */}
                        <img
                            src={svgIcons[partName]}
                            alt={`${partName} icon`}
                            style={{
                                position: 'relative',
                                width: '100%',
                                zIndex: 2,
                            }}
                        />
                    </button>
                    ))}
                </div>
            )}

            {/* Material Selection Menu */}
            {selectedPart && (
                <div
                    style={{
                        position: 'absolute',
                        top: '10%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#333',
                        padding: '10px',
                        borderRadius: '8px',
                    }}
                >
                    <h4>Select Material for {selectedPart}</h4>
                    {Object.keys(matcapTextures.current).map((matcapName) => (
                        <button
                            key={matcapName}
                            onClick={() => handlePartCustomization(matcapName)}
                            style={{
                                margin: '5px',
                                padding: '5px',
                                color: '#fff',
                                backgroundColor: '#555',
                            }}
                        >
                            {matcapName}
                        </button>
                    ))}
                    <button onClick={() => setSelectedPart(null)} style={{ marginTop: '10px' }}>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}
