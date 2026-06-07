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
        // Initialize UI first so DOM elements exist
        const { UIManager } = await import('./ui.js');
        const uiManager = new UIManager();

        // Core components
        const { SceneSetup } = await import('./scenesetup.js');
        const { StarSystem } = await import('./starsystem.js');
        const { InteractionHandler } = await import('./interactionhandler.js');

        const sceneSetup = new SceneSetup();
        if (!sceneSetup.renderer) {
            throw new Error('WebGL initialization failed');
        }
        const starSystem = new StarSystem(sceneSetup.scene);
        const interactionHandler = new InteractionHandler(sceneSetup, starSystem);

        starSystem.createStars();

        window.resetPage = function() {
            try {
                starSystem.resetAllStars();
                sceneSetup.resetCamera();
                interactionHandler.layoutManager.hideContent();
            } catch (error) {
                console.error('Reset failed:', error);
            }
        };

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

        if (sceneSetup.scene && sceneSetup.camera) {
            animate();
        } else {
            throw new Error('Scene or camera not initialized');
        }

        initializeCustomCursor();

        window.addEventListener('unload', () => {
            isAnimating = false;
            sceneSetup.cleanup();
            starSystem.cleanup();
            interactionHandler.cleanup();
        });
    } catch (error) {
        console.error('Initialization failed:', error);
        document.body.innerHTML = `
            <div style="
                color: white;
                text-align: center;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                box-sizing: border-box;
            ">
                <div style="max-width: 800px;">
                    <div style="
                        background: rgba(255,255,255,0.1);
                        padding: 20px;
                        border-radius: 5px;
                        margin-bottom: 30px;
                        font-family: monospace;
                        text-align: center;
                    ">
                        <h2 style="margin: 0 0 10px 0;">if U are seeing this the code is broken. check back later!</h2>
                    </div>

                    <div style="margin: 30px 0;">
                        <img
                            src="images/140.96.jpg"
                            alt="Error Image"
                            style="
                                max-width: 100%;
                                height: auto;
                                display: block;
                                margin: 0 auto;
                                border-radius: 4px;
                                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                            "
                            onerror="this.style.display='none'; console.error('Failed to load error image');"
                        />
                    </div>

                    <button onclick="window.location.reload()" style="
                        background: #00ffcc;
                        color: black;
                        border: none;
                        padding: 10px 20px;
                        margin-top: 20px;
                        cursor: pointer;
                        border-radius: 4px;
                    ">Try Again</button>
                </div>
            </div>
        `;
    }
});
