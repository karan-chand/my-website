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
        
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        
        this.initializeEventListeners();
        this.setupTouchHandling();
    }

    initializeEventListeners() {
        window.addEventListener('pointermove', this.handlePointerMove);
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
                this.handlePointerDown(e.changedTouches[0]);
            }
        });
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
            // Single animation timeline for smoother transition
            gsap.to([this.sceneSetup.bloomPass, starGroup.userData.starMesh.material, starGroup.userData.glowMesh.material], {
                duration: 0.15,
                ease: "power1.out",
                onStart: () => {
                    this.sceneSetup.bloomPass.strength = BLOOM_CONFIG.activeStrength * 0.7;
                    starGroup.userData.starMesh.material.emissiveIntensity = STAR_CONFIG.defaultIntensity * STAR_CONFIG.hoverIntensityMultiplier;
                    starGroup.userData.glowMesh.material.opacity = 0.4;
                }
            });
            document.body.style.cursor = 'pointer';
        } else {
            // Single animation timeline for smoother reset
            gsap.to([this.sceneSetup.bloomPass], {
                duration: 0.15,
                ease: "power1.out",
                onStart: () => {
                    this.sceneSetup.bloomPass.strength = BLOOM_CONFIG.defaultStrength;
                }
            });
            this.starSystem.starMeshes.forEach(star => {
                if (star.mesh !== this.starSystem.activeStar) {
                    gsap.to(star.mesh.userData.starMesh.material, {
                        emissiveIntensity: STAR_CONFIG.defaultIntensity,
                        duration: 0.15,
                        ease: "power1.out"
                    });
                    gsap.to(star.mesh.userData.glowMesh.material, {
                        opacity: 0.15,
                        duration: 0.15,
                        ease: "power1.out"
                    });
                }
            });
            document.body.style.cursor = 'default';
        }
    }

    handlePointerDown(event) {
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
                this.transitionToStar(starGroup, clickedStarData);
            }
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
            
            // Create a timeline for synchronized animations
            const tl = gsap.timeline({
                defaults: { duration: ANIMATION_CONFIG.longDuration, ease: ANIMATION_CONFIG.defaultEase }
            });
    
            // Start all transitions together
            tl.add([
                // Camera movement
                gsap.to(this.sceneSetup.camera.position, {
                    x: star.position.x + 30,
                    y: star.position.y + 15,
                    z: star.position.z + 30
                }),
                
                // Camera target
                gsap.to(this.sceneSetup.controls.target, {
                    x: star.position.x,
                    y: star.position.y,
                    z: star.position.z,
                    onUpdate: () => this.sceneSetup.controls.update()
                }),
    
                // Bloom effect
                gsap.to(this.sceneSetup.bloomPass, {
                    strength: BLOOM_CONFIG.activeStrength,
                    onComplete: () => {
                        this.sceneSetup.bloomPass.radius = BLOOM_CONFIG.pulseRadius;
                    }
                })
            ], 0);
    
            // Show Mixcloud and text slightly after camera starts moving
            tl.add(() => {
                this.starSystem.activeStar = star;
                this.starSystem.showMixcloud(starData.link);
                if (starData.textPath) {
                    this.textDisplay.show(starData.name, starData.textPath);
                }
            }, 0.2);
    
            await tl.play();
            
        } catch (error) {
            console.error('Error during star transition:', error);
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
        document.removeEventListener('keydown', this.handleKeyPress, true);
        this.textDisplay.cleanup();
    }
}