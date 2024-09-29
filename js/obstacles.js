import { registerObstacle } from './collision.js';

/** Map Bounds Registration
 * Registers the boundaries (map bounds) as obstacles for collision detection.
 * 
 * This function selects the map bounds' hitboxes and registers them as obstacles 
 * to ensure the player's car is restricted within the defined boundaries.
 * The boundaries include `top`, `right`, `bottom`, and `left` sides of the map.
 */
export function initializeMapBounds() {
    const mapBounds = $('#map-bounds');
    const boundsSides = ['top', 'right', 'bottom', 'left'];

    boundsSides.forEach(side => {
        const boundHitbox = $(`#${side}-bounds`);
        registerObstacle(boundHitbox, mapBounds);
    });
}

/** Map Parking Dividers Registration
 * Registers the parking dividers within the map as obstacles for collision detection.
 * 
 * This function selects the parking dividers within the map and registers them as obstacles. 
 * It ensures that the player's car cannot cross these parking dividers and treats them as collision objects.
 */
export function initializeParkingDividers() {
    const mapParkingDividers = $('#map-bounds');
    const parkingDividerSides = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

    parkingDividerSides.forEach(side => {
        const boundHitbox = $(`#${side}-divider`);
        registerObstacle(boundHitbox, mapParkingDividers);
    });

    // Initially hide some of the dividers
    $("#top-left-divider, #top-right-divider, #bottom-right-divider").hide();
}

/** Obstacles Registration (cones, dumpsters)
 * Registers predefined obstacles such as cones and dumpsters for collision detection.
 * 
 * Selects the existing cone and dumpster hitboxes within the map and registers 
 * them as obstacles for collision to work.
 */
export function initializeObstacles() {
    const coneHitboxes = $('.cone-hitbox');
    const cones = $('.cone-obstacle');
    const dumpsterHitboxes = $('.dumpster-hitbox');
    const dumpsters = $('.dumpster-obstacle');

    // Register each cone obstacle
    cones.each(function (index) {
        registerObstacle(coneHitboxes.eq(index), cones.eq(index));
    });

    // Register each dumpster obstacle
    dumpsters.each(function (index) {
        registerObstacle(dumpsterHitboxes.eq(index), dumpsters.eq(index));
    });
}

// Function to create a new obstacle (cones or cars) at a specific position
export function createObstacle(type, x, y) {
    if (["dumpster", "cone"].includes(type)) {
        const html = `<div class="${type}-obstacle" style="top: ${y}px; left: ${x}px;">
            <img class="${type}-img" src="img/obstacles/${type}.png" alt="${type}">
            <div class="${type}-hitbox"></div>
        </div>`;
        $("#scroll-window").append(html);

        // Register the new obstacle for collision detection
        const obstacleClass = $(`.${type}-obstacle`);
        const obstacleHitboxes = $(`.${type}-hitbox`);
        const index = obstacleClass.length - 1;
        registerObstacle(obstacleHitboxes.eq(index), obstacleClass.eq(index));
    }
}

// Function to check if two rectangles overlap
function doRectanglesOverlap(rect1, rect2) {
    return !(rect1.x1 > rect2.x2 ||  // left of cone is to the right of the red zone
        rect1.x2 < rect2.x1 ||  // right of cone is to the left of the red zone
        rect1.y1 > rect2.y2 ||  // top of cone is below the red zone
        rect1.y2 < rect2.y1);   // bottom of cone is above the red zone
}

// Check if a cone intersects any red zone
function isInRedZone(redZones, size, posX, posY) {
    // Define the rectangle for the cone (top-left corner and size 50x50)
    const coneRect = {
        x1: posX,             // cone's top-left x
        y1: posY,             // cone's top-left y
        x2: posX + size.h,  // cone's bottom-right x
        y2: posY + size.w   // cone's bottom-right y
    };

    // Check if the cone's rectangle overlaps with any red zone
    for (const zone of redZones) {
        if (doRectanglesOverlap(coneRect, zone)) {
            return true;  // The cone overlaps a red zone
        }
    }

    return false;  // No overlap
}

export function generateObstaclePosition(redZones, obstacleSize) {
    let posX, posY;
    let minX = 145;
    let minY = 145;
    let maxX = 855 - obstacleSize.h;
    let maxY = 855 - obstacleSize.w;

    do {
        posX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;  // Generate random X
        posY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;  // Generate random Y
    } while (isInRedZone(redZones, obstacleSize, posX, posY));

    console.log(posX + " " + posY);
    return { posX, posY };  // Return the valid coordinates
}