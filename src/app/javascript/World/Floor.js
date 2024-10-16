import * as THREE from 'three';
import FloorMaterial from '../Materials/Floor.js';  // Assuming you still use a custom material

export default class Floor {
    constructor(_options) {
        // Options
        this.debug = _options.debug;

        // Container
        this.container = new THREE.Object3D();
        this.container.matrixAutoUpdate = false;

        // Geometry
        this.geometry = new THREE.PlaneGeometry(2, 2, 10, 10); // Larger size for the floor

        // Load texture
        const floorTexture = new THREE.TextureLoader().load('/images/skybox/floor-texture1.jpg');
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(10, 10); // Repeat the texture over the plane

        // Material
        this.material = new FloorMaterial();
        this.material.uniforms.tBackground.value = floorTexture; // Use the loaded texture

        // Mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal (floor-like)
        this.mesh.position.y = 0; // Set the position of the floor

        this.mesh.frustumCulled = false;
        this.mesh.matrixAutoUpdate = false;
        this.mesh.updateMatrix();

        // Add the mesh to the container
        this.container.add(this.mesh);

        // Debug
        if (this.debug) {
            const folder = this.debug.addFolder('floor');
            folder.add(this.material, 'needsUpdate').name('Update Material');
        }
    }
}
