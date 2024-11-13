'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function GaragePage() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const carGroupRef = useRef<THREE.Group>(new THREE.Group());
    const [currentCarIndex, setCurrentCarIndex] = useState(0);
    const [isOrbitEnabled, setIsOrbitEnabled] = useState(false);
    const [showMatcapMenu, setShowMatcapMenu] = useState(false);
    const [selectedPart, setSelectedPart] = useState<string | null>(null);

    const carModels = [
        { chassis: '/models/car/default/chassis.glb', wheels: '/models/car/default/wheels.glb', antena: '/models/car/default/antena.glb' },
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

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(5, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, -60, 50);

        const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        controlsRef.current = new OrbitControls(camera, renderer.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.05;
        controlsRef.current.enabled = isOrbitEnabled;

        let carGroup = new THREE.Group();
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
                        addCustomizationPoint(part, partName);
                    }

                    carGroupRef.current.add(part);
                });
            });

            scene.add(carGroupRef.current);
        };

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

        loadCar(currentCarIndex);

        const addCustomizationPoint = (part: THREE.Object3D, partName: string) => {
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 16, 16),
                new THREE.MeshBasicMaterial({ color: 0xff0000 })
            )
            sphere.position.set(0, 0, 1.5);
            sphere.name = `${partName}_customization`;

            const animatePulsate = () => {
                requestAnimationFrame(animatePulsate);
                sphere.scale.setScalar(Math.sin(Date.now() * 0.005) * 0.3 + 1);
            };
            animatePulsate();

            sphere.userData = { partName };
            part.add(sphere);
            customizationPoints.current.push(sphere);
        };

        const animate = () => {
            requestAnimationFrame(animate);
            controlsRef.current?.update();
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
                const partName = clickedPoint.userData.partName;
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
    
        console.log("Applying texture to part:", selectedPart); // Debug log
    
        // Traverse through carGroupRef to find and apply texture to `shadeelevator`
        carGroupRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                console.log("Checking child:", child.name); // Log each child name for clarity
    
                if (child.name === 'shadeelevator' && selectedPart === 'chassis') {
                    console.log(`Applying matcap texture to ${child.name}`); // Confirm specific part
    
                    child.material = new THREE.MeshMatcapMaterial({ matcap: texture });
                    child.material.needsUpdate = true; // Ensure the material is updated
                    console.log(`Updated ${child.name} with ${matcapName} matcap`); // Final confirmation
                }
            }
        });
    
        setShowMatcapMenu(false);
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
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
                <h3>Car {currentCarIndex + 1}</h3>
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
