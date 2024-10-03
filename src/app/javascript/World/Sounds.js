import { Howl, Howler } from 'howler'

const revealSound = '/sounds/reveal/reveal-1.mp3'

// const italianRadioSound = '/sounds/radio/capitolo3.mp3';
// const usaRadioSound = '/sounds/radio/capitolo4.mp3';
// const azRadioSound = '/sounds/radio/playboi.mp3';
const capitolo3vol1 = '/sounds/radio/capitolo3vol1.mp3';3
const capitolo3vol2 = '/sounds/radio/capitolo3vol2.mp3';
const capitolo3vol3 = '/sounds/radio/capitolo3vol3.mp3';
const capitolo3vol4 = '/sounds/radio/capitolo3vol4.mp3';
const capitolo3vol5 = '/sounds/radio/capitolo3vol5.mp3';
const capitolo3vol6 = '/sounds/radio/capitolo3vol6.mp3';
const capitolo3vol7 = '/sounds/radio/capitolo3vol7.mp3';
const capitolo3vol8 = '/sounds/radio/capitolo3vol8.mp3';
const capitolo3vol9 = '/sounds/radio/capitolo3vol9.mp3';
const capitolo3vol10 = '/sounds/radio/capitolo3vol10.mp3';

const capitolo4vol1 = '/sounds/radio/capitolo4vol1.mp3';3
const capitolo4vol2 = '/sounds/radio/capitolo4vol2.mp3';
const capitolo4vol3 = '/sounds/radio/capitolo4vol3.mp3';
const capitolo4vol4 = '/sounds/radio/capitolo4vol4.mp3';
const capitolo4vol5 = '/sounds/radio/capitolo4vol5.mp3';
const capitolo4vol6 = '/sounds/radio/capitolo4vol6.mp3';
const capitolo4vol7 = '/sounds/radio/capitolo4vol7.mp3';
const capitolo4vol8 = '/sounds/radio/capitolo4vol8.mp3';
const capitolo4vol9 = '/sounds/radio/capitolo4vol9.mp3';
const capitolo4vol10 = '/sounds/radio/capitolo4vol10.mp3';
const capitolo4vol11 = '/sounds/radio/capitolo4vol11.mp3';

const playboi = '/sounds/radio/playboi.mp3';

const radioSwitchSound = '/sounds/radio/radioSwitch.mp3';
const radioTurnSound = '/sounds/radio/switch.mp3';

const engineSound = '/sounds/engines/1/rear.mp3'
// const rodeo = '/sounds/engines/2/rodeo.mp3'

const brick1Sound = '/sounds/bricks/brick-1.mp3'
const brick2Sound = '/sounds/bricks/brick-2.mp3'
// const brick3Sound = '/sounds/bricks/brick-3.mp3'
const brick4Sound = '/sounds/bricks/brick-4.mp3'
// const brick5Sound = '/sounds/bricks/brick-5.mp3'
const brick6Sound = '/sounds/bricks/brick-6.mp3'
const brick7Sound = '/sounds/bricks/brick-7.mp3'
const brick8Sound = '/sounds/bricks/brick-8.mp3'

const bowlingPin1Sound = '/sounds/bowling/pin-1.mp3'

const carHit1Sound = '/sounds/car-hits/car-hit-1.mp3'
// const carHit2Sound = '/sounds/car-hits/car-hit-2.mp3'
const carHit3Sound = '/sounds/car-hits/car-hit-3.mp3'
const carHit4Sound = '/sounds/car-hits/car-hit-4.mp3'
const carHit5Sound = '/sounds/car-hits/car-hit-5.mp3'

const woodHit1Sound = '/sounds/wood-hits/wood-hit-1.mp3'

// const screech1Sound = '/sounds/screeches/screech-1.mp3'

const uiArea1Sound = '/sounds/ui/area-1.mp3'

const carHorn1Sound = '/sounds/car-horns/car-horn-1.mp3'
const carHorn2Sound = '/sounds/car-horns/car-horn-2.mp3'
const carHorn3Sound = '/sounds/car-horns/car-horn-3.mp3'

const horn1Sound = '/sounds/horns/horn-1.mp3'
const horn2Sound = '/sounds/horns/horn-2.mp3'
const horn3Sound = '/sounds/horns/horn-3.mp3'

export default class Sounds
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.debug = _options.debug

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder('sounds')
            // this.debugFolder.open()
        }

        // Function to shuffle an array
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // this.radioChannels = ['italianRadio', 'usaRadio', 'azRadio'];
        this.radioChannels = [
            capitolo3vol10,
            capitolo3vol1, 
            capitolo4vol4,
            capitolo4vol7,
            playboi,
            capitolo4vol1,
            capitolo4vol3,
            capitolo3vol5, 
            capitolo3vol8,
            capitolo4vol2,
            capitolo4vol6,
            capitolo3vol7,
            capitolo3vol3, 
            capitolo3vol9,
            capitolo4vol8
        ]

        this.radioChannels = shuffleArray(this.radioChannels);
        this.currentRadioChannelIndex = -1;
        this.radioOn = false;

        // Set up
        this.items = []

        this.setSettings()
        this.setMasterVolume()
        this.setMute()
        this.setEngine()
    }

    setSettings()
    {
        this.settings = [
            {
                name: 'radioTurn',
                sounds: [radioTurnSound],
                minDelta: 100,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 1,
                volumeMax: 1,
                rateMin: 1,
                rateMax: 1
            },
            {
                name: 'radioSwitch',
                sounds: [radioSwitchSound],
                minDelta: 100,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 1,
                volumeMax: 1,
                rateMin: 1,
                rateMax: 1
            },
            {
                name: 'italianRadio',
                sounds: [capitolo3vol1],
                minDelta: 0,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 1,
                volumeMax: 1,
                rateMin: 1,
                rateMax: 1
            },
            {
                name: 'usaRadio',
                sounds: [capitolo3vol2],
                minDelta: 0,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 1,
                volumeMax: 1,
                rateMin: 1,
                rateMax: 1
            },
            {
                name: 'azRadio',
                sounds: [capitolo3vol3],
                minDelta: 0,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 1,
                volumeMax: 1,
                rateMin: 1,
                rateMax: 1
            },
            {
                name: 'reveal',
                sounds: [revealSound],
                minDelta: 100,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 1,
                volumeMax: 1,
                rateMin: 1,
                rateMax: 1
            },
            {
                name: 'brick',
                sounds: [brick1Sound, brick2Sound, brick4Sound, brick6Sound, brick7Sound, brick8Sound],
                minDelta: 100,
                velocityMin: 1,
                velocityMultiplier: 0.75,
                volumeMin: 0.2,
                volumeMax: 0.85,
                rateMin: 0.5,
                rateMax: 0.75
            },
            {
                name: 'bowlingPin',
                sounds: [bowlingPin1Sound],
                minDelta: 0,
                velocityMin: 1,
                velocityMultiplier: 0.5,
                volumeMin: 0.35,
                volumeMax: 1,
                rateMin: 0.1,
                rateMax: 0.85
            },
            {
                name: 'bowlingBall',
                sounds: [bowlingPin1Sound, bowlingPin1Sound, bowlingPin1Sound],
                minDelta: 0,
                velocityMin: 1,
                velocityMultiplier: 0.5,
                volumeMin: 0.35,
                volumeMax: 1,
                rateMin: 0.1,
                rateMax: 0.2
            },
            {
                name: 'carHit',
                sounds: [carHit1Sound, carHit3Sound, carHit4Sound, carHit5Sound],
                minDelta: 100,
                velocityMin: 2,
                velocityMultiplier: 1,
                volumeMin: 0.2,
                volumeMax: 0.6,
                rateMin: 0.35,
                rateMax: 0.55
            },
            {
                name: 'woodHit',
                sounds: [woodHit1Sound],
                minDelta: 30,
                velocityMin: 1,
                velocityMultiplier: 1,
                volumeMin: 0.5,
                volumeMax: 1,
                rateMin: 0.75,
                rateMax: 1.5
            },
            // {
            //     name: 'screech',
            //     sounds: [screech1Sound],
            //     minDelta: 1000,
            //     velocityMin: 0,
            //     velocityMultiplier: 1,
            //     volumeMin: 0.75,
            //     volumeMax: 1,
            //     rateMin: 0.9,
            //     rateMax: 1.1
            // },
            {
                name: 'uiArea',
                sounds: [uiArea1Sound],
                minDelta: 100,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 0.75,
                volumeMax: 1,
                rateMin: 0.95,
                rateMax: 1.05
            },
            {
                name: 'carHorn1',
                sounds: [carHorn1Sound],
                minDelta: 0,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 0.95,
                volumeMax: 1,
                rateMin: 1,
                rateMax: 1
            },
            {
                name: 'carHorn2',
                sounds: [carHorn2Sound],
                minDelta: 0,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 0.95,
                volumeMax: 1,
                rateMin: 1,
                rateMax: 1
            },
            {
                name: 'carHorn3',
                sounds: [carHorn3Sound],
                minDelta: 0,
                velocityMin: 0,
                velocityMultiplier: 1,
                volumeMin: 0.95,
                volumeMax: 1,
                rateMin: 1,
                rateMax: 1
            },
            {
                name: 'horn',
                sounds: [horn1Sound, horn2Sound, horn3Sound],
                minDelta: 100,
                velocityMin: 1,
                velocityMultiplier: 0.75,
                volumeMin: 0.5,
                volumeMax: 1,
                rateMin: 0.75,
                rateMax: 1
            }
        ]

        for(const _settings of this.settings)
        {
            this.add(_settings)
        }
    }

    setMasterVolume()
    {
        // Set up
        this.masterVolume = 0.5
        Howler.volume(this.masterVolume)

        if (typeof window !== 'undefined') {
            window.requestAnimationFrame(() =>
            {
                Howler.volume(this.masterVolume)
            })
        }

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this, 'masterVolume').step(0.001).min(0).max(1).onChange(() =>
            {
                Howler.volume(this.masterVolume)
            })
        }
    }

    setMute()
    {
        // Set up
        this.muted = typeof this.debug !== 'undefined'
        Howler.mute(this.muted)

        if (typeof window !== 'undefined') {
            // M Key
            window.addEventListener('keydown', (_event) =>
            {
                if(_event.key === 'm')
                {
                    this.muted = !this.muted
                    Howler.mute(this.muted)
                }
            })
        }

        // Tab focus / blur
        document.addEventListener('visibilitychange', () =>
        {
            if(document.hidden)
            {
                Howler.mute(true)
            }
            else
            {
                Howler.mute(this.muted)
            }
        })

        // Debug
        if(this.debug)
        {
            this.debugFolder.add(this, 'muted').listen().onChange(() =>
            {
                Howler.mute(this.muted)
            })
        }
    }

    // Radio control methods
    cycleRadioChannel() {
        if (!this.radio) {
            this.radio = {
                sound: null,
                currentChannel: null
            };
        }

        // Increment the index
        this.currentRadioChannelIndex = (this.currentRadioChannelIndex + 1);

        // If the index is equal to the length of the channels array, turn off the radio and reset the index
        if (this.currentRadioChannelIndex === this.radioChannels.length) {
            this.turnOffRadio();
            this.currentRadioChannelIndex = -1; // Set to -1 so the next increment sets it to 0
            return;
        }

        const currentChannel = this.radioChannels[this.currentRadioChannelIndex];

        // Stop any currently playing radio sound
        if (this.radio && this.radio.sound) {
            this.radio.sound.stop();
        }

        // Play switch sound
        const switchSound = new Howl({
            src: [radioSwitchSound],
            loop: false,
            volume: 1
        });

        switchSound.play();

        // Delay playing the new channel sound until the switch sound finishes
        setTimeout(() => {
            this.radio.sound = new Howl({
                src: [currentChannel],
                loop: true,
                volume: 1
            });
            this.radio.sound.play();
            console.log(`Playing ${currentChannel}`);
        }, switchSound.duration() * 1000); // Convert to milliseconds
    }

    toggleRadio() {
        if (!this.radioOn) {
            this.turnOnRadio();
        } else {
            this.turnOffRadio();
        }
    }

    turnOnRadio() {
        this.radioOn = true;

        const turnSound = new Howl({
            src: [radioTurnSound],
            loop: false,
            volume: 1
        });
        turnSound.play();

        setTimeout(() => {
            this.cycleRadioChannel();
        }, turnSound.duration() * 1000); // Convert to milliseconds
    }

    turnOffRadio() {
        this.radioOn = false;

        const turnSound = new Howl({
            src: [radioTurnSound],
            loop: false,
            volume: 1
        });

        this.radio.sound.stop();
        turnSound.play();

        // Stop the radio sound after the turn sound has finished playing
        // setTimeout(() => {
        //     if (this.radio && this.radio.sound) {
        //         this.radio.sound.stop();
        //     }
        // }, turnSound.duration() * 1000); // Convert to milliseconds
    }

    // cycleRadioChannel() {
    //     if (!this.radio) {
    //         this.radio = {
    //             sound: null,
    //             currentChannel: null
    //         };
    //     }
    
    //     this.currentRadioChannelIndex = (this.currentRadioChannelIndex + 1) % this.radioChannels.length;
    //     const currentChannel = this.radioChannels[this.currentRadioChannelIndex];
    
    //     // Stop any currently playing radio sound
    //     if (this.radio && this.radio.sound) {
    //         this.radio.sound.stop();
    //     }
    
    //     // Play the new channel
    //     this.radio.sound = new Howl({
    //         src: [currentChannel],
    //         loop: true,
    //         volume: 1
    //     });
    //     // Play the new channel
    //     this.radioSwitch = new Howl({
    //         src: [radioSwitchSound],
    //         loop: false,
    //         volume: 1
    //     });
    //     // Play the new channel
    //     this.radioTurn = new Howl({
    //         src: [radioTurn],
    //         loop: false,
    //         volume: 1
    //     });

    //     this.radioSwitch.play();
    //     this.radio.sound.play();
    //     console.log(`Playing ${currentChannel}`);
    // }

    setEngine()
    {
        // Set up
        this.engine = {}

        this.engine.progress = 0
        this.engine.progressEasingUp = 0.3
        this.engine.progressEasingDown = 0.15

        this.engine.speed = 0
        this.engine.speedMultiplier = 2.5
        this.engine.acceleration = 0
        this.engine.accelerationMultiplier = 0.4

        this.engine.rate = {}
        this.engine.rate.min = 0.05
        this.engine.rate.max = 1.4

        this.engine.volume = {}
        this.engine.volume.min = 0.01
        this.engine.volume.max = 0.03
        this.engine.volume.master = 0

        this.engine.sound = new Howl({
            src: [engineSound],
            loop: true
        })

        this.engine.sound.play();

        // Time tick
        this.time.on('tick', () =>
        {
            let progress = Math.abs(this.engine.speed) * this.engine.speedMultiplier + Math.max(this.engine.acceleration, 0) * this.engine.accelerationMultiplier
            progress = Math.min(Math.max(progress, 0), 1)

            this.engine.progress += (progress - this.engine.progress) * this.engine[progress > this.engine.progress ? 'progressEasingUp' : 'progressEasingDown']

            // Rate
            const rateAmplitude = this.engine.rate.max - this.engine.rate.min
            this.engine.sound.rate(this.engine.rate.min + rateAmplitude * this.engine.progress)

            // Volume
            const volumeAmplitude = this.engine.volume.max - this.engine.volume.min
            this.engine.sound.volume((this.engine.volume.min + volumeAmplitude * this.engine.progress) * this.engine.volume.master)
        })

        // Debug
        if(this.debug)
        {
            const folder = this.debugFolder.addFolder('engine')
            folder.open()

            folder.add(this.engine, 'progressEasingUp').step(0.001).min(0).max(1).name('progressEasingUp')
            folder.add(this.engine, 'progressEasingDown').step(0.001).min(0).max(1).name('progressEasingDown')
            folder.add(this.engine.rate, 'min').step(0.001).min(0).max(4).name('rateMin')
            folder.add(this.engine.rate, 'max').step(0.001).min(0).max(4).name('rateMax')
            folder.add(this.engine, 'speedMultiplier').step(0.01).min(0).max(5).name('speedMultiplier')
            folder.add(this.engine, 'accelerationMultiplier').step(0.01).min(0).max(100).name('accelerationMultiplier')
            folder.add(this.engine, 'progress').step(0.01).min(0).max(1).name('progress').listen()
        }
    }

    add(_options)
    {
        const item = {
            name: _options.name,
            minDelta: _options.minDelta,
            velocityMin: _options.velocityMin,
            velocityMultiplier: _options.velocityMultiplier,
            volumeMin: _options.volumeMin,
            volumeMax: _options.volumeMax,
            rateMin: _options.rateMin,
            rateMax: _options.rateMax,
            lastTime: 0,
            sounds: []
        }

        for(const _sound of _options.sounds)
        {
            const sound = new Howl({ src: [_sound] })

            item.sounds.push(sound)
        }

        this.items.push(item)
    }

    play(_name, _velocity)
    {
        const item = this.items.find((_item) => _item.name === _name)
        const time = Date.now()
        const velocity = typeof _velocity === 'undefined' ? 0 : _velocity

        if(item && time > item.lastTime + item.minDelta && (item.velocityMin === 0 || velocity > item.velocityMin))
        {
            // Find random sound
            const sound = item.sounds[Math.floor(Math.random() * item.sounds.length)]

            // Update volume
            let volume = Math.min(Math.max((velocity - item.velocityMin) * item.velocityMultiplier, item.volumeMin), item.volumeMax)
            volume = Math.pow(volume, 2)
            sound.volume(volume)

            // Update rate
            const rateAmplitude = item.rateMax - item.rateMin
            sound.rate(item.rateMin + Math.random() * rateAmplitude)

            // Play
            sound.play()

            // Save last play time
            item.lastTime = time
        }
    }
}
