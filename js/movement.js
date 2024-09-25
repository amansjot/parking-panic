class Car {
    constructor(playerElement, scale) {
        this.playerElement = playerElement; // DOM element representing the car
        this.x = 200;
        this.y = 200;
        this.angle = 90;
        this.width = 50;
        this.height = 100;
        this.currentSpeed = 0;
        this.maxForwardSpeed = 8;
        this.maxReverseSpeed = 5;
        this.acceleration = 0.4;
        this.deceleration = 0.2;
        this.rotationSpeed = 3;
        this.scale = scale; // Store the scale factor
        this.headlightsOn = false; // Headlights start as off
        this.lastValidX = this.x; // Store last valid X position
        this.lastValidY = this.y; // Store last valid Y position
    }

    // Function to move the car based on key input
    move(keys) {
        // Save the current position before calculating the new one
        this.lastValidX = this.x;
        this.lastValidY = this.y;

        // Handle acceleration and deceleration with both W/S and ArrowUp/ArrowDown
        if (keys.w || keys.ArrowUp) {
            this.currentSpeed = Math.min(this.currentSpeed + this.acceleration, this.maxForwardSpeed);
        } else if (keys.s || keys.ArrowDown) {
            this.currentSpeed = Math.max(this.currentSpeed - this.acceleration, -this.maxReverseSpeed);
        } else {
            if (this.currentSpeed > 0) {
                this.currentSpeed = Math.max(this.currentSpeed - this.deceleration, 0);
            } else if (this.currentSpeed < 0) {
                this.currentSpeed = Math.min(this.currentSpeed + this.deceleration, 0);
            }
        }

        // Calculate new positions based on the car's speed and angle
        let newX = this.x + this.currentSpeed * Math.cos(this.degreesToRadians(this.angle - 90));
        let newY = this.y + this.currentSpeed * Math.sin(this.degreesToRadians(this.angle - 90));

        const container = document.getElementById('drivingArea');

        // Use offsetWidth and offsetHeight to get the actual driving area dimensions
        const carWidth = this.width;
        const carHeight = this.height;

        // Get padding, margin, and border values if any (use window.getComputedStyle)
        const computedStyle = window.getComputedStyle(container);
        const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
        const paddingY = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
        const borderX = parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
        const borderY = parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth);

        // Adjust the boundaries based on the scale factor and subtract the extra space
        const maxX = (container.offsetWidth - carWidth - paddingX - borderX) / this.scale;
        const maxY = (container.offsetHeight - carHeight - paddingY - borderY) / this.scale;

        const boundaryOffset = 55;  // Apply a small offset for left/right boundary

        // Constrain the car's movement within the scaled boundaries
        if (newX < boundaryOffset) newX = boundaryOffset;
        if (newX > maxX - boundaryOffset) newX = maxX - boundaryOffset;
        if (newY < 0) newY = 0;
        if (newY > maxY) newY = maxY;

        // // Update the car's position
        // this.x = newX;
        // this.y = newY;

        // Check if the car is inside the mode buttons
        this.checkContainmentButtons();

        // Check for collision before updating the car's position
        const collision = this.checkCollision(newX, newY);

        // If no collision, update the car's position
        if (!collision.xCollision && !collision.yCollision) {
            this.x = newX;
            this.y = newY;
        } else {
            // If a collision occurs, revert to the last valid position
            this.x = this.lastValidX;
            this.y = this.lastValidY;
        }
    }

    checkCollision(newX, newY) {
        const coneHitbox = document.getElementById('cone-hitbox');
        const carRect = this.playerElement.getBoundingClientRect();
        const coneRect = coneHitbox.getBoundingClientRect();

        let xCollision = false;
        let yCollision = false;

        // Calculate the car's new rectangle based on the new position
        const newCarRect = carRect;

        // Check if the car's hitbox overlaps with the cone's hitbox
        if (
            newCarRect.left < coneRect.right &&
            newCarRect.right > coneRect.left &&
            newCarRect.top < coneRect.bottom &&
            newCarRect.bottom > coneRect.top
        ) {
            console.log("Collision detected!");
            xCollision = true;
            yCollision = true;
        }

        return { xCollision, yCollision };
    }

    // Function to check if the car is contained within the #easyMode button
    checkContainmentButtons() {
        const easyModeButton = document.getElementById('easyMode');
        const easyModeRect = easyModeButton.getBoundingClientRect();

        const hardModeButton = document.getElementById('hardMode');
        const hardModeRect = hardModeButton.getBoundingClientRect();

        // Get the car's position and dimensions using getBoundingClientRect
        const carRect = this.playerElement.getBoundingClientRect();

        // Check if the car is fully contained within the easyMode button
        if (
            carRect.left >= easyModeRect.left &&
            carRect.right <= easyModeRect.right &&
            carRect.top >= easyModeRect.top &&
            carRect.bottom <= easyModeRect.bottom
        ) {
            $("#easyMode").trigger("click");
        }

        if (
            carRect.left >= hardModeRect.left &&
            carRect.right <= hardModeRect.right &&
            carRect.top >= hardModeRect.top &&
            carRect.bottom <= hardModeRect.bottom
        ) {
            $("#hardMode").trigger("click");
        }
    }

    // Function to rotate the car based on key input
    rotate(keys) {
        if (this.currentSpeed !== 0) {
            let speedFactor = Math.abs(this.currentSpeed) / this.maxForwardSpeed;
            let scaledRotationSpeed = this.rotationSpeed * speedFactor;

            // Handle A/D and ArrowLeft/ArrowRight for rotation
            if (keys.a || keys.ArrowLeft) {
                this.angle -= scaledRotationSpeed;
            }
            if (keys.d || keys.ArrowRight) {
                this.angle += scaledRotationSpeed;
            }
        }
    }

    // Update the car's position and rotation in the CSS
    updateCSS() {
        // Apply scaling to the car's position and update its CSS properties
        this.playerElement.style.top = `${this.y * this.scale}px`;
        this.playerElement.style.left = `${this.x * this.scale}px`;
        this.playerElement.style.transform = `rotate(${this.angle}deg)`;
    }

    // Toggle the headlights on and off
    toggleHeadlights(headlights) {
        this.headlightsOn = !this.headlightsOn; // Toggle the state

        if (this.headlightsOn) {
            headlights.show(); // Show the headlights
        } else {
            headlights.hide(); // Hide the headlights
        }
    }

    // Helper function to convert degrees to radians
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}

export { Car };
