// timer.js
let time = 0;
let timerDiv = document.getElementById("timer-display");
let timerInterval;

// Update the timer every second
function updateTimer(){
    time += 1;
    timerDiv.textContent = time;
}

// Start the timer
function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(updateTimer, 1000);
    }
}

// Stop the timer
function stopTimer() {
   const getFinalTime = saveTime();
   timerDiv.textContent = getFinalTime;
   clearInterval(timerInterval);
   timerInterval = null;

}

// Reset the timer
function resetTimer() {
    time = 0;
    timerDiv.textContent = time;
}

//Save timer for end popup
function saveTime(){
    const userTime = time;
    return userTime;
}

export { startTimer, stopTimer, resetTimer, saveTime };