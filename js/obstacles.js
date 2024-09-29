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
        const html = `<div class="${type}-obstacle" style="top: ${x}px; right: ${x}px;">
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