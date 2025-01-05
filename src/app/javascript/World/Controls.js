const mobileDoubleTriangle = 'images/mobile/doubleTriangle.png'
const monitoring = 'images/mobile/warning.png'
const mobilePaperPlane = 'images/mobile/paperPlane.png'
const mobileTriangle = 'images/mobile/triangle.png'
const mobileCross = 'images/mobile/cross.png'
const restart = 'images/mobile/restart.png'
const sirenIcon = 'images/mobile/siren.png'
const muteIcon = 'images/mobile/mute.png'
const radio = 'images/mobile/fm.png'
const previousIcon = 'images/mobile/previous.png'
const nextIcon = 'images/mobile/next.png'

import EventEmitter from '../Utils/EventEmitter'
import Sounds from './Sounds'
import { TweenLite } from 'gsap/TweenLite'

export default class Controls extends EventEmitter
{
    constructor(_options)
    {
        super()

        this.config = _options.config
        this.sizes = _options.sizes
        this.time = _options.time
        this.camera = _options.camera
        this.sounds = _options.sounds

        this.setActions()
        this.setKeyboard()
        this.setSounds()

    }

    setSounds()
    {
        this.sounds = new Sounds({
            debug: this.debugFolder,
            time: this.time
        })
    }

    setActions()
    {
        this.actions = {}
        this.actions.up = false
        this.actions.right = false
        this.actions.down = false
        this.actions.left = false
        this.actions.brake = false
        this.actions.boost = false
        this.actions.siren = false
        this.actions.shoot = false
        this.actions.camera = true

        document.addEventListener('visibilitychange', () =>
        {
            if(!document.hidden)
            {
                this.actions.up = false
                this.actions.right = false
                this.actions.down = false
                this.actions.left = false
                this.actions.brake = false
                this.actions.boost = false
                this.actions.siren = false
                this.actions.shoot = false
                this.actions.camera = true
            }
        })
    }

    setKeyboard()
    {
        this.keyboard = {}
        this.keyboard.events = {}

        this.mouse = {}
        this.mouse.events = {}

        this.mouse.events.mouseDown = (_event) =>
        {
            if (_event.button === 1) {
                this.actions.shoot = true;
            }
        }

        this.mouse.events.mouseUp = (_event) =>
        {
            if (_event.button === 1) { // Middle mouse button
                this.actions.shoot = false;
            }
        }

        this.keyboard.events.keyDown = (_event) => {
            switch (_event.key) {
                case 'y':
                    this.sounds.cycleRadioChannel();
                    break;
                case 't':
                    this.sounds.toggleRadio();
                    break;
                // ... (other cases)
            }
        };

        this.keyboard.events.keyDown = (_event) =>
        {
            switch(_event.key)
            {
                case 'ArrowUp':
                case 'w':
                    this.camera.pan.reset()
                    this.actions.up = true
                    break

                case 'ArrowRight':
                case 'd':
                    this.camera.pan.reset()
                    this.actions.right = true
                    break

                case 'ArrowDown':
                case 's':
                    this.camera.pan.reset()
                    this.actions.down = true
                    break

                case 'ArrowLeft':
                case 'a':
                    this.camera.pan.reset()
                    this.actions.left = true
                    break

                case 'Control':
                case ' ':
                    this.actions.brake = true
                    break

                case 'Shift':
                    this.addBoostActionToQueue();
                    break

                case '1':
                    this.actions.shoot = true
                    break

                case 'y':
                    this.actions.camera = true
                    break

                case 'r':
                    this.trigger('action', ['reset'])
                    break
            }
        }

        // Throttle boost action
        this.addBoostActionToQueue = () => {
            if (!this.boostCooldown) {
                this.actions.boost = true;
                this.boostCooldown = true;

                // Set a cooldown time for boost to prevent repeated triggering
                setTimeout(() => {
                    this.boostCooldown = false;
                }, 400); // Adjust the cooldown duration as needed
            }
        };

        this.keyboard.events.keyUp = (_event) =>
        {
            switch(_event.key)
            {
                case 'ArrowUp':
                case 'w':
                    this.actions.up = false
                    break

                case 'ArrowRight':
                case 'd':
                    this.actions.right = false
                    break

                case 'ArrowDown':
                case 's':
                    this.actions.down = false
                    break

                case 'ArrowLeft':
                case 'a':
                    this.actions.left = false
                    break

                case 'Control':
                case ' ':
                    this.actions.brake = false
                    break

                case 'Shift':
                    this.actions.boost = false
                    break

                case '1':
                    this.actions.shoot = false
                    break

                case 'y':
                    this.actions.camera = false
                    break

                case 'r':
                    this.trigger('action', ['reset'])
                    break
            }
        }

        document.addEventListener('keydown', this.keyboard.events.keyDown)
        document.addEventListener('keyup', this.keyboard.events.keyUp)
        document.addEventListener('mousedown', this.mouse.events.mouseDown)
        document.addEventListener('mouseup', this.mouse.events.mouseUp)
    }

    slotPositions = {
        slot1: { bottom: 'calc(70px * 2 + 35px)', right: '78px', left: 'unset' },
        slot2: { bottom: 'calc(70px * 2 + 35px)', right: '0px', left: 'unset' },
        slot3: { bottom: '98px', right: '78px', left: 'unset'},
        slot4: { bottom: '98px', right: '0px', left: 'unset'},
        slot5: { bottom: '20px', right: '78px', left: 'unset' },
        slot6: { bottom: '20px', right: '0px', left: 'unset'},
        slot7: { bottom: '175px', left: '10px', right: 'unset' },
        slot8: { bottom: '175px', left: '80px', right: 'unset' },
    };

    updateController() {
        // Retrieve saved positions from localStorage
        const savedPositions = JSON.parse(localStorage.getItem('buttonPositions')) || {};
    
        // Define a mapping between actions and touch elements
        const actionToTouchElement = {
            shoot: this.touch.shoot.$element,
            boost: this.touch.boost.$element,
            siren: this.touch.siren.$element,
            forward: this.touch.forward.$element,
            backward: this.touch.backward.$element,
            brake: this.touch.brake.$element,
            camera: this.touch.camera.$element,
            reset: this.touch.reset.$element,
        };
    
        // Loop through each saved position and apply it
        Object.keys(savedPositions).forEach(slotNumber => {
            const action = savedPositions[slotNumber];
            const touchElement = actionToTouchElement[action];
            const slotId = `slot${slotNumber}`;
    
            if (touchElement && this.slotPositions[slotId]) {
                // Get the defined position for this slot
                const position = this.slotPositions[slotId];
    
                // Apply the position values
                touchElement.style.position = 'fixed';
                if (position.bottom) touchElement.style.bottom = position.bottom;
                if (position.right) touchElement.style.right = position.right;
                if (position.left) touchElement.style.left = position.left;
    
                // Ensure the touch element is visible
                touchElement.style.opacity = '1';
    
                console.log(`Button for action "${action}" placed at ${slotId}`);
            }
        });
    }

    resetPositions = {
        slot1: { action: 'shoot', bottom: 'calc(70px * 2 + 35px)', right: '78px', left: 'unset' },
        slot2: { action: 'boost', bottom: 'calc(70px * 2 + 35px)', right: '0px', left: 'unset' },
        slot3: { action: 'siren', bottom: '98px', right: '78px', left: 'unset' },
        slot4: { action: 'forward', bottom: '98px', right: '0px', left: 'unset' },
        slot5: { action: 'backward', bottom: '20px', right: '78px', left: 'unset' },
        slot6: { action: 'brake', bottom: '20px', right: '0px', left: 'unset' },
        slot7: { action: 'camera', bottom: '175px', left: '10px', right: 'unset' },
        slot8: { action: 'reset', bottom: '175px', left: '80px', right: 'unset' },
    };    

    resetController() {
        // Reset buttons to their initial positions based on resetPositions
        Object.keys(this.resetPositions).forEach(slotKey => {
            const { action, bottom, right, left } = this.resetPositions[slotKey];
            const touchElement = this.touch[action]?.$element; // Access the correct touch element by action name
    
            if (touchElement) {
                // Apply the initial position values
                touchElement.style.position = 'fixed';
                touchElement.style.bottom = bottom;
                touchElement.style.right = right;
                touchElement.style.left = left;
    
                // Ensure the button is visible
                touchElement.style.opacity = '1';
    
                console.log(`Button for action "${action}" reset to initial position at ${slotKey}`);
            }
        });
    
        // Clear localStorage to reset saved positions
        localStorage.removeItem('buttonPositions');
    
    }

    updateButtonPositions() {

        const userDisplay = document.getElementById('userDisplay');
        userDisplay.style.display = this.isVerticalDisplay() ? 'unset' : 'unset';

        const batteryContainer = document.getElementById('battery-status');
        batteryContainer.style.top = this.isVerticalDisplay() ? '70px' : '60px';

        const scoreContainer = document.getElementById('coin-market');
        scoreContainer.style.top = this.isVerticalDisplay() ? '85px' : '15px';

        const cameraView = document.getElementById('camera-view');
        cameraView.style.display = this.isVerticalDisplay() ? 'unset' : 'unset';

        const partyInfo = document.getElementById('party-info');
        userDisplay.style.display = this.isVerticalDisplay() ? 'unset' : 'none';

        const joystickBottom = this.isVerticalDisplay() ? '10px' : '20px';
        this.touch.joystick.$element.style.bottom = joystickBottom;

        const muteButtonBottom = this.isVerticalDisplay() ? '135px' : '135px';
        const muteButtonLeft = this.isVerticalDisplay() ? '306px' : '306px';
        const muteButtonWidth = this.isVerticalDisplay() ? '60px' : '55px';
        const muteButtonHeight = this.isVerticalDisplay() ? '30px' : '20px';
        this.touch.mute.$element.style.top = muteButtonBottom;
        this.touch.mute.$element.style.left = muteButtonLeft;
        this.touch.mute.$element.style.width = muteButtonWidth;
        this.touch.mute.$element.style.height = muteButtonHeight;

        const radioButtonBottom = this.isVerticalDisplay() ? '0px' : 'unset';
        const radioButtonWidth = this.isVerticalDisplay() ? '0px' : 'unset';
        const radioButtonTop = this.isVerticalDisplay() ? '45px' : '22px';
        const radioButtonLeft = this.isVerticalDisplay() ? '285px' : '285px';
        const radioButtonRotation = this.isVerticalDisplay() ? '270deg' : '0deg';
        const radioButtonBackground = this.isVerticalDisplay() ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.5)';
        const radioButtonBorder = this.isVerticalDisplay() ? 'unset' : 'unset';
        const radioButtonOpacity = this.isVerticalDisplay() ? '1' : '0.9';

        this.touch.radio.$element.style.bottom = radioButtonBottom;
        this.touch.radio.$element.style.top = radioButtonTop;
        this.touch.radio.$element.style.left = radioButtonLeft;
        this.touch.radio.$element.style.rotate = radioButtonRotation;
        this.touch.radio.$border.style.background = radioButtonBackground;
        this.touch.radio.$border.style.border = radioButtonBorder;
        this.touch.radio.$border.style.opacity = radioButtonOpacity;

        const radioButtonElementTop = this.isVerticalDisplay() ? 'calc(50% - 11.5px)' : 'calc(50% - 11.5px)';
        const radioButtonElementHeight = this.isVerticalDisplay() ? '65px': '65px';
        const radioButtonElementWidth = this.isVerticalDisplay() ? '65px': '65px';
        const radioButtonIconTop = this.isVerticalDisplay() ? '50%' : '50%';
        const radioButtonIconLeft = this.isVerticalDisplay() ? '15%' : '15%';
        const radioButtonIconRotate = this.isVerticalDisplay() ? '90deg' : '0deg';

        this.touch.radio.$border.style.top = radioButtonElementTop;
        this.touch.radio.$border.style.height = radioButtonElementHeight;
        this.touch.radio.$border.style.width = radioButtonElementWidth;
        this.touch.radio.$icon.style.top = radioButtonIconTop;
        this.touch.radio.$icon.style.left = radioButtonIconLeft;
        this.touch.radio.$icon.style.rotate = radioButtonIconRotate;

        // const cameraButtonElementBottom = this.isVerticalDisplay() ? '175px' : '110px';
        // const cameraButtonElementLeft = this.isVerticalDisplay() ? '10px': '165px';

        // this.touch.camera.$element.style.bottom = cameraButtonElementBottom;
        // this.touch.camera.$element.style.left = cameraButtonElementLeft;
        
        // const resetButtonElementBottom = this.isVerticalDisplay() ? '175px' : '40px';
        // const resetButtonElementBottom = this.isVerticalDisplay() ? '175px' : '40px';
        // const resetButtonElementLeft = this.isVerticalDisplay() ? '83px': '165px';
        // const resetButtonElementLeft = this.isVerticalDisplay() ? '83px': '165px';

        // this.touch.reset.$element.style.bottom = resetButtonElementBottom;
        // this.touch.reset.$element.style.left = resetButtonElementLeft;

        // const partyInfo = document.getElementById('party-info')

        // if (partyInfo) {
        //     partyInfo.style.right = this.isVerticalDisplay() ? 'calc(50% - 120px)!important;' : 'unset';
        //     partyInfo.style.left = this.isVerticalDisplay() ? 'unset' : '345px';
        //     partyInfo.style.width = this.isVerticalDisplay() ? '35%' : '15%';
        //     partyInfo.style.opacity = this.isVerticalDisplay() ? '1' : '1';
        // }

        // Display none if horizontal
        const targetPlayerId = document.getElementById('target-player-id');
        const inviteButton = document.getElementById('invite-button');
        const contacts = document.getElementById('friend-invite-button');
        const contactList = document.getElementById('toggle-contact-list');
        const party = document.getElementById('toggle-party-list');
        const settings = document.getElementById('toggle-settings');
        const touchRadio = document.getElementById('touch-radio');
        const touchMute = document.getElementById('touch-mute');
        const touchSlider = document.getElementById('touch-slider');
        const touchPrevious = document.getElementById('touch-previous');
        const touchNext = document.getElementById('touch-next');
        const switchContainer = document.getElementById('switch-container');

        targetPlayerId.style.display = this.isVerticalDisplay() ? 'unset' : 'none';
        inviteButton.style.display = this.isVerticalDisplay() ? 'none' : 'none';
        contacts.style.display = this.isVerticalDisplay() ? 'none' : 'none';
        party.style.display = this.isVerticalDisplay() ? 'none' : 'none';
        contactList.style.display = this.isVerticalDisplay() ? 'none' : 'none';
        settings.style.display = this.isVerticalDisplay() ? 'none' : 'none';
        touchRadio.style.display = this.isVerticalDisplay() ? 'none' : 'none';
        touchMute.style.display = this.isVerticalDisplay() ? 'none' : 'none';
        touchSlider.style.display = this.isVerticalDisplay() ? 'none' : 'none';
        touchPrevious.style.display = this.isVerticalDisplay() ? 'none' : 'none';
        touchNext.style.display = this.isVerticalDisplay() ? 'none' : 'none';
        switchContainer.style.display = this.isVerticalDisplay() ? 'block' : 'none';
    }

    setTouch()
    {
        this.touch = {}

        if (typeof window !== 'undefined') {
            // Function to determine if the display is vertical or horizontal
            this.isVerticalDisplay = () => window.innerHeight > window.innerWidth;
        }

        const speedometer = document.getElementById('speedometer');
        speedometer.style.left = '-5px';

        /**
         * Joystick
         */
        this.touch.joystick = {}
        this.touch.joystick.active = false

        // Element
        this.touch.joystick.$element = document.createElement('div')
        this.touch.joystick.$element.style.userSelect = 'none'
        this.touch.joystick.$element.style.position = 'fixed'
        this.touch.joystick.$element.style.bottom = '10px'
        this.touch.joystick.$element.style.left = '10px'
        this.touch.joystick.$element.style.width = '170px'
        this.touch.joystick.$element.style.height = '170px'
        this.touch.joystick.$element.style.borderRadius = '50%'
        this.touch.joystick.$element.style.transition = 'opacity 0.3s 0.0s'
        this.touch.joystick.$element.style.willChange = 'opacity'
        this.touch.joystick.$element.style.opacity = '0'
        this.touch.joystick.$element.style.zIndex = '10'
        this.touch.joystick.$element.style.backgroundSize = 'contain'
        this.touch.joystick.$element.style.backgroundRepeat = 'no-repeat'
        // this.touch.joystick.$element.style.backgroundColor = '#ff0000'
        document.body.appendChild(this.touch.joystick.$element)

        this.touch.joystick.$cursor = document.createElement('div')
        this.touch.joystick.$cursor.style.position = 'absolute'
        this.touch.joystick.$cursor.style.top = 'calc(50% - 30px)'
        this.touch.joystick.$cursor.style.left = 'calc(50% - 30px)'
        this.touch.joystick.$cursor.style.width = '60px'
        this.touch.joystick.$cursor.style.height = '60px'
        this.touch.joystick.$cursor.style.border = '2px solid #ffffff'
        this.touch.joystick.$cursor.style.borderRadius = '50%'
        this.touch.joystick.$cursor.style.boxSizing = 'border-box'
        this.touch.joystick.$cursor.style.pointerEvents = 'none'
        this.touch.joystick.$cursor.style.willChange = 'transform'
        this.touch.joystick.$element.appendChild(this.touch.joystick.$cursor)

        this.touch.joystick.$limit = document.createElement('div')
        this.touch.joystick.$limit.style.position = 'absolute'
        this.touch.joystick.$limit.style.top = 'calc(50% - 75px)'
        this.touch.joystick.$limit.style.left = 'calc(50% - 75px)'
        this.touch.joystick.$limit.style.width = '150px'
        this.touch.joystick.$limit.style.height = '150px'
        this.touch.joystick.$limit.style.border = 'unset'
        this.touch.joystick.$limit.style.background = 'rgba(0, 0, 0, 0.5)'
        this.touch.joystick.$limit.style.borderRadius = '50%'
        this.touch.joystick.$limit.style.opacity = '0.25'
        this.touch.joystick.$limit.style.pointerEvents = 'none'
        this.touch.joystick.$limit.style.boxSizing = 'border-box'
        this.touch.joystick.$element.appendChild(this.touch.joystick.$limit)

        // Angle
        this.touch.joystick.angle = {}

        this.touch.joystick.angle.offset = Math.PI * 0.18

        this.touch.joystick.angle.center = {}
        this.touch.joystick.angle.center.x = 0
        this.touch.joystick.angle.center.y = 0

        this.touch.joystick.angle.current = {}
        this.touch.joystick.angle.current.x = 0
        this.touch.joystick.angle.current.y = 0

        this.touch.joystick.angle.originalValue = 0
        this.touch.joystick.angle.value = - Math.PI * 0.5

        // Resize
        this.touch.joystick.resize = () =>
        {
            const boundings = this.touch.joystick.$element.getBoundingClientRect()

            this.touch.joystick.angle.center.x = boundings.left + boundings.width * 0.5
            this.touch.joystick.angle.center.y = boundings.top + boundings.height * 0.5
        }

        this.sizes.on('resize', this.touch.joystick.resize)
        this.touch.joystick.resize()

        // Time tick
        this.time.on('tick', () =>
        {
            // Joystick active
            if(this.touch.joystick.active)
            {
                // Calculate joystick angle
                this.touch.joystick.angle.originalValue = - Math.atan2(
                    this.touch.joystick.angle.current.y - this.touch.joystick.angle.center.y,
                    this.touch.joystick.angle.current.x - this.touch.joystick.angle.center.x
                )
                this.touch.joystick.angle.value = this.touch.joystick.angle.originalValue + this.touch.joystick.angle.offset

                // Update joystick
                const distance = Math.hypot(this.touch.joystick.angle.current.y - this.touch.joystick.angle.center.y, this.touch.joystick.angle.current.x - this.touch.joystick.angle.center.x)
                let radius = distance
                if(radius > 20)
                {
                    radius = 20 + Math.log(distance - 20) * 5
                }
                if(radius > 43)
                {
                    radius = 43
                }
                const cursorX = Math.sin(this.touch.joystick.angle.originalValue + Math.PI * 0.5) * radius
                const cursorY = Math.cos(this.touch.joystick.angle.originalValue + Math.PI * 0.5) * radius
                this.touch.joystick.$cursor.style.transform = `translateX(${cursorX}px) translateY(${cursorY}px)`
            }
        })

        // Events
        this.touch.joystick.events = {}
        this.touch.joystick.touchIdentifier = null
        this.touch.joystick.events.touchstart = (_event) =>
        {
            _event.preventDefault()

            const touch = _event.changedTouches[0]

            if(touch)
            {
                this.touch.joystick.active = true

                this.touch.joystick.touchIdentifier = touch.identifier

                this.touch.joystick.angle.current.x = touch.clientX
                this.touch.joystick.angle.current.y = touch.clientY

                this.touch.joystick.$limit.style.opacity = '0.5'

                document.addEventListener('touchend', this.touch.joystick.events.touchend)
                document.addEventListener('touchmove', this.touch.joystick.events.touchmove, { passive: false })

                this.trigger('joystickStart')
            }
        }

        this.touch.joystick.events.touchmove = (_event) =>
        {
            _event.preventDefault()

            const touches = [..._event.changedTouches]
            const touch = touches.find((_touch) => _touch.identifier === this.touch.joystick.touchIdentifier)

            if(touch)
            {
                this.touch.joystick.angle.current.x = touch.clientX
                this.touch.joystick.angle.current.y = touch.clientY

                this.trigger('joystickMove')
            }
        }

        this.touch.joystick.events.touchend = (_event) =>
        {
            const touches = [..._event.changedTouches]
            const touch = touches.find((_touch) => _touch.identifier === this.touch.joystick.touchIdentifier)

            if(touch)
            {
                this.touch.joystick.active = false

                this.touch.joystick.$limit.style.opacity = '0.25'

                this.touch.joystick.$cursor.style.transform = 'translateX(0px) translateY(0px)'

                document.removeEventListener('touchend', this.touch.joystick.events.touchend)

                this.trigger('joystickEnd')
            }
        }

        this.touch.joystick.$element.addEventListener('touchstart', this.touch.joystick.events.touchstart, { passive: false })

        // Function to move the joystick to the right
        function moveJoystickRight() {
            const joystick = this.touch.joystick.$element;
            const speedometer = document.getElementById('speedometer');
            const camera = this.touch.camera.$element;
            const reset = this.touch.reset.$element;
            const shoot = this.touch.shoot.$element;
            const boost = this.touch.boost.$element;
            const siren = this.touch.siren.$element;
            const forward = this.touch.forward.$element;
            const backward = this.touch.backward.$element;
            const brake = this.touch.brake.$element;

            if (typeof window !== 'undefined') {
                // Function to determine if the display is vertical or horizontal
                this.isVerticalDisplay = () => window.innerHeight > window.innerWidth;
            }

            if (joystick) {
                // Reset
                joystick.style.left = '';

                // Set
                joystick.style.right = '10px';

                console.log("Joystick moved to the right.");
            } else {
                console.error('Joystick element not found.');
            }

            if (camera) {
                // Reset
                camera.style.left = '';

                // Set
                camera.style.right = '10px';

                console.log("Camera moved to the right.");
            } else {
                console.error('Camera element not found.');
            }

            if (reset) {
                // Reset
                reset.style.left = '';

                // Set
                reset.style.right = '80px';

                console.log("Reset moved to the right.");
            } else {
                console.error('Reset element not found.');
            }

            if (speedometer) {
                // Reset
                speedometer.style.left = '';

                // Set
                speedometer.style.right = '-5px';

                console.log("Speedometer moved to the right.");
            } else {
                console.error('Speedometer element not found.');
            }

            if (shoot) {
                // Reset
                shoot.style.left = '78px';

                // Set
                shoot.style.right = '';

                console.log("Shoot moved to the right.");
            } else {
                console.error('Shoot element not found.');
            }

            if (boost) {
                // Reset
                boost.style.left = '8px';

                // Set
                boost.style.right = '';

                console.log("Boost moved to the right.");
            } else {
                console.error('Boost element not found.');
            }

            if (siren) {
                // Reset
                siren.style.left = '78px';

                // Set
                siren.style.right = '';

                console.log("Siren moved to the right.");
            } else {
                console.error('Siren element not found.');
            }

            if (forward) {
                // Reset
                forward.style.left = '8px';

                // Set
                forward.style.right = '';

                console.log("Forward moved to the right.");
            } else {
                console.error('Forward element not found.');
            }

            if (backward) {
                // Reset
                backward.style.left = '78px';

                // Set
                backward.style.right = '';

                console.log("Backward moved to the right.");
            } else {
                console.error('Backward element not found.');
            }

            if (brake) {
                // Reset
                brake.style.left = '8px';

                // Set
                brake.style.right = '';

                console.log("Brake moved to the right.");
            } else {
                console.error('Brake element not found.');
            }
        }

        // Add event listener for the "Right" button
        // document.getElementById('move-joystick-right').addEventListener('click', moveJoystickRight.bind(this));

        // Function to move the joystick to the right
        function moveJoystickLeft() {
            const joystick = this.touch.joystick.$element;
            const speedometer = document.getElementById('speedometer');
            const camera = this.touch.camera.$element;
            const reset = this.touch.reset.$element;
            const shoot = this.touch.shoot.$element;
            const boost = this.touch.boost.$element;
            const siren = this.touch.siren.$element;
            const forward = this.touch.forward.$element;
            const backward = this.touch.backward.$element;
            const brake = this.touch.brake.$element;

            if (joystick) {
                // Reset left position
                joystick.style.right = '';

                // Set right position
                joystick.style.left = '10px';  // Adjust this value based on your requirements

                console.log("Joystick moved to the left.");
            } else {
                console.error('Joystick element not found.');
            }

            if (camera) {
                // Reset
                camera.style.right = '';

                // Set
                camera.style.left = '10px';

                console.log("Camera moved to the right.");
            } else {
                console.error('Camera element not found.');
            }

            if (reset) {
                // Reset
                reset.style.right = '';

                // Set
                reset.style.left = '80px';

                console.log("Reset moved to the right.");
            } else {
                console.error('Reset element not found.');
            }

            if (speedometer) {
                // Reset
                speedometer.style.right = '';

                // Set
                speedometer.style.left = '-5px';

                console.log("Speedometer moved to the right.");
            } else {
                console.error('Speedometer element not found.');
            }

            if (shoot) {
                // Reset
                shoot.style.left = '';

                // Set
                shoot.style.right = '78px';

                console.log("Shoot moved to the right.");
            } else {
                console.error('Shoot element not found.');
            }

            if (boost) {
                // Reset
                boost.style.left = '';

                // Set
                boost.style.right = '8px';

                console.log("Boost moved to the right.");
            } else {
                console.error('Boost element not found.');
            }

            if (siren) {
                // Reset
                siren.style.left = '';

                // Set
                siren.style.right = '78px';

                console.log("Siren moved to the right.");
            } else {
                console.error('Siren element not found.');
            }

            if (forward) {
                // Reset
                forward.style.left = '';

                // Set
                forward.style.right = '8px';

                console.log("Forward moved to the right.");
            } else {
                console.error('Forward element not found.');
            }

            if (backward) {
                // Reset
                backward.style.left = '';

                // Set
                backward.style.right = '78px';

                console.log("Backward moved to the right.");
            } else {
                console.error('Backward element not found.');
            }

            if (brake) {
                // Reset
                brake.style.left = '';

                // Set
                brake.style.right = '8px';

                console.log("Brake moved to the right.");
            } else {
                console.error('Brake element not found.');
            }
        }

        // Add event listener for the "Right" button
        // document.getElementById('move-joystick-left').addEventListener('click', moveJoystickLeft.bind(this));

        /**
         * Switch
         */

        const switchButton = document.getElementById('switch');
        const switchToggle = document.getElementById('switch-toggle');
        let isToggled = false;

        // Select the elements to be toggled
        const targetPlayerId = document.getElementById('target-player-id');
        const inviteButton = document.getElementById('invite-button');
        const addContact = document.getElementById('friend-invite-button');
        const contactList = document.getElementById('toggle-contact-list');
        const settings = document.getElementById('toggle-settings');
        const party = document.getElementById('toggle-party-list');
        const touchRadio = document.getElementById('touch-radio');
        const touchMute = document.getElementById('touch-mute');
        const touchSlider = document.getElementById('touch-slider');
        const touchPrevious = document.getElementById('touch-previous');
        const touchNext = document.getElementById('touch-next');
        const partyInfo = document.getElementById('party-info');


        // Toggle function to move the square and toggle visibility of elements
        switchButton.addEventListener('click', () => {
            isToggled = !isToggled;

            if (isToggled) {
                switchToggle.style.left = '22px';  // Move square to the right
                switchButton.style.backgroundColor = 'rgba(0, 0, 0, 0.2);';  // Change background color when toggled
                switchButton.style.backdropFilter = 'blur(5px)';

                // Show elements
                targetPlayerId.style.display = 'block';
                inviteButton.style.display = 'flex';
                addContact.style.display = 'flex';
                touchRadio.style.display = 'block';
                touchMute.style.display = 'block';
                touchSlider.style.display = 'block';
                touchPrevious.style.display = 'block';
                touchNext.style.display = 'block';
                contactList.style.display = 'flex';
                settings.style.display = 'flex';
                party.style.display = 'flex';

                // if (touchContacts) {
                //     touchContacts.style.display = 'flex';
                // } else {
                //     touchContacts.style.display = 'none'
                // }

                if (party) {
                    party.style.display = 'flex';
                }

            } else {
                switchToggle.style.left = '5px';   // Move square back to the left
                switchButton.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';  // Revert background color
                switchButton.style.backdropFilter = 'blur(5px)';

                // Hide elements
                targetPlayerId.style.display = 'none';
                inviteButton.style.display = 'none';
                addContact.style.display = 'none';
                touchRadio.style.display = 'none';
                touchMute.style.display = 'none';
                touchSlider.style.display = 'none';
                touchPrevious.style.display = 'none';
                touchNext.style.display = 'none';
                contactList.style.display = 'none';
                settings.style.display = 'none';
                // touchContacts.style.display = 'none';
                party.style.display = 'none';

            }
        });

        /**
         * Radio with Power On/Off, Vinyl Animation, and Tiny Needle with Top-Side Rotation
         */
        this.touch.radio = {};

        // Element
        this.touch.radio.$element = document.getElementById('touch-radio');
        this.touch.radio.$element.id = 'touch-radio';
        this.touch.radio.$element.style.userSelect = 'none';
        this.touch.radio.$element.style.position = 'fixed';
        this.touch.radio.$element.style.bottom = 'calc(70px * 3 + 15px)';
        this.touch.radio.$element.style.left = 'calc(50% - 35px)';
        this.touch.radio.$element.style.width = '65px';
        this.touch.radio.$element.style.height = '65px';
        this.touch.radio.$element.style.transition = 'opacity 0.3s 0.4s';
        this.touch.radio.$element.style.willChange = 'opacity';
        this.touch.radio.$element.style.opacity = '0';
        document.body.appendChild(this.touch.radio.$element);

        this.touch.radio.$border = document.createElement('div');
        this.touch.radio.$border.style.position = 'absolute';
        this.touch.radio.$border.style.top = 'calc(50% - 30px)';
        this.touch.radio.$border.style.left = 'calc(50% - 35px)';
        this.touch.radio.$border.style.width = '130px';
        this.touch.radio.$border.style.height = '65px';
        this.touch.radio.$border.style.border = 'unset';
        this.touch.radio.$border.style.background = 'rgba(0, 0, 0, 0.5)';
        this.touch.radio.$border.style.borderRadius = '5px';
        this.touch.radio.$border.style.boxSizing = 'border-box';
        this.touch.radio.$border.style.opacity = '0.25';
        this.touch.radio.$border.style.willChange = 'opacity';
        this.touch.radio.$element.appendChild(this.touch.radio.$border);

        this.touch.radio.$icon = document.createElement('div');
        this.touch.radio.$icon.style.position = 'absolute';
        this.touch.radio.$icon.style.top = 'calc(50% - 7px)';
        this.touch.radio.$icon.style.left = 'calc(50% + 20px)';
        this.touch.radio.$icon.style.width = '40px';
        this.touch.radio.$icon.style.height = '40px';
        // Radio image
        this.touch.radio.$icon.style.backgroundImage = `url(${radio})`;
        this.touch.radio.$icon.style.backgroundSize = 'cover';
        this.touch.radio.$element.appendChild(this.touch.radio.$icon);

        // Needle handler
        this.touch.radio.$tinyNeedleHandler = document.createElement('div');
        this.touch.radio.$tinyNeedleHandler.style.position = 'absolute';
        this.touch.radio.$tinyNeedleHandler.style.top = '66px'; // Adjust the top position inside the main needle
        this.touch.radio.$tinyNeedleHandler.style.left = '45px'; // Adjust the left position inside the main needle
        this.touch.radio.$tinyNeedleHandler.style.width = '10px';
        this.touch.radio.$tinyNeedleHandler.style.height = '10px';
        this.touch.radio.$tinyNeedleHandler.style.background = 'rgba(0, 0, 0, 0.5)'; // Lighter color for the tiny needle
        this.touch.radio.$tinyNeedleHandler.style.borderRadius = '1px';
        // this.touch.radio.$tinyNeedleHandler.style.transform = 'rotate(130deg)';
        this.touch.radio.$element.appendChild(this.touch.radio.$tinyNeedleHandler); // Attach the tiny needle to the main needle

        // Needle Element
        this.touch.radio.$needle = document.createElement('div');
        this.touch.radio.$needle.style.position = 'absolute';
        this.touch.radio.$needle.style.top = 'calc(50% + 39px)';
        this.touch.radio.$needle.style.left = 'calc(50% + 15px)';
        this.touch.radio.$needle.style.width = '4px';
        this.touch.radio.$needle.style.height = '25px';
        this.touch.radio.$needle.style.background = 'rgba(255, 255, 255, 0.8)';
        this.touch.radio.$needle.style.borderRadius = '3px';
        this.touch.radio.$needle.style.transition = 'transform 0.3s ease';
        this.touch.radio.$needle.style.transform = 'rotate(90deg)'; // Default "off" position
        this.touch.radio.$needle.style.transformOrigin = 'top';  // Rotate from the top
        this.touch.radio.$element.appendChild(this.touch.radio.$needle);

        // Tiny Needle Element (attached to the main needle)
        this.touch.radio.$tinyNeedle = document.createElement('div');
        this.touch.radio.$tinyNeedle.style.position = 'absolute';
        this.touch.radio.$tinyNeedle.style.top = '23px'; // Adjust the top position inside the main needle
        this.touch.radio.$tinyNeedle.style.left = '1.5px'; // Adjust the left position inside the main needle
        this.touch.radio.$tinyNeedle.style.width = '1px';
        this.touch.radio.$tinyNeedle.style.height = '4px';
        this.touch.radio.$tinyNeedle.style.background = 'rgba(200, 200, 200, 0.5)'; // Lighter color for the tiny needle
        this.touch.radio.$tinyNeedle.style.borderRadius = '2px';
        this.touch.radio.$needle.appendChild(this.touch.radio.$tinyNeedle); // Attach the tiny needle to the main needle

        // Radio Power State
        this.radioPower = false;  // Power off by default

        // Toggle Power Function
        this.toggleRadioPower = () => {
            this.radioPower = !this.radioPower;

            if (this.radioPower) {
                // Power on: Spin vinyl and move needle
                this.touch.radio.$icon.style.animation = 'spin 3s linear infinite';
                this.touch.radio.$needle.style.transform = 'rotate(130deg)';
                this.sounds.cycleRadioChannel();
                console.log('Radio powered on');
            } else {
                // Power off: Stop spinning and reset needle
                this.touch.radio.$icon.style.animation = 'none';
                this.touch.radio.$needle.style.transform = 'rotate(90deg)';
                this.sounds.radio.sound.stop()
                console.log('Radio powered off');
            }
        };

        // CSS Animation for Spinning
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styleSheet);

        // Events
        this.touch.radio.events = {};
        this.touch.radio.touchIdentifier = null;
        this.touch.radio.events.touchstart = (_event) => {
            _event.preventDefault();

            const touch = _event.changedTouches[0];
            if (touch) {
                this.touch.radio.touchIdentifier = touch.identifier;

                // Toggle radio power on/off
                this.toggleRadioPower();

                document.addEventListener('touchend', this.touch.radio.events.touchend);
            }
        };

        this.touch.radio.events.touchend = (_event) => {
            const touches = [..._event.changedTouches];
            const touch = touches.find((_touch) => _touch.identifier === this.touch.radio.touchIdentifier);

            if (touch) {
                document.removeEventListener('touchend', this.touch.radio.events.touchend);
            }
        };

        this.touch.radio.$element.addEventListener('touchstart', this.touch.radio.events.touchstart);



        /**
         * Reset
         */
        this.touch.reset = {};

        // Element
        this.touch.reset.$element = document.createElement('div');
        this.touch.reset.$element.id = 'touch-reset';
        this.touch.reset.$element.style.userSelect = 'none';
        this.touch.reset.$element.style.position = 'fixed';
        // this.touch.reset.$element.style.bottom = '175px';
        // this.touch.reset.$element.style.left = '80px';

        const initialReset = this.slotPositions.slot8;
        this.touch.reset.$element.style.bottom = initialReset.bottom;
        this.touch.reset.$element.style.left = initialReset.left;

        this.touch.reset.$element.style.width = '95px';
        this.touch.reset.$element.style.height = '70px';
        this.touch.reset.$element.style.transition = 'opacity 0.3s 0.4s';
        this.touch.reset.$element.style.willChange = 'opacity';
        this.touch.reset.$element.style.opacity = '0';
        // this.touch.reset.$element.style.backgroundColor = '#00ff00'; // Uncomment for visual debugging
        document.body.appendChild(this.touch.reset.$element);

        // Create a separate label for the slot
        const resetLabel = document.createElement('span');
        resetLabel.id = 'reset-label';
        resetLabel.textContent = '7';
        resetLabel.style.position = 'fixed';
        resetLabel.style.bottom = '182px';
        resetLabel.style.left = '105px';
        resetLabel.style.color = 'white';
        resetLabel.style.fontSize = '10px';
        resetLabel.style.pointerEvents = 'none';
        resetLabel.style.opacity = '0';

        // Append the label to document.body
        document.body.appendChild(resetLabel);

        this.touch.reset.$border = document.createElement('div');
        this.touch.reset.$border.style.position = 'absolute';
        this.touch.reset.$border.style.top = 'calc(50% - 30px)';
        this.touch.reset.$border.style.left = 'calc(50% - 30px)';
        this.touch.reset.$border.style.width = '60px';
        this.touch.reset.$border.style.height = '60px';
        this.touch.reset.$border.style.border = 'unset';
        this.touch.reset.$border.style.background = 'rgba(0, 0, 0, 0.5)'
        this.touch.reset.$border.style.borderRadius = '10px';
        this.touch.reset.$border.style.boxSizing = 'border-box';
        this.touch.reset.$border.style.opacity = '0.25';
        this.touch.reset.$border.style.willChange = 'opacity';
        this.touch.reset.$element.appendChild(this.touch.reset.$border);

        this.touch.reset.$icon = document.createElement('div');
        this.touch.reset.$icon.style.position = 'absolute';
        this.touch.reset.$icon.style.top = 'calc(50% - 13px)';
        this.touch.reset.$icon.style.left = 'calc(50% - 11px)';
        this.touch.reset.$icon.style.width = '22px';
        this.touch.reset.$icon.style.height = '26px';
        this.touch.reset.$icon.style.backgroundImage = `url(${restart})`; // Change the icon as needed
        this.touch.reset.$icon.style.backgroundSize = 'cover';
        this.touch.reset.$element.appendChild(this.touch.reset.$icon);

        // Append to body
        document.body.appendChild(this.touch.reset.$element)

        // Events
        this.touch.reset.events = {};
        this.touch.reset.touchIdentifier = null;
        this.touch.reset.events.touchstart = (_event) => {
            _event.preventDefault();

            const touch = _event.changedTouches[0];

            if (touch) {
                this.touch.reset.touchIdentifier = touch.identifier;

                this.trigger('action', ['reset']);

                this.touch.reset.$border.style.opacity = '0.5';

                document.addEventListener('touchend', this.touch.reset.events.touchend);
            }
        };

        this.touch.reset.events.touchend = (_event) => {
            const touches = [..._event.changedTouches];
            const touch = touches.find((_touch) => _touch.identifier === this.touch.reset.touchIdentifier);

            if (touch) {
                this.touch.reset.$border.style.opacity = '0.25';

                document.removeEventListener('touchend', this.touch.reset.events.touchend);
            }
        };

        this.touch.reset.$element.addEventListener('touchstart', this.touch.reset.events.touchstart);

        /**
         * Camera
         */

        this.touch.camera = {};

        // Element
        this.touch.camera.$element = document.createElement('div');
        this.touch.camera.$element.id = 'camera-view';
        this.touch.camera.$element.style.userSelect = 'none';
        this.touch.camera.$element.style.position = 'fixed';
        // this.touch.camera.$element.style.bottom = '175px';
        // this.touch.camera.$element.style.left = '10px';

        const initialCamera = this.slotPositions.slot7;
        this.touch.camera.$element.style.bottom = initialCamera.bottom;
        this.touch.camera.$element.style.left = initialCamera.left;

        this.touch.camera.$element.style.width = '95px';
        this.touch.camera.$element.style.height = '70px';
        this.touch.camera.$element.style.transition = 'opacity 0.3s 0.4s';
        this.touch.camera.$element.style.willChange = 'opacity';
        this.touch.camera.$element.style.opacity = '0';

        this.touch.camera.$border = document.createElement('div');
        this.touch.camera.$border.style.position = 'absolute';
        this.touch.camera.$border.style.top = 'calc(50% - 30px)';
        this.touch.camera.$border.style.left = 'calc(50% - 30px)';
        this.touch.camera.$border.style.width = '60px';
        this.touch.camera.$border.style.height = '60px';
        this.touch.camera.$border.style.border = 'unset';
        this.touch.camera.$border.style.background = 'rgba(0, 0, 0, 0.5)';
        this.touch.camera.$border.style.borderRadius = '10px';
        this.touch.camera.$border.style.boxSizing = 'border-box';
        this.touch.camera.$border.style.opacity = '0.25';
        this.touch.camera.$border.style.willChange = 'opacity';
        this.touch.camera.$element.appendChild(this.touch.camera.$border);

        this.touch.camera.$icon = document.createElement('div');
        this.touch.camera.$icon.style.position = 'absolute';
        this.touch.camera.$icon.style.top = 'calc(50% - 13px)';
        this.touch.camera.$icon.style.left = 'calc(50% - 11px)';
        this.touch.camera.$icon.style.width = '22px';
        this.touch.camera.$icon.style.height = '26px';
        this.touch.camera.$icon.style.backgroundImage = `url(${monitoring})`;
        this.touch.camera.$icon.style.backgroundSize = 'cover';
        this.touch.camera.$element.appendChild(this.touch.camera.$icon);

        // Create a separate label for the slot
        const cameraLabel = document.createElement('span');
        cameraLabel.id = 'camera-label';
        cameraLabel.textContent = '8';
        cameraLabel.style.position = 'fixed';
        cameraLabel.style.bottom = '182px';
        cameraLabel.style.left = '35px';
        cameraLabel.style.color = 'white';
        cameraLabel.style.fontSize = '10px';
        cameraLabel.style.pointerEvents = 'none';
        cameraLabel.style.opacity = '0';

        // Append the label to document.body
        document.body.appendChild(cameraLabel);

        // Append to body
        document.body.appendChild(this.touch.camera.$element);

        // Events
        this.touch.camera.events = {};
        this.touch.camera.touchIdentifier = null;

        this.touch.camera.events.touchstart = (_event) => {
            _event.preventDefault();

            const touch = _event.changedTouches[0];

            if (touch) {
                this.touch.camera.touchIdentifier = touch.identifier;

                // Toggle the camera type
                if (!this.camera.actionInProgress) {
                    this.camera.actionInProgress = true; // Prevent multiple toggles
                    this.camera.triggerCameraAction(() => {
                        this.camera.actionInProgress = false; // Reset the flag
                    });
                }

                // this.touch.camera.$element.style.opacity = '0.5';

                document.addEventListener('touchend', this.touch.camera.events.touchend);
            }
        };

        this.touch.camera.events.touchend = (_event) => {
            const touches = [..._event.changedTouches];
            const touch = touches.find((_touch) => _touch.identifier === this.touch.camera.touchIdentifier);

            if (touch) {
                // this.touch.camera.$element.style.opacity = '0.25';

                document.removeEventListener('touchend', this.touch.camera.events.touchend);
            }
        };

        this.touch.camera.$element.addEventListener('touchstart', this.touch.camera.events.touchstart);

        // Function to toggle camera types
        this.cycleCameraType = () => {
            if (!this.camera) return;

            if (this.camera.type === 'perspective') {
                this.camera.setOrthographic();
            } else if (this.camera.type === 'orthographic') {
                this.camera.setBirdsEye();
            } else {
                this.camera.setPerspective();
            }
        };

        // /**
        //  * Camera
        //  */

        // this.touch.camera = {}

        // // Element

        // this.touch.camera.$element = document.createElement('div')
        // this.touch.camera.$element.id = 'camera-view'
        // this.touch.camera.$element.style.userSelect = 'none'
        // this.touch.camera.$element.style.position = 'fixed'
        // this.touch.camera.$element.style.bottom = '175px'
        // this.touch.camera.$element.style.left = '10px'
        // this.touch.camera.$element.style.width = '95px'
        // this.touch.camera.$element.style.height = '70px'
        // this.touch.camera.$element.style.transition = 'opacity 0.3s 0.4s'
        // this.touch.camera.$element.style.willChange = 'opacity'
        // this.touch.camera.$element.style.opacity = '0'

        // this.touch.camera.$border = document.createElement('div')
        // this.touch.camera.$border.style.position = 'absolute'
        // this.touch.camera.$border.style.top = 'calc(50% - 30px)'
        // this.touch.camera.$border.style.left = 'calc(50% - 30px)'
        // this.touch.camera.$border.style.width = '60px'
        // this.touch.camera.$border.style.height = '60px'
        // this.touch.camera.$border.style.border = 'unset'
        // this.touch.camera.$border.style.background = 'rgba(0, 0, 0, 0.5)'
        // this.touch.camera.$border.style.borderRadius = '10px'
        // this.touch.camera.$border.style.boxSizing = 'border-box'
        // this.touch.camera.$border.style.opacity = '0.25'
        // this.touch.camera.$border.style.willChange = 'opacity'
        // this.touch.camera.$element.appendChild(this.touch.camera.$border)

        // this.touch.camera.$icon = document.createElement('div')
        // this.touch.camera.$icon.style.position = 'absolute'
        // this.touch.camera.$icon.style.top = 'calc(50% - 13px)'
        // this.touch.camera.$icon.style.left = 'calc(50% - 11px)'
        // this.touch.camera.$icon.style.width = '22px'
        // this.touch.camera.$icon.style.height = '26px'
        // this.touch.camera.$icon.style.backgroundImage = `url(${monitoring})`
        // this.touch.camera.$icon.style.backgroundSize = 'cover'
        // this.touch.camera.$element.appendChild(this.touch.camera.$icon)

        // // Append to body
        // document.body.appendChild(this.touch.camera.$element)

        // // Events
        // this.touch.camera.events = {}
        // this.touch.camera.touchIdentifier = null

        // this.touch.camera.events.touchstart = (_event) => {
        //     _event.preventDefault()

        //     const touch = _event.changedTouches[0]

        //     if(touch) {
        //         this.touch.camera.touchIdentifier = touch.identifier

        //         // Cycle through camera types
        //         this.cycleCameraType()

        //         // this.touch.camera.$element.style.opacity = '0.5'

        //         document.addEventListener('touchend', this.touch.camera.events.touchend)
        //     }
        // }

        // this.touch.camera.events.touchend = (_event) => {
        //     const touches = [..._event.changedTouches]
        //     const touch = touches.find((_touch) => _touch.identifier === this.touch.camera.touchIdentifier)

        //     if(touch) {
        //         // this.touch.camera.$element.style.opacity = '0.25'

        //         document.removeEventListener('touchend', this.touch.camera.events.touchend)
        //     }
        // }

        // this.touch.camera.$element.addEventListener('touchstart', this.touch.camera.events.touchstart)

        // // Function to cycle camera types
        // this.cycleCameraType = () => {

        //     if (!this.camera) return

        //     if (this.camera.type === 'perspective') {
        //         this.camera.setOrthographic()
        //     } else if (this.camera.type === 'orthographic') {
        //         this.camera.setBirdsEye()
        //     } else {
        //         this.camera.setPerspective()
        //     }
        // }

        /**
         * Previous
         */

        this.touch.previous = {};

        // Element
        this.touch.previous.$element = document.getElementById('touch-previous');
        this.touch.previous.$element.id = 'touch-previous';
        this.touch.previous.$element.style.userSelect = 'none';
        // this.touch.previous.$element.style.display = 'none';
        this.touch.previous.$element.style.position = 'absolute';
        this.touch.previous.$element.style.top = '20px';
        this.touch.previous.$element.style.left = '312px';
        this.touch.previous.$element.style.width = '50px';
        this.touch.previous.$element.style.height = '50px';
        this.touch.previous.$element.style.transition = 'opacity 0.3s 0.4s';
        this.touch.previous.$element.style.willChange = 'opacity';
        this.touch.previous.$element.style.opacity = '0';
        // this.touch.previous.$element.style.backgroundColor = '#00ff00'; // Uncomment for visual debugging
        document.body.appendChild(this.touch.previous.$element);

        this.touch.previous.$border = document.createElement('div');
        this.touch.previous.$border.style.position = 'absolute';
        this.touch.previous.$border.style.top = 'calc(50% - 30px)';
        this.touch.previous.$border.style.left = 'calc(50% - 30px)';
        this.touch.previous.$border.style.width = '30px';
        this.touch.previous.$border.style.height = '25px';
        this.touch.previous.$border.style.border = 'unset';
        this.touch.previous.$border.style.borderRadius = '5px';
        this.touch.previous.$border.style.boxSizing = 'border-box';
        this.touch.previous.$border.style.opacity = '0.5';
        this.touch.previous.$border.style.background = 'rgba(0, 0, 0)';
        this.touch.previous.$border.style.backdropFilter = 'blur(5px)';
        this.touch.previous.$border.style.willChange = 'opacity';
        this.touch.previous.$element.appendChild(this.touch.previous.$border);

        this.touch.previous.$icon = document.createElement('div');
        this.touch.previous.$icon.style.position = 'absolute';
        this.touch.previous.$icon.style.top = '-1px';
        this.touch.previous.$icon.style.left = '3px';
        this.touch.previous.$icon.style.width = '15px';
        this.touch.previous.$icon.style.height = '15px';
        this.touch.previous.$icon.style.backgroundImage = `url(${previousIcon})`; // Provide a zoom in icon image path
        this.touch.previous.$icon.style.backgroundSize = 'cover';
        this.touch.previous.$element.appendChild(this.touch.previous.$icon);

        // Append to body
        document.body.appendChild(this.touch.previous.$element)

        // Events
        this.touch.previous.events = {};
        this.touch.previous.touchIdentifier = null;
        this.touch.previous.events.touchstart = (_event) => {
            _event.preventDefault();

            const touch = _event.changedTouches[0];

            if (touch) {
                this.touch.previous.touchIdentifier = touch.identifier;

                this.camera.zoom.targetValue = Math.max(0, this.camera.zoom.targetValue - 0.1);

                this.touch.previous.$border.style.opacity = '0.5';

                document.addEventListener('touchend', this.touch.previous.events.touchend);
            }
        };

        this.touch.previous.events.touchend = (_event) => {
            const touches = [..._event.changedTouches];
            const touch = touches.find((_touch) => _touch.identifier === this.touch.previous.touchIdentifier);

            if (touch) {
                this.touch.previous.$border.style.opacity = '0.5';

                document.removeEventListener('touchend', this.touch.previous.events.touchend);
            }
        };

        this.touch.previous.$element.addEventListener('touchstart', this.touch.previous.events.touchstart);

        /**
         * Next
         */
        this.touch.next = {};

        // Element
        this.touch.next.$element = document.getElementById('touch-next');
        this.touch.next.$element.id = 'touch-next';
        this.touch.next.$element.style.userSelect = 'none';
        // this.touch.next.$element.style.display = 'none';
        this.touch.next.$element.style.position = 'absolute';
        this.touch.next.$element.style.top = '20px';
        this.touch.next.$element.style.left = '346px'; // Adjust the position as needed
        this.touch.next.$element.style.width = '50px';
        this.touch.next.$element.style.height = '50px';
        this.touch.next.$element.style.transition = 'opacity 0.3s 0.4s';
        this.touch.next.$element.style.willChange = 'opacity';
        this.touch.next.$element.style.opacity = '0';
        // this.touch.next.$element.style.backgroundColor = '#000'; // Uncomment for visual debugging
        document.body.appendChild(this.touch.next.$element);

        this.touch.next.$border = document.createElement('div');
        this.touch.next.$border.style.position = 'absolute';
        this.touch.next.$border.style.top = 'calc(50% - 30px)';
        this.touch.next.$border.style.left = 'calc(50% - 30px)';
        this.touch.next.$border.style.width = '30px';
        this.touch.next.$border.style.height = '25px';
        this.touch.next.$border.style.border = 'unset';
        this.touch.next.$border.style.borderRadius = '5px';
        this.touch.next.$border.style.boxSizing = 'border-box';
        this.touch.next.$border.style.opacity = '0.5';
        this.touch.next.$border.style.background = 'rgba(0, 0, 0)';
        this.touch.next.$border.style.backdropFilter = 'blur(5px)';
        this.touch.next.$border.style.willChange = 'opacity';
        this.touch.next.$element.appendChild(this.touch.next.$border);

        this.touch.next.$icon = document.createElement('div');
        this.touch.next.$icon.style.position = 'absolute';
        this.touch.next.$icon.style.top = '-1px';
        this.touch.next.$icon.style.left = '3px';
        this.touch.next.$icon.style.width = '15px';
        this.touch.next.$icon.style.height = '15px';
        this.touch.next.$icon.style.backgroundImage = `url(${nextIcon})`; // Provide a zoom out icon image path
        this.touch.next.$icon.style.backgroundSize = 'cover';
        this.touch.next.$element.appendChild(this.touch.next.$icon);

        // Append to body
        document.body.appendChild(this.touch.next.$element)

        // Events
        this.touch.next.events = {};
        this.touch.next.touchIdentifier = null;
        this.touch.next.events.touchstart = (_event) => {
            _event.preventDefault();

            const touch = _event.changedTouches[0];

            if (touch) {
                this.touch.next.touchIdentifier = touch.identifier;

                this.camera.zoom.targetValue = Math.min(1, this.camera.zoom.targetValue + 0.1);

                this.touch.next.$border.style.opacity = '0.5';

                document.addEventListener('touchend', this.touch.next.events.touchend);
            }
        };

        this.touch.next.events.touchend = (_event) => {
            const touches = [..._event.changedTouches];
            const touch = touches.find((_touch) => _touch.identifier === this.touch.next.touchIdentifier);

            if (touch) {
                this.touch.next.$border.style.opacity = '0.5';

                document.removeEventListener('touchend', this.touch.next.events.touchend);
            }
        };

        this.touch.next.$element.addEventListener('touchstart', this.touch.next.events.touchstart);
        
        /**
         * Zoom Slider
         */
        this.touch.zoomSlider = {};

        // Element
        this.touch.zoomSlider.$element = document.getElementById('touch-slider');
        this.touch.zoomSlider.$element.type = 'range';
        this.touch.zoomSlider.$element.min = '0';
        this.touch.zoomSlider.$element.max = '1';
        this.touch.zoomSlider.$element.step = '0.01';
        this.touch.zoomSlider.$element.value = this.camera.zoom.targetValue;
        this.touch.zoomSlider.$element.style.userSelect = 'none';
        this.touch.zoomSlider.$element.style.position = 'absolute';
        this.touch.zoomSlider.$element.style.top = '125px';
        this.touch.zoomSlider.$element.style.left = '23px';
        this.touch.zoomSlider.$element.style.width = '145px';
        this.touch.zoomSlider.$element.style.height = '20px';
        this.touch.zoomSlider.$element.style.transition = 'opacity 0.3s 0.4s';
        this.touch.zoomSlider.$element.style.willChange = 'opacity';
        this.touch.zoomSlider.$element.style.opacity = '0';
        document.body.appendChild(this.touch.zoomSlider.$element);

        // Add custom styles for the slider
        const sliderStyle = document.createElement('style');
        sliderStyle.innerHTML = `
            input[type="range"] {
                -webkit-appearance: none;
                width: 100%;
                height: 2px;
                background: transparent; /* Track color */
                outline: none;
                opacity: 0.7;
                transition: opacity .2s;
                opacity: 0.7

            }

            input[type="range"]:hover {
                opacity: 1;
            }

            input[type="range"]::-webkit-slider-runnable-track {
                width: 100%;
                height: 2px;
                cursor: pointer;
                animate: 0.2s;
                background: #fff; /* Track color */
                border-radius: 5px;
            }

            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 10px;
                width: 10px;
                border-radius: unset;
                background: #FF5733; /* Thumb color */
                cursor: pointer;
                margin-top: -5px; /* Align thumb with the track */
            }

            input[type="range"]::-moz-range-track {
                width: 100%;
                height: 2px;
                cursor: pointer;
                animate: 0.2s;
                background: #007bff; /* Track color */
                border-radius: 5px;
            }

            input[type="range"]::-moz-range-thumb {
                height: 10px;
                width: 10px;
                border-radius: unset;
                background: #8CFF80; /* Thumb color */
                cursor: pointer;
            }
        `;
    document.head.appendChild(sliderStyle);

    // Event listener for slider change
    this.touch.zoomSlider.$element.addEventListener('input', (_event) => {
        const value = parseFloat(_event.target.value);
        this.camera.zoom.targetValue = value;
    });

    // Append to body
    document.body.appendChild(this.touch.zoomSlider.$element);


        /**
         * Mute
         */

        this.touch.mute = {
            isActive: false,
        };

        // Element
        this.touch.mute.$element = document.getElementById('touch-mute');
        this.touch.mute.$element.style.userSelect = 'none';
        this.touch.mute.$element.style.position = 'absolute';
        // this.touch.mute.$element.style.bottom = '145px';
        // this.touch.mute.$element.style.left = '47px'; // Adjust the position as needed
        this.touch.mute.$element.style.width = '65px';
        this.touch.mute.$element.style.height = '20px';
        this.touch.mute.$element.style.transition = 'opacity 0.3s 0.4s';
        this.touch.mute.$element.style.willChange = 'opacity';
        this.touch.mute.$element.style.opacity = '0';
        // this.touch.mute.$element.style.backgroundColor = '#00ff00'; // Uncomment for visual debugging
        document.body.appendChild(this.touch.mute.$element);

        this.touch.mute.$border = document.createElement('div');
        this.touch.mute.$border.style.position = 'absolute';
        this.touch.mute.$border.style.top = 'calc(50% - 30px)';
        this.touch.mute.$border.style.left = 'calc(50% - 30px)';
        this.touch.mute.$border.style.width = '65px';
        this.touch.mute.$border.style.height = '20px';
        this.touch.mute.$border.style.border = 'unset';
        this.touch.mute.$border.style.background = 'rgba(0, 0, 0, 0.5)'
        this.touch.mute.$border.style.borderRadius = '5px';
        this.touch.mute.$border.style.boxSizing = 'border-box';
        this.touch.mute.$border.style.opacity = '1';
        // this.touch.mute.$border.style.innerHTML = 'MUTE';
        this.touch.mute.$border.style.willChange = 'opacity';
        this.touch.mute.$element.appendChild(this.touch.mute.$border);

        this.touch.mute.$icon = document.createElement('div');
        this.touch.mute.$icon.style.position = 'absolute';
        this.touch.mute.$icon.style.top = 'calc(50% - 28px)';
        this.touch.mute.$icon.style.left = 'calc(50% - 5px)';
        this.touch.mute.$icon.style.width = '12px';
        this.touch.mute.$icon.style.height = '16px';
        this.touch.mute.$icon.style.backgroundImage = `url(${muteIcon})`; // Provide a zoom in icon image path
        this.touch.mute.$icon.style.backgroundSize = 'cover';
        this.touch.mute.$element.appendChild(this.touch.mute.$icon);

        // Append to body
        document.body.appendChild(this.touch.mute.$element)

        // Toggle background color based on isActive flag
        const updateMuteButtonStyle = () => {
            this.touch.mute.$border.style.background = this.touch.mute.isActive ? 'rgba(255, 87, 51, 0.7)' : 'rgba(0, 0, 0, 0.5)';
        };

        // Events
        this.touch.mute.events = {};
        this.touch.mute.touchIdentifier = null;

        this.touch.mute.events.touchstart = (_event) => {
            _event.preventDefault();

            const touch = _event.changedTouches[0];

            if (touch) {
                this.touch.mute.touchIdentifier = touch.identifier;

                // Toggle mute state
                this.sounds.muted = !this.sounds.muted;
                Howler.mute(this.sounds.muted);

                // Toggle isActive flag
                this.touch.mute.isActive = !this.touch.mute.isActive;

                // Toggle mute state
                this.sounds.muted = this.touch.mute.isActive;
                Howler.mute(this.sounds.muted);

                // Update button style
                updateMuteButtonStyle();

                this.touch.mute.$border.style.opacity = '0.5';

                document.addEventListener('touchend', this.touch.mute.events.touchend);
            }
        };

        this.touch.mute.events.touchend = (_event) => {
            const touches = [..._event.changedTouches];
            const touch = touches.find((_touch) => _touch.identifier === this.touch.mute.touchIdentifier);

            if (touch) {
                this.touch.mute.$border.style.opacity = '1';

                // Ensure style update
                updateMuteButtonStyle();

                document.removeEventListener('touchend', this.touch.mute.events.touchend);
            }
        };

        this.touch.mute.$element.addEventListener('touchstart', this.touch.mute.events.touchstart);

        /**
         * Siren
         */

        this.touch.siren = {};

        // Element
        this.touch.siren.$element = document.createElement('div');
        this.touch.siren.$element.style.userSelect = 'none';
        this.touch.siren.$element.style.position = 'absolute';
        // this.touch.siren.$element.style.bottom = '98px';
        // this.touch.siren.$element.style.right = '78px';

        const initialSiren = this.slotPositions.slot3;
        this.touch.siren.$element.style.bottom = initialSiren.bottom;
        this.touch.siren.$element.style.right = initialSiren.right;

        this.touch.siren.$element.style.width = '95px';
        this.touch.siren.$element.style.height = '70px';
        this.touch.siren.$element.style.transition = 'opacity 0.3s 0.4s';
        this.touch.siren.$element.style.willChange = 'opacity';
        this.touch.siren.$element.style.opacity = '0';
        // this.touch.siren.$element.style.backgroundColor = '#00ff00'; // Uncomment for visual debugging
        document.body.appendChild(this.touch.siren.$element);

        // Create a separate label for the slot
        const sirenLabel = document.createElement('span');
        sirenLabel.id = 'siren-label';
        sirenLabel.textContent = '3';
        sirenLabel.style.position = 'fixed';
        sirenLabel.style.bottom = '145px';
        sirenLabel.style.right = '143px';
        sirenLabel.style.color = 'white';
        sirenLabel.style.fontSize = '10px';
        sirenLabel.style.pointerEvents = 'none';
        sirenLabel.style.opacity = '0';

        // Append the label to document.body
        document.body.appendChild(sirenLabel);

        this.touch.siren.$border = document.createElement('div');
        this.touch.siren.$border.style.position = 'absolute';
        this.touch.siren.$border.style.top = 'calc(50% - 30px)';
        this.touch.siren.$border.style.left = 'calc(50% - 30px)';
        this.touch.siren.$border.style.width = '60px';
        this.touch.siren.$border.style.height = '60px';
        this.touch.siren.$border.style.border = 'unset';
        this.touch.siren.$border.style.background = 'rgba(0, 0, 0, 0.5)'
        this.touch.siren.$border.style.borderRadius = '10px';
        this.touch.siren.$border.style.boxSizing = 'border-box';
        this.touch.siren.$border.style.opacity = '0.25';
        this.touch.siren.$border.style.willChange = 'opacity';
        this.touch.siren.$element.appendChild(this.touch.siren.$border);

        this.touch.siren.$icon = document.createElement('div');
        this.touch.siren.$icon.style.position = 'absolute';
        this.touch.siren.$icon.style.top = 'calc(50% - 13px)';
        this.touch.siren.$icon.style.left = 'calc(50% - 11px)';
        this.touch.siren.$icon.style.width = '22px';
        this.touch.siren.$icon.style.height = '26px';
        this.touch.siren.$icon.style.backgroundImage = `url(${sirenIcon})`; // Provide a zoom in icon image path
        this.touch.siren.$icon.style.backgroundSize = 'cover';
        this.touch.siren.$element.appendChild(this.touch.siren.$icon);

        // Append to body
        document.body.appendChild(this.touch.siren.$element)

        // Events
        this.touch.siren.events = {};
        this.touch.siren.touchIdentifier = null;

        this.touch.siren.events.touchstart = (_event) => {
            this.actions.siren = true;
            _event.preventDefault();

            const touch = _event.changedTouches[0];

            if (touch) {
                this.touch.siren.touchIdentifier = touch.identifier;

                // Play random horn sound
                const hornIndices = [12, 13, 14]; // Indices for carHorn1, carHorn2, carHorn3
                const randomIndex = hornIndices[Math.floor(Math.random() * hornIndices.length)];
                this.sounds.play(this.sounds.items[randomIndex].name);

                this.touch.siren.$border.style.opacity = '0.5';

                // Add a delay to allow the state to update before the next check
                setTimeout(() => {
                    console.log("Waiting before next status check...");
                }, 500); // 500 ms delay

                document.addEventListener('touchend', this.touch.siren.events.touchend);
            }
        };

        this.touch.siren.events.touchend = (_event) => {
            this.actions.siren = false;
            const touches = [..._event.changedTouches];
            const touch = touches.find((_touch) => _touch.identifier === this.touch.siren.touchIdentifier);

            if (touch) {
                this.touch.siren.$border.style.opacity = '0.25';


                document.removeEventListener('touchend', this.touch.siren.events.touchend);
            }
        };

        this.touch.siren.$element.addEventListener('touchstart', this.touch.siren.events.touchstart);

        /**
         * Boost
         */
        this.touch.boost = {}

        // Element
        this.touch.boost.$element = document.createElement('div')
        this.touch.boost.$element.style.userSelect = 'none'
        this.touch.boost.$element.style.position = 'fixed'
        // this.touch.boost.$element.style.bottom = 'calc(70px * 2 + 35px)'
        // this.touch.boost.$element.style.right = '0px'

        const initialBoost = this.slotPositions.slot2;
        this.touch.boost.$element.style.bottom = initialBoost.bottom;
        this.touch.boost.$element.style.right = initialBoost.right;

        this.touch.boost.$element.style.width = '95px'
        this.touch.boost.$element.style.height = '70px'
        this.touch.boost.$element.style.transition = 'opacity 0.3s 0.4s'
        this.touch.boost.$element.style.willChange = 'opacity'
        this.touch.boost.$element.style.opacity = '0'
        // this.touch.boost.$element.style.backgroundColor = '#00ff00'
        document.body.appendChild(this.touch.boost.$element)

        // Create a separate label for the slot
        const boostLabel = document.createElement('span');
        boostLabel.id = 'boost-label';
        boostLabel.textContent = '2';
        boostLabel.style.position = 'fixed';
        boostLabel.style.bottom = '220px';
        boostLabel.style.right = '63px';
        boostLabel.style.color = 'white';
        boostLabel.style.fontSize = '10px';
        boostLabel.style.pointerEvents = 'none';
        boostLabel.style.opacity = '0';

        // Append the label to document.body
        document.body.appendChild(boostLabel);

        this.touch.boost.$border = document.createElement('div')
        this.touch.boost.$border.style.position = 'absolute'
        this.touch.boost.$border.style.top = 'calc(50% - 30px)'
        this.touch.boost.$border.style.left = 'calc(50% - 30px)'
        this.touch.boost.$border.style.width = '60px'
        this.touch.boost.$border.style.height = '60px'
        this.touch.boost.$border.style.border = 'unset'
        this.touch.boost.$border.style.background = 'rgba(0, 0, 0, 0.5)'
        this.touch.boost.$border.style.borderRadius = '10px'
        this.touch.boost.$border.style.boxSizing = 'border-box'
        this.touch.boost.$border.style.opacity = '0.25'
        this.touch.boost.$border.style.willChange = 'opacity'
        this.touch.boost.$element.appendChild(this.touch.boost.$border)

        this.touch.boost.$icon = document.createElement('div')
        this.touch.boost.$icon.style.position = 'absolute'
        this.touch.boost.$icon.style.top = 'calc(50% - 13px)'
        this.touch.boost.$icon.style.left = 'calc(50% - 11px)'
        this.touch.boost.$icon.style.width = '22px'
        this.touch.boost.$icon.style.height = '26px'
        this.touch.boost.$icon.style.backgroundImage = `url(${mobileDoubleTriangle})`
        this.touch.boost.$icon.style.backgroundSize = 'cover'
        this.touch.boost.$element.appendChild(this.touch.boost.$icon)

        // Events
        this.touch.boost.events = {}
        this.touch.boost.touchIdentifier = null
        this.touch.boost.events.touchstart = (_event) =>
        {
            _event.preventDefault()

            const touch = _event.changedTouches[0]

            if(touch)
            {
                this.camera.pan.reset()

                this.touch.boost.touchIdentifier = touch.identifier

                this.actions.up = true
                this.actions.boost = true

                this.touch.boost.$border.style.opacity = '0.5'

                document.addEventListener('touchend', this.touch.boost.events.touchend)
            }
        }

        this.touch.boost.events.touchend = (_event) =>
        {
            const touches = [..._event.changedTouches]
            const touch = touches.find((_touch) => _touch.identifier === this.touch.boost.touchIdentifier)

            if(touch)
            {
                this.actions.up = false
                this.actions.boost = false

                this.touch.boost.$border.style.opacity = '0.25'

                document.removeEventListener('touchend', this.touch.boost.events.touchend)
            }
        }

        this.touch.boost.$element.addEventListener('touchstart', this.touch.boost.events.touchstart)

        /**
         * Forward
         */
        this.touch.forward = {}

        // Element
        this.touch.forward.$element = document.createElement('div')
        this.touch.forward.$element.style.userSelect = 'none'
        this.touch.forward.$element.style.position = 'fixed'
        // this.touch.forward.$element.style.bottom = '98px'
        // this.touch.forward.$element.style.right = '0px'

        const initialForward = this.slotPositions.slot4;
        this.touch.forward.$element.style.bottom = initialForward.bottom;
        this.touch.forward.$element.style.right = initialForward.right;

        this.touch.forward.$element.style.width = '95px'
        this.touch.forward.$element.style.height = '70px'
        this.touch.forward.$element.style.transition = 'opacity 0.3s 0.3s'
        this.touch.forward.$element.style.willChange = 'opacity'
        this.touch.forward.$element.style.opacity = '0'
        // this.touch.forward.$element.style.backgroundColor = '#00ff00'
        document.body.appendChild(this.touch.forward.$element)

        // Create a separate label for the slot
        const forwardLabel = document.createElement('span');
        forwardLabel.id = 'forward-label';
        forwardLabel.textContent = '4';
        forwardLabel.style.position = 'fixed';
        forwardLabel.style.bottom = '145px'
        forwardLabel.style.right = '63px';
        forwardLabel.style.color = 'white';
        forwardLabel.style.fontSize = '10px';
        forwardLabel.style.pointerEvents = 'none';
        forwardLabel.style.opacity = '0';

        // Append the label to document.body
        document.body.appendChild(forwardLabel);

        this.touch.forward.$border = document.createElement('div')
        this.touch.forward.$border.style.position = 'absolute'
        this.touch.forward.$border.style.top = 'calc(50% - 30px)'
        this.touch.forward.$border.style.left = 'calc(50% - 30px)'
        this.touch.forward.$border.style.width = '60px'
        this.touch.forward.$border.style.height = '60px'
        this.touch.forward.$border.style.border = 'unset'
        this.touch.forward.$border.style.background = 'rgba(0, 0, 0, 0.5)'
        this.touch.forward.$border.style.borderRadius = '10px'
        this.touch.forward.$border.style.boxSizing = 'border-box'
        this.touch.forward.$border.style.opacity = '0.25'
        this.touch.forward.$border.style.willChange = 'opacity'
        this.touch.forward.$element.appendChild(this.touch.forward.$border)

        this.touch.forward.$icon = document.createElement('div')
        this.touch.forward.$icon.style.position = 'absolute'
        this.touch.forward.$icon.style.top = 'calc(50% - 9px)'
        this.touch.forward.$icon.style.left = 'calc(50% - 11px)'
        this.touch.forward.$icon.style.width = '22px'
        this.touch.forward.$icon.style.height = '18px'
        this.touch.forward.$icon.style.backgroundImage = `url(${mobileTriangle})`
        this.touch.forward.$icon.style.backgroundSize = 'cover'
        this.touch.forward.$element.appendChild(this.touch.forward.$icon)

        // Events
        this.touch.forward.events = {}
        this.touch.forward.touchIdentifier = null
        this.touch.forward.events.touchstart = (_event) =>
        {
            _event.preventDefault()

            const touch = _event.changedTouches[0]

            if(touch)
            {
                this.camera.pan.reset()

                this.touch.forward.touchIdentifier = touch.identifier

                this.actions.up = true

                this.touch.forward.$border.style.opacity = '0.5'

                document.addEventListener('touchend', this.touch.forward.events.touchend)
            }
        }

        this.touch.forward.events.touchend = (_event) =>
        {
            const touches = [..._event.changedTouches]
            const touch = touches.find((_touch) => _touch.identifier === this.touch.forward.touchIdentifier)

            if(touch)
            {
                this.actions.up = false

                this.touch.forward.$border.style.opacity = '0.25'

                document.removeEventListener('touchend', this.touch.forward.events.touchend)
            }
        }

        this.touch.forward.$element.addEventListener('touchstart', this.touch.forward.events.touchstart)

        /**
         * Shoot
         */
        this.touch.shoot = {};

        // Element creation and styling
        this.touch.shoot.$element = document.createElement('div');
        // this.touch.shoot.$element.id = 'btn1';
        this.touch.shoot.$element.style.userSelect = 'none';
        this.touch.shoot.$element.style.position = 'fixed';
        // this.touch.shoot.$element.style.bottom = 'calc(70px * 2 + 35px)';
        // this.touch.shoot.$element.style.right = '78px';
        // Apply initial position from slotPositions
        const initialPosition = this.slotPositions.slot1;
        this.touch.shoot.$element.style.bottom = initialPosition.bottom;
        this.touch.shoot.$element.style.right = initialPosition.right;

        this.touch.shoot.$element.style.width = '95px';
        this.touch.shoot.$element.style.height = '70px';
        this.touch.shoot.$element.style.transition = 'opacity 0.3s 0.4s';
        this.touch.shoot.$element.style.willChange = 'opacity';
        this.touch.shoot.$element.style.opacity = '0';

        // Create a separate label for the slot
        const shootLabel = document.createElement('span');
        shootLabel.textContent = '1';
        shootLabel.id = 'shoot-label';
        shootLabel.style.position = 'fixed';
        shootLabel.style.bottom = '220px';
        shootLabel.style.right = '145px';
        shootLabel.style.color = 'white';
        shootLabel.style.fontSize = '10px';
        shootLabel.style.pointerEvents = 'none';
        shootLabel.style.opacity = '0';

        // Append the label to document.body
        document.body.appendChild(shootLabel);

        // Append the button to the body
        document.body.appendChild(this.touch.shoot.$element);

        this.touch.shoot.$border = document.createElement('div');
        this.touch.shoot.$border.style.position = 'absolute';
        this.touch.shoot.$border.style.top = 'calc(50% - 30px)';
        this.touch.shoot.$border.style.left = 'calc(50% - 30px)';
        this.touch.shoot.$border.style.width = '60px';
        this.touch.shoot.$border.style.height = '60px';
        this.touch.shoot.$border.style.border = 'unset';
        this.touch.shoot.$border.style.background = 'rgba(0, 0, 0, 0.5)'
        this.touch.shoot.$border.style.borderRadius = '10px';
        this.touch.shoot.$border.style.boxSizing = 'border-box';
        this.touch.shoot.$border.style.opacity = '0.25';
        this.touch.shoot.$border.style.willChange = 'opacity';
        this.touch.shoot.$element.appendChild(this.touch.shoot.$border);

        this.touch.shoot.$icon = document.createElement('div');
        this.touch.shoot.$icon.style.position = 'absolute';
        this.touch.shoot.$icon.style.top = 'calc(50% - 13px)';
        this.touch.shoot.$icon.style.left = 'calc(50% - 11px)';
        this.touch.shoot.$icon.style.width = '22px';
        this.touch.shoot.$icon.style.height = '26px';
        this.touch.shoot.$icon.style.backgroundImage = `url(${mobilePaperPlane})`;
        this.touch.shoot.$icon.style.backgroundSize = 'cover';
        this.touch.shoot.$element.appendChild(this.touch.shoot.$icon);

        // Events setup
        this.touch.shoot.events = {};
        this.touch.shoot.touchIdentifier = null;

        this.touch.shoot.events.touchstart = (_event) => {
            _event.preventDefault();

            const touch = _event.changedTouches[0];

            if (touch) {

                this.touch.shoot.touchIdentifier = touch.identifier;

                // Trigger mousedown event
                const mouseEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    button: 1, // Middle mouse button
                });
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(mouseEvent);
                }

                this.actions.shoot = true;

                this.touch.shoot.$border.style.opacity = '0.5';

                document.addEventListener('touchend', this.touch.shoot.events.touchend);
            }
        };

        this.touch.shoot.events.touchend = (_event) => {
            const touches = [..._event.changedTouches];
            const touch = touches.find((_touch) => _touch.identifier === this.touch.shoot.touchIdentifier);

            if (touch) {
                this.actions.shoot = false;

                this.touch.shoot.$border.style.opacity = '0.25';

                document.removeEventListener('touchend', this.touch.shoot.events.touchend);
            }
        };

        this.touch.shoot.$element.addEventListener('touchstart', this.touch.shoot.events.touchstart);

        /**
         * Brake
         */
        this.touch.brake = {}

        // Element
        this.touch.brake.$element = document.createElement('div')
        this.touch.brake.$element.style.userSelect = 'none'
        this.touch.brake.$element.style.position = 'fixed'
        // this.touch.brake.$element.style.bottom = '20px'
        // this.touch.brake.$element.style.right = '0px'

        const initialBrake = this.slotPositions.slot6;
        this.touch.brake.$element.style.bottom = initialBrake.bottom;
        this.touch.brake.$element.style.right = initialBrake.right;

        this.touch.brake.$element.style.width = '95px'
        this.touch.brake.$element.style.height = '70px'
        this.touch.brake.$element.style.transition = 'opacity 0.3s 0.2s'
        this.touch.brake.$element.style.willChange = 'opacity'
        this.touch.brake.$element.style.opacity = '0'
        // this.touch.brake.$element.style.backgroundColor = '#ff0000'
        document.body.appendChild(this.touch.brake.$element)

        // Create a separate label for the slot
        const brakeLabel = document.createElement('span');
        brakeLabel.id = 'brake-label';
        brakeLabel.textContent = '6';
        brakeLabel.style.position = 'fixed';
        brakeLabel.style.bottom = '68px';
        brakeLabel.style.right = '62px';
        brakeLabel.style.color = 'white';
        brakeLabel.style.fontSize = '10px';
        brakeLabel.style.pointerEvents = 'none';
        brakeLabel.style.opacity = '0';

        // Append the label to document.body
        document.body.appendChild(brakeLabel);

        this.touch.brake.$border = document.createElement('div')
        this.touch.brake.$border.style.position = 'absolute'
        this.touch.brake.$border.style.top = 'calc(50% - 30px)'
        this.touch.brake.$border.style.left = 'calc(50% - 30px)'
        this.touch.brake.$border.style.width = '60px'
        this.touch.brake.$border.style.height = '60px'
        this.touch.brake.$border.style.border = 'unset'
        this.touch.brake.$border.style.background = 'rgba(0, 0, 0, 0.5)'
        this.touch.brake.$border.style.borderRadius = '10px'
        this.touch.brake.$border.style.boxSizing = 'border-box'
        this.touch.brake.$border.style.opacity = '0.25'
        this.touch.brake.$border.style.willChange = 'opacity'
        this.touch.brake.$element.appendChild(this.touch.brake.$border)

        this.touch.brake.$icon = document.createElement('div')
        this.touch.brake.$icon.style.position = 'absolute'
        this.touch.brake.$icon.style.top = 'calc(50% - 7px)'
        this.touch.brake.$icon.style.left = 'calc(50% - 7px)'
        this.touch.brake.$icon.style.width = '15px'
        this.touch.brake.$icon.style.height = '15px'
        this.touch.brake.$icon.style.backgroundImage = `url(${mobileCross})`
        this.touch.brake.$icon.style.backgroundSize = 'cover'
        this.touch.brake.$icon.style.transform = 'rotate(180deg)'
        this.touch.brake.$element.appendChild(this.touch.brake.$icon)

        // Events
        this.touch.brake.events = {}
        this.touch.brake.touchIdentifier = null
        this.touch.brake.events.touchstart = (_event) =>
        {
            _event.preventDefault()

            const touch = _event.changedTouches[0]

            if(touch)
            {
                this.touch.brake.touchIdentifier = touch.identifier

                this.actions.brake = true

                this.touch.brake.$border.style.opacity = '0.5'

                document.addEventListener('touchend', this.touch.brake.events.touchend)
            }
        }

        this.touch.brake.events.touchend = (_event) =>
        {
            const touches = [..._event.changedTouches]
            const touch = touches.find((_touch) => _touch.identifier === this.touch.brake.touchIdentifier)

            if(touch)
            {
                this.actions.brake = false

                this.touch.brake.$border.style.opacity = '0.25'

                document.removeEventListener('touchend', this.touch.brake.events.touchend)
            }
        }

        this.touch.brake.$element.addEventListener('touchstart', this.touch.brake.events.touchstart)

        /**
         * Backward
         */
        this.touch.backward = {}

        // Element
        this.touch.backward.$element = document.createElement('div')
        this.touch.backward.$element.style.userSelect = 'none'
        this.touch.backward.$element.style.position = 'fixed'
        this.touch.backward.$element.style.display = 'block'
        // this.touch.backward.$element.style.bottom = '20px'
        // this.touch.backward.$element.style.right = '78px'

        const initialBackward = this.slotPositions.slot5;
        this.touch.backward.$element.style.bottom = initialBackward.bottom;
        this.touch.backward.$element.style.right = initialBackward.right;

        this.touch.backward.$element.style.width = '95px'
        this.touch.backward.$element.style.height = '70px'
        this.touch.backward.$element.style.transition = 'opacity 0.3s 0.1s'
        this.touch.backward.$element.style.willChange = 'opacity'
        this.touch.backward.$element.style.opacity = '0'
        // this.touch.backward.$element.style.backgroundColor = '#0000ff'
        document.body.appendChild(this.touch.backward.$element)

        // Create a separate label for the slot
        const backwardLabel = document.createElement('span');
        backwardLabel.id = 'backward-label';
        backwardLabel.textContent = '5';
        backwardLabel.style.position = 'fixed';
        backwardLabel.style.bottom = '68px';
        backwardLabel.style.right = '140px';
        backwardLabel.style.color = 'white';
        backwardLabel.style.fontSize = '10px';
        backwardLabel.style.pointerEvents = 'none';
        backwardLabel.style.opacity = '0';

        // Append the label to document.body
        document.body.appendChild(backwardLabel);

        this.touch.backward.$border = document.createElement('div')
        this.touch.backward.$border.style.position = 'absolute'
        this.touch.backward.$border.style.top = 'calc(50% - 30px)'
        this.touch.backward.$border.style.left = 'calc(50% - 30px)'
        this.touch.backward.$border.style.width = '60px'
        this.touch.backward.$border.style.height = '60px'
        this.touch.backward.$border.style.border = 'unset'
        this.touch.backward.$border.style.background = 'rgba(0, 0, 0, 0.5)'
        this.touch.backward.$border.style.borderRadius = '10px'
        this.touch.backward.$border.style.boxSizing = 'border-box'
        this.touch.backward.$border.style.opacity = '0.25'
        this.touch.backward.$border.style.willChange = 'opacity'
        this.touch.backward.$element.appendChild(this.touch.backward.$border)

        this.touch.backward.$icon = document.createElement('div')
        this.touch.backward.$icon.style.position = 'absolute'
        this.touch.backward.$icon.style.top = 'calc(50% - 9px)'
        this.touch.backward.$icon.style.left = 'calc(50% - 11px)'
        this.touch.backward.$icon.style.width = '22px'
        this.touch.backward.$icon.style.height = '18px'
        this.touch.backward.$icon.style.backgroundImage = `url(${mobileTriangle})`
        this.touch.backward.$icon.style.backgroundSize = 'cover'
        this.touch.backward.$icon.style.transform = 'rotate(180deg)'
        this.touch.backward.$element.appendChild(this.touch.backward.$icon)

        // Events
        this.touch.backward.events = {}
        this.touch.backward.touchIdentifier = null
        this.touch.backward.events.touchstart = (_event) =>
        {
            _event.preventDefault()

            const touch = _event.changedTouches[0]

            if(touch)
            {
                this.camera.pan.reset()

                this.touch.backward.touchIdentifier = touch.identifier

                this.actions.down = true

                this.touch.backward.$border.style.opacity = '0.5'

                document.addEventListener('touchend', this.touch.backward.events.touchend)
            }
        }

        this.touch.backward.events.touchend = (_event) =>
        {
            const touches = [..._event.changedTouches]
            const touch = touches.find((_touch) => _touch.identifier === this.touch.backward.touchIdentifier)

            if(touch)
            {
                this.actions.down = false

                this.touch.backward.$border.style.opacity = '0.25'

                document.removeEventListener('touchend', this.touch.backward.events.touchend)
            }
        }

        this.touch.backward.$element.addEventListener('touchstart', this.touch.backward.events.touchstart)

        // Reveal
        this.touch.reveal = () =>
        {
            this.touch.joystick.$element.style.opacity = 1
            this.touch.backward.$element.style.opacity = 1
            this.touch.brake.$element.style.opacity = 1
            this.touch.forward.$element.style.opacity = 1
            this.touch.boost.$element.style.opacity = 1
            this.touch.shoot.$element.style.opacity = 1
            this.touch.camera.$element.style.opacity = 1
            this.touch.reset.$element.style.opacity = 1
            this.touch.radio.$element.style.opacity = 1;
            this.touch.zoomSlider.$element.style.opacity = 1;
            this.touch.previous.$element.style.opacity = 1;
            this.touch.next.$element.style.opacity = 1;
            this.touch.siren.$element.style.opacity = 1;
            this.touch.mute.$element.style.opacity = 1;

            // Add these lines to reveal userDisplay and battery-status
            const userDisplay = document.getElementById('userDisplay');
            const batteryStatus = document.getElementById('battery-status');
            const signOutButton = document.getElementById('signOutButton');
            const speedometer = document.getElementById('speedometer');
            const inviteButton = document.getElementById('invite-button');
            const partyInfo = document.getElementById('party-info');
            const party = document.getElementById('toggle-party-list');
            const switchContainer = document.getElementById('switch-container');

            const shootLabel = document.getElementById('shoot-label');
            const boostLabel = document.getElementById('boost-label');
            const sirenLabel = document.getElementById('siren-label');
            const forwardLabel = document.getElementById('forward-label');
            const backwardLabel = document.getElementById('backward-label');
            const brakeLabel = document.getElementById('brake-label');
            const cameraLabel = document.getElementById('camera-label');
            const resetLabel = document.getElementById('reset-label');


            if (userDisplay || batteryStatus || speedometer || inviteButton || switchContainer || party) {
                userDisplay.style.opacity = 1;
                batteryStatus.style.opacity = 1;
                // signOutButton.style.opacity = 1;
                speedometer.style.opacity = 1;
                inviteButton.style.opacity = 1;
                switchContainer.style.opacity = 1;
                // partyInfo.style.opacity = 1;
                party.style.opacity = 1;
            }

            if (shootLabel || boostLabel || sirenLabel || forwardLabel || backwardLabel || brakeLabel || cameraLabel || resetLabel) {
                shootLabel.style.opacity = 1;
                boostLabel.style.opacity = 1;
                sirenLabel.style.opacity = 1;
                forwardLabel.style.opacity = 1;
                backwardLabel.style.opacity = 1;
                brakeLabel.style.opacity = 1;
                cameraLabel.style.opacity = 1;
                resetLabel.style.opacity = 1;
            }

            // if (batteryStatus) {
            //     batteryStatus.style.opacity = 1;
            // }

            // if (signOutButton) {
            //     signOutButton.style.opacity = 1;
            // }

            // if (speedometer) {
            //     speedometer.style.opacity = 1;
            // }

            // if (inviteButton) {
            //     inviteButton.style.opacity = 1;
            // }

            // if (switchContainer) {
            //     switchContainer.style.opacity = 1;
            // }

            // if (partyInfo) {
            //     partyInfo.style.opacity = 1;
            // }

            // if (party) {
            //     party.style.opacity = 1;
            // }
        }

        // Call this function initially and whenever the window is resized
        this.updateButtonPositions();
        if (typeof window !== 'undefined') {

            window.addEventListener('resize', () => {
                this.updateButtonPositions();
            });
        }
    }
}
