import gsap from 'gsap';
import { STAR_CONFIG, BLOOM_CONFIG, ANIMATION_CONFIG } from './constants.js';

export class InteractionHandler {
    constructor(sceneSetup, starSystem, audioPlayer) {
        this.sceneSetup = sceneSetup;
        this.starSystem = starSystem;
        this.audioPlayer = audioPlayer;
        this.starNameElement = document.getElementById('star-name');
        this.isTransitioning = false;
        
        this.initializeEventListeners();
        this.setupTouchHandling();
    }

    initializeEventListeners() {
        window.addEventListener('pointermove', (e) => this.handleHover(e));
        window.addEventListener('pointerdown', (e) => this.handleClick(e));
        window.addEventListener('keydown', (e) => this.handleKeyPress(e));
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
        });

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
                this.handleClick(e.changedTouches[0]);
            }
        });
    }

    handleKeyPress(event) {
        if (event.key === 'Escape' && this.starSystem.activeStar) {
            this.audioPlayer.stop();
            this.starSystem.resetAllStars();
            this.sceneSetup.resetCamera();
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

    handleHover(event) {
        if (this.isTransitioning) return;
        
        this.updateMousePosition(event);
        const intersects = this.sceneSetup.raycaster.intersectObjects(
            this.sceneSetup.scene.children, true
        );

        // Find the first intersected object that is part of a star group
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
    }

    async handleClick(event) {
        if (this.isTransitioning) return;

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
            const clickedStarData = this.starSystem.starMeshes.find(star => star.mesh === starGroup);

            if (clickedStarData?.link) {
                await this.transitionToStar(starGroup, clickedStarData);
            }
        }
    }

    async transitionToStar(star, starData) {
        try {
            this.isTransitioning = true;

            // Reset any active pulse animations
            if (this.audioPlayer.activePulseTween) {
                this.audioPlayer.activePulseTween.kill();
                this.audioPlayer.activePulseTween = null;
            }

            // Set active star
            this.starSystem.activeStar = star;

            // Camera transition
            await this.transitionCamera(star);

            // Trigger audio and visual effects
            document.dispatchEvent(new CustomEvent("playAudio", {
                detail: { 
                    audioSrc: starData.link,
                    textPath: starData.textPath 
                }
            }));

            // Animate bloom and star intensity
            this.animateBloomEffect();
            this.animateStarIntensity(star);

        } catch (error) {
            console.error('Error during star transition:', error);
        } finally {
            this.isTransitioning = false;
        }
    }

    transitionCamera(star) {
        return new Promise(resolve => {
            const starPosition = star.position;
            const distance = 30; // Optimal viewing distance
            
            // Calculate camera position
            const cameraPosition = {
                x: starPosition.x + distance,
                y: starPosition.y + distance/2,
                z: starPosition.z + distance
            };

            // Animate camera
            gsap.to(this.sceneSetup.camera.position, {
                x: cameraPosition.x,
                y: cameraPosition.y,
                z: cameraPosition.z,
                duration: ANIMATION_CONFIG.longDuration,
                ease: ANIMATION_CONFIG.defaultEase
            });

            // Animate controls target
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
            duration: ANIMATION_CONFIG.longDuration,
            ease: ANIMATION_CONFIG.defaultEase,
            onComplete: () => {
                this.sceneSetup.bloomPass.radius = BLOOM_CONFIG.pulseRadius;
                this.audioPlayer.activePulseTween = gsap.to(this.sceneSetup.bloomPass, {
                    strength: BLOOM_CONFIG.pulseStrength,
                    duration: ANIMATION_CONFIG.pulseDuration,
                    repeat: -1,
                    yoyo: true,
                    ease: ANIMATION_CONFIG.pulseEase
                });
            }
        });
    }

    animateStarIntensity(star) {
        gsap.to(star.userData.starMesh.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.clickIntensityMultiplier,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: ANIMATION_CONFIG.defaultEase
        });
    }

    triggerSpecificStar(starName) {
        console.log('Triggering star:', starName);
        const star = this.starSystem.starMeshes.find(s => 
            s.name.toLowerCase().includes(starName.toLowerCase())
        );
        
        if (star) {
            console.log('Found star:', star);
            this.transitionToStar(star.mesh, star);
        } else {
            console.error('Star not found:', starName);
        }
    }
}