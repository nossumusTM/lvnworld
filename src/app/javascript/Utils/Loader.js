import EventEmitter from './EventEmitter.js';
import { FontLoader } from './FontLoader.js';

import * as THREE from 'three'; // Ensure THREE is imported globally

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export default class Resources extends EventEmitter {
    constructor() {
        super();
        this.setLoaders();
        this.toLoad = 0;
        this.loaded = 0;
        this.items = {};
    }

    setLoaders() {
        // Initialize loaders once
        const dracoLoader = new DRACOLoader();
        const dracoDecoderPath = '/draco/';

        dracoLoader.setDecoderPath(dracoDecoderPath);

        this.gltfLoader = new GLTFLoader();

        this.gltfLoader.setDRACOLoader(dracoLoader);
        
        this.fbxLoader = new FBXLoader();
        this.fontLoader = new FontLoader();

        // Add loaders to an array for easier access
        this.loaders = [
            {
                extensions: ['glb', 'gltf'],
                action: (_resource) => {
                    this.gltfLoader.load(
                        _resource.source,
                        (data) => { this.fileLoadEnd(_resource, data)},
                        (xhr) =>
                        (error) => {
                            console.error('Error loading GLTF model:', error)
                            console.error(`Error loading GLTF model: ${_resource.source}`);
                            console.error('Error details:', error);
                        }
                    );
                },
            },
            {
                extensions: ['fbx'],
                action: (_resource) => {
                    console.log(`Loading FBX model: ${_resource.source}`);
                    this.fbxLoader.load(
                        _resource.source,
                        (data) => this.fileLoadEnd(_resource, data),
                        // (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
                        (error) => console.error('Error loading FBX model:', error)
                    );
                },
            },
            {
                extensions: ['drc'],
                action: (_resource) => {
                    console.log(`Loading Draco model: ${_resource.source}`);
                    dracoLoader.load(_resource.source, (data) => {
                        this.fileLoadEnd(_resource, data);
                        DRACOLoader.releaseDecoderModule(); // Release after loading
                    });
                },
            },
            {
                extensions: ['jpg', 'png'],
                action: (_resource) => {
                    const image = new Image();
                    image.src = _resource.source;
                    image.onload = () => this.fileLoadEnd(_resource, image);
                    image.onerror = () => this.fileLoadEnd(_resource, image);
                },
            },
            {
                extensions: ['mp4'],
                action: (_resource) => {
                    const video = document.createElement('video');
                    video.src = _resource.source;
                    video.muted = true;
                    video.loop = true;
                    video.crossOrigin = 'anonymous';
                    video.load();
                    video.onloadeddata = () => this.fileLoadEnd(_resource, video);
                    video.onerror = () => this.fileLoadEnd(_resource, video);
                },
            },
            {
                extensions: ['json'], // Font files typically end in .json
                action: (_resource) => {
                    this.fontLoader.load(
                        _resource.source,
                        (font) => {
                            this.fileLoadEnd(_resource, font);
                            console.log(`Font loaded: ${_resource.name}`);
                        },
                        undefined,
                        (error) => console.error(`Error loading font: ${_resource.source}`, error)
                    );
                },
            }
        ];
    }

    load(resources = []) {
        for (const resource of resources) {
            this.toLoad++;
            const extensionMatch = resource.source.match(/\.([a-z]+)$/);
            if (extensionMatch) {
                const extension = extensionMatch[1];
                const loader = this.loaders.find((l) => l.extensions.includes(extension));
                if (loader) {
                    loader.action(resource);
                } else {
                    console.warn(`No loader found for ${resource.source}`);
                }
            } else {
                console.warn(`No file extension found for ${resource.source}`);
            }
        }
    }

    fileLoadEnd(resource, data) {
        this.loaded++;
        this.items[resource.name] = data;
        this.trigger('fileEnd', [resource, data]);

        if (this.loaded === this.toLoad) {
            this.trigger('end');
        }
    }
}


// import EventEmitter from './EventEmitter.js'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// export default class Resources extends EventEmitter
// {
//     /**
//      * Constructor
//      */
//     constructor()
//     {
//         super()

//         this.setLoaders()

//         this.toLoad = 0
//         this.loaded = 0
//         this.items = {}
//     }

//     /**
//      * Set loaders
//      */
//     setLoaders()
//     {
//         this.loaders = []

//         // Images
//         this.loaders.push({
//             extensions: ['jpg', 'png'],
//             action: (_resource) =>
//             {
//                 const image = new Image()

//                 image.addEventListener('load', () =>
//                 {
//                     this.fileLoadEnd(_resource, image)
//                 })

//                 image.addEventListener('error', () =>
//                 {
//                     this.fileLoadEnd(_resource, image)
//                 })

//                 image.src = _resource.source
//             }
//         })

//         // Videos
//         this.loaders.push({
//             extensions: ['mp4'],
//             action: (_resource) =>
//             {
//                 const video = document.createElement('video')

//                 video.addEventListener('loadeddata', () =>
//                 {
//                     this.fileLoadEnd(_resource, video)
//                 })

//                 video.addEventListener('error', () =>
//                 {
//                     this.fileLoadEnd(_resource, video)
//                 })

//                 video.src = _resource.source
//                 video.crossOrigin = 'anonymous'
//                 video.muted = true
//                 video.loop = true
//                 video.load()
//             }
//         })

//         // Draco
//         const dracoLoader = new DRACOLoader()
//         dracoLoader.setDecoderPath('draco/')
//         dracoLoader.setDecoderConfig({ type: 'js' })

//         this.loaders.push({
//             extensions: ['drc'],
//             action: (_resource) =>
//             {
//                 dracoLoader.load(_resource.source, (_data) =>
//                 {
//                     this.fileLoadEnd(_resource, _data)

//                     DRACOLoader.releaseDecoderModule()
//                 })
//             }
//         })

//         // GLTF
//         const gltfLoader = new GLTFLoader()
//         gltfLoader.setDRACOLoader(dracoLoader)

//         this.loaders.push({
//             extensions: ['glb', 'gltf'],
//             action: (_resource) =>
//             {
//                 gltfLoader.load(_resource.source, (_data) =>
//                 {
//                     this.fileLoadEnd(_resource, _data)
//                 })
//             }
//         })

//         // FBX
//         const fbxLoader = new FBXLoader()

//         this.loaders.push({
//             extensions: ['fbx'],
//             action: (_resource) =>
//             {
//                 fbxLoader.load(_resource.source, (_data) =>
//                 {
//                     this.fileLoadEnd(_resource, _data)
//                 })
//             }
//         })
//     }

//     /**
//      * Load
//      */
//     load(_resources = [])
//     {
//         for(const _resource of _resources)
//         {
//             this.toLoad++
//             const extensionMatch = _resource.source.match(/\.([a-z]+)$/)

//             if(typeof extensionMatch[1] !== 'undefined')
//             {
//                 const extension = extensionMatch[1]
//                 const loader = this.loaders.find((_loader) => _loader.extensions.includes(extension))

//                 if(loader)
//                 {
//                     loader.action(_resource)
//                 }
//                 else
//                 {
//                     console.warn(`Cannot found loader for ${_resource.source}`)
//                 }
//             }
//             else
//             {
//                 console.warn(`Cannot found extension of ${_resource.source}`)
//             }
//         }
//     }

//     /**
//      * File load end
//      */
//     fileLoadEnd(_resource, _data)
//     {
//         this.loaded++
//         this.items[_resource.name] = _data

//         this.trigger('fileEnd', [_resource, _data])

//         if(this.loaded === this.toLoad)
//         {
//             this.trigger('end')
//         }
//     }
// }
