class ObstacleManager {
    constructor(collisionHandler) {
        this.collisionHandler = collisionHandler;

        // Number of obstacles in a game
        this.numObstacles = {
            "easy-mode": { cones: 3, dumpsters: 2, cars: 5 },
            "hard-mode": { cones: 6, dumpsters: 4, cars: 12 }
        };

        this.angledSpots = [33, 34, 35, 36, 37]; // Angled parking spots
        this.carObstacles = [];

        this.coneSize = { w: 50, h: 50 }; // 50x50 px cones
        this.dumpsterSize = { w: 45, h: 25 }; // 45x25 px dumpsters

        this.redZones = [
            { x1: 145, y1: 145, x2: 145 + 710, y2: 145 + 72 },
            { x1: 215, y1: 282, x2: 215 + 255, y2: 282 + 165 },
            { x1: 540, y1: 282, x2: 540 + 245, y2: 282 + 165 },
            { x1: 215, y1: 525, x2: 215 + 320, y2: 525 + 165 },
            { x1: 620, y1: 560, x2: 620 + 170, y2: 560 + 130 },
            { x1: 340, y1: 775, x2: 340 + 515, y2: 775 + 85 }
        ];

        // Initialize map boundaries, parking dividers, and obstacles
        setTimeout(() => this.initializeObstacles(), 100);
        setTimeout(() => this.initializeParkingDividers(), 200);
        setTimeout(() => this.initializeMapBounds(), 300);
    }

    initializeMapBounds() {
        const $mapBounds = $('#map-bounds');
        const boundsSides = ['top', 'right', 'bottom', 'left'];

        boundsSides.forEach(side => {
            const $boundHitbox = $(`#${side}-bounds`);
            this.collisionHandler.registerObstacle($boundHitbox, $mapBounds);
        });
    }

    initializeParkingDividers() {
        const $mapParkingDividers = $('#map-parking-dividers');
        const parkingDividerSides = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

        parkingDividerSides.forEach(side => {
            const $boundHitbox = $(`#${side}-divider`);
            this.collisionHandler.registerObstacle($boundHitbox, $mapParkingDividers);
        });
    }

    initializeObstacles() {
        $('.cone-hitbox').each((index, hitbox) => {
            this.collisionHandler.registerObstacle($(hitbox), $('.cone-obstacle').eq(index));
        });

        $('.dumpster-hitbox').each((index, hitbox) => {
            this.collisionHandler.registerObstacle($(hitbox), $('.dumpster-obstacle').eq(index));
        });

        $('.car-hitbox').each((index, hitbox) => {
            this.collisionHandler.registerObstacle($(hitbox), $('.car-obstacle').eq(index));
        });
    }

    createObstacle(type, x, y) {
        if (["dumpster", "cone"].includes(type)) {
            const html = `<div class="game-obstacle ${type}-obstacle" style="top: ${y}px; left: ${x}px;">
                <img class="${type}-img" src="./img/obstacles/${type}.png" alt="${type}">
                <div class="hitbox ${type}-hitbox"></div>
            </div>`;
            $("#game-obstacles").append(html);

            const $obstacles = $(`.${type}-obstacle`);
            const $hitboxes = $(`.${type}-hitbox`);
            const index = $obstacles.length - 1;
            this.collisionHandler.registerObstacle($hitboxes.eq(index), $obstacles.eq(index));
        }
    }

    createCarObstacle(spot) {
        const carType = (this.carObstacles.length % 4) + 1;
        const rotation = Math.random() < 0.5 ? 0 : 180;
        const posLeft = (this.angledSpots.includes(spot)) ? "7.5" : "12.5";
        const angle = (this.angledSpots.includes(spot)) ? 18 : 0;
        const width = (this.angledSpots.includes(spot)) ? "5px": "28px";

        const html = `<div class="game-obstacle car-obstacle" id="car-${spot}" style="left: ${posLeft}px; rotate: ${rotation}deg;">
                <img class="car-img" src="./img/obstacles/car${carType}.png" alt="car">
                <div class="hitbox car-hitbox" style="width: ${width};"></div>
            </div>`;

        $(`#spot-${spot}`).append(html);

        const $obstacle = $(`#car-${spot}`);
        const $hitbox = $(`#car-${spot} .car-hitbox`);
        this.collisionHandler.registerObstacle($hitbox, $obstacle, angle);
    }

    generateAllObstacles(gameState, spotManager) {
        for (let i = 0; i < this.numObstacles[gameState].cones; i++) {
            const { posX, posY } = this.generateObstaclePosition(this.coneSize);
            this.createObstacle("cone", posX, posY);
        }

        for (let i = 0; i < this.numObstacles[gameState].dumpsters; i++) {
            const { posX, posY } = this.generateObstaclePosition(this.dumpsterSize);
            this.createObstacle("dumpster", posX, posY);
        }

        let carsRemaining = this.numObstacles[gameState].cars;
        while (carsRemaining > 0) {
            const spot = spotManager.generateRandomSpot();
            if (spot != spotManager.spotNum && !this.carObstacles.includes(spot)) {
                this.carObstacles.push(spot);
                this.createCarObstacle(spot);
                carsRemaining--;
            }
        }
    }

    // Reset obstacles and red zones
    resetObstacles() {
        this.carObstacles = [];
        this.redZones.splice(6);
        $(".game-obstacle").remove();
    }

    doRectanglesOverlap(rect1, rect2) {
        return !(rect1.x1 > rect2.x2 || rect1.x2 < rect2.x1 || rect1.y1 > rect2.y2 || rect1.y2 < rect2.y1);
    }

    isInRedZone(size, posX, posY) {
        const obstacleRect = {
            x1: posX,
            y1: posY,
            x2: posX + size.h,
            y2: posY + size.w
        };

        for (const zone of this.redZones) {
            if (this.doRectanglesOverlap(obstacleRect, zone)) {
                return true;
            }
        }

        this.redZones.push(obstacleRect);
        return false;
    }

    generateObstaclePosition(obstacleSize) {
        let posX, posY;
        const minX = 145;
        const minY = 145;
        const maxX = 855 - obstacleSize.h;
        const maxY = 855 - obstacleSize.w;

        do {
            posX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
            posY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
        } while (this.isInRedZone(obstacleSize, posX, posY));

        return { posX, posY };
    }
}

export default ObstacleManager;
