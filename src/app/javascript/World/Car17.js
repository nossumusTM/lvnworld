import * as THREE from 'three'
import * as CANNON from 'cannon'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import Controls1 from './Controls1'

export default class Car17
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
        this.controls = new Controls1({
            config: this.config,
            sizes: this.sizes,
            time: this.time,
            camera: this.camera,
            sounds: this.sounds
        }),
        this.sounds = _options.sounds
        this.renderer = _options.renderer
        this.camera = _options.camera
        this.debug = _options.debug
        this.config = _options.config
        this.playerId = _options.playerId

        this.bullets = [];
        this.battery = 100;
        this.score = 0;
        this.lastHitBy = null;

        // Set up
        this.container = new THREE.Object3D()
        this.position = new THREE.Vector3()

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('car')
            // this.debugFolder.open()
        }

        this.setModels()
        this.setMovement()
        this.setChassis()
        this.setAntena()
        this.setBackLights()
        this.setWheels()
        this.setTransformControls()
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
                size: 2.5, // Adjust size for visibility
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
            const exhaustOffset = new THREE.Vector3(-1.75, 0, 0);
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

    createSirenEffect() {
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = 128;
        glowCanvas.height = 128;

        const glowContext = glowCanvas.getContext('2d');
        const glowGradient = glowContext.createRadialGradient(64, 64, 6, 64, 64, 64);
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        glowGradient.addColorStop(0.28, 'rgba(255, 255, 255, 0.96)');
        glowGradient.addColorStop(0.58, 'rgba(255, 255, 255, 0.38)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        glowContext.fillStyle = glowGradient;
        glowContext.fillRect(0, 0, 128, 128);

        const glowTexture = new THREE.CanvasTexture(glowCanvas);
        glowTexture.needsUpdate = true;

        const sirenColors = [
            new THREE.Color(0x00ff00),
            new THREE.Color(0xffffff),
        ];

        const material = new THREE.SpriteMaterial({
            map: glowTexture,
            color: sirenColors[0].clone(),
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.setScalar(0.36);

        const anchor = this.antena.effectAnchor || this.antena.object;
        anchor.add(sprite);

        const duration = 5000;
        const startTime = performance.now();
        const anchorWorldPosition = new THREE.Vector3();
        const cameraPosition = new THREE.Vector3();
        const cameraInstance = this.camera && this.camera.instance ? this.camera.instance : null;

        const animateParticles = () => {
            const elapsedTime = performance.now() - startTime;

            if (elapsedTime < duration) {
                const blinkColor = sirenColors[Math.floor(elapsedTime / 250) % sirenColors.length];
                material.color.copy(blinkColor);

                const isAttachedCamera = Boolean(cameraInstance && this.camera && this.camera.isNewCameraActive);
                let nearFade = 1;
                if (isAttachedCamera) {
                    anchor.getWorldPosition(anchorWorldPosition);
                    cameraInstance.getWorldPosition(cameraPosition);
                    const distance = anchorWorldPosition.distanceTo(cameraPosition);
                    nearFade = THREE.MathUtils.clamp((distance - 2.8) / 1.6, 0, 1);
                }

                const pulse = 0.72 + Math.abs(Math.sin(elapsedTime * 0.014)) * 0.28;
                material.opacity = pulse * nearFade;
                const baseScale = isAttachedCamera ? 0.02 : 0.32;
                const scaleAmplitude = isAttachedCamera ? 0.045 : 0.08;
                const scale = baseScale + Math.abs(Math.sin(elapsedTime * 0.01)) * scaleAmplitude;
                sprite.scale.setScalar(scale * (isAttachedCamera ? (0.04 + nearFade * 0.96) : 1));
                requestAnimationFrame(animateParticles);
            } else {
                anchor.remove(sprite);
                glowTexture.dispose();
                material.dispose();
            }
        };

        animateParticles();
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
                        -1 * (Math.random() - 0.5) * 0.1, // X-axis jitter
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

            window.addEventListener('mousedown', (event) => {
                if (this.canShoot) {
                    event.preventDefault();
                    this.createAndShootBullet({ shooterId: this.playerId });
                    this.updateBatteryStatus(); // Update battery status in HTML
                    this.updateBatteryPosition(); // Update battery vector position
                    this.canShoot = false;

                    setTimeout(() => {
                        this.canShoot = true;
                    }, 10000); // Delay in milliseconds
                }
            });
        }

        // Initialize shooting flag
        this.canShoot = true;
    } 

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
                bulletData.rotation?.w || 1
            );
            bulletVelocity = new CANNON.Vec3(
                bulletData.velocity?.x || 0,
                bulletData.velocity?.y || 0,
                bulletData.velocity?.z || 0
            );
            shooterId = bulletData.shooterId;
        } else {
            const frontOffset = new THREE.Vector3(0.8, 0, 0);
            frontOffset.applyQuaternion(this.physics.car.chassis.body.quaternion);
            frontOffset.multiplyScalar(2);
            bulletPosition = new THREE.Vector3().addVectors(this.physics.car.chassis.body.position, frontOffset);
            bulletQuaternion = this.physics.car.chassis.body.quaternion.clone();
    
            const baseVelocity = new THREE.Vector3(100, 0, 0);
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
            console.log("");
        });

        this.createFireEffect(bulletBall.position, bulletQuaternion);
    }

    setModels()
    {
        this.models = {}

        {
            this.models.chassis = this.resources.items.car1DefaultChassis
            this.models.antena = this.resources.items.car1DefaultAntena
            this.models.backLightsBrake = this.resources.items.car1DefaultBackLightsBrake
            this.models.backLightsReverse = this.resources.items.car1DefaultBackLightsReverse
            this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery
            this.models.wheel = this.resources.items.car1DefaultWheel
        }
    }

    setMovement()
    {
        this.movement = {}
        this.movement.speed = new THREE.Vector3()
        this.movement.localSpeed = new THREE.Vector3()
        this.movement.acceleration = new THREE.Vector3()
        this.movement.localAcceleration = new THREE.Vector3()
        this.movement.lastScreech = 0

        // Time tick
        this.time.on('tick', () =>
        {
            // Movement
            const movementSpeed = new THREE.Vector3()
            if (this.car && this.car.physics && this.car.physics.car && this.car.physics.car.chassis && this.car.physics.car.chassis.body && this.car.physics.car.chassis.object) {

                movementSpeed.copy(this.chassis.object.position).sub(this.chassis.oldPosition)

            }
            movementSpeed.multiplyScalar(1 / this.time.delta * 17)
            this.movement.acceleration = movementSpeed.clone().sub(this.movement.speed)
            this.movement.speed.copy(movementSpeed)
            if (this.car && this.car.physics && this.car.physics.car && this.car.physics.car.chassis && this.car.physics.car.chassis.body && this.car.physics.car.chassis.object) {

            this.movement.localSpeed = this.movement.speed.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), - this.chassis.object.rotation.z)
            this.movement.localAcceleration = this.movement.acceleration.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), - this.chassis.object.rotation.z)
            }

            if(this.movement.localAcceleration.x > 0.03 && this.time.elapsed - this.movement.lastScreech > 5000)
            {
                this.movement.lastScreech = this.time.elapsed
            }
        })
    }

    setChassis()
    {
        this.chassis = {}
        this.chassis.offset = new THREE.Vector3(0, 0, - 0.28)
        this.chassis.object = this.objects.getConvertedMesh(this.models.chassis.scene.children)
        this.chassis.object.position.copy(this.physics.car1.chassis.body.position)
        this.chassis.oldPosition = this.chassis.object.position.clone()
        this.container.add(this.chassis.object)

        this.shadows.add(this.chassis.object, { sizeX: 3, sizeY: 2, offsetZ: 0.2 })

        // Time tick
        this.time.on('tick', () =>
        {
            // Save old position for movement calculation
            this.chassis.oldPosition = this.chassis.object.position.clone()

            // Update if mode physics
            if(!this.transformControls.enabled)
            
                this.chassis.object.position.copy(this.physics.car1.chassis.body.position).add(this.chassis.offset)
                this.chassis.object.quaternion.copy(this.physics.car1.chassis.body.quaternion)
            

            // Update position
            this.position.copy(this.chassis.object.position)
        })
    }

    setAntena()
    {
        this.antena = {}

        this.antena.speedStrength = 10
        this.antena.damping = 0.035
        this.antena.pullBackStrength = 0.02

        this.antena.object = this.objects.getConvertedMesh(this.models.antena.scene.children)
        this.chassis.object.add(this.antena.object)
        this.antena.object.updateMatrixWorld(true)
        this.antena.effectAnchor = new THREE.Object3D()

        const antennaBounds = new THREE.Box3().setFromObject(this.antena.object)
        const topCenter = new THREE.Vector3()

        if(antennaBounds.isEmpty())
        {
            topCenter.set(0, 0, 0.4)
        }
        else
        {
            topCenter.set(
                (antennaBounds.min.x + antennaBounds.max.x) * 0.5,
                (antennaBounds.min.y + antennaBounds.max.y) * 0.5,
                antennaBounds.max.z + 0.02
            )
            this.antena.object.worldToLocal(topCenter)
        }

        this.antena.effectAnchor.position.copy(topCenter)
        this.antena.object.add(this.antena.effectAnchor)

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

        this.backLightsBrake.material = this.materials.pures.items.red.clone()
        this.backLightsBrake.material.transparent = true
        this.backLightsBrake.material.opacity = 0.5

        this.backLightsBrake.object = this.objects.getConvertedMesh(this.models.backLightsBrake.scene.children)
        for(const _child of this.backLightsBrake.object.children)
        {
            _child.material = this.backLightsBrake.material
        }

        this.chassis.object.add(this.backLightsBrake.object)

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
        this.backLightsBattery.materialRed.opacity = 0.5
        this.backLightsBattery.materialWhite.transparent = true
        this.backLightsBattery.materialWhite.opacity = 0.5

        this.backLightsBattery.object = this.objects.getConvertedMesh(this.models.backLightsBattery.scene.children)
        for(const _child of this.backLightsBattery.object.children)
        {
            _child.material = this.backLightsBattery.materialRed
        }

        this.chassis.object.add(this.backLightsBattery.object)

        // Initialize battery status in three.js vector
        this.batteryVector = new THREE.Vector3(0, 0, 0); // Ensure batteryVector is a THREE.Vector3 instance
        this.chassis.object.add(new THREE.Object3D()); // Add an Object3D instance as a parent for the batteryVector

        // Time tick
        this.time.on('tick', () =>
            {
                this.backLightsBrake.material.opacity = this.physics.controls.actions.brake ? 1 : 0.5
                this.backLightsReverse.material.opacity = this.physics.controls.actions.down ? 1 : 0.5

                const batteryLevelWidth = this.battery / 100; // Calculate the width based on battery percentage
                    this.backLightsBattery.object.children.forEach(child => {
                        child.material = this.backLightsBattery.materialWhite;
                        child.scale.set(batteryLevelWidth, 0.41, 0.41); // Update the scale to show battery level
                        child.material.opacity = 1;
                    })
        
                // Update the battery status position
                this.updateBatteryPosition();
            })
    }

    // Update the battery position
    updateBatteryPosition() {
        if (this.batteryVector && this.backLightsBattery.object) {
            this.batteryVector.copy(this.backLightsBattery.object.position);
        }
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
            
                for(const _wheelKey in this.physics.car1.wheels.bodies)
                {
                    const wheelBody = this.physics.car1.wheels.bodies[_wheelKey]
                    const wheelObject = this.wheels.items[_wheelKey]

                    wheelObject.position.copy(wheelBody.position)
                    wheelObject.quaternion.copy(wheelBody.quaternion)
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
                        base: this.resources.items.ballBase.scene,
                        collision: this.resources.items.ballCollision.scene,
                        offset: new THREE.Vector3(x, y, z),
                        rotation: new THREE.Euler(Math.PI * 0.5, 0, 0),
                        duplicated: true,
                        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 0.15, alpha: 0.35 },
                        mass: 5,
                        soundName: 'bowlingBall',
                        sleep: false
                    })

                    const car1Position = new CANNON.Vec3(this.position.x, this.position.y, this.position.z + 1)
                    let direction = car1Position.vsub(bowlingBall.collision.body.position)
                    direction.normalize()
                    direction = direction.scale(100)
                    bowlingBall.collision.body.applyImpulse(direction, bowlingBall.collision.body.position)
                }
            })
        }
    }
}
