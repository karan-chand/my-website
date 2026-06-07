const gsap = window.gsap;
import { BLOOM_CONFIG, ANIMATION_CONFIG } from './constants.js';
import { LayoutManager } from './layoutmanager.js';
import { TooltipManager } from './tooltipmanager.js';

export class InteractionHandler {
    constructor(sceneSetup, starSystem) {
        this.sceneSetup = sceneSetup;
        this.starSystem = starSystem;
        this.layoutManager = new LayoutManager();
        this.tooltipManager = new TooltipManager();
        this.isTransitioning = false;
        this.lastInteractionTime = 0;
        this.interactionDelay = 100;

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

        this.sceneSetup.renderer.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
        });

        this.sceneSetup.renderer.domElement.addEventListener('webglcontextrestored', () => {
            this.sceneSetup.resize();
            this.starSystem.resetAllStars();
        });
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
            const touchDuration = Date.now() - touchStartTime;
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

        let initialDistance = 0;
        let isZooming = false;

        window.addEventListener('touchmove', (event) => {
            if (event.touches.length === 2) {
                event.preventDefault();

                const touch1 = event.touches[0];
                const touch2 = event.touches[1];
                const distance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );

                if (!isZooming) {
                    isZooming = true;
                    initialDistance = distance;
                    return;
                }

                const scale = distance / initialDistance;
                const zoomSpeed = 0.5;
                this.sceneSetup.camera.position.z *= Math.pow(scale, zoomSpeed);
                this.sceneSetup.camera.updateProjectionMatrix();

                initialDistance = distance;
            }
        }, { passive: false });
    }

    handleKeyPress(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            window.resetPage();
            return false;
        }
    }

    handlePointerMove(event) {
        const now = Date.now();
        if (now - this.lastInteractionTime < this.interactionDelay) return;
        this.lastInteractionTime = now;

        if (!this.isInsideCanvas(event)) {
            this.starSystem.clearHover();
            this.tooltipManager.hide();
            document.body.style.cursor = 'default';
            return;
        }

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
                const starData = this.starSystem.starMeshes.find(
                    star => star.mesh === starGroup
                );
                this.starSystem.handleHover(starGroup);
                this.tooltipManager.update(event, starData);
                document.body.style.cursor = 'pointer';
            } else {
                this.starSystem.clearHover();
                this.tooltipManager.hide();
                document.body.style.cursor = 'default';
            }
        } catch (error) {
            console.error('Pointer move error:', error);
        }
    }

    async transitionToStar(star, starData) {
        if (this.isTransitioning) return;

        try {
            this.isTransitioning = true;

            if (starData.textPath) {
                await this.layoutManager.showContent(starData.name, starData.textPath, !!starData.link);
            }

            const timeline = gsap.timeline({
                defaults: {
                    duration: ANIMATION_CONFIG.longDuration,
                    ease: ANIMATION_CONFIG.defaultEase
                }
            });

            const starPosition = star.position;
            const distance = 30;
            const cameraPosition = {
                x: starPosition.x + distance,
                y: starPosition.y + distance / 2,
                z: starPosition.z + distance
            };

            timeline
                .to(this.sceneSetup.camera.position, {
                    ...cameraPosition,
                    onUpdate: () => this.sceneSetup.camera.updateProjectionMatrix()
                }, 0)
                .to(this.sceneSetup.controls.target, {
                    x: starPosition.x,
                    y: starPosition.y,
                    z: starPosition.z,
                    onUpdate: () => this.sceneSetup.controls.update()
                }, 0)
                .to(this.sceneSetup.bloomPass, {
                    strength: BLOOM_CONFIG.activeStrength,
                    radius: BLOOM_CONFIG.pulseRadius
                }, 0);

            this.starSystem.activeStar = star;

            if (starData.link || starData.textPath) {
                this.starSystem.startPulse(star);
            }

            if (starData.link) {
                this.starSystem.showMixcloud(starData.link);
            }

            await timeline;
        } catch (error) {
            console.error('Star transition error:', error);
        } finally {
            this.isTransitioning = false;
        }
    }

    isInsideCanvas(event) {
        const rect = this.sceneSetup.renderer.domElement.getBoundingClientRect();
        return (
            event.clientX >= rect.left && event.clientX <= rect.right &&
            event.clientY >= rect.top && event.clientY <= rect.bottom
        );
    }

    updateMousePosition(event) {
        const rect = this.sceneSetup.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

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

    handlePointerDown(event) {
        if (this.isTransitioning) return;
        if (!this.isInsideCanvas(event)) return;

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

                if (clickedStarData?.link || clickedStarData?.textPath) {
                    this.transitionToStar(starGroup, clickedStarData);
                }
            }
        } catch (error) {
            console.error('Pointer down error:', error);
        }
    }

    cleanup() {
        window.removeEventListener('pointermove', this.handlePointerMove);
        window.removeEventListener('pointerdown', this.handlePointerDown);
        document.removeEventListener('keydown', this.handleKeyPress);
        this.layoutManager.cleanup();
        this.tooltipManager.cleanup();
    }
}
