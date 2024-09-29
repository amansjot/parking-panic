// Import required functions from collision.js for updating the scale
import { updateScale } from './collision.js';

// DOM elements and scaling variables
const $scaleWindow = $('#scroll-window');
const $controls = $('#controls');
let unscaledSize = 1000;
let headerHeight = 150;

// Function to resize the game window and adjust scaling
export function resize() {
    let width = window.innerWidth;
    let height = window.innerHeight - headerHeight;
    let newSize = Math.min(width, height);
    let scale = newSize / unscaledSize;

    // Apply scale to the game window and controls
    $scaleWindow.css('transform', `scale(${scale})`);
    $scaleWindow.css('margin-left', (width - newSize) / 2 + "px");
    $controls.css('transform', `scale(${scale * 1.3})`);

    // Update the scale in the collision detection module
    updateScale(scale);
}

// Function to add resize event listener
export function addResizeEventListener() {
    window.addEventListener("resize", resize);
}
