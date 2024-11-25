import gsap from 'gsap';
import { STAR_CONFIG, BLOOM_CONFIG, ANIMATION_CONFIG } from './constants.js';

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
        this.sceneSetup.raycaster.setFromCamera(this.sceneSetup.mouse, this.sceneSetup.camera);
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
                this.triggerStarAudio(clickedStar, clickedStarData);
            }
        }
    }

    triggerStarAudio(star, starData) {
        if (this.audioPlayer.activePulseTween) {
            this.audioPlayer.activePulseTween.kill();
            this.audioPlayer.activePulseTween = null;
        }

        this.starSystem.activeStar = star;
        document.dispatchEvent(new CustomEvent("playAudio", {
            detail: { 
                audioSrc: starData.link,
                textPath: starData.textPath 
            }
        }));

        this.animateBloomEffect();
        this.animateStarIntensity(star);
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
        gsap.to(star.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.clickIntensityMultiplier,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: ANIMATION_CONFIG.defaultEase
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
                strength: BLOOM_CONFIG.defaultStrength,
                radius: BLOOM_CONFIG.defaultRadius,
                duration: ANIMATION_CONFIG.defaultDuration,
                ease: ANIMATION_CONFIG.defaultEase
            });

            this.triggerStarAudio(star.mesh, star);
        }
    }
}