// import { playerData, moveCar, rotateCar, updatePlayerCSS, toggleHeadlights } from './movement.js';
// import { checkCollisions } from './collision.js';

// $(function () {
//     // Key states
//     const keys = {
//         w: false,
//         s: false,
//         a: false,
//         d: false
//     };

//     // DOM elements
//     const player = $('#car');
//     const obstacle = $('#obstacle');
//     const coneHitbox = $('#cone-hitbox');
//     const headlights = $('#headlights');

//     // Handle key presses
//     $(document).on('keydown', handleKeyDown);
//     $(document).on('keyup', handleKeyUp);

//     // Main update loop: Runs 50 times per second (every 20ms)
//     setInterval(updatePlayer, 10);

//     // Set initial state: Turn headlights off
//     headlights.hide();

//     function updatePlayer() {
//         moveCar(keys);
//         rotateCar(keys);
//         updatePlayerCSS(player);
//         const collision = checkCollisions(playerData, coneHitbox, obstacle);
//         updateCollisionVisual(collision);
//     }

//     function updateCollisionVisual(collision) {
//         $('#car-hitbox').css('background-color', collision ? 'rgba(0, 255, 0, 0.3)' : 'transparent');
//     }

//     // Handle key down
//     function handleKeyDown(e) {
//         if (keys.hasOwnProperty(e.key.toLowerCase())) {
//             keys[e.key.toLowerCase()] = true;
//         }

//         if (e.key.toLowerCase() === 'h') {  // Toggle headlights when 'H' key is pressed
//             toggleHeadlights(headlights);
//         }
//     }

//     // Handle key up
//     function handleKeyUp(e) {
//         if (keys.hasOwnProperty(e.key.toLowerCase())) {
//             keys[e.key.toLowerCase()] = false;
//         }
//     }
// });

// // Open game screen when you click a game mode

// $("#buttons .btn").on("click", function () {
//     $("#gameScreen").show();
//     $("#gameScreen").animate(
//         { marginTop: "-100vh" },
//         1000
//     );
// });










/* Various contstants used throughout the game*/
var Constants={
	unscaledSize: 1002,  //1000 plus border.
	shipHeight:70,
	shipWidth:50,
	headerHeight:150,
	borderWidth:1,
	timeInterval:60/1000, // 60 FPS
	initialFuel:100,
	engineThrust:5,
	crashVelocity:10,
	initialFuel:100,
	rotationSpeed:10,
	terrainSegmentWidth:100,
	maxTerrainHeight:100,
	allowedHeightDifference:5
}

$(function () {
    console.log("x");
    let game = new Game();
    console.log("z");
});

class Game {
    constructor() {
        this.scaleWindow = document.getElementById("scroll-window");
        // this.state = new GameState();
        // this.hud = new Hud(this.state);
        // this.ship = new Ship(this.state);
        // this.popup = new Popup();
        //handle resize events
        window.addEventListener("resize", this.resize);
        //handle keydown events
        // window.addEventListener("keydown", this.keyDown);
        // window.addEventListener("keyup", this.keyUp);
        //initial size
        this.resize();
        //update the game
        // this.hud.update();
        // this.state.update();
        // this.running = false;
        // this.timeout = null;
    };
    resize = () => {
        console.log("w");
        let width = window.innerWidth;
        let height = window.innerHeight - Constants.headerHeight;
        let newSize = Math.min(width, height);
        let scale = newSize / Constants.unscaledSize;
        this.scaleWindow.style.transform = `scale(${scale})`;
        this.scaleWindow.style.marginLeft = (width - newSize) / 2 + "px";
        // this.scaleWindow.style.marginTop = Constants.headerHeight + "px";
    };
}