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
    const [showMatcapMenu, setShowMatcapMenu] = useState(false);
    const [selectedPart, setSelectedPart] = useState<string | null>(null);

    const carModels = [
        { chassis: '/models/car/default/chassis.glb', wheels: '/models/car/default/wheels.glb', tire: '/models/car/default/tire.glb', antena: '/models/car/default/antena.glb' },
    ];

    const controlsRef = useRef<OrbitControls | null>(null);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const customizationPoints = useRef<THREE.Mesh[]>([]);
    const matcapTextures = useRef<{ [key: string]: THREE.Texture }>({});

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
    
        // Load and add the static gas station model
        const loader = new GLTFLoader();
        loader.load('/garage/gasstation.glb', (gltf) => {
            const gasStation = gltf.scene;

            gasStation.position.set(1.5, 0, -0.1);
            gasStation.rotation.x = Math.PI / 2;
            gasStation.rotation.y = Math.PI;
            // gasStation.rotation.z = Math.PI;

            gasStation.scale.set(1, 1, 1);

            // Add gas station directly to the scene so it stays fixed
            scene.add(gasStation);
        });
    
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
                        applyMatcap(part, 'elevator');
                        addArrowCustomizationPoint(part, '/garage/arrow.svg');
                    } else if (partName === 'wheels') {
                        applyMatcap(part, 'elevator');
                        addWheelCustomizationPoint(part, '/garage/arrow.svg'); 
                    } else if (partName === 'tire') {
                        applyMatcap(part, 'black');
                        addTireCustomizationPoint(part, '/garage/arrow.svg')
                    }
    
                    carGroupRef.current.add(part);
                });
            });
    
            scene.add(carGroupRef.current);
            if (controlsRef.current) {
                controlsRef.current.target.copy(carGroupRef.current.position); // Focus controls on carGroup only
            }
        };

        loadCar(currentCarIndex);

        const addArrowCustomizationPoint = (part: THREE.Object3D, svgPath: string) => {
            const loader = new SVGLoader();
        
            loader.load(svgPath, (data) => {
                const paths = data.paths;
                const group = new THREE.Group();
        
                // Extrusion settings for depth
                const extrudeSettings = {
                    depth: 2,
                    bevelEnabled: false,
                };
        
                paths.forEach((path) => {
                    const shapes = SVGLoader.createShapes(path);
                    shapes.forEach((shape) => {
                        const material = new THREE.MeshBasicMaterial({
                            color: 0xffffff,
                            wireframe: true,
                            side: THREE.DoubleSide,
                        });
        
                        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                        const mesh = new THREE.Mesh(geometry, material);
        
                        // Set position and scale for visibility
                        mesh.position.set(0, 0, 0.1);
                        mesh.scale.set(0.02, 0.02, 0.02);
        
                        mesh.userData.partName = part.name; // Set partName based on part
                        customizationPoints.current.push(mesh);
                        group.add(mesh);
                    });
                });
        
                group.position.set(0, 0, 1.5);
                group.rotation.y = Math.PI / 2;
                part.add(group);
        
                const animatePulsate = () => {
                    requestAnimationFrame(animatePulsate);
                    const scale = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
                    group.scale.set(scale, scale, scale);
                };
                animatePulsate();
            });
        };

        // Add arrow customization points to each wheel part
        const addWheelCustomizationPoint = (part: THREE.Object3D, svgPath: string) => {
            const loader = new SVGLoader();

            loader.load(svgPath, (data) => {
                const paths = data.paths;
                const group = new THREE.Group();

                // Extrusion settings to give the arrow shape depth
                const extrudeSettings = {
                    depth: 2,
                    bevelEnabled: false,
                };

                paths.forEach((path) => {
                    const shapes = SVGLoader.createShapes(path);
                    shapes.forEach((shape) => {
                        const material = new THREE.MeshBasicMaterial({
                            color: 0xffffff,
                            wireframe: true,
                            side: THREE.DoubleSide,
                        });

                        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                        const mesh = new THREE.Mesh(geometry, material);

                        // Set position and scale for each arrow
                        mesh.position.set(0, 0, 0.1);
                        mesh.scale.set(0.02, 0.02, 0.02);

                        mesh.userData.partName = part.name; // Set partName to track wheel part
                        customizationPoints.current.push(mesh);
                        group.add(mesh);
                    });
                });

                group.position.set(0.8, -0.4, -0.5); // Adjust position based on wheel part
                group.rotation.y = -Math.PI / 2;

                part.add(group);

                const animatePulsate = () => {
                    requestAnimationFrame(animatePulsate);
                    const scale = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
                    group.scale.set(scale, scale, scale);
                };
                animatePulsate();
            });
        };

        // Add arrow customization points to each tire part
        const addTireCustomizationPoint = (part: THREE.Object3D, svgPath: string) => {
            const loader = new SVGLoader();

            loader.load(svgPath, (data) => {
                const paths = data.paths;
                const group = new THREE.Group();

                // Extrusion settings to give the arrow shape depth
                const extrudeSettings = {
                    depth: 2,
                    bevelEnabled: false,
                };

                paths.forEach((path) => {
                    const shapes = SVGLoader.createShapes(path);
                    shapes.forEach((shape) => {
                        const material = new THREE.MeshBasicMaterial({
                            color: 0xffffff,
                            wireframe: true,
                            side: THREE.DoubleSide,
                        });

                        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                        const mesh = new THREE.Mesh(geometry, material);

                        // Set position and scale for each arrow
                        mesh.position.set(0, 0, 0.1);
                        mesh.scale.set(0.02, 0.02, 0.02);

                        mesh.userData.partName = part.name; // Set partName to track tire part
                        customizationPoints.current.push(mesh);
                        group.add(mesh);
                    });
                });

                // Position the group relative to the tire part
                group.position.set(-1.4, -0.5, 0.3); // Adjust position based on tire part positioning
                group.rotation.x = -Math.PI / 2;

                part.add(group);

                const animatePulsate = () => {
                    requestAnimationFrame(animatePulsate);
                    const scale = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
                    group.scale.set(scale, scale, scale);
                };
                animatePulsate();
            });
        };

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
                if (child instanceof THREE.Mesh && child.name === 'shadeelevator') {
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


    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />

            <div style={{ position: 'absolute', top: '50%', left: '10%', transform: 'translateY(-50%)' }}>
                <button onClick={handlePreviousCar}>←</button>
            </div>
            <div style={{ position: 'absolute', top: '50%', right: '10%', transform: 'translateY(-50%)' }}>
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
                }}
            >
                <h3>Cybertruck {currentCarIndex + 1}</h3>
                <button onClick={handleCarClick}>Customize</button>
            </div>

            {showMatcapMenu && (
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
                    <button onClick={() => setShowMatcapMenu(false)} style={{ marginTop: '10px' }}>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}
