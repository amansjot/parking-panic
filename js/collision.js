const obstacles = [];

let currentScale = 1;

function updateScale(scale) {
    currentScale = scale;
}

function registerObstacle(hitbox, element) {
    obstacles.push({ hitbox, element });
}

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

function getElementRect(element) {
    const rect = element.getBoundingClientRect();
    const scrollWindow = document.getElementById('scroll-window');
    const scrollRect = scrollWindow.getBoundingClientRect();
    
    return {
        left: (rect.left - scrollRect.left) / currentScale,
        top: (rect.top - scrollRect.top) / currentScale,
        right: (rect.right - scrollRect.left) / currentScale,
        bottom: (rect.bottom - scrollRect.top) / currentScale,
        width: rect.width / currentScale,
        height: rect.height / currentScale
    };
}

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

function rotatePoint(x, y, angle) {
    const radians = angle * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos
    };
}

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

function overlapOnAxis(cornersA, cornersB, axis) {
    const projA = projectOntoAxis(cornersA, axis);
    const projB = projectOntoAxis(cornersB, axis);
    return projA.min <= projB.max && projB.min <= projA.max;
}

function projectOntoAxis(corners, axis) {
    const dots = corners.map(corner => corner.x * axis.x + corner.y * axis.y);
    return { min: Math.min(...dots), max: Math.max(...dots) };
}

export { obstacles, checkCollisions, registerObstacle, updateScale, getElementRect };