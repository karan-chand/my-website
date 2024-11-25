import { initializeCustomCursor } from './cursor.js';
import { StarSystem } from './starsystem.js';
import { AudioPlayer } from './audioplayer.js';
import { SceneSetup } from './scenesetup.js';
import { InteractionHandler } from './interactionhandler.js';
import { UIManager } from './ui.js';
import { TextDisplay } from './textdisplay.js';

// Initialize UI first
const uiManager = new UIManager();

// Initialize core components
const sceneSetup = new SceneSetup();
const starSystem = new StarSystem(sceneSetup.scene);
const textDisplay = new TextDisplay(sceneSetup.scene, sceneSetup.camera);
const audioPlayer = new AudioPlayer(starSystem, sceneSetup.bloomPass, textDisplay);
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

// Start animation and cursor
sceneSetup.animate();
initializeCustomCursor();