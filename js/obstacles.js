import { registerObstacle } from './collision.js';
import { spots } from './randomspot.js';

// Define red zones with their boundaries (top-left and bottom-right corners)
let goalSpot;
const redZones = [
    {
        x1: 145,   // top-left x
        y1: 145,   // top-left y
        x2: 145 + 710,  // bottom-right x
        y2: 145 + 72    // bottom-right y
    },
    {
        x1: 215,
        y1: 282,
        x2: 215 + 255,
        y2: 282 + 165
    },
    {
        x1: 540,
        y1: 282,
        x2: 540 + 245,
        y2: 282 + 165
    },
    {
        x1: 215,
        y1: 525,
        x2: 215 + 320,
        y2: 525 + 165
    },
    {
        x1: 620,
        y1: 560,
        x2: 620 + 170,
        y2: 560 + 130
    },
    {
        x1: 340,
        y1: 775,
        x2: 340 + 515,
        y2: 775 + 85
    }
];

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

export function createCarObstacle(spot) {
    // Generate random car type
    // const carType = Math.floor(Math.random() * 4) + 1;
    const carType = 2;

    const html = `<div class="car-obstacle" id="car-${spot}" style="left: 12.5px;">
            <img class="car-img" src="img/obstacles/car${carType}.png" alt="car">
            <div class="car-hitbox"></div>
        </div>`;
        
    $(`#${spots[spot]}`).append(html);

    // Register the new obstacle for collision detection
    const obstacleID = $(`#car-${spot}`);
    const obstacleHitbox = $(`#car-${spot} .car-hitbox`);
    registerObstacle(obstacleHitbox, obstacleID);
}

export function resetRedZones(spotID) {
    // Remove any obstacle red zone
    redZones.splice(6);

    // Update the goal spot ID
    goalSpot = spotID;
}

// Function to check if two rectangles overlap
function doRectanglesOverlap(rect1, rect2) {
    return !(rect1.x1 > rect2.x2 ||  // left of cone is to the right of the red zone
        rect1.x2 < rect2.x1 ||  // right of cone is to the left of the red zone
        rect1.y1 > rect2.y2 ||  // top of cone is below the red zone
        rect1.y2 < rect2.y1);   // bottom of cone is above the red zone
}

// Check if an obstacle intersects any red zone
function isInRedZone(size, posX, posY) {
    // Define the rectangle for the obstacle
    const obstacleRect = {
        x1: posX,             // obstacle's top-left x
        y1: posY,             // obstacle's top-left y
        x2: posX + size.h,  // obstacle's bottom-right x
        y2: posY + size.w   // obstacle's bottom-right y
    };

    // Check if the obstacle's rectangle overlaps with any red zone
    for (const zone of redZones) {
        if (doRectanglesOverlap(obstacleRect, zone)) {
            return true;  // The obstacle overlaps a red zone
        }
    }

    // Add the obstacle to redZones
    redZones.push(obstacleRect);

    return false;  // No overlap
}

export function generateObstaclePosition(obstacleSize) {
    let posX, posY;
    let minX = 145;
    let minY = 145;
    let maxX = 855 - obstacleSize.h;
    let maxY = 855 - obstacleSize.w;

    do {
        posX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;  // Generate random X
        posY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;  // Generate random Y
    } while (isInRedZone(obstacleSize, posX, posY));

    return { posX, posY };  // Return the valid coordinates
}