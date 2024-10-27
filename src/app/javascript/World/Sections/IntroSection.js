import * as THREE from 'three'
import feather from 'feather-icons'

export default class IntroSection
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
        this.setInstructions()
        this.setOtherInstructions()
        this.setRamps()
        // this.setTitles()

        /*
        * Parabola questions 
        */

        this.setGreenLink()
        this.setGreenLink1()
        this.setGreenLink2()
        this.setGreenLink3()
        this.setGreenLink4()
        this.setGreenLink5()
        this.setGreenLink6()
        this.setGreenLink7()
        this.setGreenLink8()
        this.setGreenLink9()
        this.setGreenLink10()
        this.setGreenLink11()
        this.setGreenLink12()
    }

    setStatic()
    {
        this.objects.add({
            base: this.resources.items.introStaticBase.scene,
            collision: this.resources.items.introStaticCollision.scene,
            floorShadowTexture: this.resources.items.introStaticFloorShadowTexture,
            offset: new THREE.Vector3(0, 0, 0),
            mass: 0
        })
    }

    createPopup(question, callback) {
        // Check if a popup is already open
        if (this.isPopupOpen) return;  // Prevent multiple popups
    
        // Set popup open flag to true
        this.isPopupOpen = true;
    
        // Create popup elements
        const modal = document.createElement('div');
        modal.classList.add('popup-modal');
        
        const overlay = document.createElement('div');
        overlay.classList.add('popup-overlay');
        
        const modalContent = document.createElement('div');
        modalContent.classList.add('popup-content');
        
        const questionElement = document.createElement('h1');
        questionElement.textContent = question;
        
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.placeholder = 'Enter your answer...';
        
        const confirmButton = document.createElement('button');
        confirmButton.innerHTML = 'CONFIRM';
        
        // Message element to show non-digit error
        const messageElement = document.createElement('p');
        messageElement.style.color = 'red';
        messageElement.style.fontSize = '12px';
        messageElement.style.display = 'none'; // Initially hidden
        
        // Append elements to the modal
        modalContent.appendChild(questionElement);
        modalContent.appendChild(inputElement);
        modalContent.appendChild(confirmButton);
        modalContent.appendChild(messageElement);  // Add error message
        modal.appendChild(overlay);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    
        // Dynamically find the canvas element
        const gameCanvas = document.querySelector('.canvas.js-canvas');
    
        // Disable all canvas interactions
        if (gameCanvas) {
            gameCanvas.style.pointerEvents = 'none';  // Disable all pointer events on the canvas
        }
    
        // Allow interaction only for input and button
        const allowInteraction = (e) => {
            if (e.target !== inputElement && e.target !== confirmButton) {
                e.preventDefault();
                e.stopPropagation();  // Block any interaction outside input and confirm button
            }
        };
    
        // Add global event listener to block interaction with anything but input and button
        document.addEventListener('click', allowInteraction, true);
        document.addEventListener('mousedown', allowInteraction, true);
        document.addEventListener('touchstart', allowInteraction, true);
    
        // Restrict input to digits and show message on non-digit input
        inputElement.addEventListener('input', () => {
            const nonDigitCharacters = /[^0-9]/g;
            if (nonDigitCharacters.test(inputElement.value)) {
                inputElement.value = inputElement.value.replace(nonDigitCharacters, '');  // Remove non-digit characters
                messageElement.textContent = 'Please enter digits only.';  // Show error message
                messageElement.style.display = 'block';
                messageElement.style.paddingTop = '10px';
            } else {
                messageElement.style.display = 'none';  // Hide error message when input is valid
            }
        });
    
        // Ensure no other actions happen when typing inside the input
        inputElement.addEventListener('keydown', (e) => {
            e.stopPropagation();  // Stop the event from reaching the canvas or other game inputs
        });
    
        // Close modal and handle confirmation
        confirmButton.addEventListener('click', () => {
            const answer = inputElement.value.trim();
            document.body.removeChild(modal); // Remove modal from DOM
            this.isPopupOpen = false;  // Reset popup flag
    
            // Remove event listeners after popup is closed
            document.removeEventListener('click', allowInteraction, true);
            document.removeEventListener('mousedown', allowInteraction, true);
            document.removeEventListener('touchstart', allowInteraction, true);
    
            callback(answer);  // Pass the answer to the callback
        });
    
        // Close the popup if user clicks outside the modal content
        overlay.addEventListener('click', () => {
            document.body.removeChild(modal);  // Remove modal from DOM
            this.isPopupOpen = false;  // Reset popup flag
    
            // Remove event listeners after popup is closed
            document.removeEventListener('click', allowInteraction, true);
            document.removeEventListener('mousedown', allowInteraction, true);
            document.removeEventListener('touchstart', allowInteraction, true);
        });
    }    

    setGreenLink()
    {
        // Set up
        this.links = {}
        this.links.x = -94.2226
        this.links.y = -55.9176
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -1
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === '1' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setGreenLink1()
    {
        // Set up
        this.links = {}
        this.links.x = -144.883
        this.links.y = 144.95
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -0.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === 'yes' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setGreenLink2()
    {
        // Set up
        this.links = {}
        this.links.x = -340.75
        this.links.y = 295.72
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -0.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === 'yes' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setGreenLink3()
    {
        // Set up
        this.links = {}
        this.links.x = -200.898
        this.links.y = -299.148
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -0.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === 'yes' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setGreenLink4()
    {
        // Set up
        this.links = {}
        this.links.x = -327.822
        this.links.y = -148.294
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -0.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === 'yes' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setGreenLink5()
    {
        // Set up
        this.links = {}
        this.links.x = 100.108
        this.links.y = 300.301
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -0.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === 'yes' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setGreenLink6()
    {
        // Set up
        this.links = {}
        this.links.x = 324.947
        this.links.y = -101.947
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -0.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === 'yes' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setGreenLink7()
    {
        // Set up
        this.links = {}
        this.links.x = 100.015
        this.links.y = -200.02
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -0.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === 'yes' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setGreenLink8()
    {
        // Set up
        this.links = {}
        this.links.x = 301.298
        this.links.y = -339.778
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -0.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === 'yes' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setGreenLink9()
    {
        // Set up
        this.links = {}
        this.links.x = 122.912
        this.links.y = -40.1736
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -0.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === 'yes' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setGreenLink10()
    {
        // Set up
        this.links = {}
        this.links.x = -114.879
        this.links.y = 344.947
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -0.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === 'yes' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setGreenLink11()
    {
        // Set up
        this.links = {}
        this.links.x = 345.18
        this.links.y = 314.685
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -0.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === 'yes' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setGreenLink12()
    {
        // Set up
        this.links = {}
        this.links.x = 42.8906
        this.links.y = 91.5661
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = -0.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                question: 'TO PROCEED, COMBINE THE INITIAL PAIR OF NUMBERS:',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture // Ensure labelTexture is provided
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.question = _option.question

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () => {

                this.createPopup(item.question, (answer) => {
                    if (answer === 'yes' || answer === 'true') {
                        // Create a green pixel
                        const greenPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const greenPixelMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const greenPixelMesh = new THREE.Mesh(greenPixelGeometry, greenPixelMaterial);
                        greenPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.greenPixel = {};
                        item.greenPixel.container = new THREE.Object3D();
                        item.greenPixel.container.add(greenPixelMesh);
                        this.container.add(item.greenPixel.container);
            
                        return true;
                    } else {
                        // Create a red pixel
                        const redPixelGeometry = new THREE.PlaneGeometry(1, 1);
                        const redPixelMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const redPixelMesh = new THREE.Mesh(redPixelGeometry, redPixelMaterial);
                        redPixelMesh.position.set(item.x, item.y, 0.05);
            
                        item.redPixel = {};
                        item.redPixel.container = new THREE.Object3D();
                        item.redPixel.container.add(redPixelMesh);
                        this.container.add(item.redPixel.container);
            
                        return false;
                    }
                });
            });            

            // Ensure labelTexture is defined
            if (_option.labelTexture) {
                // Texture
                item.texture = _option.labelTexture
                item.texture.magFilter = THREE.NearestFilter
                item.texture.minFilter = THREE.LinearFilter

                // Create label
                item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xFF5733, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
                item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
                item.labelMesh.position.y = item.y + this.links.labelOffset
                item.labelMesh.matrixAutoUpdate = false
                item.labelMesh.updateMatrix()
                this.links.container.add(item.labelMesh)
            }

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setLinks()
    {
        // Set up
        this.links = {}
        this.links.x = 350
        this.links.y = - 40
        this.links.halfExtents = {}
        this.links.halfExtents.x = 2
        this.links.halfExtents.y = 2
        this.links.distanceBetween = 2.4
        this.links.labelWidth = this.links.halfExtents.x * 2 + 1
        this.links.labelGeometry = new THREE.PlaneGeometry(this.links.labelWidth, this.links.labelWidth * 0.25, 1, 1)
        this.links.labelOffset = - 1.6
        this.links.items = []

        this.links.container = new THREE.Object3D()
        this.links.container.matrixAutoUpdate = false
        this.container.add(this.links.container)

        // Options
        this.links.options = [
            {
                href: 'https://nossumus.com',
                labelTexture: this.resources.items.informationContactTwitterLabelTexture
            }
        ]

        // Create each link
        let i = 0
        for(const _option of this.links.options)
        {
            // Set up
            const item = {}
            item.x = this.x + this.links.x + this.links.distanceBetween * i
            item.y = this.y + this.links.y
            item.href = _option.href

            // Create area
            item.area = this.areas.add({
                position: new THREE.Vector2(item.x, item.y),
                halfExtents: new THREE.Vector2(this.links.halfExtents.x, this.links.halfExtents.y)
            })
            item.area.on('interact', () =>
            {
                if (typeof window !== 'undefined') {
                    window.open(_option.href, '_blank');
                }
            })

            // Texture
            item.texture = _option.labelTexture
            item.texture.magFilter = THREE.NearestFilter
            item.texture.minFilter = THREE.LinearFilter

            // Create label
            item.labelMesh = new THREE.Mesh(this.links.labelGeometry, new THREE.MeshBasicMaterial({ wireframe: false, color: 0xffffff, alphaMap: _option.labelTexture, depthTest: true, depthWrite: false, transparent: true }))
            item.labelMesh.position.x = item.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x
            item.labelMesh.position.y = item.y + this.links.labelOffset
            item.labelMesh.matrixAutoUpdate = false
            item.labelMesh.updateMatrix()
            this.links.container.add(item.labelMesh)

            // Save
            this.links.items.push(item)

            i++
        }
    }

    setRamps() {
        this.ramps = {};
    
        /**
         * Ramp 1
         */
        this.ramps.ramp1 = this.objects.add({
            base: this.resources.items.introRampBase.scene, // Replace with your ramp base model
            collision: this.resources.items.introRampCollision.scene, // Replace with your ramp collision model
            offset: new THREE.Vector3(10, 0, 0), // Set the desired position
            rotation: new THREE.Euler(0, Math.PI / 4, 0), // Set the desired rotation
            duplicated: false,
            shadow: { sizeX: 5, sizeY: 2, offsetZ: -0.2, alpha: 0.5 },
            mass: 0, // Static object, no mass
            soundName: 'stone'
        });
    
        // /**
        //  * Ramp 2
        //  */
        // this.ramps.ramp2 = this.objects.add({
        //     base: this.resources.items.rampBase.scene, // Replace with your ramp base model
        //     collision: this.resources.items.rampCollision.scene, // Replace with your ramp collision model
        //     offset: new THREE.Vector3(-10, 0, 0), // Set the desired position
        //     rotation: new THREE.Euler(0, -Math.PI / 4, 0), // Set the desired rotation
        //     duplicated: false,
        //     shadow: { sizeX: 5, sizeY: 2, offsetZ: -0.2, alpha: 0.5 },
        //     mass: 0, // Static object, no mass
        //     soundName: 'stone'
        // });

        // /**
        //  * Ramp 3
        //  */
        // this.ramps.ramp3 = this.objects.add({
        //     base: this.resources.items.rampBase.scene, // Replace with your ramp base model
        //     collision: this.resources.items.rampCollision.scene, // Replace with your ramp collision model
        //     offset: new THREE.Vector3(-10, 0, 0), // Set the desired position
        //     rotation: new THREE.Euler(0, -Math.PI / 4, 0), // Set the desired rotation
        //     duplicated: false,
        //     shadow: { sizeX: 5, sizeY: 2, offsetZ: -0.2, alpha: 0.5 },
        //     mass: 0, // Static object, no mass
        //     soundName: 'stone'
        // });
    
        // Add more ramps as needed following the same structure
    }

    setInstructions()
    {
        this.instructions = {}

        /**
         * Arrows
         */
        this.instructions.arrows = {}

        // Label
        this.instructions.arrows.label = {}

        this.instructions.arrows.label.texture = this.config.touch ? this.resources.items.introInstructionsControlsTexture : this.resources.items.introInstructionsArrowsTexture
        this.instructions.arrows.label.texture.magFilter = THREE.NearestFilter
        this.instructions.arrows.label.texture.minFilter = THREE.LinearFilter

        this.instructions.arrows.label.material = new THREE.MeshBasicMaterial({ transparent: true, alphaMap: this.instructions.arrows.label.texture, color: 0xffffff, depthWrite: false, opacity: 0 })

        this.instructions.arrows.label.geometry = this.resources.items.introInstructionsLabels.scene.children.find((_mesh) => _mesh.name === 'arrows').geometry

        this.instructions.arrows.label.mesh = new THREE.Mesh(this.instructions.arrows.label.geometry, this.instructions.arrows.label.material)
        this.container.add(this.instructions.arrows.label.mesh)

        if(!this.config.touch)
        {
            // Keys
            this.instructions.arrows.up = this.objects.add({
                base: this.resources.items.introArrowKeyBase.scene,
                collision: this.resources.items.introArrowKeyCollision.scene,
                offset: new THREE.Vector3(0, - 12, 0),
                rotation: new THREE.Euler(0, 0, 0),
                duplicated: true,
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
                mass: 1.5,
                soundName: 'brick'
            })
            this.instructions.arrows.down = this.objects.add({
                base: this.resources.items.introArrowKeyBase.scene,
                collision: this.resources.items.introArrowKeyCollision.scene,
                offset: new THREE.Vector3(0, - 12.8, 0),
                rotation: new THREE.Euler(0, 0, Math.PI),
                duplicated: true,
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
                mass: 1.5,
                soundName: 'brick'
            })
            this.instructions.arrows.left = this.objects.add({
                base: this.resources.items.introArrowKeyBase.scene,
                collision: this.resources.items.introArrowKeyCollision.scene,
                offset: new THREE.Vector3(- 0.8, - 12.8, 0),
                rotation: new THREE.Euler(0, 0, Math.PI * 0.5),
                duplicated: true,
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
                mass: 1.5,
                soundName: 'brick'
            })
            this.instructions.arrows.right = this.objects.add({
                base: this.resources.items.introArrowKeyBase.scene,
                collision: this.resources.items.introArrowKeyCollision.scene,
                offset: new THREE.Vector3(0.8, - 12.8, 0),
                rotation: new THREE.Euler(0, 0, - Math.PI * 0.5),
                duplicated: true,
                shadow: { sizeX: 1, sizeY: 1, offsetZ: - 0.2, alpha: 0.5 },
                mass: 1.5,
                soundName: 'brick'
            })
        }
    }

    setOtherInstructions()
    {
        if(this.config.touch)
        {
            return
        }

        this.otherInstructions = {}
        this.otherInstructions.x = 16
        this.otherInstructions.y = - 2

        // Container
        this.otherInstructions.container = new THREE.Object3D()
        this.otherInstructions.container.position.x = this.otherInstructions.x
        this.otherInstructions.container.position.y = this.otherInstructions.y
        this.otherInstructions.container.matrixAutoUpdate = false
        this.otherInstructions.container.updateMatrix()
        this.container.add(this.otherInstructions.container)

        // Label
        this.otherInstructions.label = {}

        this.otherInstructions.label.geometry = new THREE.PlaneGeometry(6, 6, 1, 1)

        this.otherInstructions.label.texture = this.resources.items.introInstructionsOtherTexture
        this.otherInstructions.label.texture.magFilter = THREE.NearestFilter
        this.otherInstructions.label.texture.minFilter = THREE.LinearFilter

        this.otherInstructions.label.material = new THREE.MeshBasicMaterial({ transparent: true, alphaMap: this.otherInstructions.label.texture, color: 0xffffff, depthWrite: false, opacity: 0 })

        this.otherInstructions.label.mesh = new THREE.Mesh(this.otherInstructions.label.geometry, this.otherInstructions.label.material)
        this.otherInstructions.label.mesh.matrixAutoUpdate = false
        this.otherInstructions.container.add(this.otherInstructions.label.mesh)
    }

    setTitles()
    {
        // Title
        this.objects.add({
            base: this.resources.items.introBBase.scene,
            collision: this.resources.items.introBCollision.scene,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: - 3.5, alpha: 0.4 },
            mass: 1.5,
            soundName: 'brick'
        })
    }

    setTiles()
    {
        this.tiles.add({
            start: new THREE.Vector2(0, - 4.5),
            delta: new THREE.Vector2(0, - 4.5)
        })
    }

    setDikes()
    {
        this.dikes = {}
        this.dikes.brickOptions = {
            base: this.resources.items.brickBase.scene,
            collision: this.resources.items.brickCollision.scene,
            offset: new THREE.Vector3(0, 0, 0.1),
            rotation: new THREE.Euler(0, 0, 0),
            duplicated: true,
            shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: - 0.15, alpha: 0.35 },
            mass: 0.5,
            soundName: 'brick'
        }
    }
}
