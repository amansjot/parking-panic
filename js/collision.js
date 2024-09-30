const obstacles = []; // Array to store all registered obstacles

let currentScale = 1; // Variable to track the current scale of the game window

// Function to update the current scale of the game window
function updateScale(scale) {
    currentScale = scale;
}

// Function to register a new obstacle with its hitbox and element
function registerObstacle(hitbox, element) {
    obstacles.push({ hitbox, element });
}

// Function to check for collisions between the player and obstacles
function checkCollisions(playerData) {
    const playerCorners = calculateOBB(playerData); // Get the player's corners using OBB (Oriented Bounding Box)

    // Iterate through each obstacle and check for collisions
    for (let { hitbox, element } of obstacles) {
        const hitboxRect = getElementRect(hitbox[0]); // Get the obstacle's hitbox rect

        // Adjust the hitbox dimensions to account for scaling
        const adjustedHitboxRect = {
            left: hitboxRect.left,
            top: hitboxRect.top,
            right: hitboxRect.right,
            bottom: hitboxRect.bottom
        };

        // Check for collision between the player and obstacle
        if (checkCollision(playerCorners, adjustedHitboxRect)) {
            return true; // Collision detected
        }
    }

    return false; // No collision detected
}

// Function to get the bounding rect of an element, adjusted for scaling
function getElementRect(element) {
    const rect = element.getBoundingClientRect(); // Get the element's bounding box
    const scrollWindow = document.getElementById('scroll-window'); // Get the scroll window's bounding box
    const scrollRect = scrollWindow.getBoundingClientRect();

    // Return adjusted bounding box values based on scaling
    return {
        left: (rect.left - scrollRect.left) / currentScale,
        top: (rect.top - scrollRect.top) / currentScale,
        right: (rect.right - scrollRect.left) / currentScale,
        bottom: (rect.bottom - scrollRect.top) / currentScale,
        width: rect.width / currentScale,
        height: rect.height / currentScale
    };
}

// Function to calculate the player's Oriented Bounding Box (OBB) based on its position, size, and angle
function calculateOBB(data) {
    const halfWidth = data.width / 2;
    const halfHeight = data.height / 2;

    // Rotate the four corners of the player's bounding box around its center
    const corners = [
        rotatePoint(-halfWidth, -halfHeight, data.angle), // Top-left corner
        rotatePoint(halfWidth, -halfHeight, data.angle),  // Top-right corner
        rotatePoint(halfWidth, halfHeight, data.angle),   // Bottom-right corner
        rotatePoint(-halfWidth, halfHeight, data.angle)   // Bottom-left corner
    ];

    // Adjust the rotated corners based on the player's position
    return corners.map(point => ({
        x: point.x + data.x + halfWidth,
        y: point.y + data.y + halfHeight
    }));
}

// Function to rotate a point by a given angle
function rotatePoint(x, y, angle) {
    const radians = angle * Math.PI / 180; // Convert angle to radians
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    // Apply rotation to the point
    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
    };
}

// Function to check for collision between the player's OBB and the obstacle's bounding box using SAT (Separating Axis Theorem)
function checkCollision(playerCorners, obstacleRect) {
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
    return axes.every(axis => overlapOnAxis(playerCorners, obstacleCorners, axis));
}

// Function to check if two shapes overlap when projected onto an axis
function overlapOnAxis(cornersA, cornersB, axis) {
    const projA = projectOntoAxis(cornersA, axis); // Projection of the first shape
    const projB = projectOntoAxis(cornersB, axis); // Projection of the second shape

    // Check for overlap between the projections
    return projA.min <= projB.max && projB.min <= projA.max;
}

// Function to project the corners of a shape onto an axis
function projectOntoAxis(corners, axis) {
    const dots = corners.map(corner => corner.x * axis.x + corner.y * axis.y); // Dot product of each corner with the axis

    // Return the minimum and maximum projection values
    return { min: Math.min(...dots), max: Math.max(...dots) };
}

export { obstacles, checkCollisions, registerObstacle, updateScale };
