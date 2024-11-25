import { initializeCustomCursor } from './cursor.js';
import { StarSystem } from './starsystem.js';
import { AudioPlayer } from './audioplayer.js';
import { SceneSetup } from './scenesetup.js';
import { InteractionHandler } from './interactionhandler.js';

const sceneSetup = new SceneSetup();
const starSystem = new StarSystem(sceneSetup.scene);
const audioPlayer = new AudioPlayer(starSystem, sceneSetup.bloomPass);
const interactionHandler = new InteractionHandler(sceneSetup, starSystem, audioPlayer);

starSystem.createStars();

window.resetPage = function() {
    audioPlayer.stop();
    starSystem.resetAllStars();
    sceneSetup.resetCamera();
}

window.triggerSpica = function() {
    interactionHandler.triggerSpecificStar('Spica');
}

sceneSetup.animate();
initializeCustomCursor();