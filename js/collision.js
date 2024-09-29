// An array to store all obstacles in the game
const obstacles = [];

// Variable to hold the current scale factor of the game
let currentScale = 1;

// Function to update the scale of the game (used for scaling hitboxes if the game is zoomed in/out)
function updateScale(scale) {
    currentScale = scale;
}

// Function to register an obstacle by adding its hitbox and associated element to the obstacles array
function registerObstacle(hitbox, element) {
    obstacles.push({ hitbox, element });
}

// Function to check for collisions between the player's car and any registered obstacles
function checkCollisions(playerData) {
    const playerCorners = calculateOBB(playerData);

    for (let { hitbox, element } of obstacles) {
        const hitboxRect = getElementRect(hitbox[0]);
        // const obstacleRect = getElementRect(element[0]);
        
        const adjustedHitboxRect = {
            left: hitboxRect.left,
            top: hitboxRect.top,
            right: hitboxRect.right,
            bottom: hitboxRect.bottom
        };

        if (checkCollision(playerCorners, adjustedHitboxRect)) {
            return true;
        }
    }

    return false;
}

// Function to retrieve the bounding rectangle of an element and adjust it based on the current game scale
function getElementRect(element) {
    const rect = element.getBoundingClientRect();
    const scrollWindow = document.getElementById('scroll-window');
    const scrollRect = scrollWindow.getBoundingClientRect();
    
    // Return the element's rect values adjusted for the game's current scale
    return {
        left: (rect.left - scrollRect.left) / currentScale,
        top: (rect.top - scrollRect.top) / currentScale,
        right: (rect.right - scrollRect.left) / currentScale,
        bottom: (rect.bottom - scrollRect.top) / currentScale,
        width: rect.width / currentScale,
        height: rect.height / currentScale
    };
}

// Function to calculate the oriented bounding box (OBB) of the player using their position, size, and angle
function calculateOBB(data) {
    const halfWidth = data.width / 2;
    const halfHeight = data.height / 2;
    const corners = [
        rotatePoint(-halfWidth, -halfHeight, data.angle),
        rotatePoint(halfWidth, -halfHeight, data.angle),
        rotatePoint(halfWidth, halfHeight, data.angle),
        rotatePoint(-halfWidth, halfHeight, data.angle)
    ];
    return corners.map(point => ({
        x: point.x + data.x + halfWidth,
        y: point.y + data.y + halfHeight
    }));
}

// Function to rotate a point around the origin (0, 0) by a specified angle
function rotatePoint(x, y, angle) {
    const radians = angle * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
    };
}

// Function to check if the player's bounding box collides with the obstacle's bounding box
function checkCollision(playerCorners, obstacleRect) {
    const obstacleCorners = [
        { x: obstacleRect.left, y: obstacleRect.top },
        { x: obstacleRect.right, y: obstacleRect.top },
        { x: obstacleRect.right, y: obstacleRect.bottom },
        { x: obstacleRect.left, y: obstacleRect.bottom }
    ];

    const axes = [
        { x: 1, y: 0 }, { x: 0, y: 1 },
        { x: playerCorners[1].x - playerCorners[0].x, y: playerCorners[1].y - playerCorners[0].y },
        { x: playerCorners[3].x - playerCorners[0].x, y: playerCorners[3].y - playerCorners[0].y }
    ];

    return axes.every(axis => overlapOnAxis(playerCorners, obstacleCorners, axis));
}

// Function to check if two shapes overlap on a given axis
function overlapOnAxis(cornersA, cornersB, axis) {
    const projA = projectOntoAxis(cornersA, axis);
    const projB = projectOntoAxis(cornersB, axis);
    return projA.min <= projB.max && projB.min <= projA.max;
}

// Function to project the corners of a shape onto a given axis and return the min/max projections
function projectOntoAxis(corners, axis) {
    const dots = corners.map(corner => corner.x * axis.x + corner.y * axis.y);
    return { min: Math.min(...dots), max: Math.max(...dots) };
}

export { obstacles, checkCollisions, registerObstacle, updateScale, getElementRect };