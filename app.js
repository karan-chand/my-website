import { initializeCustomCursor } from './cursor.js';
import { StarSystem } from './starsystem.js';
import { AudioPlayer } from './audioplayer.js';
import { SceneSetup } from './scenesetup.js';
import { InteractionHandler } from './interactionhandler.js';
import { UIManager } from './ui.js';
import gsap from 'gsap';

// Initialize UI first
const uiManager = new UIManager();

// Initialize scene and core components
const sceneSetup = new SceneSetup();
const starSystem = new StarSystem(sceneSetup.scene);
const audioPlayer = new AudioPlayer(starSystem, sceneSetup.bloomPass);
const interactionHandler = new InteractionHandler(sceneSetup, starSystem, audioPlayer);

// Initialize constellation
starSystem.createStars();

// Global functions
window.resetPage = function() {
    audioPlayer.stop();
    starSystem.resetAllStars();
    sceneSetup.resetCamera();
}

window.triggerSpica = function() {
    interactionHandler.triggerSpecificStar('Spica');
}

// Start animation loop
function animate() {
    requestAnimationFrame(animate);
    sceneSetup.controls.update();
    sceneSetup.composer.render();
}
animate();

// Initialize cursor
initializeCustomCursor();