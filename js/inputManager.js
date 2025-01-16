class InputManager {
    constructor(game, carManager) {
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

        this.game = game;
        this.carManager = carManager;
        this.hideCursorTimer = null; // Timer to reset the cursor
        this.inactivityTimer = null; // Timer for inactivity

        // Bind event listeners for keydown, keyup, and mousemove
        $(document).on('keydown', (e) => this.handleKeyDown(e));
        $(document).on('keyup', (e) => this.handleKeyUp(e));
        $(document).on('mousemove', () => this.showCursor());
        $(document).on('keydown keyup mousemove click', () => this.resetInactivityTimer());
        this.resetInactivityTimer();
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

        // Handle specific shortcuts
        switch (key) {
            case '/': // Help shortcut
                this.game.toggleHelp();
                break;
            case '.': // Pause shortcut
                this.game.togglePaused();
                break;
            case 'escape':
                this.game.closeHelp();
            case 'backspace': // Exit shortcut (Windows)
            case 'delete': // Exit shortcut (Mac)
                e.preventDefault(); // Prevent default behavior
                this.game.confirmExitGame();
                break;
            case 'h': // Toggle headlights
                this.carManager.toggleHeadlights();
                break;
            case 'g': // Play horn
                this.carManager.playHorn();
                break;
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

    // Pause game after 30 seconds of inactivity
    resetInactivityTimer() {
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = setTimeout(() => this.game.pauseGame(), 30000);
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