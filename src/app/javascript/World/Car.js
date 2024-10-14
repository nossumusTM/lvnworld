import * as THREE from 'three'
import CANNON from 'cannon'
import { sparkTexture } from './SparkTexture'
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

        // Set up
        this.container = new THREE.Object3D()
        this.position = new THREE.Vector3()

        this.bullets = [];
        this.battery = 100;
        this.score = 0;
        this.lastHitBy = null;

        this.boostCooldown = false;
        this.boostDuration = 100;

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
        this.setShootingBall()
        this.setShootingMechanism()
    }

    // Define a method to create spark effects
    createSparkEffect(position) {
        
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
            size: 0.5, // Base size
            vertexColors: true,
            sizeAttenuation: true, // Size diminishes with distance
            opacity: 1,
            transparent: true
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
                this.container.remove(particles);
                particles.geometry.dispose();
                particles.material.dispose();
            }
        };
    
        animateParticles();
    }

    // Define a method to create fire effects behind the rocket
    createFireEffect(position, quaternion) {
        const particleCount = 100;
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
                1, // Red
                Math.random() * 1, // Green
                0 // Blue
            );

            sizes.push(Math.random() * 0.1 + 0.05); // Random size between 0.05 and 0.15
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.5, // Base size
            vertexColors: true,
            sizeAttenuation: true, // Size diminishes with distance
            opacity: 1,
            transparent: true
        });

        const particles = new THREE.Points(geometry, material);
        particles.position.copy(position);

        // Adjust the fire position to be behind the rocket
        const fireOffset = new THREE.Vector3(-1.3, 0, 0);
        fireOffset.applyQuaternion(quaternion);
        particles.position.add(fireOffset);

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
                this.container.remove(particles);
                particles.geometry.dispose();
                particles.material.dispose();
            }
        };

        animateParticles();
    }

    // createNitroEffect(position, quaternion) {
    //     const base64Texture = sparkTexture; // Assign the imported base64 string
    
    //     // Create an image element and set the base64 source
    //     const img = new Image();
    //     img.src = base64Texture;
    //     img.crossOrigin = "anonymous";  // Ensure CORS is handled for WebGL
    
    //     // Wait until the image loads before using it as a texture
    //     img.onload = () => {
    //         const texture = new THREE.Texture(img);
    //         texture.needsUpdate = true;  // Make sure the texture updates
    
    //         // Create particle material with the loaded texture
    //         const material = new THREE.PointsMaterial({
    //             size: 1.5,
    //             vertexColors: true,
    //             sizeAttenuation: true,
    //             transparent: true,
    //             opacity: 1,
    //             map: texture,  // Use the loaded base64 texture
    //             blending: THREE.AdditiveBlending,
    //         });
    
    //         const particleCount = 200;
    //         const geometry = new THREE.BufferGeometry();
    //         const vertices = [];
    //         const velocities = [];
    //         const colors = [];
    //         const sizes = [];
    
    //         // Generate particles
    //         for (let i = 0; i < particleCount; i++) {
    //             const angle = Math.random() * Math.PI * 2;
    //             const radius = Math.random() * 0.5;
    //             const z = (Math.random() - 0.5) * 0.5;
    
    //             vertices.push(
    //                 Math.cos(angle) * radius,
    //                 Math.sin(angle) * radius,
    //                 z
    //             );
    
    //             velocities.push(
    //                 (Math.random() - 0.5) * 2,
    //                 0,
    //                 0
    //             );
    
    //             if (i % 2 === 0) {
    //                 colors.push(0.0, 0.5 + Math.random() * 0.5, 1.0);
    //             } else {
    //                 colors.push(1.0, 0.5 + Math.random() * 0.5, 0.0);
    //             }
    
    //             sizes.push(Math.random() * 0.4 + 0.3);
    //         }
    
    //         geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    //         geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    //         geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    //         geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    //         const particles = new THREE.Points(geometry, material);
    //         particles.position.copy(position);
    
    //         const nitroOffset = new THREE.Vector3(0.5, 0, 0);
    //         nitroOffset.applyQuaternion(quaternion);
    //         particles.position.add(nitroOffset);
    
    //         this.container.add(particles);
    
    //         const duration = 700;
    //         const startTime = performance.now();
    
    //         const animateParticles = () => {
    //             const elapsedTime = performance.now() - startTime;
    //             if (elapsedTime < duration) {
    //                 const positions = geometry.attributes.position.array;
    //                 const velocities = geometry.attributes.velocity.array;
    
    //                 for (let i = 0; i < particleCount; i++) {
    //                     positions[i * 3] += velocities[i * 3] * 0.2;
    //                     positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.2;
    //                     positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.2;
    //                 }
    
    //                 geometry.attributes.position.needsUpdate = true;
    
    //                 particles.scale.set(1, 1, 1).multiplyScalar(1 - elapsedTime / duration);
    //                 particles.material.opacity = 1 - elapsedTime / duration;
    
    //                 requestAnimationFrame(animateParticles);
    //             } else {
    //                 this.container.remove(particles);
    //                 particles.geometry.dispose();
    //                 particles.material.dispose();
    //             }
    //         };
    
    //         animateParticles();
    //     };
    
    //     // Error handling if the image fails to load
    //     img.onerror = (error) => {
    //         console.error("Failed to load base64 image:", error);
    //     };
    // }

    createNitroEffect() {
        const base64Texture = sparkTexture; // Use the imported base64 string
    
        const img = new Image();
        img.src = base64Texture;
        img.crossOrigin = "anonymous"; // Handle CORS
    
        img.onload = () => {
            const texture = new THREE.Texture(img);
            texture.needsUpdate = true;
    
            const material = new THREE.PointsMaterial({
                size: 3.0, // Larger size for visibility
                vertexColors: true,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.9,
                map: texture,
                blending: THREE.AdditiveBlending, // Glowing effect
                depthWrite: false, // Prevent depth issues
            });
    
            const particleCount = 3; // Only 3 particles for the effect
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const colors = [];
    
            // Define paths for the particles with different radii and speeds
            const paths = [
                { radius: 1.0, speed: 0.02 },
                { radius: 1.5, speed: 0.03 },
                { radius: 2.0, speed: 0.025 },
            ];
    
            // Rainbow colors palette (RGB values)
            const rainbowColors = [
                [1.0, 0.0, 0.0], // Red
                [1.0, 0.5, 0.0], // Orange
                [1.0, 1.0, 0.0], // Yellow
                [0.0, 1.0, 0.0], // Green
                [0.0, 0.0, 1.0], // Blue
                [0.29, 0.0, 0.51], // Indigo
                [0.56, 0.0, 1.0], // Violet
            ];
    
            // Initialize particles with starting positions and random colors
            for (let i = 0; i < particleCount; i++) {
                vertices.push(paths[i].radius, 0, 0); // Initialize position
    
                // Randomly select a color from the rainbow palette
                const [r, g, b] = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
    
                // Apply the selected color to the particle
                colors.push(r, g, b);
            }
    
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
            const particles = new THREE.Points(geometry, material);
            this.container.add(particles); // Add particles to the scene
    
            const duration = 5000; // Effect lasts for 5 seconds
            const startTime = performance.now();
    
            const animateParticles = () => {
                const elapsedTime = performance.now() - startTime;
    
                if (elapsedTime < duration) {
                    const positions = geometry.attributes.position.array;
    
                    // Update particle positions to orbit around the car's chassis
                    for (let i = 0; i < particleCount; i++) {
                        const { radius, speed } = paths[i];
                        const angle = elapsedTime * speed;
    
                        // Calculate the new orbit position
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        const z = 0.5; // Keep Z constant
    
                        // Apply the car's quaternion to align the orbits with the car’s orientation
                        const vector = new THREE.Vector3(x, y, z);
                        vector.applyQuaternion(this.chassis.object.quaternion);
    
                        // Update particle position relative to the car's position
                        const chassisPosition = this.chassis.object.position;
    
                        positions[i * 3] = chassisPosition.x + vector.x;
                        positions[i * 3 + 1] = chassisPosition.y + vector.y;
                        positions[i * 3 + 2] = chassisPosition.z + vector.z;
                    }
    
                    geometry.attributes.position.needsUpdate = true; // Reflect position updates
    
                    requestAnimationFrame(animateParticles); // Continue animation
                } else {
                    // Cleanup after the effect completes
                    this.container.remove(particles);
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

    setShootingMechanism() {

        if (typeof window !== 'undefined') {

            window.addEventListener('mousedown', (event) => {
                if (event.button === 1 && this.canShoot) {
                    event.preventDefault();
                    this.createAndShootBullet({ shooterId: this.playerId });
                    this.updateBatteryStatus(); // Update battery status in HTML
                    this.updateBatteryPosition(); // Update battery vector position
                    this.canShoot = false;

                    setTimeout(() => {
                        this.canShoot = true;
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

    setModels()
    {
        this.models = {}

        {
            this.models.chassis = this.resources.items.carDefaultChassis
            this.models.antena = this.resources.items.carDefaultAntena
            this.models.backLightsBrake = this.resources.items.carDefaultBackLightsBrake
            this.models.backLightsReverse = this.resources.items.carDefaultBackLightsReverse
            this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery
            this.models.wheel = this.resources.items.carDefaultWheel
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
            movementSpeed.copy(this.chassis.object.position).sub(this.chassis.oldPosition)
            movementSpeed.multiplyScalar(1 / this.time.delta * 17)
            this.movement.acceleration = movementSpeed.clone().sub(this.movement.speed)
            this.movement.speed.copy(movementSpeed)

            this.movement.localSpeed = this.movement.speed.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), - this.chassis.object.rotation.z)
            this.movement.localAcceleration = this.movement.acceleration.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), - this.chassis.object.rotation.z)

            // Calculate speed
            const speed = this.movement.speed.length() * 300; // Actual speed of the car
            const maxSpeed = 200; // Maximum speed (adjust based on your game)
            const speedPercentage = Math.min(speed / maxSpeed, 1); // Normalize speed to range [0, 1]

            // Update speedometer needle
            const needle = document.getElementById('needle');
            const speedValue = document.getElementById('speed-value');
            if (needle && speedValue) {
                const rotation = speedPercentage * 180 - 100; // Convert speed to needle rotation (0 to 180 degrees)
                needle.style.transform = `rotate(${rotation}deg)`;
                speedValue.textContent = Math.round(speed); // Display actual speed value
            }
            
            // Sound
            this.sounds.engine.speed = this.movement.localSpeed.x
            this.sounds.engine.acceleration = this.controls.actions.up ? (this.controls.actions.boost ? 1 : 0.5) : 0

            // if (this.controls.actions.boost) {
            //     // Trigger the nitro effect when accelerating
            //     this.createNitroEffect(this.chassis.object.position, this.chassis.object.quaternion);
            // }

            // Check if boost is active and not on cooldown
            if (this.controls.actions.boost && !this.boostCooldown) {
                // Trigger the nitro effect when accelerating
                this.createNitroEffect(this.chassis.object.position, this.chassis.object.quaternion);
        
                // Set boost on cooldown to prevent re-triggering
                this.boostCooldown = true;
        
                // Reset the cooldown after the specified duration
                setTimeout(() => {
                    this.boostCooldown = false;  // Cooldown ends after 2 seconds
                }, this.boostDuration);
            }

            if(this.movement.localAcceleration.x > 0.03 && this.time.elapsed - this.movement.lastScreech > 5000)
            {
                this.movement.lastScreech = this.time.elapsed
                this.sounds.play('screech')
            }
        })
    }

    setChassis() {
        this.chassis = {};
        this.chassis.offset = new THREE.Vector3(0, 0, -0.28);
    
        // Debugging the model and mesh conversion
        if (!this.models.chassis) {
            console.error("Chassis model is undefined. Check if the model was loaded correctly.");
            return;
        }
    
        this.chassis.object = this.objects.getConvertedMesh(this.models.chassis.scene.children);
    
        if (!this.chassis.object) {
            console.error("Failed to convert chassis model to mesh.");
            return;
        }
    
        this.chassis.object.position.copy(this.physics.car.chassis.body.position);
        this.chassis.oldPosition = this.chassis.object.position.clone();
        this.container.add(this.chassis.object);
    
        this.shadows.add(this.chassis.object, { sizeX: 3, sizeY: 2, offsetZ: 0.2 });
    
        // Time tick
        this.time.on('tick', () => {
            // Save old position for movement calculation
            this.chassis.oldPosition = this.chassis.object.position.clone();
    
            // Update if mode physics
            if (!this.transformControls.enabled) {
                this.chassis.object.position.copy(this.physics.car.chassis.body.position).add(this.chassis.offset);
                this.chassis.object.quaternion.copy(this.physics.car.chassis.body.quaternion);
            }
    
            // Update position
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