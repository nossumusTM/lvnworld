import * as THREE from 'three'
import FloorShadowMaterial from '../Materials/FloorShadow.js'
import MatcapMaterial from '../Materials/Matcap.js'

export default class Materials
{
    constructor(_options)
    {
        // Options
        this.resources = _options.resources
        this.debug = _options.debug

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('materials')
            this.debugFolder.open()
        }

        // Set up
        this.items = {}

        this.setPures()
        this.setShades()
        this.setFloorShadow()
    }

    setPures()
    {
        // Setup
        this.pures = {}
        this.pures.items = {}
        this.pures.items.red = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        this.pures.items.red.name = 'pureRed'
        this.pures.items.white = new THREE.MeshBasicMaterial({ color: 0xffffff })
        this.pures.items.white.name = 'pureWhite'
        this.pures.items.yellow = new THREE.MeshBasicMaterial({ color: 0xffe889 })
        this.pures.items.yellow.name = 'pureYellow'
    }

    setShades()
    {
        // Setup
        this.shades = {}
        this.shades.items = {}
        this.shades.indirectColor = '#0213f7'

        this.shades.uniforms = {
            uRevealProgress: 0,
            uIndirectDistanceAmplitude: 1.75,
            uIndirectDistanceStrength: 0.5,
            uIndirectDistancePower: 2.0,
            uIndirectAngleStrength: 1.5,
            uIndirectAngleOffset: 0.6,
            uIndirectAnglePower: 1.0,
            uIndirectColor: null
        }

        // White
        this.shades.items.white = new MatcapMaterial()
        this.shades.items.white.name = 'shadeWhite'
        this.shades.items.white.uniforms.matcap.value = this.resources.items.matcapWhiteTexture
        this.items.white = this.shades.items.white

        // Orange
        this.shades.items.orange = new MatcapMaterial()
        this.shades.items.orange.name = 'shadeOrange'
        this.shades.items.orange.uniforms.matcap.value = this.resources.items.matcapOrangeTexture
        this.items.orange = this.shades.items.orange

        // Green
        this.shades.items.green = new MatcapMaterial()
        this.shades.items.green.name = 'shadeGreen'
        this.shades.items.green.uniforms.matcap.value = this.resources.items.matcapGreenTexture
        this.items.green = this.shades.items.green

        // Brown
        this.shades.items.brown = new MatcapMaterial()
        this.shades.items.brown.name = 'shadeBrown'
        this.shades.items.brown.uniforms.matcap.value = this.resources.items.matcapBrownTexture
        this.items.brown = this.shades.items.brown

        // Blue glass
        this.shades.items.blueGlass = new MatcapMaterial()
        this.shades.items.blueGlass.name = 'shadeBlueGlass'
        this.shades.items.blueGlass.uniforms.matcap.value = this.resources.items.matcapBlueGlassTexture
        this.items.blueGlass = this.shades.items.blueGlass

        // Sky
        this.shades.items.sky = new MatcapMaterial()
        this.shades.items.sky.name = 'shadeSky'
        this.shades.items.sky.uniforms.matcap.value = this.resources.items.matcapSkyTexture
        this.items.sky = this.shades.items.sky

        // Charcoal
        this.shades.items.charcoal = new MatcapMaterial()
        this.shades.items.charcoal.name = 'shadeCharcoal'
        this.shades.items.charcoal.uniforms.matcap.value = this.resources.items.matcapCharcoalTexture
        this.items.charcoal = this.shades.items.charcoal

        // Transparent land
        this.shades.items.transparentLand = new MatcapMaterial()
        this.shades.items.transparentLand.name = 'shadeTransparentLand'
        this.shades.items.transparentLand.uniforms.matcap.value = this.resources.items.matcapTransparentLandTexture
        this.items.transparentLand = this.shades.items.transparentLand

        // Volcano
        this.shades.items.volcano = new MatcapMaterial()
        this.shades.items.volcano.name = 'shadeVolcano'
        this.shades.items.volcano.uniforms.matcap.value = this.resources.items.matcapVolcanoTexture
        this.items.volcano = this.shades.items.volcano

         // Earth
         this.shades.items.earth = new MatcapMaterial()
         this.shades.items.earth.name = 'shadeEarth'
         this.shades.items.earth.uniforms.matcap.value = this.resources.items.matcapEarthTexture
         this.items.earth = this.shades.items.earth

         // Green bulb
         this.shades.items.greenBulb = new MatcapMaterial()
         this.shades.items.greenBulb.name = 'shadeGreenBulb'
         this.shades.items.greenBulb.uniforms.matcap.value = this.resources.items.matcapGreenBulbTexture
         this.items.greenBulb = this.shades.items.greenBulb

         // Dark Emerald
         this.shades.items.darkEmerald = new MatcapMaterial()
         this.shades.items.darkEmerald.name = 'shadeDarkEmerald'
         this.shades.items.darkEmerald.uniforms.matcap.value = this.resources.items.matcapDarkEmeraldTexture
         this.items.darkEmerald = this.shades.items.darkEmerald

         // Line
         this.shades.items.line = new MatcapMaterial()
         this.shades.items.line.name = 'shadeLine'
         this.shades.items.line.uniforms.matcap.value = this.resources.items.matcapLineTexture
         this.items.line = this.shades.items.line

         // Marble
         this.shades.items.marble = new MatcapMaterial()
         this.shades.items.marble.name = 'shadeMarble'
         this.shades.items.marble.uniforms.matcap.value = this.resources.items.matcapMarbleTexture
         this.items.marble = this.shades.items.marble

         // Dark metal
         this.shades.items.darkMetal = new MatcapMaterial()
         this.shades.items.darkMetal.name = 'shadeDarkMetal'
         this.shades.items.darkMetal.uniforms.matcap.value = this.resources.items.matcapDarkMetalTexture
         this.items.darkMetal = this.shades.items.darkMetal

         // Panacea
         this.shades.items.panacea = new MatcapMaterial()
         this.shades.items.panacea.name = 'shadePanacea'
         this.shades.items.panacea.uniforms.matcap.value = this.resources.items.matcapPanaceaTexture
         this.items.panacea = this.shades.items.panacea

         // Elevator
         this.shades.items.elevator = new MatcapMaterial()
         this.shades.items.elevator.name = 'shadeElevator'
         this.shades.items.elevator.uniforms.matcap.value = this.resources.items.matcapElevatorTexture
         this.items.elevator = this.shades.items.elevator

         // Bronz
         this.shades.items.bronz = new MatcapMaterial()
         this.shades.items.bronz.name = 'shadeBronz'
         this.shades.items.bronz.uniforms.matcap.value = this.resources.items.matcapBronzTexture
         this.items.bronz = this.shades.items.bronz

         // Exotic
         this.shades.items.exotic = new MatcapMaterial()
         this.shades.items.exotic.name = 'shadeExotic'
         this.shades.items.exotic.uniforms.matcap.value = this.resources.items.matcapExoticTexture
         this.items.exotic = this.shades.items.exotic

         // Bw
         this.shades.items.bw = new MatcapMaterial()
         this.shades.items.bw.name = 'shadeBw'
         this.shades.items.bw.uniforms.matcap.value = this.resources.items.matcapBwTexture
         this.items.bw = this.shades.items.bw

         // Coral
         this.shades.items.coral = new MatcapMaterial()
         this.shades.items.coral.name = 'shadeCoral'
         this.shades.items.coral.uniforms.matcap.value = this.resources.items.matcapCoralTexture
         this.items.coral = this.shades.items.coral

         // Divo
         this.shades.items.divo = new MatcapMaterial()
         this.shades.items.divo.name = 'shadeDivo'
         this.shades.items.divo.uniforms.matcap.value = this.resources.items.matcapDivoTexture
         this.items.divo = this.shades.items.divo

        // Gray
        this.shades.items.gray = new MatcapMaterial()
        this.shades.items.gray.name = 'shadeGray'
        this.shades.items.gray.uniforms.matcap.value = this.resources.items.matcapGrayTexture
        this.items.gray = this.shades.items.gray

        // Beige
        this.shades.items.beige = new MatcapMaterial()
        this.shades.items.beige.name = 'shadeBeige'
        this.shades.items.beige.uniforms.matcap.value = this.resources.items.matcapBeigeTexture
        this.items.beige = this.shades.items.beige

        // Red
        this.shades.items.red = new MatcapMaterial()
        this.shades.items.red.name = 'shadeRed'
        this.shades.items.red.uniforms.matcap.value = this.resources.items.matcapRedTexture
        this.items.red = this.shades.items.red

        // Black
        this.shades.items.black = new MatcapMaterial()
        this.shades.items.black.name = 'shadeBlack'
        this.shades.items.black.uniforms.matcap.value = this.resources.items.matcapBlackTexture
        this.items.black = this.shades.items.black

        // Green emerald
        this.shades.items.emeraldGreen = new MatcapMaterial()
        this.shades.items.emeraldGreen.name = 'shadeEmeraldGreen'
        this.shades.items.emeraldGreen.uniforms.matcap.value = this.resources.items.matcapEmeraldGreenTexture
        this.items.emeraldGreen = this.shades.items.emeraldGreen

        // Purple
        this.shades.items.purple = new MatcapMaterial()
        this.shades.items.purple.name = 'shadePurple'
        this.shades.items.purple.uniforms.matcap.value = this.resources.items.matcapPurpleTexture
        this.items.purple = this.shades.items.purple

        // Blue
        this.shades.items.blue = new MatcapMaterial()
        this.shades.items.blue.name = 'shadeBlue'
        this.shades.items.blue.uniforms.matcap.value = this.resources.items.matcapBlueTexture
        this.items.blue = this.shades.items.blue

        // Yellow
        this.shades.items.yellow = new MatcapMaterial()
        this.shades.items.yellow.name = 'shadeYellow'
        this.shades.items.yellow.uniforms.matcap.value = this.resources.items.matcapYellowTexture
        this.items.yellow = this.shades.items.yellow

        // Metal
        this.shades.items.metal = new MatcapMaterial()
        this.shades.items.metal.name = 'shadeMetal'
        this.shades.items.metal.uniforms.matcap.value = this.resources.items.matcapMetalTexture
        this.items.metal = this.shades.items.metal

        // Green Surface
        this.shades.items.greenSurface = new MatcapMaterial()
        this.shades.items.greenSurface.name = 'shadeGreenSurface'
        this.shades.items.greenSurface.uniforms.matcap.value = this.resources.items.matcapGreenSurfaceTexture
        this.items.greenSurface = this.shades.items.greenSurface

        // Indigo
        this.shades.items.indigo = new MatcapMaterial()
        this.shades.items.indigo.name = 'shadeIndigo'
        this.shades.items.indigo.uniforms.matcap.value = this.resources.items.matcapIndigoTexture
        this.items.indigo = this.shades.items.indigo

        // Lemon Blue
        this.shades.items.lemonBlue = new MatcapMaterial()
        this.shades.items.lemonBlue.name = 'shadeLemonBlue'
        this.shades.items.lemonBlue.uniforms.matcap.value = this.resources.items.matcapLemonBlue
        this.items.lemonBlue = this.shades.items.lemonBlue

        // Valakas
        this.shades.items.valakas = new MatcapMaterial()
        this.shades.items.valakas.name = 'shadeValakas'
        this.shades.items.valakas.uniforms.matcap.value = this.resources.items.matcapValakas
        this.items.valakas = this.shades.items.valakas

        // OffWhite
         this.shades.items.offWhite = new MatcapMaterial()
         this.shades.items.offWhite.name = 'shadeOffWhite'
         this.shades.items.offWhite.uniforms.matcap.value = this.resources.items.matcapOffWhite
         this.items.offWhite = this.shades.items.offWhite

         // BlackSea
         this.shades.items.blacksea = new MatcapMaterial()
         this.shades.items.blacksea.name = 'shadeBlackSea'
         this.shades.items.blacksea.uniforms.matcap.value = this.resources.items.matcapBlackSea
         this.items.blacksea = this.shades.items.blacksea

         console.log("This materials", this.resources.items)

         // Amazon
         this.shades.items.amazon = new MatcapMaterial()
         this.shades.items.amazon.name = 'shadeAmazon'
         this.shades.items.amazon.uniforms.matcap.value = this.resources.items.matcapAmazon
         this.items.amazon = this.shades.items.amazon

        // White Blue
        this.shades.items.whiteBlue = new MatcapMaterial()
        this.shades.items.whiteBlue.name = 'shadeWhiteBlue'
        this.shades.items.whiteBlue.uniforms.matcap.value = this.resources.items.matcapWhiteBlue
        this.items.whiteBlue = this.shades.items.whiteBlue

        // Wine
        this.shades.items.wine = new MatcapMaterial()
        this.shades.items.wine.name = 'shadeWine'
        this.shades.items.wine.uniforms.matcap.value = this.resources.items.matcapWine
        this.items.wine = this.shades.items.wine

        // Sun Earth
        this.shades.items.sunEarth = new MatcapMaterial()
        this.shades.items.sunEarth.name = 'shadeSunEarth'
        this.shades.items.sunEarth.uniforms.matcap.value = this.resources.items.matcapSunEarth
        this.items.sunEarth = this.shades.items.sunEarth

        // Violet
        this.shades.items.violet = new MatcapMaterial()
        this.shades.items.violet.name = 'shadeViolet'
        this.shades.items.violet.uniforms.matcap.value = this.resources.items.matcapViolet
        this.items.violet = this.shades.items.violet

        // Mixature
        this.shades.items.mixature = new MatcapMaterial()
        this.shades.items.mixature.name = 'shadeMixature'
        this.shades.items.mixature.uniforms.matcap.value = this.resources.items.matcapMixature
        this.items.mixature = this.shades.items.mixature

        // Blue Eye
        this.shades.items.blueEye = new MatcapMaterial()
        this.shades.items.blueEye.name = 'shadeBlueEye'
        this.shades.items.blueEye.uniforms.matcap.value = this.resources.items.matcapBlueEye
        this.items.blueEye = this.shades.items.blueEye

        // Violet Orange
        this.shades.items.violetOrange = new MatcapMaterial()
        this.shades.items.violetOrange.name = 'shadeVioletOrange'
        this.shades.items.violetOrange.uniforms.matcap.value = this.resources.items.matcapVioletOrange
        this.items.violetOrange = this.shades.items.violetOrange

        // Gold
        this.shades.items.gold = new MatcapMaterial()
        this.shades.items.gold.name = 'shadeGold'
        this.shades.items.gold.uniforms.matcap.value = this.resources.items.matcapGoldTexture
        this.items.gold = this.shades.items.gold

        // Update materials uniforms
        this.shades.updateMaterials = () =>
        {
            this.shades.uniforms.uIndirectColor = new THREE.Color(this.shades.indirectColor)

            // Each uniform
            for(const _uniformName in this.shades.uniforms)
            {
                const _uniformValue = this.shades.uniforms[_uniformName]

                // Each material
                for(const _materialKey in this.shades.items)
                {
                    const material = this.shades.items[_materialKey]
                    material.uniforms[_uniformName].value = _uniformValue
                }
            }
        }

        this.shades.updateMaterials()

        // Debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('shades')
            folder.open()

            folder.add(this.shades.uniforms, 'uIndirectDistanceAmplitude').step(0.001).min(0).max(3).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectDistanceStrength').step(0.001).min(0).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectDistancePower').step(0.001).min(0).max(5).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAngleStrength').step(0.001).min(0).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAngleOffset').step(0.001).min(- 2).max(2).onChange(this.shades.updateMaterials)
            folder.add(this.shades.uniforms, 'uIndirectAnglePower').step(0.001).min(0).max(5).onChange(this.shades.updateMaterials)
            folder.addColor(this.shades, 'indirectColor').onChange(this.shades.updateMaterials)
        }
    }

    setFloorShadow()
    {
        this.items.floorShadow = new FloorShadowMaterial()
        this.items.floorShadow.depthWrite = false
        this.items.floorShadow.shadowColor = '#0213f7'
        this.items.floorShadow.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)
        this.items.floorShadow.uniforms.uAlpha.value = 0

        this.items.floorShadow.updateMaterials = () =>
        {
            this.items.floorShadow.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)

            for(const _item of this.objects.items)
            {
                for(const _child of _item.container.children)
                {
                    if(_child.material instanceof THREE.ShaderMaterial)
                    {
                        if(_child.material.uniforms.uShadowColor)
                        {
                            _child.material.uniforms.uShadowColor.value = new THREE.Color(this.items.floorShadow.shadowColor)
                        }
                    }
                }
            }
        }

        // Debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('floorShadow')
            folder.open()

            folder.addColor(this.items.floorShadow, 'shadowColor').onChange(this.items.floorShadow.updateMaterials)
        }
    }
}
