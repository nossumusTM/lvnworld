import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene: THREE.Scene | null = null;

const worldSignals: Record<string, THREE.Mesh> = {}; // Store active signals by worldId

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
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Directional light
    directionalLight.position.set(10, 10, 10);

    if (scene) {
        scene.add(ambientLight);
        scene.add(directionalLight);
    }

    // Determine texture based on current time (AM or PM)
    const textureLoader = new THREE.TextureLoader();
    const currentTime = new Date();
    const hours = currentTime.getHours();

    const dayTextureUrl = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
    const nightTextureUrl = '//unpkg.com/three-globe/example/img/earth-night.jpg';
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
    });

    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeMesh.name = 'globeMesh'; // Add a name for easy access
    globeMesh.rotation.y = Math.PI; // Initial rotation
    if (scene) {
        scene.add(globeMesh);
    }

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; // Disable panning
    controls.enableZoom = false; // Disable zooming
    controls.enableDamping = true;
    controls.dampingFactor = 0.01;
    controls.minPolarAngle = Math.PI / 3; // Restrict upward rotation
    controls.maxPolarAngle = (2 * Math.PI) / 3; // Restrict downward rotation

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

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
        color: 0x18FF00, // Neon green color
        transparent: true,
        opacity: 1,
    });
    const frame = new THREE.LineSegments(frameGeometry, frameMaterial);

    // Position the frame at the correct coordinates
    frame.position.set(x, y, z);
    frame.lookAt(new THREE.Vector3(0, 0, 0)); // Align to face the globe's center

    // Attach the frame to the globeMesh so it rotates with the globe
    const globeMesh = scene.getObjectByName('globeMesh') as THREE.Mesh; // Find globeMesh
    if (globeMesh) {
        globeMesh.add(frame); // Attach the frame to the globe
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

// Helper function: Convert lat/lng to globe position
function convertLatLngToPosition(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180); // Convert latitude to phi
    const theta = (lng + 180) * (Math.PI / 180); // Convert longitude to theta

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
}