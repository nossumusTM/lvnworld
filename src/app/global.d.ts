declare module 'three/examples/jsm/loaders/GLTFLoader' {
    import { Loader } from 'three';
    import { Group } from 'three';
    import { LoadingManager } from 'three';

    export class GLTFLoader extends Loader {
        constructor(manager?: LoadingManager);
        load(
            url: string,
            onLoad: (gltf: { scene: Group }) => void,
            onProgress?: (event: ProgressEvent) => void,
            onError?: (event: ErrorEvent) => void
        ): void;
    }
}

declare global {
    interface Window {
        currentBlinkingState: boolean;
        toggleBlinking: (state: boolean) => void;
    }
}
export {};

declare module 'three/examples/jsm/loaders/FontLoader';
declare module 'three/examples/jsm/geometries/TextGeometry';

declare module 'three/examples/jsm/controls/OrbitControls' {
    import { Camera } from 'three';
    import { EventDispatcher } from 'three';
    import { MOUSE, TOUCH } from 'three';
    import { Vector3 } from 'three';

    export class OrbitControls extends EventDispatcher {
        constructor(object: Camera, domElement?: HTMLElement);

        object: Camera;
        domElement: HTMLElement | undefined;

        enabled: boolean;
        target: Vector3;
        minDistance: number;
        maxDistance: number;

        minZoom: number;
        maxZoom: number;

        minPolarAngle: number;
        maxPolarAngle: number;

        minAzimuthAngle: number;
        maxAzimuthAngle: number;

        enableDamping: boolean;
        dampingFactor: number;

        enableZoom: boolean;
        zoomSpeed: number;

        enableRotate: boolean;
        rotateSpeed: number;

        enablePan: boolean;
        panSpeed: number;
        screenSpacePanning: boolean;
        keyPanSpeed: number;

        autoRotate: boolean;
        autoRotateSpeed: number;

        enableKeys: boolean;
        keys: { LEFT: string; UP: string; RIGHT: string; BOTTOM: string };

        mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE };
        touches: { ONE: TOUCH; TWO: TOUCH };

        update(): void;
        saveState(): void;
        reset(): void;
        dispose(): void;
        getPolarAngle(): number;
        getAzimuthalAngle(): number;
    }
}