const obstacles = [];

function registerObstacle(hitbox, element) {
    obstacles.push({ hitbox, element });
}

function checkCollisions(playerData) {
    const playerCorners = calculateOBB(playerData);

    for (let { hitbox, element } of obstacles) {
        const hitboxRect = hitbox[0].getBoundingClientRect();
        const obstacleRect = element[0].getBoundingClientRect();
        
        const adjustedHitboxRect = {
            left: hitboxRect.left - obstacleRect.left + obstacleRect.left,
            top: hitboxRect.top - obstacleRect.top + obstacleRect.top,
            right: hitboxRect.right - obstacleRect.left + obstacleRect.left,
            bottom: hitboxRect.bottom - obstacleRect.top + obstacleRect.top
        };

        if (checkCollision(playerCorners, adjustedHitboxRect)) {
            return true;
        }
    }

    return false;
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

export { checkCollisions, registerObstacle };