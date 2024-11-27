import * as THREE from 'three';
const gsap = window.gsap;
import { STAR_CONFIG, ANIMATION_CONFIG } from './constants.js';

const starData = [
    { 
        name: 'α Virginis known as Spica', 
        x: -0.6396, y: -2.586, z: -1.29181, 
        size: 1.0,
        link: 'https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&hide_artwork=1&feed=%2Fmol_%2Fall-that-jazz-3-nina-simone-alice-coltrane-sun-ra-olu-dara-charlie-parker-yusef-lateef-povo%2F'
    },
    { 
        name: 'β Virginis known as Zavijava', 
        x: 5.5248, y: 0.3765216, z: 0.0, 
        size: 0.3
    },
    { 
        name: 'γ Virginis known as Porrima', 
        x: 2.1864, y: -0.3196296, z: -0.01463, 
        size: 0.5
    },
    { 
        name: 'δ Virginis known as Auva', 
        x: 1.3512, y: 0.7918332, z: -1.14551, 
        size: 0.4
    },
    { 
        name: 'ε Virginis known as Vindemiatrix', 
        x: 0.918, y: 2.586, z: -0.4484, 
        size: 0.6
    },
    { 
        name: 'ζ Virginis known as Heze', 
        x: -1.2864, y: -0.0925788, z: -0.22287, 
        size: 0.35
    },
    { 
        name: 'η Virginis known as Zaniah', 
        x: 3.732, y: -0.1763652, z: -1.42158, 
        size: 0.4
    },
    { 
        name: 'θ Virginis', 
        x: 0.3936, y: -1.3079988, z: -1.82229, 
        size: 0.3
    },
    { 
        name: 'ι Virginis known as Syrma', 
        x: -4.0056, y: -1.3664424, z: -0.20083, 
        size: 0.35
    },
    { 
        name: 'μ Virginis known as Rijl al Awwa', 
        x: -5.79, y: -1.3079988, z: -0.15067, 
        size: 0.35
    },
    { 
        name: 'ν Virginis', 
        x: 6.0, y: 1.4652276, z: -1.9, 
        size: 0.3
    },
    { 
        name: 'ο Virginis', 
        x: 4.5708, y: 1.905882, z: -0.75848, 
        size: 0.3
    },
    { 
        name: 'τ Virginis', 
        x: -3.0732, y: 0.4065192, z: -1.17762, 
        size: 0.3
    },
    { 
        name: '109 Virginis', 
        x: -6.0, y: 0.4251384, z: -0.59052, 
        size: 0.3
    }
];

export class StarSystem {
    constructor(scene) {
        this.scene = scene;
        this.starMeshes = [];
        this.currentlyHoveredStar = null;
        this.activeStar = null;
        this.pulseAnimation = null;
        this.isPlaying = false;
        
        // Create mixcloud container
        this.createMixcloudContainer();
    }

    createMixcloudContainer() {
        const container = document.createElement('div');
        container.id = 'mixcloud-container';
        container.style.display = 'none';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'mixcloud-wrapper';
        container.appendChild(wrapper);

        const closeButton = document.createElement('button');
        closeButton.className = 'mixcloud-close-btn';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Close player');
        closeButton.addEventListener('click', () => {
            this.resetAllStars();
            window.sceneSetup?.resetCamera();
        });
        container.appendChild(closeButton);

        document.body.appendChild(container);
    }

    createStars() {
        starData.forEach(star => {
            const mesh = this.createStarMesh(star);
            this.scene.add(mesh);
            this.starMeshes.push({
                mesh,
                name: star.name,
                link: star.link
            });
        });
    }

    createStarMesh(star) {
        const geometry = new THREE.SphereGeometry(star.size, 32, 32);
        const glowGeometry = new THREE.SphereGeometry(star.size * 1.2, 32, 32);
        
        const material = new THREE.MeshStandardMaterial({
            color: STAR_CONFIG.defaultColor,
            emissive: STAR_CONFIG.emissiveColor,
            emissiveIntensity: STAR_CONFIG.defaultIntensity,
            metalness: 0.1,
            roughness: 0.2
        });

        const glowMaterial = new THREE.MeshBasicMaterial({
            color: STAR_CONFIG.defaultColor,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });

        const starMesh = new THREE.Mesh(geometry, material);
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        
        const group = new THREE.Group();
        group.add(starMesh);
        group.add(glowMesh);
        
        group.position.set(
            star.x * STAR_CONFIG.scaleMultiplier,
            star.y * STAR_CONFIG.scaleMultiplier,
            star.z * STAR_CONFIG.scaleMultiplier
        );
        
        group.userData.starMesh = starMesh;
        group.userData.glowMesh = glowMesh;
        
        return group;
    }

    handleHover(hoveredMesh, starNameElement) {
        const hoveredStarData = this.starMeshes.find(star => star.mesh === hoveredMesh);
        
        if (this.currentlyHoveredStar !== hoveredMesh && hoveredStarData) {
            this.resetPreviousHover();
            this.applyHoverEffect(hoveredMesh);
            this.currentlyHoveredStar = hoveredMesh;
            
            starNameElement.textContent = hoveredStarData.name;
        }
    }

    clearHover(starNameElement) {
        if (this.currentlyHoveredStar && this.currentlyHoveredStar !== this.activeStar) {
            this.resetPreviousHover();
            starNameElement.textContent = '♍︎';
        }
        this.currentlyHoveredStar = null;
    }

    showMixcloud(url) {
        const container = document.getElementById('mixcloud-container');
        if (!container) return;

        const wrapper = container.querySelector('.mixcloud-wrapper');
        wrapper.innerHTML = `<iframe width="100%" height="60" src="${url}" frameborder="0"></iframe>`;
        container.style.display = 'block';

        if (this.activeStar) {
            // First transition to hover state, then to pulse
            this.startPulse(this.activeStar);
        }
    }

    hideMixcloud() {
        const container = document.getElementById('mixcloud-container');
        if (container) {
            const wrapper = container.querySelector('.mixcloud-wrapper');
            if (wrapper) {
                wrapper.innerHTML = '';
            }
            container.style.display = 'none';
        }
    }

    findStarByName(name) {
        return this.starMeshes.find(star => 
            star.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    getStarData(mesh) {
        return this.starMeshes.find(star => star.mesh === mesh);
    }

    startPulse(mesh) {
        if (this.pulseAnimation) {
            this.pulseAnimation.kill();
        }

        // First transition smoothly from current state
        gsap.to(mesh.userData.starMesh.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.hoverIntensityMultiplier,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: "power2.inOut",
            onComplete: () => {
                // Then start pulsing
                this.pulseAnimation = gsap.to(mesh.userData.starMesh.material, {
                    emissiveIntensity: STAR_CONFIG.pulseConfig.maxIntensity,
                    duration: STAR_CONFIG.pulseConfig.duration,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }
        });

        // Smooth glow transition
        gsap.to(mesh.userData.glowMesh.material, {
            opacity: 0.4,
            duration: ANIMATION_CONFIG.defaultDuration * 1.5,
            ease: "power2.inOut"
        });
    }

    stopPulse(mesh) {
        if (this.pulseAnimation) {
            this.pulseAnimation.kill();
            this.pulseAnimation = null;
        }

        gsap.to(mesh.userData.starMesh.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: "power2.inOut"
        });
    }

    resetPreviousHover() {
        if (this.currentlyHoveredStar && this.currentlyHoveredStar !== this.activeStar) {
            gsap.killTweensOf(this.currentlyHoveredStar.userData.starMesh.material);
            gsap.killTweensOf(this.currentlyHoveredStar.userData.glowMesh.material);
            
            gsap.to(this.currentlyHoveredStar.userData.starMesh.material, {
                emissiveIntensity: STAR_CONFIG.defaultIntensity,
                duration: ANIMATION_CONFIG.defaultDuration,
                ease: "power2.inOut"
            });
            
            gsap.to(this.currentlyHoveredStar.userData.glowMesh.material, {
                opacity: 0.15,
                duration: ANIMATION_CONFIG.defaultDuration,
                ease: "power2.inOut"
            });
        }
    }

    applyHoverEffect(mesh) {
        gsap.to(mesh.userData.starMesh.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.hoverIntensityMultiplier,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: "power2.inOut"
        });

        gsap.to(mesh.userData.glowMesh.material, {
            opacity: 0.3,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: "power2.inOut"
        });
    }

    resetAllStars() {
        if (this.pulseAnimation) {
            this.pulseAnimation.kill();
            this.pulseAnimation = null;
        }

        this.hideMixcloud();

        this.starMeshes.forEach(starData => {
            gsap.to(starData.mesh.userData.starMesh.material, {
                emissiveIntensity: STAR_CONFIG.defaultIntensity,
                duration: ANIMATION_CONFIG.longDuration,
                ease: "power2.inOut"
            });
            
            gsap.to(starData.mesh.userData.glowMesh.material, {
                opacity: 0.15,
                duration: ANIMATION_CONFIG.longDuration,
                ease: "power2.inOut"
            });
        });

        this.activeStar = null;
        this.currentlyHoveredStar = null;
    }

    cleanup() {
        if (this.pulseAnimation) {
            this.pulseAnimation.kill();
        }

        this.hideMixcloud();
        const container = document.getElementById('mixcloud-container');
        if (container) {
            container.remove();
        }

        this.starMeshes.forEach(starData => {
            starData.mesh.userData.starMesh.geometry.dispose();
            starData.mesh.userData.starMesh.material.dispose();
            starData.mesh.userData.glowMesh.geometry.dispose();
            starData.mesh.userData.glowMesh.material.dispose();
            this.scene.remove(starData.mesh);
        });
    }
}

export { starData };