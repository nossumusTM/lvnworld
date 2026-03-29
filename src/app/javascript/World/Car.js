import * as THREE from 'three'
import CANNON from 'cannon'

import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

function normalizeStoredMatcapName(matcapName)
{
    if(typeof matcapName !== 'string' || matcapName.length === 0)
    {
        return matcapName
    }

    if(matcapName.startsWith('shade') && matcapName.length > 5)
    {
        const normalizedName = matcapName.slice(5)
        return `${normalizedName.substring(0, 1).toLowerCase()}${normalizedName.substring(1)}`
    }

    return matcapName
}

function normalizeStoredMatcaps(matcaps = {})
{
    const normalizedMatcaps = {}

    for(const [partName, matcapName] of Object.entries(matcaps))
    {
        normalizedMatcaps[partName] = normalizeStoredMatcapName(matcapName)
    }

    return normalizedMatcaps
}

function createRoundedRectShape(width, height, radius)
{
    const halfWidth = width * 0.5
    const halfHeight = height * 0.5
    const clampedRadius = Math.max(0.001, Math.min(radius, halfWidth, halfHeight))
    const shape = new THREE.Shape()

    shape.moveTo(-halfWidth + clampedRadius, -halfHeight)
    shape.lineTo(halfWidth - clampedRadius, -halfHeight)
    shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + clampedRadius)
    shape.lineTo(halfWidth, halfHeight - clampedRadius)
    shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - clampedRadius, halfHeight)
    shape.lineTo(-halfWidth + clampedRadius, halfHeight)
    shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - clampedRadius)
    shape.lineTo(-halfWidth, -halfHeight + clampedRadius)
    shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + clampedRadius, -halfHeight)

    return shape
}

function getObjectLocalBounds(object)
{
    if (!object) {
        return new THREE.Box3();
    }

    object.updateMatrixWorld(true);

    const objectInverseMatrix = object.matrixWorld.clone().invert();
    const localBounds = new THREE.Box3();
    let hasBounds = false;

    object.traverse((child) =>
    {
        if (!(child instanceof THREE.Mesh) || !child.geometry) {
            return;
        }

        if (!child.geometry.boundingBox) {
            child.geometry.computeBoundingBox();
        }

        if (!child.geometry.boundingBox) {
            return;
        }

        const childBounds = child.geometry.boundingBox.clone();
        childBounds.applyMatrix4(child.matrixWorld);
        childBounds.applyMatrix4(objectInverseMatrix);

        if (!hasBounds) {
            localBounds.copy(childBounds);
            hasBounds = true;
        } else {
            localBounds.union(childBounds);
        }
    });

    return hasBounds ? localBounds : new THREE.Box3();
}

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
        this.matcaps = normalizeStoredMatcaps(_options.matcaps)
        this.isRemotePlayer = Boolean(_options.isRemotePlayer)

        // Set up
        this.container = new THREE.Object3D()
        this.position = new THREE.Vector3()

        this.bullets = [];
        this.battery = 100;
        this.score = _options.score;
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
        if (!this.isRemotePlayer)
        {
            this.setShootingMechanism()
        }

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

    createCrashEffect(position, quaternion, chassis) {
        this.triggerBatteryDepletedBlink()
    }

    isLightBlinkActive()
    {
        return Boolean(this.lightBlink?.active)
    }

    triggerBatteryDepletedBlink(count = 5)
    {
        if(!this.lightBlink)
        {
            return
        }

        this.lightBlink.active = true
        this.lightBlink.startedAt = performance.now()
        this.lightBlink.totalPhases = Math.max(2, count * 2)
    }

    createFireEffect(bullet) {
        const bulletMesh = bullet?.mesh
        if(!bulletMesh)
        {
            return
        }

        const fireTexture = '/images/texture/fire.png';
    
        const img = new Image();
        img.src = fireTexture;
        img.crossOrigin = "anonymous"; // Handle CORS

        img.onload = () => {
            const texture = new THREE.Texture(img);
            texture.needsUpdate = true;

            const glowCanvas = document.createElement('canvas')
            glowCanvas.width = 128
            glowCanvas.height = 128

            const glowContext = glowCanvas.getContext('2d')
            const glowGradient = glowContext.createRadialGradient(64, 64, 10, 64, 64, 64)
            glowGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
            glowGradient.addColorStop(0.3, 'rgba(255, 214, 128, 0.95)')
            glowGradient.addColorStop(0.62, 'rgba(255, 120, 30, 0.35)')
            glowGradient.addColorStop(1, 'rgba(255, 120, 30, 0)')
            glowContext.fillStyle = glowGradient
            glowContext.fillRect(0, 0, 128, 128)

            const glowTexture = new THREE.CanvasTexture(glowCanvas)
            glowTexture.needsUpdate = true;

            const material = new THREE.PointsMaterial({
                size: 1.9,
                map: texture,
                vertexColors: true,
                sizeAttenuation: true,
                transparent: true,
                opacity: 1,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });

            const glowMaterial = new THREE.SpriteMaterial({
                map: glowTexture,
                color: 0xffe3b0,
                transparent: true,
                opacity: 0.72,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            })

            const particleCount = 150;
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const colors = [];
            const sizes = [];
            const velocities = [];

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
                velocities.push({
                    x: -(0.32 + Math.random() * 0.2),
                    y: (Math.random() - 0.5) * 0.18,
                    z: (Math.random() - 0.5) * 0.18,
                })
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

            const exhaustOffset = new THREE.Vector3(-1.75, 0, 0)
            const particles = new THREE.Points(geometry, material);
            particles.position.copy(exhaustOffset)
            bulletMesh.add(particles)

            const glow = new THREE.Sprite(glowMaterial)
            glow.position.copy(exhaustOffset)
            glow.scale.setScalar(1.45)
            bulletMesh.add(glow)

            let isBulletActive = true; // Track if bullet is active
            let previousFrameTime = performance.now()

            const resetParticle = (index) => {
                vertices[index * 3 + 0] = Math.random() * 0.05
                vertices[index * 3 + 1] = (Math.random() - 0.5) * 0.04
                vertices[index * 3 + 2] = (Math.random() - 0.5) * 0.04
                velocities[index].x = -(0.32 + Math.random() * 0.2)
                velocities[index].y = (Math.random() - 0.5) * 0.18
                velocities[index].z = (Math.random() - 0.5) * 0.18
            }

            for (let i = 0; i < particleCount; i++) {
                resetParticle(i)
            }
            geometry.attributes.position.needsUpdate = true

            const cleanupFireEffect = () => {
                isBulletActive = false
                if (particles.parent) {
                    particles.parent.remove(particles)
                }
                if (glow.parent) {
                    glow.parent.remove(glow)
                }
                geometry.dispose()
                material.dispose()
                texture.dispose()
                glowMaterial.dispose()
                glowTexture.dispose()
            }

            const animateParticles = () => {
                if (!isBulletActive) return; // Stop animation if bullet is removed

                if (!bulletMesh.parent) {
                    cleanupFireEffect()
                    return
                }

                const positions = geometry.attributes.position.array;
                const now = performance.now()
                const deltaTime = Math.min((now - previousFrameTime) / 16.6667, 1.8)
                previousFrameTime = now

                for (let i = 0; i < particleCount; i++) {
                    const velocity = velocities[i]
                    positions[i * 3 + 0] += velocity.x * 0.08 * deltaTime
                    positions[i * 3 + 1] += velocity.y * 0.08 * deltaTime
                    positions[i * 3 + 2] += velocity.z * 0.08 * deltaTime

                    velocity.x *= 0.988
                    velocity.y *= 0.975
                    velocity.z *= 0.975

                    if (positions[i * 3 + 0] < -0.95) {
                        resetParticle(i)
                    }
                }

                geometry.attributes.position.needsUpdate = true;
                const pulse = 0.58 + Math.abs(Math.sin(performance.now() * 0.02)) * 0.26
                glowMaterial.opacity = pulse
                glow.scale.setScalar(1.15 + pulse * 0.65)

                requestAnimationFrame(animateParticles); // Continue animation
            };

            animateParticles(); // Start animation
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

            // Keep the exhaust fully local to the chassis and anchor it to the actual rear-light side.
            carChassis.add(particles);
            const chassisBounds = this.chassis?.localBounds || getObjectLocalBounds(carChassis);
            const chassisSize = new THREE.Vector3();
            if (!chassisBounds.isEmpty()) {
                chassisBounds.getSize(chassisSize);
            }

            const backLightAnchor = this.backLightsBrake?.object?.position?.clone() || null;
            const rearAnchor = new THREE.Vector3(
                !chassisBounds.isEmpty() ? chassisBounds.min.x - Math.max(0.24, chassisSize.x * 0.08) : -0.95,
                backLightAnchor?.y || 0,
                backLightAnchor?.z || (!chassisBounds.isEmpty()
                    ? chassisBounds.min.z + Math.max(0.24, chassisSize.z * 0.45)
                    : 0.38)
            );
            const rearDirection = rearAnchor.clone();
            rearDirection.z = 0;

            if (rearDirection.lengthSq() < 0.0001) {
                rearDirection.set(-1, 0, 0);
            } else {
                rearDirection.normalize();
            }

            const lateralDirection = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 0, 1), rearDirection);
            if (lateralDirection.lengthSq() < 0.0001) {
                lateralDirection.set(0, 1, 0);
            } else {
                lateralDirection.normalize();
            }

            const exhaustOffset = rearAnchor.clone().add(
                rearDirection.clone().multiplyScalar(Math.max(0.2, chassisSize.x * 0.04))
            );
            exhaustOffset.z += Math.max(0.03, chassisSize.z * 0.03);
            particles.position.copy(exhaustOffset);

            let isBoostActive = true; // Track if bullet is active

            const animateParticles = () => {
                if (!isBoostActive) return; // Stop animation if bullet is removed

                const positions = geometry.attributes.position.array;

                // Emit particles farther along the rear-light direction so the plume always trails the rear.
                for (let i = 0; i < particleCount; i++) {
                    const spread = (Math.random() - 0.5) * 0.12;
                    const verticalJitter = (Math.random() - 0.5) * 0.08;
                    const localMovement = rearDirection.clone().multiplyScalar(0.14 + Math.random() * 0.18);
                    localMovement.add(lateralDirection.clone().multiplyScalar(spread));
                    localMovement.z += verticalJitter;

                    positions[i * 3 + 0] += localMovement.x;
                    positions[i * 3 + 1] += localMovement.y;
                    positions[i * 3 + 2] += localMovement.z;
                }

                geometry.attributes.position.needsUpdate = true;

                requestAnimationFrame(animateParticles); // Continue animation
            };

            animateParticles(); // Start animation

            // Cleanup function to remove the fire effect when the bullet disappears
            const cleanupNitroEffect  = () => {
                isBoostActive = false; // Stop animation
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
                child.material = this.materials.shades.items.transparentLand;
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
            shooterId = bulletData.shooterId || shooterId || this.playerId;
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
        bulletBody.collisionResponse = false;
    
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

        this.createFireEffect(bullet);
    
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

        if (!bulletData && !this.isRemotePlayer && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(bulletDataToSend));

        } else if (!bulletData && !this.isRemotePlayer) {
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

    ensureBodyVisible()
    {
        if (!this.chassis?.main) {
            return;
        }

        this.chassis.main.visible = true;
        this.chassis.main.traverse((child) =>
        {
            if (!(child instanceof THREE.Mesh)) {
                return;
            }

            child.visible = true;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) =>
            {
                if (!material) {
                    return;
                }

                if (typeof material.opacity === 'number' && material.opacity === 0) {
                    material.opacity = 1;
                }
            });
        });
    }

    ensureBatteryIndicatorMesh()
    {
        if (!this.backLightsBattery?.object) {
            return;
        }

        if (!this.backLightsBattery.object.userData.roundedIndicatorReady) {
            while (this.backLightsBattery.object.children.length > 0) {
                const child = this.backLightsBattery.object.children[0];
                this.backLightsBattery.object.remove(child);

                if (child.geometry?.dispose) {
                    child.geometry.dispose();
                }
            }

            const geometry = new THREE.ExtrudeGeometry(
                createRoundedRectShape(1, 0.073, 0.0365),
                {
                    depth: 0.04,
                    bevelEnabled: false,
                    steps: 1
                }
            );
            geometry.translate(0, 0, -0.02);

            const indicatorMesh = new THREE.Mesh(geometry, this.backLightsBattery.materialRed);
            indicatorMesh.userData.baseScale = new THREE.Vector3(1, 1, 1);

            this.backLightsBattery.object.add(indicatorMesh);
            this.backLightsBattery.object.userData.roundedIndicatorReady = true;
            this.backLightsBattery.object.userData.baseWidth = 1;
        }

        this.backLightsBattery.object.traverse((child) =>
        {
            if (!(child instanceof THREE.Mesh)) {
                return;
            }

            child.visible = true;
            if (!child.userData.baseScale) {
                child.userData.baseScale = child.scale.clone();
            }
        });
    }

    getBatteryIndicatorBaseWidth()
    {
        if (!this.backLightsBattery?.object) {
            return 1;
        }

        if (this.backLightsBattery.object.userData.baseWidth) {
            return this.backLightsBattery.object.userData.baseWidth;
        }

        this.backLightsBattery.object.updateMatrixWorld(true);

        const objectInverseMatrix = this.backLightsBattery.object.matrixWorld.clone().invert();
        const localBounds = new THREE.Box3();
        let hasBounds = false;

        this.backLightsBattery.object.traverse((child) =>
        {
            if (!(child instanceof THREE.Mesh) || !child.geometry) {
                return;
            }

            if (!child.geometry.boundingBox) {
                child.geometry.computeBoundingBox();
            }

            if (!child.geometry.boundingBox) {
                return;
            }

            const baseScale = child.userData.baseScale || child.scale;
            const localMatrix = new THREE.Matrix4().compose(
                child.position.clone(),
                child.quaternion.clone(),
                baseScale.clone()
            );
            const parentMatrixWorld = child.parent?.matrixWorld || this.backLightsBattery.object.matrixWorld;
            const childBaseMatrixWorld = new THREE.Matrix4().multiplyMatrices(parentMatrixWorld, localMatrix);
            const childBounds = child.geometry.boundingBox.clone();

            childBounds.applyMatrix4(childBaseMatrixWorld);
            childBounds.applyMatrix4(objectInverseMatrix);

            if (!hasBounds) {
                localBounds.copy(childBounds);
                hasBounds = true;
            } else {
                localBounds.union(childBounds);
            }
        });

        const baseWidth = hasBounds ? Math.max(localBounds.max.x - localBounds.min.x, 0.001) : 1;
        this.backLightsBattery.object.userData.baseWidth = baseWidth;

        return baseWidth;
    }

    updateBatteryIndicatorAnchor()
    {
        if (!this.chassis?.main || !this.backLightsBattery?.object) {
            return;
        }

        this.chassis.main.updateMatrixWorld(true);

        const chassisBounds = new THREE.Box3().setFromObject(this.chassis.main);
        if (chassisBounds.isEmpty()) {
            return;
        }

        const chassisSize = new THREE.Vector3();
        chassisBounds.getSize(chassisSize);

        const anchorWorld = new THREE.Vector3();
        if (this.playerIdText) {
            this.playerIdText.getWorldPosition(anchorWorld);
            anchorWorld.z += (this.playerIdText.scale?.y || 0.55) + Math.max(0.14, chassisSize.z * 0.12);
        } else if (this.backLightsBrake?.object) {
            this.backLightsBrake.object.getWorldPosition(anchorWorld);
            anchorWorld.z = chassisBounds.max.z + Math.max(0.16, chassisSize.z * 0.18);
        } else {
            chassisBounds.getCenter(anchorWorld);
            anchorWorld.x = chassisBounds.min.x + chassisSize.x * 0.15;
            anchorWorld.z = chassisBounds.max.z + Math.max(0.16, chassisSize.z * 0.18);
        }

        const anchorLocal = this.chassis.main.worldToLocal(anchorWorld);
        this.backLightsBattery.object.position.copy(anchorLocal);
    }

    alignBatteryIndicatorToCamera()
    {
        if (!this.backLightsBattery?.object || !this.camera?.instance) {
            return;
        }

        const parent = this.backLightsBattery.object.parent;
        if (!parent) {
            return;
        }

        parent.updateMatrixWorld(true);
        this.camera.instance.updateMatrixWorld(true);

        const parentWorldQuaternion = new THREE.Quaternion();
        const cameraWorldQuaternion = new THREE.Quaternion();

        parent.getWorldQuaternion(parentWorldQuaternion);
        this.camera.instance.getWorldQuaternion(cameraWorldQuaternion);

        this.backLightsBattery.object.quaternion.copy(
            parentWorldQuaternion.invert().multiply(cameraWorldQuaternion)
        );
    }

    updateBatteryIndicatorVisual(battery = this.battery)
    {
        if (!this.backLightsBattery?.object) {
            return;
        }

        const clampedBattery = Math.max(0, Math.min(100, Number.isFinite(battery) ? battery : 100));
        const batteryRatio = clampedBattery / 100;

        this.ensureBatteryIndicatorMesh();
        this.updateBatteryIndicatorAnchor();
        this.alignBatteryIndicatorToCamera();

        const indicatorColor = new THREE.Color().setRGB(1 - batteryRatio, batteryRatio, 0.2);
        const scaleRatio = Math.max(0.08, batteryRatio);
        const baseIndicatorWidth = this.getBatteryIndicatorBaseWidth();
        const targetIndicatorWidth = Math.max(
            0.001,
            (this.playerIdText?.scale?.x || baseIndicatorWidth) * scaleRatio
        );
        const widthScaleFactor = targetIndicatorWidth / baseIndicatorWidth;

        this.backLightsBattery.object.traverse((child) =>
        {
            if (!(child instanceof THREE.Mesh)) {
                return;
            }

            const baseScale = child.userData.baseScale || child.scale;
            child.scale.set(baseScale.x * widthScaleFactor, baseScale.y, baseScale.z);
            child.visible = true;

            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) =>
            {
                if (!material) {
                    return;
                }

                if ('color' in material && material.color) {
                    material.color.copy(indicatorColor);
                }

                material.transparent = true;
                material.opacity = clampedBattery > 0 ? 0.95 : 0.45;
                material.depthTest = false;
                material.depthWrite = false;
                material.side = THREE.DoubleSide;
            });
        });

        this.backLightsBattery.object.renderOrder = 1000;

        this.updateBatteryPosition();
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
                    // console.log(`Chassis model children for ${carName}:`);
                    this.models.chassis.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeMetal';
                        }
                    });
                } else {
                    console.warn('Chassis model is not defined or missing scene');
                }

                this.models.bottom = this.resources.items.chargerDefaultChassisBottom; // Bottom part

                if (this.models.bottom && this.models.bottom.scene) {
                    // console.log(`Bottom model children for ${carName}:`);
                    this.models.bottom.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            if (matcaps.chassisbottom) {
                                const matcapName = matcaps.chassisbottom;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Bottom model is not defined or missing scene');
                }

                this.models.window = this.resources.items.chargerDefaultWindow; // Window
                    if (this.models.window && this.models.window.scene) {
                        // console.log(`Window model children for ${carName}:`);
                        this.models.window.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                child.name = 'shadeBlack';
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
                            // console.log(`Wheel model children for ${carName}:`);
                            this.models.wheel.scene.traverse((child) => {
                                if (child instanceof THREE.Mesh) {
                                    // console.log(`Original Child Name: ${child.name}`);
                                    
                                    // Check if the child name matches 'wheels' and matcaps.wheels is available
                                    if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                        const matcapName = matcaps.wheels;
                                        const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                        child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                        // console.log(`Updated Child Name: ${child.name}`);
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
                // Ensure the chassis model is defined and log its children
                if (this.models.chassis && this.models.chassis.scene) {
                    // console.log(`Chassis model children for ${carName}:`);
                    this.models.chassis.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeMetal';
                        }
                    });
                } else {
                    console.warn('Chassis model is not defined or missing scene');
                }

                this.models.bottom = this.resources.items.wreckslingerChassisBottom;
                if (this.models.bottom && this.models.bottom.scene) {
                    // console.log(`Bottom model children for ${carName}:`);
                    this.models.bottom.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            if (matcaps.chassisbottom) {
                                const matcapName = matcaps.chassisbottom;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Bottom model is not defined or missing scene');
                }

                this.models.window = this.resources.items.wreckslingerWindow;
                if (this.models.window && this.models.window.scene) {
                    // console.log(`Window model children for ${carName}:`);
                    this.models.window.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeBlack';
                        }
                    });
                } else {
                    console.warn('Window model is not defined or missing scene');
                }

                this.models.antena = this.resources.items.wreckslingerAntena;
                this.models.headLights = this.resources.items.wreckslingerHeadlights;
                this.models.backLightsBrake = this.resources.items.wreckslingerBacklights;
                this.models.backLightsReverse = this.resources.items.wreckslingerBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;

                this.models.wheel = this.resources.items.wreckslingerWheels;
                if (this.models.wheel && this.models.wheel.scene) {
                    // console.log(`Wheel model children for ${carName}:`);
                    this.models.wheel.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
                            
                            // Check if the child name matches 'wheels' and matcaps.wheels is available
                            if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                const matcapName = matcaps.wheels;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Wheel model is not defined or missing scene');
                }
    
                console.log("Setting Wreckslinger")
                break;

            case 'Gangover':
                this.models.chassis = this.resources.items.gangoverChassis;
                // Ensure the chassis model is defined and log its children
                if (this.models.chassis && this.models.chassis.scene) {
                    // console.log(`Chassis model children for ${carName}:`);
                    this.models.chassis.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeMetal';
                        }
                    });
                } else {
                    console.warn('Chassis model is not defined or missing scene');
                }

                this.models.bottom = this.resources.items.gangoverChassisBottom;
                if (this.models.bottom && this.models.bottom.scene) {
                    // console.log(`Bottom model children for ${carName}:`);
                    this.models.bottom.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            if (matcaps.chassisbottom) {
                                const matcapName = matcaps.chassisbottom;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Bottom model is not defined or missing scene');
                }

                this.models.window = this.resources.items.gangoverWindows;
                if (this.models.window && this.models.window.scene) {
                    // console.log(`Window model children for ${carName}:`);
                    this.models.window.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeBlack';
                        }
                    });
                } else {
                    console.warn('Window model is not defined or missing scene');
                }

                this.models.antena = this.resources.items.gangoverAntena;
                this.models.headLights = this.resources.items.gangoverHeadlights;
                this.models.headLightsPart = this.resources.items.gangoverHeadlightsPart;
                this.models.backLightsBrake = this.resources.items.gangoverBacklights;
                this.models.backLightsReverse = this.resources.items.gangoverBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;
    
                this.models.wheel = this.resources.items.gangoverWheels;
                if (this.models.wheel && this.models.wheel.scene) {
                    // console.log(`Wheel model children for ${carName}:`);
                    this.models.wheel.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
                            
                            // Check if the child name matches 'wheels' and matcaps.wheels is available
                            if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                const matcapName = matcaps.wheels;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Wheel model is not defined or missing scene');
                }

                console.log("Setting Wreckslinger")
                break;

            case 'McLaren':
                this.models.chassis = this.resources.items.mclarenChassis;
                // Ensure the chassis model is defined and log its children
                if (this.models.chassis && this.models.chassis.scene) {
                    // console.log(`Chassis model children for ${carName}:`);
                    this.models.chassis.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeMetal';
                        }
                    });
                } else {
                    console.warn('Chassis model is not defined or missing scene');
                }

                this.models.bottom = this.resources.items.mclarenChassisBottom;
                if (this.models.bottom && this.models.bottom.scene) {
                    // console.log(`Bottom model children for ${carName}:`);
                    this.models.bottom.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            if (matcaps.chassisbottom) {
                                const matcapName = matcaps.chassisbottom;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Bottom model is not defined or missing scene');
                }
                
                this.models.window = this.resources.items.mclarenWindows;
                if (this.models.window && this.models.window.scene) {
                    // console.log(`Window model children for ${carName}:`);
                    this.models.window.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeBlack';
                        }
                    });
                } else {
                    console.warn('Window model is not defined or missing scene');
                }

                this.models.antena = this.resources.items.mclarenAntena;
                this.models.headLights = this.resources.items.mclarenHeadlights;
                this.models.backLightsBrake = this.resources.items.mclarenBacklights;
                this.models.backLightsReverse = this.resources.items.mclarenBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;

                this.models.wheel = this.resources.items.mclarenWheels;
                if (this.models.wheel && this.models.wheel.scene) {
                    // console.log(`Wheel model children for ${carName}:`);
                    this.models.wheel.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
                            
                            // Check if the child name matches 'wheels' and matcaps.wheels is available
                            if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                const matcapName = matcaps.wheels;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Wheel model is not defined or missing scene');
                }
    
                console.log("Setting McLaren")
                break;

            case '240 GTI':
                this.models.chassis = this.resources.items.gtiChassis;
                // Ensure the chassis model is defined and log its children
                if (this.models.chassis && this.models.chassis.scene) {
                    // console.log(`Chassis model children for ${carName}:`);
                    this.models.chassis.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeMetal';
                        }
                    });
                } else {
                    console.warn('Chassis model is not defined or missing scene');
                }

                this.models.bottom = this.resources.items.gtiChassisBottom;
                if (this.models.bottom && this.models.bottom.scene) {
                    // console.log(`Bottom model children for ${carName}:`);
                    this.models.bottom.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            if (matcaps.chassisbottom) {
                                const matcapName = matcaps.chassisbottom;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Bottom model is not defined or missing scene');
                }
                
                this.models.window = this.resources.items.gtiWindows;
                if (this.models.window && this.models.window.scene) {
                    // console.log(`Window model children for ${carName}:`);
                    this.models.window.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeBlack';
                        }
                    });
                } else {
                    console.warn('Window model is not defined or missing scene');
                }
                
                this.models.antena = this.resources.items.gtiAntena;
                this.models.headLights = this.resources.items.gtiHeadlights;
                this.models.backLightsBrake = this.resources.items.gtiBacklights;
                this.models.backLightsReverse = this.resources.items.gtiBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;

                this.models.wheel = this.resources.items.gtiWheels;
                if (this.models.wheel && this.models.wheel.scene) {
                    // console.log(`Wheel model children for ${carName}:`);
                    this.models.wheel.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
                            
                            // Check if the child name matches 'wheels' and matcaps.wheels is available
                            if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                const matcapName = matcaps.wheels;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Wheel model is not defined or missing scene');
                }
    
    
                console.log("Setting McLaren")
                break;

            case 'Howler Packard':
                this.models.chassis = this.resources.items.howlerChassis;
                // Ensure the chassis model is defined and log its children
                if (this.models.chassis && this.models.chassis.scene) {
                    // console.log(`Chassis model children for ${carName}:`);
                    this.models.chassis.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeMetal';
                        }
                    });
                } else {
                    console.warn('Chassis model is not defined or missing scene');
                }

                this.models.bottom = this.resources.items.howlerChassisBottom;
                if (this.models.bottom && this.models.bottom.scene) {
                    // console.log(`Bottom model children for ${carName}:`);
                    this.models.bottom.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            if (matcaps.chassisbottom) {
                                const matcapName = matcaps.chassisbottom;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Bottom model is not defined or missing scene');
                }

                this.models.antena = this.resources.items.howlerAntena;
                this.models.headLights = this.resources.items.howlerHeadlights;
                this.models.headLightsPart = this.resources.items.howlerHeadlightsPart;
                this.models.backLightsBrake = this.resources.items.howlerBacklights;
                this.models.backLightsReverse = this.resources.items.howlerBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;

                this.models.wheel = this.resources.items.howlerWheels;
                if (this.models.wheel && this.models.wheel.scene) {
                    // console.log(`Wheel model children for ${carName}:`);
                    this.models.wheel.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
                            
                            // Check if the child name matches 'wheels' and matcaps.wheels is available
                            if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                const matcapName = matcaps.wheels;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Wheel model is not defined or missing scene');
                }
        
                console.log("Howler Packard")
                break;

            case 'RC TraxShark':
                this.models.chassis = this.resources.items.rcTruckChassis;
                // Ensure the chassis model is defined and log its children
                if (this.models.chassis && this.models.chassis.scene) {
                    // console.log(`Chassis model children for ${carName}:`);
                    this.models.chassis.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeMetal';
                        }
                    });
                } else {
                    console.warn('Chassis model is not defined or missing scene');
                }

                this.models.bottom = this.resources.items.rcTruckChassisBottom; // Bottom part
                    if (this.models.bottom && this.models.bottom.scene) {
                        // console.log(`Bottom model children for ${carName}:`);
                        this.models.bottom.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                if (matcaps.chassisbottom) {
                                    const matcapName = matcaps.chassisbottom;
                                    const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                    child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                    // console.log(`Updated Child Name: ${child.name}`);
                                }
                            }
                        });
                    } else {
                        console.warn('Bottom model is not defined or missing scene');
                    }

                    this.models.window = this.resources.items.rcTruckWindow; // Window
                    if (this.models.window && this.models.window.scene) {
                        // console.log(`Window model children for ${carName}:`);
                        this.models.window.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                child.name = 'shadeBlack';
                            }
                        });
                    } else {
                        console.warn('Window model is not defined or missing scene');
                    }
                
                this.models.antena = this.resources.items.rcTruckAntena;
                this.models.headLights = this.resources.items.rcTruckHeadlights;
                this.models.backLightsBrake = this.resources.items.rcTruckBacklights;
                this.models.backLightsReverse = this.resources.items.rcTruckBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;

                this.models.wheel = this.resources.items.rcTruckWheels;
                if (this.models.wheel && this.models.wheel.scene) {
                    // console.log(`Wheel model children for ${carName}:`);
                    this.models.wheel.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
                            
                            // Check if the child name matches 'wheels' and matcaps.wheels is available
                            if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                const matcapName = matcaps.wheels;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Wheel model is not defined or missing scene');
                }
            
                console.log("RC TraxShark")
                break;

            case 'Pusher Crowd':
                this.models.chassis = this.resources.items.pusherCrowdChassis;
                // Ensure the chassis model is defined and log its children
                if (this.models.chassis && this.models.chassis.scene) {
                    // console.log(`Chassis model children for ${carName}:`);
                    this.models.chassis.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeMetal';
                        }
                    });
                } else {
                    console.warn('Chassis model is not defined or missing scene');
                }

                this.models.bottom = this.resources.items.pusherCrowdChassisBottom; // Bottom part
                    if (this.models.bottom && this.models.bottom.scene) {
                        // console.log(`Bottom model children for ${carName}:`);
                        this.models.bottom.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                if (matcaps.chassisbottom) {
                                    const matcapName = matcaps.chassisbottom;
                                    const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                    child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                    // console.log(`Updated Child Name: ${child.name}`);
                                }
                            }
                        });
                    } else {
                        console.warn('Bottom model is not defined or missing scene');
                    }

                    this.models.window = this.resources.items.pusherCrowdWindow; // Window
                    if (this.models.window && this.models.window.scene) {
                        // console.log(`Window model children for ${carName}:`);
                        this.models.window.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                child.name = 'shadeBlack';
                            }
                        });
                    } else {
                        console.warn('Window model is not defined or missing scene');
                    }

                this.models.antena = this.resources.items.pusherCrowdAntena;
                this.models.headLights = this.resources.items.pusherCrowdHeadlights;
                this.models.backLightsBrake = this.resources.items.pusherCrowdBacklights;
                this.models.backLightsReverse = this.resources.items.pusherCrowdBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;

                this.models.wheel = this.resources.items.pusherCrowdWheels;
                if (this.models.wheel && this.models.wheel.scene) {
                    // console.log(`Wheel model children for ${carName}:`);
                    this.models.wheel.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
                            
                            // Check if the child name matches 'wheels' and matcaps.wheels is available
                            if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                const matcapName = matcaps.wheels;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Wheel model is not defined or missing scene');
                }
                
                console.log("Pusher Crowd")
                break;

            case 'Impactus':
                this.models.chassis = this.resources.items.impactusChassis;
                // Ensure the chassis model is defined and log its children
                if (this.models.chassis && this.models.chassis.scene) {
                    // console.log(`Chassis model children for ${carName}:`);
                    this.models.chassis.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeMetal';
                        }
                    });
                } else {
                    console.warn('Chassis model is not defined or missing scene');
                }

                this.models.bottom = this.resources.items.impactusChassisBottom; // Bottom part
                    if (this.models.bottom && this.models.bottom.scene) {
                        // console.log(`Bottom model children for ${carName}:`);
                        this.models.bottom.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                if (matcaps.chassisbottom) {
                                    const matcapName = matcaps.chassisbottom;
                                    const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                    child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                    // console.log(`Updated Child Name: ${child.name}`);
                                }
                            }
                        });
                    } else {
                        console.warn('Bottom model is not defined or missing scene');
                    }

                    this.models.window = this.resources.items.impactusWindow; // Window
                    if (this.models.window && this.models.window.scene) {
                        // console.log(`Window model children for ${carName}:`);
                        this.models.window.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                child.name = 'shadeBlack';
                            }
                        });
                    } else {
                        console.warn('Window model is not defined or missing scene');
                    }

                this.models.antena = this.resources.items.impactusAntena;
                this.models.headLights = this.resources.items.impactusHeadlights;
                this.models.backLightsBrake = this.resources.items.impactusBacklights;
                this.models.backLightsReverse = this.resources.items.impactusBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;

                this.models.wheel = this.resources.items.impactusWheels;
                if (this.models.wheel && this.models.wheel.scene) {
                    // console.log(`Wheel model children for ${carName}:`);
                    this.models.wheel.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
                            
                            // Check if the child name matches 'wheels' and matcaps.wheels is available
                            if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                const matcapName = matcaps.wheels;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Wheel model is not defined or missing scene');
                }
                    
                console.log("Impactus")
                break;

            case 'Crushinator':
                this.models.chassis = this.resources.items.zimbowChassis;
                // Ensure the chassis model is defined and log its children
                if (this.models.chassis && this.models.chassis.scene) {
                    // console.log(`Chassis model children for ${carName}:`);
                    this.models.chassis.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeMetal';
                        }
                    });
                } else {
                    console.warn('Chassis model is not defined or missing scene');
                }

                this.models.bottom = this.resources.items.zimbowChassisBottom; // Bottom part
                    if (this.models.bottom && this.models.bottom.scene) {
                        // console.log(`Bottom model children for ${carName}:`);
                        this.models.bottom.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                if (matcaps.chassisbottom) {
                                    const matcapName = matcaps.chassisbottom;
                                    const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                    child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                    // console.log(`Updated Child Name: ${child.name}`);
                                }
                            }
                        });
                    } else {
                        console.warn('Bottom model is not defined or missing scene');
                    }

                    this.models.window = this.resources.items.zimbowWindow; // Window
                    if (this.models.window && this.models.window.scene) {
                        // console.log(`Window model children for ${carName}:`);
                        this.models.window.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                child.name = 'shadeBlack';
                            }
                        });
                    } else {
                        console.warn('Window model is not defined or missing scene');
                    }

                this.models.antena = this.resources.items.zimbowAntena;
                this.models.headLights = this.resources.items.zimbowHeadlights;
                this.models.backLightsBrake = this.resources.items.zimbowBacklights;
                this.models.backLightsReverse = this.resources.items.zimbowBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;

                this.models.wheel = this.resources.items.zimbowWheels;
                if (this.models.wheel && this.models.wheel.scene) {
                    // console.log(`Wheel model children for ${carName}:`);
                    this.models.wheel.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
                            
                            // Check if the child name matches 'wheels' and matcaps.wheels is available
                            if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                const matcapName = matcaps.wheels;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Wheel model is not defined or missing scene');
                }
                        
                console.log("Impactus")
                break;

            case 'Goodwing':
                this.models.chassis = this.resources.items.goodwingChassis;
                // Ensure the chassis model is defined and log its children
                if (this.models.chassis && this.models.chassis.scene) {
                    // console.log(`Chassis model children for ${carName}:`);
                    this.models.chassis.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
            
                            // Rename child.name to match the retrieved matcap key
                            child.name = 'shadeMetal';
                        }
                    });
                } else {
                    console.warn('Chassis model is not defined or missing scene');
                }

                this.models.bottom = this.resources.items.goodwingChassisBottom; // Bottom part
                    if (this.models.bottom && this.models.bottom.scene) {
                        // console.log(`Bottom model children for ${carName}:`);
                        this.models.bottom.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                if (matcaps.chassisbottom) {
                                    const matcapName = matcaps.chassisbottom;
                                    const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                    child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                    // console.log(`Updated Child Name: ${child.name}`);
                                }
                            }
                        });
                    } else {
                        console.warn('Bottom model is not defined or missing scene');
                    }

                    this.models.window = this.resources.items.goodwingWindow; // Window
                    if (this.models.window && this.models.window.scene) {
                        // console.log(`Window model children for ${carName}:`);
                        this.models.window.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                child.name = 'shadeBlack';
                            }
                        });
                    } else {
                        console.warn('Window model is not defined or missing scene');
                    }

                this.models.antena = this.resources.items.goodwingAntena;
                this.models.headLights = this.resources.items.goodwingHeadlights;
                this.models.backLightsBrake = this.resources.items.goodwingBacklights;
                this.models.backLightsReverse = this.resources.items.goodwingBacklightsReverse;
                this.models.backLightsBattery = this.resources.items.carDefaultBackLightsBattery;

                this.models.wheel = this.resources.items.goodwingWheels;
                if (this.models.wheel && this.models.wheel.scene) {
                    // console.log(`Wheel model children for ${carName}:`);
                    this.models.wheel.scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            // console.log(`Original Child Name: ${child.name}`);
                            
                            // Check if the child name matches 'wheels' and matcaps.wheels is available
                            if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                const matcapName = matcaps.wheels;
                                const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                // console.log(`Updated Child Name: ${child.name}`);
                            }
                        }
                    });
                } else {
                    console.warn('Wheel model is not defined or missing scene');
                }
                            
                console.log("Goodwing")
                break;
    
                default:
                    if (!this.models.chassis) {
                        // Fallback to default car models if carName doesn't match
                        this.models.chassis = this.resources.items.carDefaultChassis; // Main chassis
                    
                        // Ensure the chassis model is defined and log its children
                        if (this.models.chassis && this.models.chassis.scene) {
                            // console.log(`Chassis model children for ${carName}:`);
                            this.models.chassis.scene.traverse((child) => {
                                if (child instanceof THREE.Mesh) {
                                    // console.log(`Original Child Name: ${child.name}`);
                    
                                    // Rename child.name to match the retrieved matcap key
                                    child.name = 'shadeMetal';
                                }
                            });
                        } else {
                            console.warn('Chassis model is not defined or missing scene');
                        }
                    }
                
                    this.models.bottom = this.resources.items.carDefaultChassisBottom; // Bottom part
                    if (this.models.bottom && this.models.bottom.scene) {
                        // console.log(`Bottom model children for ${carName}:`);
                        this.models.bottom.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                if (matcaps.chassisbottom) {
                                    const matcapName = matcaps.chassisbottom;
                                    const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1); // Capitalize the first letter
                                    child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                    // console.log(`Updated Child Name: ${child.name}`);
                                }
                            }
                        });
                    } else {
                        console.warn('Bottom model is not defined or missing scene');
                    }
                
                    this.models.window = this.resources.items.carDefaultWindow; // Window
                    if (this.models.window && this.models.window.scene) {
                        // console.log(`Window model children for ${carName}:`);
                        this.models.window.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                child.name = 'shadeBlack';
                            }
                        });
                    } else {
                        console.warn('Window model is not defined or missing scene');
                    }
                
                    this.models.spoiler = this.resources.items.carDefaultSpoiler; // Spoiler
                    if (this.models.spoiler && this.models.spoiler.scene) {
                        // console.log(`Spoiler model children for ${carName}:`);
                        this.models.spoiler.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                // console.log(`Original Child Name: ${child.name}`);
                
                                // Rename child.name to match the retrieved matcap key
                                if (matcaps.spoiler) {
                                    const matcapName = matcaps.spoiler;
                                    const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                    child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                    // console.log(`Updated Child Name: ${child.name}`);
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
                            // console.log(`Wheel model children for ${carName}:`);
                            this.models.wheel.scene.traverse((child) => {
                                if (child instanceof THREE.Mesh) {
                                    // console.log(`Original Child Name: ${child.name}`);
                                    
                                    // Check if the child name matches 'wheels' and matcaps.wheels is available
                                    if (child.name.toLowerCase().includes('wheels') && matcaps.wheels) {
                                        const matcapName = matcaps.wheels;
                                        const formattedMatcapName = matcapName.charAt(0).toUpperCase() + matcapName.slice(1);
                                        child.name = `shade${formattedMatcapName}`; // Update child name to match matcap name
                                        // console.log(`Updated Child Name: ${child.name}`);
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

            this.handleNitroEffect();

            if (!this.isRemotePlayer) {
                this.updateSpeedometer();
                this.handleSirenEffect();
            }
    
            // Handle screech sound
            // if (this.movement.localAcceleration.x > 0.03 && this.time.elapsed - this.movement.lastScreech > 5000) {
            //     this.movement.lastScreech = this.time.elapsed;
            //     this.sounds.play('screech');
            // }
        });
    }

    updateSpeedometer() {
        const bodyVelocity = this.physics?.car?.chassis?.body?.velocity
        const horizontalSpeedMetersPerSecond = bodyVelocity
            ? Math.hypot(bodyVelocity.x, bodyVelocity.y)
            : Math.hypot(this.movement.speed.x, this.movement.speed.y)
        const targetSpeedMph = Math.max(0, horizontalSpeedMetersPerSecond * 2.236936)

        if(typeof this.speedometerDisplaySpeed !== 'number')
        {
            this.speedometerDisplaySpeed = targetSpeedMph
        }
        else
        {
            this.speedometerDisplaySpeed = THREE.MathUtils.lerp(this.speedometerDisplaySpeed, targetSpeedMph, 0.22)
        }

        const maxSpeed = 180
        const speedPercentage = Math.min(this.speedometerDisplaySpeed / maxSpeed, 1)
    
        const needle = document.getElementById('needle');
        const speedValue = document.getElementById('speed-value');
        if (needle && speedValue) {
            const rotation = speedPercentage * 180 - 100; // Convert speed to needle rotation (0 to 180 degrees)
            needle.style.transform = `rotate(${rotation}deg)`;
            speedValue.textContent = Math.round(this.speedometerDisplaySpeed); // Display actual speed value
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
        const subParts = ["bottom", "spoiler", "window", "headLightsPart"];
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
        this.chassis.object.updateMatrixWorld(true);

        this.chassis.cameraTarget = new THREE.Object3D();
        const chassisBounds = new THREE.Box3().setFromObject(this.chassis.main);
        const chassisCenter = new THREE.Vector3();

        if(chassisBounds.isEmpty())
        {
            chassisCenter.set(0, 0, 0.35);
        }
        else
        {
            chassisBounds.getCenter(chassisCenter);
            this.chassis.main.worldToLocal(chassisCenter);
        }

        this.chassis.localBounds = getObjectLocalBounds(this.chassis.main);
        this.chassis.size = new THREE.Vector3();
        if (!this.chassis.localBounds.isEmpty()) {
            this.chassis.localBounds.getSize(this.chassis.size);
        }

        this.chassis.cameraTarget.position.copy(chassisCenter);
        this.chassis.main.add(this.chassis.cameraTarget);
    
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
        this.headLights = {}
        this.lightBlink = {
            active: false,
            startedAt: 0,
            phaseDurationMs: 140,
            totalPhases: 10
        }

        this.backLightsBrake.material = this.materials.pures.items.red.clone()
        this.backLightsBrake.material.transparent = true
        this.backLightsBrake.material.opacity = 0.5

        this.headLights.material = this.materials.pures.items.white.clone()
        this.headLights.material.transparent = true
        this.headLights.material.opacity = 0.1

        this.backLightsBrake.object = this.objects.getConvertedMesh(this.models.backLightsBrake.scene.children)
        this.backLightsBrake.object.traverse((_child) =>
        {
            if(_child instanceof THREE.Mesh)
            {
                _child.material = this.backLightsBrake.material
                _child.visible = true
            }
        })

        this.headLights.object = this.objects.getConvertedMesh(this.models.headLights.scene.children)
        this.headLights.object.traverse((_child) =>
        {
            if(_child instanceof THREE.Mesh)
            {
                _child.material = this.headLights.material
                _child.visible = true
            }
        })

        this.chassis.object.add(this.backLightsBrake.object)
        this.chassis.object.add(this.headLights.object)

        // Back lights brake
        this.backLightsReverse = {}

        this.backLightsReverse.material = this.materials.pures.items.white.clone()
        this.backLightsReverse.material.transparent = true
        this.backLightsReverse.material.opacity = 0.5

        this.backLightsReverse.object = this.objects.getConvertedMesh(this.models.backLightsReverse.scene.children)
        this.backLightsReverse.object.traverse((_child) =>
        {
            if(_child instanceof THREE.Mesh)
            {
                _child.material = this.backLightsReverse.material
                _child.visible = true
            }
        })

        this.chassis.object.add(this.backLightsReverse.object)

         // Back lights battery
        this.backLightsBattery = {}

        this.backLightsBattery.materialRed = this.materials.pures.items.red.clone()
        this.backLightsBattery.materialWhite = this.materials.pures.items.white.clone()
        this.backLightsBattery.materialRed.transparent = true
        this.backLightsBattery.materialRed.opacity = 0
        this.backLightsBattery.materialWhite.transparent = true
        this.backLightsBattery.materialWhite.opacity = 0

        this.backLightsBattery.object = this.objects.getConvertedMesh(this.models.backLightsBattery.scene.children)
        for(const _child of this.backLightsBattery.object.children)
        {
            _child.material = this.backLightsBattery.materialRed
        }

        this.backLightsBattery.baseRotation = this.backLightsBattery.object.rotation.clone()
        this.chassis.object.add(this.backLightsBattery.object)

        // Initialize battery status in three.js vector
        this.batteryVector = new THREE.Vector3(0, 0, 0); // Ensure batteryVector is a THREE.Vector3 instance
        this.chassis.object.add(new THREE.Object3D()); // Add an Object3D instance as a parent for the batteryVector
        // this.chassis.object.add(this.batteryVector);

        // Time tick
        this.time.on('tick', () =>
            {
                const blinkPhase = Math.floor((performance.now() - this.lightBlink.startedAt) / this.lightBlink.phaseDurationMs)
                const isBlinking = this.lightBlink.active && blinkPhase < this.lightBlink.totalPhases

                if(this.lightBlink.active && !isBlinking)
                {
                    this.lightBlink.active = false
                }

                if(isBlinking)
                {
                    const lightsOn = blinkPhase % 2 === 0
                    this.backLightsBrake.material.opacity = lightsOn ? 1 : 0.1
                    this.backLightsReverse.material.opacity = lightsOn ? 1 : 0.1
                    this.headLights.material.opacity = lightsOn ? 1 : 0.1
                }
                else
                {
                    this.backLightsBrake.material.opacity = this.physics.controls.actions.brake ? 1 : 0.5
                    this.backLightsReverse.material.opacity = this.physics.controls.actions.down ? 1 : 0.5
                    this.headLights.material.opacity = this.physics.controls.actions.up ? 1 : 0.1
                }

                this.updateBatteryIndicatorVisual(this.battery);
            })
    }

    setWheels()
    {
        this.wheels = {}
        this.wheels.object = this.objects.getConvertedMesh(this.models.wheel.scene.children)
        this.wheels.items = []
        this.wheels.targetQuaternions = []
        this.wheels.visualSteeringSmoothing = 0.32

        for(let i = 0; i < 4; i++)
        {
            const object = this.wheels.object.clone()

            this.wheels.items.push(object)
            this.wheels.targetQuaternions.push(new THREE.Quaternion())
            this.container.add(object)
        }

        // Time tick
        this.time.on('tick', () =>
        {
            if(!this.transformControls.enabled)
            {
                const wheelIndexes = this.physics.car.wheels.indexes
                const frontLeftIndex = wheelIndexes?.frontLeft
                const frontRightIndex = wheelIndexes?.frontRight
                const smoothingFactor = Math.min(1, Math.max(this.wheels.visualSteeringSmoothing, this.time.delta * 0.02))

                for(const _wheelKey in this.physics.car.wheels.bodies)
                {
                    const wheelIndex = Number(_wheelKey)
                    const wheelBody = this.physics.car.wheels.bodies[_wheelKey]
                    const wheelObject = this.wheels.items[_wheelKey]
                    const targetQuaternion = this.wheels.targetQuaternions[_wheelKey]
                    const isFrontWheel = wheelIndex === frontLeftIndex || wheelIndex === frontRightIndex

                    wheelObject.position.copy(wheelBody.position)

                    targetQuaternion.set(
                        wheelBody.quaternion.x,
                        wheelBody.quaternion.y,
                        wheelBody.quaternion.z,
                        wheelBody.quaternion.w
                    )

                    if(isFrontWheel)
                    {
                        if(wheelObject.userData.quaternionInitialized)
                        {
                            wheelObject.quaternion.slerp(targetQuaternion, smoothingFactor)
                        }
                        else
                        {
                            wheelObject.quaternion.copy(targetQuaternion)
                            wheelObject.userData.quaternionInitialized = true
                        }
                    }
                    else
                    {
                        wheelObject.quaternion.copy(targetQuaternion)
                    }
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
