const gsap = window.gsap;
import { STAR_CONFIG, BLOOM_CONFIG, ANIMATION_CONFIG } from './constants.js';
import { TextDisplay } from './textdisplay.js';

export class InteractionHandler {
    constructor(sceneSetup, starSystem) {
        this.sceneSetup = sceneSetup;
        this.starSystem = starSystem;
        this.textDisplay = new TextDisplay();
        this.starNameElement = document.getElementById('star-name');
        this.isTransitioning = false;
        this.lastInteractionTime = 0;
        this.interactionDelay = 300; // Debounce delay in ms
        
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        
        this.initializeEventListeners();
        this.setupTouchHandling();
    }

    initializeEventListeners() {
        window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
        window.addEventListener('pointerdown', this.handlePointerDown);
        document.addEventListener('keydown', this.handleKeyPress, true);
    }

    setupTouchHandling() {
        let touchStartTime = 0;
        let touchStartPosition = { x: 0, y: 0 };

        window.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartPosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            const touchEndPosition = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY
            };

            const distance = Math.hypot(
                touchEndPosition.x - touchStartPosition.x,
                touchEndPosition.y - touchStartPosition.y
            );

            if (touchDuration < 300 && distance < 10) {
                this.handlePointerDown(e.changedTouches[0]);
            }
        }, { passive: true });
    }

    handleKeyPress(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.textDisplay.hide();
            document.querySelector('header h1').click();
            return false;
        }
    }

    handlePointerMove(event) {
        const now = Date.now();
        if (this.isTransitioning || now - this.lastInteractionTime < this.interactionDelay) return;
        this.lastInteractionTime = now;
        
        try {
            this.updateMousePosition(event);
            const intersects = this.sceneSetup.raycaster.intersectObjects(
                this.sceneSetup.scene.children, true
            );

            const starIntersect = intersects.find(intersect => 
                intersect.object.parent && 
                this.starSystem.starMeshes.some(star => star.mesh === intersect.object.parent)
            );

            if (starIntersect) {
                const starGroup = starIntersect.object.parent;
                this.starSystem.handleHover(starGroup, this.starNameElement);
                document.body.style.cursor = 'pointer';
            } else {
                this.starSystem.clearHover(this.starNameElement);
                document.body.style.cursor = 'default';
            }
        } catch (error) {
            console.error('Pointer move error:', error);
        }
    }

    handlePointerDown(event) {
        if (this.isTransitioning) return;

        try {
            this.updateMousePosition(event);
            const intersects = this.sceneSetup.raycaster.intersectObjects(
                this.sceneSetup.scene.children, true
            );

            const starIntersect = intersects.find(intersect => 
                intersect.object.parent && 
                this.starSystem.starMeshes.some(star => star.mesh === intersect.object.parent)
            );

            if (starIntersect) {
                const starGroup = starIntersect.object.parent;
                const clickedStarData = this.starSystem.starMeshes.find(
                    star => star.mesh === starGroup
                );

                if (clickedStarData?.link) {
                    this.transitionToStar(starGroup, clickedStarData);
                }
            }
        } catch (error) {
            console.error('Pointer down error:', error);
        }
    }

    updateMousePosition(event) {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        gsap.to(this.sceneSetup.mouse, {
            x,
            y,
            duration: 0.1,
            ease: "power2.out",
            onUpdate: () => {
                this.sceneSetup.raycaster.setFromCamera(
                    this.sceneSetup.mouse, 
                    this.sceneSetup.camera
                );
            }
        });
    }

    async transitionToStar(star, starData) {
        try {
            this.isTransitioning = true;
            
            this.starSystem.activeStar = star;
            this.starSystem.showMixcloud(starData.link);
            
            if (starData.textPath) {
                await this.textDisplay.show(starData.name, starData.textPath);
            }
            
            await this.transitionCamera(star);
            this.animateBloomEffect();
            
        } catch (error) {
            console.error('Star transition error:', error);
        } finally {
            this.isTransitioning = false;
        }
    }

    transitionCamera(star) {
        return new Promise(resolve => {
            const starPosition = star.position;
            const distance = 30;
            
            const cameraPosition = {
                x: starPosition.x + distance,
                y: starPosition.y + distance/2,
                z: starPosition.z + distance
            };

            gsap.to(this.sceneSetup.camera.position, {
                x: cameraPosition.x,
                y: cameraPosition.y,
                z: cameraPosition.z,
                duration: ANIMATION_CONFIG.longDuration,
                ease: ANIMATION_CONFIG.defaultEase
            });

            gsap.to(this.sceneSetup.controls.target, {
                x: starPosition.x,
                y: starPosition.y,
                z: starPosition.z,
                duration: ANIMATION_CONFIG.longDuration,
                ease: ANIMATION_CONFIG.defaultEase,
                onUpdate: () => this.sceneSetup.controls.update(),
                onComplete: resolve
            });
        });
    }

    animateBloomEffect() {
        gsap.to(this.sceneSetup.bloomPass, {
            strength: BLOOM_CONFIG.activeStrength,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: ANIMATION_CONFIG.defaultEase,
            onComplete: () => {
                this.sceneSetup.bloomPass.radius = BLOOM_CONFIG.pulseRadius;
            }
        });
    }

    triggerSpecificStar(starName) {
        const star = this.starSystem.starMeshes.find(s => 
            s.name.toLowerCase().includes(starName.toLowerCase())
        );
        
        if (star) {
            this.transitionToStar(star.mesh, star);
        }
    }

    cleanup() {
        window.removeEventListener('pointermove', this.handlePointerMove);
        window.removeEventListener('pointerdown', this.handlePointerDown);
        document.removeEventListener('keydown', this.handleKeyPress);
        this.textDisplay.cleanup();
    }
}