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
    registerObstacle(hitbox, element, angle = 0) {
        this.obstacles.push({ hitbox, element, angle });
    }

    // Method to check for collisions between the player and obstacles
    checkCollisions(playerData) {
        const playerCorners = this.calculateOBB(playerData); // Get the player's OBB corners
    
        // Iterate through each obstacle and check for collisions
        for (let { hitbox, element, angle } of this.obstacles) {
            const hitboxRect = this.getElementRect(hitbox[0]); // Get the obstacle's bounding rect
    
            // Check if the obstacle has a specific rotation (e.g., 18 degrees)
            const obstacleCorners = this.calculateRotatedOBB(hitboxRect, angle); // Get rotated obstacle's corners
    
            // Check for collision using both sets of corners
            if (this.checkCollision(playerCorners, obstacleCorners)) {
                return true; // Collision detected
            }
        }
    
        return false; // No collision detected
    }

    // Method to get the bounding rect of an element, adjusted for scaling
    getElementRect(element) {
        const rect = element.getBoundingClientRect(); // Get the element's bounding box
        const gameWindow = $('#game-window')[0]; // Get the scroll window's bounding box
        const gameRect = gameWindow.getBoundingClientRect();

        // Return adjusted bounding box values based on scaling
        return {
            left: (rect.left - gameRect.left) / this.currentScale,
            top: (rect.top - gameRect.top) / this.currentScale,
            right: (rect.right - gameRect.left) / this.currentScale,
            bottom: (rect.bottom - gameRect.top) / this.currentScale,
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

    calculateRotatedOBB(rect, angle) {
        const centerX = (rect.left + rect.right) / 2;
        const centerY = (rect.top + rect.bottom) / 2;
        const halfWidth = (rect.right - rect.left) / 2;
        const halfHeight = (rect.bottom - rect.top) / 2;
    
        // Calculate the rotated corners
        const corners = [
            this.rotatePoint(-halfWidth, -halfHeight, angle), // Top-left
            this.rotatePoint(halfWidth, -halfHeight, angle),  // Top-right
            this.rotatePoint(halfWidth, halfHeight, angle),   // Bottom-right
            this.rotatePoint(-halfWidth, halfHeight, angle)   // Bottom-left
        ];
    
        // Adjust corners to be relative to the rectangle's center
        return corners.map(point => ({
            x: point.x + centerX,
            y: point.y + centerY
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
    checkCollision(playerCorners, obstacleCorners) {
        // Define axes to project onto for collision detection
        const axes = [
            { x: playerCorners[1].x - playerCorners[0].x, y: playerCorners[1].y - playerCorners[0].y },  // Player top edge
            { x: playerCorners[3].x - playerCorners[0].x, y: playerCorners[3].y - playerCorners[0].y },  // Player left edge
            { x: obstacleCorners[1].x - obstacleCorners[0].x, y: obstacleCorners[1].y - obstacleCorners[0].y },  // Obstacle top edge
            { x: obstacleCorners[3].x - obstacleCorners[0].x, y: obstacleCorners[3].y - obstacleCorners[0].y }   // Obstacle left edge
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
