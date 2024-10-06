import * as THREE from 'three'

import Loader from './Utils/Loader.js'
import EventEmitter from './Utils/EventEmitter.js'

// Matcaps
const matcapBeigeSource = '/models/matcaps/beige.png'
const matcapBlackSource = '/models/matcaps/black.png'
const matcapOrangeSource = '/models/matcaps/orange.png'
const matcapRedSource = '/models/matcaps/red.png'
const matcapWhiteSource = '/models/matcaps/white.png'
const matcapGreenSource = '/models/matcaps/green.png'
const matcapLineSource = '/models/matcaps/line.png'
const matcapBrownSource = '/models/matcaps/brown.png'
const matcapMarbleSource = '/models/matcaps/marble.png'
const matcapDarkEmeraldSource = '/models/matcaps/darkEmerald.png'
const matcapDarkMetalSource = '/models/matcaps/darkMetal.png'
const matcapBlueGlassSource = '/models/matcaps/blueGlass.png'
const matcapCharcoalSource = '/models/matcaps/charcoal.png'
const matcapSkySource = '/models/matcaps/sky.png'
const matcapBronzSource = '/models/matcaps/bronz.png'
const matcapExoticSource = '/models/matcaps/exotic.png'
const matcapBwSource = '/models/matcaps/bw.png'
const matcapCoralSource = '/models/matcaps/coral.png'
const matcapTransparentLandSource = '/models/matcaps/transparentLand.png'
const matcapVolcanoSource = '/models/matcaps/volcano.png'
const matcapElevatorSource = '/models/matcaps/elevator.png'
const matcapDivoSource = '/models/matcaps/divo.png'
const matcapEarthSource = '/models/matcaps/earth.png'
const matcapGreenBulbSource = '/models/matcaps/greenBulb.png'
const matcapPanaceaSource = '/models/matcaps/panacea.png'
const matcapGraySource = '/models/matcaps/gray.png'
const matcapEmeraldGreenSource = '/models/matcaps/emeraldGreen.png'
const matcapPurpleSource = '/models/matcaps/purple.png'
const matcapBlueSource = '/models/matcaps/blue.png'
const matcapYellowSource = '/models/matcaps/yellow.png'
const matcapMetalSource = '/models/matcaps/metal.png'
// const matcapGoldSource = '/models/matcaps/gold.png'

// Intro
const introStaticBaseSource = '/models/intro/static/base.glb'
const introStaticCollisionSource = '/models/intro/static/collision.glb'
const introStaticFloorShadowSource = 'models/intro/static/floorShadow.png'

const introInstructionsLabelsSource = '/models/intro/instructions/labels.glb'
const introInstructionsArrowsSource = 'models/intro/instructions/arrows.png'
const introInstructionsControlsSource = 'models/intro/instructions/controls.png'
const introInstructionsOtherSource = 'models/intro/instructions/other.png'

const introArrowKeyBaseSource = '/models/intro/arrowKey/base.glb'
const introArrowKeyCollisionSource = '/models/intro/arrowKey/collision.glb'

const introBBaseSource = '/models/intro/b/base.glb'
const introBCollisionSource = '/models/intro/b/collision.glb'

const introRBaseSource = '/models/intro/r/base.glb'
const introRCollisionSource = '/models/intro/r/collision.glb'
const introRTextureSource = 'models/intro/static/introRTexture.png'

const introUBaseSource = '/models/intro/u/base.glb'
const introUCollisionSource = '/models/intro/u/collision.glb'

const introNBaseSource = '/models/intro/n/base.glb'
const introNCollisionSource = '/models/intro/n/collision.glb'

const introOBaseSource = '/models/intro/o/base.glb'
const introOCollisionSource = '/models/intro/o/collision.glb'

const introSBaseSource = '/models/intro/s/base.glb'
const introSCollisionSource = '/models/intro/s/collision.glb'

const introIBaseSource = '/models/intro/i/base.glb'
const introICollisionSource = '/models/intro/i/collision.glb'

const introMBaseSource = '/models/intro/m/base.glb'
const introMCollisionSource = '/models/intro/m/collision.glb'

const introCreativeBaseSource = '/models/intro/creative/base.glb'
const introCreativeCollisionSource = '/models/intro/creative/collision.glb'

const introDevBaseSource = '/models/intro/dev/base.glb'
const introDevCollisionSource = '/models/intro/dev/collision.glb'

// Crossroads
const crossroadsStaticFloorShadowSource = 'models/crossroads/static/floorShadow.png'
const crossroadsStaticBaseSource = '/models/crossroads/static/base.glb'
const crossroadsStaticCollisionSource = '/models/crossroads/static/collision.glb'

// Car default
const carDefaultChassisSource = '/models/car/default/chassis.glb'
const carDefaultWheelSource = '/models/car/default/wheel.glb'
const carDefaultBackLightsBrakeSource = '/models/car/default/backLightsBrake.glb'
const carDefaultBackLightsReverseSource = '/models/car/default/backLightsReverse.glb'
const carDefaultBackLightsBatterySource = '/models/car/default/backLightsBattery.glb'
const carDefaultAntenaSource = '/models/car/default/antena.glb'

// Car default 1
const car1DefaultChassisSource = '/models/car1/default/chassis.glb'
const car1DefaultWheelSource = '/models/car1/default/wheel.glb'
const car1DefaultBackLightsBrakeSource = '/models/car1/default/backLightsBrake.glb'
const car1DefaultBackLightsReverseSource = '/models/car1/default/backLightsReverse.glb'
const car1DefaultBackLightsBatterySource = '/models/car1/default/backLightsBattery.glb'
const car1DefaultAntenaSource = '/models/car1/default/antena.glb'

// Car default 2
const car2DefaultChassisSource = '/models/car2/default/chassis.glb'
const car2DefaultWheelSource = '/models/car2/default/wheel.glb'
const car2DefaultBackLightsBrakeSource = '/models/car2/default/backLightsBrake.glb'
const car2DefaultBackLightsReverseSource = '/models/car2/default/backLightsReverse.glb'
const car2DefaultBackLightsBatterySource = '/models/car2/default/backLightsBattery.glb'
const car2DefaultAntenaSource = '/models/car2/default/antena.glb'

// Car default 3
const car3DefaultChassisSource = '/models/car3/default/chassis.glb'
const car3DefaultWheelSource = '/models/car3/default/wheel.glb'
const car3DefaultBackLightsBrakeSource = '/models/car3/default/backLightsBrake.glb'
const car3DefaultBackLightsReverseSource = '/models/car3/default/backLightsReverse.glb'
const car3DefaultBackLightsBatterySource = '/models/car3/default/backLightsBattery.glb'
const car3DefaultAntenaSource = '/models/car3/default/antena.glb'

// Information
const informationStaticBaseSource = '/models/information/static/base.glb'
const informationStaticCollisionSource = '/models/information/static/collision.glb'
const informationStaticFloorShadowSource = 'models/information/static/floorShadow.png'

const informationContactTwitterLabelSource = 'models/information/static/contactTwitterLabel.png'
const informationContactGithubLabelSource = 'models/information/static/contactGithubLabel.png'
const informationContactLinkedinLabelSource = 'models/information/static/contactLinkedinLabel.png'
const informationContactMailLabelSource = 'models/information/static/contactMailLabel.png'

const informationActivitiesSource = 'models/information/static/activities.png'

// Playground
const playgroundStaticFloorShadowSource = 'models/playground/static/floorShadow.png'
const playgroundStaticBaseSource = '/models/playground/static/base.glb'
const playgroundStaticCollisionSource = '/models/playground/static/collision.glb'

// Brick
const brickBaseSource = '/models/brick/base.glb'
const brickCollisionSource = '/models/brick/collision.glb'

// Bowling ball
const bowlingBallBaseSource = '/models/bowlingBall/base.glb'
const bowlingBallCollisionSource = '/models/bowlingBall/collision.glb'

// Rocket
const rocketBaseSource = '/models/rocket/base.glb'
const rocketCollisionSource = '/models/rocket/collision.glb'

// Airdrop
const airdropBaseSource = '/models/airdrop/base.glb'
const airdropCollisionSource = '/models/airdrop/collision.glb'

// Battery
const batteryChargerBaseSource = '/models/rocket/base.glb'
const batteryChargerCollisionSource = '/models/rocket/collision.glb'

// Bowling pin
const bowlingPinBaseSource = '/models/bowlingPin/base.glb'
const bowlingPinCollisionSource = '/models/bowlingPin/collision.glb'

// Area
const areaKeyEnterSource = 'models/area/keyEnter.png'
const areaEnterSource = 'models/area/enter.png'
const areaOpenSource = 'models/area/open.png'
const areaResetSource = 'models/area/reset.png'
const areaQuestionMarkSource = 'models/area/questionMark.png'

// Tiles
const tilesABaseSource = '/models/tiles/a/base.glb'
const tilesACollisionSource = '/models/tiles/a/collision.glb'

const tilesBBaseSource = '/models/tiles/b/base.glb'
const tilesBCollisionSource = '/models/tiles/b/collision.glb'

const tilesCBaseSource = '/models/tiles/c/base.glb'
const tilesCCollisionSource = '/models/tiles/c/collision.glb'

const tilesDBaseSource = '/models/tiles/d/base.glb'
const tilesDCollisionSource = '/models/tiles/d/collision.glb'

const tilesEBaseSource = '/models/tiles/e/base.glb'
const tilesECollisionSource = '/models/tiles/e/collision.glb'

// Font
const orbitronFont = '/fonts/Orbitron.json'
// const orbitronFont = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json';

export default class Resources extends EventEmitter
{
    constructor()
    {
        super()

        this.loader = new Loader()
        this.items = {}

        this.loader.load([
            // Matcaps
            { name: 'matcapBeige', source: matcapBeigeSource, type: 'texture' },
            { name: 'matcapBlack', source: matcapBlackSource, type: 'texture' },
            { name: 'matcapOrange', source: matcapOrangeSource, type: 'texture' },
            { name: 'matcapRed', source: matcapRedSource, type: 'texture' },
            { name: 'matcapWhite', source: matcapWhiteSource, type: 'texture' },
            { name: 'matcapGreen', source: matcapGreenSource, type: 'texture' },
            { name: 'matcapLine', source: matcapLineSource, type: 'texture' },
            { name: 'matcapBrown', source: matcapBrownSource, type: 'texture' },
            { name: 'matcapMarble', source: matcapMarbleSource, type: 'texture' },
            { name: 'matcapDarkEmerald', source: matcapDarkEmeraldSource, type: 'texture' },
            { name: 'matcapDarkMetal', source: matcapDarkMetalSource, type: 'texture' },
            { name: 'matcapBlueGlass', source: matcapBlueGlassSource, type: 'texture' },
            { name: 'matcapCharcoal', source: matcapCharcoalSource, type: 'texture' },
            { name: 'matcapSky', source: matcapSkySource, type: 'texture' },
            { name: 'matcapBronz', source: matcapBronzSource, type: 'texture' },
            { name: 'matcapExotic', source: matcapExoticSource, type: 'texture' },
            { name: 'matcapBw', source: matcapBwSource, type: 'texture' },
            { name: 'matcapCoral', source: matcapCoralSource, type: 'texture' },
            { name: 'matcapTransparentLand', source: matcapTransparentLandSource, type: 'texture' },
            { name: 'matcapVolcano', source: matcapVolcanoSource, type: 'texture' },
            { name: 'matcapElevator', source: matcapElevatorSource, type: 'texture' },
            { name: 'matcapDivo', source: matcapDivoSource, type: 'texture' },
            { name: 'matcapEarth', source: matcapEarthSource, type: 'texture' },
            { name: 'matcapGreenBulb', source: matcapGreenBulbSource, type: 'texture' },
            { name: 'matcapPanacea', source: matcapPanaceaSource, type: 'texture' },
            { name: 'matcapGray', source: matcapGraySource, type: 'texture' },
            { name: 'matcapEmeraldGreen', source: matcapEmeraldGreenSource, type: 'texture' },
            { name: 'matcapPurple', source: matcapPurpleSource, type: 'texture' },
            { name: 'matcapBlue', source: matcapBlueSource, type: 'texture' },
            { name: 'matcapYellow', source: matcapYellowSource, type: 'texture' },
            { name: 'matcapMetal', source: matcapMetalSource, type: 'texture' },
            // { name: 'matcapGold', source: matcapGoldSource, type: 'texture' },

            // Intro
            { name: 'introStaticBase', source: introStaticBaseSource },
            { name: 'introStaticCollision', source: introStaticCollisionSource },
            { name: 'introStaticFloorShadow', source: introStaticFloorShadowSource, type: 'texture' },

            { name: 'introInstructionsLabels', source: introInstructionsLabelsSource },
            { name: 'introInstructionsArrows', source: introInstructionsArrowsSource, type: 'texture' },
            { name: 'introInstructionsControls', source: introInstructionsControlsSource, type: 'texture' },
            { name: 'introInstructionsOther', source: introInstructionsOtherSource, type: 'texture' },

            { name: 'introArrowKeyBase', source: introArrowKeyBaseSource },
            { name: 'introArrowKeyCollision', source: introArrowKeyCollisionSource },

            { name: 'introBBase', source: introBBaseSource },
            { name: 'introBCollision', source: introBCollisionSource },

            { name: 'introRBase', source: introRBaseSource },
            { name: 'introRCollision', source: introRCollisionSource },
            { name: 'introRTexture', source: introRTextureSource, type: 'texture' },

            { name: 'introUBase', source: introUBaseSource },
            { name: 'introUCollision', source: introUCollisionSource },

            { name: 'introNBase', source: introNBaseSource },
            { name: 'introNCollision', source: introNCollisionSource },

            { name: 'introOBase', source: introOBaseSource },
            { name: 'introOCollision', source: introOCollisionSource },

            { name: 'introSBase', source: introSBaseSource },
            { name: 'introSCollision', source: introSCollisionSource },

            { name: 'introIBase', source: introIBaseSource },
            { name: 'introICollision', source: introICollisionSource },

            { name: 'introMBase', source: introMBaseSource },
            { name: 'introMCollision', source: introMCollisionSource },

            { name: 'introCreativeBase', source: introCreativeBaseSource },
            { name: 'introCreativeCollision', source: introCreativeCollisionSource },

            { name: 'introDevBase', source: introDevBaseSource },
            { name: 'introDevCollision', source: introDevCollisionSource },

            // Font
            { name: 'orbitronFont', source: orbitronFont, type: 'font' },

            // Intro
            { name: 'crossroadsStaticBase', source: crossroadsStaticBaseSource },
            { name: 'crossroadsStaticCollision', source: crossroadsStaticCollisionSource },
            { name: 'crossroadsStaticFloorShadow', source: crossroadsStaticFloorShadowSource, type: 'texture' },

            // Car default
            { name: 'carDefaultChassis', source: carDefaultChassisSource },
            { name: 'carDefaultWheel', source: carDefaultWheelSource },
            { name: 'carDefaultBackLightsBrake', source: carDefaultBackLightsBrakeSource },
            { name: 'carDefaultBackLightsReverse', source: carDefaultBackLightsReverseSource },
            { name: 'carDefaultBackLightsBattery', source: carDefaultBackLightsBatterySource },
            { name: 'carDefaultAntena', source: carDefaultAntenaSource },

            // Car1 default
            { name: 'car1DefaultChassis', source: car1DefaultChassisSource },
            { name: 'car1DefaultWheel', source: car1DefaultWheelSource },
            { name: 'car1DefaultBackLightsBrake', source: car1DefaultBackLightsBrakeSource },
            { name: 'car1DefaultBackLightsReverse', source: car1DefaultBackLightsReverseSource },
            { name: 'car1DefaultBackLightsBattery', source: car1DefaultBackLightsBatterySource },
            { name: 'car1DefaultAntena', source: car1DefaultAntenaSource },

            // Car2 default
            { name: 'car2DefaultChassis', source: car2DefaultChassisSource },
            { name: 'car2DefaultWheel', source: car2DefaultWheelSource },
            { name: 'car2DefaultBackLightsBrake', source: car2DefaultBackLightsBrakeSource },
            { name: 'car2DefaultBackLightsReverse', source: car2DefaultBackLightsReverseSource },
            { name: 'car2DefaultBackLightsBattery', source: car2DefaultBackLightsBatterySource },
            { name: 'car2DefaultAntena', source: car2DefaultAntenaSource },
            
            // Car3 default
            { name: 'car3DefaultChassis', source: car3DefaultChassisSource },
            { name: 'car3DefaultWheel', source: car3DefaultWheelSource },
            { name: 'car3DefaultBackLightsBrake', source: car3DefaultBackLightsBrakeSource },
            { name: 'car3DefaultBackLightsReverse', source: car3DefaultBackLightsReverseSource },
            { name: 'car3DefaultBackLightsBattery', source: car3DefaultBackLightsBatterySource },
            { name: 'car3DefaultAntena', source: car3DefaultAntenaSource },

            // Information
            { name: 'informationStaticBase', source: informationStaticBaseSource },
            { name: 'informationStaticCollision', source: informationStaticCollisionSource },
            { name: 'informationStaticFloorShadow', source: informationStaticFloorShadowSource, type: 'texture' },

            { name: 'informationContactTwitterLabel', source: informationContactTwitterLabelSource, type: 'texture' },
            { name: 'informationContactGithubLabel', source: informationContactGithubLabelSource, type: 'texture' },
            { name: 'informationContactLinkedinLabel', source: informationContactLinkedinLabelSource, type: 'texture' },
            { name: 'informationContactMailLabel', source: informationContactMailLabelSource, type: 'texture' },

            { name: 'informationActivities', source: informationActivitiesSource, type: 'texture' },

            // Playground
            { name: 'playgroundStaticBase', source: playgroundStaticBaseSource },
            { name: 'playgroundStaticCollision', source: playgroundStaticCollisionSource },
            { name: 'playgroundStaticFloorShadow', source: playgroundStaticFloorShadowSource, type: 'texture' },

            // Brick
            { name: 'brickBase', source: brickBaseSource },
            { name: 'brickCollision', source: brickCollisionSource },

            // Bownling ball
            { name: 'bowlingBallBase', source: bowlingBallBaseSource },
            { name: 'bowlingBallCollision', source: bowlingBallCollisionSource },

            // Rocket ball
            { name: 'rocketBase', source: rocketBaseSource },
            { name: 'rocketCollision', source: rocketCollisionSource },

            // Airdrop
            { name: 'airdropBase', source: airdropBaseSource },
            { name: 'airdropCollision', source: airdropCollisionSource },

             // Battery charger
             { name: 'batteryChargerBase', source: batteryChargerBaseSource },
             { name: 'batteryChargerBaseCollision', source: batteryChargerCollisionSource },

            // Bownling ball
            { name: 'bowlingPinBase', source: bowlingPinBaseSource },
            { name: 'bowlingPinCollision', source: bowlingPinCollisionSource },

            // Areas
            { name: 'areaKeyEnter', source: areaKeyEnterSource, type: 'texture' },
            { name: 'areaEnter', source: areaEnterSource, type: 'texture' },
            { name: 'areaOpen', source: areaOpenSource, type: 'texture' },
            { name: 'areaReset', source: areaResetSource, type: 'texture' },
            { name: 'areaQuestionMark', source: areaQuestionMarkSource, type: 'texture' },

            // Tiles
            { name: 'tilesABase', source: tilesABaseSource },
            { name: 'tilesACollision', source: tilesACollisionSource },

            { name: 'tilesBBase', source: tilesBBaseSource },
            { name: 'tilesBCollision', source: tilesBCollisionSource },

            { name: 'tilesCBase', source: tilesCBaseSource },
            { name: 'tilesCCollision', source: tilesCCollisionSource },

            { name: 'tilesDBase', source: tilesDBaseSource },
            { name: 'tilesDCollision', source: tilesDCollisionSource },

            { name: 'tilesEBase', source: tilesEBaseSource },
            { name: 'tilesECollision', source: tilesECollisionSource },

        ])

        this.loader.on('fileEnd', (_resource, _data) =>
            {
                this.items[_resource.name] = _data
            
                // Texture
                if(_resource.type === 'texture')
                {
                    const texture = new THREE.Texture(_data)
                    texture.needsUpdate = true
            
                    this.items[`${_resource.name}Texture`] = texture
                }
            
                // Video
                if(_resource.type === 'video')
                {
                    const videoTexture = new THREE.VideoTexture(_data)
                    videoTexture.needsUpdate = true
            
                    this.items[`${_resource.name}VideoTexture`] = videoTexture
                }               
            
                // Trigger progress
                this.trigger('progress', [this.loader.loaded / this.loader.toLoad])
            })

        this.loader.on('end', () =>
        {
            // Trigger ready
            this.trigger('ready')
            console.log('All assets are loaded, triggering ready event');
        })
    }
}
