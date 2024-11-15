'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import gsap from 'gsap';

export default function GaragePage() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const carGroupRef = useRef<THREE.Group>(new THREE.Group());
    const [currentCarIndex, setCurrentCarIndex] = useState(0);
    const [isOrbitEnabled, setIsOrbitEnabled] = useState(false);
    const [showCustomizationMenu, setShowCustomizationMenu] = useState(false);
    const [showMatcapMenu, setShowMatcapMenu] = useState(false);
    const [selectedPart, setSelectedPart] = useState<string | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); // Reference for camera

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
        // bumper: '/garage/frame.svg',
        spoiler: '/garage/spoiler.svg',
        window: '/garage/window.svg',
        wheels: '/garage/wheel.svg',
        // tire: '/garage/frame.svg',
        // antena: '/garage/frame.svg',
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
                        applyMatcap(part, 'metal');
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

            cameraRef.current?.position.set(0, -100, 2);
            smoothCameraTransition(targetPosition, targetLookAt)
        } else if (partName === 'wheels') {
            cameraRef.current?.position.set(15, 20, 40);
        }
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
                <h3 style={{fontSize: '30px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',}}>Cybertruck</h3>
                <button style={{paddingTop: '20px', animation: 'pulse 1.5s infinite', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)'}} onClick={handleCarClick}>CUSTOMIZE</button>
            </div>

            {/* Customization Menu */}
            {showCustomizationMenu && (
                <div className="customization-menu">
                    <Slider {...sliderSettings} className="customization-slider">
                        {Object.keys(svgIcons).map((partName) => (
                            <button
                                key={partName}
                                onClick={() => handlePartSelection(partName)}
                                className="customization-button"
                            >
                                <img
                                    src={svgIcons[partName]}
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
                    <h4 style={{  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)',}}>TEXTURE</h4>
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
                    <div className='x-button'>
                        <button
                            onClick={() => setSelectedPart(null)}
                            className="close-button"
                        >
                            DONE
                        </button>
                    </div>
                </div>
                )}
        </div>
    );
}
