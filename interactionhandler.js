import gsap from 'gsap';
import { STAR_CONFIG } from './starsystem.js';

export class InteractionHandler {
    constructor(sceneSetup, starSystem, audioPlayer) {
        this.sceneSetup = sceneSetup;
        this.starSystem = starSystem;
        this.audioPlayer = audioPlayer;
        this.starNameElement = document.getElementById('star-name');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        window.addEventListener('pointermove', (e) => this.handleHover(e));
        window.addEventListener('pointerdown', (e) => this.handleClick(e));
    }

    updateMousePosition(event) {
        this.sceneSetup.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.sceneSetup.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.sceneSetup.raycaster.setFromCamera(
            this.sceneSetup.mouse, 
            this.sceneSetup.camera
        );
    }

    handleHover(event) {
        this.updateMousePosition(event);
        const intersects = this.sceneSetup.raycaster.intersectObjects(this.sceneSetup.scene.children);

        if (intersects.length > 0) {
            this.starSystem.handleHover(intersects[0].object, this.starNameElement);
        } else {
            this.starSystem.clearHover(this.starNameElement);
        }
    }

    handleClick(event) {
        this.updateMousePosition(event);
        const intersects = this.sceneSetup.raycaster.intersectObjects(this.sceneSetup.scene.children);

        if (intersects.length > 0) {
            const clickedStar = intersects[0].object;
            const clickedStarData = this.starSystem.getStarData(clickedStar);
            if (clickedStarData?.link) {
                this.triggerStarAudio(clickedStar, clickedStarData.link);
            }
        }
    }

    triggerStarAudio(star, audioLink) {
        if (this.audioPlayer.activePulseTween) {
            this.audioPlayer.activePulseTween.kill();
            this.audioPlayer.activePulseTween = null;
        }

        this.starSystem.activeStar = star;
        document.dispatchEvent(new CustomEvent("playAudio", {
            detail: { audioSrc: audioLink }
        }));

        this.animateBloomEffect();
        this.animateStarIntensity(star);
    }

    animateBloomEffect() {
        gsap.to(this.sceneSetup.bloomPass, {
            strength: 1.6,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                this.sceneSetup.bloomPass.radius = 0.1;
                this.audioPlayer.activePulseTween = gsap.to(this.sceneSetup.bloomPass, {
                    strength: 2.8,
                    duration: 1.8,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }
        });
    }

    animateStarIntensity(star) {
        gsap.to(star.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.clickIntensityMultiplier,
            duration: 0.5,
            ease: "power2.inOut"
        });
    }

    triggerSpecificStar(starName) {
        const star = this.starSystem.findStarByName(starName);
        if (star) {
            if (this.audioPlayer.activePulseTween) {
                this.audioPlayer.activePulseTween.kill();
                this.audioPlayer.activePulseTween = null;
            }

            gsap.to(this.sceneSetup.bloomPass, {
                strength: 0.6,
                radius: 0.2,
                duration: 0.5,
                ease: "power2.out"
            });

            this.triggerStarAudio(star.mesh, star.link);
        }
    }
}