// timer.js
let timeLeft = 30; // Starting time in seconds
let timerInterval;

//constant variables
const timerElement = $('#timer-display');
const missionFailedMessage = $('#mission-failed-message');

// Start the timer
function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(updateTimer, 1000);
    }
}
// Update the timer every second
function updateTimer() {
    timeLeft -= 1;
    timerElement.text(timeLeft);
    if (timeLeft <= 0) {
        stopTimer();
        timerElement.text("Time's up!");
        missionFailedMessage.show();
    }
}
// Stop the timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}
// Reset the timer
function resetTimer() {
    timeLeft = 30;
    timerElement.text(timeLeft);
}
export { startTimer, stopTimer, resetTimer };