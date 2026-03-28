import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene: THREE.Scene | null = null;

const worldSignals: Record<string, THREE.Mesh> = {}; // Store active signals by worldId
const worldPlayerCounts = new Map<string, number>(); // To track player counts per worldId
const activeSignals = new Map<string, THREE.Object3D>(); // Map to store active signals by worldId

export function initGlobe(containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found.`);
        return;
    }

    // Create Scene
    scene = new THREE.Scene();

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 8.4;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeSystem = new THREE.Group();
    if (scene) {
        scene.add(globeSystem);
    }

    const applyResponsiveScale = () => {
        const isMobileView = window.matchMedia('(max-width: 768px)').matches;
        globeSystem.scale.setScalar(isMobileView ? 0.5 : 1);
    };

    applyResponsiveScale();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x7b89a8, 0.56);
    const hemisphereLight = new THREE.HemisphereLight(0xa9d3ff, 0x05070d, 1.44);
    const sunLight = new THREE.DirectionalLight(0xffe1a8, 3.3);
    const moonLight = new THREE.DirectionalLight(0x8eb6ff, 0.84);
    const sunFillLight = new THREE.PointLight(0xffc66d, 2.2, 42, 2);
    const moonFillLight = new THREE.PointLight(0x6e92ff, 0.48, 28, 2);

    if (scene) {
        scene.add(ambientLight);
        scene.add(hemisphereLight);
        scene.add(sunLight);
        scene.add(moonLight);
        scene.add(sunFillLight);
        scene.add(moonFillLight);
    }

    // Determine texture based on current time (AM or PM)
    const textureLoader = new THREE.TextureLoader();
    const currentTime = new Date();
    const hours = currentTime.getHours();

    const dayTextureUrl = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
    // const dayTextureUrl = '//unpkg.com/three-globe/example/img/earth-night.png';
    const nightTextureUrl = '//unpkg.com/three-globe/example/img/earth-dark.jpg';
    const bumpTextureUrl = '//unpkg.com/three-globe/example/img/earth-topology.png';

    const isAM = hours < 12;
    const earthTexture = textureLoader.load(isAM ? dayTextureUrl : nightTextureUrl);
    console.log(`Loading ${isAM ? 'day' : 'night'} texture based on time: ${hours} hours`);

    const bumpTexture = textureLoader.load(bumpTextureUrl);

    // Create Globe
    const globeGeometry = new THREE.SphereGeometry(5, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
        map: earthTexture,
        bumpMap: bumpTexture,
        bumpScale: 0.5,
        emissive: new THREE.Color(0x060d1a),
        emissiveIntensity: 0.12,
        roughness: 0.92,
        metalness: 0.02,
    });

    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeMesh.name = 'globeMesh'; // Add a name for easy access
    globeMesh.rotation.y = Math.PI; // Initial rotation
    globeMesh.scale.setScalar(0);
    globeSystem.add(globeMesh);

    const updateCelestialLighting = (angle: number) => {
        const sunRadius = 14.5;
        const moonRadius = 12.5;
        const sunPosition = new THREE.Vector3(
            Math.cos(angle) * sunRadius,
            Math.sin(angle) * sunRadius * 0.72,
            Math.sin(angle * 0.45) * 3.4 + 1.4
        );
        const moonAngle = angle + Math.PI;
        const moonPosition = new THREE.Vector3(
            Math.cos(moonAngle) * moonRadius,
            Math.sin(moonAngle) * moonRadius * 0.8,
            Math.sin(moonAngle * 0.4) * 1.8 - 0.9
        );

        sunLight.position.copy(sunPosition);
        moonLight.position.copy(moonPosition);
        sunFillLight.position.copy(sunPosition);
        moonFillLight.position.copy(moonPosition);
        sunLight.target.position.set(0, 0, 0);
        moonLight.target.position.set(0, 0, 0);
    };

    if (scene) {
        scene.add(sunLight.target);
        scene.add(moonLight.target);
    }

    let globeOrbitAngle = Math.PI * 0.2;
    globeSystem.position.set(0, 0, 0);
    updateCelestialLighting(globeOrbitAngle);

    const globeScaleStart = performance.now();
    const globeScaleDuration = 2550;
    const animateGlobeScaleIn = () => {
        const elapsed = performance.now() - globeScaleStart;
        const progress = Math.min(elapsed / globeScaleDuration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        globeMesh.scale.setScalar(eased);

        if (progress < 1) {
            requestAnimationFrame(animateGlobeScaleIn);
        }
    };
    animateGlobeScaleIn();

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; // Disable panning
    controls.enableZoom = false; // Disable zooming
    controls.enableDamping = true;
    controls.dampingFactor = 0.01;
    controls.minPolarAngle = Math.PI / 3; // Restrict upward rotation
    controls.maxPolarAngle = (2 * Math.PI) / 3; // Restrict downward rotation
    controls.target.set(0, 0, 0);
    controls.update();

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        globeOrbitAngle += 0.0011;
        updateCelestialLighting(globeOrbitAngle);

        // Rotate the globe
        globeMesh.rotation.x += 0.001;
        globeMesh.rotation.y += 0.001;
        globeMesh.rotation.z += 0.001;
        controls.update(); // Apply damping (inertia) to controls

        renderer.render(scene!, camera);
    }
    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        applyResponsiveScale();
    });
}

// export function addSignalEffect(worldId: string, location: { lat: number; lng: number }) {
//     console.log(`addSignalEffect called for ${worldId}:`, location);

//     if (!scene) {
//         console.error('Scene is not initialized');
//         return;
//     }

//     // Convert latitude/longitude to globe (x, y, z) coordinates
//     const { x, y, z } = latLngToVector3(location.lat, location.lng, 5);

//     // Create a pulse signal
//     const signalGeometry = new THREE.RingGeometry(0.05, 0.1, 32); // Small circular signal
//     const signalMaterial = new THREE.MeshBasicMaterial({
//         color: 0xFF0000, // Neon green
//         transparent: true,
//         opacity: 1,
//         side: THREE.DoubleSide,
//     });
//     const signalMesh = new THREE.Mesh(signalGeometry, signalMaterial);

//     signalMesh.position.set(x, y, z);
//     signalMesh.lookAt(new THREE.Vector3(0, 0, 0)); // Align to face the globe's center

//     // Add the signal to the globe so it rotates with it
//     const globeMesh = scene.getObjectByName('globeMesh') as THREE.Mesh; // Ensure globeMesh has a name
//     if (globeMesh) {
//         globeMesh.add(signalMesh);
//     } else {
//         console.error('Globe mesh not found in the scene.');
//         return;
//     }

//     // Add scaling animation for the pulse effect
//     let scale = 1; // Initial scale
//     let scaleDirection = 1; // 1 for expanding, -1 for contracting

//     function animateSignal() {
//         scale += scaleDirection * 0.01; // Scale increment/decrement
//         if (scale >= 1.5) scaleDirection = -1; // Reverse at max scale
//         if (scale <= 1) scaleDirection = 1; // Reverse at min scale

//         signalMesh.scale.set(scale, scale, scale);
//         requestAnimationFrame(animateSignal); // Continue animation
//     }

//     animateSignal();
// }

export function addSignalEffect(worldId: string, location: { lat: number; lng: number }) {
    console.log(`addSignalEffect called for ${worldId}:`, location);

    if (!scene) {
        console.error('Scene is not initialized');
        return;
    }

    // If signal already exists for this worldId, remove it first
    if (activeSignals.has(worldId)) {
        const existingSignal = activeSignals.get(worldId);
        if (existingSignal) {
            scene.remove(existingSignal);
            activeSignals.delete(worldId);
        }
    }

    // Convert latitude/longitude to globe (x, y, z) coordinates
    const { x, y, z } = latLngToVector3(location.lat, location.lng, 5);

    // Define corner frame geometry (4 brackets: top-left, top-right, bottom-left, bottom-right)
    const size = 0.3; // Overall size of the corner brackets
    const offset = 0.15; // Distance of brackets inward

    const cornerFramePoints = [
        // Top-Left Bracket
        new THREE.Vector3(-size, size, 0), new THREE.Vector3(-offset, size, 0),
        new THREE.Vector3(-size, size, 0), new THREE.Vector3(-size, offset, 0),

        // Top-Right Bracket
        new THREE.Vector3(size, size, 0), new THREE.Vector3(offset, size, 0),
        new THREE.Vector3(size, size, 0), new THREE.Vector3(size, offset, 0),

        // Bottom-Left Bracket
        new THREE.Vector3(-size, -size, 0), new THREE.Vector3(-offset, -size, 0),
        new THREE.Vector3(-size, -size, 0), new THREE.Vector3(-size, -offset, 0),

        // Bottom-Right Bracket
        new THREE.Vector3(size, -size, 0), new THREE.Vector3(offset, -size, 0),
        new THREE.Vector3(size, -size, 0), new THREE.Vector3(size, -offset, 0),
    ];

    const frameGeometry = new THREE.BufferGeometry().setFromPoints(cornerFramePoints);
    const frameMaterial = new THREE.LineBasicMaterial({
        color: 0x0213f7,          // Neon green color
        transparent: false,
        opacity: 1,             // Control opacity for a soft glow effect
        fog: true,
    });
    const frame = new THREE.LineSegments(frameGeometry, frameMaterial);

    // Position the frame at the correct coordinates
    frame.position.set(x, y, z);
    frame.lookAt(new THREE.Vector3(0, 0, 0)); // Align to face the globe's center

    // Attach the frame to the globeMesh so it rotates with the globe
    const globeMesh = scene.getObjectByName('globeMesh') as THREE.Mesh; // Find globeMesh
    if (globeMesh) {
        globeMesh.add(frame); // Attach the frame to the globe
        activeSignals.set(worldId, frame); // Store the signal in the map
    } else {
        console.error('Globe mesh not found in the scene.');
        return;
    }

    // Pulsating Animation: Smooth scaling effect
    let scale = 0.5;
    let scaleDirection = 1;

    function animateSignal() {
        scale += scaleDirection * 0.01; // Scale increment/decrement
        if (scale >= 1.5) scaleDirection = -1; // Reverse at max scale
        if (scale <= 1) scaleDirection = 1; // Reverse at min scale

        frame.scale.set(scale, scale, scale); // Apply scaling
        requestAnimationFrame(animateSignal); // Continue animation
    }
    animateSignal();
}

// Utility Function: Convert Latitude/Longitude to 3D Coordinates
function latLngToVector3(lat: number, lng: number, radius: number): { x: number; y: number; z: number } {
    const phi = (90 - lat) * (Math.PI / 180); // Convert latitude to spherical coordinates
    const theta = (lng + 180) * (Math.PI / 180); // Convert longitude

    return {
        x: -radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta),
    };
}

export function removeSignalEffect(worldId: string) {
    if (activeSignals.has(worldId)) {
        const signal = activeSignals.get(worldId);
        if (signal) {
            const globeMesh = scene?.getObjectByName('globeMesh') as THREE.Mesh;
            if (globeMesh) {
                globeMesh.remove(signal); // Remove the signal
                activeSignals.delete(worldId); // Remove reference from map
                console.log(`Signal removed for ${worldId}`);
            }
        }
    }
}
