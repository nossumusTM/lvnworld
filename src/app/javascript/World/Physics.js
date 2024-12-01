import * as CANNON from 'cannon'
import * as THREE from 'three'
import Car from './Car'
import Car1 from './Car1'
import Car2 from './Car2'
import Car3 from './Car3'
import Car4 from './Car4'
import Car5 from './Car5'
import Car6 from './Car6'
import Car7 from './Car7'
import Car8 from './Car8'
import Car9 from './Car9'
import Car10 from './Car10'
import Car11 from './Car11'
import Car12 from './Car12'
import Car13 from './Car13'
import Car14 from './Car14'
import Car15 from './Car15'
import Car16 from './Car16'
import Car17 from './Car17'
import Car18 from './Car18'
import Car19 from './Car19'
import Controls from './Controls'

export default class Physics
{
    constructor(_options)
    {
        this.config = _options.config
        this.debug = _options.debug
        this.time = _options.time
        this.sizes = _options.sizes
        this.controls = _options.controls
        this.ws = _options.ws
        this.sounds = _options.sounds
        this.worldId = _options.worldId
        this.carClass = _options.carClass
        this.carName = _options.carName
        this.bullets = []
        this.cars = {}

        this.nonCollidablePlayers = new Set();
        this.nonCollidableCars = new Set();

        // Set up
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('physics')
            // this.debugFolder.open()
        }

        this.carPhysicsConfigs = {
            'Charger Power Bank': {
                chassisWidth: 1.02,
                chassisHeight: 1.16,
                chassisDepth: 2.55,
                chassisOffset: new CANNON.Vec3(0, 0, 0.41),
                chassisMass: 40,
                wheelFrontOffsetDepth: 0.775,
                wheelBackOffsetDepth: - 0.708,
                wheelOffsetWidth: 0.51,
                wheelRadius: 0.25,
                wheelHeight: 0.24,
                wheelSuspensionStiffness: 50,
                wheelSuspensionRestLength: 0.1,
                wheelFrictionSlip: 10,
                wheelDampingRelaxation: 1.8,
                wheelDampingCompression: 1.5,
                wheelMaxSuspensionForce: 100000,
                wheelRollInfluence:  0.01,
                wheelMaxSuspensionTravel: 0.3,
                wheelCustomSlidingRotationalSpeed: - 30,
                wheelMass: 5,
                controlsSteeringSpeed: 0.005 * 3,
                controlsSteeringMax: Math.PI * 0.17,
                controlsSteeringQuad: false,
                controlsAcceleratinMaxSpeed: 0.055 * 3 / 17,
                controlsAcceleratinMaxSpeedBoost: 0.17 * 3 / 17,
                controlsAcceleratingSpeed: 2 * 4 * 2,
                controlsAcceleratingSpeedBoost: 7 * 4 * 2,
                controlsAcceleratingQuad: true,
                controlsBrakeStrength: 0.45 * 9
            },
            'Wreckslinger': {
                chassisWidth: 1.02,
                chassisHeight: 1.16,
                chassisDepth: 2.68,
                chassisOffset: new CANNON.Vec3(0, 0, 0.41),
                chassisMass: 40,
                wheelFrontOffsetDepth: 0.784,
                wheelBackOffsetDepth: - 0.728,
                wheelOffsetWidth: 0.48,
                wheelRadius: 0.25,
                wheelHeight: 0.24,
                wheelSuspensionStiffness: 50,
                wheelSuspensionRestLength: 0.1,
                wheelFrictionSlip: 10,
                wheelDampingRelaxation: 1.8,
                wheelDampingCompression: 1.5,
                wheelMaxSuspensionForce: 100000,
                wheelRollInfluence:  0.01,
                wheelMaxSuspensionTravel: 0.3,
                wheelCustomSlidingRotationalSpeed: - 30,
                wheelMass: 5,
                controlsSteeringSpeed: 0.005 * 3,
                controlsSteeringMax: Math.PI * 0.17,
                controlsSteeringQuad: false,
                controlsAcceleratinMaxSpeed: 0.055 * 3 / 17,
                controlsAcceleratinMaxSpeedBoost: 0.17 * 3 / 17,
                controlsAcceleratingSpeed: 2 * 4 * 2,
                controlsAcceleratingSpeedBoost: 7 * 4 * 2,
                controlsAcceleratingQuad: true,
                controlsBrakeStrength: 0.45 * 9
            },
            'Gangover': {
                chassisWidth: 1.02,
                chassisHeight: 1.16,
                chassisDepth: 2.57,
                chassisOffset: new CANNON.Vec3(0, 0, 0.41),
                chassisMass: 40,
                wheelFrontOffsetDepth: 0.844,
                wheelBackOffsetDepth: - 0.628,
                wheelOffsetWidth: 0.48,
                wheelRadius: 0.25,
                wheelHeight: 0.24,
                wheelSuspensionStiffness: 50,
                wheelSuspensionRestLength: 0.1,
                wheelFrictionSlip: 10,
                wheelDampingRelaxation: 1.8,
                wheelDampingCompression: 1.5,
                wheelMaxSuspensionForce: 100000,
                wheelRollInfluence:  0.01,
                wheelMaxSuspensionTravel: 0.3,
                wheelCustomSlidingRotationalSpeed: - 30,
                wheelMass: 5,
                controlsSteeringSpeed: 0.005 * 3,
                controlsSteeringMax: Math.PI * 0.17,
                controlsSteeringQuad: false,
                controlsAcceleratinMaxSpeed: 0.055 * 3 / 17,
                controlsAcceleratinMaxSpeedBoost: 0.17 * 3 / 17,
                controlsAcceleratingSpeed: 2 * 4 * 2,
                controlsAcceleratingSpeedBoost: 7 * 4 * 2,
                controlsAcceleratingQuad: true,
                controlsBrakeStrength: 0.45 * 9
            },
            'McLaren': {
                chassisWidth: 1.02,
                chassisHeight: 1.16,
                chassisDepth: 2.53,
                chassisOffset: new CANNON.Vec3(0, 0, 0.41),
                chassisMass: 40,
                wheelFrontOffsetDepth: 0.680,
                wheelBackOffsetDepth: - 0.744,
                wheelOffsetWidth: 0.57,
                wheelRadius: 0.25,
                wheelHeight: 0.24,
                wheelSuspensionStiffness: 50,
                wheelSuspensionRestLength: 0.1,
                wheelFrictionSlip: 10,
                wheelDampingRelaxation: 1.8,
                wheelDampingCompression: 1.5,
                wheelMaxSuspensionForce: 100000,
                wheelRollInfluence:  0.01,
                wheelMaxSuspensionTravel: 0.3,
                wheelCustomSlidingRotationalSpeed: - 30,
                wheelMass: 5,
                controlsSteeringSpeed: 0.005 * 3,
                controlsSteeringMax: Math.PI * 0.17,
                controlsSteeringQuad: false,
                controlsAcceleratinMaxSpeed: 0.055 * 3 / 17,
                controlsAcceleratinMaxSpeedBoost: 0.17 * 3 / 17,
                controlsAcceleratingSpeed: 2 * 4 * 2,
                controlsAcceleratingSpeedBoost: 7 * 4 * 2,
                controlsAcceleratingQuad: true,
                controlsBrakeStrength: 0.45 * 9
            },
            '240 GTI': {
                chassisWidth: 1.02,
                chassisHeight: 1.16,
                chassisDepth: 2.63,
                chassisOffset: new CANNON.Vec3(0, 0, 0.41),
                chassisMass: 40,
                wheelFrontOffsetDepth: 0.657,
                wheelBackOffsetDepth: - 0.724,
                wheelOffsetWidth: 0.44,
                wheelRadius: 0.25,
                wheelHeight: 0.24,
                wheelSuspensionStiffness: 50,
                wheelSuspensionRestLength: 0.1,
                wheelFrictionSlip: 10,
                wheelDampingRelaxation: 1.8,
                wheelDampingCompression: 1.5,
                wheelMaxSuspensionForce: 100000,
                wheelRollInfluence:  0.01,
                wheelMaxSuspensionTravel: 0.3,
                wheelCustomSlidingRotationalSpeed: - 30,
                wheelMass: 5,
                controlsSteeringSpeed: 0.005 * 3,
                controlsSteeringMax: Math.PI * 0.17,
                controlsSteeringQuad: false,
                controlsAcceleratinMaxSpeed: 0.055 * 3 / 17,
                controlsAcceleratinMaxSpeedBoost: 0.17 * 3 / 17,
                controlsAcceleratingSpeed: 2 * 4 * 2,
                controlsAcceleratingSpeedBoost: 7 * 4 * 2,
                controlsAcceleratingQuad: true,
                controlsBrakeStrength: 0.45 * 9
            },
            'Howler Packard': {
                chassisWidth: 1.62,
                chassisHeight: 1.87,
                chassisDepth: 2.33,
                chassisOffset: new CANNON.Vec3(0, 0, 0.41),
                chassisMass: 40,
                wheelFrontOffsetDepth: 0.857,
                wheelBackOffsetDepth: - 0.514,
                wheelOffsetWidth: 0.59,
                wheelRadius: 0.45,
                wheelHeight: 0.44,
                wheelSuspensionStiffness: 50,
                wheelSuspensionRestLength: 0.1,
                wheelFrictionSlip: 10,
                wheelDampingRelaxation: 1.8,
                wheelDampingCompression: 1.5,
                wheelMaxSuspensionForce: 100000,
                wheelRollInfluence:  0.01,
                wheelMaxSuspensionTravel: 0.3,
                wheelCustomSlidingRotationalSpeed: - 30,
                wheelMass: 5,
                controlsSteeringSpeed: 0.005 * 3,
                controlsSteeringMax: Math.PI * 0.17,
                controlsSteeringQuad: false,
                controlsAcceleratinMaxSpeed: 0.055 * 3 / 17,
                controlsAcceleratinMaxSpeedBoost: 0.17 * 3 / 17,
                controlsAcceleratingSpeed: 2 * 4 * 2,
                controlsAcceleratingSpeedBoost: 7 * 4 * 2,
                controlsAcceleratingQuad: true,
                controlsBrakeStrength: 0.45 * 9
            },
            'RC TraxShark': {
                chassisWidth: 1.02,
                chassisHeight: 1.56,
                chassisDepth: 2.33,
                chassisOffset: new CANNON.Vec3(0, 0, 0.41),
                chassisMass: 40,
                wheelFrontOffsetDepth: 0.604,
                wheelBackOffsetDepth: - 0.604,
                wheelOffsetWidth: 0.55,
                wheelRadius: 0.38,
                wheelHeight: 0.36,
                wheelSuspensionStiffness: 50,
                wheelSuspensionRestLength: 0.1,
                wheelFrictionSlip: 10,
                wheelDampingRelaxation: 1.8,
                wheelDampingCompression: 1.5,
                wheelMaxSuspensionForce: 100000,
                wheelRollInfluence:  0.01,
                wheelMaxSuspensionTravel: 0.3,
                wheelCustomSlidingRotationalSpeed: - 30,
                wheelMass: 5,
                controlsSteeringSpeed: 0.005 * 3,
                controlsSteeringMax: Math.PI * 0.17,
                controlsSteeringQuad: false,
                controlsAcceleratinMaxSpeed: 0.055 * 3 / 17,
                controlsAcceleratinMaxSpeedBoost: 0.17 * 3 / 17,
                controlsAcceleratingSpeed: 2 * 4 * 2,
                controlsAcceleratingSpeedBoost: 7 * 4 * 2,
                controlsAcceleratingQuad: true,
                controlsBrakeStrength: 0.45 * 9
            },
            'Pusher Crowd': {
                chassisWidth: 1.02,
                chassisHeight: 1.16,
                chassisDepth: 2.57,
                chassisOffset: new CANNON.Vec3(0, 0, 0.41),
                chassisMass: 40,
                wheelFrontOffsetDepth: 0.784,
                wheelBackOffsetDepth: - 0.634,
                wheelOffsetWidth: 0.57,
                wheelRadius: 0.35,
                wheelHeight: 0.34,
                wheelSuspensionStiffness: 50,
                wheelSuspensionRestLength: 0.1,
                wheelFrictionSlip: 10,
                wheelDampingRelaxation: 1.8,
                wheelDampingCompression: 1.5,
                wheelMaxSuspensionForce: 100000,
                wheelRollInfluence:  0.01,
                wheelMaxSuspensionTravel: 0.3,
                wheelCustomSlidingRotationalSpeed: - 30,
                wheelMass: 5,
                controlsSteeringSpeed: 0.005 * 3,
                controlsSteeringMax: Math.PI * 0.17,
                controlsSteeringQuad: false,
                controlsAcceleratinMaxSpeed: 0.055 * 3 / 17,
                controlsAcceleratinMaxSpeedBoost: 0.17 * 3 / 17,
                controlsAcceleratingSpeed: 2 * 4 * 2,
                controlsAcceleratingSpeedBoost: 7 * 4 * 2,
                controlsAcceleratingQuad: true,
                controlsBrakeStrength: 0.45 * 9
            },
            'Impactus': {
                chassisWidth: 1.02,
                chassisHeight: 1.16,
                chassisDepth: 2.38,
                chassisOffset: new CANNON.Vec3(0, 0, 0.41),
                chassisMass: 40,
                wheelFrontOffsetDepth: 0.700,
                wheelBackOffsetDepth: - 0.705,
                wheelOffsetWidth: 0.48,
                wheelRadius: 0.25,
                wheelHeight: 0.24,
                wheelSuspensionStiffness: 50,
                wheelSuspensionRestLength: 0.1,
                wheelFrictionSlip: 10,
                wheelDampingRelaxation: 1.8,
                wheelDampingCompression: 1.5,
                wheelMaxSuspensionForce: 100000,
                wheelRollInfluence:  0.01,
                wheelMaxSuspensionTravel: 0.3,
                wheelCustomSlidingRotationalSpeed: - 30,
                wheelMass: 5,
                controlsSteeringSpeed: 0.005 * 3,
                controlsSteeringMax: Math.PI * 0.17,
                controlsSteeringQuad: false,
                controlsAcceleratinMaxSpeed: 0.055 * 3 / 17,
                controlsAcceleratinMaxSpeedBoost: 0.17 * 3 / 17,
                controlsAcceleratingSpeed: 2 * 4 * 2,
                controlsAcceleratingSpeedBoost: 7 * 4 * 2,
                controlsAcceleratingQuad: true,
                controlsBrakeStrength: 0.45 * 9
            },
            'Crushinator': {
                chassisWidth: 1.02,
                chassisHeight: 1.56,
                chassisDepth: 2.33,
                chassisOffset: new CANNON.Vec3(0, 0, 0.41),
                chassisMass: 40,
                wheelFrontOffsetDepth: 0.742,
                wheelBackOffsetDepth: - 0.641,
                wheelOffsetWidth: 0.59,
                wheelRadius: 0.38,
                wheelHeight: 0.36,
                wheelSuspensionStiffness: 50,
                wheelSuspensionRestLength: 0.1,
                wheelFrictionSlip: 10,
                wheelDampingRelaxation: 1.8,
                wheelDampingCompression: 1.5,
                wheelMaxSuspensionForce: 100000,
                wheelRollInfluence:  0.01,
                wheelMaxSuspensionTravel: 0.3,
                wheelCustomSlidingRotationalSpeed: - 30,
                wheelMass: 5,
                controlsSteeringSpeed: 0.005 * 3,
                controlsSteeringMax: Math.PI * 0.17,
                controlsSteeringQuad: false,
                controlsAcceleratinMaxSpeed: 0.055 * 3 / 17,
                controlsAcceleratinMaxSpeedBoost: 0.17 * 3 / 17,
                controlsAcceleratingSpeed: 2 * 4 * 2,
                controlsAcceleratingSpeedBoost: 7 * 4 * 2,
                controlsAcceleratingQuad: true,
                controlsBrakeStrength: 0.45 * 9
            },
            default: {
                chassisWidth: 1.02,
                chassisHeight: 1.16,
                chassisDepth: 2.03,
                chassisOffset: new CANNON.Vec3(0, 0, 0.41),
                chassisMass: 40,
                wheelFrontOffsetDepth: 0.635,
                wheelBackOffsetDepth: -0.475,
                wheelOffsetWidth: 0.39,
                wheelRadius: 0.25,
                wheelHeight: 0.24,
                wheelSuspensionStiffness: 50,
                wheelSuspensionRestLength: 0.1,
                wheelFrictionSlip: 10,
                wheelDampingRelaxation: 1.8,
                wheelDampingCompression: 1.5,
                wheelMaxSuspensionForce: 100000,
                wheelRollInfluence:  0.01,
                wheelMaxSuspensionTravel: 0.3,
                wheelCustomSlidingRotationalSpeed: - 30,
                wheelMass: 5,
                controlsSteeringSpeed: 0.005 * 3,
                controlsSteeringMax: Math.PI * 0.17,
                controlsSteeringQuad: false,
                controlsAcceleratinMaxSpeed: 0.055 * 3 / 17,
                controlsAcceleratinMaxSpeedBoost: 0.17 * 3 / 17,
                controlsAcceleratingSpeed: 2 * 4 * 2,
                controlsAcceleratingSpeedBoost: 7 * 4 * 2,
                controlsAcceleratingQuad: true,
                controlsBrakeStrength: 0.45 * 9,
            },
        };

        this.setWorld()
        this.setModels()
        this.setMaterials()
        this.setFloor()
        this.setCar(this.playerId, this.carName)

        this.time.on('tick', () =>
        {
            const physicsDelta = 1 / 60; // Fixed time step for physics (e.g., 60 updates per second)
            this.world.step(physicsDelta);
            this.updateCars();
            this.updateBullets();
            // this.world.step(this.time.delta / 1000)
        })
    }

    updateCarClass(CarClass) {
        this.carClass = CarClass;
        
        // Set car based on the carClass passed
        if (this.carClass === Car1) {
            this.setCar1();
        } else if (this.carClass === Car2) {
            this.setCar2();
        } else if (this.carClass === Car3) {
            this.setCar3();
        } else if (this.carClass === Car4) {
            this.setCar4();
        } else if (this.carClass === Car5) {
            this.setCar5();
        } else if (this.carClass === Car6) {
            this.setCar6();
        } else if (this.carClass === Car7) {
            this.setCar7();
        } else if (this.carClass === Car8) {
            this.setCar8();
        } else if (this.carClass === Car9) {
            this.setCar9();
        } else if (this.carClass === Car10) {
            this.setCar10();
        } else if (this.carClass === Car11) {
            this.setCar11();
        } else if (this.carClass === Car12) {
            this.setCar12();
        } else if (this.carClass === Car13) {
            this.setCar13();
        } else if (this.carClass === Car14) {
            this.setCar14();
        } else if (this.carClass === Car15) {
            this.setCar15();
        } else if (this.carClass === Car16) {
            this.setCar16();
        } else if (this.carClass === Car17) {
            this.setCar17();
        } else if (this.carClass === Car18) {
            this.setCar18();
        } else if (this.carClass === Car19) {
            this.setCar19();
        }
    }

    setWorld()
    {
        this.world = new CANNON.World()
        this.world.gravity.set(0, 0, - 3.25 * 4)
        this.world.allowSleep = true
        // this.world.broadphase = new CANNON.SAPBroadphase(this.world)
        this.world.defaultContactMaterial.friction = 0
        this.world.defaultContactMaterial.restitution = 0.2
        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.world.gravity, 'z').step(0.001).min(- 20).max(20).name('gravity')
        }
        // console.log("Cars:", this.cars)
        this.addWorldBorders();
    }
    
    // New function to add borders and a roof to the physics world
    addWorldBorders() {
        const wallMaterial = new CANNON.Material("wallMaterial");

        // Wall dimensions (adjust these according to your world size)
        const wallThickness = 5;
        const wallHeight = 40;
        const worldSize = 1200;

        // Four walls surrounding the world
        this.walls = [
            { position: new CANNON.Vec3(-worldSize / 2, 0, wallHeight / 2), size: new CANNON.Vec3(wallThickness, worldSize, wallHeight) },  // Left wall
            { position: new CANNON.Vec3(worldSize / 2, 0, wallHeight / 2), size: new CANNON.Vec3(wallThickness, worldSize, wallHeight) },   // Right wall
            { position: new CANNON.Vec3(0, -worldSize / 2, wallHeight / 2), size: new CANNON.Vec3(worldSize, wallThickness, wallHeight) },  // Back wall
            { position: new CANNON.Vec3(0, worldSize / 2, wallHeight / 2), size: new CANNON.Vec3(worldSize, wallThickness, wallHeight) },   // Front wall
        ];

        // Add a roof to the world to prevent cars from flying above the walls
        const roof = {
            position: new CANNON.Vec3(0, 0, wallHeight + wallThickness / 2),  // Positioned at the top of the walls
            size: new CANNON.Vec3(worldSize, worldSize, wallThickness)         // Thin roof covering the world
        };

        // Create and add walls to the physics world
        this.walls.forEach(wall => {
            const shape = new CANNON.Box(wall.size);
            const body = new CANNON.Body({
                mass: 0,  // Static objects
                material: wallMaterial,
                position: wall.position
            });
            body.addShape(shape);
            this.world.addBody(body);
        });

        // Add the roof
        const roofShape = new CANNON.Box(roof.size);
        const roofBody = new CANNON.Body({
            mass: 0,  // Static object
            material: wallMaterial,
            position: roof.position
        });
        roofBody.addShape(roofShape);
        this.world.addBody(roofBody);
    }

    // setWorld() {
    //     this.world = new CANNON.World();
    //     this.world.gravity.set(0, 0, -3.25 * 4);
    //     this.world.allowSleep = true;
    //     // this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    //     this.world.defaultContactMaterial.friction = 0;
    //     this.world.defaultContactMaterial.restitution = 0.2;
    
    //     // Define the world boundaries (left, right, top, bottom, and ground)
    //     const groundMaterial = new CANNON.Material("groundMaterial");
        
    //     const groundBody = new CANNON.Body({
    //         mass: 0, // Static body
    //         material: groundMaterial,
    //     });
    //     const groundShape = new CANNON.Plane(); // Infinite plane
    //     groundBody.addShape(groundShape);
    //     groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Rotate the plane to be horizontal
    //     this.world.addBody(groundBody);
    
    //     // Add walls/borders using CANNON.Box
    //     const wallSize = 10; // You can change this depending on your world size
    //     const wallThickness = 1; // Thickness of the walls
    
    //     // Create a function to add walls
    //     const addWall = (position, size) => {
    //         const wallBody = new CANNON.Body({
    //             mass: 0, // Static body
    //             position: new CANNON.Vec3(position.x, position.y, position.z),
    //         });
    //         const wallShape = new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z));
    //         wallBody.addShape(wallShape);
    //         this.world.addBody(wallBody);
    //     };
    
    //     // Left wall
    //     addWall({ x: -wallSize, y: 0, z: wallSize }, { x: wallThickness, y: wallSize, z: wallSize });
    
    //     // Right wall
    //     addWall({ x: wallSize, y: 0, z: wallSize }, { x: wallThickness, y: wallSize, z: wallSize });
    
    //     // Top wall
    //     addWall({ x: 0, y: wallSize, z: wallSize }, { x: wallSize, y: wallThickness, z: wallSize });
    
    //     // Bottom wall
    //     addWall({ x: 0, y: -wallSize, z: wallSize }, { x: wallSize, y: wallThickness, z: wallSize });
    
    //     // Debug
    //     if (this.debug) {
    //         this.debugFolder.add(this.world.gravity, 'z').step(0.001).min(-20).max(20).name('gravity');
    //     }
    
    //     console.log("Cars:", this.cars);
    // }
    

    // Method to update non-collidable players
    updateNonCollidablePlayers(members) {
        this.nonCollidablePlayers.clear();
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                const pair1 = `${members[i]}-${members[j]}`;
                const pair2 = `${members[j]}-${members[i]}`;
                this.nonCollidablePlayers.add(pair1);
                this.nonCollidablePlayers.add(pair2);
            }
        }
    }

    // Method to update non-collidable cars (e.g., car1 vs all other cars)
    updateNonCollidableCars(currentCar, carsArray) {
        this.nonCollidableCars.clear();  // Clear previous non-collidable pairs

        // Iterate through all cars in the carsArray (this.cars)
        for (let i = 0; i < carsArray.length; i++) {
            const car1 = carsArray[i];

            // Skip the current car itself in this check
            if (currentCar.playerId !== car1.playerId) {
                const pair1 = `${currentCar.playerId}-${car1.playerId}`;
                const pair2 = `${car1.playerId}-${currentCar.playerId}`;

                // Add both directions to ensure no collision happens either way
                this.nonCollidableCars.add(pair1);
                this.nonCollidableCars.add(pair2);
            }
        }
    }

    // Method to check if two players should collide
    shouldCollide(playerId1, playerId2) {
        const pair1 = `${playerId1}-${playerId2}`;
        const pair2 = `${playerId2}-${playerId1}`;
        return !(this.nonCollidablePlayers.has(pair1) || this.nonCollidablePlayers.has(pair2));
    }

    // Method to check if two cars should collide
    shouldCollideCars(playerId1, playerId2) {
        const pair1 = `${playerId1}-${playerId2}`;
        const pair2 = `${playerId2}-${playerId1}`;
        return !(this.nonCollidableCars.has(pair1) || this.nonCollidableCars.has(pair2));
    }

    setModels()
    {
        this.models = {}
        this.models.container = new THREE.Object3D()
        this.models.container.visible = false
        this.models.materials = {}
        this.models.materials.static = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
        this.models.materials.dynamic = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
        this.models.materials.dynamicSleeping = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true })

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this.models.container, 'visible').name('modelsVisible')
        }
    }

    setMaterials()
    {
        this.materials = {}

        // All materials
        this.materials.items = {}
        this.materials.items.floor = new CANNON.Material('floorMaterial')
        this.materials.items.dummy = new CANNON.Material('dummyMaterial')
        this.materials.items.wheel = new CANNON.Material('wheelMaterial')

        // Contact between materials
        this.materials.contacts = {}

        this.materials.contacts.floorDummy = new CANNON.ContactMaterial(this.materials.items.floor, this.materials.items.dummy, { friction: 0.05, restitution: 0.3, contactEquationStiffness: 1000 })
        this.world.addContactMaterial(this.materials.contacts.floorDummy)

        this.materials.contacts.dummyDummy = new CANNON.ContactMaterial(this.materials.items.dummy, this.materials.items.dummy, { friction: 0.5, restitution: 0.3, contactEquationStiffness: 1000 })
        this.world.addContactMaterial(this.materials.contacts.dummyDummy)

        this.materials.contacts.floorWheel = new CANNON.ContactMaterial(this.materials.items.floor, this.materials.items.wheel, { friction: 0.3, restitution: 0, contactEquationStiffness: 1000 })
        this.world.addContactMaterial(this.materials.contacts.floorWheel)
    }

    setFloor()
    {
        this.floor = {}
        this.floor.body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            material: this.materials.items.floor
        })

        // this.floor.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI * 0.5)

        this.world.addBody(this.floor.body)
    }

    setCar19(playerId) {
        this.car19 = {}
    
        this.car19.steering = 0
        this.car19.accelerating = 0
        this.car19.speed = 0
        this.car19.worldForward = new CANNON.Vec3()
        this.car19.angle = 0
        this.car19.forwardSpeed = 0
        this.car19.oldPosition = new CANNON.Vec3()
        this.car19.goingForward = true
    
        // Options
        this.car19.options = {}
        this.car19.options.chassisWidth = 1.02
        this.car19.options.chassisHeight = 1.16
        this.car19.options.chassisDepth = 2.03
        this.car19.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car19.options.chassisMass = 0
        this.car19.options.wheelFrontOffsetDepth = 0.635
        this.car19.options.wheelBackOffsetDepth = -0.475
        this.car19.options.wheelOffsetWidth = 0.39
        this.car19.options.wheelRadius = 0.25
        this.car19.options.wheelHeight = 0.24
        this.car19.options.wheelSuspensionStiffness = 50
        this.car19.options.wheelSuspensionRestLength = 0.1
        this.car19.options.wheelFrictionSlip = 10
        this.car19.options.wheelDampingRelaxation = 1.8
        this.car19.options.wheelDampingCompression = 1.5
        this.car19.options.wheelMaxSuspensionForce = 100000
        this.car19.options.wheelRollInfluence = 0.01
        this.car19.options.wheelMaxSuspensionTravel = 0.3
        this.car19.options.wheelCustomSlidingRotationalSpeed = -30
        this.car19.options.wheelMass = 5
        this.car19.options.controlsSteeringSpeed = 0.005 * 3
        this.car19.options.controlsSteeringMax = Math.PI * 0.17
        this.car19.options.controlsSteeringQuad = false
        this.car19.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car19.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car19.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car19.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car19.options.controlsAcceleratingQuad = true
        this.car19.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car19.upsideDown = {}
        this.car19.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car19.upsideDown.pendingTimeout = null
        this.car19.upsideDown.turningTimeout = null
    
        // Jump
        this.car19.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car19.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car19.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car19.create = () => {

            // Chassis
            this.car19.chassis = {}
    
            this.car19.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car19.options.chassisDepth * 0.5, this.car19.options.chassisWidth * 0.5, this.car19.options.chassisHeight * 0.5))
    
            this.car19.chassis.body = new CANNON.Body({ mass: this.car19.options.chassisMass })
            this.car19.chassis.body.allowSleep = false
            this.car19.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car19.chassis.body.sleep()
            this.car19.chassis.body.addShape(this.car19.chassis.shape, this.car19.options.chassisOffset)
            this.car19.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car19.chassis.body);
            this.car19.chassis.body.playerId = playerId;
    
            // Sound
            this.car19.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car19.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car19.chassis.body
            })
    
            // Wheel
            this.car19.wheels = {}
            this.car19.wheels.options = {
                radius: this.car19.options.wheelRadius,
                height: this.car19.options.wheelHeight,
                suspensionStiffness: this.car19.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car19.options.wheelSuspensionRestLength,
                frictionSlip: this.car19.options.wheelFrictionSlip,
                dampingRelaxation: this.car19.options.wheelDampingRelaxation,
                dampingCompression: this.car19.options.wheelDampingCompression,
                maxSuspensionForce: this.car19.options.wheelMaxSuspensionForce,
                rollInfluence: this.car19.options.wheelRollInfluence,
                maxSuspensionTravel: this.car19.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car19.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car19.wheels.options.chassisConnectionPointLocal.set(this.car19.options.wheelFrontOffsetDepth, this.car19.options.wheelOffsetWidth, 0)
            this.car19.vehicle.addWheel(this.car19.wheels.options)
    
            // Front right
            this.car19.wheels.options.chassisConnectionPointLocal.set(this.car19.options.wheelFrontOffsetDepth, -this.car19.options.wheelOffsetWidth, 0)
            this.car19.vehicle.addWheel(this.car19.wheels.options)
    
            // Back left
            this.car19.wheels.options.chassisConnectionPointLocal.set(this.car19.options.wheelBackOffsetDepth, this.car19.options.wheelOffsetWidth, 0)
            this.car19.vehicle.addWheel(this.car19.wheels.options)
    
            // Back right
            this.car19.wheels.options.chassisConnectionPointLocal.set(this.car19.options.wheelBackOffsetDepth, -this.car19.options.wheelOffsetWidth, 0)
            this.car19.vehicle.addWheel(this.car19.wheels.options)
    
            this.car19.vehicle.addToWorld(this.world)
    
            this.car19.wheels.indexes = {}
    
            this.car19.wheels.indexes.frontLeft = 0
            this.car19.wheels.indexes.frontRight = 1
            this.car19.wheels.indexes.backLeft = 2
            this.car19.wheels.indexes.backRight = 3
            this.car19.wheels.bodies = []
    
            for (const _wheelInfos of this.car19.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car19.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car19.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car19.wheels.bodies.push(body)
            }
    
            // Model
            this.car19.model = {}
            this.car19.model.container = new THREE.Object3D()
            this.models.container.add(this.car19.model.container)
    
            this.car19.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car19.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car19.options.chassisDepth, this.car19.options.chassisWidth, this.car19.options.chassisHeight), this.car19.model.material)
            this.car19.model.container.add(this.car19.model.chassis)
    
            this.car19.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car19.options.wheelRadius, this.car19.options.wheelRadius, this.car19.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car19.model.material)
                this.car19.model.container.add(wheel)
                this.car19.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car19.destroy = () => {
            this.car19.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car19.model.container)
        }
    
        // Recreate method
        // this.car19.recreate = () => {
        //     this.car19.destroy()
        //     this.car19.create()
        //     this.car19.chassis.body.wakeUp()
        // }

        // Initialize recreate counter and cooldown timer
        this.car19.recreateCount = 0;
        this.car19.recreateCooldown = false;

        this.car19.recreate = () => {
            if (this.car19.recreateCooldown) {
                console.log("Recreate is disabled. Please wait 10 minutes before trying again.");
                return;
            }

            if (this.car19.recreateCount < 5) {
                // Perform recreate actions
                this.car19.destroy();
                this.car19.create();
                this.car19.chassis.body.wakeUp();

                // Increment recreate count
                this.car19.recreateCount += 1;
                console.log(`Recreate used ${this.car19.recreateCount}/5 times.`);

                // Check if limit has been reached
                if (this.car19.recreateCount === 5) {
                    this.car19.recreateCooldown = true;
                    console.log("Recreate disabled for 10 minutes.");

                    // Set timer to reset count and cooldown after 10 minutes (600,000 ms)
                    setTimeout(() => {
                        this.car19.recreateCount = 0;
                        this.car19.recreateCooldown = false;
                        console.log("Recreate is available again.");
                    }, 600000); // 10 minutes in milliseconds
                }
            } else {
                console.log("Recreate limit reached. Please wait 10 minutes.");
            }
        };
    
        // Brake
        this.car19.brake = () => {
            this.car19.vehicle.setBrake(1, 0)
            this.car19.vehicle.setBrake(1, 1)
            this.car19.vehicle.setBrake(1, 2)
            this.car19.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car19.unbrake = () => {
            this.car19.vehicle.setBrake(0, 0)
            this.car19.vehicle.setBrake(0, 1)
            this.car19.vehicle.setBrake(0, 2)
            this.car19.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car19.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car19.oldPosition)
    
            this.car19.oldPosition.copy(this.car19.chassis.body.position)
            this.car19.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car19.chassis.body.vectorToWorldFrame(localForward, this.car19.worldForward)
            this.car19.angle = Math.atan2(this.car19.worldForward.y, this.car19.worldForward.x)
    
            this.car19.forwardSpeed = this.car19.worldForward.dot(positionDelta)
            this.car19.goingForward = this.car19.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car19.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car19.upsideDown.state === 'watching') {
                    this.car19.upsideDown.state = 'pending'
                    this.car19.upsideDown.pendingTimeout = window.setTimeout(() => {
                        this.car19.upsideDown.state = 'turning'
                        this.car19.jump(true)
    
                        this.car19.upsideDown.turningTimeout = window.setTimeout(() => {
                            this.car19.upsideDown.state = 'watching'
                        }, 1000)
                    }, 1000)
                }
            } else {
                if (this.car19.upsideDown.state === 'pending') {
                    this.car19.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car19.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car19.vehicle.wheelInfos.length; i++) {
                this.car19.vehicle.updateWheelTransform(i)
    
                const transform = this.car19.vehicle.wheelInfos[i].worldTransform
                this.car19.wheels.bodies[i].position.copy(transform.position)
                this.car19.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car19.wheels.bodies[i].quaternion = this.car19.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car19.worldForward.clone()
    
                if (this.car19.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car19.chassis.body.velocity.length() * 0.1)
    
                this.car19.chassis.body.applyImpulse(slowDownForce, this.car19.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car19.model.chassis.position.copy(this.car19.chassis.body.position).add(this.car19.options.chassisOffset)
            this.car19.model.chassis.quaternion.copy(this.car19.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car19.wheels.bodies) {
                const wheelBody = this.car19.wheels.bodies[_wheelKey]
                const wheelMesh = this.car19.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car19.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car19.forwardSpeed) < 0.01 ? true : this.car19.goingForward
                this.car19.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car19.steering) > this.car19.options.controlsSteeringMax) {
                    this.car19.steering = Math.sign(this.car19.steering) * this.car19.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car19.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car19.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car19.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car19.steering) > steerStrength) {
                        this.car19.steering -= steerStrength * Math.sign(this.car19.steering)
                    } else {
                        this.car19.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car19.steering) > this.car19.options.controlsSteeringMax) {
                    this.car19.steering = Math.sign(this.car19.steering) * this.car19.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car19.options.controlsAcceleratingSpeedBoost : this.car19.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car19.options.controlsAcceleratinMaxSpeedBoost : this.car19.options.controlsAcceleratinMaxSpeed
    
            this.car19.vehicle.applyEngineForce(-this.car19.accelerating, this.car19.wheels.indexes.backLeft)
            this.car19.vehicle.applyEngineForce(-this.car19.accelerating, this.car19.wheels.indexes.backRight)
    
            if (this.car19.options.controlsSteeringQuad) {
                this.car19.vehicle.applyEngineForce(-this.car19.accelerating, this.car19.wheels.indexes.frontLeft)
                this.car19.vehicle.applyEngineForce(-this.car19.accelerating, this.car19.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car19.vehicle.setBrake(this.car19.options.controlsBrakeStrength, 0)
                this.car19.vehicle.setBrake(this.car19.options.controlsBrakeStrength, 1)
                this.car19.vehicle.setBrake(this.car19.options.controlsBrakeStrength, 2)
                this.car19.vehicle.setBrake(this.car19.options.controlsBrakeStrength, 3)
            } else {
                this.car19.vehicle.setBrake(0, 0)
                this.car19.vehicle.setBrake(0, 1)
                this.car19.vehicle.setBrake(0, 2)
                this.car19.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car19.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar18(playerId) {
        this.car18 = {}
    
        this.car18.steering = 0
        this.car18.accelerating = 0
        this.car18.speed = 0
        this.car18.worldForward = new CANNON.Vec3()
        this.car18.angle = 0
        this.car18.forwardSpeed = 0
        this.car18.oldPosition = new CANNON.Vec3()
        this.car18.goingForward = true
    
        // Options
        this.car18.options = {}
        this.car18.options.chassisWidth = 1.02
        this.car18.options.chassisHeight = 1.16
        this.car18.options.chassisDepth = 2.03
        this.car18.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car18.options.chassisMass = 0
        this.car18.options.wheelFrontOffsetDepth = 0.635
        this.car18.options.wheelBackOffsetDepth = -0.475
        this.car18.options.wheelOffsetWidth = 0.39
        this.car18.options.wheelRadius = 0.25
        this.car18.options.wheelHeight = 0.24
        this.car18.options.wheelSuspensionStiffness = 50
        this.car18.options.wheelSuspensionRestLength = 0.1
        this.car18.options.wheelFrictionSlip = 10
        this.car18.options.wheelDampingRelaxation = 1.8
        this.car18.options.wheelDampingCompression = 1.5
        this.car18.options.wheelMaxSuspensionForce = 100000
        this.car18.options.wheelRollInfluence = 0.01
        this.car18.options.wheelMaxSuspensionTravel = 0.3
        this.car18.options.wheelCustomSlidingRotationalSpeed = -30
        this.car18.options.wheelMass = 5
        this.car18.options.controlsSteeringSpeed = 0.005 * 3
        this.car18.options.controlsSteeringMax = Math.PI * 0.17
        this.car18.options.controlsSteeringQuad = false
        this.car18.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car18.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car18.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car18.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car18.options.controlsAcceleratingQuad = true
        this.car18.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car18.upsideDown = {}
        this.car18.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car18.upsideDown.pendingTimeout = null
        this.car18.upsideDown.turningTimeout = null
    
        // Jump
        this.car18.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car18.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car18.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car18.create = () => {

            // Chassis
            this.car18.chassis = {}
    
            this.car18.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car18.options.chassisDepth * 0.5, this.car18.options.chassisWidth * 0.5, this.car18.options.chassisHeight * 0.5))
    
            this.car18.chassis.body = new CANNON.Body({ mass: this.car18.options.chassisMass })
            this.car18.chassis.body.allowSleep = false
            this.car18.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car18.chassis.body.sleep()
            this.car18.chassis.body.addShape(this.car18.chassis.shape, this.car18.options.chassisOffset)
            this.car18.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car18.chassis.body);
            this.car18.chassis.body.playerId = playerId;
    
            // Sound
            this.car18.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car18.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car18.chassis.body
            })
    
            // Wheel
            this.car18.wheels = {}
            this.car18.wheels.options = {
                radius: this.car18.options.wheelRadius,
                height: this.car18.options.wheelHeight,
                suspensionStiffness: this.car18.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car18.options.wheelSuspensionRestLength,
                frictionSlip: this.car18.options.wheelFrictionSlip,
                dampingRelaxation: this.car18.options.wheelDampingRelaxation,
                dampingCompression: this.car18.options.wheelDampingCompression,
                maxSuspensionForce: this.car18.options.wheelMaxSuspensionForce,
                rollInfluence: this.car18.options.wheelRollInfluence,
                maxSuspensionTravel: this.car18.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car18.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car18.wheels.options.chassisConnectionPointLocal.set(this.car18.options.wheelFrontOffsetDepth, this.car18.options.wheelOffsetWidth, 0)
            this.car18.vehicle.addWheel(this.car18.wheels.options)
    
            // Front right
            this.car18.wheels.options.chassisConnectionPointLocal.set(this.car18.options.wheelFrontOffsetDepth, -this.car18.options.wheelOffsetWidth, 0)
            this.car18.vehicle.addWheel(this.car18.wheels.options)
    
            // Back left
            this.car18.wheels.options.chassisConnectionPointLocal.set(this.car18.options.wheelBackOffsetDepth, this.car18.options.wheelOffsetWidth, 0)
            this.car18.vehicle.addWheel(this.car18.wheels.options)
    
            // Back right
            this.car18.wheels.options.chassisConnectionPointLocal.set(this.car18.options.wheelBackOffsetDepth, -this.car18.options.wheelOffsetWidth, 0)
            this.car18.vehicle.addWheel(this.car18.wheels.options)
    
            this.car18.vehicle.addToWorld(this.world)
    
            this.car18.wheels.indexes = {}
    
            this.car18.wheels.indexes.frontLeft = 0
            this.car18.wheels.indexes.frontRight = 1
            this.car18.wheels.indexes.backLeft = 2
            this.car18.wheels.indexes.backRight = 3
            this.car18.wheels.bodies = []
    
            for (const _wheelInfos of this.car18.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car18.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car18.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car18.wheels.bodies.push(body)
            }
    
            // Model
            this.car18.model = {}
            this.car18.model.container = new THREE.Object3D()
            this.models.container.add(this.car18.model.container)
    
            this.car18.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car18.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car18.options.chassisDepth, this.car18.options.chassisWidth, this.car18.options.chassisHeight), this.car18.model.material)
            this.car18.model.container.add(this.car18.model.chassis)
    
            this.car18.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car18.options.wheelRadius, this.car18.options.wheelRadius, this.car18.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car18.model.material)
                this.car18.model.container.add(wheel)
                this.car18.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car18.destroy = () => {
            this.car18.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car18.model.container)
        }
    
        // Recreate method
        this.car18.recreate = () => {
            this.car18.destroy()
            this.car18.create()
            this.car18.chassis.body.wakeUp()
        }
    
        // Brake
        this.car18.brake = () => {
            this.car18.vehicle.setBrake(1, 0)
            this.car18.vehicle.setBrake(1, 1)
            this.car18.vehicle.setBrake(1, 2)
            this.car18.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car18.unbrake = () => {
            this.car18.vehicle.setBrake(0, 0)
            this.car18.vehicle.setBrake(0, 1)
            this.car18.vehicle.setBrake(0, 2)
            this.car18.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car18.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car18.oldPosition)
    
            this.car18.oldPosition.copy(this.car18.chassis.body.position)
            this.car18.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car18.chassis.body.vectorToWorldFrame(localForward, this.car18.worldForward)
            this.car18.angle = Math.atan2(this.car18.worldForward.y, this.car18.worldForward.x)
    
            this.car18.forwardSpeed = this.car18.worldForward.dot(positionDelta)
            this.car18.goingForward = this.car18.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car18.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car18.upsideDown.state === 'watching') {
                    this.car18.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {

                        this.car18.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car18.upsideDown.state = 'turning'
                            this.car18.jump(true)
        
                            this.car18.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car18.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car18.upsideDown.state === 'pending') {
                    this.car18.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car18.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car18.vehicle.wheelInfos.length; i++) {
                this.car18.vehicle.updateWheelTransform(i)
    
                const transform = this.car18.vehicle.wheelInfos[i].worldTransform
                this.car18.wheels.bodies[i].position.copy(transform.position)
                this.car18.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car18.wheels.bodies[i].quaternion = this.car18.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car18.worldForward.clone()
    
                if (this.car18.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car18.chassis.body.velocity.length() * 0.1)
    
                this.car18.chassis.body.applyImpulse(slowDownForce, this.car18.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car18.model.chassis.position.copy(this.car18.chassis.body.position).add(this.car18.options.chassisOffset)
            this.car18.model.chassis.quaternion.copy(this.car18.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car18.wheels.bodies) {
                const wheelBody = this.car18.wheels.bodies[_wheelKey]
                const wheelMesh = this.car18.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car18.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car18.forwardSpeed) < 0.01 ? true : this.car18.goingForward
                this.car18.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car18.steering) > this.car18.options.controlsSteeringMax) {
                    this.car18.steering = Math.sign(this.car18.steering) * this.car18.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car18.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car18.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car18.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car18.steering) > steerStrength) {
                        this.car18.steering -= steerStrength * Math.sign(this.car18.steering)
                    } else {
                        this.car18.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car18.steering) > this.car18.options.controlsSteeringMax) {
                    this.car18.steering = Math.sign(this.car18.steering) * this.car18.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car18.options.controlsAcceleratingSpeedBoost : this.car18.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car18.options.controlsAcceleratinMaxSpeedBoost : this.car18.options.controlsAcceleratinMaxSpeed
    
            this.car18.vehicle.applyEngineForce(-this.car18.accelerating, this.car18.wheels.indexes.backLeft)
            this.car18.vehicle.applyEngineForce(-this.car18.accelerating, this.car18.wheels.indexes.backRight)
    
            if (this.car18.options.controlsSteeringQuad) {
                this.car18.vehicle.applyEngineForce(-this.car18.accelerating, this.car18.wheels.indexes.frontLeft)
                this.car18.vehicle.applyEngineForce(-this.car18.accelerating, this.car18.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car18.vehicle.setBrake(this.car18.options.controlsBrakeStrength, 0)
                this.car18.vehicle.setBrake(this.car18.options.controlsBrakeStrength, 1)
                this.car18.vehicle.setBrake(this.car18.options.controlsBrakeStrength, 2)
                this.car18.vehicle.setBrake(this.car18.options.controlsBrakeStrength, 3)
            } else {
                this.car18.vehicle.setBrake(0, 0)
                this.car18.vehicle.setBrake(0, 1)
                this.car18.vehicle.setBrake(0, 2)
                this.car18.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car18.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar17(playerId) {
        this.car17 = {}
    
        this.car17.steering = 0
        this.car17.accelerating = 0
        this.car17.speed = 0
        this.car17.worldForward = new CANNON.Vec3()
        this.car17.angle = 0
        this.car17.forwardSpeed = 0
        this.car17.oldPosition = new CANNON.Vec3()
        this.car17.goingForward = true
    
        // Options
        this.car17.options = {}
        this.car17.options.chassisWidth = 1.02
        this.car17.options.chassisHeight = 1.16
        this.car17.options.chassisDepth = 2.03
        this.car17.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car17.options.chassisMass = 0
        this.car17.options.wheelFrontOffsetDepth = 0.635
        this.car17.options.wheelBackOffsetDepth = -0.475
        this.car17.options.wheelOffsetWidth = 0.39
        this.car17.options.wheelRadius = 0.25
        this.car17.options.wheelHeight = 0.24
        this.car17.options.wheelSuspensionStiffness = 50
        this.car17.options.wheelSuspensionRestLength = 0.1
        this.car17.options.wheelFrictionSlip = 10
        this.car17.options.wheelDampingRelaxation = 1.8
        this.car17.options.wheelDampingCompression = 1.5
        this.car17.options.wheelMaxSuspensionForce = 100000
        this.car17.options.wheelRollInfluence = 0.01
        this.car17.options.wheelMaxSuspensionTravel = 0.3
        this.car17.options.wheelCustomSlidingRotationalSpeed = -30
        this.car17.options.wheelMass = 5
        this.car17.options.controlsSteeringSpeed = 0.005 * 3
        this.car17.options.controlsSteeringMax = Math.PI * 0.17
        this.car17.options.controlsSteeringQuad = false
        this.car17.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car17.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car17.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car17.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car17.options.controlsAcceleratingQuad = true
        this.car17.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car17.upsideDown = {}
        this.car17.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car17.upsideDown.pendingTimeout = null
        this.car17.upsideDown.turningTimeout = null
    
        // Jump
        this.car17.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car17.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car17.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car17.create = () => {

            // Chassis
            this.car17.chassis = {}
    
            this.car17.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car17.options.chassisDepth * 0.5, this.car17.options.chassisWidth * 0.5, this.car17.options.chassisHeight * 0.5))
    
            this.car17.chassis.body = new CANNON.Body({ mass: this.car17.options.chassisMass })
            this.car17.chassis.body.allowSleep = false
            this.car17.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car17.chassis.body.sleep()
            this.car17.chassis.body.addShape(this.car17.chassis.shape, this.car17.options.chassisOffset)
            this.car17.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car17.chassis.body);
            this.car17.chassis.body.playerId = playerId;
    
            // Sound
            this.car17.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car17.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car17.chassis.body
            })
    
            // Wheel
            this.car17.wheels = {}
            this.car17.wheels.options = {
                radius: this.car17.options.wheelRadius,
                height: this.car17.options.wheelHeight,
                suspensionStiffness: this.car17.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car17.options.wheelSuspensionRestLength,
                frictionSlip: this.car17.options.wheelFrictionSlip,
                dampingRelaxation: this.car17.options.wheelDampingRelaxation,
                dampingCompression: this.car17.options.wheelDampingCompression,
                maxSuspensionForce: this.car17.options.wheelMaxSuspensionForce,
                rollInfluence: this.car17.options.wheelRollInfluence,
                maxSuspensionTravel: this.car17.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car17.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car17.wheels.options.chassisConnectionPointLocal.set(this.car17.options.wheelFrontOffsetDepth, this.car17.options.wheelOffsetWidth, 0)
            this.car17.vehicle.addWheel(this.car17.wheels.options)
    
            // Front right
            this.car17.wheels.options.chassisConnectionPointLocal.set(this.car17.options.wheelFrontOffsetDepth, -this.car17.options.wheelOffsetWidth, 0)
            this.car17.vehicle.addWheel(this.car17.wheels.options)
    
            // Back left
            this.car17.wheels.options.chassisConnectionPointLocal.set(this.car17.options.wheelBackOffsetDepth, this.car17.options.wheelOffsetWidth, 0)
            this.car17.vehicle.addWheel(this.car17.wheels.options)
    
            // Back right
            this.car17.wheels.options.chassisConnectionPointLocal.set(this.car17.options.wheelBackOffsetDepth, -this.car17.options.wheelOffsetWidth, 0)
            this.car17.vehicle.addWheel(this.car17.wheels.options)
    
            this.car17.vehicle.addToWorld(this.world)
    
            this.car17.wheels.indexes = {}
    
            this.car17.wheels.indexes.frontLeft = 0
            this.car17.wheels.indexes.frontRight = 1
            this.car17.wheels.indexes.backLeft = 2
            this.car17.wheels.indexes.backRight = 3
            this.car17.wheels.bodies = []
    
            for (const _wheelInfos of this.car17.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car17.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car17.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car17.wheels.bodies.push(body)
            }
    
            // Model
            this.car17.model = {}
            this.car17.model.container = new THREE.Object3D()
            this.models.container.add(this.car17.model.container)
    
            this.car17.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car17.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car17.options.chassisDepth, this.car17.options.chassisWidth, this.car17.options.chassisHeight), this.car17.model.material)
            this.car17.model.container.add(this.car17.model.chassis)
    
            this.car17.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car17.options.wheelRadius, this.car17.options.wheelRadius, this.car17.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car17.model.material)
                this.car17.model.container.add(wheel)
                this.car17.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car17.destroy = () => {
            this.car17.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car17.model.container)
        }
    
        // Recreate method
        this.car17.recreate = () => {
            this.car17.destroy()
            this.car17.create()
            this.car17.chassis.body.wakeUp()
        }
    
        // Brake
        this.car17.brake = () => {
            this.car17.vehicle.setBrake(1, 0)
            this.car17.vehicle.setBrake(1, 1)
            this.car17.vehicle.setBrake(1, 2)
            this.car17.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car17.unbrake = () => {
            this.car17.vehicle.setBrake(0, 0)
            this.car17.vehicle.setBrake(0, 1)
            this.car17.vehicle.setBrake(0, 2)
            this.car17.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car17.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car17.oldPosition)
    
            this.car17.oldPosition.copy(this.car17.chassis.body.position)
            this.car17.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car17.chassis.body.vectorToWorldFrame(localForward, this.car17.worldForward)
            this.car17.angle = Math.atan2(this.car17.worldForward.y, this.car17.worldForward.x)
    
            this.car17.forwardSpeed = this.car17.worldForward.dot(positionDelta)
            this.car17.goingForward = this.car17.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car17.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car17.upsideDown.state === 'watching') {
                    this.car17.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {

                        this.car17.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car17.upsideDown.state = 'turning'
                            this.car17.jump(true)
        
                            this.car17.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car17.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car17.upsideDown.state === 'pending') {
                    this.car17.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car17.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car17.vehicle.wheelInfos.length; i++) {
                this.car17.vehicle.updateWheelTransform(i)
    
                const transform = this.car17.vehicle.wheelInfos[i].worldTransform
                this.car17.wheels.bodies[i].position.copy(transform.position)
                this.car17.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car17.wheels.bodies[i].quaternion = this.car17.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car17.worldForward.clone()
    
                if (this.car17.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car17.chassis.body.velocity.length() * 0.1)
    
                this.car17.chassis.body.applyImpulse(slowDownForce, this.car17.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car17.model.chassis.position.copy(this.car17.chassis.body.position).add(this.car17.options.chassisOffset)
            this.car17.model.chassis.quaternion.copy(this.car17.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car17.wheels.bodies) {
                const wheelBody = this.car17.wheels.bodies[_wheelKey]
                const wheelMesh = this.car17.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car17.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car17.forwardSpeed) < 0.01 ? true : this.car17.goingForward
                this.car17.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car17.steering) > this.car17.options.controlsSteeringMax) {
                    this.car17.steering = Math.sign(this.car17.steering) * this.car17.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car17.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car17.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car17.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car17.steering) > steerStrength) {
                        this.car17.steering -= steerStrength * Math.sign(this.car17.steering)
                    } else {
                        this.car17.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car17.steering) > this.car17.options.controlsSteeringMax) {
                    this.car17.steering = Math.sign(this.car17.steering) * this.car17.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car17.options.controlsAcceleratingSpeedBoost : this.car17.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car17.options.controlsAcceleratinMaxSpeedBoost : this.car17.options.controlsAcceleratinMaxSpeed
    
            this.car17.vehicle.applyEngineForce(-this.car17.accelerating, this.car17.wheels.indexes.backLeft)
            this.car17.vehicle.applyEngineForce(-this.car17.accelerating, this.car17.wheels.indexes.backRight)
    
            if (this.car17.options.controlsSteeringQuad) {
                this.car17.vehicle.applyEngineForce(-this.car17.accelerating, this.car17.wheels.indexes.frontLeft)
                this.car17.vehicle.applyEngineForce(-this.car17.accelerating, this.car17.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car17.vehicle.setBrake(this.car17.options.controlsBrakeStrength, 0)
                this.car17.vehicle.setBrake(this.car17.options.controlsBrakeStrength, 1)
                this.car17.vehicle.setBrake(this.car17.options.controlsBrakeStrength, 2)
                this.car17.vehicle.setBrake(this.car17.options.controlsBrakeStrength, 3)
            } else {
                this.car17.vehicle.setBrake(0, 0)
                this.car17.vehicle.setBrake(0, 1)
                this.car17.vehicle.setBrake(0, 2)
                this.car17.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car17.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar16(playerId) {
        this.car16 = {}
    
        this.car16.steering = 0
        this.car16.accelerating = 0
        this.car16.speed = 0
        this.car16.worldForward = new CANNON.Vec3()
        this.car16.angle = 0
        this.car16.forwardSpeed = 0
        this.car16.oldPosition = new CANNON.Vec3()
        this.car16.goingForward = true
    
        // Options
        this.car16.options = {}
        this.car16.options.chassisWidth = 1.02
        this.car16.options.chassisHeight = 1.16
        this.car16.options.chassisDepth = 2.03
        this.car16.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car16.options.chassisMass = 0
        this.car16.options.wheelFrontOffsetDepth = 0.635
        this.car16.options.wheelBackOffsetDepth = -0.475
        this.car16.options.wheelOffsetWidth = 0.39
        this.car16.options.wheelRadius = 0.25
        this.car16.options.wheelHeight = 0.24
        this.car16.options.wheelSuspensionStiffness = 50
        this.car16.options.wheelSuspensionRestLength = 0.1
        this.car16.options.wheelFrictionSlip = 10
        this.car16.options.wheelDampingRelaxation = 1.8
        this.car16.options.wheelDampingCompression = 1.5
        this.car16.options.wheelMaxSuspensionForce = 100000
        this.car16.options.wheelRollInfluence = 0.01
        this.car16.options.wheelMaxSuspensionTravel = 0.3
        this.car16.options.wheelCustomSlidingRotationalSpeed = -30
        this.car16.options.wheelMass = 5
        this.car16.options.controlsSteeringSpeed = 0.005 * 3
        this.car16.options.controlsSteeringMax = Math.PI * 0.17
        this.car16.options.controlsSteeringQuad = false
        this.car16.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car16.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car16.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car16.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car16.options.controlsAcceleratingQuad = true
        this.car16.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car16.upsideDown = {}
        this.car16.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car16.upsideDown.pendingTimeout = null
        this.car16.upsideDown.turningTimeout = null
    
        // Jump
        this.car16.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car16.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car16.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car16.create = () => {

            // Chassis
            this.car16.chassis = {}
    
            this.car16.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car16.options.chassisDepth * 0.5, this.car16.options.chassisWidth * 0.5, this.car16.options.chassisHeight * 0.5))
    
            this.car16.chassis.body = new CANNON.Body({ mass: this.car16.options.chassisMass })
            this.car16.chassis.body.allowSleep = false
            this.car16.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car16.chassis.body.sleep()
            this.car16.chassis.body.addShape(this.car16.chassis.shape, this.car16.options.chassisOffset)
            this.car16.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car16.chassis.body);
            this.car16.chassis.body.playerId = playerId;
    
            // Sound
            this.car16.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car16.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car16.chassis.body
            })
    
            // Wheel
            this.car16.wheels = {}
            this.car16.wheels.options = {
                radius: this.car16.options.wheelRadius,
                height: this.car16.options.wheelHeight,
                suspensionStiffness: this.car16.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car16.options.wheelSuspensionRestLength,
                frictionSlip: this.car16.options.wheelFrictionSlip,
                dampingRelaxation: this.car16.options.wheelDampingRelaxation,
                dampingCompression: this.car16.options.wheelDampingCompression,
                maxSuspensionForce: this.car16.options.wheelMaxSuspensionForce,
                rollInfluence: this.car16.options.wheelRollInfluence,
                maxSuspensionTravel: this.car16.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car16.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car16.wheels.options.chassisConnectionPointLocal.set(this.car16.options.wheelFrontOffsetDepth, this.car16.options.wheelOffsetWidth, 0)
            this.car16.vehicle.addWheel(this.car16.wheels.options)
    
            // Front right
            this.car16.wheels.options.chassisConnectionPointLocal.set(this.car16.options.wheelFrontOffsetDepth, -this.car16.options.wheelOffsetWidth, 0)
            this.car16.vehicle.addWheel(this.car16.wheels.options)
    
            // Back left
            this.car16.wheels.options.chassisConnectionPointLocal.set(this.car16.options.wheelBackOffsetDepth, this.car16.options.wheelOffsetWidth, 0)
            this.car16.vehicle.addWheel(this.car16.wheels.options)
    
            // Back right
            this.car16.wheels.options.chassisConnectionPointLocal.set(this.car16.options.wheelBackOffsetDepth, -this.car16.options.wheelOffsetWidth, 0)
            this.car16.vehicle.addWheel(this.car16.wheels.options)
    
            this.car16.vehicle.addToWorld(this.world)
    
            this.car16.wheels.indexes = {}
    
            this.car16.wheels.indexes.frontLeft = 0
            this.car16.wheels.indexes.frontRight = 1
            this.car16.wheels.indexes.backLeft = 2
            this.car16.wheels.indexes.backRight = 3
            this.car16.wheels.bodies = []
    
            for (const _wheelInfos of this.car16.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car16.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car16.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car16.wheels.bodies.push(body)
            }
    
            // Model
            this.car16.model = {}
            this.car16.model.container = new THREE.Object3D()
            this.models.container.add(this.car16.model.container)
    
            this.car16.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car16.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car16.options.chassisDepth, this.car16.options.chassisWidth, this.car16.options.chassisHeight), this.car16.model.material)
            this.car16.model.container.add(this.car16.model.chassis)
    
            this.car16.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car16.options.wheelRadius, this.car16.options.wheelRadius, this.car16.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car16.model.material)
                this.car16.model.container.add(wheel)
                this.car16.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car16.destroy = () => {
            this.car16.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car16.model.container)
        }
    
        // Recreate method
        this.car16.recreate = () => {
            this.car16.destroy()
            this.car16.create()
            this.car16.chassis.body.wakeUp()
        }
    
        // Brake
        this.car16.brake = () => {
            this.car16.vehicle.setBrake(1, 0)
            this.car16.vehicle.setBrake(1, 1)
            this.car16.vehicle.setBrake(1, 2)
            this.car16.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car16.unbrake = () => {
            this.car16.vehicle.setBrake(0, 0)
            this.car16.vehicle.setBrake(0, 1)
            this.car16.vehicle.setBrake(0, 2)
            this.car16.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car16.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car16.oldPosition)
    
            this.car16.oldPosition.copy(this.car16.chassis.body.position)
            this.car16.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car16.chassis.body.vectorToWorldFrame(localForward, this.car16.worldForward)
            this.car16.angle = Math.atan2(this.car16.worldForward.y, this.car16.worldForward.x)
    
            this.car16.forwardSpeed = this.car16.worldForward.dot(positionDelta)
            this.car16.goingForward = this.car16.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car16.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car16.upsideDown.state === 'watching') {
                    this.car16.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car16.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car16.upsideDown.state = 'turning'
                            this.car16.jump(true)
        
                            this.car16.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car16.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car16.upsideDown.state === 'pending') {
                    this.car16.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car16.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car16.vehicle.wheelInfos.length; i++) {
                this.car16.vehicle.updateWheelTransform(i)
    
                const transform = this.car16.vehicle.wheelInfos[i].worldTransform
                this.car16.wheels.bodies[i].position.copy(transform.position)
                this.car16.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car16.wheels.bodies[i].quaternion = this.car16.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car16.worldForward.clone()
    
                if (this.car16.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car16.chassis.body.velocity.length() * 0.1)
    
                this.car16.chassis.body.applyImpulse(slowDownForce, this.car16.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car16.model.chassis.position.copy(this.car16.chassis.body.position).add(this.car16.options.chassisOffset)
            this.car16.model.chassis.quaternion.copy(this.car16.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car16.wheels.bodies) {
                const wheelBody = this.car16.wheels.bodies[_wheelKey]
                const wheelMesh = this.car16.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car16.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car16.forwardSpeed) < 0.01 ? true : this.car16.goingForward
                this.car16.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car16.steering) > this.car16.options.controlsSteeringMax) {
                    this.car16.steering = Math.sign(this.car16.steering) * this.car16.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car16.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car16.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car16.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car16.steering) > steerStrength) {
                        this.car16.steering -= steerStrength * Math.sign(this.car16.steering)
                    } else {
                        this.car16.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car16.steering) > this.car16.options.controlsSteeringMax) {
                    this.car16.steering = Math.sign(this.car16.steering) * this.car16.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car16.options.controlsAcceleratingSpeedBoost : this.car16.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car16.options.controlsAcceleratinMaxSpeedBoost : this.car16.options.controlsAcceleratinMaxSpeed
    
            this.car16.vehicle.applyEngineForce(-this.car16.accelerating, this.car16.wheels.indexes.backLeft)
            this.car16.vehicle.applyEngineForce(-this.car16.accelerating, this.car16.wheels.indexes.backRight)
    
            if (this.car16.options.controlsSteeringQuad) {
                this.car16.vehicle.applyEngineForce(-this.car16.accelerating, this.car16.wheels.indexes.frontLeft)
                this.car16.vehicle.applyEngineForce(-this.car16.accelerating, this.car16.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car16.vehicle.setBrake(this.car16.options.controlsBrakeStrength, 0)
                this.car16.vehicle.setBrake(this.car16.options.controlsBrakeStrength, 1)
                this.car16.vehicle.setBrake(this.car16.options.controlsBrakeStrength, 2)
                this.car16.vehicle.setBrake(this.car16.options.controlsBrakeStrength, 3)
            } else {
                this.car16.vehicle.setBrake(0, 0)
                this.car16.vehicle.setBrake(0, 1)
                this.car16.vehicle.setBrake(0, 2)
                this.car16.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car16.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar15(playerId) {
        this.car15 = {}
    
        this.car15.steering = 0
        this.car15.accelerating = 0
        this.car15.speed = 0
        this.car15.worldForward = new CANNON.Vec3()
        this.car15.angle = 0
        this.car15.forwardSpeed = 0
        this.car15.oldPosition = new CANNON.Vec3()
        this.car15.goingForward = true
    
        // Options
        this.car15.options = {}
        this.car15.options.chassisWidth = 1.02
        this.car15.options.chassisHeight = 1.16
        this.car15.options.chassisDepth = 2.03
        this.car15.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car15.options.chassisMass = 0
        this.car15.options.wheelFrontOffsetDepth = 0.635
        this.car15.options.wheelBackOffsetDepth = -0.475
        this.car15.options.wheelOffsetWidth = 0.39
        this.car15.options.wheelRadius = 0.25
        this.car15.options.wheelHeight = 0.24
        this.car15.options.wheelSuspensionStiffness = 50
        this.car15.options.wheelSuspensionRestLength = 0.1
        this.car15.options.wheelFrictionSlip = 10
        this.car15.options.wheelDampingRelaxation = 1.8
        this.car15.options.wheelDampingCompression = 1.5
        this.car15.options.wheelMaxSuspensionForce = 100000
        this.car15.options.wheelRollInfluence = 0.01
        this.car15.options.wheelMaxSuspensionTravel = 0.3
        this.car15.options.wheelCustomSlidingRotationalSpeed = -30
        this.car15.options.wheelMass = 5
        this.car15.options.controlsSteeringSpeed = 0.005 * 3
        this.car15.options.controlsSteeringMax = Math.PI * 0.17
        this.car15.options.controlsSteeringQuad = false
        this.car15.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car15.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car15.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car15.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car15.options.controlsAcceleratingQuad = true
        this.car15.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car15.upsideDown = {}
        this.car15.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car15.upsideDown.pendingTimeout = null
        this.car15.upsideDown.turningTimeout = null
    
        // Jump
        this.car15.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car15.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car15.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car15.create = () => {

            // Chassis
            this.car15.chassis = {}
    
            this.car15.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car15.options.chassisDepth * 0.5, this.car15.options.chassisWidth * 0.5, this.car15.options.chassisHeight * 0.5))
    
            this.car15.chassis.body = new CANNON.Body({ mass: this.car15.options.chassisMass })
            this.car15.chassis.body.allowSleep = false
            this.car15.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car15.chassis.body.sleep()
            this.car15.chassis.body.addShape(this.car15.chassis.shape, this.car15.options.chassisOffset)
            this.car15.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car15.chassis.body);
            this.car15.chassis.body.playerId = playerId;
    
            // Sound
            this.car15.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car15.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car15.chassis.body
            })
    
            // Wheel
            this.car15.wheels = {}
            this.car15.wheels.options = {
                radius: this.car15.options.wheelRadius,
                height: this.car15.options.wheelHeight,
                suspensionStiffness: this.car15.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car15.options.wheelSuspensionRestLength,
                frictionSlip: this.car15.options.wheelFrictionSlip,
                dampingRelaxation: this.car15.options.wheelDampingRelaxation,
                dampingCompression: this.car15.options.wheelDampingCompression,
                maxSuspensionForce: this.car15.options.wheelMaxSuspensionForce,
                rollInfluence: this.car15.options.wheelRollInfluence,
                maxSuspensionTravel: this.car15.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car15.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car15.wheels.options.chassisConnectionPointLocal.set(this.car15.options.wheelFrontOffsetDepth, this.car15.options.wheelOffsetWidth, 0)
            this.car15.vehicle.addWheel(this.car15.wheels.options)
    
            // Front right
            this.car15.wheels.options.chassisConnectionPointLocal.set(this.car15.options.wheelFrontOffsetDepth, -this.car15.options.wheelOffsetWidth, 0)
            this.car15.vehicle.addWheel(this.car15.wheels.options)
    
            // Back left
            this.car15.wheels.options.chassisConnectionPointLocal.set(this.car15.options.wheelBackOffsetDepth, this.car15.options.wheelOffsetWidth, 0)
            this.car15.vehicle.addWheel(this.car15.wheels.options)
    
            // Back right
            this.car15.wheels.options.chassisConnectionPointLocal.set(this.car15.options.wheelBackOffsetDepth, -this.car15.options.wheelOffsetWidth, 0)
            this.car15.vehicle.addWheel(this.car15.wheels.options)
    
            this.car15.vehicle.addToWorld(this.world)
    
            this.car15.wheels.indexes = {}
    
            this.car15.wheels.indexes.frontLeft = 0
            this.car15.wheels.indexes.frontRight = 1
            this.car15.wheels.indexes.backLeft = 2
            this.car15.wheels.indexes.backRight = 3
            this.car15.wheels.bodies = []
    
            for (const _wheelInfos of this.car15.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car15.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car15.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car15.wheels.bodies.push(body)
            }
    
            // Model
            this.car15.model = {}
            this.car15.model.container = new THREE.Object3D()
            this.models.container.add(this.car15.model.container)
    
            this.car15.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car15.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car15.options.chassisDepth, this.car15.options.chassisWidth, this.car15.options.chassisHeight), this.car15.model.material)
            this.car15.model.container.add(this.car15.model.chassis)
    
            this.car15.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car15.options.wheelRadius, this.car15.options.wheelRadius, this.car15.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car15.model.material)
                this.car15.model.container.add(wheel)
                this.car15.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car15.destroy = () => {
            this.car15.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car15.model.container)
        }
    
        // Recreate method
        this.car15.recreate = () => {
            this.car15.destroy()
            this.car15.create()
            this.car15.chassis.body.wakeUp()
        }
    
        // Brake
        this.car15.brake = () => {
            this.car15.vehicle.setBrake(1, 0)
            this.car15.vehicle.setBrake(1, 1)
            this.car15.vehicle.setBrake(1, 2)
            this.car15.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car15.unbrake = () => {
            this.car15.vehicle.setBrake(0, 0)
            this.car15.vehicle.setBrake(0, 1)
            this.car15.vehicle.setBrake(0, 2)
            this.car15.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car15.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car15.oldPosition)
    
            this.car15.oldPosition.copy(this.car15.chassis.body.position)
            this.car15.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car15.chassis.body.vectorToWorldFrame(localForward, this.car15.worldForward)
            this.car15.angle = Math.atan2(this.car15.worldForward.y, this.car15.worldForward.x)
    
            this.car15.forwardSpeed = this.car15.worldForward.dot(positionDelta)
            this.car15.goingForward = this.car15.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car15.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car15.upsideDown.state === 'watching') {
                    this.car15.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {

                        this.car15.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car15.upsideDown.state = 'turning'
                            this.car15.jump(true)
        
                            this.car15.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car15.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car15.upsideDown.state === 'pending') {
                    this.car15.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car15.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car15.vehicle.wheelInfos.length; i++) {
                this.car15.vehicle.updateWheelTransform(i)
    
                const transform = this.car15.vehicle.wheelInfos[i].worldTransform
                this.car15.wheels.bodies[i].position.copy(transform.position)
                this.car15.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car15.wheels.bodies[i].quaternion = this.car15.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car15.worldForward.clone()
    
                if (this.car15.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car15.chassis.body.velocity.length() * 0.1)
    
                this.car15.chassis.body.applyImpulse(slowDownForce, this.car15.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car15.model.chassis.position.copy(this.car15.chassis.body.position).add(this.car15.options.chassisOffset)
            this.car15.model.chassis.quaternion.copy(this.car15.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car15.wheels.bodies) {
                const wheelBody = this.car15.wheels.bodies[_wheelKey]
                const wheelMesh = this.car15.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car15.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car15.forwardSpeed) < 0.01 ? true : this.car15.goingForward
                this.car15.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car15.steering) > this.car15.options.controlsSteeringMax) {
                    this.car15.steering = Math.sign(this.car15.steering) * this.car15.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car15.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car15.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car15.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car15.steering) > steerStrength) {
                        this.car15.steering -= steerStrength * Math.sign(this.car15.steering)
                    } else {
                        this.car15.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car15.steering) > this.car15.options.controlsSteeringMax) {
                    this.car15.steering = Math.sign(this.car15.steering) * this.car15.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car15.options.controlsAcceleratingSpeedBoost : this.car15.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car15.options.controlsAcceleratinMaxSpeedBoost : this.car15.options.controlsAcceleratinMaxSpeed
    
            this.car15.vehicle.applyEngineForce(-this.car15.accelerating, this.car15.wheels.indexes.backLeft)
            this.car15.vehicle.applyEngineForce(-this.car15.accelerating, this.car15.wheels.indexes.backRight)
    
            if (this.car15.options.controlsSteeringQuad) {
                this.car15.vehicle.applyEngineForce(-this.car15.accelerating, this.car15.wheels.indexes.frontLeft)
                this.car15.vehicle.applyEngineForce(-this.car15.accelerating, this.car15.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car15.vehicle.setBrake(this.car15.options.controlsBrakeStrength, 0)
                this.car15.vehicle.setBrake(this.car15.options.controlsBrakeStrength, 1)
                this.car15.vehicle.setBrake(this.car15.options.controlsBrakeStrength, 2)
                this.car15.vehicle.setBrake(this.car15.options.controlsBrakeStrength, 3)
            } else {
                this.car15.vehicle.setBrake(0, 0)
                this.car15.vehicle.setBrake(0, 1)
                this.car15.vehicle.setBrake(0, 2)
                this.car15.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car15.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar14(playerId) {
        this.car14 = {}
    
        this.car14.steering = 0
        this.car14.accelerating = 0
        this.car14.speed = 0
        this.car14.worldForward = new CANNON.Vec3()
        this.car14.angle = 0
        this.car14.forwardSpeed = 0
        this.car14.oldPosition = new CANNON.Vec3()
        this.car14.goingForward = true
    
        // Options
        this.car14.options = {}
        this.car14.options.chassisWidth = 1.02
        this.car14.options.chassisHeight = 1.16
        this.car14.options.chassisDepth = 2.03
        this.car14.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car14.options.chassisMass = 0
        this.car14.options.wheelFrontOffsetDepth = 0.635
        this.car14.options.wheelBackOffsetDepth = -0.475
        this.car14.options.wheelOffsetWidth = 0.39
        this.car14.options.wheelRadius = 0.25
        this.car14.options.wheelHeight = 0.24
        this.car14.options.wheelSuspensionStiffness = 50
        this.car14.options.wheelSuspensionRestLength = 0.1
        this.car14.options.wheelFrictionSlip = 10
        this.car14.options.wheelDampingRelaxation = 1.8
        this.car14.options.wheelDampingCompression = 1.5
        this.car14.options.wheelMaxSuspensionForce = 100000
        this.car14.options.wheelRollInfluence = 0.01
        this.car14.options.wheelMaxSuspensionTravel = 0.3
        this.car14.options.wheelCustomSlidingRotationalSpeed = -30
        this.car14.options.wheelMass = 5
        this.car14.options.controlsSteeringSpeed = 0.005 * 3
        this.car14.options.controlsSteeringMax = Math.PI * 0.17
        this.car14.options.controlsSteeringQuad = false
        this.car14.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car14.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car14.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car14.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car14.options.controlsAcceleratingQuad = true
        this.car14.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car14.upsideDown = {}
        this.car14.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car14.upsideDown.pendingTimeout = null
        this.car14.upsideDown.turningTimeout = null
    
        // Jump
        this.car14.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car14.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car14.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car14.create = () => {

            // Chassis
            this.car14.chassis = {}
    
            this.car14.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car14.options.chassisDepth * 0.5, this.car14.options.chassisWidth * 0.5, this.car14.options.chassisHeight * 0.5))
    
            this.car14.chassis.body = new CANNON.Body({ mass: this.car14.options.chassisMass })
            this.car14.chassis.body.allowSleep = false
            this.car14.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car14.chassis.body.sleep()
            this.car14.chassis.body.addShape(this.car14.chassis.shape, this.car14.options.chassisOffset)
            this.car14.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car14.chassis.body);
            this.car14.chassis.body.playerId = playerId;
    
            // Sound
            this.car14.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car14.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car14.chassis.body
            })
    
            // Wheel
            this.car14.wheels = {}
            this.car14.wheels.options = {
                radius: this.car14.options.wheelRadius,
                height: this.car14.options.wheelHeight,
                suspensionStiffness: this.car14.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car14.options.wheelSuspensionRestLength,
                frictionSlip: this.car14.options.wheelFrictionSlip,
                dampingRelaxation: this.car14.options.wheelDampingRelaxation,
                dampingCompression: this.car14.options.wheelDampingCompression,
                maxSuspensionForce: this.car14.options.wheelMaxSuspensionForce,
                rollInfluence: this.car14.options.wheelRollInfluence,
                maxSuspensionTravel: this.car14.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car14.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car14.wheels.options.chassisConnectionPointLocal.set(this.car14.options.wheelFrontOffsetDepth, this.car14.options.wheelOffsetWidth, 0)
            this.car14.vehicle.addWheel(this.car14.wheels.options)
    
            // Front right
            this.car14.wheels.options.chassisConnectionPointLocal.set(this.car14.options.wheelFrontOffsetDepth, -this.car14.options.wheelOffsetWidth, 0)
            this.car14.vehicle.addWheel(this.car14.wheels.options)
    
            // Back left
            this.car14.wheels.options.chassisConnectionPointLocal.set(this.car14.options.wheelBackOffsetDepth, this.car14.options.wheelOffsetWidth, 0)
            this.car14.vehicle.addWheel(this.car14.wheels.options)
    
            // Back right
            this.car14.wheels.options.chassisConnectionPointLocal.set(this.car14.options.wheelBackOffsetDepth, -this.car14.options.wheelOffsetWidth, 0)
            this.car14.vehicle.addWheel(this.car14.wheels.options)
    
            this.car14.vehicle.addToWorld(this.world)
    
            this.car14.wheels.indexes = {}
    
            this.car14.wheels.indexes.frontLeft = 0
            this.car14.wheels.indexes.frontRight = 1
            this.car14.wheels.indexes.backLeft = 2
            this.car14.wheels.indexes.backRight = 3
            this.car14.wheels.bodies = []
    
            for (const _wheelInfos of this.car14.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car14.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car14.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car14.wheels.bodies.push(body)
            }
    
            // Model
            this.car14.model = {}
            this.car14.model.container = new THREE.Object3D()
            this.models.container.add(this.car14.model.container)
    
            this.car14.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car14.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car14.options.chassisDepth, this.car14.options.chassisWidth, this.car14.options.chassisHeight), this.car14.model.material)
            this.car14.model.container.add(this.car14.model.chassis)
    
            this.car14.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car14.options.wheelRadius, this.car14.options.wheelRadius, this.car14.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car14.model.material)
                this.car14.model.container.add(wheel)
                this.car14.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car14.destroy = () => {
            this.car14.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car14.model.container)
        }
    
        // Recreate method
        this.car14.recreate = () => {
            this.car14.destroy()
            this.car14.create()
            this.car14.chassis.body.wakeUp()
        }
    
        // Brake
        this.car14.brake = () => {
            this.car14.vehicle.setBrake(1, 0)
            this.car14.vehicle.setBrake(1, 1)
            this.car14.vehicle.setBrake(1, 2)
            this.car14.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car14.unbrake = () => {
            this.car14.vehicle.setBrake(0, 0)
            this.car14.vehicle.setBrake(0, 1)
            this.car14.vehicle.setBrake(0, 2)
            this.car14.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car14.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car14.oldPosition)
    
            this.car14.oldPosition.copy(this.car14.chassis.body.position)
            this.car14.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car14.chassis.body.vectorToWorldFrame(localForward, this.car14.worldForward)
            this.car14.angle = Math.atan2(this.car14.worldForward.y, this.car14.worldForward.x)
    
            this.car14.forwardSpeed = this.car14.worldForward.dot(positionDelta)
            this.car14.goingForward = this.car14.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car14.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car14.upsideDown.state === 'watching') {
                    this.car14.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car14.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car14.upsideDown.state = 'turning'
                            this.car14.jump(true)
        
                            this.car14.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car14.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car14.upsideDown.state === 'pending') {
                    this.car14.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car14.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car14.vehicle.wheelInfos.length; i++) {
                this.car14.vehicle.updateWheelTransform(i)
    
                const transform = this.car14.vehicle.wheelInfos[i].worldTransform
                this.car14.wheels.bodies[i].position.copy(transform.position)
                this.car14.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car14.wheels.bodies[i].quaternion = this.car14.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car14.worldForward.clone()
    
                if (this.car14.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car14.chassis.body.velocity.length() * 0.1)
    
                this.car14.chassis.body.applyImpulse(slowDownForce, this.car14.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car14.model.chassis.position.copy(this.car14.chassis.body.position).add(this.car14.options.chassisOffset)
            this.car14.model.chassis.quaternion.copy(this.car14.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car14.wheels.bodies) {
                const wheelBody = this.car14.wheels.bodies[_wheelKey]
                const wheelMesh = this.car14.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car14.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car14.forwardSpeed) < 0.01 ? true : this.car14.goingForward
                this.car14.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car14.steering) > this.car14.options.controlsSteeringMax) {
                    this.car14.steering = Math.sign(this.car14.steering) * this.car14.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car14.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car14.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car14.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car14.steering) > steerStrength) {
                        this.car14.steering -= steerStrength * Math.sign(this.car14.steering)
                    } else {
                        this.car14.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car14.steering) > this.car14.options.controlsSteeringMax) {
                    this.car14.steering = Math.sign(this.car14.steering) * this.car14.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car14.options.controlsAcceleratingSpeedBoost : this.car14.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car14.options.controlsAcceleratinMaxSpeedBoost : this.car14.options.controlsAcceleratinMaxSpeed
    
            this.car14.vehicle.applyEngineForce(-this.car14.accelerating, this.car14.wheels.indexes.backLeft)
            this.car14.vehicle.applyEngineForce(-this.car14.accelerating, this.car14.wheels.indexes.backRight)
    
            if (this.car14.options.controlsSteeringQuad) {
                this.car14.vehicle.applyEngineForce(-this.car14.accelerating, this.car14.wheels.indexes.frontLeft)
                this.car14.vehicle.applyEngineForce(-this.car14.accelerating, this.car14.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car14.vehicle.setBrake(this.car14.options.controlsBrakeStrength, 0)
                this.car14.vehicle.setBrake(this.car14.options.controlsBrakeStrength, 1)
                this.car14.vehicle.setBrake(this.car14.options.controlsBrakeStrength, 2)
                this.car14.vehicle.setBrake(this.car14.options.controlsBrakeStrength, 3)
            } else {
                this.car14.vehicle.setBrake(0, 0)
                this.car14.vehicle.setBrake(0, 1)
                this.car14.vehicle.setBrake(0, 2)
                this.car14.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car14.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar13(playerId) {
        this.car13 = {}
    
        this.car13.steering = 0
        this.car13.accelerating = 0
        this.car13.speed = 0
        this.car13.worldForward = new CANNON.Vec3()
        this.car13.angle = 0
        this.car13.forwardSpeed = 0
        this.car13.oldPosition = new CANNON.Vec3()
        this.car13.goingForward = true
    
        // Options
        this.car13.options = {}
        this.car13.options.chassisWidth = 1.02
        this.car13.options.chassisHeight = 1.16
        this.car13.options.chassisDepth = 2.03
        this.car13.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car13.options.chassisMass = 0
        this.car13.options.wheelFrontOffsetDepth = 0.635
        this.car13.options.wheelBackOffsetDepth = -0.475
        this.car13.options.wheelOffsetWidth = 0.39
        this.car13.options.wheelRadius = 0.25
        this.car13.options.wheelHeight = 0.24
        this.car13.options.wheelSuspensionStiffness = 50
        this.car13.options.wheelSuspensionRestLength = 0.1
        this.car13.options.wheelFrictionSlip = 10
        this.car13.options.wheelDampingRelaxation = 1.8
        this.car13.options.wheelDampingCompression = 1.5
        this.car13.options.wheelMaxSuspensionForce = 100000
        this.car13.options.wheelRollInfluence = 0.01
        this.car13.options.wheelMaxSuspensionTravel = 0.3
        this.car13.options.wheelCustomSlidingRotationalSpeed = -30
        this.car13.options.wheelMass = 5
        this.car13.options.controlsSteeringSpeed = 0.005 * 3
        this.car13.options.controlsSteeringMax = Math.PI * 0.17
        this.car13.options.controlsSteeringQuad = false
        this.car13.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car13.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car13.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car13.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car13.options.controlsAcceleratingQuad = true
        this.car13.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car13.upsideDown = {}
        this.car13.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car13.upsideDown.pendingTimeout = null
        this.car13.upsideDown.turningTimeout = null
    
        // Jump
        this.car13.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car13.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car13.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car13.create = () => {

            // Chassis
            this.car13.chassis = {}
    
            this.car13.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car13.options.chassisDepth * 0.5, this.car13.options.chassisWidth * 0.5, this.car13.options.chassisHeight * 0.5))
    
            this.car13.chassis.body = new CANNON.Body({ mass: this.car13.options.chassisMass })
            this.car13.chassis.body.allowSleep = false
            this.car13.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car13.chassis.body.sleep()
            this.car13.chassis.body.addShape(this.car13.chassis.shape, this.car13.options.chassisOffset)
            this.car13.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car13.chassis.body);
            this.car13.chassis.body.playerId = playerId;
    
            // Sound
            this.car13.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car13.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car13.chassis.body
            })
    
            // Wheel
            this.car13.wheels = {}
            this.car13.wheels.options = {
                radius: this.car13.options.wheelRadius,
                height: this.car13.options.wheelHeight,
                suspensionStiffness: this.car13.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car13.options.wheelSuspensionRestLength,
                frictionSlip: this.car13.options.wheelFrictionSlip,
                dampingRelaxation: this.car13.options.wheelDampingRelaxation,
                dampingCompression: this.car13.options.wheelDampingCompression,
                maxSuspensionForce: this.car13.options.wheelMaxSuspensionForce,
                rollInfluence: this.car13.options.wheelRollInfluence,
                maxSuspensionTravel: this.car13.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car13.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car13.wheels.options.chassisConnectionPointLocal.set(this.car13.options.wheelFrontOffsetDepth, this.car13.options.wheelOffsetWidth, 0)
            this.car13.vehicle.addWheel(this.car13.wheels.options)
    
            // Front right
            this.car13.wheels.options.chassisConnectionPointLocal.set(this.car13.options.wheelFrontOffsetDepth, -this.car13.options.wheelOffsetWidth, 0)
            this.car13.vehicle.addWheel(this.car13.wheels.options)
    
            // Back left
            this.car13.wheels.options.chassisConnectionPointLocal.set(this.car13.options.wheelBackOffsetDepth, this.car13.options.wheelOffsetWidth, 0)
            this.car13.vehicle.addWheel(this.car13.wheels.options)
    
            // Back right
            this.car13.wheels.options.chassisConnectionPointLocal.set(this.car13.options.wheelBackOffsetDepth, -this.car13.options.wheelOffsetWidth, 0)
            this.car13.vehicle.addWheel(this.car13.wheels.options)
    
            this.car13.vehicle.addToWorld(this.world)
    
            this.car13.wheels.indexes = {}
    
            this.car13.wheels.indexes.frontLeft = 0
            this.car13.wheels.indexes.frontRight = 1
            this.car13.wheels.indexes.backLeft = 2
            this.car13.wheels.indexes.backRight = 3
            this.car13.wheels.bodies = []
    
            for (const _wheelInfos of this.car13.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car13.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car13.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car13.wheels.bodies.push(body)
            }
    
            // Model
            this.car13.model = {}
            this.car13.model.container = new THREE.Object3D()
            this.models.container.add(this.car13.model.container)
    
            this.car13.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car13.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car13.options.chassisDepth, this.car13.options.chassisWidth, this.car13.options.chassisHeight), this.car13.model.material)
            this.car13.model.container.add(this.car13.model.chassis)
    
            this.car13.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car13.options.wheelRadius, this.car13.options.wheelRadius, this.car13.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car13.model.material)
                this.car13.model.container.add(wheel)
                this.car13.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car13.destroy = () => {
            this.car13.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car13.model.container)
        }
    
        // Recreate method
        this.car13.recreate = () => {
            this.car13.destroy()
            this.car13.create()
            this.car13.chassis.body.wakeUp()
        }
    
        // Brake
        this.car13.brake = () => {
            this.car13.vehicle.setBrake(1, 0)
            this.car13.vehicle.setBrake(1, 1)
            this.car13.vehicle.setBrake(1, 2)
            this.car13.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car13.unbrake = () => {
            this.car13.vehicle.setBrake(0, 0)
            this.car13.vehicle.setBrake(0, 1)
            this.car13.vehicle.setBrake(0, 2)
            this.car13.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car13.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car13.oldPosition)
    
            this.car13.oldPosition.copy(this.car13.chassis.body.position)
            this.car13.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car13.chassis.body.vectorToWorldFrame(localForward, this.car13.worldForward)
            this.car13.angle = Math.atan2(this.car13.worldForward.y, this.car13.worldForward.x)
    
            this.car13.forwardSpeed = this.car13.worldForward.dot(positionDelta)
            this.car13.goingForward = this.car13.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car13.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car13.upsideDown.state === 'watching') {
                    this.car13.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car13.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car13.upsideDown.state = 'turning'
                            this.car13.jump(true)
        
                            this.car13.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car13.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car13.upsideDown.state === 'pending') {
                    this.car13.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car13.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car13.vehicle.wheelInfos.length; i++) {
                this.car13.vehicle.updateWheelTransform(i)
    
                const transform = this.car13.vehicle.wheelInfos[i].worldTransform
                this.car13.wheels.bodies[i].position.copy(transform.position)
                this.car13.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car13.wheels.bodies[i].quaternion = this.car13.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car13.worldForward.clone()
    
                if (this.car13.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car13.chassis.body.velocity.length() * 0.1)
    
                this.car13.chassis.body.applyImpulse(slowDownForce, this.car13.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car13.model.chassis.position.copy(this.car13.chassis.body.position).add(this.car13.options.chassisOffset)
            this.car13.model.chassis.quaternion.copy(this.car13.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car13.wheels.bodies) {
                const wheelBody = this.car13.wheels.bodies[_wheelKey]
                const wheelMesh = this.car13.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car13.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car13.forwardSpeed) < 0.01 ? true : this.car13.goingForward
                this.car13.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car13.steering) > this.car13.options.controlsSteeringMax) {
                    this.car13.steering = Math.sign(this.car13.steering) * this.car13.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car13.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car13.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car13.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car13.steering) > steerStrength) {
                        this.car13.steering -= steerStrength * Math.sign(this.car13.steering)
                    } else {
                        this.car13.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car13.steering) > this.car13.options.controlsSteeringMax) {
                    this.car13.steering = Math.sign(this.car13.steering) * this.car13.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car13.options.controlsAcceleratingSpeedBoost : this.car13.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car13.options.controlsAcceleratinMaxSpeedBoost : this.car13.options.controlsAcceleratinMaxSpeed
    
            this.car13.vehicle.applyEngineForce(-this.car13.accelerating, this.car13.wheels.indexes.backLeft)
            this.car13.vehicle.applyEngineForce(-this.car13.accelerating, this.car13.wheels.indexes.backRight)
    
            if (this.car13.options.controlsSteeringQuad) {
                this.car13.vehicle.applyEngineForce(-this.car13.accelerating, this.car13.wheels.indexes.frontLeft)
                this.car13.vehicle.applyEngineForce(-this.car13.accelerating, this.car13.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car13.vehicle.setBrake(this.car13.options.controlsBrakeStrength, 0)
                this.car13.vehicle.setBrake(this.car13.options.controlsBrakeStrength, 1)
                this.car13.vehicle.setBrake(this.car13.options.controlsBrakeStrength, 2)
                this.car13.vehicle.setBrake(this.car13.options.controlsBrakeStrength, 3)
            } else {
                this.car13.vehicle.setBrake(0, 0)
                this.car13.vehicle.setBrake(0, 1)
                this.car13.vehicle.setBrake(0, 2)
                this.car13.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car13.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar12(playerId) {
        this.car12 = {}
    
        this.car12.steering = 0
        this.car12.accelerating = 0
        this.car12.speed = 0
        this.car12.worldForward = new CANNON.Vec3()
        this.car12.angle = 0
        this.car12.forwardSpeed = 0
        this.car12.oldPosition = new CANNON.Vec3()
        this.car12.goingForward = true
    
        // Options
        this.car12.options = {}
        this.car12.options.chassisWidth = 1.02
        this.car12.options.chassisHeight = 1.16
        this.car12.options.chassisDepth = 2.03
        this.car12.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car12.options.chassisMass = 0
        this.car12.options.wheelFrontOffsetDepth = 0.635
        this.car12.options.wheelBackOffsetDepth = -0.475
        this.car12.options.wheelOffsetWidth = 0.39
        this.car12.options.wheelRadius = 0.25
        this.car12.options.wheelHeight = 0.24
        this.car12.options.wheelSuspensionStiffness = 50
        this.car12.options.wheelSuspensionRestLength = 0.1
        this.car12.options.wheelFrictionSlip = 10
        this.car12.options.wheelDampingRelaxation = 1.8
        this.car12.options.wheelDampingCompression = 1.5
        this.car12.options.wheelMaxSuspensionForce = 100000
        this.car12.options.wheelRollInfluence = 0.01
        this.car12.options.wheelMaxSuspensionTravel = 0.3
        this.car12.options.wheelCustomSlidingRotationalSpeed = -30
        this.car12.options.wheelMass = 5
        this.car12.options.controlsSteeringSpeed = 0.005 * 3
        this.car12.options.controlsSteeringMax = Math.PI * 0.17
        this.car12.options.controlsSteeringQuad = false
        this.car12.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car12.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car12.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car12.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car12.options.controlsAcceleratingQuad = true
        this.car12.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car12.upsideDown = {}
        this.car12.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car12.upsideDown.pendingTimeout = null
        this.car12.upsideDown.turningTimeout = null
    
        // Jump
        this.car12.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car12.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car12.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car12.create = () => {

            // Chassis
            this.car12.chassis = {}
    
            this.car12.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car12.options.chassisDepth * 0.5, this.car12.options.chassisWidth * 0.5, this.car12.options.chassisHeight * 0.5))
    
            this.car12.chassis.body = new CANNON.Body({ mass: this.car12.options.chassisMass })
            this.car12.chassis.body.allowSleep = false
            this.car12.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car12.chassis.body.sleep()
            this.car12.chassis.body.addShape(this.car12.chassis.shape, this.car12.options.chassisOffset)
            this.car12.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car12.chassis.body);
            this.car12.chassis.body.playerId = playerId;
    
            // Sound
            this.car12.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car12.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car12.chassis.body
            })
    
            // Wheel
            this.car12.wheels = {}
            this.car12.wheels.options = {
                radius: this.car12.options.wheelRadius,
                height: this.car12.options.wheelHeight,
                suspensionStiffness: this.car12.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car12.options.wheelSuspensionRestLength,
                frictionSlip: this.car12.options.wheelFrictionSlip,
                dampingRelaxation: this.car12.options.wheelDampingRelaxation,
                dampingCompression: this.car12.options.wheelDampingCompression,
                maxSuspensionForce: this.car12.options.wheelMaxSuspensionForce,
                rollInfluence: this.car12.options.wheelRollInfluence,
                maxSuspensionTravel: this.car12.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car12.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car12.wheels.options.chassisConnectionPointLocal.set(this.car12.options.wheelFrontOffsetDepth, this.car12.options.wheelOffsetWidth, 0)
            this.car12.vehicle.addWheel(this.car12.wheels.options)
    
            // Front right
            this.car12.wheels.options.chassisConnectionPointLocal.set(this.car12.options.wheelFrontOffsetDepth, -this.car12.options.wheelOffsetWidth, 0)
            this.car12.vehicle.addWheel(this.car12.wheels.options)
    
            // Back left
            this.car12.wheels.options.chassisConnectionPointLocal.set(this.car12.options.wheelBackOffsetDepth, this.car12.options.wheelOffsetWidth, 0)
            this.car12.vehicle.addWheel(this.car12.wheels.options)
    
            // Back right
            this.car12.wheels.options.chassisConnectionPointLocal.set(this.car12.options.wheelBackOffsetDepth, -this.car12.options.wheelOffsetWidth, 0)
            this.car12.vehicle.addWheel(this.car12.wheels.options)
    
            this.car12.vehicle.addToWorld(this.world)
    
            this.car12.wheels.indexes = {}
    
            this.car12.wheels.indexes.frontLeft = 0
            this.car12.wheels.indexes.frontRight = 1
            this.car12.wheels.indexes.backLeft = 2
            this.car12.wheels.indexes.backRight = 3
            this.car12.wheels.bodies = []
    
            for (const _wheelInfos of this.car12.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car12.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car12.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car12.wheels.bodies.push(body)
            }
    
            // Model
            this.car12.model = {}
            this.car12.model.container = new THREE.Object3D()
            this.models.container.add(this.car12.model.container)
    
            this.car12.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car12.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car12.options.chassisDepth, this.car12.options.chassisWidth, this.car12.options.chassisHeight), this.car12.model.material)
            this.car12.model.container.add(this.car12.model.chassis)
    
            this.car12.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car12.options.wheelRadius, this.car12.options.wheelRadius, this.car12.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car12.model.material)
                this.car12.model.container.add(wheel)
                this.car12.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car12.destroy = () => {
            this.car12.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car12.model.container)
        }
    
        // Recreate method
        this.car12.recreate = () => {
            this.car12.destroy()
            this.car12.create()
            this.car12.chassis.body.wakeUp()
        }
    
        // Brake
        this.car12.brake = () => {
            this.car12.vehicle.setBrake(1, 0)
            this.car12.vehicle.setBrake(1, 1)
            this.car12.vehicle.setBrake(1, 2)
            this.car12.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car12.unbrake = () => {
            this.car12.vehicle.setBrake(0, 0)
            this.car12.vehicle.setBrake(0, 1)
            this.car12.vehicle.setBrake(0, 2)
            this.car12.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car12.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car12.oldPosition)
    
            this.car12.oldPosition.copy(this.car12.chassis.body.position)
            this.car12.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car12.chassis.body.vectorToWorldFrame(localForward, this.car12.worldForward)
            this.car12.angle = Math.atan2(this.car12.worldForward.y, this.car12.worldForward.x)
    
            this.car12.forwardSpeed = this.car12.worldForward.dot(positionDelta)
            this.car12.goingForward = this.car12.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car12.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car12.upsideDown.state === 'watching') {
                    this.car12.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {

                        this.car12.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car12.upsideDown.state = 'turning'
                            this.car12.jump(true)
        
                            this.car12.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car12.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car12.upsideDown.state === 'pending') {
                    this.car12.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car12.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car12.vehicle.wheelInfos.length; i++) {
                this.car12.vehicle.updateWheelTransform(i)
    
                const transform = this.car12.vehicle.wheelInfos[i].worldTransform
                this.car12.wheels.bodies[i].position.copy(transform.position)
                this.car12.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car12.wheels.bodies[i].quaternion = this.car12.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car12.worldForward.clone()
    
                if (this.car12.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car12.chassis.body.velocity.length() * 0.1)
    
                this.car12.chassis.body.applyImpulse(slowDownForce, this.car12.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car12.model.chassis.position.copy(this.car12.chassis.body.position).add(this.car12.options.chassisOffset)
            this.car12.model.chassis.quaternion.copy(this.car12.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car12.wheels.bodies) {
                const wheelBody = this.car12.wheels.bodies[_wheelKey]
                const wheelMesh = this.car12.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car12.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car12.forwardSpeed) < 0.01 ? true : this.car12.goingForward
                this.car12.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car12.steering) > this.car12.options.controlsSteeringMax) {
                    this.car12.steering = Math.sign(this.car12.steering) * this.car12.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car12.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car12.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car12.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car12.steering) > steerStrength) {
                        this.car12.steering -= steerStrength * Math.sign(this.car12.steering)
                    } else {
                        this.car12.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car12.steering) > this.car12.options.controlsSteeringMax) {
                    this.car12.steering = Math.sign(this.car12.steering) * this.car12.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car12.options.controlsAcceleratingSpeedBoost : this.car12.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car12.options.controlsAcceleratinMaxSpeedBoost : this.car12.options.controlsAcceleratinMaxSpeed
    
            this.car12.vehicle.applyEngineForce(-this.car12.accelerating, this.car12.wheels.indexes.backLeft)
            this.car12.vehicle.applyEngineForce(-this.car12.accelerating, this.car12.wheels.indexes.backRight)
    
            if (this.car12.options.controlsSteeringQuad) {
                this.car12.vehicle.applyEngineForce(-this.car12.accelerating, this.car12.wheels.indexes.frontLeft)
                this.car12.vehicle.applyEngineForce(-this.car12.accelerating, this.car12.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car12.vehicle.setBrake(this.car12.options.controlsBrakeStrength, 0)
                this.car12.vehicle.setBrake(this.car12.options.controlsBrakeStrength, 1)
                this.car12.vehicle.setBrake(this.car12.options.controlsBrakeStrength, 2)
                this.car12.vehicle.setBrake(this.car12.options.controlsBrakeStrength, 3)
            } else {
                this.car12.vehicle.setBrake(0, 0)
                this.car12.vehicle.setBrake(0, 1)
                this.car12.vehicle.setBrake(0, 2)
                this.car12.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car12.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar11(playerId) {
        this.car11 = {}
    
        this.car11.steering = 0
        this.car11.accelerating = 0
        this.car11.speed = 0
        this.car11.worldForward = new CANNON.Vec3()
        this.car11.angle = 0
        this.car11.forwardSpeed = 0
        this.car11.oldPosition = new CANNON.Vec3()
        this.car11.goingForward = true
    
        // Options
        this.car11.options = {}
        this.car11.options.chassisWidth = 1.02
        this.car11.options.chassisHeight = 1.16
        this.car11.options.chassisDepth = 2.03
        this.car11.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car11.options.chassisMass = 0
        this.car11.options.wheelFrontOffsetDepth = 0.635
        this.car11.options.wheelBackOffsetDepth = -0.475
        this.car11.options.wheelOffsetWidth = 0.39
        this.car11.options.wheelRadius = 0.25
        this.car11.options.wheelHeight = 0.24
        this.car11.options.wheelSuspensionStiffness = 50
        this.car11.options.wheelSuspensionRestLength = 0.1
        this.car11.options.wheelFrictionSlip = 10
        this.car11.options.wheelDampingRelaxation = 1.8
        this.car11.options.wheelDampingCompression = 1.5
        this.car11.options.wheelMaxSuspensionForce = 100000
        this.car11.options.wheelRollInfluence = 0.01
        this.car11.options.wheelMaxSuspensionTravel = 0.3
        this.car11.options.wheelCustomSlidingRotationalSpeed = -30
        this.car11.options.wheelMass = 5
        this.car11.options.controlsSteeringSpeed = 0.005 * 3
        this.car11.options.controlsSteeringMax = Math.PI * 0.17
        this.car11.options.controlsSteeringQuad = false
        this.car11.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car11.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car11.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car11.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car11.options.controlsAcceleratingQuad = true
        this.car11.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car11.upsideDown = {}
        this.car11.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car11.upsideDown.pendingTimeout = null
        this.car11.upsideDown.turningTimeout = null
    
        // Jump
        this.car11.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car11.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car11.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car11.create = () => {

            // Chassis
            this.car11.chassis = {}
    
            this.car11.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car11.options.chassisDepth * 0.5, this.car11.options.chassisWidth * 0.5, this.car11.options.chassisHeight * 0.5))
    
            this.car11.chassis.body = new CANNON.Body({ mass: this.car11.options.chassisMass })
            this.car11.chassis.body.allowSleep = false
            this.car11.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car11.chassis.body.sleep()
            this.car11.chassis.body.addShape(this.car11.chassis.shape, this.car11.options.chassisOffset)
            this.car11.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car11.chassis.body);
            this.car11.chassis.body.playerId = playerId;
    
            // Sound
            this.car11.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car11.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car11.chassis.body
            })
    
            // Wheel
            this.car11.wheels = {}
            this.car11.wheels.options = {
                radius: this.car11.options.wheelRadius,
                height: this.car11.options.wheelHeight,
                suspensionStiffness: this.car11.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car11.options.wheelSuspensionRestLength,
                frictionSlip: this.car11.options.wheelFrictionSlip,
                dampingRelaxation: this.car11.options.wheelDampingRelaxation,
                dampingCompression: this.car11.options.wheelDampingCompression,
                maxSuspensionForce: this.car11.options.wheelMaxSuspensionForce,
                rollInfluence: this.car11.options.wheelRollInfluence,
                maxSuspensionTravel: this.car11.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car11.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car11.wheels.options.chassisConnectionPointLocal.set(this.car11.options.wheelFrontOffsetDepth, this.car11.options.wheelOffsetWidth, 0)
            this.car11.vehicle.addWheel(this.car11.wheels.options)
    
            // Front right
            this.car11.wheels.options.chassisConnectionPointLocal.set(this.car11.options.wheelFrontOffsetDepth, -this.car11.options.wheelOffsetWidth, 0)
            this.car11.vehicle.addWheel(this.car11.wheels.options)
    
            // Back left
            this.car11.wheels.options.chassisConnectionPointLocal.set(this.car11.options.wheelBackOffsetDepth, this.car11.options.wheelOffsetWidth, 0)
            this.car11.vehicle.addWheel(this.car11.wheels.options)
    
            // Back right
            this.car11.wheels.options.chassisConnectionPointLocal.set(this.car11.options.wheelBackOffsetDepth, -this.car11.options.wheelOffsetWidth, 0)
            this.car11.vehicle.addWheel(this.car11.wheels.options)
    
            this.car11.vehicle.addToWorld(this.world)
    
            this.car11.wheels.indexes = {}
    
            this.car11.wheels.indexes.frontLeft = 0
            this.car11.wheels.indexes.frontRight = 1
            this.car11.wheels.indexes.backLeft = 2
            this.car11.wheels.indexes.backRight = 3
            this.car11.wheels.bodies = []
    
            for (const _wheelInfos of this.car11.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car11.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car11.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car11.wheels.bodies.push(body)
            }
    
            // Model
            this.car11.model = {}
            this.car11.model.container = new THREE.Object3D()
            this.models.container.add(this.car11.model.container)
    
            this.car11.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car11.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car11.options.chassisDepth, this.car11.options.chassisWidth, this.car11.options.chassisHeight), this.car11.model.material)
            this.car11.model.container.add(this.car11.model.chassis)
    
            this.car11.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car11.options.wheelRadius, this.car11.options.wheelRadius, this.car11.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car11.model.material)
                this.car11.model.container.add(wheel)
                this.car11.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car11.destroy = () => {
            this.car11.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car11.model.container)
        }
    
        // Recreate method
        this.car11.recreate = () => {
            this.car11.destroy()
            this.car11.create()
            this.car11.chassis.body.wakeUp()
        }
    
        // Brake
        this.car11.brake = () => {
            this.car11.vehicle.setBrake(1, 0)
            this.car11.vehicle.setBrake(1, 1)
            this.car11.vehicle.setBrake(1, 2)
            this.car11.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car11.unbrake = () => {
            this.car11.vehicle.setBrake(0, 0)
            this.car11.vehicle.setBrake(0, 1)
            this.car11.vehicle.setBrake(0, 2)
            this.car11.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car11.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car11.oldPosition)
    
            this.car11.oldPosition.copy(this.car11.chassis.body.position)
            this.car11.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car11.chassis.body.vectorToWorldFrame(localForward, this.car11.worldForward)
            this.car11.angle = Math.atan2(this.car11.worldForward.y, this.car11.worldForward.x)
    
            this.car11.forwardSpeed = this.car11.worldForward.dot(positionDelta)
            this.car11.goingForward = this.car11.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car11.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car11.upsideDown.state === 'watching') {
                    this.car11.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car11.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car11.upsideDown.state = 'turning'
                            this.car11.jump(true)
        
                            this.car11.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car11.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car11.upsideDown.state === 'pending') {
                    this.car11.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car11.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car11.vehicle.wheelInfos.length; i++) {
                this.car11.vehicle.updateWheelTransform(i)
    
                const transform = this.car11.vehicle.wheelInfos[i].worldTransform
                this.car11.wheels.bodies[i].position.copy(transform.position)
                this.car11.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car11.wheels.bodies[i].quaternion = this.car11.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car11.worldForward.clone()
    
                if (this.car11.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car11.chassis.body.velocity.length() * 0.1)
    
                this.car11.chassis.body.applyImpulse(slowDownForce, this.car11.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car11.model.chassis.position.copy(this.car11.chassis.body.position).add(this.car11.options.chassisOffset)
            this.car11.model.chassis.quaternion.copy(this.car11.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car11.wheels.bodies) {
                const wheelBody = this.car11.wheels.bodies[_wheelKey]
                const wheelMesh = this.car11.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car11.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car11.forwardSpeed) < 0.01 ? true : this.car11.goingForward
                this.car11.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car11.steering) > this.car11.options.controlsSteeringMax) {
                    this.car11.steering = Math.sign(this.car11.steering) * this.car11.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car11.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car11.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car11.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car11.steering) > steerStrength) {
                        this.car11.steering -= steerStrength * Math.sign(this.car11.steering)
                    } else {
                        this.car11.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car11.steering) > this.car11.options.controlsSteeringMax) {
                    this.car11.steering = Math.sign(this.car11.steering) * this.car11.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car11.options.controlsAcceleratingSpeedBoost : this.car11.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car11.options.controlsAcceleratinMaxSpeedBoost : this.car11.options.controlsAcceleratinMaxSpeed
    
            this.car11.vehicle.applyEngineForce(-this.car11.accelerating, this.car11.wheels.indexes.backLeft)
            this.car11.vehicle.applyEngineForce(-this.car11.accelerating, this.car11.wheels.indexes.backRight)
    
            if (this.car11.options.controlsSteeringQuad) {
                this.car11.vehicle.applyEngineForce(-this.car11.accelerating, this.car11.wheels.indexes.frontLeft)
                this.car11.vehicle.applyEngineForce(-this.car11.accelerating, this.car11.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car11.vehicle.setBrake(this.car11.options.controlsBrakeStrength, 0)
                this.car11.vehicle.setBrake(this.car11.options.controlsBrakeStrength, 1)
                this.car11.vehicle.setBrake(this.car11.options.controlsBrakeStrength, 2)
                this.car11.vehicle.setBrake(this.car11.options.controlsBrakeStrength, 3)
            } else {
                this.car11.vehicle.setBrake(0, 0)
                this.car11.vehicle.setBrake(0, 1)
                this.car11.vehicle.setBrake(0, 2)
                this.car11.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car11.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar10(playerId) {
        this.car10 = {}
    
        this.car10.steering = 0
        this.car10.accelerating = 0
        this.car10.speed = 0
        this.car10.worldForward = new CANNON.Vec3()
        this.car10.angle = 0
        this.car10.forwardSpeed = 0
        this.car10.oldPosition = new CANNON.Vec3()
        this.car10.goingForward = true
    
        // Options
        this.car10.options = {}
        this.car10.options.chassisWidth = 1.02
        this.car10.options.chassisHeight = 1.16
        this.car10.options.chassisDepth = 2.03
        this.car10.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car10.options.chassisMass = 0
        this.car10.options.wheelFrontOffsetDepth = 0.635
        this.car10.options.wheelBackOffsetDepth = -0.475
        this.car10.options.wheelOffsetWidth = 0.39
        this.car10.options.wheelRadius = 0.25
        this.car10.options.wheelHeight = 0.24
        this.car10.options.wheelSuspensionStiffness = 50
        this.car10.options.wheelSuspensionRestLength = 0.1
        this.car10.options.wheelFrictionSlip = 10
        this.car10.options.wheelDampingRelaxation = 1.8
        this.car10.options.wheelDampingCompression = 1.5
        this.car10.options.wheelMaxSuspensionForce = 100000
        this.car10.options.wheelRollInfluence = 0.01
        this.car10.options.wheelMaxSuspensionTravel = 0.3
        this.car10.options.wheelCustomSlidingRotationalSpeed = -30
        this.car10.options.wheelMass = 5
        this.car10.options.controlsSteeringSpeed = 0.005 * 3
        this.car10.options.controlsSteeringMax = Math.PI * 0.17
        this.car10.options.controlsSteeringQuad = false
        this.car10.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car10.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car10.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car10.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car10.options.controlsAcceleratingQuad = true
        this.car10.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car10.upsideDown = {}
        this.car10.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car10.upsideDown.pendingTimeout = null
        this.car10.upsideDown.turningTimeout = null
    
        // Jump
        this.car10.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car10.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car10.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car10.create = () => {

            // Chassis
            this.car10.chassis = {}
    
            this.car10.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car10.options.chassisDepth * 0.5, this.car10.options.chassisWidth * 0.5, this.car10.options.chassisHeight * 0.5))
    
            this.car10.chassis.body = new CANNON.Body({ mass: this.car10.options.chassisMass })
            this.car10.chassis.body.allowSleep = false
            this.car10.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car10.chassis.body.sleep()
            this.car10.chassis.body.addShape(this.car10.chassis.shape, this.car10.options.chassisOffset)
            this.car10.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car10.chassis.body);
            this.car10.chassis.body.playerId = playerId;
    
            // Sound
            this.car10.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car10.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car10.chassis.body
            })
    
            // Wheel
            this.car10.wheels = {}
            this.car10.wheels.options = {
                radius: this.car10.options.wheelRadius,
                height: this.car10.options.wheelHeight,
                suspensionStiffness: this.car10.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car10.options.wheelSuspensionRestLength,
                frictionSlip: this.car10.options.wheelFrictionSlip,
                dampingRelaxation: this.car10.options.wheelDampingRelaxation,
                dampingCompression: this.car10.options.wheelDampingCompression,
                maxSuspensionForce: this.car10.options.wheelMaxSuspensionForce,
                rollInfluence: this.car10.options.wheelRollInfluence,
                maxSuspensionTravel: this.car10.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car10.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car10.wheels.options.chassisConnectionPointLocal.set(this.car10.options.wheelFrontOffsetDepth, this.car10.options.wheelOffsetWidth, 0)
            this.car10.vehicle.addWheel(this.car10.wheels.options)
    
            // Front right
            this.car10.wheels.options.chassisConnectionPointLocal.set(this.car10.options.wheelFrontOffsetDepth, -this.car10.options.wheelOffsetWidth, 0)
            this.car10.vehicle.addWheel(this.car10.wheels.options)
    
            // Back left
            this.car10.wheels.options.chassisConnectionPointLocal.set(this.car10.options.wheelBackOffsetDepth, this.car10.options.wheelOffsetWidth, 0)
            this.car10.vehicle.addWheel(this.car10.wheels.options)
    
            // Back right
            this.car10.wheels.options.chassisConnectionPointLocal.set(this.car10.options.wheelBackOffsetDepth, -this.car10.options.wheelOffsetWidth, 0)
            this.car10.vehicle.addWheel(this.car10.wheels.options)
    
            this.car10.vehicle.addToWorld(this.world)
    
            this.car10.wheels.indexes = {}
    
            this.car10.wheels.indexes.frontLeft = 0
            this.car10.wheels.indexes.frontRight = 1
            this.car10.wheels.indexes.backLeft = 2
            this.car10.wheels.indexes.backRight = 3
            this.car10.wheels.bodies = []
    
            for (const _wheelInfos of this.car10.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car10.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car10.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car10.wheels.bodies.push(body)
            }
    
            // Model
            this.car10.model = {}
            this.car10.model.container = new THREE.Object3D()
            this.models.container.add(this.car10.model.container)
    
            this.car10.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car10.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car10.options.chassisDepth, this.car10.options.chassisWidth, this.car10.options.chassisHeight), this.car10.model.material)
            this.car10.model.container.add(this.car10.model.chassis)
    
            this.car10.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car10.options.wheelRadius, this.car10.options.wheelRadius, this.car10.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car10.model.material)
                this.car10.model.container.add(wheel)
                this.car10.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car10.destroy = () => {
            this.car10.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car10.model.container)
        }
    
        // Recreate method
        this.car10.recreate = () => {
            this.car10.destroy()
            this.car10.create()
            this.car10.chassis.body.wakeUp()
        }
    
        // Brake
        this.car10.brake = () => {
            this.car10.vehicle.setBrake(1, 0)
            this.car10.vehicle.setBrake(1, 1)
            this.car10.vehicle.setBrake(1, 2)
            this.car10.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car10.unbrake = () => {
            this.car10.vehicle.setBrake(0, 0)
            this.car10.vehicle.setBrake(0, 1)
            this.car10.vehicle.setBrake(0, 2)
            this.car10.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car10.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car10.oldPosition)
    
            this.car10.oldPosition.copy(this.car10.chassis.body.position)
            this.car10.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car10.chassis.body.vectorToWorldFrame(localForward, this.car10.worldForward)
            this.car10.angle = Math.atan2(this.car10.worldForward.y, this.car10.worldForward.x)
    
            this.car10.forwardSpeed = this.car10.worldForward.dot(positionDelta)
            this.car10.goingForward = this.car10.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car10.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car10.upsideDown.state === 'watching') {
                    this.car10.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car10.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car10.upsideDown.state = 'turning'
                            this.car10.jump(true)
        
                            this.car10.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car10.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car10.upsideDown.state === 'pending') {
                    this.car10.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car10.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car10.vehicle.wheelInfos.length; i++) {
                this.car10.vehicle.updateWheelTransform(i)
    
                const transform = this.car10.vehicle.wheelInfos[i].worldTransform
                this.car10.wheels.bodies[i].position.copy(transform.position)
                this.car10.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car10.wheels.bodies[i].quaternion = this.car10.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car10.worldForward.clone()
    
                if (this.car10.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car10.chassis.body.velocity.length() * 0.1)
    
                this.car10.chassis.body.applyImpulse(slowDownForce, this.car10.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car10.model.chassis.position.copy(this.car10.chassis.body.position).add(this.car10.options.chassisOffset)
            this.car10.model.chassis.quaternion.copy(this.car10.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car10.wheels.bodies) {
                const wheelBody = this.car10.wheels.bodies[_wheelKey]
                const wheelMesh = this.car10.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car10.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car10.forwardSpeed) < 0.01 ? true : this.car10.goingForward
                this.car10.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car10.steering) > this.car10.options.controlsSteeringMax) {
                    this.car10.steering = Math.sign(this.car10.steering) * this.car10.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car10.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car10.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car10.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car10.steering) > steerStrength) {
                        this.car10.steering -= steerStrength * Math.sign(this.car10.steering)
                    } else {
                        this.car10.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car10.steering) > this.car10.options.controlsSteeringMax) {
                    this.car10.steering = Math.sign(this.car10.steering) * this.car10.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car10.options.controlsAcceleratingSpeedBoost : this.car10.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car10.options.controlsAcceleratinMaxSpeedBoost : this.car10.options.controlsAcceleratinMaxSpeed
    
            this.car10.vehicle.applyEngineForce(-this.car10.accelerating, this.car10.wheels.indexes.backLeft)
            this.car10.vehicle.applyEngineForce(-this.car10.accelerating, this.car10.wheels.indexes.backRight)
    
            if (this.car10.options.controlsSteeringQuad) {
                this.car10.vehicle.applyEngineForce(-this.car10.accelerating, this.car10.wheels.indexes.frontLeft)
                this.car10.vehicle.applyEngineForce(-this.car10.accelerating, this.car10.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car10.vehicle.setBrake(this.car10.options.controlsBrakeStrength, 0)
                this.car10.vehicle.setBrake(this.car10.options.controlsBrakeStrength, 1)
                this.car10.vehicle.setBrake(this.car10.options.controlsBrakeStrength, 2)
                this.car10.vehicle.setBrake(this.car10.options.controlsBrakeStrength, 3)
            } else {
                this.car10.vehicle.setBrake(0, 0)
                this.car10.vehicle.setBrake(0, 1)
                this.car10.vehicle.setBrake(0, 2)
                this.car10.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car10.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar9(playerId) {
        this.car9 = {}
    
        this.car9.steering = 0
        this.car9.accelerating = 0
        this.car9.speed = 0
        this.car9.worldForward = new CANNON.Vec3()
        this.car9.angle = 0
        this.car9.forwardSpeed = 0
        this.car9.oldPosition = new CANNON.Vec3()
        this.car9.goingForward = true
    
        // Options
        this.car9.options = {}
        this.car9.options.chassisWidth = 1.02
        this.car9.options.chassisHeight = 1.16
        this.car9.options.chassisDepth = 2.03
        this.car9.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car9.options.chassisMass = 0
        this.car9.options.wheelFrontOffsetDepth = 0.635
        this.car9.options.wheelBackOffsetDepth = -0.475
        this.car9.options.wheelOffsetWidth = 0.39
        this.car9.options.wheelRadius = 0.25
        this.car9.options.wheelHeight = 0.24
        this.car9.options.wheelSuspensionStiffness = 50
        this.car9.options.wheelSuspensionRestLength = 0.1
        this.car9.options.wheelFrictionSlip = 10
        this.car9.options.wheelDampingRelaxation = 1.8
        this.car9.options.wheelDampingCompression = 1.5
        this.car9.options.wheelMaxSuspensionForce = 100000
        this.car9.options.wheelRollInfluence = 0.01
        this.car9.options.wheelMaxSuspensionTravel = 0.3
        this.car9.options.wheelCustomSlidingRotationalSpeed = -30
        this.car9.options.wheelMass = 5
        this.car9.options.controlsSteeringSpeed = 0.005 * 3
        this.car9.options.controlsSteeringMax = Math.PI * 0.17
        this.car9.options.controlsSteeringQuad = false
        this.car9.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car9.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car9.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car9.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car9.options.controlsAcceleratingQuad = true
        this.car9.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car9.upsideDown = {}
        this.car9.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car9.upsideDown.pendingTimeout = null
        this.car9.upsideDown.turningTimeout = null
    
        // Jump
        this.car9.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car9.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car9.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car9.create = () => {

            // Chassis
            this.car9.chassis = {}
    
            this.car9.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car9.options.chassisDepth * 0.5, this.car9.options.chassisWidth * 0.5, this.car9.options.chassisHeight * 0.5))
    
            this.car9.chassis.body = new CANNON.Body({ mass: this.car9.options.chassisMass })
            this.car9.chassis.body.allowSleep = false
            this.car9.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car9.chassis.body.sleep()
            this.car9.chassis.body.addShape(this.car9.chassis.shape, this.car9.options.chassisOffset)
            this.car9.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car9.chassis.body);
            this.car9.chassis.body.playerId = playerId;
    
            // Sound
            this.car9.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car9.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car9.chassis.body
            })
    
            // Wheel
            this.car9.wheels = {}
            this.car9.wheels.options = {
                radius: this.car9.options.wheelRadius,
                height: this.car9.options.wheelHeight,
                suspensionStiffness: this.car9.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car9.options.wheelSuspensionRestLength,
                frictionSlip: this.car9.options.wheelFrictionSlip,
                dampingRelaxation: this.car9.options.wheelDampingRelaxation,
                dampingCompression: this.car9.options.wheelDampingCompression,
                maxSuspensionForce: this.car9.options.wheelMaxSuspensionForce,
                rollInfluence: this.car9.options.wheelRollInfluence,
                maxSuspensionTravel: this.car9.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car9.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car9.wheels.options.chassisConnectionPointLocal.set(this.car9.options.wheelFrontOffsetDepth, this.car9.options.wheelOffsetWidth, 0)
            this.car9.vehicle.addWheel(this.car9.wheels.options)
    
            // Front right
            this.car9.wheels.options.chassisConnectionPointLocal.set(this.car9.options.wheelFrontOffsetDepth, -this.car9.options.wheelOffsetWidth, 0)
            this.car9.vehicle.addWheel(this.car9.wheels.options)
    
            // Back left
            this.car9.wheels.options.chassisConnectionPointLocal.set(this.car9.options.wheelBackOffsetDepth, this.car9.options.wheelOffsetWidth, 0)
            this.car9.vehicle.addWheel(this.car9.wheels.options)
    
            // Back right
            this.car9.wheels.options.chassisConnectionPointLocal.set(this.car9.options.wheelBackOffsetDepth, -this.car9.options.wheelOffsetWidth, 0)
            this.car9.vehicle.addWheel(this.car9.wheels.options)
    
            this.car9.vehicle.addToWorld(this.world)
    
            this.car9.wheels.indexes = {}
    
            this.car9.wheels.indexes.frontLeft = 0
            this.car9.wheels.indexes.frontRight = 1
            this.car9.wheels.indexes.backLeft = 2
            this.car9.wheels.indexes.backRight = 3
            this.car9.wheels.bodies = []
    
            for (const _wheelInfos of this.car9.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car9.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car9.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car9.wheels.bodies.push(body)
            }
    
            // Model
            this.car9.model = {}
            this.car9.model.container = new THREE.Object3D()
            this.models.container.add(this.car9.model.container)
    
            this.car9.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car9.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car9.options.chassisDepth, this.car9.options.chassisWidth, this.car9.options.chassisHeight), this.car9.model.material)
            this.car9.model.container.add(this.car9.model.chassis)
    
            this.car9.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car9.options.wheelRadius, this.car9.options.wheelRadius, this.car9.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car9.model.material)
                this.car9.model.container.add(wheel)
                this.car9.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car9.destroy = () => {
            this.car9.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car9.model.container)
        }
    
        // Recreate method
        this.car9.recreate = () => {
            this.car9.destroy()
            this.car9.create()
            this.car9.chassis.body.wakeUp()
        }
    
        // Brake
        this.car9.brake = () => {
            this.car9.vehicle.setBrake(1, 0)
            this.car9.vehicle.setBrake(1, 1)
            this.car9.vehicle.setBrake(1, 2)
            this.car9.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car9.unbrake = () => {
            this.car9.vehicle.setBrake(0, 0)
            this.car9.vehicle.setBrake(0, 1)
            this.car9.vehicle.setBrake(0, 2)
            this.car9.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car9.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car9.oldPosition)
    
            this.car9.oldPosition.copy(this.car9.chassis.body.position)
            this.car9.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car9.chassis.body.vectorToWorldFrame(localForward, this.car9.worldForward)
            this.car9.angle = Math.atan2(this.car9.worldForward.y, this.car9.worldForward.x)
    
            this.car9.forwardSpeed = this.car9.worldForward.dot(positionDelta)
            this.car9.goingForward = this.car9.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car9.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car9.upsideDown.state === 'watching') {
                    this.car9.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car9.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car9.upsideDown.state = 'turning'
                            this.car9.jump(true)
        
                            this.car9.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car9.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car9.upsideDown.state === 'pending') {
                    this.car9.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car9.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car9.vehicle.wheelInfos.length; i++) {
                this.car9.vehicle.updateWheelTransform(i)
    
                const transform = this.car9.vehicle.wheelInfos[i].worldTransform
                this.car9.wheels.bodies[i].position.copy(transform.position)
                this.car9.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car9.wheels.bodies[i].quaternion = this.car9.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car9.worldForward.clone()
    
                if (this.car9.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car9.chassis.body.velocity.length() * 0.1)
    
                this.car9.chassis.body.applyImpulse(slowDownForce, this.car9.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car9.model.chassis.position.copy(this.car9.chassis.body.position).add(this.car9.options.chassisOffset)
            this.car9.model.chassis.quaternion.copy(this.car9.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car9.wheels.bodies) {
                const wheelBody = this.car9.wheels.bodies[_wheelKey]
                const wheelMesh = this.car9.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car9.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car9.forwardSpeed) < 0.01 ? true : this.car9.goingForward
                this.car9.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car9.steering) > this.car9.options.controlsSteeringMax) {
                    this.car9.steering = Math.sign(this.car9.steering) * this.car9.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car9.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car9.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car9.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car9.steering) > steerStrength) {
                        this.car9.steering -= steerStrength * Math.sign(this.car9.steering)
                    } else {
                        this.car9.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car9.steering) > this.car9.options.controlsSteeringMax) {
                    this.car9.steering = Math.sign(this.car9.steering) * this.car9.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car9.options.controlsAcceleratingSpeedBoost : this.car9.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car9.options.controlsAcceleratinMaxSpeedBoost : this.car9.options.controlsAcceleratinMaxSpeed
    
            this.car9.vehicle.applyEngineForce(-this.car9.accelerating, this.car9.wheels.indexes.backLeft)
            this.car9.vehicle.applyEngineForce(-this.car9.accelerating, this.car9.wheels.indexes.backRight)
    
            if (this.car9.options.controlsSteeringQuad) {
                this.car9.vehicle.applyEngineForce(-this.car9.accelerating, this.car9.wheels.indexes.frontLeft)
                this.car9.vehicle.applyEngineForce(-this.car9.accelerating, this.car9.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car9.vehicle.setBrake(this.car9.options.controlsBrakeStrength, 0)
                this.car9.vehicle.setBrake(this.car9.options.controlsBrakeStrength, 1)
                this.car9.vehicle.setBrake(this.car9.options.controlsBrakeStrength, 2)
                this.car9.vehicle.setBrake(this.car9.options.controlsBrakeStrength, 3)
            } else {
                this.car9.vehicle.setBrake(0, 0)
                this.car9.vehicle.setBrake(0, 1)
                this.car9.vehicle.setBrake(0, 2)
                this.car9.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car9.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar8(playerId) {
        this.car8 = {}
    
        this.car8.steering = 0
        this.car8.accelerating = 0
        this.car8.speed = 0
        this.car8.worldForward = new CANNON.Vec3()
        this.car8.angle = 0
        this.car8.forwardSpeed = 0
        this.car8.oldPosition = new CANNON.Vec3()
        this.car8.goingForward = true
    
        // Options
        this.car8.options = {}
        this.car8.options.chassisWidth = 1.02
        this.car8.options.chassisHeight = 1.16
        this.car8.options.chassisDepth = 2.03
        this.car8.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car8.options.chassisMass = 0
        this.car8.options.wheelFrontOffsetDepth = 0.635
        this.car8.options.wheelBackOffsetDepth = -0.475
        this.car8.options.wheelOffsetWidth = 0.39
        this.car8.options.wheelRadius = 0.25
        this.car8.options.wheelHeight = 0.24
        this.car8.options.wheelSuspensionStiffness = 50
        this.car8.options.wheelSuspensionRestLength = 0.1
        this.car8.options.wheelFrictionSlip = 10
        this.car8.options.wheelDampingRelaxation = 1.8
        this.car8.options.wheelDampingCompression = 1.5
        this.car8.options.wheelMaxSuspensionForce = 100000
        this.car8.options.wheelRollInfluence = 0.01
        this.car8.options.wheelMaxSuspensionTravel = 0.3
        this.car8.options.wheelCustomSlidingRotationalSpeed = -30
        this.car8.options.wheelMass = 5
        this.car8.options.controlsSteeringSpeed = 0.005 * 3
        this.car8.options.controlsSteeringMax = Math.PI * 0.17
        this.car8.options.controlsSteeringQuad = false
        this.car8.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car8.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car8.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car8.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car8.options.controlsAcceleratingQuad = true
        this.car8.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car8.upsideDown = {}
        this.car8.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car8.upsideDown.pendingTimeout = null
        this.car8.upsideDown.turningTimeout = null
    
        // Jump
        this.car8.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car8.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car8.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car8.create = () => {

            // Chassis
            this.car8.chassis = {}
    
            this.car8.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car8.options.chassisDepth * 0.5, this.car8.options.chassisWidth * 0.5, this.car8.options.chassisHeight * 0.5))
    
            this.car8.chassis.body = new CANNON.Body({ mass: this.car8.options.chassisMass })
            this.car8.chassis.body.allowSleep = false
            this.car8.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car8.chassis.body.sleep()
            this.car8.chassis.body.addShape(this.car8.chassis.shape, this.car8.options.chassisOffset)
            this.car8.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car8.chassis.body);
            this.car8.chassis.body.playerId = playerId;
    
            // Sound
            this.car8.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car8.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car8.chassis.body
            })
    
            // Wheel
            this.car8.wheels = {}
            this.car8.wheels.options = {
                radius: this.car8.options.wheelRadius,
                height: this.car8.options.wheelHeight,
                suspensionStiffness: this.car8.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car8.options.wheelSuspensionRestLength,
                frictionSlip: this.car8.options.wheelFrictionSlip,
                dampingRelaxation: this.car8.options.wheelDampingRelaxation,
                dampingCompression: this.car8.options.wheelDampingCompression,
                maxSuspensionForce: this.car8.options.wheelMaxSuspensionForce,
                rollInfluence: this.car8.options.wheelRollInfluence,
                maxSuspensionTravel: this.car8.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car8.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car8.wheels.options.chassisConnectionPointLocal.set(this.car8.options.wheelFrontOffsetDepth, this.car8.options.wheelOffsetWidth, 0)
            this.car8.vehicle.addWheel(this.car8.wheels.options)
    
            // Front right
            this.car8.wheels.options.chassisConnectionPointLocal.set(this.car8.options.wheelFrontOffsetDepth, -this.car8.options.wheelOffsetWidth, 0)
            this.car8.vehicle.addWheel(this.car8.wheels.options)
    
            // Back left
            this.car8.wheels.options.chassisConnectionPointLocal.set(this.car8.options.wheelBackOffsetDepth, this.car8.options.wheelOffsetWidth, 0)
            this.car8.vehicle.addWheel(this.car8.wheels.options)
    
            // Back right
            this.car8.wheels.options.chassisConnectionPointLocal.set(this.car8.options.wheelBackOffsetDepth, -this.car8.options.wheelOffsetWidth, 0)
            this.car8.vehicle.addWheel(this.car8.wheels.options)
    
            this.car8.vehicle.addToWorld(this.world)
    
            this.car8.wheels.indexes = {}
    
            this.car8.wheels.indexes.frontLeft = 0
            this.car8.wheels.indexes.frontRight = 1
            this.car8.wheels.indexes.backLeft = 2
            this.car8.wheels.indexes.backRight = 3
            this.car8.wheels.bodies = []
    
            for (const _wheelInfos of this.car8.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car8.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car8.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car8.wheels.bodies.push(body)
            }
    
            // Model
            this.car8.model = {}
            this.car8.model.container = new THREE.Object3D()
            this.models.container.add(this.car8.model.container)
    
            this.car8.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car8.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car8.options.chassisDepth, this.car8.options.chassisWidth, this.car8.options.chassisHeight), this.car8.model.material)
            this.car8.model.container.add(this.car8.model.chassis)
    
            this.car8.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car8.options.wheelRadius, this.car8.options.wheelRadius, this.car8.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car8.model.material)
                this.car8.model.container.add(wheel)
                this.car8.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car8.destroy = () => {
            this.car8.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car8.model.container)
        }
    
        // Recreate method
        this.car8.recreate = () => {
            this.car8.destroy()
            this.car8.create()
            this.car8.chassis.body.wakeUp()
        }
    
        // Brake
        this.car8.brake = () => {
            this.car8.vehicle.setBrake(1, 0)
            this.car8.vehicle.setBrake(1, 1)
            this.car8.vehicle.setBrake(1, 2)
            this.car8.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car8.unbrake = () => {
            this.car8.vehicle.setBrake(0, 0)
            this.car8.vehicle.setBrake(0, 1)
            this.car8.vehicle.setBrake(0, 2)
            this.car8.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car8.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car8.oldPosition)
    
            this.car8.oldPosition.copy(this.car8.chassis.body.position)
            this.car8.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car8.chassis.body.vectorToWorldFrame(localForward, this.car8.worldForward)
            this.car8.angle = Math.atan2(this.car8.worldForward.y, this.car8.worldForward.x)
    
            this.car8.forwardSpeed = this.car8.worldForward.dot(positionDelta)
            this.car8.goingForward = this.car8.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car8.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car8.upsideDown.state === 'watching') {
                    this.car8.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car8.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car8.upsideDown.state = 'turning'
                            this.car8.jump(true)
        
                            this.car8.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car8.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car8.upsideDown.state === 'pending') {
                    this.car8.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car8.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car8.vehicle.wheelInfos.length; i++) {
                this.car8.vehicle.updateWheelTransform(i)
    
                const transform = this.car8.vehicle.wheelInfos[i].worldTransform
                this.car8.wheels.bodies[i].position.copy(transform.position)
                this.car8.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car8.wheels.bodies[i].quaternion = this.car8.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car8.worldForward.clone()
    
                if (this.car8.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car8.chassis.body.velocity.length() * 0.1)
    
                this.car8.chassis.body.applyImpulse(slowDownForce, this.car8.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car8.model.chassis.position.copy(this.car8.chassis.body.position).add(this.car8.options.chassisOffset)
            this.car8.model.chassis.quaternion.copy(this.car8.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car8.wheels.bodies) {
                const wheelBody = this.car8.wheels.bodies[_wheelKey]
                const wheelMesh = this.car8.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car8.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car8.forwardSpeed) < 0.01 ? true : this.car8.goingForward
                this.car8.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car8.steering) > this.car8.options.controlsSteeringMax) {
                    this.car8.steering = Math.sign(this.car8.steering) * this.car8.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car8.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car8.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car8.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car8.steering) > steerStrength) {
                        this.car8.steering -= steerStrength * Math.sign(this.car8.steering)
                    } else {
                        this.car8.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car8.steering) > this.car8.options.controlsSteeringMax) {
                    this.car8.steering = Math.sign(this.car8.steering) * this.car8.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car8.options.controlsAcceleratingSpeedBoost : this.car8.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car8.options.controlsAcceleratinMaxSpeedBoost : this.car8.options.controlsAcceleratinMaxSpeed
    
            this.car8.vehicle.applyEngineForce(-this.car8.accelerating, this.car8.wheels.indexes.backLeft)
            this.car8.vehicle.applyEngineForce(-this.car8.accelerating, this.car8.wheels.indexes.backRight)
    
            if (this.car8.options.controlsSteeringQuad) {
                this.car8.vehicle.applyEngineForce(-this.car8.accelerating, this.car8.wheels.indexes.frontLeft)
                this.car8.vehicle.applyEngineForce(-this.car8.accelerating, this.car8.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car8.vehicle.setBrake(this.car8.options.controlsBrakeStrength, 0)
                this.car8.vehicle.setBrake(this.car8.options.controlsBrakeStrength, 1)
                this.car8.vehicle.setBrake(this.car8.options.controlsBrakeStrength, 2)
                this.car8.vehicle.setBrake(this.car8.options.controlsBrakeStrength, 3)
            } else {
                this.car8.vehicle.setBrake(0, 0)
                this.car8.vehicle.setBrake(0, 1)
                this.car8.vehicle.setBrake(0, 2)
                this.car8.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car8.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar7(playerId) {
        this.car7 = {}
    
        this.car7.steering = 0
        this.car7.accelerating = 0
        this.car7.speed = 0
        this.car7.worldForward = new CANNON.Vec3()
        this.car7.angle = 0
        this.car7.forwardSpeed = 0
        this.car7.oldPosition = new CANNON.Vec3()
        this.car7.goingForward = true
    
        // Options
        this.car7.options = {}
        this.car7.options.chassisWidth = 1.02
        this.car7.options.chassisHeight = 1.16
        this.car7.options.chassisDepth = 2.03
        this.car7.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car7.options.chassisMass = 0
        this.car7.options.wheelFrontOffsetDepth = 0.635
        this.car7.options.wheelBackOffsetDepth = -0.475
        this.car7.options.wheelOffsetWidth = 0.39
        this.car7.options.wheelRadius = 0.25
        this.car7.options.wheelHeight = 0.24
        this.car7.options.wheelSuspensionStiffness = 50
        this.car7.options.wheelSuspensionRestLength = 0.1
        this.car7.options.wheelFrictionSlip = 10
        this.car7.options.wheelDampingRelaxation = 1.8
        this.car7.options.wheelDampingCompression = 1.5
        this.car7.options.wheelMaxSuspensionForce = 100000
        this.car7.options.wheelRollInfluence = 0.01
        this.car7.options.wheelMaxSuspensionTravel = 0.3
        this.car7.options.wheelCustomSlidingRotationalSpeed = -30
        this.car7.options.wheelMass = 5
        this.car7.options.controlsSteeringSpeed = 0.005 * 3
        this.car7.options.controlsSteeringMax = Math.PI * 0.17
        this.car7.options.controlsSteeringQuad = false
        this.car7.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car7.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car7.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car7.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car7.options.controlsAcceleratingQuad = true
        this.car7.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car7.upsideDown = {}
        this.car7.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car7.upsideDown.pendingTimeout = null
        this.car7.upsideDown.turningTimeout = null
    
        // Jump
        this.car7.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car7.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car7.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car7.create = () => {

            // Chassis
            this.car7.chassis = {}
    
            this.car7.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car7.options.chassisDepth * 0.5, this.car7.options.chassisWidth * 0.5, this.car7.options.chassisHeight * 0.5))
    
            this.car7.chassis.body = new CANNON.Body({ mass: this.car7.options.chassisMass })
            this.car7.chassis.body.allowSleep = false
            this.car7.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car7.chassis.body.sleep()
            this.car7.chassis.body.addShape(this.car7.chassis.shape, this.car7.options.chassisOffset)
            this.car7.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car7.chassis.body);
            this.car7.chassis.body.playerId = playerId;
    
            // Sound
            this.car7.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car7.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car7.chassis.body
            })
    
            // Wheel
            this.car7.wheels = {}
            this.car7.wheels.options = {
                radius: this.car7.options.wheelRadius,
                height: this.car7.options.wheelHeight,
                suspensionStiffness: this.car7.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car7.options.wheelSuspensionRestLength,
                frictionSlip: this.car7.options.wheelFrictionSlip,
                dampingRelaxation: this.car7.options.wheelDampingRelaxation,
                dampingCompression: this.car7.options.wheelDampingCompression,
                maxSuspensionForce: this.car7.options.wheelMaxSuspensionForce,
                rollInfluence: this.car7.options.wheelRollInfluence,
                maxSuspensionTravel: this.car7.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car7.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car7.wheels.options.chassisConnectionPointLocal.set(this.car7.options.wheelFrontOffsetDepth, this.car7.options.wheelOffsetWidth, 0)
            this.car7.vehicle.addWheel(this.car7.wheels.options)
    
            // Front right
            this.car7.wheels.options.chassisConnectionPointLocal.set(this.car7.options.wheelFrontOffsetDepth, -this.car7.options.wheelOffsetWidth, 0)
            this.car7.vehicle.addWheel(this.car7.wheels.options)
    
            // Back left
            this.car7.wheels.options.chassisConnectionPointLocal.set(this.car7.options.wheelBackOffsetDepth, this.car7.options.wheelOffsetWidth, 0)
            this.car7.vehicle.addWheel(this.car7.wheels.options)
    
            // Back right
            this.car7.wheels.options.chassisConnectionPointLocal.set(this.car7.options.wheelBackOffsetDepth, -this.car7.options.wheelOffsetWidth, 0)
            this.car7.vehicle.addWheel(this.car7.wheels.options)
    
            this.car7.vehicle.addToWorld(this.world)
    
            this.car7.wheels.indexes = {}
    
            this.car7.wheels.indexes.frontLeft = 0
            this.car7.wheels.indexes.frontRight = 1
            this.car7.wheels.indexes.backLeft = 2
            this.car7.wheels.indexes.backRight = 3
            this.car7.wheels.bodies = []
    
            for (const _wheelInfos of this.car7.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car7.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car7.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car7.wheels.bodies.push(body)
            }
    
            // Model
            this.car7.model = {}
            this.car7.model.container = new THREE.Object3D()
            this.models.container.add(this.car7.model.container)
    
            this.car7.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car7.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car7.options.chassisDepth, this.car7.options.chassisWidth, this.car7.options.chassisHeight), this.car7.model.material)
            this.car7.model.container.add(this.car7.model.chassis)
    
            this.car7.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car7.options.wheelRadius, this.car7.options.wheelRadius, this.car7.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car7.model.material)
                this.car7.model.container.add(wheel)
                this.car7.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car7.destroy = () => {
            this.car7.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car7.model.container)
        }
    
        // Recreate method
        this.car7.recreate = () => {
            this.car7.destroy()
            this.car7.create()
            this.car7.chassis.body.wakeUp()
        }
    
        // Brake
        this.car7.brake = () => {
            this.car7.vehicle.setBrake(1, 0)
            this.car7.vehicle.setBrake(1, 1)
            this.car7.vehicle.setBrake(1, 2)
            this.car7.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car7.unbrake = () => {
            this.car7.vehicle.setBrake(0, 0)
            this.car7.vehicle.setBrake(0, 1)
            this.car7.vehicle.setBrake(0, 2)
            this.car7.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car7.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car7.oldPosition)
    
            this.car7.oldPosition.copy(this.car7.chassis.body.position)
            this.car7.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car7.chassis.body.vectorToWorldFrame(localForward, this.car7.worldForward)
            this.car7.angle = Math.atan2(this.car7.worldForward.y, this.car7.worldForward.x)
    
            this.car7.forwardSpeed = this.car7.worldForward.dot(positionDelta)
            this.car7.goingForward = this.car7.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car7.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car7.upsideDown.state === 'watching') {
                    this.car7.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car7.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car7.upsideDown.state = 'turning'
                            this.car7.jump(true)
        
                            this.car7.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car7.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car7.upsideDown.state === 'pending') {
                    this.car7.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car7.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car7.vehicle.wheelInfos.length; i++) {
                this.car7.vehicle.updateWheelTransform(i)
    
                const transform = this.car7.vehicle.wheelInfos[i].worldTransform
                this.car7.wheels.bodies[i].position.copy(transform.position)
                this.car7.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car7.wheels.bodies[i].quaternion = this.car7.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car7.worldForward.clone()
    
                if (this.car7.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car7.chassis.body.velocity.length() * 0.1)
    
                this.car7.chassis.body.applyImpulse(slowDownForce, this.car7.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car7.model.chassis.position.copy(this.car7.chassis.body.position).add(this.car7.options.chassisOffset)
            this.car7.model.chassis.quaternion.copy(this.car7.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car7.wheels.bodies) {
                const wheelBody = this.car7.wheels.bodies[_wheelKey]
                const wheelMesh = this.car7.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car7.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car7.forwardSpeed) < 0.01 ? true : this.car7.goingForward
                this.car7.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car7.steering) > this.car7.options.controlsSteeringMax) {
                    this.car7.steering = Math.sign(this.car7.steering) * this.car7.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car7.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car7.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car7.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car7.steering) > steerStrength) {
                        this.car7.steering -= steerStrength * Math.sign(this.car7.steering)
                    } else {
                        this.car7.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car7.steering) > this.car7.options.controlsSteeringMax) {
                    this.car7.steering = Math.sign(this.car7.steering) * this.car7.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car7.options.controlsAcceleratingSpeedBoost : this.car7.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car7.options.controlsAcceleratinMaxSpeedBoost : this.car7.options.controlsAcceleratinMaxSpeed
    
            this.car7.vehicle.applyEngineForce(-this.car7.accelerating, this.car7.wheels.indexes.backLeft)
            this.car7.vehicle.applyEngineForce(-this.car7.accelerating, this.car7.wheels.indexes.backRight)
    
            if (this.car7.options.controlsSteeringQuad) {
                this.car7.vehicle.applyEngineForce(-this.car7.accelerating, this.car7.wheels.indexes.frontLeft)
                this.car7.vehicle.applyEngineForce(-this.car7.accelerating, this.car7.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car7.vehicle.setBrake(this.car7.options.controlsBrakeStrength, 0)
                this.car7.vehicle.setBrake(this.car7.options.controlsBrakeStrength, 1)
                this.car7.vehicle.setBrake(this.car7.options.controlsBrakeStrength, 2)
                this.car7.vehicle.setBrake(this.car7.options.controlsBrakeStrength, 3)
            } else {
                this.car7.vehicle.setBrake(0, 0)
                this.car7.vehicle.setBrake(0, 1)
                this.car7.vehicle.setBrake(0, 2)
                this.car7.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car7.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar6(playerId) {
        this.car6 = {}
    
        this.car6.steering = 0
        this.car6.accelerating = 0
        this.car6.speed = 0
        this.car6.worldForward = new CANNON.Vec3()
        this.car6.angle = 0
        this.car6.forwardSpeed = 0
        this.car6.oldPosition = new CANNON.Vec3()
        this.car6.goingForward = true
    
        // Options
        this.car6.options = {}
        this.car6.options.chassisWidth = 1.02
        this.car6.options.chassisHeight = 1.16
        this.car6.options.chassisDepth = 2.03
        this.car6.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car6.options.chassisMass = 0
        this.car6.options.wheelFrontOffsetDepth = 0.635
        this.car6.options.wheelBackOffsetDepth = -0.475
        this.car6.options.wheelOffsetWidth = 0.39
        this.car6.options.wheelRadius = 0.25
        this.car6.options.wheelHeight = 0.24
        this.car6.options.wheelSuspensionStiffness = 50
        this.car6.options.wheelSuspensionRestLength = 0.1
        this.car6.options.wheelFrictionSlip = 10
        this.car6.options.wheelDampingRelaxation = 1.8
        this.car6.options.wheelDampingCompression = 1.5
        this.car6.options.wheelMaxSuspensionForce = 100000
        this.car6.options.wheelRollInfluence = 0.01
        this.car6.options.wheelMaxSuspensionTravel = 0.3
        this.car6.options.wheelCustomSlidingRotationalSpeed = -30
        this.car6.options.wheelMass = 5
        this.car6.options.controlsSteeringSpeed = 0.005 * 3
        this.car6.options.controlsSteeringMax = Math.PI * 0.17
        this.car6.options.controlsSteeringQuad = false
        this.car6.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car6.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car6.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car6.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car6.options.controlsAcceleratingQuad = true
        this.car6.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car6.upsideDown = {}
        this.car6.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car6.upsideDown.pendingTimeout = null
        this.car6.upsideDown.turningTimeout = null
    
        // Jump
        this.car6.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car6.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car6.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car6.create = () => {

            // Chassis
            this.car6.chassis = {}
    
            this.car6.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car6.options.chassisDepth * 0.5, this.car6.options.chassisWidth * 0.5, this.car6.options.chassisHeight * 0.5))
    
            this.car6.chassis.body = new CANNON.Body({ mass: this.car6.options.chassisMass })
            this.car6.chassis.body.allowSleep = false
            this.car6.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car6.chassis.body.sleep()
            this.car6.chassis.body.addShape(this.car6.chassis.shape, this.car6.options.chassisOffset)
            this.car6.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car6.chassis.body);
            this.car6.chassis.body.playerId = playerId;
    
            // Sound
            this.car6.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car6.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car6.chassis.body
            })
    
            // Wheel
            this.car6.wheels = {}
            this.car6.wheels.options = {
                radius: this.car6.options.wheelRadius,
                height: this.car6.options.wheelHeight,
                suspensionStiffness: this.car6.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car6.options.wheelSuspensionRestLength,
                frictionSlip: this.car6.options.wheelFrictionSlip,
                dampingRelaxation: this.car6.options.wheelDampingRelaxation,
                dampingCompression: this.car6.options.wheelDampingCompression,
                maxSuspensionForce: this.car6.options.wheelMaxSuspensionForce,
                rollInfluence: this.car6.options.wheelRollInfluence,
                maxSuspensionTravel: this.car6.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car6.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car6.wheels.options.chassisConnectionPointLocal.set(this.car6.options.wheelFrontOffsetDepth, this.car6.options.wheelOffsetWidth, 0)
            this.car6.vehicle.addWheel(this.car6.wheels.options)
    
            // Front right
            this.car6.wheels.options.chassisConnectionPointLocal.set(this.car6.options.wheelFrontOffsetDepth, -this.car6.options.wheelOffsetWidth, 0)
            this.car6.vehicle.addWheel(this.car6.wheels.options)
    
            // Back left
            this.car6.wheels.options.chassisConnectionPointLocal.set(this.car6.options.wheelBackOffsetDepth, this.car6.options.wheelOffsetWidth, 0)
            this.car6.vehicle.addWheel(this.car6.wheels.options)
    
            // Back right
            this.car6.wheels.options.chassisConnectionPointLocal.set(this.car6.options.wheelBackOffsetDepth, -this.car6.options.wheelOffsetWidth, 0)
            this.car6.vehicle.addWheel(this.car6.wheels.options)
    
            this.car6.vehicle.addToWorld(this.world)
    
            this.car6.wheels.indexes = {}
    
            this.car6.wheels.indexes.frontLeft = 0
            this.car6.wheels.indexes.frontRight = 1
            this.car6.wheels.indexes.backLeft = 2
            this.car6.wheels.indexes.backRight = 3
            this.car6.wheels.bodies = []
    
            for (const _wheelInfos of this.car6.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car6.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car6.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car6.wheels.bodies.push(body)
            }
    
            // Model
            this.car6.model = {}
            this.car6.model.container = new THREE.Object3D()
            this.models.container.add(this.car6.model.container)
    
            this.car6.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car6.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car6.options.chassisDepth, this.car6.options.chassisWidth, this.car6.options.chassisHeight), this.car6.model.material)
            this.car6.model.container.add(this.car6.model.chassis)
    
            this.car6.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car6.options.wheelRadius, this.car6.options.wheelRadius, this.car6.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car6.model.material)
                this.car6.model.container.add(wheel)
                this.car6.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car6.destroy = () => {
            this.car6.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car6.model.container)
        }
    
        // Recreate method
        this.car6.recreate = () => {
            this.car6.destroy()
            this.car6.create()
            this.car6.chassis.body.wakeUp()
        }
    
        // Brake
        this.car6.brake = () => {
            this.car6.vehicle.setBrake(1, 0)
            this.car6.vehicle.setBrake(1, 1)
            this.car6.vehicle.setBrake(1, 2)
            this.car6.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car6.unbrake = () => {
            this.car6.vehicle.setBrake(0, 0)
            this.car6.vehicle.setBrake(0, 1)
            this.car6.vehicle.setBrake(0, 2)
            this.car6.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car6.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car6.oldPosition)
    
            this.car6.oldPosition.copy(this.car6.chassis.body.position)
            this.car6.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car6.chassis.body.vectorToWorldFrame(localForward, this.car6.worldForward)
            this.car6.angle = Math.atan2(this.car6.worldForward.y, this.car6.worldForward.x)
    
            this.car6.forwardSpeed = this.car6.worldForward.dot(positionDelta)
            this.car6.goingForward = this.car6.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car6.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car6.upsideDown.state === 'watching') {
                    this.car6.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car6.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car6.upsideDown.state = 'turning'
                            this.car6.jump(true)
        
                            this.car6.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car6.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car6.upsideDown.state === 'pending') {
                    this.car6.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car6.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car6.vehicle.wheelInfos.length; i++) {
                this.car6.vehicle.updateWheelTransform(i)
    
                const transform = this.car6.vehicle.wheelInfos[i].worldTransform
                this.car6.wheels.bodies[i].position.copy(transform.position)
                this.car6.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car6.wheels.bodies[i].quaternion = this.car6.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car6.worldForward.clone()
    
                if (this.car6.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car6.chassis.body.velocity.length() * 0.1)
    
                this.car6.chassis.body.applyImpulse(slowDownForce, this.car6.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car6.model.chassis.position.copy(this.car6.chassis.body.position).add(this.car6.options.chassisOffset)
            this.car6.model.chassis.quaternion.copy(this.car6.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car6.wheels.bodies) {
                const wheelBody = this.car6.wheels.bodies[_wheelKey]
                const wheelMesh = this.car6.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car6.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car6.forwardSpeed) < 0.01 ? true : this.car6.goingForward
                this.car6.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car6.steering) > this.car6.options.controlsSteeringMax) {
                    this.car6.steering = Math.sign(this.car6.steering) * this.car6.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car6.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car6.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car6.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car6.steering) > steerStrength) {
                        this.car6.steering -= steerStrength * Math.sign(this.car6.steering)
                    } else {
                        this.car6.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car6.steering) > this.car6.options.controlsSteeringMax) {
                    this.car6.steering = Math.sign(this.car6.steering) * this.car6.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car6.options.controlsAcceleratingSpeedBoost : this.car6.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car6.options.controlsAcceleratinMaxSpeedBoost : this.car6.options.controlsAcceleratinMaxSpeed
    
            this.car6.vehicle.applyEngineForce(-this.car6.accelerating, this.car6.wheels.indexes.backLeft)
            this.car6.vehicle.applyEngineForce(-this.car6.accelerating, this.car6.wheels.indexes.backRight)
    
            if (this.car6.options.controlsSteeringQuad) {
                this.car6.vehicle.applyEngineForce(-this.car6.accelerating, this.car6.wheels.indexes.frontLeft)
                this.car6.vehicle.applyEngineForce(-this.car6.accelerating, this.car6.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car6.vehicle.setBrake(this.car6.options.controlsBrakeStrength, 0)
                this.car6.vehicle.setBrake(this.car6.options.controlsBrakeStrength, 1)
                this.car6.vehicle.setBrake(this.car6.options.controlsBrakeStrength, 2)
                this.car6.vehicle.setBrake(this.car6.options.controlsBrakeStrength, 3)
            } else {
                this.car6.vehicle.setBrake(0, 0)
                this.car6.vehicle.setBrake(0, 1)
                this.car6.vehicle.setBrake(0, 2)
                this.car6.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car6.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar5(playerId) {
        this.car5 = {}
    
        this.car5.steering = 0
        this.car5.accelerating = 0
        this.car5.speed = 0
        this.car5.worldForward = new CANNON.Vec3()
        this.car5.angle = 0
        this.car5.forwardSpeed = 0
        this.car5.oldPosition = new CANNON.Vec3()
        this.car5.goingForward = true
    
        // Options
        this.car5.options = {}
        this.car5.options.chassisWidth = 1.02
        this.car5.options.chassisHeight = 1.16
        this.car5.options.chassisDepth = 2.03
        this.car5.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car5.options.chassisMass = 0
        this.car5.options.wheelFrontOffsetDepth = 0.635
        this.car5.options.wheelBackOffsetDepth = -0.475
        this.car5.options.wheelOffsetWidth = 0.39
        this.car5.options.wheelRadius = 0.25
        this.car5.options.wheelHeight = 0.24
        this.car5.options.wheelSuspensionStiffness = 50
        this.car5.options.wheelSuspensionRestLength = 0.1
        this.car5.options.wheelFrictionSlip = 10
        this.car5.options.wheelDampingRelaxation = 1.8
        this.car5.options.wheelDampingCompression = 1.5
        this.car5.options.wheelMaxSuspensionForce = 100000
        this.car5.options.wheelRollInfluence = 0.01
        this.car5.options.wheelMaxSuspensionTravel = 0.3
        this.car5.options.wheelCustomSlidingRotationalSpeed = -30
        this.car5.options.wheelMass = 5
        this.car5.options.controlsSteeringSpeed = 0.005 * 3
        this.car5.options.controlsSteeringMax = Math.PI * 0.17
        this.car5.options.controlsSteeringQuad = false
        this.car5.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car5.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car5.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car5.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car5.options.controlsAcceleratingQuad = true
        this.car5.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car5.upsideDown = {}
        this.car5.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car5.upsideDown.pendingTimeout = null
        this.car5.upsideDown.turningTimeout = null
    
        // Jump
        this.car5.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car5.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car5.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car5.create = () => {

            // Chassis
            this.car5.chassis = {}
    
            this.car5.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car5.options.chassisDepth * 0.5, this.car5.options.chassisWidth * 0.5, this.car5.options.chassisHeight * 0.5))
    
            this.car5.chassis.body = new CANNON.Body({ mass: this.car5.options.chassisMass })
            this.car5.chassis.body.allowSleep = false
            this.car5.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car5.chassis.body.sleep()
            this.car5.chassis.body.addShape(this.car5.chassis.shape, this.car5.options.chassisOffset)
            this.car5.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car5.chassis.body);
            this.car5.chassis.body.playerId = playerId;
    
            // Sound
            this.car5.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car5.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car5.chassis.body
            })
    
            // Wheel
            this.car5.wheels = {}
            this.car5.wheels.options = {
                radius: this.car5.options.wheelRadius,
                height: this.car5.options.wheelHeight,
                suspensionStiffness: this.car5.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car5.options.wheelSuspensionRestLength,
                frictionSlip: this.car5.options.wheelFrictionSlip,
                dampingRelaxation: this.car5.options.wheelDampingRelaxation,
                dampingCompression: this.car5.options.wheelDampingCompression,
                maxSuspensionForce: this.car5.options.wheelMaxSuspensionForce,
                rollInfluence: this.car5.options.wheelRollInfluence,
                maxSuspensionTravel: this.car5.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car5.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car5.wheels.options.chassisConnectionPointLocal.set(this.car5.options.wheelFrontOffsetDepth, this.car5.options.wheelOffsetWidth, 0)
            this.car5.vehicle.addWheel(this.car5.wheels.options)
    
            // Front right
            this.car5.wheels.options.chassisConnectionPointLocal.set(this.car5.options.wheelFrontOffsetDepth, -this.car5.options.wheelOffsetWidth, 0)
            this.car5.vehicle.addWheel(this.car5.wheels.options)
    
            // Back left
            this.car5.wheels.options.chassisConnectionPointLocal.set(this.car5.options.wheelBackOffsetDepth, this.car5.options.wheelOffsetWidth, 0)
            this.car5.vehicle.addWheel(this.car5.wheels.options)
    
            // Back right
            this.car5.wheels.options.chassisConnectionPointLocal.set(this.car5.options.wheelBackOffsetDepth, -this.car5.options.wheelOffsetWidth, 0)
            this.car5.vehicle.addWheel(this.car5.wheels.options)
    
            this.car5.vehicle.addToWorld(this.world)
    
            this.car5.wheels.indexes = {}
    
            this.car5.wheels.indexes.frontLeft = 0
            this.car5.wheels.indexes.frontRight = 1
            this.car5.wheels.indexes.backLeft = 2
            this.car5.wheels.indexes.backRight = 3
            this.car5.wheels.bodies = []
    
            for (const _wheelInfos of this.car5.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car5.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car5.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car5.wheels.bodies.push(body)
            }
    
            // Model
            this.car5.model = {}
            this.car5.model.container = new THREE.Object3D()
            this.models.container.add(this.car5.model.container)
    
            this.car5.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car5.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car5.options.chassisDepth, this.car5.options.chassisWidth, this.car5.options.chassisHeight), this.car5.model.material)
            this.car5.model.container.add(this.car5.model.chassis)
    
            this.car5.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car5.options.wheelRadius, this.car5.options.wheelRadius, this.car5.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car5.model.material)
                this.car5.model.container.add(wheel)
                this.car5.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car5.destroy = () => {
            this.car5.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car5.model.container)
        }
    
        // Recreate method
        this.car5.recreate = () => {
            this.car5.destroy()
            this.car5.create()
            this.car5.chassis.body.wakeUp()
        }
    
        // Brake
        this.car5.brake = () => {
            this.car5.vehicle.setBrake(1, 0)
            this.car5.vehicle.setBrake(1, 1)
            this.car5.vehicle.setBrake(1, 2)
            this.car5.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car5.unbrake = () => {
            this.car5.vehicle.setBrake(0, 0)
            this.car5.vehicle.setBrake(0, 1)
            this.car5.vehicle.setBrake(0, 2)
            this.car5.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car5.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car5.oldPosition)
    
            this.car5.oldPosition.copy(this.car5.chassis.body.position)
            this.car5.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car5.chassis.body.vectorToWorldFrame(localForward, this.car5.worldForward)
            this.car5.angle = Math.atan2(this.car5.worldForward.y, this.car5.worldForward.x)
    
            this.car5.forwardSpeed = this.car5.worldForward.dot(positionDelta)
            this.car5.goingForward = this.car5.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car5.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car5.upsideDown.state === 'watching') {
                    this.car5.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car5.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car5.upsideDown.state = 'turning'
                            this.car5.jump(true)
        
                            this.car5.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car5.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car5.upsideDown.state === 'pending') {
                    this.car5.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car5.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car5.vehicle.wheelInfos.length; i++) {
                this.car5.vehicle.updateWheelTransform(i)
    
                const transform = this.car5.vehicle.wheelInfos[i].worldTransform
                this.car5.wheels.bodies[i].position.copy(transform.position)
                this.car5.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car5.wheels.bodies[i].quaternion = this.car5.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car5.worldForward.clone()
    
                if (this.car5.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car5.chassis.body.velocity.length() * 0.1)
    
                this.car5.chassis.body.applyImpulse(slowDownForce, this.car5.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car5.model.chassis.position.copy(this.car5.chassis.body.position).add(this.car5.options.chassisOffset)
            this.car5.model.chassis.quaternion.copy(this.car5.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car5.wheels.bodies) {
                const wheelBody = this.car5.wheels.bodies[_wheelKey]
                const wheelMesh = this.car5.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car5.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car5.forwardSpeed) < 0.01 ? true : this.car5.goingForward
                this.car5.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car5.steering) > this.car5.options.controlsSteeringMax) {
                    this.car5.steering = Math.sign(this.car5.steering) * this.car5.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car5.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car5.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car5.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car5.steering) > steerStrength) {
                        this.car5.steering -= steerStrength * Math.sign(this.car5.steering)
                    } else {
                        this.car5.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car5.steering) > this.car5.options.controlsSteeringMax) {
                    this.car5.steering = Math.sign(this.car5.steering) * this.car5.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car5.options.controlsAcceleratingSpeedBoost : this.car5.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car5.options.controlsAcceleratinMaxSpeedBoost : this.car5.options.controlsAcceleratinMaxSpeed
    
            this.car5.vehicle.applyEngineForce(-this.car5.accelerating, this.car5.wheels.indexes.backLeft)
            this.car5.vehicle.applyEngineForce(-this.car5.accelerating, this.car5.wheels.indexes.backRight)
    
            if (this.car5.options.controlsSteeringQuad) {
                this.car5.vehicle.applyEngineForce(-this.car5.accelerating, this.car5.wheels.indexes.frontLeft)
                this.car5.vehicle.applyEngineForce(-this.car5.accelerating, this.car5.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car5.vehicle.setBrake(this.car5.options.controlsBrakeStrength, 0)
                this.car5.vehicle.setBrake(this.car5.options.controlsBrakeStrength, 1)
                this.car5.vehicle.setBrake(this.car5.options.controlsBrakeStrength, 2)
                this.car5.vehicle.setBrake(this.car5.options.controlsBrakeStrength, 3)
            } else {
                this.car5.vehicle.setBrake(0, 0)
                this.car5.vehicle.setBrake(0, 1)
                this.car5.vehicle.setBrake(0, 2)
                this.car5.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car5.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar4(playerId) {
        this.car4 = {}
    
        this.car4.steering = 0
        this.car4.accelerating = 0
        this.car4.speed = 0
        this.car4.worldForward = new CANNON.Vec3()
        this.car4.angle = 0
        this.car4.forwardSpeed = 0
        this.car4.oldPosition = new CANNON.Vec3()
        this.car4.goingForward = true
    
        // Options
        this.car4.options = {}
        this.car4.options.chassisWidth = 1.02
        this.car4.options.chassisHeight = 1.16
        this.car4.options.chassisDepth = 2.03
        this.car4.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car4.options.chassisMass = 0
        this.car4.options.wheelFrontOffsetDepth = 0.635
        this.car4.options.wheelBackOffsetDepth = -0.475
        this.car4.options.wheelOffsetWidth = 0.39
        this.car4.options.wheelRadius = 0.25
        this.car4.options.wheelHeight = 0.24
        this.car4.options.wheelSuspensionStiffness = 50
        this.car4.options.wheelSuspensionRestLength = 0.1
        this.car4.options.wheelFrictionSlip = 10
        this.car4.options.wheelDampingRelaxation = 1.8
        this.car4.options.wheelDampingCompression = 1.5
        this.car4.options.wheelMaxSuspensionForce = 100000
        this.car4.options.wheelRollInfluence = 0.01
        this.car4.options.wheelMaxSuspensionTravel = 0.3
        this.car4.options.wheelCustomSlidingRotationalSpeed = -30
        this.car4.options.wheelMass = 5
        this.car4.options.controlsSteeringSpeed = 0.005 * 3
        this.car4.options.controlsSteeringMax = Math.PI * 0.17
        this.car4.options.controlsSteeringQuad = false
        this.car4.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car4.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car4.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car4.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car4.options.controlsAcceleratingQuad = true
        this.car4.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car4.upsideDown = {}
        this.car4.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car4.upsideDown.pendingTimeout = null
        this.car4.upsideDown.turningTimeout = null
    
        // Jump
        this.car4.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car4.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car4.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car4.create = () => {

            // Chassis
            this.car4.chassis = {}
    
            this.car4.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car4.options.chassisDepth * 0.5, this.car4.options.chassisWidth * 0.5, this.car4.options.chassisHeight * 0.5))
    
            this.car4.chassis.body = new CANNON.Body({ mass: this.car4.options.chassisMass })
            this.car4.chassis.body.allowSleep = false
            this.car4.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car4.chassis.body.sleep()
            this.car4.chassis.body.addShape(this.car4.chassis.shape, this.car4.options.chassisOffset)
            this.car4.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car4.chassis.body);
            this.car4.chassis.body.playerId = playerId;
    
            // Sound
            this.car4.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car4.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car4.chassis.body
            })
    
            // Wheel
            this.car4.wheels = {}
            this.car4.wheels.options = {
                radius: this.car4.options.wheelRadius,
                height: this.car4.options.wheelHeight,
                suspensionStiffness: this.car4.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car4.options.wheelSuspensionRestLength,
                frictionSlip: this.car4.options.wheelFrictionSlip,
                dampingRelaxation: this.car4.options.wheelDampingRelaxation,
                dampingCompression: this.car4.options.wheelDampingCompression,
                maxSuspensionForce: this.car4.options.wheelMaxSuspensionForce,
                rollInfluence: this.car4.options.wheelRollInfluence,
                maxSuspensionTravel: this.car4.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car4.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car4.wheels.options.chassisConnectionPointLocal.set(this.car4.options.wheelFrontOffsetDepth, this.car4.options.wheelOffsetWidth, 0)
            this.car4.vehicle.addWheel(this.car4.wheels.options)
    
            // Front right
            this.car4.wheels.options.chassisConnectionPointLocal.set(this.car4.options.wheelFrontOffsetDepth, -this.car4.options.wheelOffsetWidth, 0)
            this.car4.vehicle.addWheel(this.car4.wheels.options)
    
            // Back left
            this.car4.wheels.options.chassisConnectionPointLocal.set(this.car4.options.wheelBackOffsetDepth, this.car4.options.wheelOffsetWidth, 0)
            this.car4.vehicle.addWheel(this.car4.wheels.options)
    
            // Back right
            this.car4.wheels.options.chassisConnectionPointLocal.set(this.car4.options.wheelBackOffsetDepth, -this.car4.options.wheelOffsetWidth, 0)
            this.car4.vehicle.addWheel(this.car4.wheels.options)
    
            this.car4.vehicle.addToWorld(this.world)
    
            this.car4.wheels.indexes = {}
    
            this.car4.wheels.indexes.frontLeft = 0
            this.car4.wheels.indexes.frontRight = 1
            this.car4.wheels.indexes.backLeft = 2
            this.car4.wheels.indexes.backRight = 3
            this.car4.wheels.bodies = []
    
            for (const _wheelInfos of this.car4.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car4.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car4.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car4.wheels.bodies.push(body)
            }
    
            // Model
            this.car4.model = {}
            this.car4.model.container = new THREE.Object3D()
            this.models.container.add(this.car4.model.container)
    
            this.car4.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car4.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car4.options.chassisDepth, this.car4.options.chassisWidth, this.car4.options.chassisHeight), this.car4.model.material)
            this.car4.model.container.add(this.car4.model.chassis)
    
            this.car4.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car4.options.wheelRadius, this.car4.options.wheelRadius, this.car4.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car4.model.material)
                this.car4.model.container.add(wheel)
                this.car4.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car4.destroy = () => {
            this.car4.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car4.model.container)
        }
    
        // Recreate method
        this.car4.recreate = () => {
            this.car4.destroy()
            this.car4.create()
            this.car4.chassis.body.wakeUp()
        }
    
        // Brake
        this.car4.brake = () => {
            this.car4.vehicle.setBrake(1, 0)
            this.car4.vehicle.setBrake(1, 1)
            this.car4.vehicle.setBrake(1, 2)
            this.car4.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car4.unbrake = () => {
            this.car4.vehicle.setBrake(0, 0)
            this.car4.vehicle.setBrake(0, 1)
            this.car4.vehicle.setBrake(0, 2)
            this.car4.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car4.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car4.oldPosition)
    
            this.car4.oldPosition.copy(this.car4.chassis.body.position)
            this.car4.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car4.chassis.body.vectorToWorldFrame(localForward, this.car4.worldForward)
            this.car4.angle = Math.atan2(this.car4.worldForward.y, this.car4.worldForward.x)
    
            this.car4.forwardSpeed = this.car4.worldForward.dot(positionDelta)
            this.car4.goingForward = this.car4.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car4.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car4.upsideDown.state === 'watching') {
                    this.car4.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car4.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car4.upsideDown.state = 'turning'
                            this.car4.jump(true)
        
                            this.car4.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car4.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car4.upsideDown.state === 'pending') {
                    this.car4.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car4.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car4.vehicle.wheelInfos.length; i++) {
                this.car4.vehicle.updateWheelTransform(i)
    
                const transform = this.car4.vehicle.wheelInfos[i].worldTransform
                this.car4.wheels.bodies[i].position.copy(transform.position)
                this.car4.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car4.wheels.bodies[i].quaternion = this.car4.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car4.worldForward.clone()
    
                if (this.car4.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car4.chassis.body.velocity.length() * 0.1)
    
                this.car4.chassis.body.applyImpulse(slowDownForce, this.car4.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car4.model.chassis.position.copy(this.car4.chassis.body.position).add(this.car4.options.chassisOffset)
            this.car4.model.chassis.quaternion.copy(this.car4.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car4.wheels.bodies) {
                const wheelBody = this.car4.wheels.bodies[_wheelKey]
                const wheelMesh = this.car4.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car4.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car4.forwardSpeed) < 0.01 ? true : this.car4.goingForward
                this.car4.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car4.steering) > this.car4.options.controlsSteeringMax) {
                    this.car4.steering = Math.sign(this.car4.steering) * this.car4.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car4.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car4.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car4.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car4.steering) > steerStrength) {
                        this.car4.steering -= steerStrength * Math.sign(this.car4.steering)
                    } else {
                        this.car4.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car4.steering) > this.car4.options.controlsSteeringMax) {
                    this.car4.steering = Math.sign(this.car4.steering) * this.car4.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car4.options.controlsAcceleratingSpeedBoost : this.car4.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car4.options.controlsAcceleratinMaxSpeedBoost : this.car4.options.controlsAcceleratinMaxSpeed
    
            this.car4.vehicle.applyEngineForce(-this.car4.accelerating, this.car4.wheels.indexes.backLeft)
            this.car4.vehicle.applyEngineForce(-this.car4.accelerating, this.car4.wheels.indexes.backRight)
    
            if (this.car4.options.controlsSteeringQuad) {
                this.car4.vehicle.applyEngineForce(-this.car4.accelerating, this.car4.wheels.indexes.frontLeft)
                this.car4.vehicle.applyEngineForce(-this.car4.accelerating, this.car4.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car4.vehicle.setBrake(this.car4.options.controlsBrakeStrength, 0)
                this.car4.vehicle.setBrake(this.car4.options.controlsBrakeStrength, 1)
                this.car4.vehicle.setBrake(this.car4.options.controlsBrakeStrength, 2)
                this.car4.vehicle.setBrake(this.car4.options.controlsBrakeStrength, 3)
            } else {
                this.car4.vehicle.setBrake(0, 0)
                this.car4.vehicle.setBrake(0, 1)
                this.car4.vehicle.setBrake(0, 2)
                this.car4.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car4.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar3(playerId) {
        this.car3 = {}
    
        this.car3.steering = 0
        this.car3.accelerating = 0
        this.car3.speed = 0
        this.car3.worldForward = new CANNON.Vec3()
        this.car3.angle = 0
        this.car3.forwardSpeed = 0
        this.car3.oldPosition = new CANNON.Vec3()
        this.car3.goingForward = true
    
        // Options
        this.car3.options = {}
        this.car3.options.chassisWidth = 1.02
        this.car3.options.chassisHeight = 1.16
        this.car3.options.chassisDepth = 2.03
        this.car3.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car3.options.chassisMass = 0
        this.car3.options.wheelFrontOffsetDepth = 0.635
        this.car3.options.wheelBackOffsetDepth = -0.475
        this.car3.options.wheelOffsetWidth = 0.39
        this.car3.options.wheelRadius = 0.25
        this.car3.options.wheelHeight = 0.24
        this.car3.options.wheelSuspensionStiffness = 50
        this.car3.options.wheelSuspensionRestLength = 0.1
        this.car3.options.wheelFrictionSlip = 10
        this.car3.options.wheelDampingRelaxation = 1.8
        this.car3.options.wheelDampingCompression = 1.5
        this.car3.options.wheelMaxSuspensionForce = 100000
        this.car3.options.wheelRollInfluence = 0.01
        this.car3.options.wheelMaxSuspensionTravel = 0.3
        this.car3.options.wheelCustomSlidingRotationalSpeed = -30
        this.car3.options.wheelMass = 5
        this.car3.options.controlsSteeringSpeed = 0.005 * 3
        this.car3.options.controlsSteeringMax = Math.PI * 0.17
        this.car3.options.controlsSteeringQuad = false
        this.car3.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car3.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car3.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car3.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car3.options.controlsAcceleratingQuad = true
        this.car3.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car3.upsideDown = {}
        this.car3.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car3.upsideDown.pendingTimeout = null
        this.car3.upsideDown.turningTimeout = null
    
        // Jump
        this.car3.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car3.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car3.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car3.create = () => {

            // Chassis
            this.car3.chassis = {}
    
            this.car3.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car3.options.chassisDepth * 0.5, this.car3.options.chassisWidth * 0.5, this.car3.options.chassisHeight * 0.5))
    
            this.car3.chassis.body = new CANNON.Body({ mass: this.car3.options.chassisMass })
            // this.car3.chassis.body.battery = 100;
            // this.car3.chassis.body.score = 0;
            this.car3.chassis.body.allowSleep = false
            this.car3.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car3.chassis.body.sleep()
            this.car3.chassis.body.addShape(this.car3.chassis.shape, this.car3.options.chassisOffset)
            this.car3.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car3.chassis.body);
            this.car3.chassis.body.playerId = playerId;
    
            // Sound
            this.car3.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car3.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car3.chassis.body
            })
    
            // Wheel
            this.car3.wheels = {}
            this.car3.wheels.options = {
                radius: this.car3.options.wheelRadius,
                height: this.car3.options.wheelHeight,
                suspensionStiffness: this.car3.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car3.options.wheelSuspensionRestLength,
                frictionSlip: this.car3.options.wheelFrictionSlip,
                dampingRelaxation: this.car3.options.wheelDampingRelaxation,
                dampingCompression: this.car3.options.wheelDampingCompression,
                maxSuspensionForce: this.car3.options.wheelMaxSuspensionForce,
                rollInfluence: this.car3.options.wheelRollInfluence,
                maxSuspensionTravel: this.car3.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car3.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car3.wheels.options.chassisConnectionPointLocal.set(this.car3.options.wheelFrontOffsetDepth, this.car3.options.wheelOffsetWidth, 0)
            this.car3.vehicle.addWheel(this.car3.wheels.options)
    
            // Front right
            this.car3.wheels.options.chassisConnectionPointLocal.set(this.car3.options.wheelFrontOffsetDepth, -this.car3.options.wheelOffsetWidth, 0)
            this.car3.vehicle.addWheel(this.car3.wheels.options)
    
            // Back left
            this.car3.wheels.options.chassisConnectionPointLocal.set(this.car3.options.wheelBackOffsetDepth, this.car3.options.wheelOffsetWidth, 0)
            this.car3.vehicle.addWheel(this.car3.wheels.options)
    
            // Back right
            this.car3.wheels.options.chassisConnectionPointLocal.set(this.car3.options.wheelBackOffsetDepth, -this.car3.options.wheelOffsetWidth, 0)
            this.car3.vehicle.addWheel(this.car3.wheels.options)
    
            this.car3.vehicle.addToWorld(this.world)
    
            this.car3.wheels.indexes = {}
    
            this.car3.wheels.indexes.frontLeft = 0
            this.car3.wheels.indexes.frontRight = 1
            this.car3.wheels.indexes.backLeft = 2
            this.car3.wheels.indexes.backRight = 3
            this.car3.wheels.bodies = []
    
            for (const _wheelInfos of this.car3.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car3.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car3.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car3.wheels.bodies.push(body)
            }
    
            // Model
            this.car3.model = {}
            this.car3.model.container = new THREE.Object3D()
            this.models.container.add(this.car3.model.container)
    
            this.car3.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car3.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car3.options.chassisDepth, this.car3.options.chassisWidth, this.car3.options.chassisHeight), this.car3.model.material)
            this.car3.model.container.add(this.car3.model.chassis)
    
            this.car3.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car3.options.wheelRadius, this.car3.options.wheelRadius, this.car3.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car3.model.material)
                this.car3.model.container.add(wheel)
                this.car3.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car3.destroy = () => {
            this.car3.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car3.model.container)
        }
    
        // Recreate method
        this.car3.recreate = () => {
            this.car3.destroy()
            this.car3.create()
            this.car3.chassis.body.wakeUp()
        }
    
        // Brake
        this.car3.brake = () => {
            this.car3.vehicle.setBrake(1, 0)
            this.car3.vehicle.setBrake(1, 1)
            this.car3.vehicle.setBrake(1, 2)
            this.car3.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car3.unbrake = () => {
            this.car3.vehicle.setBrake(0, 0)
            this.car3.vehicle.setBrake(0, 1)
            this.car3.vehicle.setBrake(0, 2)
            this.car3.vehicle.setBrake(0, 3)
        }
    
        // Actions
        // this.controls.on('action', (_name) => {
        //     switch (_name) {
        //         case 'reset':
        //             this.car3.recreate()
        //             break

        //         case 'Y':
        //         case 'y':
        //             this.controls.cycleRadioChannel();
        //             break;
        //     }
        // })
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car3.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car3.oldPosition)
    
            this.car3.oldPosition.copy(this.car3.chassis.body.position)
            this.car3.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car3.chassis.body.vectorToWorldFrame(localForward, this.car3.worldForward)
            this.car3.angle = Math.atan2(this.car3.worldForward.y, this.car3.worldForward.x)
    
            this.car3.forwardSpeed = this.car3.worldForward.dot(positionDelta)
            this.car3.goingForward = this.car3.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car3.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car3.upsideDown.state === 'watching') {
                    this.car3.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car3.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car3.upsideDown.state = 'turning'
                            this.car3.jump(true)
        
                            this.car3.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car3.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car3.upsideDown.state === 'pending') {
                    this.car3.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car3.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car3.vehicle.wheelInfos.length; i++) {
                this.car3.vehicle.updateWheelTransform(i)
    
                const transform = this.car3.vehicle.wheelInfos[i].worldTransform
                this.car3.wheels.bodies[i].position.copy(transform.position)
                this.car3.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car3.wheels.bodies[i].quaternion = this.car3.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car3.worldForward.clone()
    
                if (this.car3.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car3.chassis.body.velocity.length() * 0.1)
    
                this.car3.chassis.body.applyImpulse(slowDownForce, this.car3.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car3.model.chassis.position.copy(this.car3.chassis.body.position).add(this.car3.options.chassisOffset)
            this.car3.model.chassis.quaternion.copy(this.car3.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car3.wheels.bodies) {
                const wheelBody = this.car3.wheels.bodies[_wheelKey]
                const wheelMesh = this.car3.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car3.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car3.forwardSpeed) < 0.01 ? true : this.car3.goingForward
                this.car3.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car3.steering) > this.car3.options.controlsSteeringMax) {
                    this.car3.steering = Math.sign(this.car3.steering) * this.car3.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car3.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car3.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car3.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car3.steering) > steerStrength) {
                        this.car3.steering -= steerStrength * Math.sign(this.car3.steering)
                    } else {
                        this.car3.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car3.steering) > this.car3.options.controlsSteeringMax) {
                    this.car3.steering = Math.sign(this.car3.steering) * this.car3.options.controlsSteeringMax
                }
            }
    
            // Update wheels
            // this.car3.vehicle.setSteeringValue(-this.car3.steering, this.car3.wheels.indexes.frontLeft)
            // this.car3.vehicle.setSteeringValue(-this.car3.steering, this.car3.wheels.indexes.frontRight)
    
            // if (this.car3.options.controlsSteeringQuad) {
            //     this.car3.vehicle.setSteeringValue(this.car3.steering, this.car3.wheels.indexes.backLeft)
            //     this.car3.vehicle.setSteeringValue(this.car3.steering, this.car3.wheels.indexes.backRight)
            // }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car3.options.controlsAcceleratingSpeedBoost : this.car3.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car3.options.controlsAcceleratinMaxSpeedBoost : this.car3.options.controlsAcceleratinMaxSpeed
    
            // Accelerate up
            // if (this.controls.actions.up) {
            //     if (this.car3.speed < controlsAcceleratinMaxSpeed || !this.car3.goingForward) {
            //         this.car3.accelerating = accelerateStrength
            //     } else {
            //         this.car3.accelerating = 0
            //     }
            // }
    
            // Accelerate Down
            // else if (this.controls.actions.down) {
            //     if (this.car3.speed < controlsAcceleratinMaxSpeed || this.car3.goingForward) {
            //         this.car3.accelerating = -accelerateStrength
            //     } else {
            //         this.car3.accelerating = 0
            //     }
            // } else {
            //     this.car3.accelerating = 0
            // }
    
            this.car3.vehicle.applyEngineForce(-this.car3.accelerating, this.car3.wheels.indexes.backLeft)
            this.car3.vehicle.applyEngineForce(-this.car3.accelerating, this.car3.wheels.indexes.backRight)
    
            if (this.car3.options.controlsSteeringQuad) {
                this.car3.vehicle.applyEngineForce(-this.car3.accelerating, this.car3.wheels.indexes.frontLeft)
                this.car3.vehicle.applyEngineForce(-this.car3.accelerating, this.car3.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car3.vehicle.setBrake(this.car3.options.controlsBrakeStrength, 0)
                this.car3.vehicle.setBrake(this.car3.options.controlsBrakeStrength, 1)
                this.car3.vehicle.setBrake(this.car3.options.controlsBrakeStrength, 2)
                this.car3.vehicle.setBrake(this.car3.options.controlsBrakeStrength, 3)
            } else {
                this.car3.vehicle.setBrake(0, 0)
                this.car3.vehicle.setBrake(0, 1)
                this.car3.vehicle.setBrake(0, 2)
                this.car3.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car3.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar2(playerId) {
        this.car2 = {}
    
        this.car2.steering = 0
        this.car2.accelerating = 0
        this.car2.speed = 0
        this.car2.worldForward = new CANNON.Vec3()
        this.car2.angle = 0
        this.car2.forwardSpeed = 0
        this.car2.oldPosition = new CANNON.Vec3()
        this.car2.goingForward = true
    
        // Options
        this.car2.options = {}
        this.car2.options.chassisWidth = 1.02
        this.car2.options.chassisHeight = 1.16
        this.car2.options.chassisDepth = 2.03
        this.car2.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car2.options.chassisMass = 0
        this.car2.options.wheelFrontOffsetDepth = 0.635
        this.car2.options.wheelBackOffsetDepth = -0.475
        this.car2.options.wheelOffsetWidth = 0.39
        this.car2.options.wheelRadius = 0.25
        this.car2.options.wheelHeight = 0.24
        this.car2.options.wheelSuspensionStiffness = 50
        this.car2.options.wheelSuspensionRestLength = 0.1
        this.car2.options.wheelFrictionSlip = 10
        this.car2.options.wheelDampingRelaxation = 1.8
        this.car2.options.wheelDampingCompression = 1.5
        this.car2.options.wheelMaxSuspensionForce = 100000
        this.car2.options.wheelRollInfluence = 0.01
        this.car2.options.wheelMaxSuspensionTravel = 0.3
        this.car2.options.wheelCustomSlidingRotationalSpeed = -30
        this.car2.options.wheelMass = 5
        this.car2.options.controlsSteeringSpeed = 0.005 * 3
        this.car2.options.controlsSteeringMax = Math.PI * 0.17
        this.car2.options.controlsSteeringQuad = false
        this.car2.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car2.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car2.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car2.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car2.options.controlsAcceleratingQuad = true
        this.car2.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car2.upsideDown = {}
        this.car2.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car2.upsideDown.pendingTimeout = null
        this.car2.upsideDown.turningTimeout = null
    
        // Jump
        this.car2.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car2.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car2.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car2.create = () => {

            // Chassis
            this.car2.chassis = {}
    
            this.car2.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car2.options.chassisDepth * 0.5, this.car2.options.chassisWidth * 0.5, this.car2.options.chassisHeight * 0.5))
    
            this.car2.chassis.body = new CANNON.Body({ mass: this.car2.options.chassisMass })
            // this.car2.chassis.body.battery = 100;
            // this.car2.chassis.body.score = 0;
            this.car2.chassis.body.allowSleep = false
            this.car2.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car2.chassis.body.sleep()
            this.car2.chassis.body.addShape(this.car2.chassis.shape, this.car2.options.chassisOffset)
            this.car2.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car2.chassis.body);
            this.car2.chassis.body.playerId = playerId;
    
            // Sound
            this.car2.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car2.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car2.chassis.body
            })
    
            // Wheel
            this.car2.wheels = {}
            this.car2.wheels.options = {
                radius: this.car2.options.wheelRadius,
                height: this.car2.options.wheelHeight,
                suspensionStiffness: this.car2.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car2.options.wheelSuspensionRestLength,
                frictionSlip: this.car2.options.wheelFrictionSlip,
                dampingRelaxation: this.car2.options.wheelDampingRelaxation,
                dampingCompression: this.car2.options.wheelDampingCompression,
                maxSuspensionForce: this.car2.options.wheelMaxSuspensionForce,
                rollInfluence: this.car2.options.wheelRollInfluence,
                maxSuspensionTravel: this.car2.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car2.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car2.wheels.options.chassisConnectionPointLocal.set(this.car2.options.wheelFrontOffsetDepth, this.car2.options.wheelOffsetWidth, 0)
            this.car2.vehicle.addWheel(this.car2.wheels.options)
    
            // Front right
            this.car2.wheels.options.chassisConnectionPointLocal.set(this.car2.options.wheelFrontOffsetDepth, -this.car2.options.wheelOffsetWidth, 0)
            this.car2.vehicle.addWheel(this.car2.wheels.options)
    
            // Back left
            this.car2.wheels.options.chassisConnectionPointLocal.set(this.car2.options.wheelBackOffsetDepth, this.car2.options.wheelOffsetWidth, 0)
            this.car2.vehicle.addWheel(this.car2.wheels.options)
    
            // Back right
            this.car2.wheels.options.chassisConnectionPointLocal.set(this.car2.options.wheelBackOffsetDepth, -this.car2.options.wheelOffsetWidth, 0)
            this.car2.vehicle.addWheel(this.car2.wheels.options)
    
            this.car2.vehicle.addToWorld(this.world)
    
            this.car2.wheels.indexes = {}
    
            this.car2.wheels.indexes.frontLeft = 0
            this.car2.wheels.indexes.frontRight = 1
            this.car2.wheels.indexes.backLeft = 2
            this.car2.wheels.indexes.backRight = 3
            this.car2.wheels.bodies = []
    
            for (const _wheelInfos of this.car2.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car2.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car2.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car2.wheels.bodies.push(body)
            }
    
            // Model
            this.car2.model = {}
            this.car2.model.container = new THREE.Object3D()
            this.models.container.add(this.car2.model.container)
    
            this.car2.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car2.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car2.options.chassisDepth, this.car2.options.chassisWidth, this.car2.options.chassisHeight), this.car2.model.material)
            this.car2.model.container.add(this.car2.model.chassis)
    
            this.car2.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car2.options.wheelRadius, this.car2.options.wheelRadius, this.car2.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car2.model.material)
                this.car2.model.container.add(wheel)
                this.car2.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car2.destroy = () => {
            this.car2.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car2.model.container)
        }
    
        // Recreate method
        this.car2.recreate = () => {
            this.car2.destroy()
            this.car2.create()
            this.car2.chassis.body.wakeUp()
        }
    
        // Brake
        this.car2.brake = () => {
            this.car2.vehicle.setBrake(1, 0)
            this.car2.vehicle.setBrake(1, 1)
            this.car2.vehicle.setBrake(1, 2)
            this.car2.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car2.unbrake = () => {
            this.car2.vehicle.setBrake(0, 0)
            this.car2.vehicle.setBrake(0, 1)
            this.car2.vehicle.setBrake(0, 2)
            this.car2.vehicle.setBrake(0, 3)
        }
    
        // Actions
        // this.controls.on('action', (_name) => {
        //     switch (_name) {
        //         case 'reset':
        //             this.car2.recreate()
        //             break

        //         case 'Y':
        //         case 'y':
        //             this.controls.cycleRadioChannel();
        //             break;
        //     }
        // })
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car2.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car2.oldPosition)
    
            this.car2.oldPosition.copy(this.car2.chassis.body.position)
            this.car2.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car2.chassis.body.vectorToWorldFrame(localForward, this.car2.worldForward)
            this.car2.angle = Math.atan2(this.car2.worldForward.y, this.car2.worldForward.x)
    
            this.car2.forwardSpeed = this.car2.worldForward.dot(positionDelta)
            this.car2.goingForward = this.car2.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car2.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car2.upsideDown.state === 'watching') {
                    this.car2.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car2.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car2.upsideDown.state = 'turning'
                            this.car2.jump(true)
        
                            this.car2.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car2.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car2.upsideDown.state === 'pending') {
                    this.car2.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car2.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car2.vehicle.wheelInfos.length; i++) {
                this.car2.vehicle.updateWheelTransform(i)
    
                const transform = this.car2.vehicle.wheelInfos[i].worldTransform
                this.car2.wheels.bodies[i].position.copy(transform.position)
                this.car2.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car2.wheels.bodies[i].quaternion = this.car2.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car2.worldForward.clone()
    
                if (this.car2.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car2.chassis.body.velocity.length() * 0.1)
    
                this.car2.chassis.body.applyImpulse(slowDownForce, this.car2.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car2.model.chassis.position.copy(this.car2.chassis.body.position).add(this.car2.options.chassisOffset)
            this.car2.model.chassis.quaternion.copy(this.car2.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car2.wheels.bodies) {
                const wheelBody = this.car2.wheels.bodies[_wheelKey]
                const wheelMesh = this.car2.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car2.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car2.forwardSpeed) < 0.01 ? true : this.car2.goingForward
                this.car2.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car2.steering) > this.car2.options.controlsSteeringMax) {
                    this.car2.steering = Math.sign(this.car2.steering) * this.car2.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car2.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car2.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car2.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car2.steering) > steerStrength) {
                        this.car2.steering -= steerStrength * Math.sign(this.car2.steering)
                    } else {
                        this.car2.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car2.steering) > this.car2.options.controlsSteeringMax) {
                    this.car2.steering = Math.sign(this.car2.steering) * this.car2.options.controlsSteeringMax
                }
            }
    
            // Update wheels
            // this.car2.vehicle.setSteeringValue(-this.car2.steering, this.car2.wheels.indexes.frontLeft)
            // this.car2.vehicle.setSteeringValue(-this.car2.steering, this.car2.wheels.indexes.frontRight)
    
            // if (this.car2.options.controlsSteeringQuad) {
            //     this.car2.vehicle.setSteeringValue(this.car2.steering, this.car2.wheels.indexes.backLeft)
            //     this.car2.vehicle.setSteeringValue(this.car2.steering, this.car2.wheels.indexes.backRight)
            // }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car2.options.controlsAcceleratingSpeedBoost : this.car2.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car2.options.controlsAcceleratinMaxSpeedBoost : this.car2.options.controlsAcceleratinMaxSpeed
    
            // Accelerate up
            if (this.controls.actions.up) {
                if (this.car2.speed < controlsAcceleratinMaxSpeed || !this.car2.goingForward) {
                    this.car2.accelerating = accelerateStrength
                } else {
                    this.car2.accelerating = 0
                }
            }
    
            // Accelerate Down
            else if (this.controls.actions.down) {
                if (this.car2.speed < controlsAcceleratinMaxSpeed || this.car2.goingForward) {
                    this.car2.accelerating = -accelerateStrength
                } else {
                    this.car2.accelerating = 0
                }
            } else {
                this.car2.accelerating = 0
            }
    
            this.car2.vehicle.applyEngineForce(-this.car2.accelerating, this.car2.wheels.indexes.backLeft)
            this.car2.vehicle.applyEngineForce(-this.car2.accelerating, this.car2.wheels.indexes.backRight)
    
            if (this.car2.options.controlsSteeringQuad) {
                this.car2.vehicle.applyEngineForce(-this.car2.accelerating, this.car2.wheels.indexes.frontLeft)
                this.car2.vehicle.applyEngineForce(-this.car2.accelerating, this.car2.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car2.vehicle.setBrake(this.car2.options.controlsBrakeStrength, 0)
                this.car2.vehicle.setBrake(this.car2.options.controlsBrakeStrength, 1)
                this.car2.vehicle.setBrake(this.car2.options.controlsBrakeStrength, 2)
                this.car2.vehicle.setBrake(this.car2.options.controlsBrakeStrength, 3)
            } else {
                this.car2.vehicle.setBrake(0, 0)
                this.car2.vehicle.setBrake(0, 1)
                this.car2.vehicle.setBrake(0, 2)
                this.car2.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car2.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }

    setCar1(playerId) {
        this.car1 = {}
    
        this.car1.steering = 0
        this.car1.accelerating = 0
        this.car1.speed = 0
        this.car1.worldForward = new CANNON.Vec3()
        this.car1.angle = 0
        this.car1.forwardSpeed = 0
        this.car1.oldPosition = new CANNON.Vec3()
        this.car1.goingForward = true
    
        // Options
        this.car1.options = {}
        this.car1.options.chassisWidth = 1.02
        this.car1.options.chassisHeight = 1.16
        this.car1.options.chassisDepth = 2.03
        this.car1.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        this.car1.options.chassisMass = 0
        this.car1.options.wheelFrontOffsetDepth = 0.635
        this.car1.options.wheelBackOffsetDepth = -0.475
        this.car1.options.wheelOffsetWidth = 0.39
        this.car1.options.wheelRadius = 0.25
        this.car1.options.wheelHeight = 0.24
        this.car1.options.wheelSuspensionStiffness = 50
        this.car1.options.wheelSuspensionRestLength = 0.1
        this.car1.options.wheelFrictionSlip = 10
        this.car1.options.wheelDampingRelaxation = 1.8
        this.car1.options.wheelDampingCompression = 1.5
        this.car1.options.wheelMaxSuspensionForce = 100000
        this.car1.options.wheelRollInfluence = 0.01
        this.car1.options.wheelMaxSuspensionTravel = 0.3
        this.car1.options.wheelCustomSlidingRotationalSpeed = -30
        this.car1.options.wheelMass = 5
        this.car1.options.controlsSteeringSpeed = 0.005 * 3
        this.car1.options.controlsSteeringMax = Math.PI * 0.17
        this.car1.options.controlsSteeringQuad = false
        this.car1.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        this.car1.options.controlsAcceleratinMaxSpeedBoost = 0.11 * 3 / 17
        this.car1.options.controlsAcceleratingSpeed = 2 * 4 * 2
        this.car1.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2
        this.car1.options.controlsAcceleratingQuad = true
        this.car1.options.controlsBrakeStrength = 0.45 * 3
    
        // Upside down
        this.car1.upsideDown = {}
        this.car1.upsideDown.state = 'watching' // 'watching' | 'pending' | 'turning'
        this.car1.upsideDown.pendingTimeout = null
        this.car1.upsideDown.turningTimeout = null
    
        // Jump
        this.car1.jump = (_toReturn = true, _strength = -150) => {
            let worldPosition = this.car1.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car1.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }
    
        // Create method
        this.car1.create = () => {

            // Chassis
            this.car1.chassis = {}
    
            this.car1.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car1.options.chassisDepth * 0.5, this.car1.options.chassisWidth * 0.5, this.car1.options.chassisHeight * 0.5))
    
            this.car1.chassis.body = new CANNON.Body({ mass: this.car1.options.chassisMass })
            this.car1.chassis.body.allowSleep = false
            this.car1.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car1.chassis.body.sleep()
            this.car1.chassis.body.addShape(this.car1.chassis.shape, this.car1.options.chassisOffset)
            this.car1.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI * 0.5)
    
            this.world.addBody(this.car1.chassis.body);
            this.car1.chassis.body.playerId = playerId;
    
            // Sound
            this.car1.chassis.body.addEventListener('collide', (_event) => {
                if (_event.body.mass === 0) {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })
    
            // Vehicle
            this.car1.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car1.chassis.body
            })
    
            // Wheel
            this.car1.wheels = {}
            this.car1.wheels.options = {
                radius: this.car1.options.wheelRadius,
                height: this.car1.options.wheelHeight,
                suspensionStiffness: this.car1.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car1.options.wheelSuspensionRestLength,
                frictionSlip: this.car1.options.wheelFrictionSlip,
                dampingRelaxation: this.car1.options.wheelDampingRelaxation,
                dampingCompression: this.car1.options.wheelDampingCompression,
                maxSuspensionForce: this.car1.options.wheelMaxSuspensionForce,
                rollInfluence: this.car1.options.wheelRollInfluence,
                maxSuspensionTravel: this.car1.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car1.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, -1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }
    
            // Front left
            this.car1.wheels.options.chassisConnectionPointLocal.set(this.car1.options.wheelFrontOffsetDepth, this.car1.options.wheelOffsetWidth, 0)
            this.car1.vehicle.addWheel(this.car1.wheels.options)
    
            // Front right
            this.car1.wheels.options.chassisConnectionPointLocal.set(this.car1.options.wheelFrontOffsetDepth, -this.car1.options.wheelOffsetWidth, 0)
            this.car1.vehicle.addWheel(this.car1.wheels.options)
    
            // Back left
            this.car1.wheels.options.chassisConnectionPointLocal.set(this.car1.options.wheelBackOffsetDepth, this.car1.options.wheelOffsetWidth, 0)
            this.car1.vehicle.addWheel(this.car1.wheels.options)
    
            // Back right
            this.car1.wheels.options.chassisConnectionPointLocal.set(this.car1.options.wheelBackOffsetDepth, -this.car1.options.wheelOffsetWidth, 0)
            this.car1.vehicle.addWheel(this.car1.wheels.options)
    
            this.car1.vehicle.addToWorld(this.world)
    
            this.car1.wheels.indexes = {}
    
            this.car1.wheels.indexes.frontLeft = 0
            this.car1.wheels.indexes.frontRight = 1
            this.car1.wheels.indexes.backLeft = 2
            this.car1.wheels.indexes.backRight = 3
            this.car1.wheels.bodies = []
    
            for (const _wheelInfos of this.car1.vehicle.wheelInfos) {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car1.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car1.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    
                body.type = CANNON.Body.KINEMATIC
    
                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car1.wheels.bodies.push(body)
            }
    
            // Model
            this.car1.model = {}
            this.car1.model.container = new THREE.Object3D()
            this.models.container.add(this.car1.model.container)
    
            this.car1.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    
            this.car1.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car1.options.chassisDepth, this.car1.options.chassisWidth, this.car1.options.chassisHeight), this.car1.model.material)
            this.car1.model.container.add(this.car1.model.chassis)
    
            this.car1.model.wheels = []
    
            const wheelGeometry = new THREE.CylinderGeometry(this.car1.options.wheelRadius, this.car1.options.wheelRadius, this.car1.options.wheelHeight, 8, 1)
    
            for (let i = 0; i < 4; i++) {
                const wheel = new THREE.Mesh(wheelGeometry, this.car1.model.material)
                this.car1.model.container.add(wheel)
                this.car1.model.wheels.push(wheel)
            }
        }
    
        // Destroy method
        this.car1.destroy = () => {
            this.car1.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car1.model.container)
        }
    
        // Recreate method
        this.car1.recreate = () => {
            this.car1.destroy()
            this.car1.create()
            this.car1.chassis.body.wakeUp()
        }
    
        // Brake
        this.car1.brake = () => {
            this.car1.vehicle.setBrake(1, 0)
            this.car1.vehicle.setBrake(1, 1)
            this.car1.vehicle.setBrake(1, 2)
            this.car1.vehicle.setBrake(1, 3)
        }
    
        // Unbrake
        this.car1.unbrake = () => {
            this.car1.vehicle.setBrake(0, 0)
            this.car1.vehicle.setBrake(0, 1)
            this.car1.vehicle.setBrake(0, 2)
            this.car1.vehicle.setBrake(0, 3)
        }
    
        // Cannon tick
        this.world.addEventListener('postStep', () => {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car1.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car1.oldPosition)
    
            this.car1.oldPosition.copy(this.car1.chassis.body.position)
            this.car1.speed = positionDelta.length() / this.time.delta
    
            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car1.chassis.body.vectorToWorldFrame(localForward, this.car1.worldForward)
            this.car1.angle = Math.atan2(this.car1.worldForward.y, this.car1.worldForward.x)
    
            this.car1.forwardSpeed = this.car1.worldForward.dot(positionDelta)
            this.car1.goingForward = this.car1.forwardSpeed > 0
    
            // Upside down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car1.chassis.body.vectorToWorldFrame(localUp, worldUp)
    
            if (worldUp.dot(localUp) < 0.5) {
                if (this.car1.upsideDown.state === 'watching') {
                    this.car1.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car1.upsideDown.pendingTimeout = window.setTimeout(() => {
                            this.car1.upsideDown.state = 'turning'
                            this.car1.jump(true)
        
                            this.car1.upsideDown.turningTimeout = window.setTimeout(() => {
                                this.car1.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                    }
                }
            } else {
                if (this.car1.upsideDown.state === 'pending') {
                    this.car1.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car1.upsideDown.pendingTimeout)
                    }
                }
            }
    
            // Update wheel bodies
            for (let i = 0; i < this.car1.vehicle.wheelInfos.length; i++) {
                this.car1.vehicle.updateWheelTransform(i)
    
                const transform = this.car1.vehicle.wheelInfos[i].worldTransform
                this.car1.wheels.bodies[i].position.copy(transform.position)
                this.car1.wheels.bodies[i].quaternion.copy(transform.quaternion)
    
                // Rotate the wheels on the right
                if (i === 1 || i === 3) {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car1.wheels.bodies[i].quaternion = this.car1.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }
    
            // Slow down back
            if (!this.controls.actions.up && !this.controls.actions.down) {
                let slowDownForce = this.car1.worldForward.clone()
    
                if (this.car1.goingForward) {
                    slowDownForce = slowDownForce.negate()
                }
    
                slowDownForce = slowDownForce.scale(this.car1.chassis.body.velocity.length() * 0.1)
    
                this.car1.chassis.body.applyImpulse(slowDownForce, this.car1.chassis.body.position)
            }
        })
    
        // Time tick
        this.time.on('tick', () => {
            // Body
            // Update chassis model
            this.car1.model.chassis.position.copy(this.car1.chassis.body.position).add(this.car1.options.chassisOffset)
            this.car1.model.chassis.quaternion.copy(this.car1.chassis.body.quaternion)
    
            // Update wheel models
            for (const _wheelKey in this.car1.wheels.bodies) {
                const wheelBody = this.car1.wheels.bodies[_wheelKey]
                const wheelMesh = this.car1.model.wheels[_wheelKey]
    
                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }
    
            // Steering
            if (this.controls.touch) {
                let deltaAngle = 0
    
                if (this.controls.touch.joystick.active) {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car1.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < -Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }
    
                // Update steering directly
                const goingForward = Math.abs(this.car1.forwardSpeed) < 0.01 ? true : this.car1.goingForward
                this.car1.steering = deltaAngle * (goingForward ? -1 : 1)
    
                // Clamp steer
                if (Math.abs(this.car1.steering) > this.car1.options.controlsSteeringMax) {
                    this.car1.steering = Math.sign(this.car1.steering) * this.car1.options.controlsSteeringMax
                }
            }
    
            if (!this.controls.touch || !this.controls.touch.joystick.active) {
                const steerStrength = this.time.delta * this.car1.options.controlsSteeringSpeed
    
                // Steer right
                if (this.controls.actions.right) {
                    this.car1.steering += steerStrength
                }
                // Steer left
                else if (this.controls.actions.left) {
                    this.car1.steering -= steerStrength
                }
                // Steer center
                else {
                    if (Math.abs(this.car1.steering) > steerStrength) {
                        this.car1.steering -= steerStrength * Math.sign(this.car1.steering)
                    } else {
                        this.car1.steering = 0
                    }
                }
    
                // Clamp steer
                if (Math.abs(this.car1.steering) > this.car1.options.controlsSteeringMax) {
                    this.car1.steering = Math.sign(this.car1.steering) * this.car1.options.controlsSteeringMax
                }
            }
    
            // Accelerate
            const accelerationSpeed = this.controls.actions.boost ? this.car1.options.controlsAcceleratingSpeedBoost : this.car1.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car1.options.controlsAcceleratinMaxSpeedBoost : this.car1.options.controlsAcceleratinMaxSpeed
    
            this.car1.vehicle.applyEngineForce(-this.car1.accelerating, this.car1.wheels.indexes.backLeft)
            this.car1.vehicle.applyEngineForce(-this.car1.accelerating, this.car1.wheels.indexes.backRight)
    
            if (this.car1.options.controlsSteeringQuad) {
                this.car1.vehicle.applyEngineForce(-this.car1.accelerating, this.car1.wheels.indexes.frontLeft)
                this.car1.vehicle.applyEngineForce(-this.car1.accelerating, this.car1.wheels.indexes.frontRight)
            }
    
            // Brake
            if (this.controls.actions.brake) {
                this.car1.vehicle.setBrake(this.car1.options.controlsBrakeStrength, 0)
                this.car1.vehicle.setBrake(this.car1.options.controlsBrakeStrength, 1)
                this.car1.vehicle.setBrake(this.car1.options.controlsBrakeStrength, 2)
                this.car1.vehicle.setBrake(this.car1.options.controlsBrakeStrength, 3)
            } else {
                this.car1.vehicle.setBrake(0, 0)
                this.car1.vehicle.setBrake(0, 1)
                this.car1.vehicle.setBrake(0, 2)
                this.car1.vehicle.setBrake(0, 3)
            }
        })

        // Create the initial car
        this.car1.create()
    
        // Debug
        if (this.debug) {
            // Debug code here
        }
    }
    

    setCar(playerId, carName)
    {
        this.car = {}

        // Retrieve physics configuration for the car
        const carConfig = this.carPhysicsConfigs[carName] || this.carPhysicsConfigs.default;

        // console.log("Car config", carConfig)

        this.car.steering = 0
        this.car.accelerating = 0
        this.car.speed = 0
        this.car.worldForward = new CANNON.Vec3()
        this.car.angle = 0
        this.car.forwardSpeed = 0
        this.car.oldPosition = new CANNON.Vec3()
        this.car.goingForward = true
        this.car.flightMode = false;  // New property to track flight mode

        /**
         * Options
         */
        // this.car.options = {}
        // this.car.options.chassisWidth = 1.02
        // this.car.options.chassisHeight = 1.16
        // this.car.options.chassisDepth = 2.03
        // this.car.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)
        // this.car.options.chassisMass = 40
        // this.car.options.wheelFrontOffsetDepth = 0.775
        // this.car.options.wheelBackOffsetDepth = - 0.708
        // this.car.options.wheelOffsetWidth = 0.51
        // this.car.options.wheelRadius = 0.25
        // this.car.options.wheelHeight = 0.24
        // this.car.options.wheelSuspensionStiffness = 50
        // this.car.options.wheelSuspensionRestLength = 0.1
        // this.car.options.wheelFrictionSlip = 10
        // this.car.options.wheelDampingRelaxation = 1.8
        // this.car.options.wheelDampingCompression = 1.5
        // this.car.options.wheelMaxSuspensionForce = 100000
        // this.car.options.wheelRollInfluence =  0.01
        // this.car.options.wheelMaxSuspensionTravel = 0.3
        // this.car.options.wheelCustomSlidingRotationalSpeed = - 30
        // this.car.options.wheelMass = 5
        // this.car.options.controlsSteeringSpeed = 0.005 * 3
        // this.car.options.controlsSteeringMax = Math.PI * 0.17
        // this.car.options.controlsSteeringQuad = false
        // this.car.options.controlsAcceleratinMaxSpeed = 0.055 * 3 / 17
        // this.car.options.controlsAcceleratinMaxSpeedBoost = 0.17 * 3 / 17
        // this.car.options.controlsAcceleratingSpeed = 2 * 4 * 2
        // this.car.options.controlsAcceleratingSpeedBoost = 7 * 4 * 2
        // this.car.options.controlsAcceleratingQuad = true
        // this.car.options.controlsBrakeStrength = 0.45 * 9

        this.car.options = {}
        this.car.options.chassisWidth = carConfig.chassisWidth,
        this.car.options.chassisHeight = carConfig.chassisHeight,
        this.car.options.chassisDepth = carConfig.chassisDepth,
        this.car.options.chassisOffset = carConfig.chassisOffset,
        this.car.options.chassisMass = carConfig.chassisMass,
        this.car.options.wheelFrontOffsetDepth = carConfig.wheelFrontOffsetDepth,
        this.car.options.wheelBackOffsetDepth = - carConfig.wheelBackOffsetDepth,
        this.car.options.wheelOffsetWidth = carConfig.wheelOffsetWidth,
        this.car.options.wheelRadius = carConfig.wheelRadius,
        this.car.options.wheelHeight = carConfig.wheelHeight,
        this.car.options.wheelSuspensionStiffness = carConfig.wheelSuspensionStiffness,
        this.car.options.wheelSuspensionRestLength = carConfig.wheelSuspensionRestLength,
        this.car.options.wheelFrictionSlip = carConfig.wheelFrictionSlip,
        this.car.options.wheelDampingRelaxation = carConfig.wheelDampingRelaxation,
        this.car.options.wheelDampingCompression = carConfig.wheelDampingCompression,
        this.car.options.wheelMaxSuspensionForce = carConfig.wheelMaxSuspensionForce,
        this.car.options.wheelRollInfluence =  carConfig.wheelRollInfluence,
        this.car.options.wheelMaxSuspensionTravel = carConfig.wheelMaxSuspensionTravel,
        this.car.options.wheelCustomSlidingRotationalSpeed = carConfig.wheelCustomSlidingRotationalSpeed,
        this.car.options.wheelMass = carConfig.wheelMass,
        this.car.options.controlsSteeringSpeed = carConfig.controlsSteeringSpeed,
        this.car.options.controlsSteeringMax = carConfig.controlsSteeringMax,
        this.car.options.controlsSteeringQuad = carConfig.controlsSteeringQuad,
        this.car.options.controlsAcceleratinMaxSpeed = carConfig.controlsAcceleratinMaxSpeed,
        this.car.options.controlsAcceleratinMaxSpeedBoost = carConfig.controlsAcceleratinMaxSpeedBoost,
        this.car.options.controlsAcceleratingSpeed = carConfig.controlsAcceleratingSpeed,
        this.car.options.controlsAcceleratingSpeedBoost = carConfig.controlsAcceleratingSpeedBoost,
        this.car.options.controlsAcceleratingQuad = carConfig.controlsAcceleratingQuad,
        this.car.options.controlsBrakeStrength = carConfig.controlsBrakeStrength

        /**
         * Upsize down
         */
        this.car.upsideDown = {}
        this.car.upsideDown.state = 'watching' // 'wathing' | 'pending' | 'turning'
        this.car.upsideDown.pendingTimeout = null
        this.car.upsideDown.turningTimeout = null

        /**
         * Jump
         */
        this.car.jump = (_toReturn = true, _strength = 150) =>
        {
            let worldPosition = this.car.chassis.body.position
            worldPosition = worldPosition.vadd(new CANNON.Vec3(_toReturn ? 0.1 : 0, 0, 0))
            this.car.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, _strength), worldPosition)
        }

        /**
         * Create method
         */
        this.car.create = () =>
        {
            /**
             * Chassis
             */
            this.car.chassis = {}

            this.car.chassis.shape = new CANNON.Box(new CANNON.Vec3(this.car.options.chassisDepth * 0.5, this.car.options.chassisWidth * 0.5, this.car.options.chassisHeight * 0.5))

            this.car.chassis.body = new CANNON.Body({ mass: this.car.options.chassisMass })
            this.car.chassis.body.allowSleep = false
            this.car.chassis.body.position.set(Math.random() * 100 - 5, Math.random() * 100 - 5, 12)
            this.car.chassis.body.sleep()
            this.car.chassis.body.addShape(this.car.chassis.shape, this.car.options.chassisOffset)
            this.car.chassis.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), - Math.PI * 0.5)

            this.world.addBody(this.car.chassis.body);
            this.car.chassis.body.playerId = playerId;

            /**
             * Sound
             */
            this.car.chassis.body.addEventListener('collide', (_event) =>
            {
                if(_event.body.mass === 0)
                {
                    const relativeVelocity = _event.contact.getImpactVelocityAlongNormal()
                    this.sounds.play('carHit', relativeVelocity)
                }
            })

            /**
             * Vehicle
             */
            this.car.vehicle = new CANNON.RaycastVehicle({
                chassisBody: this.car.chassis.body
            })

            /**
             * Wheel
             */
            this.car.wheels = {}
            this.car.wheels.options = {
                radius: this.car.options.wheelRadius,
                height: this.car.options.wheelHeight,
                suspensionStiffness: this.car.options.wheelSuspensionStiffness,
                suspensionRestLength: this.car.options.wheelSuspensionRestLength,
                frictionSlip: this.car.options.wheelFrictionSlip,
                dampingRelaxation: this.car.options.wheelDampingRelaxation,
                dampingCompression: this.car.options.wheelDampingCompression,
                maxSuspensionForce: this.car.options.wheelMaxSuspensionForce,
                rollInfluence: this.car.options.wheelRollInfluence,
                maxSuspensionTravel: this.car.options.wheelMaxSuspensionTravel,
                customSlidingRotationalSpeed: this.car.options.wheelCustomSlidingRotationalSpeed,
                useCustomSlidingRotationalSpeed: true,
                directionLocal: new CANNON.Vec3(0, 0, - 1),
                axleLocal: new CANNON.Vec3(0, 1, 0),
                chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0) // Will be changed for each wheel
            }

            // Front left
            // this.car.wheels.options.chassisConnectionPointLocal.set(this.car.options.wheelFrontOffsetDepth, this.car.options.wheelOffsetWidth, 0)
            this.car.wheels.options.chassisConnectionPointLocal = new CANNON.Vec3(
                carConfig.wheelFrontOffsetDepth,
                carConfig.wheelOffsetWidth,
                0
            );
            this.car.vehicle.addWheel(this.car.wheels.options)

            // Front right
            // this.car.wheels.options.chassisConnectionPointLocal.set(this.car.options.wheelFrontOffsetDepth, - this.car.options.wheelOffsetWidth, 0)
            this.car.wheels.options.chassisConnectionPointLocal = new CANNON.Vec3(
                carConfig.wheelFrontOffsetDepth,
                -carConfig.wheelOffsetWidth,
                0
            );
            this.car.vehicle.addWheel(this.car.wheels.options)

            // Back left
            // this.car.wheels.options.chassisConnectionPointLocal.set(this.car.options.wheelBackOffsetDepth, this.car.options.wheelOffsetWidth, 0)
            this.car.wheels.options.chassisConnectionPointLocal = new CANNON.Vec3(
                carConfig.wheelBackOffsetDepth,
                carConfig.wheelOffsetWidth,
                0
            );
            this.car.vehicle.addWheel(this.car.wheels.options)

            // Back right
            // this.car.wheels.options.chassisConnectionPointLocal.set(this.car.options.wheelBackOffsetDepth, - this.car.options.wheelOffsetWidth, 0)
            this.car.wheels.options.chassisConnectionPointLocal = new CANNON.Vec3(
                carConfig.wheelBackOffsetDepth,
                -carConfig.wheelOffsetWidth,
                0
            );
            this.car.vehicle.addWheel(this.car.wheels.options)

            this.car.vehicle.addToWorld(this.world)

            this.car.wheels.indexes = {}

            this.car.wheels.indexes.frontLeft = 0
            this.car.wheels.indexes.frontRight = 1
            this.car.wheels.indexes.backLeft = 2
            this.car.wheels.indexes.backRight = 3
            this.car.wheels.bodies = []

            for(const _wheelInfos of this.car.vehicle.wheelInfos)
            {
                const shape = new CANNON.Cylinder(_wheelInfos.radius, _wheelInfos.radius, this.car.wheels.options.height, 20)
                const body = new CANNON.Body({ mass: this.car.options.wheelMass, material: this.materials.items.wheel })
                const quaternion = new CANNON.Quaternion()
                quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)

                body.type = CANNON.Body.KINEMATIC

                body.addShape(shape, new CANNON.Vec3(), quaternion)
                this.car.wheels.bodies.push(body)
            }

            /**
             * Flight mode detection
             */
            this.world.addEventListener('postStep', () => {
                const wheelsOnGround = this.car.vehicle.wheelInfos.filter(wheel => wheel.isInContact).length;
            
                // If less than two wheels are on the ground and the car is above a certain height, enable flight mode
                const carHeight = this.car.chassis.body.position.z; // Adjust based on your car's height from the ground
                const flightHeightThreshold = 0.5; // Adjust this threshold based on your needs
            
                if (wheelsOnGround < 2 && carHeight > flightHeightThreshold) {
                    this.car.flightMode = true;
                } else {
                    this.car.flightMode = false;
                }
            });

            /**
             * Model
             */
            this.car.model = {}
            this.car.model.container = new THREE.Object3D()
            this.models.container.add(this.car.model.container)

            this.car.model.material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })

            this.car.model.chassis = new THREE.Mesh(new THREE.BoxGeometry(this.car.options.chassisDepth, this.car.options.chassisWidth, this.car.options.chassisHeight), this.car.model.material)
            this.car.model.container.add(this.car.model.chassis)

            this.car.model.wheels = []

            const wheelGeometry = new THREE.CylinderGeometry(this.car.options.wheelRadius, this.car.options.wheelRadius, this.car.options.wheelHeight, 8, 1)

            for(let i = 0; i < 4; i++)
            {
                const wheel = new THREE.Mesh(wheelGeometry, this.car.model.material)
                this.car.model.container.add(wheel)
                this.car.model.wheels.push(wheel)
            }
        }

        /**
         * Destroy method
         */
        this.car.destroy = () =>
        {
            this.car.vehicle.removeFromWorld(this.world)
            this.models.container.remove(this.car.model.container)
        }

        /**
         * Recreate method
         */
        // this.car.recreate = () =>
        // {
        //     this.car.destroy()
        //     this.car.create()
        //     this.car.chassis.body.wakeUp()
        // }

        // Initialize recreate counter and cooldown timer
        this.car.recreateCount = 0;
        this.car.recreateCooldown = false;

        // HTML setup (assume this is in your HTML file or dynamically created)
        const touchReset = document.getElementById('touch-reset');
        if (touchReset) {
            const countDisplay = document.createElement('div');
            countDisplay.id = 'recreateCountDisplay';
            countDisplay.style.position = 'absolute';
            countDisplay.style.top = '5px';
            countDisplay.style.left = '60px';
            countDisplay.style.backgroundColor = 'transparent';
            countDisplay.style.color = 'white';
            countDisplay.style.padding = '5px';
            countDisplay.style.fontSize = '10px';
            countDisplay.textContent = `${5 - this.car.recreateCount}`;
            touchReset.appendChild(countDisplay);
        }

        this.car.recreate = () => {
            if (this.car.recreateCooldown) {
                console.log("Recreate is disabled. Please wait 10 minutes before trying again.");
                return;
            }

            if (this.car.recreateCount < 50) {
                // Perform recreate actions
                this.car.destroy();
                this.car.create();
                this.car.chassis.body.wakeUp();

                // Increment recreate count
                this.car.recreateCount += 1;
                console.log(`Recreate used ${this.car.recreateCount}/50 times.`);

                // Update the display for remaining resets
                if (touchReset) {
                    const countDisplay = document.getElementById('recreateCountDisplay');
                    countDisplay.textContent = `${50 - this.car.recreateCount}`;
                }

                // Check if limit has been reached
                if (this.car.recreateCount === 50) {
                    this.car.recreateCooldown = true;
                    console.log("Recreate disabled for 10 minutes.");

                    // Display cooldown notice
                    if (touchReset) {
                        const countDisplay = document.getElementById('recreateCountDisplay');
                        countDisplay.textContent = "0";
                    }

                    // Set timer to reset count and cooldown after 10 minutes (600,000 ms)
                    setTimeout(() => {
                        this.car.recreateCount = 0;
                        this.car.recreateCooldown = false;
                        console.log("Recreate is available again.");

                        // Reset the display to 5 resets
                        if (touchReset) {
                            const countDisplay = document.getElementById('recreateCountDisplay');
                            countDisplay.textContent = "5";
                        }
                    }, 600000); // 10 minutes in milliseconds
                }
            } else {
                console.log("Recreate limit reached. Please wait 10 minutes.");
            }
        };

        /**
         * Brake
         */
        this.car.brake = () =>
        {
            this.car.vehicle.setBrake(1, 0)
            this.car.vehicle.setBrake(1, 1)
            this.car.vehicle.setBrake(1, 2)
            this.car.vehicle.setBrake(1, 3)
        }

        /**
         * Unbrake
         */
        this.car.unbrake = () =>
        {
            this.car.vehicle.setBrake(0, 0)
            this.car.vehicle.setBrake(0, 1)
            this.car.vehicle.setBrake(0, 2)
            this.car.vehicle.setBrake(0, 3)
        }

        /**
         * Actions
         */
        this.controls.on('action', (_name) =>
        {
            switch(_name)
            {
                case 'reset':
                    this.car.recreate()
                    break

                case 'Y':
                case 'y':
                    this.controls.cycleRadioChannel();
                    break;
            }
        })

        /**
         * Cannon tick
         */
        this.world.addEventListener('postStep', () =>
        {
            // Update speed
            let positionDelta = new CANNON.Vec3()
            positionDelta = positionDelta.copy(this.car.chassis.body.position)
            positionDelta = positionDelta.vsub(this.car.oldPosition)

            this.car.oldPosition.copy(this.car.chassis.body.position)
            this.car.speed = positionDelta.length() / this.time.delta

            // Update forward
            const localForward = new CANNON.Vec3(1, 0, 0)
            this.car.chassis.body.vectorToWorldFrame(localForward, this.car.worldForward)
            this.car.angle = Math.atan2(this.car.worldForward.y, this.car.worldForward.x)

            this.car.forwardSpeed = this.car.worldForward.dot(positionDelta)
            this.car.goingForward = this.car.forwardSpeed > 0

            // Updise down
            const localUp = new CANNON.Vec3(0, 0, 1)
            const worldUp = new CANNON.Vec3()
            this.car.chassis.body.vectorToWorldFrame(localUp, worldUp)

            if(worldUp.dot(localUp) < 0.5)
            {
                if(this.car.upsideDown.state === 'watching')
                {
                    this.car.upsideDown.state = 'pending'
                    if (typeof window !== 'undefined') {
                        this.car.upsideDown.pendingTimeout = window.setTimeout(() =>
                        {
                            this.car.upsideDown.state = 'turning'
                            this.car.jump(true)

                            this.car.upsideDown.turningTimeout = window.setTimeout(() =>
                            {
                                this.car.upsideDown.state = 'watching'
                            }, 1000)
                        }, 1000)
                }
                }
            }
            else
            {
                if(this.car.upsideDown.state === 'pending')
                {
                    this.car.upsideDown.state = 'watching'
                    if (typeof window !== 'undefined') {
                        window.clearTimeout(this.car.upsideDown.pendingTimeout)
                    }
                }
            }

            // Update wheel bodies
            for(let i = 0; i < this.car.vehicle.wheelInfos.length; i++)
            {
                this.car.vehicle.updateWheelTransform(i)

                const transform = this.car.vehicle.wheelInfos[i].worldTransform
                this.car.wheels.bodies[i].position.copy(transform.position)
                this.car.wheels.bodies[i].quaternion.copy(transform.quaternion)

                // Rotate the wheels on the right
                if(i === 1 || i === 3)
                {
                    const rotationQuaternion = new CANNON.Quaternion(0, 0, 0, 1)
                    rotationQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI)
                    this.car.wheels.bodies[i].quaternion = this.car.wheels.bodies[i].quaternion.mult(rotationQuaternion)
                }
            }

            // Slow down back
            if(!this.controls.actions.up && !this.controls.actions.down)
            {
                let slowDownForce = this.car.worldForward.clone()

                if(this.car.goingForward)
                {
                    slowDownForce = slowDownForce.negate()
                }

                slowDownForce = slowDownForce.scale(this.car.chassis.body.velocity.length() * 0.1)

                this.car.chassis.body.applyImpulse(slowDownForce, this.car.chassis.body.position)
            }
        })

        /**
         * Time tick
         */
        this.time.on('tick', () =>
        {
            /**
             * Body
             */
            // Update chassis model
            this.car.model.chassis.position.copy(this.car.chassis.body.position).add(this.car.options.chassisOffset)
            this.car.model.chassis.quaternion.copy(this.car.chassis.body.quaternion)

            // Update wheel models
            for(const _wheelKey in this.car.wheels.bodies)
            {
                const wheelBody = this.car.wheels.bodies[_wheelKey]
                const wheelMesh = this.car.model.wheels[_wheelKey]

                wheelMesh.position.copy(wheelBody.position)
                wheelMesh.quaternion.copy(wheelBody.quaternion)
            }

            /**
             * Steering
             */
            if(this.controls.touch)
            {
                let deltaAngle = 0

                if(this.controls.touch.joystick.active)
                {
                    // Calculate delta between joystick and car angles
                    deltaAngle = (this.controls.touch.joystick.angle.value - this.car.angle + Math.PI) % (Math.PI * 2) - Math.PI
                    deltaAngle = deltaAngle < - Math.PI ? deltaAngle + Math.PI * 2 : deltaAngle
                }

                // Update steering directly
                const goingForward = Math.abs(this.car.forwardSpeed) < 0.01 ? true : this.car.goingForward
                this.car.steering = deltaAngle * (goingForward ? - 1 : 1)

                // Clamp steer
                if(Math.abs(this.car.steering) > this.car.options.controlsSteeringMax)
                {
                    this.car.steering = Math.sign(this.car.steering) * this.car.options.controlsSteeringMax
                }
            }

            if(!this.controls.touch || !this.controls.touch.joystick.active)
            {
                const steerStrength = this.time.delta * this.car.options.controlsSteeringSpeed

                // Steer right
                if(this.controls.actions.right)
                {
                    this.car.steering += steerStrength
                }
                // Steer left
                else if(this.controls.actions.left)
                {
                    this.car.steering -= steerStrength
                }
                // Steer center
                else
                {
                    if(Math.abs(this.car.steering) > steerStrength)
                    {
                        this.car.steering -= steerStrength * Math.sign(this.car.steering)
                    }
                    else
                    {
                        this.car.steering = 0
                    }
                }

                // Clamp steer
                if(Math.abs(this.car.steering) > this.car.options.controlsSteeringMax)
                {
                    this.car.steering = Math.sign(this.car.steering) * this.car.options.controlsSteeringMax
                }
            }

            // Update wheels
            this.car.vehicle.setSteeringValue(- this.car.steering, this.car.wheels.indexes.frontLeft)
            this.car.vehicle.setSteeringValue(- this.car.steering, this.car.wheels.indexes.frontRight)

            if(this.car.options.controlsSteeringQuad)
            {
                this.car.vehicle.setSteeringValue(this.car.steering, this.car.wheels.indexes.backLeft)
                this.car.vehicle.setSteeringValue(this.car.steering, this.car.wheels.indexes.backRight)
            }

            /**
             * Accelerate
             */
            const accelerationSpeed = this.controls.actions.boost ? this.car.options.controlsAcceleratingSpeedBoost : this.car.options.controlsAcceleratingSpeed
            const accelerateStrength = 17 * accelerationSpeed
            const controlsAcceleratinMaxSpeed = this.controls.actions.boost ? this.car.options.controlsAcceleratinMaxSpeedBoost : this.car.options.controlsAcceleratinMaxSpeed

            // Accelerate up
            if(this.controls.actions.up)
            {
                if(this.car.speed < controlsAcceleratinMaxSpeed || !this.car.goingForward)
                {
                    this.car.accelerating = accelerateStrength

                }
                else
                {
                    this.car.accelerating = 0
                }
            }

            // Accelerate Down
            else if(this.controls.actions.down)
            {
                if(this.car.speed < controlsAcceleratinMaxSpeed || this.car.goingForward)
                {
                    this.car.accelerating = - accelerateStrength
                }
                else
                {
                    this.car.accelerating = 0
                }
            }
            else
            {
                this.car.accelerating = 0
            }

            this.car.vehicle.applyEngineForce(- this.car.accelerating, this.car.wheels.indexes.backLeft)
            this.car.vehicle.applyEngineForce(- this.car.accelerating, this.car.wheels.indexes.backRight)

            if(this.car.options.controlsSteeringQuad)
            {
                this.car.vehicle.applyEngineForce(- this.car.accelerating, this.car.wheels.indexes.frontLeft)
                this.car.vehicle.applyEngineForce(- this.car.accelerating, this.car.wheels.indexes.frontRight)
            }

            /**
             * Brake
             */
            if(this.controls.actions.brake)
            {
                this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 0)
                this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 1)
                this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 2)
                this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 3)
            }
            else
            {
                this.car.vehicle.setBrake(0, 0)
                this.car.vehicle.setBrake(0, 1)
                this.car.vehicle.setBrake(0, 2)
                this.car.vehicle.setBrake(0, 3)
            }

            // Check if brake is pressed and car is in flight mode
            if (this.car.flightMode && this.controls.actions.brake) {
                // Exit flight mode
                this.car.flightMode = false;
            
                // Reset angular velocity to stop spinning or rotating in flight
                this.car.chassis.body.angularVelocity.set(0, 0, 0);
            
                // Optionally, you can also reset any angular damping or other flight-specific physics
                this.car.chassis.body.angularDamping = 0.1; // Adjust if necessary for normal driving
            
                // Ensure the car's behavior returns to normal ground driving without altering the current position or orientation
                // Suspension and wheel behaviors are re-enabled automatically by exiting flight mode
                for (const wheelIndex in this.car.wheels.bodies) {
                    const wheelBody = this.car.wheels.bodies[wheelIndex];
                    wheelBody.type = CANNON.Body.DYNAMIC; // Make sure the wheels return to dynamic mode
                }
            
                // Apply slight downward force to ensure the car sticks to the ground after flight
                const downwardForce = new CANNON.Vec3(0, -10, 0); // Adjust if necessary
                this.car.chassis.body.applyForce(downwardForce, this.car.chassis.body.position);
            }

            // Handle flight mode with boost controls
            // if (this.car.flightMode && this.controls.actions.boost) {
            //     // Existing flight mode control logic
            //     const rotationSpeed = 0.5;
            //     const thrustStrength = 500;
                
            //     // Lift the car up along the Z-axis when boost is activated
            //     this.car.chassis.body.position.z += 0.1;  // Adjust the value to control the rate of ascent

            //     // Forward (up) flight control
            //     if (this.controls.actions.up) {
            //         // Apply rotation for angular velocity (optional)
            //         this.car.chassis.body.angularVelocity.x += rotationSpeed;
                
            //         // Calculate the thrust force in the car's local forward direction
            //         const localThrust = new CANNON.Vec3(thrustStrength, 0, 0); // Thrust along the local X axis (forward)
                
            //         // Rotate the thrust to the car's orientation using the car's quaternion
            //         const thrustWorld = new CANNON.Vec3();
            //         this.car.chassis.body.quaternion.vmult(localThrust, thrustWorld); // Apply rotation to the thrust
                
            //         // Apply the thrust force in the world direction (move forward)
            //         this.car.chassis.body.applyForce(
            //             thrustWorld,
            //             this.car.chassis.body.position
            //         );
            //     }

            //     // Backward (down) flight control
            //     if (this.controls.actions.down) {
            //         this.car.chassis.body.angularVelocity.y -= rotationSpeed;

            //         // Reverse thrust (backward)
            //         const localThrust = new CANNON.Vec3(-thrustStrength, 0, 0); // Reverse thrust
            //         const thrustWorld = new CANNON.Vec3();
            //         this.car.chassis.body.quaternion.vmult(localThrust, thrustWorld); // Apply rotation to reverse thrust
            //         this.car.chassis.body.applyForce(thrustWorld, this.car.chassis.body.position);
            //     }

            //     // Left flight control (roll left)
            //     if (this.controls.actions.left) {
            //         this.car.chassis.body.angularVelocity.z += rotationSpeed;

            //         // Apply left thrust (move left)
            //         const localThrust = new CANNON.Vec3(0, thrustStrength, 0); // Thrust along the Y axis
            //         const thrustWorld = new CANNON.Vec3();
            //         this.car.chassis.body.quaternion.vmult(localThrust, thrustWorld);
            //         this.car.chassis.body.applyForce(thrustWorld, this.car.chassis.body.position);
            //     }

            //     // Right flight control (roll right)
            //     if (this.controls.actions.right) {
            //         this.car.chassis.body.angularVelocity.z -= rotationSpeed;

            //         // Apply right thrust (move right)
            //         const localThrust = new CANNON.Vec3(0, -thrustStrength, 0); // Thrust in the opposite Y axis
            //         const thrustWorld = new CANNON.Vec3();
            //         this.car.chassis.body.quaternion.vmult(localThrust, thrustWorld);
            //         this.car.chassis.body.applyForce(thrustWorld, this.car.chassis.body.position);
            //     }

            //     // Apply gravity or adjust position to make sure it behaves like a flight mode
            //     this.car.chassis.body.applyForce(new CANNON.Vec3(0, 0, -5), this.car.chassis.body.position);
            // }

            // Handle flight mode with boost controls
            if (this.car.flightMode && this.controls.actions.boost) {
                // Existing flight mode control logic
                const rotationSpeed = 0.5;
                const thrustStrength = 500;

                // Lift the car up along the Z-axis when boost is activated
                this.car.chassis.body.position.z += 0.1;  // Adjust the value to control the rate of ascent

                // if (this.controls.actions.up) {
                //     this.car.chassis.body.angularVelocity.x += rotationSpeed;

                //     this.car.chassis.body.applyForce(
                //         new CANNON.Vec3(thrustStrength, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20),
                //         this.car.chassis.body.position,
                //         this.car.chassis.body.quaternion
                //     );
                // }

                if (this.controls.actions.up) {
                    // Apply rotation for angular velocity (optional)
                    this.car.chassis.body.angularVelocity.x += rotationSpeed;
                
                    // Calculate the thrust force in the car's local forward direction
                    const localThrust = new CANNON.Vec3(thrustStrength, 0, 0); // Thrust along the local X axis (forward)
                
                    // Rotate the thrust to the car's orientation using the car's quaternion
                    const thrustWorld = new CANNON.Vec3();
                    this.car.chassis.body.quaternion.vmult(localThrust, thrustWorld); // Apply rotation to the thrust
                
                    // Apply the thrust force in the world direction
                    this.car.chassis.body.applyForce(
                        thrustWorld,
                        this.car.chassis.body.position
                    );
                }
                
                if (this.controls.actions.down) {
                    this.car.chassis.body.angularVelocity.y -= rotationSpeed;
                }

                if (this.controls.actions.left) {
                    this.car.chassis.body.angularVelocity.z += rotationSpeed;
                }

                if (this.controls.actions.right) {
                    this.car.chassis.body.angularVelocity.z -= rotationSpeed;
                }

                // Apply gravity or adjust position to make sure it behaves like a flight mode
                this.car.chassis.body.applyForce(new CANNON.Vec3(0, 0, -5), this.car.chassis.body.position);
            }

        //     if (this.car.flightMode && this.controls.actions.boost) {

        //         // Handle flight mode controls
        //         const rotationSpeed = 0.5;
        //         const thrustStrength = 500;

        //         if (this.controls.actions.up) {
        //             this.car.chassis.body.angularVelocity.x += rotationSpeed;

        //             this.car.chassis.body.applyForce(
        //                 new CANNON.Vec3(thrustStrength, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20),
        //                 this.car.chassis.body.position,
        //                 this.car.chassis.body.quaternion
        //             );
        //         }

        //         if (this.controls.actions.down) {
        //             this.car.chassis.body.angularVelocity.y -= rotationSpeed;
        //         }

        //         if (this.controls.actions.left) {
        //             this.car.chassis.body.angularVelocity.z += rotationSpeed;
        //         }

        //         if (this.controls.actions.right) {
        //             this.car.chassis.body.angularVelocity.z -= rotationSpeed;
        //         }
                
        //         // Apply gravity or adjust position to make sure it behaves like a flight mode
        //         this.car.chassis.body.applyForce(new CANNON.Vec3(0, 0, -5), this.car.chassis.body.position);
        // }

        })

        // Create the initial car
        this.car.create()

        // Add collision detection logic
        this.world.addEventListener('postStep', () => {

            const carIds = Object.keys(this.cars);
            for (let i = 0; i < carIds.length; i++) {
                const playerId = carIds[i];
                const playerCar = this.cars[playerId];

                for (let j = i + 1; j < carIds.length; j++) {
                    const otherPlayerId = carIds[j];
                    const otherPlayerCar = this.cars[otherPlayerId];

                    // Check if these cars should collide
                    if (!this.shouldCollide(playerId, otherPlayerId)) {
                        continue;
                    }

                    // Check if these cars should collide
                    if (!this.shouldCollideCars(playerId, otherPlayerId)) {
                        continue;
                    }

                    const playerCarBody = playerCar.physics.car.chassis.body;
                    const otherCarBody = otherPlayerCar instanceof Car1 ? otherPlayerCar.physics.car1.chassis.body :
                                        otherPlayerCar instanceof Car2 ? otherPlayerCar.physics.car2.chassis.body :
                                        otherPlayerCar instanceof Car3 ? otherPlayerCar.physics.car3.chassis.body :
                                        otherPlayerCar.physics.car4.chassis.body;

                    if (this.detectCollision(playerCarBody, otherCarBody)) {
                        this.handleCarCollision(playerCar, otherPlayerCar);
                    }
                }
            }

            for (const bullet of this.bullets) {
                for (const playerId in this.cars) {
                    const car = this.cars[playerId];
                    
                    if (bullet.body.shooterId !== playerId) {

                    if (car.playerId !== playerId) {
                        const otherPlayerId = this.cars[playerId];
                        
                        // Check if these cars should collide
                        if (!this.shouldCollide(playerId, otherPlayerId)) {
                            continue;
                        }
                    }

                        const carBody = car.physics.car && car.physics.car.chassis && car.physics.car.chassis.body ? car.physics.car.chassis.body : 
                                        car.physics.car1 && car.physics.car1.chassis && car.physics.car1.chassis.body ? car.physics.car1.chassis.body :
                                        car.physics.car2 && car.physics.car2.chassis && car.physics.car2.chassis.body ? car.physics.car2.chassis.body :
                                        car.physics.car3 && car.physics.car3.chassis && car.physics.car3.chassis.body ? car.physics.car3.chassis.body :
                                        car.physics.car4 && car.physics.car4.chassis && car.physics.car4.chassis.body ? car.physics.car4.chassis.body : null;

                        if (carBody && this.detectCollision(bullet.body, carBody)) {
                            this.handleBulletCollision(bullet, this.bullets.indexOf(bullet));
                            
                            // car.createSparkEffect();
                        }
                    }
                }
            }
        });


        // Debug
        if(this.debug)
        {
           
        }
    }  

    // Updated handleBulletCollision function to ensure bullet removal and state synchronization
    handleBulletCollision(bullet, index, carBody) {
        const bulletBody = bullet.body;
    
        bulletBody.addEventListener('collide', (event) => {
            // Check if the bullet collided with a static object (mass === 0)
            if (event.body.mass === 0) {
                this.removeBullet(bullet, index);
                return;
            } else {
                for (const playerId in this.cars) {
                    const car = this.cars[playerId];
    
                    if (playerId !== bulletBody.shooterId) {
                        const carBody = car.physics.car && car.physics.car.chassis && car.physics.car.chassis.body 
                            ? car.physics.car.chassis.body 
                            : car.physics.physics.car1 && car.physics.physics.car1.chassis && car.physics.physics.car1.chassis.body 
                            ? car.physics.physics.car1.chassis.body 
                            : null;
    
                        carBody.id = playerId;
    
                        if (carBody && this.shouldCollide(bulletBody.shooterId, playerId) && this.detectCollision(bulletBody, carBody)) {
                            car.lastHitBy = bulletBody.shooterId;
                            this.resolveBulletCollision(bullet, car, index, carBody, event.body);
                            // car.createSparkEffect();
                            return;
                        }
                    }
                }
            }
        });
    }    

    // Updated resolveBulletCollision function to ensure bullet removal and state synchronization
    resolveBulletCollision(bullet, car, index, carBody, eventBody) {
        // If the bullet hits a static object, remove it immediately
        if (eventBody.mass === 0) {
            this.removeBullet(bullet, index);
            return;
        }

        car.battery -= 1;
        console.log("Resolving car battery", car)
        // car.createSparkEffect();
        console.log("SHOOT -> Battery reduced to:", car.battery);
    
        if (car.battery <= 0) {
            console.log("SHOOT -> Car destroyed:", car.playerId);
            const shooterCar = this.cars[bullet.body.shooterId];
            if (shooterCar) {
                shooterCar.score += 1;
                this.updateScoreStatus(shooterCar.score);
            }
            // car.physics.car.sleep();
            car.createSparkEffect();

            setTimeout(() => {
                car.physics.car.recreate();
            }, 5000);

            car.battery = 100;
        }
    
        const twitchForce = new CANNON.Vec3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
        carBody.applyImpulse(twitchForce, carBody.position);
    
        this.updateBatteryStatus(car.battery);
        
        this.removeBullet(bullet, index);
    
        // Broadcast the collision event to all other players
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'bulletCollision',
                carId: car.playerId,
                shooterId: bullet.body.shooterId,
                battery: car.battery,
                score: car.score
            }));
        }
    }    
    
    handleCarCollision(playerCar, otherPlayerCar) {
        
        // const ws = new WebSocket('ws://localhost:8080');

        const playerCarBody = playerCar?.physics?.car?.chassis?.body;
        const otherCarBody = otherPlayerCar instanceof Car1 ? otherPlayerCar?.physics?.car1?.chassis?.body :
                             otherPlayerCar instanceof Car2 ? otherPlayerCar?.physics?.car2?.chassis?.body :
                             otherPlayerCar instanceof Car3 ? otherPlayerCar?.physics?.car3?.chassis?.body :
                             otherPlayerCar?.physics?.car4?.chassis?.body;
    
        if (!playerCarBody || !otherCarBody) {
            console.error("One of the car bodies is not initialized:", { playerCarBody, otherCarBody });
            return;
        }

        // Check if these cars should collide
        if (!this.shouldCollide(playerCar.playerId, otherPlayerCar.playerId)) {
            return; // Exit if the cars should not collide (i.e., they are in the same party)
        }

        if (!this.shouldCollideCars(playerCar.playerId, otherPlayerCar.playerId)) {
            return; // Exit if the cars should not collide (i.e., they are in the same party)
        }
    
        const handleCollisionEvent = (_event) => {
            const relativeVelocity = _event.contact.getImpactVelocityAlongNormal();
            this.sounds.play('carHit', relativeVelocity);
    
            const hitBody = _event.body;
            const hitCar = this.cars[hitBody.id];
            
            if (hitCar) {
                const randomBatteryPercent = Math.floor(Math.random() * 10); // Random number between 1 and 10
                hitCar.battery -= 1;
    
                if (hitCar.battery <= 0) {
                    const hitterCar = this.cars[hitCar.lastHitBy];
                    if (hitterCar) {
                        hitterCar.score += 1;
                        this.updateScoreStatus(hitterCar.score);
                    }
                    this.destroyCar(hitCar);
                    hitCar.battery = 100;
                }
    
                const twitchForce = new CANNON.Vec3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
                hitCar.physics.car.chassis.body.applyImpulse(twitchForce, hitCar.physics.car.chassis.body.position);
    
                this.updateBatteryStatus(hitCar.battery);
    
                // if (ws && ws.readyState === WebSocket.OPEN) {
                //     ws.send(JSON.stringify({
                //         type: 'carCollision',
                //         hitCarId: hitCar.playerId,
                //         battery: hitCar.battery,
                //         score: hitCar.score,
                //     }));
                // }
            }
        };
    
        playerCarBody.addEventListener('collide', handleCollisionEvent);
        otherCarBody.addEventListener('collide', handleCollisionEvent);
        
        // Apply collision effects (impulse, movement)
        this.applyCollisionEffects(playerCarBody, otherCarBody, playerCar, otherPlayerCar);
    }

    applyCollisionEffects(playerCarBody, otherCarBody, playerCar, otherPlayerCar) {
        const relativeVelocity = playerCarBody.velocity.vsub(otherCarBody.velocity);
        const collisionImpulse = new CANNON.Vec3(relativeVelocity.x / 2, relativeVelocity.y / 2, relativeVelocity.z / 2);
    
        let direction = collisionImpulse.vsub(playerCarBody.position);
        direction.normalize();
    
        playerCarBody.applyImpulse(direction, playerCarBody.position);
        otherCarBody.applyImpulse(direction.negate(), otherCarBody.position);
    
        const overlap = 0.1;
        const moveApart = direction.scale(overlap);
        playerCarBody.position.vadd(moveApart, playerCarBody.position);
        otherCarBody.position.vsub(moveApart, otherCarBody.position);
    
        playerCar.lastHitBy = otherPlayerCar.playerId;
        otherPlayerCar.lastHitBy = playerCar.playerId;
    
        if (playerCar.playerId !== otherPlayerCar.playerId) {
            const randomBatteryPercent = Math.floor(Math.random() * 10); // Random number between 1 and 10
            playerCar.battery -= 1;
            otherPlayerCar.battery -= 1;
        }
    
        if (playerCar.battery <= 0) {
            const hitterCar = this.cars[playerCar.lastHitBy];
            if (hitterCar) {
                hitterCar.score += 1;
                this.updateScoreStatus(hitterCar.score);
            }
            this.destroyCar(playerCar, 'car');
            playerCar.battery = 100;
        }
    
        if (otherPlayerCar.battery <= 0) {
            const hitterCar = this.cars[otherPlayerCar.lastHitBy];
            if (hitterCar) {
                hitterCar.score += 1;
                this.updateScoreStatus(hitterCar.score);
            }
    
            let carKey;
            if (otherPlayerCar instanceof Car1) {
                carKey = 'car1';
            } else if (otherPlayerCar instanceof Car2) {
                carKey = 'car2';
            } else if (otherPlayerCar instanceof Car3) {
                carKey = 'car3';
            } else if (otherPlayerCar instanceof Car4) {
                carKey = 'car4';
            }
    
            this.destroyCar(otherPlayerCar, carKey);
            otherPlayerCar.battery = 100;
        }
    
        // if (ws && ws.readyState === WebSocket.OPEN) {
        //     ws.send(JSON.stringify({
        //         type: 'carStateUpdate',
        //         playerId: playerCar.playerId,
        //         otherPlayerId: otherPlayerCar.playerId,
        //         playerCarBattery: playerCar.battery,
        //         otherCarBattery: otherPlayerCar.battery,
        //     }));
        // }
    }
    
    destroyCar(car, carKey) {
        
        // const ws = new WebSocket('ws://localhost:8080');

        if (!car || !car.physics || !car.physics[carKey]) {
            // console.error("Invalid car or carKey:", car, carKey);
            return;
        }

        // Update non-collidable cars, passing the current car and all cars from this.cars
        const allCars = Object.values(this.cars);  // Get all cars from this.cars
        this.updateNonCollidableCars(car, allCars);

        car.physics.car.chassis.body.sleep();

            setTimeout(() => {
                this.nonCollidablePlayers.clear();
                this.nonCollidableCars.clear();
                car.physics.car.recreate();
            }, 10000);

        // Ensure car has the createCrashEffect method
        if (typeof car.createCrashEffect === 'function') {
            car.createCrashEffect(car.chassis.object.position, car.chassis.object.quaternion, car.chassis.object); // Trigger crash effect
        } else {
            console.error("car.createCrashEffect is not a function");
        }
    
        // if (ws && ws.readyState === WebSocket.OPEN) {
        //     ws.send(JSON.stringify({
        //         type: 'destroyCar',
        //         playerId: car.playerId,
        //         carKey: carKey,
        //     }));
        // }
    }    
    
    // Function to update battery status in HTML
    updateBatteryStatus(battery) {
        const batteryStatusElement = document.getElementById('battery-status');
        if (batteryStatusElement) {
            const batteryPercentageElement = document.getElementById('battery-percentage');
            const batteryBar = batteryStatusElement.querySelector('.battery-bar');
            if (batteryBar) {
                batteryBar.style.width = `${battery}%`;
                batteryPercentageElement.textContent = `${battery}%`;
            }
        }

        // const ws = new WebSocket('ws://localhost:8080');
        // this.ws = ws;  // Store the WebSocket connection
    
        // if (ws && ws.readyState === WebSocket.OPEN) {
        //     ws.send(JSON.stringify({
        //         type: 'batteryUpdate',
        //         battery: battery,
        //     }));
        // }
    }

    // Function to update battery status in HTML
    updateScoreStatus(score) {
        const scoreElement = document.getElementById('coin-market');
        scoreElement.textContent = `❖ ${score}`;
    
        // Create the +1 animation element
        const animationElement = document.createElement('div');
        animationElement.className = 'score-animation';
        animationElement.textContent = '❖';
        
        // Append to the animation container
        const animationContainer = document.getElementById('score-animation-container');
        animationContainer.appendChild(animationElement);
        
        // Remove the animation element after 2 seconds
        setTimeout(() => {
            animationContainer.removeChild(animationElement);
        }, 2000);
    }
    
    detectCollision(bodyA, bodyB) {
        const distance = bodyA.position.distanceTo(bodyB.position);
        const collisionDistance = 1.5; // Adjust based on your game's collision tolerance
        return distance < collisionDistance;
    }

    updateCars() {
        const carIds = Object.keys(this.cars);
        for (let i = 0; i < carIds.length; i++) {
            const playerId = carIds[i];
            const playerCar = this.cars[playerId];
    
            if (!playerCar || !playerCar.physics || !playerCar.physics.car) continue;
    
            const playerCarBody = playerCar.physics.car.chassis.body;
    
            for (let j = i + 1; j < carIds.length; j++) {
                const otherPlayerId = carIds[j];
                const otherPlayerCar = this.cars[otherPlayerId];
    
                if (!otherPlayerCar || !otherPlayerCar.physics) continue;
    
                const otherCarBody = otherPlayerCar instanceof Car1 ? otherPlayerCar.physics.car1.chassis.body :
                                     otherPlayerCar instanceof Car2 ? otherPlayerCar.physics.car2.chassis.body :
                                     otherPlayerCar instanceof Car3 ? otherPlayerCar.physics.car3.chassis.body :
                                     otherPlayerCar.physics.car4.chassis.body;
    
                // if (this.detectCollision(playerCarBody, otherCarBody)) {
                //     this.handleCarCollision(playerCar, otherPlayerCar);
                //     playerCar.createSparkEffect();
                // }

                if (this.detectCollision(playerCarBody, otherCarBody)) {
                    this.handleCarCollision(playerCar, otherPlayerCar);
                    
                    // Check if playerCar or otherPlayerCar is non-collidable before creating sparks
                    if (!this.nonCollidableCars.has(playerCar) && !this.nonCollidableCars.has(otherPlayerCar)) {
                        otherPlayerCar.createSparkEffect();
                    }
                }
            }
        }
    }
    

    updateBullets() {
        this.bullets.forEach((bullet, index) => {
            if (bullet) {
                bullet.mesh.position.copy(bullet.body.position);
    
                if (bullet.body.position.length() > 1000) {
                    this.removeBullet(bullet, index);
                } else {
                    for (const playerId in this.cars) {
                        const car = this.cars[playerId];
                        if (bullet.body.shooterId !== playerId) {
                            const carBody = car.physics.car && car.physics.car.chassis && car.physics.car.chassis.body ? car.physics.car.chassis.body : 
                                            car.physics.car1 && car.physics.car1.chassis && car.physics.car1.chassis.body ? car.physics.car1.chassis.body :
                                            car.physics.car2 && car.physics.car2.chassis && car.physics.car2.chassis.body ? car.physics.car2.chassis.body :
                                            car.physics.car3 && car.physics.car3.chassis && car.physics.car3.chassis.body ? car.physics.car3.chassis.body :
                                            car.physics.car4 && car.physics.car4.chassis && car.physics.car4.chassis.body ? car.physics.car4.chassis.body : null;
    
                            if (carBody && this.detectCollision(bullet.body, carBody)) {
                                this.handleBulletCollision(bullet, index);
                                // car.createSparkEffect();
                            }
                        }
                    }
    
                    const updatedPosition = { x: bullet.body.position.x, y: bullet.body.position.y, z: bullet.body.position.z };
                    const updatedVelocity = { x: bullet.body.velocity.x, y: bullet.body.velocity.y, z: bullet.body.velocity.z };

                    // const ws = new WebSocket('ws://localhost:8080');
    
                    // if (ws && ws.readyState === WebSocket.OPEN) {
                    //     ws.send(JSON.stringify({
                    //         type: 'bulletUpdate',
                    //         bulletId: bullet.id,
                    //         position: updatedPosition,
                    //         velocity: updatedVelocity,
                    //         shooterId: bullet.body.shooterId,
                    //     }));
                    // }
                }
            }
        });
    }

    removeBullet(bullet, index) {
        if (!bullet) {
            console.warn(`Attempted to remove a non-existent bullet at index ${index}`);
            return;
        }
    
        // Mark the bullet for removal after the current physics step
        setTimeout(() => {
            // Safely remove the bullet's body from the world
            if (bullet.body && this.world) {
                this.world.removeBody(bullet.body);
            } else {
                console.warn("Bullet body or world is undefined. Cannot remove bullet body from world.");
            }
    
            // Safely remove the bullet's mesh from the scene
            if (bullet.mesh && bullet.mesh.parent) {
                bullet.mesh.parent.remove(bullet.mesh);
                
                // Dispose of geometry and material to free up memory
                if (bullet.mesh.geometry) {
                    bullet.mesh.geometry.dispose();
                }
                if (bullet.mesh.material) {
                    bullet.mesh.material.dispose();
                }
            } else {
                console.warn("Bullet mesh or its parent is undefined. Cannot remove bullet mesh from scene.");
            }
    
            // Remove the bullet from the bullets array
            if (index >= 0 && index < this.bullets.length) {
                this.bullets.splice(index, 1);
                // console.log("THESE BULLETS", this.bullets)
            } else {
                console.warn(`Bullet index ${index} is out of bounds.`);
            }
        }, 500); // Execute after the current event loop
    }
    
    

    addObjectFromThree(_options)
    {
        // Set up
        const collision = {}

        collision.model = {}
        collision.model.meshes = []
        collision.model.container = new THREE.Object3D()
        this.models.container.add(collision.model.container)

        collision.children = []

        // Material
        const bodyMaterial = this.materials.items.dummy

        // Body
        collision.body = new CANNON.Body({
            position: new CANNON.Vec3(_options.offset.x, _options.offset.y, _options.offset.z),
            mass: _options.mass,
            material: bodyMaterial
        })
        collision.body.allowSleep = true
        collision.body.sleepSpeedLimit = 0.01
        if(_options.sleep)
        {
            collision.body.sleep()
        }

        this.world.addBody(collision.body)

        // Rotation
        if(_options.rotation)
        {
            const rotationQuaternion = new CANNON.Quaternion()
            rotationQuaternion.setFromEuler(_options.rotation.x, _options.rotation.y, _options.rotation.z, _options.rotation.order)
            collision.body.quaternion = collision.body.quaternion.mult(rotationQuaternion)
        }

        // Center
        collision.center = new CANNON.Vec3(0, 0, 0)

        // Shapes
        const shapes = []

        // Each mesh
        for(let i = 0; i < _options.meshes.length; i++)
        {
            const mesh = _options.meshes[i]

            // Define shape
            let shape = null

            if(mesh.name.match(/^cube_?[0-9]{0,3}?|box[0-9]{0,3}?$/i))
            {
                shape = 'box'
            }
            else if(mesh.name.match(/^cylinder_?[0-9]{0,3}?$/i))
            {
                shape = 'cylinder'
            }
            else if(mesh.name.match(/^sphere_?[0-9]{0,3}?$/i))
            {
                shape = 'sphere'
            }
            else if(mesh.name.match(/^center_?[0-9]{0,3}?$/i))
            {
                shape = 'center'
            }

            // Shape is the center
            if(shape === 'center')
            {
                collision.center.set(mesh.position.x, mesh.position.y, mesh.position.z)
            }

            // Other shape
            else if(shape)
            {
                // Geometry
                let shapeGeometry = null

                if(shape === 'cylinder')
                {
                    shapeGeometry = new CANNON.Cylinder(mesh.scale.x, mesh.scale.x, mesh.scale.z, 8)
                }
                else if(shape === 'box')
                {
                    const halfExtents = new CANNON.Vec3(mesh.scale.x * 0.5, mesh.scale.y * 0.5, mesh.scale.z * 0.5)
                    shapeGeometry = new CANNON.Box(halfExtents)
                }
                else if(shape === 'sphere')
                {
                    shapeGeometry = new CANNON.Sphere(mesh.scale.x)
                }

                // Position
                const shapePosition = new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z)

                // Quaternion
                const shapeQuaternion = new CANNON.Quaternion(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w)
                if(shape === 'cylinder')
                {
                    // Rotate cylinder
                    // shapeQuaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), - Math.PI * 0.5)
                }

                // Save
                shapes.push({ shapeGeometry, shapePosition, shapeQuaternion })

                // Create model object
                let modelGeometry = null
                if(shape === 'cylinder')
                {
                    modelGeometry = new THREE.CylinderGeometry(1, 1, 1, 8, 1)
                    modelGeometry.rotateX(Math.PI * 0.5)
                }
                else if(shape === 'box')
                {
                    modelGeometry = new THREE.BoxGeometry(1, 1, 1)
                }
                else if(shape === 'sphere')
                {
                    modelGeometry = new THREE.SphereGeometry(1, 8, 8)
                }

                const modelMesh = new THREE.Mesh(modelGeometry, this.models.materials[_options.mass === 0 ? 'static' : 'dynamic'])
                modelMesh.position.copy(mesh.position)
                modelMesh.scale.copy(mesh.scale)
                modelMesh.quaternion.copy(mesh.quaternion)

                collision.model.meshes.push(modelMesh)
            }
        }

        // Update meshes to match center
        for(const _mesh of collision.model.meshes)
        {
            _mesh.position.x -= collision.center.x
            _mesh.position.y -= collision.center.y
            _mesh.position.z -= collision.center.z

            collision.model.container.add(_mesh)
        }

        // Update shapes to match center
        for(const _shape of shapes)
        {
            // Create physic object
            _shape.shapePosition.x -= collision.center.x
            _shape.shapePosition.y -= collision.center.y
            _shape.shapePosition.z -= collision.center.z

            collision.body.addShape(_shape.shapeGeometry, _shape.shapePosition, _shape.shapeQuaternion)
        }

        // Update body to match center
        collision.body.position.x += collision.center.x
        collision.body.position.y += collision.center.y
        collision.body.position.z += collision.center.z

        // Save origin
        collision.origin = {}
        collision.origin.position = collision.body.position.clone()
        collision.origin.quaternion = collision.body.quaternion.clone()
        collision.origin.sleep = _options.sleep

        // Time tick update
        this.time.on('tick', () =>
        {
            collision.model.container.position.set(collision.body.position.x, collision.body.position.y, collision.body.position.z)
            collision.model.container.quaternion.set(collision.body.quaternion.x, collision.body.quaternion.y, collision.body.quaternion.z, collision.body.quaternion.w)

            if(this.models.container.visible && _options.mass > 0)
            {
                for(const _mesh of collision.model.container.children)
                {
                    _mesh.material = collision.body.sleepState === 2 ? this.models.materials.dynamicSleeping : this.models.materials.dynamic
                }
            }
        })

        // Reset
        collision.reset = () =>
        {
            collision.body.position.copy(collision.origin.position)
            collision.body.quaternion.copy(collision.origin.quaternion)

            if(collision.origin.sleep)
            {
                collision.body.sleep()
            }
        }

        return collision
    }
}