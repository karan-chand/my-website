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
    // Create loading screen
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.textContent = 'Loading';
    loadingScreen.style.position = 'fixed';
    loadingScreen.style.top = '0';
    loadingScreen.style.left = '0';
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.backgroundColor = 'black';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.alignItems = 'center';
    loadingScreen.style.zIndex = '1000';
    loadingScreen.style.fontFamily = "'Halyard Text', Arial, sans-serif";
    loadingScreen.style.color = 'white';
    loadingScreen.style.fontSize = '24px';
    document.body.appendChild(loadingScreen);

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
        
        // Remove loading screen with fade
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);

        // Global functions with error handling
        window.resetPage = function() {
            try {
                if (DEBUG) console.log('Resetting page...');
                starSystem.resetAllStars();
                sceneSetup.resetCamera();
                interactionHandler.textDisplay.hide();
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
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div style="color: white; text-align: center; padding: 20px;">
                    Unable to initialize application. Please ensure your browser supports WebGL and JavaScript.
                    <br>Error: ${error.message}
                </div>
            `;
        } else {
            document.body.innerHTML = `
                <div style="color: white; text-align: center; padding: 20px;">
                    Unable to initialize application. Please ensure your browser supports WebGL and JavaScript.
                    <br>Error: ${error.message}
                </div>
            `;
        }
    }
});