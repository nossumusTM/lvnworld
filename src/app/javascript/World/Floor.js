import * as THREE from 'three';
import FloorMaterial from '../Materials/Floor.js';  // Assuming you still use a custom material

export default class Floor {
    constructor(_options) {
        // Options
        this.debug = _options.debug;

        // Container
        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        // --- Skybox Setup ---
        // Use large dimensions to cover the entire scene and camera
        this.geometry = new THREE.BoxGeometry(1000, 1000, 1000); // Large skybox

        // Load skybox textures (using CubeTextureLoader)
        const skyboxImages = [
            '/images/skybox/Daylight-Box_Right.jpg', // Right (+X)
            '/images/skybox/Daylight-Box_Left.jpg',  // Left (-X)
            '/images/skybox/Daylight-Box_Top.jpg',   // Top (+Y)
            '/images/skybox/Daylight-Box_Bottom.jpg',// Bottom (-Y)
            '/images/skybox/Daylight-Box_Front.jpg', // Front (+Z)
            '/images/skybox/Daylight-Box_Back.jpg',  // Back (-Z)
        ];

        // Create skybox materials for each side of the cube
        const skyboxMaterials = [
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(skyboxImages[0]), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(skyboxImages[1]), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(skyboxImages[2]), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(skyboxImages[3]), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(skyboxImages[4]), side: THREE.BackSide }),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(skyboxImages[5]), side: THREE.BackSide }),
        ];

        // Create the skybox mesh (large cube)
        this.skyboxMesh = new THREE.Mesh(this.geometry, skyboxMaterials);
        this.skyboxMesh.frustumCulled = false; // Ensure it's always rendered
        this.skyboxMesh.matrixAutoUpdate = false;

        // Position the skybox to sit on the floor (Y = 0) by raising it half of its height
        this.skyboxMesh.position.set(0, -1, 0);  // Raise it half of the box height (since it's 1000 units tall)

        // Rotate the skybox if needed
        this.skyboxMesh.rotation.z = Math.PI; // Adjust rotation around Y-axis for correct orientation

        // Manually update the matrix to apply position and rotation changes
        this.skyboxMesh.updateMatrix();

        // Add the skybox to the container
        this.container.add(this.skyboxMesh);

        // Debug options (if needed)
        if (this.debug) {
            const folder = this.debug.addFolder('skybox');
            folder.add(this.skyboxMesh, 'visible').name('Show/Hide Skybox');
        }
    }
}
