class CollisionHandler {
    constructor() {
        this.obstacles = []; // Array to store all registered obstacles
        this.currentScale = 1; // Variable to track the current scale of the game window
    }

    // Method to update the current scale of the game window
    updateScale(scale) {
        this.currentScale = scale;
    }

    // Method to register a new obstacle with its hitbox and element
    registerObstacle(hitbox, element) {
        this.obstacles.push({ hitbox, element });
    }

    // Method to check for collisions between the player and obstacles
    checkCollisions(playerData) {
        const playerCorners = this.calculateOBB(playerData); // Get the player's corners using OBB (Oriented Bounding Box)

        // Iterate through each obstacle and check for collisions
        for (let { hitbox, element } of this.obstacles) {
            const hitboxRect = this.getElementRect(hitbox[0]); // Get the obstacle's hitbox rect

            // Adjust the hitbox dimensions to account for scaling
            const adjustedHitboxRect = {
                left: hitboxRect.left,
                top: hitboxRect.top,
                right: hitboxRect.right,
                bottom: hitboxRect.bottom
            };

            // Check for collision between the player and obstacle
            if (this.checkCollision(playerCorners, adjustedHitboxRect)) {
                
                // // Approximate collision points (overlap center)
                // const collisionPoint = {
                //     x: (Math.max(playerCorners[0].x, adjustedHitboxRect.left) +
                //         Math.min(playerCorners[2].x, adjustedHitboxRect.right)) / 2,
                //     y: (Math.max(playerCorners[0].y, adjustedHitboxRect.top) +
                //         Math.min(playerCorners[2].y, adjustedHitboxRect.bottom)) / 2
                // };
                // console.log(collisionPoint);

                return true; // Collision detected
            }
        }

        return false; // No collision detected
    }

    // Method to get the bounding rect of an element, adjusted for scaling
    getElementRect(element) {
        const rect = element.getBoundingClientRect(); // Get the element's bounding box
        const scrollWindow = document.getElementById('scroll-window'); // Get the scroll window's bounding box
        const scrollRect = scrollWindow.getBoundingClientRect();

        // Return adjusted bounding box values based on scaling
        return {
            left: (rect.left - scrollRect.left) / this.currentScale,
            top: (rect.top - scrollRect.top) / this.currentScale,
            right: (rect.right - scrollRect.left) / this.currentScale,
            bottom: (rect.bottom - scrollRect.top) / this.currentScale,
            width: rect.width / this.currentScale,
            height: rect.height / this.currentScale
        };
    }

    // Method to calculate the player's Oriented Bounding Box (OBB) based on its position, size, and angle
    calculateOBB(data) {
        const halfWidth = data.size.width / 2;
        const halfHeight = data.size.height / 2;

        // Rotate the four corners of the player's bounding box around its center
        const corners = [
            this.rotatePoint(-halfWidth, -halfHeight, data.position.angle), // Top-left corner
            this.rotatePoint(halfWidth, -halfHeight, data.position.angle),  // Top-right corner
            this.rotatePoint(halfWidth, halfHeight, data.position.angle),   // Bottom-right corner
            this.rotatePoint(-halfWidth, halfHeight, data.position.angle)   // Bottom-left corner
        ];

        // Adjust the rotated corners based on the player's position
        return corners.map(point => ({
            x: point.x + data.position.x + halfWidth,
            y: point.y + data.position.y + halfHeight
        }));
    }

    // Method to rotate a point by a given angle
    rotatePoint(x, y, angle) {
        const radians = angle * Math.PI / 180; // Convert angle to radians
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        // Apply rotation to the point
        return {
            x: x * cos - y * sin,
            y: x * sin + y * cos
        };
    }

    // Method to check for collision between the player's OBB and the obstacle's bounding box using SAT (Separating Axis Theorem)
    checkCollision(playerCorners, obstacleRect) {
        // Define the corners of the obstacle's bounding box
        const obstacleCorners = [
            { x: obstacleRect.left, y: obstacleRect.top },
            { x: obstacleRect.right, y: obstacleRect.top },
            { x: obstacleRect.right, y: obstacleRect.bottom },
            { x: obstacleRect.left, y: obstacleRect.bottom }
        ];

        // Define axes to project onto for collision detection
        const axes = [
            { x: 1, y: 0 }, { x: 0, y: 1 },  // Axes for the obstacle (aligned with the bounding box)
            { x: playerCorners[1].x - playerCorners[0].x, y: playerCorners[1].y - playerCorners[0].y },  // Axis for player's top edge
            { x: playerCorners[3].x - playerCorners[0].x, y: playerCorners[3].y - playerCorners[0].y }   // Axis for player's left edge
        ];

        // Check for overlap on each axis
        return axes.every(axis => this.overlapOnAxis(playerCorners, obstacleCorners, axis));
    }

    // Method to check if two shapes overlap when projected onto an axis
    overlapOnAxis(cornersA, cornersB, axis) {
        const projA = this.projectOntoAxis(cornersA, axis); // Projection of the first shape
        const projB = this.projectOntoAxis(cornersB, axis); // Projection of the second shape

        // Check for overlap between the projections
        return projA.min <= projB.max && projB.min <= projA.max;
    }

    // Method to project the corners of a shape onto an axis
    projectOntoAxis(corners, axis) {
        const dots = corners.map(corner => corner.x * axis.x + corner.y * axis.y); // Dot product of each corner with the axis

        // Return the minimum and maximum projection values
        return { min: Math.min(...dots), max: Math.max(...dots) };
    }
}

export default CollisionHandler;
