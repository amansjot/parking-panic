class InputManager {
    constructor(carManager) {
        this.keys = {
            w: false,
            s: false,
            a: false,
            d: false,
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };

        this.carManager = carManager;
        this.hideCursorTimer = null; // Timer to reset the cursor

        // Bind event listeners for keydown, keyup, and mousemove
        $(document).on('keydown', (e) => this.handleKeyDown(e));
        $(document).on('keyup', (e) => this.handleKeyUp(e));
        $(document).on('mousemove', () => this.showCursor());
    }

    // Function to handle keydown events
    handleKeyDown(e) {
        const key = e.key.toLowerCase();

        // Set the key state to true when a key is pressed
        if (this.keys.hasOwnProperty(key) || this.keys.hasOwnProperty(e.code)) {
            this.keys[key] = true;
            this.keys[e.code] = true;
        }

        // Hide the cursor when using the keyboard
        this.hideCursor();

        // Toggle headlights with 'H' key
        if (key === 'h') {
            this.carManager.toggleHeadlights();
        }

        // Play horn with 'G' key
        if (key === 'g') {
            this.carManager.playHorn();
        }
    }

    // Function to handle keyup events
    handleKeyUp(e) {
        const key = e.key.toLowerCase();

        // Set the key state to false when the key is released
        if (this.keys.hasOwnProperty(key) || this.keys.hasOwnProperty(e.code)) {
            this.keys[key] = false;
            this.keys[e.code] = false;
        }
    }

    // Hide the cursor by applying the 'cursor: none' style
    hideCursor() {
        clearTimeout(this.hideCursorTimer); // Clear any existing timer
        $('body').css('cursor', 'none'); // Hide the cursor

        // Set a timer to reset the cursor after 10s of inactivity
        this.hideCursorTimer = setTimeout(() => this.showCursor(), 10000);
    }

    // Show the cursor by resetting the style
    showCursor() {
        clearTimeout(this.hideCursorTimer); // Clear the timer
        $('body').css('cursor', ''); // Reset the cursor style
    }
}

export default InputManager;