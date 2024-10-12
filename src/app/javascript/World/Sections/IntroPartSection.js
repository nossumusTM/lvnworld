import * as THREE from 'three'
import feather from 'feather-icons'

export default class IntroPartSection
{
    constructor(_options)
    {
        // Options
        this.config = _options.config
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.walls = _options.walls
        this.tiles = _options.tiles
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        this.isPopupOpen = false;

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.setStatic()
    }

    setStatic()
    {
        this.objects.add({
            base: this.resources.items.introPartStaticBase.scene,
            collision: this.resources.items.introPartStaticCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            mass: 0
        })
    }
}
