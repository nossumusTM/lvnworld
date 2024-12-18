import * as THREE from 'three'
import CANNON from 'cannon'

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

export default class Car
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.physics = _options.physics
        this.shadows = _options.shadows
        this.materials = _options.materials
        this.controls = _options.controls
        this.sounds = _options.sounds
        this.renderer = _options.renderer
        this.camera = _options.camera
        this.debug = _options.debug
        this.config = _options.config
        this.playerId = _options.playerId
        this.shooterId = _options.shooterId
        this.worldId = _options.worldId
        this.ws = _options.ws
        this.carName = _options.carName
        this.matcaps = _options.matcaps

        // Set up
        this.container = new THREE.Object3D()
        this.position = new THREE.Vector3()

        this.bullets = [];
        this.battery = 100;
        this.score = 0;
        this.lastHitBy = null;

        this.boostCooldown = false;
        this.boostDuration = 100;
        this.cooldownDuration = 1000;  // Cooldown time in milliseconds (4 seconds)
        this.nitroEffectCount = 0;     // Counter to track number of nitro effects triggered
        this.maxNitroExecutions = 1;   // Limit to how many times createNitroEffect can be executed in one boost

        this.sirenEffectCount = 0;       // Tracks the number of siren activations
        this.maxSirenExecutions = 5;     // Set max limit for siren activations
        this.sirenCooldown = false;      // Flag for cooldown state
        this.sirenCooldownDuration = 3000; // Cooldown duration in milliseconds

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('car')
            // this.debugFolder.open()
        }

        this.setModels(this.carName, this.matcaps)
        this.setMovement()
        this.setChassis()
        this.setAntena()
        this.setBackLights()
        this.setWheels()
        this.setTransformControls()
        this.setShootingBall()
        this.setShootingMechanism()

    }

    createSparkEffect() {
        const sparkTexture = '/images/texture/spark.png';
    
        const img = new Image();
        img.src = sparkTexture;

        img.crossOrigin = "anonymous"; // Handle CORS
    
        img.onload = () => {
            const texture = new THREE.Texture(img);
            texture.needsUpdate = true;
    
            const particleCount = 50;
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const colors = [];
            const sizes = [];
    
            for (let i = 0; i < particleCount; i++) {
                vertices.push(
                    (Math.random() - 0.5) * 2, // x
                    (Math.random() - 0.5) * 2, // y
                    (Math.random() - 0.5) * 2  // z
                );
    
                colors.push(
                    Math.random(), // Red
                    Math.random(), // Green
                    Math.random()  // Blue
                );
    
                sizes.push(Math.random() * 0.02 + 0.01); // Random size between 0.1 and 0.3
            }
    
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
            const material = new THREE.PointsMaterial({
                size: 1.5, // Base size
                map: texture, // Apply spark texture
                vertexColors: true,
                sizeAttenuation: true, // Size diminishes with distance
                opacity: 1,
                transparent: true,
                blending: THREE.AdditiveBlending, // Glowing effect for sparks
                depthWrite: false // Prevent depth issues
            });
    
            const particles = new THREE.Points(geometry, material);
            particles.position.copy(this.physics.car.chassis.body.position);
    
            // Add particles to the scene
            this.container.add(particles);
    
            // Animate particles
            const duration = 500; // Duration in milliseconds
            const startTime = performance.now();
    
            const animateParticles = () => {
                const elapsedTime = performance.now() - startTime;
                if (elapsedTime < duration) {
                    particles.rotation.y += 0.02; // Rotate particles for effect
                    particles.scale.set(1, 1, 1).multiplyScalar(1 - (elapsedTime / duration)); // Scale down over time
                    particles.material.opacity = 1 - (elapsedTime / duration); // Fade out over time
    
                    requestAnimationFrame(animateParticles);
                } else {
                    // Remove particles when animation ends
                    this.container.remove(particles);
                    particles.geometry.dispose();
                    particles.material.dispose();
                }
            };
    
            animateParticles();
        };
    
        // Handle texture loading errors
        img.onerror = (error) => {
            console.error('Failed to load base64 texture:', error);
        };
    }

    createSirenEffect() {
        const sirenTexture = '/images/texture/siren.png';
    
        const img = new Image();
        img.src = sirenTexture;
        img.crossOrigin = "anonymous";

        img.onload = () => {
            const texture = new THREE.Texture(img);
            texture.needsUpdate = true;

            const material = new THREE.PointsMaterial({
                size: 0.5,  // Smaller size for a more concentrated effect
                vertexColors: true,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.5,
                map: texture,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });

            const particleCount = 20; // Fewer particles for a focused effect
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const colors = [];

            // Alternating red and blue colors for the siren effect
            const sirenColors = [
                [1.0, 1.0, 1.0], // White
                [0.0, 1.0, 0.0], // Green
            ];

            // Initialize particles with positions relative to the antenna
            const initialOffset = new THREE.Vector3(0.5, 0.2, 0.5); // Offset from antenna position
            for (let i = 0; i < particleCount; i++) {
                vertices.push(initialOffset.x, initialOffset.y, initialOffset.z);
                const [r, g, b] = sirenColors[i % 2];
                colors.push(r, g, b);
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            const particles = new THREE.Points(geometry, material);
            this.antena.object.add(particles); // Attach to the antenna object

            const duration = 5000; // Effect duration
            const startTime = performance.now();

            const animateParticles = () => {
                const elapsedTime = performance.now() - startTime;

                if (elapsedTime < duration) {
                    const positions = geometry.attributes.position.array;

                    for (let i = 0; i < particleCount; i++) {
                        const radius = 0.05; // Smaller radius for a compact effect
                        const speed = 0.02;
                        const angle = elapsedTime * speed + i * (Math.PI / particleCount);

                        // Calculate new positions in a circular path around the antenna
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius; // Fixed height above the antenna
                        const z = 0; // Positioned at the same level as the antenna

                        const vector = new THREE.Vector3(x, y, z);
                        vector.applyQuaternion(this.antena.object.quaternion); // Apply antenna rotation

                        const antennaPosition = this.antena.object.position.clone(); // Clone to avoid mutating
                        positions[i * 3] = antennaPosition.x + initialOffset.x + vector.x;
                        positions[i * 3 + 1] = antennaPosition.y + initialOffset.y + vector.y;
                        positions[i * 3 + 2] = antennaPosition.z + initialOffset.z + vector.z; // Update with antenna position
                    }

                    geometry.attributes.position.needsUpdate = true;

                    // Alternate colors over time to simulate flashing red and blue lights
                    const colorArray = geometry.attributes.color.array;
                    const isRed = Math.floor(elapsedTime / 500) % 2 === 0;
                    for (let i = 0; i < particleCount; i++) {
                        const [r, g, b] = isRed ? sirenColors[0] : sirenColors[1];
                        colorArray[i * 3] = r;
                        colorArray[i * 3 + 1] = g;
                        colorArray[i * 3 + 2] = b;
                    }

                    geometry.attributes.color.needsUpdate = true;

                    requestAnimationFrame(animateParticles);
                } else {
                    // Cleanup after the effect completes
                    this.antena.object.remove(particles); // Remove from antenna object
                    particles.geometry.dispose();
                    particles.material.dispose();
                }
            };

            animateParticles(); // Start the animation
        };

        img.onerror = (error) => {
            console.error('Failed to load base64 image:', error);
        };
    }
    
    createCrashEffect(position, quaternion, chassis) {
        const crashTexture = '/images/texture/crash.png';
    
        const img = new Image();
        img.src = crashTexture;
        img.crossOrigin = "anonymous"; // Handle CORS

        img.onload = () => {
            const texture = new THREE.Texture(img);
            texture.needsUpdate = true;

            const material = new THREE.PointsMaterial({
                size: 15.0, // Adjust size for visibility
                vertexColors: true,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.9,
                map: texture,
                blending: THREE.AdditiveBlending, // Glowing effect
                depthWrite: false, // Prevent depth issues
            });

            const particleCount = 3; // 3 particles for a boiling effect
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const colors = [];

            // Initialize particles (close together)
            for (let i = 0; i < particleCount; i++) {
                vertices.push(0, 0, 0); // Start from the same position
                colors.push(1.0, 1.0, 1.0); // Yellow color for the particles
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            const particles = new THREE.Points(geometry, material);
            chassis.add(particles); // Add particles to the chassis

            const duration = 5000; // Effect duration (in milliseconds)
            const startTime = performance.now();

            const animateParticles = () => {
                const elapsedTime = performance.now() - startTime;
                const positions = geometry.attributes.position.array;

                // Boiling effect: particles will move up and down chaotically
                for (let i = 0; i < particleCount; i++) {
                    const progress = elapsedTime / duration;

                    // Smaller chaotic movement for particles (movement relative to chassis)
                    const xOffset = Math.sin(elapsedTime * 0.1 + i) * 0.5; // Horizontal random movement
                    const yOffset = Math.sin(elapsedTime * 0.2 + i) * 1.0; // Vertical oscillation
                    const zOffset = Math.cos(elapsedTime * 0.1 + i) * 0.5; // Depth movement

                    // Apply chaotic movement to positions (relative to chassis)
                    positions[i * 3] = xOffset;
                    positions[i * 3 + 1] = yOffset;
                    positions[i * 3 + 2] = zOffset;
                }

                geometry.attributes.position.needsUpdate = true; // Reflect position updates

                if (elapsedTime < duration) {
                    requestAnimationFrame(animateParticles); // Continue animation
                } else {
                    // Cleanup after the effect completes
                    chassis.remove(particles);
                    particles.geometry.dispose();
                    particles.material.dispose();
                }
            };

            // Attach particles to the chassis using its position and quaternion
            particles.position.set(0, 0, 0.5); // Set the particles to chassis's position
            particles.quaternion.copy(chassis.quaternion); // Attach to chassis rotation
            particles.rotation.setFromQuaternion(chassis.quaternion); // Apply chassis quaternion for rotation

            animateParticles(); // Start the animation
        };

        img.onerror = (error) => {
            console.error('Failed to load base64 image:', error);
        };
    }

    createFireEffect(position, quaternion) {
        const fireTexture = '/images/texture/fire.png';
    
        const img = new Image();
        img.src = fireTexture;
        img.crossOrigin = "anonymous"; // Handle CORS

        img.onload = () => {
            const texture = new THREE.Texture(img);
            texture.needsUpdate = true;

            const material = new THREE.PointsMaterial({
                size: 1.5, // Adjust size for visibility
                map: texture,
                vertexColors: true,
                sizeAttenuation: true, // Size decreases with distance
                transparent: true,
                opacity: 1,
                blending: THREE.AdditiveBlending, // Glowing effect
                depthWrite: false, // Prevent depth issues
            });

            const particleCount = 150;
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const colors = [];
            const sizes = [];

            // Initialize particle vertices, colors, and sizes
            for (let i = 0; i < particleCount; i++) {
                vertices.push(0, 0, 0); // Start particles at origin

                // Randomly pick brighter hues to simulate real fire exhaust
                const randomColor = Math.random();
                if (randomColor < 0.2) {
                    colors.push(1, 0.2 + Math.random() * 0.3, 0); // Bright red
                } else if (randomColor < 0.4) {
                    colors.push(1, 0.5 + Math.random() * 0.5, 0); // Orange
                } else if (randomColor < 0.6) {
                    colors.push(1, 1, 0.2 + Math.random() * 0.3); // Yellowish hues
                } else if (randomColor < 0.8) {
                    const grayShade = 0.6 + Math.random() * 0.4;
                    colors.push(grayShade, grayShade, grayShade); // Gray smoke
                } else {
                    colors.push(0.2, 0.5 + Math.random() * 0.5, 1); // Bluish hues
                }

                sizes.push(Math.random() * 0.1 + 0.05); // Size between 0.05 and 0.15
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

            const particles = new THREE.Points(geometry, material);

            // Rotate the particle system to align with rocket exhaust direction
            particles.rotation.x = Math.PI / 2; // Rotate around X-axis for correct alignment

            this.container.add(particles); // Add particles to the scene

            // Calculate the exhaust offset
            const exhaustOffset = new THREE.Vector3(-1.6, 0, 0);
            exhaustOffset.applyQuaternion(quaternion);

            // Set the initial position of the particles
            particles.position.copy(position).add(exhaustOffset);
            particles.quaternion.copy(quaternion); // Align with bullet’s orientation

            let isBulletActive = true; // Track if bullet is active

            const animateParticles = () => {
                if (!isBulletActive) return; // Stop animation if bullet is removed

                const positions = geometry.attributes.position.array;

                // Update particle positions to move toward their initial position
                for (let i = 0; i < particleCount; i++) {
                    // Calculate the movement vector in local space
                    const localMovement = new THREE.Vector3(
                        -1 * (Math.random() - 0.5) * 0.1, // X-axis jitter
                        -1 * (Math.random() - 0.5) * 0.1, // Y-axis jitter
                        0 // Z-axis forward movement (toward initial position)
                    );

                    // Rotate the movement 90 degrees along the Y-axis
                    const yRotation = new THREE.Quaternion();
                    yRotation.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2); // 90 degrees along Y-axis

                    localMovement.applyQuaternion(yRotation); // Apply the Y-axis rotation
                    localMovement.applyQuaternion(quaternion); // Align with rocket’s orientation

                    // Update the particle positions
                    positions[i * 3 + 0] += localMovement.x * -2;
                    positions[i * 3 + 1] += localMovement.y;
                    positions[i * 3 + 2] += localMovement.z;
                }

                geometry.attributes.position.needsUpdate = true;

                // Keep particles aligned with the bullet’s position and orientation
                particles.position.copy(position).add(exhaustOffset);
                particles.quaternion.copy(quaternion);

                requestAnimationFrame(animateParticles); // Continue animation
            };

            animateParticles(); // Start animation

            // Cleanup function to remove the fire effect when the bullet disappears
            const cleanupFireEffect = () => {
                isBulletActive = false; // Stop animation
                this.container.remove(particles);
                geometry.dispose();
                material.dispose();
            };

            // Listen for bullet removal and trigger cleanup
            const bulletCheckInterval = setInterval(() => {
                const bulletExists = this.physics.bullets.some(
                    (bullet) =>
                        Math.abs(bullet.body.position.x - position.x) < 0.01 &&
                        Math.abs(bullet.body.position.y - position.y) < 0.01 &&
                        Math.abs(bullet.body.position.z - position.z) < 0.01
                );

                if (!bulletExists) {
                    clearInterval(bulletCheckInterval); // Stop checking
                    cleanupFireEffect(); // Cleanup fire effect
                }
            }, 1000); // Check every 100ms
        };

        // Handle texture loading errors
        img.onerror = (error) => {
            console.error('Failed to load base64 texture:', error);
        };
    }

    createNitroEffect(position, quaternion, carChassis) {

        const nitroTexture = '/images/texture/nitro.png';
    
        const img = new Image();
        img.src = nitroTexture;
        img.crossOrigin = "anonymous"; // Handle CORS

        img.onload = () => {
            const texture = new THREE.Texture(img);
            texture.needsUpdate = true;

            const material = new THREE.PointsMaterial({
                size: 1, // Adjust size for visibility
                map: texture,
                vertexColors: true,
                sizeAttenuation: true, // Size decreases with distance
                transparent: true,
                opacity: 1,
                blending: THREE.AdditiveBlending, // Glowing effect
                depthWrite: false, // Prevent depth issues
            });

            const particleCount = 100;
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const colors = [];
            const sizes = [];

            // Initialize particle vertices, colors, and sizes
            for (let i = 0; i < particleCount; i++) {
                vertices.push(0, 0, 0); // Start particles at origin

                // Randomly pick brighter hues to simulate real fire exhaust
                const randomColor = Math.random();
                if (randomColor < 0.33) {
                    colors.push(0.0, 0.5 + Math.random() * 0.5, 1.0);  // Blue hues
                } else if (randomColor < 0.66) {
                    colors.push(1.0, 1.0 + Math.random() * 0.5, 0.0);  // Orange hues
                } else {
                    colors.push(0.0, 1.0, 0.5 + Math.random() * 0.5);  // Green hues
                }

                sizes.push(Math.random() * 0.1 + 0.05); // Size between 0.05 and 0.15
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

            const particles = new THREE.Points(geometry, material);

            // Attach particles to the car's chassis object
            carChassis.add(particles);

            this.container.add(particles);

            // Rotate the particle system to align with rocket exhaust direction
            particles.rotation.x = Math.PI / 2; // Rotate around X-axis for correct alignment

            this.container.add(particles); // Add particles to the scene

            // Calculate the exhaust offset
            const exhaustOffset = new THREE.Vector3(-0.95, 0, 0.6);
            exhaustOffset.applyQuaternion(quaternion);

            // Set the initial position of the particles
            particles.position.copy(position).add(exhaustOffset);
            particles.quaternion.copy(quaternion); // Align with bullet’s orientation

            let isBoostActive = true; // Track if bullet is active

            const animateParticles = () => {
                if (!isBoostActive) return; // Stop animation if bullet is removed

                const positions = geometry.attributes.position.array;

                // Update particle positions to move toward their initial position
                for (let i = 0; i < particleCount; i++) {
                    // Calculate the movement vector in local space
                    const localMovement = new THREE.Vector3(
                        1 * (Math.random() - 0.5) * 0.1, // X-axis jitter
                        -1 * (Math.random() - 0.5) * 0.1, // Y-axis jitter
                        -1 * (Math.random() * 0.05) // Z-axis forward movement (toward initial position)
                    );

                    // Rotate the movement 90 degrees along the Y-axis
                    const yRotation = new THREE.Quaternion();
                    yRotation.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2); // 90 degrees along Y-axis

                    localMovement.applyQuaternion(yRotation); // Apply the Y-axis rotation
                    localMovement.applyQuaternion(quaternion); // Align with rocket’s orientation

                    // Update the particle positions
                    positions[i * 3 + 0] += localMovement.x  * 3;
                    positions[i * 3 + 1] += localMovement.y;
                    positions[i * 3 + 2] += localMovement.z;
                }

                geometry.attributes.position.needsUpdate = true;

                // Keep particles aligned with the bullet’s position and orientation
                particles.position.copy(carChassis.position).add(exhaustOffset);
                particles.quaternion.copy(quaternion);

                requestAnimationFrame(animateParticles); // Continue animation
            };

            animateParticles(); // Start animation

            // Cleanup function to remove the fire effect when the bullet disappears
            const cleanupNitroEffect  = () => {
                isBoostActive = false; // Stop animation
                this.container.remove(particles);
                carChassis.remove(particles); // Remove particles from chassis
                geometry.dispose();
                material.dispose();
            };

            // Automatically clean up particles after the specified boost duration (Rocket League style burst)
            setTimeout(() => {
                cleanupNitroEffect();
            }, 200); // Lasts for 200 milliseconds (adjust as needed)
            };

        // Handle texture loading errors
        img.onerror = (error) => {
            console.error('Failed to load base64 texture:', error);
        };
    }

    setShootingMechanism() {
        if (typeof window !== 'undefined') {
    
            // Keyboard event listener for 'q' and 'Q'
            window.addEventListener('keydown', (event) => {
                // Check for both lowercase 'q' and uppercase 'Q'
                if ((event.key === 'q' || event.key === 'Q') && this.canShoot) {
                    event.preventDefault(); // Prevent default actions if needed
    
                    this.createAndShootBullet({ shooterId: this.playerId }); // Trigger bullet creation
                    this.updateBatteryStatus(); // Update battery status in HTML
                    this.updateBatteryPosition(); // Update battery vector position
    
                    this.canShoot = false; // Disable shooting temporarily
                    setTimeout(() => {
                        this.canShoot = true; // Re-enable shooting after 500ms
                    }, 500); // Delay in milliseconds
                }
            });
    
            // Mouse event listener for button '1' (middle mouse button)
            window.addEventListener('mousedown', (event) => {
                // Check if the middle mouse button (button 1) is pressed
                if (event.button === 1 && this.canShoot) {
                    event.preventDefault(); // Prevent default actions
    
                    this.createAndShootBullet({ shooterId: this.playerId }); // Trigger bullet creation
                    this.updateBatteryStatus(); // Update battery status in HTML
                    this.updateBatteryPosition(); // Update battery vector position
    
                    this.canShoot = false; // Disable shooting temporarily
                    setTimeout(() => {
                        this.canShoot = true; // Re-enable shooting after 500ms
                    }, 500); // Delay in milliseconds
                }
            });
        }
    
        // Initialize shooting flag
        this.canShoot = true;
    }    

    createAndShootBullet({ shooterId, bulletData = null }) {
        const bulletBall = this.resources.items.rocketBase.scene.clone();
    
        // Set color to white
        bulletBall.traverse((child) => {
            if (child.isMesh) {
                child.material = this.materials.shades.items.blueGlass;
            }
        });

        // Ensure shooterId is set
        if (!shooterId && bulletData) {
            shooterId = bulletData.shooterId;
        }
        if (!shooterId) {
            shooterId = this.playerId;  // Default to the current player if not provided
        }
    
        let bulletPosition, bulletQuaternion, bulletVelocity;
    
        if (bulletData) {
            if (bulletData.position) {
                bulletPosition = new THREE.Vector3(bulletData.position.x, bulletData.position.y, bulletData.position.z);
            } else {
                console.error('Bullet position data is incomplete:', bulletData);
                return;
            }
            bulletQuaternion = new THREE.Quaternion(
                bulletData.rotation?.x || 0,
                bulletData.rotation?.y || 0,
                bulletData.rotation?.z || 0,
                bulletData.rotation?.w || 0
            );
            bulletVelocity = new CANNON.Vec3(
                bulletData.velocity?.x || 0,
                bulletData.velocity?.y || 0,
                bulletData.velocity?.z || 0
            );
            shooterId = bulletData.shooterId;
        } else {
            const frontOffset = new THREE.Vector3(0.7, 0, 0);
            frontOffset.applyQuaternion(this.physics.car.chassis.body.quaternion);
            frontOffset.multiplyScalar(2);
            bulletPosition = new THREE.Vector3().addVectors(this.physics.car.chassis.body.position, frontOffset);
            bulletQuaternion = this.physics.car.chassis.body.quaternion.clone();
    
            const baseVelocity = new THREE.Vector3(180, 0, 0);
            bulletVelocity = baseVelocity.applyQuaternion(bulletQuaternion);
        }
    
        bulletBall.position.copy(bulletPosition);
        bulletBall.quaternion.copy(bulletQuaternion);
        this.container.add(bulletBall);
    
        const bulletBody = new CANNON.Body({
            mass: 40,
            shape: new CANNON.Sphere(0.5)
        });
    
        bulletBody.position.set(bulletPosition.x, bulletPosition.y, bulletPosition.z);
        bulletBody.quaternion.copy(bulletQuaternion);
        bulletBody.velocity.set(bulletVelocity.x, bulletVelocity.y, bulletVelocity.z);
        bulletBody.shooterId = shooterId;
        
        this.physics.world.addBody(bulletBody);
        const bullet = { mesh: bulletBall, body: bulletBody };
        this.physics.bullets.push(bullet);
    
        bulletBody.addEventListener('collide', (event) => {
            const index = this.physics.bullets.findIndex(b => b.body === bulletBody);
            this.physics.handleBulletCollision(bullet, index);
        });

        this.createFireEffect(bulletBall.position, bulletQuaternion);
    
        // Send bullet data to the server via WebSocket
        const bulletDataToSend = {
            type: 'bulletFired',
            shooterId: this.playerId,
            position: {
                x: bulletPosition.x,
                y: bulletPosition.y,
                z: bulletPosition.z
            },
            rotation: {
                x: bulletQuaternion.x,
                y: bulletQuaternion.y,
                z: bulletQuaternion.z,
                w: bulletQuaternion.w
            },
            velocity: {
                x: bulletVelocity.x,
                y: bulletVelocity.y,
                z: bulletVelocity.z
            }
        };

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(bulletDataToSend));

        } else {
            console.error('WebSocket is not open, unable to send bullet data');
        }
    }    

    // removeBullet(bullet, index) {
    //     if (bullet.mesh && bullet.mesh.parent) {
    //         bullet.mesh.parent.remove(bullet.mesh);
    //     }
    //     if (this.physics.world.bodies.includes(bullet.body)) {
    //         this.physics.world.removeBody(bullet.body);
    //     }
    //     if (bullet.ref) {
    //         remove(bullet.ref).catch((error) => {
    //             console.error('Error removing bullet from Firebase:', error);
    //         });
    //     }
    //     this.physics.bullets.splice(index, 1);
    // }

    updateBatteryStatus(battery) {
        const batteryStatusElement = document.getElementById('battery-status');
        if (batteryStatusElement) {
            const batteryPercentageElement = document.getElementById('battery-percentage');
            const batteryBar = batteryStatusElement.querySelector('.battery-bar');
            if (batteryBar) {
                // Set the width of the battery bar based on the battery percentage
                batteryBar.style.width = `${battery}%`;
                batteryPercentageElement.textContent = `${battery}%`;
            }
        }
    }

    // Update the battery position
    updateBatteryPosition() {
        if (this.batteryVector && this.backLightsBattery.object) {
            this.batteryVector.copy(this.backLightsBattery.object.position);
        }
    }

    setModels(carName, matcaps)
    {
        this.models = {}

        // {
        //     this.models.chassis = this.resources.items.carDefaultChassis
        //     this.models.antena = this.resources.items.carDefaultAntena
        //     this.models.backLightsBrake = this.resources.items.carDefaultBackLightsBrake
        //     this.models.backLightsReverse = this.resources.items.carDefaultBackLightsReverse
        //     this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery
        //     this.models.wheel = this.resources.items.carDefaultWheel
        // }

        switch (carName) {
            case 'Charger Power Bank':
                this.models.chassis = this.resources.items.chargerDefaultChassis;
                    
                // Ensure the chassis model is defined and log its children
                if (this.models.chassis && this.models.chassis.scene) {
                    console.log(`Chassis model children for ${carName}:`);
                    this.models.chassis.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            if (matcaps.chassis) {
                                const matcapName = matcaps.chassis;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Chassis model is not defined or missing scene');
                }

                this.models.bottom = this.resources.items.chargerDefaultChassisBottom; // Bottom part

                if (this.models.bottom && this.models.bottom.scene) {
                    console.log(`Bottom model children for ${carName}:`);
                    this.models.bottom.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            if (matcaps.chassisbottom) {
                                const matcapName = matcaps.chassisbottom;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Bottom model is not defined or missing scene');
                }

                this.models.window = this.resources.items.chargerDefaultWindow; // Window
                    if (this.models.window && this.models.window.scene) {
                        console.log(`Window model children for ${carName}:`);
                        this.models.window.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                if (matcaps.window) {
                                    const matcapName = matcaps.window;
                                    const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                    child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                    console.log(`Updated Child Name: ${child.name}`);
                                }
                            }
                        });
                    } else {
                        console.warn('Window model is not defined or missing scene');
                    }

                this.models.antena = this.resources.items.chargerDefaultAntena;
                this.models.headLights = this.resources.items.chargerDefaultHeadlights;
                this.models.backLightsBrake = this.resources.items.chargerDefaultBacklights;
                this.models.backLightsReverse = this.resources.items.chargerDefaultBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;

                this.models.wheel = this.resources.items.chargerWheels;
                        if (this.models.wheel && this.models.wheel.scene) {
                            console.log(`Wheel model children for ${carName}:`);
                            this.models.wheel.scene.traverse((child) => {
                                if (child instanceof THREE.Mesh) {
                                    console.log(`Original Child Name: ${child.name}`);
                                    
                                    // Check if the child name matches 'wheels' and matcaps.wheels is available
                                    if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                        const matcapName = matcaps.wheels;
                                        const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                        child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                        console.log(`Updated Child Name: ${child.name}`);
                                    }
                                }
                            });
                        } else {
                            console.warn('Wheel model is not defined or missing scene');
                        }

                console.log("Setting Charger Power Bank")
                break;

            case 'Wreckslinger':
                this.models.chassis = this.resources.items.wreckslingerChassis;
                this.models.wheel = this.resources.items.wreckslingerWheels;
                this.models.antena = this.resources.items.wreckslingerAntena;
                this.models.headLights = this.resources.items.wreckslingerHeadlights;
                this.models.backLightsBrake = this.resources.items.wreckslingerBacklights;
                this.models.backLightsReverse = this.resources.items.wreckslingerBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;
    
                console.log("Setting Wreckslinger")
                break;

            case 'Gangover':
                this.models.chassis = this.resources.items.gangoverChassis;
                this.models.wheel = this.resources.items.gangoverWheels;
                this.models.antena = this.resources.items.gangoverAntena;
                this.models.headLights = this.resources.items.gangoverHeadlights;
                this.models.backLightsBrake = this.resources.items.gangoverBacklights;
                this.models.backLightsReverse = this.resources.items.gangoverBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;
    
                console.log("Setting Wreckslinger")
                break;

            case 'McLaren':
                this.models.chassis = this.resources.items.mclarenChassis;
                this.models.wheel = this.resources.items.mclarenWheels;
                this.models.antena = this.resources.items.mclarenAntena;
                this.models.headLights = this.resources.items.mclarenHeadlights;
                this.models.backLightsBrake = this.resources.items.mclarenBacklights;
                this.models.backLightsReverse = this.resources.items.mclarenBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;
    
                console.log("Setting McLaren")
                break;

            case '240 GTI':
                this.models.chassis = this.resources.items.gtiChassis;
                this.models.wheel = this.resources.items.gtiWheels;
                this.models.antena = this.resources.items.gtiAntena;
                this.models.headLights = this.resources.items.gtiHeadlights;
                this.models.backLightsBrake = this.resources.items.gtiBacklights;
                this.models.backLightsReverse = this.resources.items.gtiBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;
    
                console.log("Setting McLaren")
                break;

            case 'Howler Packard':
                this.models.chassis = this.resources.items.howlerChassis;
                this.models.wheel = this.resources.items.howlerWheels;
                this.models.antena = this.resources.items.howlerAntena;
                this.models.headLights = this.resources.items.howlerHeadlights;
                this.models.backLightsBrake = this.resources.items.howlerBacklights;
                this.models.backLightsReverse = this.resources.items.howlerBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;
        
                console.log("Howler Packard")
                break;

            case 'RC TraxShark':
                this.models.chassis = this.resources.items.rcTruckChassis;
                this.models.wheel = this.resources.items.rcTruckWheels;
                this.models.antena = this.resources.items.rcTruckAntena;
                this.models.headLights = this.resources.items.rcTruckHeadlights;
                this.models.backLightsBrake = this.resources.items.rcTruckBacklights;
                this.models.backLightsReverse = this.resources.items.rcTruckBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;
            
                console.log("RC TraxShark")
                break;

            case 'Pusher Crowd':
                this.models.chassis = this.resources.items.pusherCrowdChassis;
                this.models.wheel = this.resources.items.pusherCrowdWheels;
                this.models.antena = this.resources.items.pusherCrowdAntena;
                this.models.headLights = this.resources.items.pusherCrowdHeadlights;
                this.models.backLightsBrake = this.resources.items.pusherCrowdBacklights;
                this.models.backLightsReverse = this.resources.items.pusherCrowdBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;
                
                console.log("Pusher Crowd")
                break;

            case 'Impactus':
                this.models.chassis = this.resources.items.impactusChassis;
                this.models.wheel = this.resources.items.impactusWheels;
                this.models.antena = this.resources.items.impactusAntena;
                this.models.headLights = this.resources.items.impactusHeadlights;
                this.models.backLightsBrake = this.resources.items.impactusBacklights;
                this.models.backLightsReverse = this.resources.items.impactusBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;
                    
                console.log("Impactus")
                break;

            case 'Crushinator':
                this.models.chassis = this.resources.items.zimbowChassis;
                this.models.wheel = this.resources.items.zimbowWheels;
                this.models.antena = this.resources.items.zimbowAntena;
                this.models.headLights = this.resources.items.zimbowHeadlights;
                this.models.backLightsBrake = this.resources.items.zimbowBacklights;
                this.models.backLightsReverse = this.resources.items.zimbowBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;
                        
                console.log("Impactus")
                break;

            case 'Goodwing':
                this.models.chassis = this.resources.items.goodwingChassis;
                this.models.wheel = this.resources.items.goodwingWheels;
                this.models.antena = this.resources.items.goodwingAntena;
                this.models.headLights = this.resources.items.goodwingHeadlights;
                this.models.backLightsBrake = this.resources.items.goodwingBacklights;
                this.models.backLightsReverse = this.resources.items.goodwingBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;
                            
                console.log("Goodwing")
                break;
    
                default:
                    if (!this.models.chassis) {
                        // Fallback to default car models if carName doesn't match
                        this.models.chassis = this.resources.items.carDefaultChassis; // Main chassis
                    
                        // Ensure the chassis model is defined and log its children
                        if (this.models.chassis && this.models.chassis.scene) {
                            console.log(`Chassis model children for ${carName}:`);
                            this.models.chassis.scene.traverse((child) => {
                                if (child instanceof THREE.Mesh) {
                                    console.log(`Original Child Name: ${child.name}`);
                    
                                    // Rename child.name to match the retrieved matcap key
                                    if (matcaps.chassis) {
                                        const matcapName = matcaps.chassis;
                                        const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                        child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                        console.log(`Updated Child Name: ${child.name}`);
                                    }
                                }
                            });
                        } else {
                            console.warn('Chassis model is not defined or missing scene');
                        }
                    }
                
                    this.models.bottom = this.resources.items.carDefaultChassisBottom; // Bottom part
                    if (this.models.bottom && this.models.bottom.scene) {
                        console.log(`Bottom model children for ${carName}:`);
                        this.models.bottom.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                if (matcaps.chassisbottom) {
                                    const matcapName = matcaps.chassisbottom;
                                    const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                    child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                    console.log(`Updated Child Name: ${child.name}`);
                                }
                            }
                        });
                    } else {
                        console.warn('Bottom model is not defined or missing scene');
                    }
                
                    this.models.window = this.resources.items.carDefaultWindow; // Window
                    if (this.models.window && this.models.window.scene) {
                        console.log(`Window model children for ${carName}:`);
                        this.models.window.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                if (matcaps.window) {
                                    const matcapName = matcaps.window;
                                    const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                    child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                    console.log(`Updated Child Name: ${child.name}`);
                                }
                            }
                        });
                    } else {
                        console.warn('Window model is not defined or missing scene');
                    }
                
                    this.models.spoiler = this.resources.items.carDefaultSpoiler; // Spoiler
                    if (this.models.spoiler && this.models.spoiler.scene) {
                        console.log(`Spoiler model children for ${carName}:`);
                        this.models.spoiler.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                if (matcaps.spoiler) {
                                    const matcapName = matcaps.spoiler;
                                    const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                    child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                    console.log(`Updated Child Name: ${child.name}`);
                                }
                            }
                        });
                    } else {
                        console.warn('Spoiler model is not defined or missing scene');
                    }
                
                    // Additional parts
                    this.models.antena = this.resources.items.carDefaultAntena;
                    this.models.headLights = this.resources.items.carDefaultHeadlights;
                    this.models.backLightsBrake = this.resources.items.carDefaultBackLightsBrake;
                    this.models.backLightsReverse = this.resources.items.carDefaultBackLightsReverse;
                    this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;

                    this.models.wheel = this.resources.items.carDefaultWheel;
                        if (this.models.wheel && this.models.wheel.scene) {
                            console.log(`Wheel model children for ${carName}:`);
                            this.models.wheel.scene.traverse((child) => {
                                if (child instanceof THREE.Mesh) {
                                    console.log(`Original Child Name: ${child.name}`);
                                    
                                    // Check if the child name matches 'wheels' and matcaps.wheels is available
                                    if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                        const matcapName = matcaps.wheels;
                                        const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                        child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                        console.log(`Updated Child Name: ${child.name}`);
                                    }
                                }
                            });
                        } else {
                            console.warn('Wheel model is not defined or missing scene');
                        }
                    break;                
        }
    }
    
    // setMovement()
    // {
    //     this.movement = {}
    //     this.movement.speed = new THREE.Vector3()
    //     this.movement.localSpeed = new THREE.Vector3()
    //     this.movement.acceleration = new THREE.Vector3()
    //     this.movement.localAcceleration = new THREE.Vector3()
    //     this.movement.lastScreech = 0

    //     // Time tick
    //     this.time.on('tick', () =>
    //     {
    //         // Movement
    //         const movementSpeed = new THREE.Vector3()
    //         movementSpeed.copy(this.chassis.object.position).sub(this.chassis.oldPosition)
    //         // movementSpeed.multiplyScalar(1 / this.time.delta * 17)
    //         const deltaScale = this.time.delta > 0 ? this.time.delta : 16.67; // Fallback to a default value if delta is zero
    //         movementSpeed.multiplyScalar(1 / deltaScale * 17);
    //         this.movement.acceleration = movementSpeed.clone().sub(this.movement.speed)
    //         this.movement.speed.copy(movementSpeed)

    //         this.movement.localSpeed = this.movement.speed.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), - this.chassis.object.rotation.z)
    //         this.movement.localAcceleration = this.movement.acceleration.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), - this.chassis.object.rotation.z)

    //         // Calculate speed
    //         const speed = this.movement.speed.length() * 300; // Actual speed of the car
    //         const maxSpeed = 200; // Maximum speed (adjust based on your game)
    //         const speedPercentage = Math.min(speed / maxSpeed, 1); // Normalize speed to range [0, 1]

    //         // Update speedometer needle
    //         const needle = document.getElementById('needle');
    //         const speedValue = document.getElementById('speed-value');
    //         if (needle && speedValue) {
    //             const rotation = speedPercentage * 180 - 100; // Convert speed to needle rotation (0 to 180 degrees)
    //             needle.style.transform = `rotate(${rotation}deg)`;
    //             speedValue.textContent = Math.round(speed); // Display actual speed value
    //         }
            
    //         // Sound
    //         this.sounds.engine.speed = this.movement.localSpeed.x
    //         this.sounds.engine.acceleration = this.controls.actions.up ? (this.controls.actions.boost ? 1 : 0.5) : 0

    //         // if (this.controls.actions.boost) {
    //         //     // Trigger the nitro effect when accelerating
    //         //     this.createNitroEffect(this.chassis.object.position, this.chassis.object.quaternion);
    //         // }

    //         // Check if siren is active and not on cooldown, and within max execution limit
    //         if (this.controls.actions.siren && !this.sirenCooldown && this.sirenEffectCount < this.maxSirenExecutions) {
    //             // Trigger the siren effect
    //             this.createSirenEffect();
                
    //             // Increment siren effect count
    //             this.sirenEffectCount += 1;
                
    //             // Set siren on cooldown to prevent immediate re-triggering
    //             this.sirenCooldown = true;

    //             // Set a timeout to reset the siren count and cooldown after the duration
    //             setTimeout(() => {
    //                 this.sirenEffectCount = 0;  // Reset siren effect count after cooldown
    //                 this.sirenCooldown = false; // Cooldown ends after the specified duration
    //             }, this.sirenCooldownDuration);
    //         }

    //         // Check if boost is active and not on cooldown
    //         if (this.controls.actions.boost && !this.boostCooldown && this.nitroEffectCount < this.maxNitroExecutions) {
    //             // Trigger the nitro effect when accelerating
    //             this.createNitroEffect(this.chassis.object.position, this.chassis.object.quaternion, this.chassis.object);
    //             // this.createCrashEffect(this.chassis.object.position, this.chassis.object.quaternion, this.chassis.object)
    //             // Increment nitro effect count
    //             this.nitroEffectCount += 1;
                
    //             // Set boost on cooldown to prevent re-triggering
    //             this.boostCooldown = true;

    //             // Cooldown to disable boost for 4 seconds after the nitro effect
    //             setTimeout(() => {
    //                 this.nitroEffectCount = 0;  // Reset nitro effect count after cooldown
    //                 this.boostCooldown = false; // Cooldown ends after 4 seconds
    //             }, this.cooldownDuration);
    //         }
    //         if(this.movement.localAcceleration.x > 0.03 && this.time.elapsed - this.movement.lastScreech > 5000)
    //         {
    //             this.movement.lastScreech = this.time.elapsed
    //             this.sounds.play('screech')
    //         }
    //     })
    // }

    setMovement() {
        this.movement = {};
        this.movement.speed = new THREE.Vector3();
        this.movement.localSpeed = new THREE.Vector3();
        this.movement.acceleration = new THREE.Vector3();
        this.movement.localAcceleration = new THREE.Vector3();
        this.movement.lastScreech = 0;
    
        this.time.on('tick', () => {
            const movementSpeed = new THREE.Vector3();
            movementSpeed.copy(this.chassis.object.position).sub(this.chassis.oldPosition);
    
            const deltaScale = this.time.delta > 0 ? this.time.delta : 16.67; // Default delta
            movementSpeed.multiplyScalar(1 / deltaScale * 17);
    
            this.movement.acceleration = movementSpeed.clone().sub(this.movement.speed);
            this.movement.speed.copy(movementSpeed);
    
            this.movement.localSpeed = this.movement.speed.clone().applyAxisAngle(
                new THREE.Vector3(0, 0, 1),
                -this.chassis.object.rotation.z
            );
            this.movement.localAcceleration = this.movement.acceleration.clone().applyAxisAngle(
                new THREE.Vector3(0, 0, 1),
                -this.chassis.object.rotation.z
            );
    
            // Update speedometer
            this.updateSpeedometer();
    
            // Handle nitro effect
            this.handleNitroEffect();
    
            // Handle siren effect
            this.handleSirenEffect();
    
            // Handle screech sound
            if (this.movement.localAcceleration.x > 0.03 && this.time.elapsed - this.movement.lastScreech > 5000) {
                this.movement.lastScreech = this.time.elapsed;
                this.sounds.play('screech');
            }
        });
    }

    updateSpeedometer() {
        const speed = this.movement.speed.length() * 300; // Actual speed of the car
        const maxSpeed = 200; // Maximum speed (adjust based on your game)
        const speedPercentage = Math.min(speed / maxSpeed, 1); // Normalize speed to range [0, 1]
    
        const needle = document.getElementById('needle');
        const speedValue = document.getElementById('speed-value');
        if (needle && speedValue) {
            const rotation = speedPercentage * 180 - 100; // Convert speed to needle rotation (0 to 180 degrees)
            needle.style.transform = `rotate(${rotation}deg)`;
            speedValue.textContent = Math.round(speed); // Display actual speed value
        }
    }

    handleNitroEffect() {
        if (this.controls.actions.boost && !this.boostCooldown && this.nitroEffectCount < this.maxNitroExecutions) {
            // Trigger the nitro effect when accelerating
            this.createNitroEffect(this.chassis.object.position, this.chassis.object.quaternion, this.chassis.object);
    
            // Increment nitro effect count
            this.nitroEffectCount += 1;
    
            // Set boost on cooldown to prevent re-triggering
            this.boostCooldown = true;
    
            // Cooldown to disable boost for 4 seconds after the nitro effect
            setTimeout(() => {
                this.nitroEffectCount = 0; // Reset nitro effect count after cooldown
                this.boostCooldown = false; // Cooldown ends after 4 seconds
            }, this.cooldownDuration);
        }
    }

    handleSirenEffect() {
        if (this.controls.actions.siren && !this.sirenCooldown && this.sirenEffectCount < this.maxSirenExecutions) {
            // Trigger the siren effect
            this.createSirenEffect();
    
            // Increment siren effect count
            this.sirenEffectCount += 1;
    
            // Set siren on cooldown to prevent immediate re-triggering
            this.sirenCooldown = true;
    
            // Cooldown to reset siren after a set duration
            setTimeout(() => {
                this.sirenEffectCount = 0;  // Reset siren effect count after cooldown
                this.sirenCooldown = false; // Cooldown ends after the specified duration
            }, this.sirenCooldownDuration);
        }
    }    

    // setChassis() {
    //     this.chassis = {};
    //     this.chassis.offset = new THREE.Vector3(0, 0, -0.28);
    
    //     // Debugging the model and mesh conversion
    //     if (!this.models.chassis) {
    //         console.error("Chassis model is undefined. Check if the model was loaded correctly.");
    //         return;
    //     }
    
    //     this.chassis.object = this.objects.getConvertedMesh(this.models.chassis.scene.children);
    
    //     if (!this.chassis.object) {
    //         console.error("Failed to convert chassis model to mesh.");
    //         return;
    //     }
    
    //     this.chassis.object.position.copy(this.physics.car.chassis.body.position);
    //     this.chassis.oldPosition = this.chassis.object.position.clone();
    //     this.container.add(this.chassis.object);
    
    //     this.shadows.add(this.chassis.object, { sizeX: 3, sizeY: 2, offsetZ: 0.2 });
    
    //     // Time tick
    //     this.time.on('tick', () => {
    //         // Save old position for movement calculation
    //         this.chassis.oldPosition = this.chassis.object.position.clone();
    
    //         // Update if mode physics
    //         if (!this.transformControls.enabled) {
    //             this.chassis.object.position.copy(this.physics.car.chassis.body.position).add(this.chassis.offset);
    //             this.chassis.object.quaternion.copy(this.physics.car.chassis.body.quaternion);
    //         }
    
    //         // Update position
    //         this.position.copy(this.chassis.object.position);
    //     });
    // }
    
    // setChassis() {
    //     this.chassis = {};
    //     this.chassis.offset = new THREE.Vector3(0, 0, -0.28);
    
    //     // Debugging the model and mesh conversion
    //     if (!this.models.chassis) {
    //         console.error("Chassis model is undefined. Check if the model was loaded correctly.");
    //         return;
    //     }
    
    //     this.chassis.object = this.objects.getConvertedMesh(this.models.chassis.scene.children);
    
    //     if (!this.chassis.object) {
    //         console.error("Failed to convert chassis model to mesh.");
    //         return;
    //     }
    
    //     this.chassis.object.position.copy(this.physics.car.chassis.body.position);
    //     this.chassis.oldPosition = this.chassis.object.position.clone();
    //     this.container.add(this.chassis.object);
    
    //     this.shadows.add(this.chassis.object, { sizeX: 3, sizeY: 2, offsetZ: 0.2 });
    
    //     // Time tick
    //     this.time.on('tick', () => {
    //         // Save old position for movement calculation
    //         this.chassis.oldPosition = this.chassis.object.position.clone();
    
    //         // Ensure `transformControls` exists before accessing
    //         if (this.transformControls && !this.transformControls.enabled) {
    //             this.chassis.object.position
    //                 .copy(this.physics.car.chassis.body.position)
    //                 .add(this.chassis.offset);
    //             this.chassis.object.quaternion.copy(this.physics.car.chassis.body.quaternion);
    //         }
    
    //         // Update position
    //         this.position.copy(this.chassis.object.position);
    //     });
    // }    

    setChassis() {
        this.chassis = {};
        this.chassis.offset = new THREE.Vector3(0, 0, -0.28);
    
        // Load main chassis
        if (this.models.chassis) {
            this.chassis.main = this.objects.getConvertedMesh(this.models.chassis.scene.children);
            this.container.add(this.chassis.main);
        } else {
            console.error("Chassis model is undefined.");
            return;
        }
    
        // Attach subcomponents
        const subParts = ["bottom", "spoiler", "window"];
        for (const part of subParts) {
            if (this.models[part]) {
                this.chassis[part] = this.objects.getConvertedMesh(this.models[part].scene.children);
                this.chassis.main.add(this.chassis[part]); // Attach to main chassis
            } else {
                console.warn(`${part} model is undefined.`);
            }
        }
    
        // Initialize object reference
        this.chassis.object = this.chassis.main; // Keep compatibility with existing logic
        this.chassis.object.position.copy(this.physics.car.chassis.body.position);
        this.chassis.oldPosition = this.chassis.object.position.clone();
    
        // Shadows
        this.shadows.add(this.chassis.main, { sizeX: 3, sizeY: 2, offsetZ: 0.2 });
    
        // Time tick for updates
        this.time.on('tick', () => {
            this.chassis.oldPosition = this.chassis.object.position.clone();
    
            if (this.transformControls && !this.transformControls.enabled) {
                this.chassis.object.position
                    .copy(this.physics.car.chassis.body.position)
                    .add(this.chassis.offset);
                this.chassis.object.quaternion.copy(this.physics.car.chassis.body.quaternion);
            }
    
            this.position.copy(this.chassis.object.position);
        });
    }    

    setAntena()
    {
        this.antena = {}

        this.antena.speedStrength = 10
        this.antena.damping = 0.035
        this.antena.pullBackStrength = 0.02

        this.antena.object = this.objects.getConvertedMesh(this.models.antena.scene.children)
        this.chassis.object.add(this.antena.object)

        this.antena.speed = new THREE.Vector2()
        this.antena.absolutePosition = new THREE.Vector2()
        this.antena.localPosition = new THREE.Vector2()

        // Time tick
        this.time.on('tick', () =>
        {
            const max = 1
            const accelerationX = Math.min(Math.max(this.movement.acceleration.x, - max), max)
            const accelerationY = Math.min(Math.max(this.movement.acceleration.y, - max), max)

            this.antena.speed.x -= accelerationX * this.antena.speedStrength
            this.antena.speed.y -= accelerationY * this.antena.speedStrength

            const position = this.antena.absolutePosition.clone()
            const pullBack = position.negate().multiplyScalar(position.length() * this.antena.pullBackStrength)
            this.antena.speed.add(pullBack)

            this.antena.speed.x *= 1 - this.antena.damping
            this.antena.speed.y *= 1 - this.antena.damping

            this.antena.absolutePosition.add(this.antena.speed)

            this.antena.localPosition.copy(this.antena.absolutePosition)
            this.antena.localPosition.rotateAround(new THREE.Vector2(), - this.chassis.object.rotation.z)

            this.antena.object.rotation.y = this.antena.localPosition.x * 0.1
            this.antena.object.rotation.x = this.antena.localPosition.y * 0.1

        })

        // Debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('antena')
            folder.open()

            folder.add(this.antena, 'speedStrength').step(0.001).min(0).max(50)
            folder.add(this.antena, 'damping').step(0.0001).min(0).max(0.1)
            folder.add(this.antena, 'pullBackStrength').step(0.0001).min(0).max(0.1)
        }
    }

    setBackLights()
    {
        this.backLightsBrake = {}
        this.headLights = {}

        this.backLightsBrake.material = this.materials.pures.items.red.clone()
        this.backLightsBrake.material.transparent = true
        this.backLightsBrake.material.opacity = 0.5

        this.headLights.material = this.materials.pures.items.white.clone()
        this.headLights.material.transparent = true
        this.headLights.material.opacity = 0.1

        this.backLightsBrake.object = this.objects.getConvertedMesh(this.models.backLightsBrake.scene.children)
        for(const _child of this.backLightsBrake.object.children)
        {
            _child.material = this.backLightsBrake.material
        }

        this.headLights.object = this.objects.getConvertedMesh(this.models.headLights.scene.children)
        for(const _child of this.headLights.object.children)
        {
            _child.material = this.headLights.material
        }

        this.chassis.object.add(this.backLightsBrake.object)
        this.chassis.object.add(this.headLights.object)

        // Back lights brake
        this.backLightsReverse = {}

        this.backLightsReverse.material = this.materials.pures.items.white.clone()
        this.backLightsReverse.material.transparent = true
        this.backLightsReverse.material.opacity = 0.5

        this.backLightsReverse.object = this.objects.getConvertedMesh(this.models.backLightsReverse.scene.children)
        for(const _child of this.backLightsReverse.object.children)
        {
            _child.material = this.backLightsReverse.material
        }

        this.chassis.object.add(this.backLightsReverse.object)

         // Back lights battery
        this.backLightsBattery = {}

        this.backLightsBattery.materialRed = this.materials.pures.items.red.clone()
        this.backLightsBattery.materialWhite = this.materials.pures.items.red.clone()
        this.backLightsBattery.materialRed.transparent = true
        this.backLightsBattery.materialRed.opacity = 0
        this.backLightsBattery.materialWhite.transparent = true
        this.backLightsBattery.materialWhite.opacity = 0

        this.backLightsBattery.object = this.objects.getConvertedMesh(this.models.backLightsBattery.scene.children)
        for(const _child of this.backLightsBattery.object.children)
        {
            _child.material = this.backLightsBattery.materialRed
        }

        this.chassis.object.add(this.backLightsBattery.object)

        // Initialize battery status in three.js vector
        this.batteryVector = new THREE.Vector3(0, 0, 0); // Ensure batteryVector is a THREE.Vector3 instance
        this.chassis.object.add(new THREE.Object3D()); // Add an Object3D instance as a parent for the batteryVector
        // this.chassis.object.add(this.batteryVector);

        // Time tick
        this.time.on('tick', () =>
            {
                this.backLightsBrake.material.opacity = this.physics.controls.actions.brake ? 1 : 0.5
                this.backLightsReverse.material.opacity = this.physics.controls.actions.down ? 1 : 0.5
                this.headLights.material.opacity = this.physics.controls.actions.up ? 1 : 0.1

                // const batteryLevelWidth = this.battery / 100; // Calculate the width based on battery percentage
                //     this.backLightsBattery.object.children.forEach(child => {
                //         child.material = this.backLightsBattery.materialWhite;
                //         child.scale.set(batteryLevelWidth, 0.41, 0.41); // Update the scale to show battery level
                //         child.material.opacity = 1;
                //     })
        
                // Update the battery status position
                this.updateBatteryPosition();
            })
    }

    setWheels()
    {
        this.wheels = {}
        this.wheels.object = this.objects.getConvertedMesh(this.models.wheel.scene.children)
        this.wheels.items = []

        for(let i = 0; i < 4; i++)
        {
            const object = this.wheels.object.clone()

            this.wheels.items.push(object)
            this.container.add(object)
        }

        // Time tick
        this.time.on('tick', () =>
        {
            if(!this.transformControls.enabled)
            {
                for(const _wheelKey in this.physics.car.wheels.bodies)
                {
                    const wheelBody = this.physics.car.wheels.bodies[_wheelKey]
                    const wheelObject = this.wheels.items[_wheelKey]

                    wheelObject.position.copy(wheelBody.position)
                    wheelObject.quaternion.copy(wheelBody.quaternion)
                }
            }
        })
    }

    setTransformControls()
    {
        this.transformControls = new TransformControls(this.camera.instance, this.renderer.domElement)
        this.transformControls.size = 0.5
        this.transformControls.attach(this.chassis.object)
        this.transformControls.enabled = false
        this.transformControls.visible = this.transformControls.enabled

        document.addEventListener('keydown', (_event) =>
        {
            if(this.mode === 'transformControls')
            {
                if(_event.key === 'r')
                {
                    this.transformControls.setMode('rotate')
                }
                else if(_event.key === 'g')
                {
                    this.transformControls.setMode('translate')
                }
            }
        })

        this.transformControls.addEventListener('dragging-changed', (_event) =>
        {
            this.camera.orbitControls.enabled = !_event.value
        })

        this.container.add(this.transformControls)

        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('controls')
            folder.open()

            folder.add(this.transformControls, 'enabled').onChange(() =>
            {
                this.transformControls.visible = this.transformControls.enabled
            })
        }
    }

    setShootingBall()
    {
        if(!this.config.cyberTruck)
        {
            return
        }

        if (typeof window !== 'undefined') {

            window.addEventListener('keydown', (_event) =>
            {
                if(_event.key === 'b')
                {
                    const angle = Math.random() * Math.PI * 2
                    const distance = 10
                    const x = this.position.x + Math.cos(angle) * distance
                    const y = this.position.y + Math.sin(angle) * distance
                    const z = 2 + 2 * Math.random()
                    const bowlingBall = this.objects.add({
                        base: this.resources.items.bowlingBallBase.scene,
                        collision: this.resources.items.bowlingBallCollision.scene,
                        offset: new THREE.Vector3(x, y, z),
                        rotation: new THREE.Euler(Math.PI * 0.5, 0, 0),
                        duplicated: true,
                        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.15, alpha: 0.35 },
                        mass: 5,
                        soundName: 'bowlingBall',
                        sleep: false
                    })

                    const carPosition = new CANNON.Vec3(this.position.x, this.position.y, this.position.z + 1)
                    let direction = carPosition.vsub(bowlingBall.collision.body.position)
                    direction.normalize()
                    direction = direction.scale(100)
                    bowlingBall.collision.body.applyImpulse(direction, bowlingBall.collision.body.position)
                }
            })
        }
    }
}