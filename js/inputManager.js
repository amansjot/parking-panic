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

        const self = this;
        this.game = game;
        this.carManager = carManager;
        this.hideCursorTimer = null; // Timer to reset the cursor
        this.inactivityTimer = null; // Timer for inactivity
        this.inputFocused = false; // Whether an input is focused

        // Bind event listeners for focus, blur, keydown, keyup, mousemove, and click
        $(document).on('focus', 'input', function () {
            self.inputFocused = true;
        });
        
        $(document).on('blur', 'input', function () {
            self.inputFocused = false;
        });

        $(document).on('keydown', (e) => this.handleKeyDown(e));

        $(document).on('keyup', (e) => {
            if (!self.inputFocused) this.handleKeyUp(e);
        });
        
        $(document).on('mousemove', () => this.showCursor());

        $(document).on('keydown keyup mousemove click', () => this.resetInactivityTimer());

        this.resetInactivityTimer();
    }

    // Function to handle keydown events
    handleKeyDown(e) {
        const key = e.key.toLowerCase();

        // Enter key goes to save name input
        if (this.inputFocused) {
            if (key == "enter") $("#save-name").focus();
            if (key === " ") e.preventDefault();
            return;
        }

        // If overlay is active, only allow / to close it
        if (this.game.overlay) {
            if (key == '/' && this.game.overlay === "help" ||
                key == 'l' && this.game.overlay === "leaderboard" ||
                key == "escape") this.game.closeOverlay();
            return;
        }

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
                this.game.toggleOverlay("help");
                break;
            case 'l': // Leaderboard shortcut
                this.game.toggleOverlay("leaderboard");
                break;
            case '.': // Pause shortcut
                this.game.togglePaused();
                break;
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
        this.inactivityTimer = setTimeout(() => {
            if (!this.game.gamePaused) this.game.togglePaused();
        }, 30000);
    }

    // Hide the cursor after 10s of inactivity
    hideCursor() {
        clearTimeout(this.hideCursorTimer); // Clear any existing timer
        $('body').css('cursor', 'none');
        this.hideCursorTimer = setTimeout(() => this.showCursor(), 10000);
    }

    // Show the cursor and clear the timer
    showCursor() {
        clearTimeout(this.hideCursorTimer);
        $('body').css('cursor', '');
    }
}

export default InputManager;