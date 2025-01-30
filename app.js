const DEBUG = false;

function initializeCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;
    const updateCursor = (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    };
    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mouseout', () => cursor.style.opacity = '0');
    window.addEventListener('mouseover', () => cursor.style.opacity = '1');
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize UI first to ensure DOM elements exist
        const { UIManager } = await import('./ui.js');
        const uiManager = new UIManager();
        
        // Initialize core components
        const { SceneSetup } = await import('./scenesetup.js');
        const { StarSystem } = await import('./starsystem.js');
        const { InteractionHandler } = await import('./interactionhandler.js');
        if (DEBUG) console.log('Initializing core components...');
       
        const sceneSetup = new SceneSetup();
        if (!sceneSetup.renderer) {
            throw new Error('WebGL initialization failed');
        }
        const starSystem = new StarSystem(sceneSetup.scene);
        const interactionHandler = new InteractionHandler(sceneSetup, starSystem);
        
        // Initialize constellation
        if (DEBUG) console.log('Creating star system...');
        starSystem.createStars();
        
        // Global functions with error handling
        window.resetPage = function() {
            try {
                if (DEBUG) console.log('Resetting page...');
                starSystem.resetAllStars();
                sceneSetup.resetCamera();
                interactionHandler.layoutManager.hideContent();
            } catch (error) {
                console.error('Reset failed:', error);
            }
        }

        window.triggerSpica = function() {
            try {
                if (DEBUG) console.log('Triggering Spica...');
                interactionHandler.triggerSpecificStar('Spica');
            } catch (error) {
                console.error('Spica trigger failed:', error);
            }
        }

        // Animation loop with error handling
        let isAnimating = true;
        function animate() {
            if (!isAnimating) return;
           
            try {
                requestAnimationFrame(animate);
               
                if (sceneSetup.controls) {
                    sceneSetup.controls.update();
                }
               
                if (sceneSetup.composer) {
                    sceneSetup.composer.render();
                } else {
                    throw new Error('Composer not initialized');
                }
            } catch (error) {
                console.error('Animation error:', error);
                isAnimating = false;
            }
        }

        // Start animation if scene is ready
        if (sceneSetup.scene && sceneSetup.camera) {
            if (DEBUG) console.log('Starting animation loop');
            animate();
        } else {
            throw new Error('Scene or camera not initialized');
        }

        // Initialize cursor
        initializeCustomCursor();

        // Error handling for WebGL
        if (!sceneSetup.renderer) {
            throw new Error('WebGL not properly initialized');
        }

        // Cleanup on page unload
        window.addEventListener('unload', () => {
            isAnimating = false;
            sceneSetup.cleanup();
            starSystem.cleanup();
            interactionHandler.cleanup();
        });
    } catch (error) {
        console.error('Initialization failed:', error);
        document.body.innerHTML = `
            <div style="color: white; text-align: center; padding: 20px;">
                Unable to initialize application. Please ensure your browser supports WebGL and JavaScript.
                <br>Error: ${error.message}
            </div>
        `;
    }
});