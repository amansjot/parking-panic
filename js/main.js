import { Car } from './movement.js';

$(function () {
    const game = new Game();
    const keys = { w: false, s: false, a: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
    const carElement = document.getElementById('car');
    const car = new Car(carElement, game.scale);

    const headlights = $('#headlights'); // DOM element for headlights

    $(document).on('keydown', function (e) {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
        }

        // Handle 'H' key to toggle headlights
        if (e.key.toLowerCase() === 'h') {
            car.toggleHeadlights(headlights);
        }
    });

    $(document).on('keyup', function (e) {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });

    setInterval(() => {
        car.move(keys);  // Move the car based on the keys
        car.rotate(keys); // Rotate the car
        car.updateCSS();  // Update the car's position and rotation in the DOM
    }, 20); // Run the update loop 50 times per second
});

class Game {
    constructor() {
        this.scaleWindow = document.getElementById("scroll-window");
        this.scale = 1; // Default scale factor
        window.addEventListener("resize", this.resize);
        this.resize(); // Initialize the scale on page load
    }

    resize = () => {
        let width = window.innerWidth;
        let height = window.innerHeight - 100; // Adjust height if necessary
        let newSize = Math.min(width, height);
        this.scale = newSize / 1002;  // Dynamically calculate the scale factor
        this.scaleWindow.style.transform = `scale(${this.scale})`;  // Apply scale to the game window
        this.scaleWindow.style.marginLeft = (width - newSize) / 2 + "px";
    };
}

$("#easyMode").on("click", function () {
    $("#gameScreen").show();
});

$("#hardMode").on("click", function () {
    console.log("hard mode");
});
