class SpotManager {
    constructor() {
        this.spotNum = this.generateRandomSpot(); // Global constant for the parking spot in the round
        this.spotID = `#spot-${this.spotNum}`; // Gets id value for its div
        
        this.startButtonSpots = [38, 39, 40, 41]; // Spots under the start buttons
        this.angledSpots = [33, 34, 35, 36, 37]; // Angled parking spots

        this.initializeParkingSpots();
    }

    // Initialize parking spots
    initializeParkingSpots() {
        for (let i = 1; i <= 49; i++) {
            $("#parking-spots").append(`<div class="spot parking-spot" id="spot-${i}"></div>`);
        }
    }

    // Generate the random spot number
    generateRandomSpot() {
        return Math.floor((Math.random() * 49) + 1);
    }

    // Update the parking spot for the current round
    updateSpot(roundNum) {
        // Reassign a new spot number and spot ID for each round
        let randomNum = this.generateRandomSpot();
        while (this.spotNum === randomNum) {
            randomNum = this.generateRandomSpot();
        }
        this.spotNum = randomNum;

        // For the first 2 rounds, you can't land on start button spots (it auto-plays rounds)
        if (roundNum <= 2) {
            while (this.startButtonSpots.includes(this.spotNum)) {
                this.spotNum = this.generateRandomSpot();
            }
        }

        this.spotID = `#spot-${this.spotNum}`;
        $(this.spotID).addClass("highlighted-spot");
    }

    // Check if the car is correctly parked in the current spot
    checkParkingCompletion() {
        const leeway = 1; // Allow for 1px of leeway

        // Get parking spot and car's locations
        const spotRect = $(this.spotID)[0].getBoundingClientRect();
        const carRect = $("#player-hitbox")[0].getBoundingClientRect();

        // If the spot is angled, run a much more complex check
        if (this.angledSpots.includes(this.spotNum)) {
            return this.checkParkingCompletionAngled(spotRect, carRect);
        }

        if (
            carRect.left >= spotRect.left - leeway &&
            carRect.right <= spotRect.right + leeway &&
            carRect.top >= spotRect.top - leeway &&
            carRect.bottom <= spotRect.bottom + leeway
        ) {
            $(this.spotID).removeClass("highlighted-spot").addClass("completed-spot");
            return true;
        }

        return false;
    }


    // Check if the car is correctly parked in the current spot for angled spots
    checkParkingCompletionAngled(spotRect, carRect) {
        const leewayX = 2; // Allow for 2px of leeway
        const leewayY = 0;

        // Spot data (rotate to align with axes)
        const spotAngle = 24;
        const spotCenter = {
            x: spotRect.left + spotRect.width / 2,
            y: spotRect.top + spotRect.height / 2
        };

        // Car data
        const transform = $("#car").css("transform");
        let carAngle = 0;
        if (transform && transform !== "none") {
            const values = transform.match(/matrix\(([^)]+)\)/);
            if (values) {
                const matrix = values[1].split(",").map(Number);
                carAngle = Math.atan2(matrix[1], matrix[0]) * (180 / Math.PI);
            }
        }

        // Prevent car's completing angled spots horizontally 
        if (this.angledSpots.includes(this.spotNum) && carAngle % 180 > 45) return false;

        const carCenter = {
            x: carRect.left + carRect.width / 2,
            y: carRect.top + carRect.height / 2
        };

        // Align everything to the axes by reversing the spot's rotation
        const alignedCarCorners = this.getRotatedCorners(carCenter, carRect.width, carRect.height, carAngle - spotAngle);
        const alignedSpotCorners = this.getRotatedCorners(spotCenter, spotRect.width, spotRect.height, 0); // Already axis-aligned

        // Check if all car corners are inside the spot's axis-aligned bounding box
        const spotBounds = this.getBoundingBox(alignedSpotCorners);
        for (const corner of alignedCarCorners) {
            if (
                corner.x < spotBounds.left - leewayX ||
                corner.x > spotBounds.right + leewayX ||
                corner.y < spotBounds.top - leewayY ||
                corner.y > spotBounds.bottom + leewayY
            ) {
                return false;
            }
        }

        $(this.spotID).removeClass("highlighted-spot").addClass("completed-spot");
        return true;
    }

    // Get rotated corners of a rectangle
    getRotatedCorners(center, width, height, angle) {
        const radians = (Math.PI / 180) * angle;
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const corners = [
            { x: -halfWidth, y: -halfHeight }, // Top-left
            { x: halfWidth, y: -halfHeight },  // Top-right
            { x: halfWidth, y: halfHeight },   // Bottom-right
            { x: -halfWidth, y: halfHeight }  // Bottom-left
        ];

        return corners.map(corner => {
            return {
                x: center.x + corner.x * Math.cos(radians) - corner.y * Math.sin(radians),
                y: center.y + corner.x * Math.sin(radians) + corner.y * Math.cos(radians)
            };
        });
    }

    // Get axis-aligned bounding box from corners
    getBoundingBox(corners) {
        const xs = corners.map(corner => corner.x);
        const ys = corners.map(corner => corner.y);

        return {
            left: Math.min(...xs),
            right: Math.max(...xs),
            top: Math.min(...ys),
            bottom: Math.max(...ys)
        };
    }


    // Removes outline and glow after the round is done
    revertSpot() {
        $(this.spotID).removeClass("highlighted-spot completed-spot");
    }
}

export default SpotManager;
