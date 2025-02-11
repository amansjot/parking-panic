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

        // Secret shortcuts for auto-starting: Ctrl+Shift+E / Ctrl+Shift+H
        if (e.ctrlKey || e.metaKey) { // Check for Ctrl (Windows) or Cmd (Mac)
            if (e.shiftKey) { // Check if Shift is also pressed
                if (code === "KeyE") { // Ctrl+Shift+E for Easy Mode
                    e.preventDefault(); // Prevent browser behavior
                    if (this.game.gameState === "loading") this.game.initStartScreen();
                    this.game.startGame('easy-mode');
                    return;
                }
                if (code === "KeyH") { // Ctrl+Shift+H for Hard Mode
                    e.preventDefault(); // Prevent browser behavior
                    if (this.game.gameState === "loading") this.game.initStartScreen();
                    this.game.startGame('hard-mode');
                    return;
                }
            }
        }

        // Allow toggle full screen
        if (e.code === "KeyF") this.game.toggleFullScreen();

        // If overlay is active, only allow / to close it
        if (this.game.overlay) {
            if ((code === "Slash" && this.game.overlay === "help") ||
                (code === "KeyL" && this.game.overlay === "leaderboard") ||
                code === "Escape") {
                this.game.closeOverlay();
            }
            return;
        }

        // If game is loading, don't allow any input except overlays
        if (this.game.gameState === "loading") {
            if (code === "Slash") this.game.toggleOverlay("help");
            if (code === "KeyL") this.game.toggleOverlay("leaderboard");
            return;
        }

        // Enter key goes to save name input
        if (this.inputFocused) {
            if (code === "Enter") $("#save-name").focus();
            if (code === "Space") e.preventDefault();
            return;
        }

        // Prevent browser scrolling or interference with movement keys
        if (["w", "s", "a", "d"].includes(key) ||
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(code)) {
            e.preventDefault();
        }

        // Movement Keys (Using e.key to support all keyboard layouts)
        if (key === "w" || code === "ArrowUp") this.keys.up = true;
        if (key === "s" || code === "ArrowDown") this.keys.down = true;
        if (key === "a" || code === "ArrowLeft") this.keys.left = true;
        if (key === "d" || code === "ArrowRight") this.keys.right = true;

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
            case "Minus":
                this.game.skipRound();
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
