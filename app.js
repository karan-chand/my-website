import gsap from 'gsap';
import { initializeCustomCursor } from './cursor.js';
import { StarSystem, STAR_CONFIG } from './starsystem.js';
import { AudioPlayer } from './audioplayer.js';
import { SceneSetup } from './scenesetup.js';

const sceneSetup = new SceneSetup();
const starSystem = new StarSystem(sceneSetup.scene);
const audioPlayer = new AudioPlayer(starSystem, sceneSetup.bloomPass);
const starNameElement = document.getElementById('star-name');

starSystem.createStars();

function handleHover(event) {
    sceneSetup.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    sceneSetup.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    sceneSetup.raycaster.setFromCamera(sceneSetup.mouse, sceneSetup.camera);
    const intersects = sceneSetup.raycaster.intersectObjects(sceneSetup.scene.children);

    if (intersects.length > 0) {
        starSystem.handleHover(intersects[0].object, starNameElement);
    } else {
        starSystem.clearHover(starNameElement);
    }
}

function handleClick(event) {
    sceneSetup.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    sceneSetup.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    sceneSetup.raycaster.setFromCamera(sceneSetup.mouse, sceneSetup.camera);
    const intersects = sceneSetup.raycaster.intersectObjects(sceneSetup.scene.children);

    if (intersects.length > 0) {
        const clickedStar = intersects[0].object;
        const clickedStarData = starSystem.getStarData(clickedStar);

        if (clickedStarData?.link) {
            if (audioPlayer.activePulseTween) {
                audioPlayer.activePulseTween.kill();
                audioPlayer.activePulseTween = null;
            }

            starSystem.activeStar = clickedStar;
            document.dispatchEvent(new CustomEvent("playAudio", {
                detail: { audioSrc: clickedStarData.link }
            }));

            gsap.to(sceneSetup.bloomPass, {
                strength: 1.6,
                duration: 1.0,
                ease: "power2.inOut",
                onComplete: () => {
                    sceneSetup.bloomPass.radius = 0.1;
                    audioPlayer.activePulseTween = gsap.to(sceneSetup.bloomPass, {
                        strength: 2.8,
                        duration: 1.8,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut"
                    });
                }
            });

            gsap.to(clickedStar.material, {
                emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.clickIntensityMultiplier,
                duration: 0.5,
                ease: "power2.inOut"
            });
        }
    }
}

window.addEventListener('pointermove', handleHover);
window.addEventListener('pointerdown', handleClick);

window.resetPage = function() {
    audioPlayer.stop();
    starSystem.resetAllStars();
    sceneSetup.resetCamera();
}

window.triggerSpica = function() {
    const spicaStar = starSystem.findStarByName('Spica');
    if (spicaStar) {
        if (audioPlayer.activePulseTween) {
            audioPlayer.activePulseTween.kill();
            audioPlayer.activePulseTween = null;
        }

        gsap.to(sceneSetup.bloomPass, {
            strength: 0.6,
            radius: 0.2,
            duration: 0.5,
            ease: "power2.out"
        });

        document.dispatchEvent(new CustomEvent("playAudio", {
            detail: { audioSrc: spicaStar.link }
        }));

        gsap.to(sceneSetup.bloomPass, {
            strength: 1.6,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                sceneSetup.bloomPass.radius = 0.1;
                audioPlayer.activePulseTween = gsap.to(sceneSetup.bloomPass, {
                    strength: 2.8,
                    duration: 1.8,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }
        });

        gsap.to(spicaStar.mesh.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.clickIntensityMultiplier,
            duration: 0.5,
            ease: "power2.inOut"
        });

        starSystem.activeStar = spicaStar.mesh;
    }
}

sceneSetup.animate();
initializeCustomCursor();