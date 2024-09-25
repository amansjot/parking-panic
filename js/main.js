import { Car } from './movement.js';

$(function () {
    const game = new Game(); // Create a Game instance
    const headlights = $('#headlights'); // DOM element for headlights

    $(document).on('keydown', function (e) {
        game.handleKeyDown(e, headlights);
    });

    $(document).on('keyup', function (e) {
        game.handleKeyUp(e);
    });

    $("#easyMode").on("click", function () {
        console.log("easy mode");

        $("#parkingSpots .btn").unbind("click");
        game.startScreen = false;

        $(this).css("background-color", "darkgreen");

        setTimeout(function () {
            $("#start-scroll-window").animate({
                opacity: 0
            }, 500);
        }, 700);

        game.switchMode("easyMode-scroll-window");  // Switch to Easy Mode
    });

    $("#hardMode").on("click", function () {
        console.log("hard mode");

        $("#parkingSpots .btn").unbind("click");
        game.startScreen = false;

        $(this).css("background-color", "darkred");

        setTimeout(function () {
            $("#start-scroll-window").animate({
                opacity: 0
            }, 500);
        }, 700);

        game.switchMode("hardMode-scroll-window");  // Switch to Hard Mode
    });
});

class Game {
    constructor() {
        this.scaleWindow = document.getElementById("start-scroll-window");
        this.scale = 1; // Default scale factor
        this.keys = { w: false, s: false, a: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
        this.car = null; // Placeholder for the Car object
        this.updateInterval = null; // Store interval ID
        this.headlightsOn = false;
        this.initializeGame(); // Initialize the game on load

        window.addEventListener("resize", this.resize);
        this.resize(); // Initialize the scale on page load
    }

    initializeGame() {
        this.car = new Car(document.getElementById('car'), this.scale);
        this.startCarUpdate(); // Start updating the car's movement and rotation
    }

    // Start the update loop for the car's movement and rotation
    startCarUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval); // Clear previous interval if any
        }
        this.updateInterval = setInterval(() => {
            this.car.move(this.keys);  // Move the car based on the keys
            this.car.rotate(this.keys); // Rotate the car
            this.car.updateCSS();  // Update the car's position and rotation in the DOM
        }, 20); // Run the update loop 50 times per second
    }

    // Handle key down events
    handleKeyDown(e, headlights) {
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = true;
        }

        // Handle 'H' key to toggle headlights
        if (e.key.toLowerCase() === 'h') {
            this.car.toggleHeadlights(headlights);
        }
    }

    // Handle key up events
    handleKeyUp(e) {
        if (this.keys.hasOwnProperty(e.key)) {
            this.keys[e.key] = false;
        }
    }

    // Resize the game window and scale the content
    resize = () => {
        let width = window.innerWidth;
        let height = window.innerHeight - 100; // Adjust height if necessary
        let newSize = Math.min(width, height);
        this.scale = newSize / 1002;  // Dynamically calculate the scale factor
        this.scaleWindow.style.transform = `scale(${this.scale})`;  // Apply scale to the game window
        this.scaleWindow.style.marginLeft = (width - newSize) / 2 + "px";

        // If there's a car object, update its scale
        if (this.car) {
            this.car.scale = this.scale;
        }
    };

    // Switch between easy mode and hard mode
    switchMode(newMode) {
        this.scaleWindow = document.getElementById(newMode);

        // Hide the old mode
        setTimeout(() => {
            $("#start-scroll-window").css({
                "opacity": "0",
                "height": "0"
            });
            $("#easyMode-scroll-window").css("opacity", 0);
            $("#hardMode-scroll-window").css("opacity", 0);
            $("#" + newMode).animate({
                opacity: 1
            }, 500);
        }, 1200);

        this.resize();  // Adjust the scale
        this.reinitializeCar();  // Create a new Car object for the new mode
    }

    // Reinitialize the car for the new mode
    reinitializeCar() {
        console.log("new car!");
        const carElement = document.getElementById('easyMode-car');
        this.car = new Car(carElement, this.scale); // Create a new Car object with the current scale
        this.startCarUpdate();  // Start updating the car's movement and rotation again
    }
}
