class CarManager {
    constructor() {
        this.explosionDurationMs = 1500;
        this.registerCollision = true;
        this.startingPosition = { x: 240, y: 895, angle: 0 };

        this.$player = $('#car');
        this.playerData = {
            position: { ...this.startingPosition },
            size: { width: 28, height: 65 },
            speed: {
                current: 0,
                acceleration: 0.1,
                deceleration: 0.1,
                max: {
                    forward: 2,
                    reverse: 1.5,
                    rotation: 2
                },
            },
            features: { headlightsOn: false }
        };
    }

    moveCar(keys) {
        if (keys.up) {
            this.playerData.speed.current = Math.min(
                this.playerData.speed.current + this.playerData.speed.acceleration,
                this.playerData.speed.max.forward
            );
        } else if (keys.down) {
            this.playerData.speed.current = Math.max(
                this.playerData.speed.current - this.playerData.speed.acceleration,
                -this.playerData.speed.max.reverse
            );
        } else {
            if (this.playerData.speed.current > 0) {
                this.playerData.speed.current = Math.max(
                    this.playerData.speed.current - this.playerData.speed.deceleration,
                    0
                );
            } else if (this.playerData.speed.current < 0) {
                this.playerData.speed.current = Math.min(
                    this.playerData.speed.current + this.playerData.speed.deceleration,
                    0
                );
            }
        }
    
        const { x, y, angle } = this.playerData.position;
        const { current: currentSpeed } = this.playerData.speed;
        const { width, height } = this.playerData.size;
    
        const newX = x + currentSpeed * Math.cos(this.degreesToRadians(angle - 90));
        const newY = y + currentSpeed * Math.sin(this.degreesToRadians(angle - 90));
    
        this.playerData.position.x = Math.max(0, Math.min(newX, 1000 - width));
        this.playerData.position.y = Math.max(0, Math.min(newY, 1000 - height));
    }
    
    rotateCar(keys) {
        if (this.playerData.speed.current !== 0) {
            const speedFactor = Math.abs(this.playerData.speed.current) / this.playerData.speed.max.forward;
            const scaledRotationSpeed = this.playerData.speed.max.rotation * speedFactor;
    
            if (keys.left) {
                this.playerData.position.angle -= scaledRotationSpeed;
            }
            if (keys.right) {
                this.playerData.position.angle += scaledRotationSpeed;
            }
        }
    }    

    stopCar() {
        this.registerCollision = false;
        this.playerData.speed.max.forward = 0;
        this.playerData.speed.max.reverse = 0;
    }

    triggerExplosion() {
        $("#car-img").css("visibility", "hidden");

        let explosion = $("#car-explosion");
        let src = explosion.attr("src");
        explosion.attr("src", "").hide(); // Clear the src temporarily
        setTimeout(() => explosion.attr("src", src).show(), 10); // Restore it to restart the GIF
    }

    hideExplosion() {
        // Hide the explosion and show the car
        $("#car-explosion").hide();
        $("#car-img").css("visibility", "visible");
    }

    // Show the confetti, then hide it after 400 ms
    triggerConfetti() {
        $("#car-confetti").removeClass("hidden");
        setTimeout(() => $("#car-confetti").addClass("hidden"), 400);
    }

    setSpeed(mode) {
        if (mode === "hard-mode") {
            this.playerData.speed.max.forward = 2.5;
            this.playerData.speed.max.reverse = 2;
            this.playerData.speed.max.rotation = 2.5;
        } else {
            this.playerData.speed.max.forward = 2;
            this.playerData.speed.max.reverse = 1.5;
            this.playerData.speed.max.rotation = 2;
        }
    }

    resetCar(mode) {
        this.hideExplosion();
        this.registerCollision = true;
        this.setSpeed(mode);
        this.playerData.speed.current = 0;
        this.playerData.position = { ...this.startingPosition };
    }

    checkParkingButtons() {
        const leeway = 4; // Allow for 4px of leeway

        const easyModeRect = $('#easy-mode-button')[0].getBoundingClientRect();
        const hardModeRect = $('#hard-mode-button')[0].getBoundingClientRect();
        const carRect = this.$player[0].getBoundingClientRect();

        if (
            carRect.left >= easyModeRect.left - leeway &&
            carRect.right <= easyModeRect.right + leeway &&
            carRect.top >= easyModeRect.top - leeway &&
            carRect.bottom <= easyModeRect.bottom + leeway
        ) {
            return "easy-mode";
        }

        if (
            carRect.left >= hardModeRect.left - leeway &&
            carRect.right <= hardModeRect.right + leeway &&
            carRect.top >= hardModeRect.top - leeway &&
            carRect.bottom <= hardModeRect.bottom + leeway
        ) {
            return "hard-mode";
        }

        return false;
    }

    updatePosition() {
        const { x, y, angle } = this.playerData.position;

        this.$player.css({
            transform: `translate(${x}px, ${y}px) rotate(${angle}deg)`
        });
    }

    toggleHeadlights() {
        $("#headlights").toggleClass("hidden");
    }

    playHorn() {
        $("#horn-sound")[0].currentTime = 0;
        $("#horn-sound")[0].play();
    }

    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}

export default CarManager;
