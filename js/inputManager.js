class InputManager {
    constructor(game, carManager) {
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
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
        const code = e.code;
        
        // Prevent browser scrolling or interference with movement keys
        if (["w", "s", "a", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
            e.preventDefault();
        }
    
        // Movement Keys (Using e.key to support AZERTY/Dvorak layouts)
        if (key === "w" || key === "arrowup") this.keys.up = true;
        if (key === "s" || key === "arrowdown") this.keys.down = true;
        if (key === "a" || key === "arrowleft") this.keys.left = true;
        if (key === "d" || key === "arrowright") this.keys.right = true;
    
        // Hide the cursor when using the keyboard
        this.hideCursor();

        // Shortcuts (Using e.code for consistent keybinds across layouts)
        switch (code) {
            case "Slash": // Help shortcut
                this.game.toggleOverlay("help");
                break;
            case "KeyL": // Leaderboard shortcut
                this.game.toggleOverlay("leaderboard");
                break;
            case "Period": // Pause shortcut
                this.game.togglePaused();
                break;
            case "Backspace": // Exit shortcut (Windows)
            case "Delete": // Exit shortcut (Mac)
                e.preventDefault(); // Prevent default behavior
                this.game.confirmExitGame();
                break;
            case "KeyH": // Toggle headlights
                this.carManager.toggleHeadlights();
                break;
            case "KeyG": // Play horn
                this.carManager.playHorn();
                break;
        }    
    }

    // Function to handle keyup events
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
    
        // Ensure multi-key functionality (Only release the specific key)
        if (key === "w" || key === "arrowup") this.keys.up = false;
        if (key === "s" || key === "arrowdown") this.keys.down = false;
        if (key === "a" || key === "arrowleft") this.keys.left = false;
        if (key === "d" || key === "arrowright") this.keys.right = false;    
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
        clearTimeout(this.hideCursorTimer);
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
