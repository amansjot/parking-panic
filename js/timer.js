// timer.js
let time = 0; //set it to 0 at start
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
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
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

//im adding the level counting functions in here 
let levels = 0;
let levelCount = document.getElementById("level-display");

function increaseLevels(){//Increases Game level for the user
    levels += 1;
    //const level = document.getElementById("level-display");
    //levelCount.textContent = "Level: " + levelTot;
}

function getLevels(){
    const levelTot = levels;
    return levelTot;
}

function resetLevels(){ //when game resets returns back to 0
    //const levelCount = document.getElementById("level-display");
    levels = 0;
    levelCount.textContent = "Level: " + levels;
}
export { startTimer, stopTimer, resetTimer, saveTime, increaseLevels, resetLevels, getLevels };