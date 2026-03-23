import * as THREE from 'three'
import * as dat from 'dat.gui'

import { useEffect, useRef } from 'react';

import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import World from './World/index.js'
import Resources from './Resources.js'
import Camera from './Camera.js'
import gsap from 'gsap'
import { TweenLite } from 'gsap/TweenLite'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import BlurPass from './Passes/Blur.js'
import GlowsPass from './Passes/Glows.js'

// Main Application as a React component
const Application = ({ playerId, selectedWorldId, token, carName, matcaps }) => {
    const canvasRef = useRef(null);
    const appInstanceRef = useRef(null);
  
    useEffect(() => {
      // Ensure Three.js only runs on the client side
      if (typeof window === 'undefined' || !canvasRef.current) {
        return;
      }
  
      const canvasElement = canvasRef.current;
  
      // Application class logic wrapped inside a function
      const app = new (class Application {
        constructor(_options) {
          this.$canvas = _options.$canvas;
          this.playerId = _options.playerId;
          this.worldId = selectedWorldId;
          this.token = token;
          this.carName = carName;
          this.matcaps = matcaps;

        //   console.log("CAR NAME APP:", this.matcaps);
  
          this.time = new Time();
          this.sizes = new Sizes();
          this.resources = new Resources();
          this.setConfig();
          this.setDebug();
          this.setRenderer();
          this.setCamera();
          this.setPasses();
          this.setWorld(this.worldId, this.carName, this.matcaps);
          this.animate();

          // Resize canvas when window size changes
          this.sizes.on('resize', this.resizeCanvas.bind(this));
          this.resizeCanvas(); // Set initial size        
        }

    /**
     * Set config
     */
    setConfig() {
        this.config = {}
        
        // Check if we're running on the client (where 'window' is defined)
        if (typeof window !== 'undefined') {
            this.config.debug = window.location.hash === '#debug';
            this.config.cyberTruck = window.location.hash === '#cybertruck';
            this.config.touch = false;
    
            window.addEventListener('touchstart', () => {
                this.config.touch = true;
                if (this.world && this.world.controls) {
                    this.world.controls.setTouch();
                }
    
                // this.passes.horizontalBlurPass.strength = 1;
                // this.passes.horizontalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(this.passes.horizontalBlurPass.strength, 0);
                // this.passes.verticalBlurPass.strength = 1;
                // this.passes.verticalBlurPass.material.uniforms.uStrength.value = new THREE.Vector2(0, this.passes.verticalBlurPass.strength);
            }, { once: true });
        }
    }    

    /**
     * Set debug
     */
    setDebug()
    {
        if(this.config.debug)
        {
            this.debug = new dat.GUI({ width: 420 })
        }
    }

    /**
     * Set renderer
     */
    setRenderer()
    {
        // Scene
        this.scene = new THREE.Scene()

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.$canvas,
            alpha: true,
            powerPreference: 'high-performance',
            antialias: true
        })
        // this.renderer.setClearColor(0x414141, 1)
        this.renderer.setClearColor(0x000000, 1)
        // this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2))
        // this.renderer.setPixelRatio(2)
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
        this.renderer.autoClear = false

        // Enable shadow map
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
        })
    }

    /**
    * Resize canvas based on viewport
    */
    resizeCanvas() {
        const { width, height } = this.sizes.viewport;
        this.renderer.setSize(width, height);

        if (this.camera && this.camera.instance) {
            this.camera.instance.aspect = width / height;
            this.camera.instance.updateProjectionMatrix();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.camera) {
            this.camera.pan.reset();
        }

        // Update the clock hands in each frame
        if (this.world.clockContainer) {
            this.world.updateClock();
        }

        this.renderer.render(this.scene, this.camera.instance)
    }

    /**
     * Set camera
     */
    // setCamera() {
    //     this.camera = new Camera({
    //         time: this.time,
    //         sizes: this.sizes,
    //         renderer: this.renderer,
    //         debug: this.debug,
    //         config: this.config,
    //         car: this.car
    //     });
        
    //     this.scene.add(this.camera.container);
        
    //     this.time.on('tick', () => {
    //         if (this.world && this.world.car) {

                
    //             // Update camera target position to match the car's position
    //             this.camera.target.x = this.world.car.chassis.object.position.x;
    //             this.camera.target.y = this.world.car.chassis.object.position.y;
    //             this.camera.target.z = this.world.car.chassis.object.position.z;
                
    //             // Handle car's rotation (quaternion) for better camera tracking
    //             // const carQuaternion = this.world.car.chassis.object.quaternion;
    //             // const cameraDistance = 10; // Distance between the car and the camera, adjust as needed

    //             // Offset the camera based on the car's rotation (apply quaternion to offset)
    //             // const offset = new THREE.Vector3(0, -cameraDistance, 5); // Offset the camera behind and above the car
    //             // offset.applyQuaternion(carQuaternion);

    //             // Set camera position based on the car's position and the offset
    //             // this.camera.instance.position.copy(this.world.car.chassis.object.position).add(offset);

    //             // Look at the car to keep it centered in the camera view
    //             this.camera.instance.lookAt(this.world.car.chassis.object.position);
    //         }

    //         // Key event listener for camera action
    //         document.addEventListener('keydown', (e) => {
    //             if (e.key === 'Y' || e.key === 'y') {
    //                 this.camera.triggerCameraAction();
    //             }
    //         });
    //     });
    // }

    // /**
    //  * Set camera
    //  */
    // setCamera() {
    //     this.camera = new Camera({
    //         time: this.time,
    //         sizes: this.sizes,
    //         renderer: this.renderer,
    //         debug: this.debug,
    //         config: this.config,
    //         car: this.car
    //     });

    //     this.scene.add(this.camera.container);

    //     // Set the initial camera mode
    //     this.camera.isNewCameraActive = false; // Start with the old version
    //     this.camera.actionInProgress = false; // Track if a camera action is in progress

    //     this.time.on('tick', () => {
    //         if (this.world && this.world.car) {
    //             const chassisObject = this.world.car.chassis.object;
        
    //             if (this.camera.isNewCameraActive) {
    //                 // New camera logic with maximum zoom out
    //                 const forwardVector = new THREE.Vector3(1, 0, 0);
    //                 forwardVector.applyQuaternion(chassisObject.quaternion);

    //                 // Adjust for maximum zoom out
    //                 const maxZoomOutOffset = -30; // Adjust this value for the desired zoom-out distance
    //                 const cameraOffset = forwardVector.clone().multiplyScalar(maxZoomOutOffset);
    //                 cameraOffset.z = 10; // Raise the camera higher for a broader view

    //                 this.camera.instance.position.copy(chassisObject.position).add(cameraOffset);
    //                 this.camera.instance.lookAt(chassisObject.position);

    //                 // Ensure maximum zoom-out distance
    //                 this.camera.zoom.targetValue = 1; // Maximum zoom-out value
    //                 this.camera.zoom.value = 1; // Immediately apply maximum zoom-out value
    //                 this.camera.zoom.distance = this.camera.zoom.minDistance + this.camera.zoom.amplitude * this.camera.zoom.value;
    //             } else {
    //                 // Old camera logic
    //                 this.camera.target.x = chassisObject.position.x;
    //                 this.camera.target.y = chassisObject.position.y;
    //                 this.camera.target.z = chassisObject.position.z;
    //                 this.camera.instance.lookAt(chassisObject.position);
    //             }
    //         }
    //     });

    //     // Key event listener for camera toggle
    //     document.addEventListener('keydown', (e) => {
    //         if ((e.key === 'Y' || e.key === 'y') && !this.camera.actionInProgress) {
    //             this.camera.actionInProgress = true; // Mark the action as in progress

    //             // Toggle the camera and reset the flag after the switch
    //             this.camera.triggerCameraAction(() => {
    //                 this.camera.actionInProgress = false; // Reset the flag
    //             });
    //         }
    //     });
    // }

    /**
     * Set camera
     */
    setCamera() {
        this.camera = new Camera({
            time: this.time,
            sizes: this.sizes,
            renderer: this.renderer,
            debug: this.debug,
            config: this.config,
            car: this.car
        });

        this.scene.add(this.camera.container);

        // Set the initial camera mode
        this.camera.isNewCameraActive = false; // Start with the old version
        this.camera.actionInProgress = false; // Track if a camera action is in progress

        // Adjust camera clipping planes for proper rendering
        this.camera.instance.near = 0.1;
        this.camera.instance.far = 1000;
        this.camera.instance.updateProjectionMatrix();

        this.time.on('tick', () => {
            if (this.world && this.world.car) {
                const chassisObject = this.world.car.chassis.object;
        
                if (this.camera.isNewCameraActive) {
                    // Calculate the forward vector in local space
                    const forwardVector = new THREE.Vector3(1, 0, 0);
                    forwardVector.applyQuaternion(chassisObject.quaternion);
        
                    // Default camera offset (behind the car)
                    const distance = 8;
                    let cameraOffset = forwardVector.clone().multiplyScalar(-distance);
                    cameraOffset.z = 2.5; // Raise the camera slightly for better visibility
        
                    // Adjust the camera offset if flight mode is enabled
                    if (this.world.car.physics.car.flightMode) {
                        // Move the camera to the left side during flight mode to avoid crashing into the car
                        cameraOffset.x = -6; // Shift the camera to the left
                    }
        
                    // Calculate the target position for the camera
                    const targetPosition = chassisObject.position.clone().add(cameraOffset);
        
                    // Calculate the preload position to smooth the camera movement
                    const preloadOffset = forwardVector.clone().multiplyScalar(-distance * 1.2);
                    const preloadPosition = chassisObject.position.clone().add(preloadOffset);
        
                    // Smooth movement of the camera position
                    this.camera.instance.position.lerp(preloadPosition, 0.1);
                    this.camera.instance.position.copy(chassisObject.position).add(cameraOffset);
        
                    // Continuously update the camera to look at the car's position
                    this.camera.instance.lookAt(chassisObject.position);
        
                    // Adjust clipping planes
                    this.camera.instance.near = 0.1;
                    this.camera.instance.far = 2000;
                    this.camera.instance.updateProjectionMatrix();
        
                    // Apply zoom settings
                    this.camera.zoom.targetValue = 0;
                    this.camera.zoom.value = 0;
                    this.camera.zoom.distance = this.camera.zoom.minDistance + this.camera.zoom.amplitude * this.camera.zoom.value;
        
                } else {
                    // Old camera logic (behind and above the car)
                    const offset = new THREE.Vector3(0, 5, -10);
                    const carPosition = chassisObject.position.clone().add(offset);
        
                    // Smooth movement of the old camera position
                    this.camera.instance.position.lerp(carPosition, 0.1);
                    this.camera.target.x = chassisObject.position.x;
                    this.camera.target.y = chassisObject.position.y;
                    this.camera.target.z = chassisObject.position.z;
                    this.camera.instance.lookAt(chassisObject.position);
                }
            }
        });

        // Key event listener for camera toggle
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Y' || e.key === 'y') && !this.camera.actionInProgress) {
                this.camera.actionInProgress = true; // Mark the action as in progress

                // Toggle the camera and reset the flag after the switch
                this.camera.triggerCameraAction(() => {
                    this.camera.actionInProgress = false; // Reset the flag
                });
            }
        });
    }

    setPasses()
    {
        this.passes = {}

        this.passes.composer = new EffectComposer(this.renderer)

        // Create passes
        this.passes.renderPass = new RenderPass(this.scene, this.camera.instance)

        // Debug
        if(this.debug)
        {
            const folder = this.passes.debugFolder.addFolder('glows')
            folder.open()

            folder.add(this.passes.glowsPass.material.uniforms.uPosition.value, 'x').step(0.001).min(- 1).max(2).name('positionX')
            folder.add(this.passes.glowsPass.material.uniforms.uPosition.value, 'y').step(0.001).min(- 1).max(2).name('positionY')
            folder.add(this.passes.glowsPass.material.uniforms.uRadius, 'value').step(0.001).min(0).max(2).name('radius')
            folder.addColor(this.passes.glowsPass, 'color').name('color').onChange(() =>
            {
                // this.passes.glowsPass.material.uniforms.uColor.value = new THREE.Color(this.passes.glowsPass.color)
            })
            folder.add(this.passes.glowsPass.material.uniforms.uAlpha, 'value').step(0.001).min(0).max(1).name('alpha')
        }

        // if (this.passes.horizontalBlurPass && this.passes.verticalBlurPass && this.passes.glowsPass) {

        //     // Add passes
        //     this.passes.composer.addPass(this.passes.renderPass)
        //     this.passes.composer.addPass(this.passes.horizontalBlurPass)
        //     this.passes.composer.addPass(this.passes.verticalBlurPass)
        //     this.passes.composer.addPass(this.passes.glowsPass)

        // } else {
        //     console.error('One or more passes are not initialized correctly');
        // }

        // Time tick
        // this.time.on('tick', () =>
        // {
        //     if (this.passes.horizontalBlurPass) {
        //         this.passes.horizontalBlurPass.enabled = this.passes.horizontalBlurPass.material.uniforms.uStrength.value.x > 0
        //     }

        //     if (this.passes.verticalBlurPass) {
        //         this.passes.verticalBlurPass.enabled = this.passes.verticalBlurPass.material.uniforms.uStrength.value.y > 0
        //     }

        //     // Renderer
        //     this.passes.composer.render()
        //     // this.renderer.domElement.style.background = 'black'
        //     // this.renderer.render(this.scene, this.camera.instance)
        // })

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
            this.passes.composer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
            // this.passes.horizontalBlurPass.material.uniforms.uResolution.value.x = this.sizes.viewport.width
            // this.passes.horizontalBlurPass.material.uniforms.uResolution.value.y = this.sizes.viewport.height
            // this.passes.verticalBlurPass.material.uniforms.uResolution.value.x = this.sizes.viewport.width
            // this.passes.verticalBlurPass.material.uniforms.uResolution.value.y = this.sizes.viewport.height
        })
    }

    /**
     * Set world
     */
    setWorld(worldId, carName, ws, matcaps)
    {
        this.world = new World({
            config: this.config,
            debug: this.debug,
            resources: this.resources,
            time: this.time,
            sizes: this.sizes,
            camera: this.camera,
            scene: this.scene,
            physics: this.physics,
            car: this.car,
            renderer: this.renderer,
            passes: this.passes,
            canvas: this.$canvas,
            playerId: this.playerId,
            token: this.token,
            carName: this.carName,
            matcaps: this.matcaps,
            worldId,
            ws: this.ws
        })
        this.scene.add(this.world.container)
        console.log("Game World:", this.world)
        console.log("Game World Texture panel:", this.world.matcaps)
    }

    /**
     * Destructor
     */
    destructor()
    {
        this.time.off('tick')
        this.sizes.off('resize')

        this.camera.orbitControls.dispose()
        this.renderer.dispose()
        // this.debug.destroy()
    }
})({ $canvas: canvasElement, playerId });

// Save instance for later cleanup
appInstanceRef.current = app;

// Cleanup on unmount
return () => {
  console.log('Cleaning up Application');
  if (appInstanceRef.current) {
    const worldSocket = appInstanceRef.current?.world?.ws;
    const currentPlayerId = appInstanceRef.current?.playerId;
    if (worldSocket && worldSocket.readyState === WebSocket.OPEN && currentPlayerId) {
      worldSocket.send(JSON.stringify({
        type: 'remove',
        playerId: currentPlayerId
      }));
      worldSocket.close();
    }
    appInstanceRef.current.destructor();
  }
};
}, [playerId]);

return (
      <canvas ref={canvasRef} className="canvas js-canvas" />
  );
};

export default Application;
