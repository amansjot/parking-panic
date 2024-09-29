// ignore this, getting it work work in main for the time being first

import { startTimer, stopTimer, resetTimer, saveTime } from './timer.js';
import { revertParkingSpot } from './randomspot.js';
import { resetCar } from './movement.js';

//Shows a winning message to the user
export function showWinEndScreen(){
    stopTimer();
    const popUp = document.getElementById("endscreen-popup");
    popUp.style.visibility= "visible"; //shows it
    const congrats = document.getElementById("congrats");
    congrats.style.visibility= "visible";
    const totalTime = saveTime();
    const userTime = document.getElementById("userTime");
    userTime.style.visibility="visible";
    const userText = "You took "+ totalTime + " Seconds to Pass."
    userTime.textContent = userText;
}

//Shows a losing message to the user
export function showLoseEndScreen(){
    stopTimer();
    const popUp = document.getElementById("endscreen-popup");
    popUp.style.visibility= "visible"; //shows it
    const lost = document.getElementById("lost");
    lost.style.visibility= "visible";
    const lostMsg = document.getElementById("lostMsg");
    lostMsg.style.visibility= "visible";
}

//Hides the end of round popup
export function hideEndPopUp(){
    const popUp = document.getElementById("endscreen-popup");
    popUp.style.visibility="hidden";
    //win pop up values
    const congrats = document.getElementById("congrats");
    congrats.style.visibility= "hidden";
    const userTime = document.getElementById("userTime");
    userTime.style.visibility="hidden";
    //lost pop up values
    const lost = document.getElementById("lost");
    lost.style.visibility= "hidden";
    const lostMsg = document.getElementById("lostMsg");
    lostMsg.style.visibility= "hidden";
}

//Play again button on popup
export function handlePlayAgainButton() {
    $("#play-again").on("click", function () {
        startGame(gameState);
        hideEndPopUp();
        resetTimer();
    });
}

//Exit button on popup
export function handleExitButton() {
    $("#exit").on("click", function () {
        gameState = 'start';

        $("#Subtitle").text("Group 8: Aman Singh, Julia O'Neill, Kyle Malice, Solenn Gacon, Suhas Bolledula");

        $("#lives-counter").hide();
        $("#game-buttons").hide();
        $(".cone-obstacle, .dumpster-obstacle, .car-obstacle, .game-life").remove();

        $("#start-buttons").show();
        $("#easy-mode-button").css("background-color", "green");
        $("#hard-mode-button").css("background-color", "red");
        startTimer();
        hideEndPopUp();
        stopTimer();
        revertParkingSpot();
        resetCar(gameState);
        resetTimer();
    });
}

export function handleExitGameButton() {
    $("#exit-game-button").on("click", function () {
        gameState = 'start';

        $("#Subtitle").text("Group 8: Aman Singh, Julia O'Neill, Kyle Malice, Solenn Gacon, Suhas Bolledula");

        $("#lives-counter").hide();
        $("#game-buttons").hide();
        $(".cone-obstacle, .dumpster-obstacle, .car-obstacle, .game-life").remove();

        $("#start-buttons").show();
        $("#easy-mode-button").css("background-color", "green");
        $("#hard-mode-button").css("background-color", "red");
        revertParkingSpot();
        stopTimer();
        resetTimer();
        resetCar(gameState);
    });
}