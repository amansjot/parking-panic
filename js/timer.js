// timer.js
import { stopCarMovement } from './movement.js';
import { isGameActive } from './gamestate.js';

let timeLeft = 30;
let timerInterval;

//constant variables
const timerElement = $('#timer-display');
const missionFailedMessage = $('#mission-failed-message');


// Start the timer if the game is active and a timer hasn't already been started
function startTimer() {
    if (!timerInterval && isGameActive()) {
        timerInterval = setInterval(updateTimer, 1000);
    }
}

// Update the timer every second and handle what happens when time runs out
function updateTimer() {
    timeLeft -= 1;
    timerElement.text(timeLeft);

    if (timeLeft <= 0) {
        stopTimer();
        timerElement.text("Time's up!");
        missionFailedMessage.show();
        stopCarMovement();
        setGameInactive();
    }
}

// Stop the timer by clearing the interval and resetting the timer reference
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Reset the timer file
function resetTimerFile() {
    timeLeft = 30; 
    timerElement.text(timeLeft); 
    stopTimer();
    missionFailedMessage.hide(); 
}

export { startTimer,  stopTimer, resetTimerFile };