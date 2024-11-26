import { initializeCustomCursor } from './cursor.js';
import { StarSystem } from './starsystem.js';
import { SceneSetup } from './scenesetup.js';
import { InteractionHandler } from './interactionhandler.js';
import { UIManager } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI first to ensure DOM elements exist
    const uiManager = new UIManager();

    // Initialize scene and core components
    console.log('Initializing core components...');
    const sceneSetup = new SceneSetup();
    const starSystem = new StarSystem(sceneSetup.scene);
    const interactionHandler = new InteractionHandler(sceneSetup, starSystem);

    // Initialize constellation
    console.log('Creating star system...');
    starSystem.createStars();

    // Global functions
    window.resetPage = function() {
        console.log('Resetting page...');
        starSystem.resetAllStars();
        sceneSetup.resetCamera();
    }

    window.triggerSpica = function() {
        console.log('Triggering Spica...');
        interactionHandler.triggerSpecificStar('Spica');
    }

    // Start animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (sceneSetup.controls) {
            sceneSetup.controls.update();
        }
        
        if (sceneSetup.composer) {
            sceneSetup.composer.render();
        } else {
            console.error('Composer not initialized');
        }
    }

    // Make sure scene is ready before starting animation
    if (sceneSetup.scene && sceneSetup.camera) {
        console.log('Starting animation loop');
        animate();
    } else {
        console.error('Scene or camera not initialized');
    }

    // Initialize cursor
    initializeCustomCursor();

    // Error handling for WebGL
    if (!sceneSetup.renderer) {
        console.error('WebGL not properly initialized');
        document.body.innerHTML = `
            <div style="color: white; text-align: center; padding: 20px;">
                Unable to initialize WebGL. Please check if your browser supports WebGL.
            </div>
        `;
    }
});