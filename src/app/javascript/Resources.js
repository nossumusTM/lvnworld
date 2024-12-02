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
const matcapGreenSurfaceSource = '/models/matcaps/greensurface.png'
const matcapWineSource = '/models/matcaps/wine.png'
const matcapValakasSource = '/models/matcaps/valakas.png'
const matcapOffWhiteSource = '/models/matcaps/offwhite.png'
const matcapBlackSeaSource = '/models/matcaps/blacksea.png'
const matcapAmazonSource = '/models/matcaps/amazon.png'
const matcapWhiteBlueSource = '/models/matcaps/whiteblue.png'
const matcapLemonBlueSource = '/models/matcaps/whiteblue.png'
const matcapVioletSource = '/models/matcaps/violet.png'
const matcapSunEarthSource = '/models/matcaps/sunearth.png'
const matcapMixatureSource = '/models/matcaps/mixature.png'
const matcapBlueEyeSource = '/models/matcaps/blueeye.png'
const matcapVioletOrangeSource = '/models/matcaps/violetorange.png'
const matcapIndigoSource = '/models/matcaps/indigo.png'

// Clock
const clockHourBaseSource = '/models/clock/hourHand.glb'
const clockMinuteBaseSource = '/models/clock/minutesHand.glb'
const clockSecondBaseSource = 'models/clock/secondsHand.glb'

// Coin
const krashcoinBase = '/models/coin/base.glb'
const krashcoinCollision = '/models/coin/collision.glb'

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

const introRampBaseSource = '/models/intro/ramp/base.glb'
const introRampCollisionSource = '/models/intro/ramp/collision.glb'

const introBoxBaseSource = '/models/intro/box/base.glb'
const introBoxCollisionSource = '/models/intro/box/collision.glb'

const introCaseBaseSource = '/models/intro/case/base.glb'
const introCaseCollisionSource = '/models/intro/case/collision.glb'

const introCentralBaseSource = '/models/intro/central/base.glb'
const introCentralCollisionSource = '/models/intro/central/collision.glb'

const introCrownBaseSource = '/models/intro/crown/base.glb'
const introCrownCollisionSource = '/models/intro/crown/collision.glb'

const introCrystalBaseSource = '/models/intro/crystal/base.glb'
const introCrystalCollisionSource = '/models/intro/crystal/collision.glb'

const introDialBaseSource = '/models/intro/dial/base.glb'
const introDialCollisionSource = '/models/intro/dial/collision.glb'

const introDoubleRampBaseSource = '/models/intro/doubleramp/base.glb'
const introDoubleRampCollisionSource = '/models/intro/doubleramp/collision.glb'

const introHandsBaseSource = '/models/intro/hands/base.glb'
const introHandsCollisionSource = '/models/intro/hands/collision.glb'

const introLineBaseSource = '/models/intro/line/base.glb'
const introLineCollisionSource = '/models/intro/line/collision.glb'

const introLugsBaseSource = '/models/intro/lugs/base.glb'
const introLugsCollisionSource = '/models/intro/lugs/collision.glb'

const introMarkersBaseSource = '/models/intro/markers/base.glb'
const introMarkersCollisionSource = '/models/intro/markers/collision.glb'

const introTrackBaseSource = '/models/intro/track/base.glb'
const introTrackCollisionSource = '/models/intro/track/collision.glb'

// Intro Part
const introPartStaticBaseSource = '/models/introPart/static/base.glb'
const introPartStaticCollisionSource = '/models/introPart/static/collision.glb'

// Crossroads
const crossroadsStaticFloorShadowSource = 'models/crossroads/static/floorShadow.png'
const crossroadsStaticBaseSource = '/models/crossroads/static/base.glb'
const crossroadsStaticCollisionSource = '/models/crossroads/static/collision.glb'

// Car default
const carDefaultChassisSource = '/models/car/default/chassis.glb'
const carDefaultWheelSource = '/models/car/default/wheel.glb'
const carDefaultHeadlightsSource = '/models/car/default/headlights.glb'
const carDefaultBackLightsBrakeSource = '/models/car/default/backLightsBrake.glb'
const carDefaultBackLightsReverseSource = '/models/car/default/backLightsReverse.glb'
const carDefaultBackLightsBatterySource = '/models/car/default/backLightsBattery.glb'
const carDefaultAntenaSource = '/models/car/default/antena.glb'

// Charger
const chargerAccessoriesSource = '/models/charger/accessories.glb'
const chargerBacklightsSource = '/models/charger/backlights.glb'
const chargerBacklightsReverseSource = '/models/charger/backlightsReverse.glb'
const chargerChassisSource = '/models/charger/topcar1.glb'
const chargerChassisBottomSource = '/models/charger/chassisbottom.glb'
const chargerChassisInsideSource = '/models/charger/chassisinside.glb'
const chargerEngineSource = '/models/charger/engine.glb'
const chargerSaloonSource = '/models/charger/saloon.glb'
const chargerTireSource = '/models/charger/tire.glb'
const chargerWheelsSource = '/models/charger/wheel.glb'
const chargerWindowsSource = '/models/charger/windows.glb'
const chargerHeadlightsSource = '/models/charger/headlights.glb'
const chargerAntenaSource = '/models/charger/antena.glb'

// Wreckslinger
const wreckslingerChassisSource = '/models/wreckslinger/auto.glb'
const wreckslingerHeadlightsSource = '/models/wreckslinger/headlights.glb'
const wreckslingerBacklightsSource = '/models/wreckslinger/backlights.glb'
const wreckslingerBacklightsReverseSource = '/models/wreckslinger/backlightsReverse.glb'
const wreckslingerWheelsSource = '/models/wreckslinger/wheels.glb'
const wreckslingerAntenaSource = '/models/wreckslinger/antena.glb'

// Gangover
const gangoverChassisSource = '/models/gangover/auto1.glb'
const gangoverBacklightsSource = '/models/gangover/backlights.glb'
const gangoverBacklightsReverseSource = '/models/gangover/backlightsReverse.glb'
const gangoverHeadlightsSource = '/models/gangover/headlights3.glb'
const gangoverHeadlightsBottomSource = '/models/gangover/headlightsBottom.glb'
const gangoverWheelsSource = '/models/gangover/wheels.glb'
const gangoverAntenaSource = '/models/gangover/antena.glb'

// McLaren
const mclarenChassisSource = '/models/mclaren/auto.glb'
const mclarenBacklightsSource = '/models/mclaren/backlights.glb'
const mclarenHeadlightsSource = '/models/mclaren/headlights1.glb'
const mclarenBacklightsReverseSource = '/models/mclaren/backlightsReverse.glb'
const mclarenWheelsSource = '/models/mclaren/wheel.glb'
const mclarenAntenaSource = '/models/mclaren/antena.glb'

// 240 GTI
const gtiChassisSource = '/models/240gti/auto.glb'
const gtiBacklightsSource = '/models/240gti/backlights.glb'
const gtiBacklightsReverseSource = '/models/240gti/backlightsReverse.glb'
const gtiHeadlightsSource = '/models/240gti/headlights1.glb'
const gtiWheelsSource = '/models/240gti/wheel.glb'
const gtiAntenaSource = '/models/240gti/antena.glb'

// Howler Packard
const howlerChassisSource = '/models/howler/auto.glb'
const howlerBacklightsSource = '/models/howler/backlights2.glb'
const howlerBacklightsReverseSource = '/models/howler/backlightsReverse1.glb'
const howlerHeadlightsSource = '/models/howler/headlights1.glb'
const howlerWheelsSource = '/models/howler/wheel.glb'
const howlerAntenaSource = '/models/howler/antena.glb'

// RC TraxShark
const rcTruckChassisSource = '/models/rctruck/auto1.glb'
const rcTruckBacklightsSource = '/models/rctruck/backlights1.glb'
const rcTruckHeadlightsSource = '/models/rctruck/headlights1.glb'
const rcTruckBacklightsReverseSource = '/models/rctruck/backlightsReverse.glb'
const rcTruckWheelsSource = '/models/rctruck/wheel1.glb'
const rcTruckAntenaSource = '/models/rctruck/antena.glb'

// Pusher Crowd
const pusherCrowdChassisSource = '/models/pushpushpush/auto.glb'
const pusherCrowdBacklightsSource = '/models/pushpushpush/backlights2.glb'
const pusherCrowdHeadlightsSource = '/models/pushpushpush/headlights2.glb'
const pusherCrowdBacklightsReverseSource = '/models/pushpushpush/backlightsReverse.glb'
const pusherCrowdWheelsSource = '/models/pushpushpush/wheel.glb'
const pusherCrowdAntenaSource = '/models/pushpushpush/antena.glb'

// Impactus
const impactusChassisSource = '/models/impactus/auto.glb'
const impactusBacklightsSource = '/models/impactus/backlights1.glb'
const impactusHeadlightsSource = '/models/impactus/headlights1.glb'
const impactusBacklightsReverseSource = '/models/impactus/backlightsReverse.glb'
const impactusWheelsSource = '/models/impactus/wheel1.glb'
const impactusAntenaSource = '/models/impactus/antena.glb'

// Crushinator
const zimbowChassisSource = '/models/zimbow/auto.glb'
const zimbowBacklightsSource = '/models/zimbow/backlights1.glb'
const zimbowHeadlightsSource = '/models/zimbow/headlights1.glb'
const zimbowBacklightsReverseSource = '/models/zimbow/backlightsReverse.glb'
const zimbowWheelsSource = '/models/zimbow/wheels.glb'
const zimbowAntenaSource = '/models/zimbow/antena.glb'

// Goodwing
const goodwingChassisSource = '/models/goodwing/auto.glb'
const goodwingBacklightsSource = '/models/goodwing/backlights1.glb'
const goodwingHeadlightsSource = '/models/goodwing/headlights1.glb'
const goodwingBacklightsReverseSource = '/models/goodwing/backlightsReverse.glb'
const goodwingWheelsSource = '/models/goodwing/wheel.glb'
const goodwingAntenaSource = '/models/goodwing/antena.glb'

// Car default 1
const car1DefaultChassisSource = '/models/car1/default/chassis.glb'
const car1DefaultWheelSource = '/models/car1/default/wheel.glb'
const car1DefaultHeadlightsSource = '/models/car1/default/headlights.glb'
const car1DefaultBackLightsBrakeSource = '/models/car1/default/backLightsBrake.glb'
const car1DefaultBackLightsReverseSource = '/models/car1/default/backLightsReverse.glb'
const car1DefaultBackLightsBatterySource = '/models/car1/default/backLightsBattery.glb'
const car1DefaultAntenaSource = '/models/car1/default/antena.glb'

// Car default 2
const car2DefaultChassisSource = '/models/car2/default/chassis.glb'
const car2DefaultWheelSource = '/models/car2/default/wheel.glb'
const car2DefaultHeadlightsSource = '/models/car1/default/headlights.glb'
const car2DefaultBackLightsBrakeSource = '/models/car2/default/backLightsBrake.glb'
const car2DefaultBackLightsReverseSource = '/models/car2/default/backLightsReverse.glb'
const car2DefaultBackLightsBatterySource = '/models/car2/default/backLightsBattery.glb'
const car2DefaultAntenaSource = '/models/car2/default/antena.glb'

// Car default 3
const car3DefaultChassisSource = '/models/car3/default/chassis.glb'
const car3DefaultWheelSource = '/models/car3/default/wheel.glb'
const car3DefaultBackLightsBrakeSource = '/models/car3/default/backLightsBrake.glb'
const car3DefaultHeadlightsSource = '/models/car1/default/headlights.glb'
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
            { name: 'matcapGreenSurface', source: matcapGreenSurfaceSource, type: 'texture' },
            { name: 'matcapWine', source: matcapWineSource, type: 'texture' },
            { name: 'matcapValakas', source: matcapValakasSource, type: 'texture' },
            { name: 'matcapOffWhite', source: matcapOffWhiteSource, type: 'texture' },
            { name: 'matcapBlackSea', source: matcapBlackSeaSource, type: 'texture' },
            { name: 'matcapAmazon', source: matcapAmazonSource, type: 'texture' },
            { name: 'matcapWhiteBlue', source: matcapWhiteBlueSource, type: 'texture' },
            { name: 'matcapLemonBlue', source: matcapLemonBlueSource, type: 'texture' },
            { name: 'matcapViolet', source: matcapVioletSource, type: 'texture' },
            { name: 'matcapSunEarth', source: matcapSunEarthSource, type: 'texture' },
            { name: 'matcapMixature', source: matcapMixatureSource, type: 'texture' },
            { name: 'matcapBlueEye', source: matcapBlueEyeSource, type: 'texture' },
            { name: 'matcapVioletOrange', source: matcapVioletOrangeSource, type: 'texture' },
            { name: 'matcapIndigo', source: matcapIndigoSource, type: 'texture' },
            
            // Intro
            { name: 'introStaticBase', source: introStaticBaseSource },
            { name: 'introStaticCollision', source: introStaticCollisionSource },
            { name: 'introStaticFloorShadow', source: introStaticFloorShadowSource, type: 'texture' },

            // Clock
            { name: 'clockHourBase', source: clockHourBaseSource },
            { name: 'clockMinuteBase', source: clockMinuteBaseSource },
            { name: 'clockSecondBase', source: clockSecondBaseSource },

            // Krashcoin
            { name: 'krashCoinBase', source: krashcoinBase },
            { name: 'krashCoinCollision', source: krashcoinCollision },

            // Intro Part
            { name: 'introPartStaticBase', source: introPartStaticBaseSource },
            { name: 'introPartStaticCollision', source: introPartStaticCollisionSource },

            { name: 'introInstructionsLabels', source: introInstructionsLabelsSource },
            { name: 'introInstructionsArrows', source: introInstructionsArrowsSource, type: 'texture' },
            { name: 'introInstructionsControls', source: introInstructionsControlsSource, type: 'texture' },
            { name: 'introInstructionsOther', source: introInstructionsOtherSource, type: 'texture' },

            { name: 'introArrowKeyBase', source: introArrowKeyBaseSource },
            { name: 'introArrowKeyCollision', source: introArrowKeyCollisionSource },

            { name: 'introRampBase', source: introRampBaseSource },
            { name: 'introRampCollision', source: introRampCollisionSource },

            { name: 'introBoxBase', source: introBoxBaseSource },
            { name: 'introBoxCollision', source: introBoxCollisionSource },

            { name: 'introCaseBase', source: introCaseBaseSource },
            { name: 'introCaseCollision', source: introCaseCollisionSource },

            { name: 'introCentralBase', source: introCentralBaseSource },
            { name: 'introCentralCollision', source: introCentralCollisionSource },

            { name: 'introCrownBase', source: introCrownBaseSource },
            { name: 'introCrownCollision', source: introCrownCollisionSource },

            { name: 'introCrystalBase', source: introCrystalBaseSource },
            { name: 'introCrystalCollision', source: introCrystalCollisionSource },

            { name: 'introDialBase', source: introDialBaseSource },
            { name: 'introDialCollision', source: introDialCollisionSource },

            { name: 'introDoubleRampBase', source: introDoubleRampBaseSource },
            { name: 'introDoubleRampCollision', source: introDoubleRampCollisionSource },

            { name: 'introHandsBase', source: introHandsBaseSource },
            { name: 'introHandsCollision', source: introHandsCollisionSource },

            { name: 'introLineBase', source: introLineBaseSource },
            { name: 'introLineCollision', source: introLineCollisionSource },

            { name: 'introLugsBase', source: introLugsBaseSource },
            { name: 'introLugsCollision', source: introLugsCollisionSource },

            { name: 'introMarkersBase', source: introMarkersBaseSource },
            { name: 'introMarkersCollision', source: introMarkersCollisionSource },

            { name: 'introTrackBase', source: introTrackBaseSource },
            { name: 'introTrackCollision', source: introTrackCollisionSource },

            // Font
            { name: 'orbitronFont', source: orbitronFont, type: 'font' },

            // Intro
            { name: 'crossroadsStaticBase', source: crossroadsStaticBaseSource },
            { name: 'crossroadsStaticCollision', source: crossroadsStaticCollisionSource },
            { name: 'crossroadsStaticFloorShadow', source: crossroadsStaticFloorShadowSource, type: 'texture' },

            // Car default
            { name: 'carDefaultChassis', source: carDefaultChassisSource },
            { name: 'carDefaultWheel', source: carDefaultWheelSource },
            { name: 'carDefaultHeadlights', source: carDefaultHeadlightsSource },
            { name: 'carDefaultBackLightsBrake', source: carDefaultBackLightsBrakeSource },
            { name: 'carDefaultBackLightsReverse', source: carDefaultBackLightsReverseSource },
            { name: 'carDefaultBackLightsBattery', source: carDefaultBackLightsBatterySource },
            { name: 'carDefaultAntena', source: carDefaultAntenaSource },

            // Charger
            { name: 'chargerChassis', source: chargerChassisSource },
            { name: 'chargerAccessories', source: chargerAccessoriesSource },
            { name: 'chargerBacklights', source: chargerBacklightsSource },
            { name: 'chargerBacklightsReverse', source: chargerBacklightsReverseSource },
            { name: 'chargerChassisBottom', source: chargerChassisBottomSource },
            { name: 'chargerChassisInside', source: chargerChassisInsideSource },
            { name: 'chargerEngine', source: chargerEngineSource },
            { name: 'chargerSaloon', source: chargerSaloonSource },
            { name: 'chargerWheels', source: chargerWheelsSource },
            { name: 'chargerTire', source: chargerTireSource },
            { name: 'chargerWindows', source: chargerWindowsSource },
            { name: 'chargerHeadlights', source: chargerHeadlightsSource },
            { name: 'chargerAntena', source: chargerAntenaSource },

            // Wreckslinger
            { name: 'wreckslingerChassis', source: wreckslingerChassisSource },
            { name: 'wreckslingerHeadlights', source: wreckslingerHeadlightsSource },
            { name: 'wreckslingerBacklights', source: wreckslingerBacklightsSource },
            { name: 'wreckslingerBacklightsReverse', source: wreckslingerBacklightsReverseSource },
            { name: 'wreckslingerWheels', source: wreckslingerWheelsSource },
            { name: 'wreckslingerAntena', source: wreckslingerAntenaSource },

            // Gangover
            { name: 'gangoverChassis', source: gangoverChassisSource },
            { name: 'gangoverBacklights', source: gangoverBacklightsSource },
            { name: 'gangoverHeadlights', source: gangoverHeadlightsSource },
            { name: 'gangoverHeadlightsBottom', source: gangoverHeadlightsBottomSource },
            { name: 'gangoverBacklightsReverse', source: gangoverBacklightsReverseSource },
            { name: 'gangoverWheels', source: gangoverWheelsSource },
            { name: 'gangoverAntena', source: gangoverAntenaSource },

            // McLaren
            { name: 'mclarenChassis', source: mclarenChassisSource },
            { name: 'mclarenBacklights', source: mclarenBacklightsSource },
            { name: 'mclarenHeadlights', source: mclarenHeadlightsSource },
            { name: 'mclarenBacklightsReverse', source: mclarenBacklightsReverseSource },
            { name: 'mclarenWheels', source: mclarenWheelsSource },
            { name: 'mclarenAntena', source: mclarenAntenaSource },

            // 240 GTI
            { name: 'gtiChassis', source: gtiChassisSource },
            { name: 'gtiBacklights', source: gtiBacklightsSource },
            { name: 'gtiHeadlights', source: gtiHeadlightsSource },
            { name: 'gtiBacklightsReverse', source: gtiBacklightsReverseSource },
            { name: 'gtiWheels', source: gtiWheelsSource },
            { name: 'gtiAntena', source: gtiAntenaSource },

            // Howler Packard
            { name: 'howlerChassis', source: howlerChassisSource },
            { name: 'howlerBacklights', source: howlerBacklightsSource },
            { name: 'howlerHeadlights', source: howlerHeadlightsSource },
            { name: 'howlerBacklightsReverse', source: howlerBacklightsReverseSource },
            { name: 'howlerWheels', source: howlerWheelsSource },
            { name: 'howlerAntena', source: howlerAntenaSource },

            // RC TraxShark
            { name: 'rcTruckChassis', source: rcTruckChassisSource },
            { name: 'rcTruckBacklights', source: rcTruckBacklightsSource },
            { name: 'rcTruckHeadlights', source: rcTruckHeadlightsSource },
            { name: 'rcTruckBacklightsReverse', source: rcTruckBacklightsReverseSource },
            { name: 'rcTruckWheels', source: rcTruckWheelsSource },
            { name: 'rcTruckAntena', source: rcTruckAntenaSource },

            // Pusher Crowd
            { name: 'pusherCrowdChassis', source: pusherCrowdChassisSource },
            { name: 'pusherCrowdBacklights', source: pusherCrowdBacklightsSource },
            { name: 'pusherCrowdHeadlights', source: pusherCrowdHeadlightsSource },
            { name: 'pusherCrowdBacklightsReverse', source: pusherCrowdBacklightsReverseSource },
            { name: 'pusherCrowdWheels', source: pusherCrowdWheelsSource },
            { name: 'pusherCrowdAntena', source: pusherCrowdAntenaSource },

            // Impactus
            { name: 'impactusChassis', source: impactusChassisSource },
            { name: 'impactusBacklights', source: impactusBacklightsSource },
            { name: 'impactusHeadlights', source: impactusHeadlightsSource },
            { name: 'impactusBacklightsReverse', source: impactusBacklightsReverseSource },
            { name: 'impactusWheels', source: impactusWheelsSource },
            { name: 'impactusAntena', source: impactusAntenaSource },

            // Crushinator
            { name: 'zimbowChassis', source: zimbowChassisSource },
            { name: 'zimbowBacklights', source: zimbowBacklightsSource },
            { name: 'zimbowHeadlights', source: zimbowHeadlightsSource },
            { name: 'zimbowBacklightsReverse', source: zimbowBacklightsReverseSource },
            { name: 'zimbowWheels', source: zimbowWheelsSource },
            { name: 'zimbowAntena', source: zimbowAntenaSource },

            // Goodwing
            { name: 'goodwingChassis', source: goodwingChassisSource },
            { name: 'goodwingBacklights', source: goodwingBacklightsSource },
            { name: 'goodwingHeadlights', source: goodwingHeadlightsSource },
            { name: 'goodwingBacklightsReverse', source: goodwingBacklightsReverseSource },
            { name: 'goodwingWheels', source: goodwingWheelsSource },
            { name: 'goodwingAntena', source: goodwingAntenaSource },

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
            // console.log('All assets are loaded, triggering ready event');
        })
    }
}
