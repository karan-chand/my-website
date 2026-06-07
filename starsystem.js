// starsystem.js
import * as THREE from 'three';
const gsap = window.gsap;
import { STAR_CONFIG, ANIMATION_CONFIG } from './constants.js';

export const starData = [
    {
        name: 'α Virginis known as Spica',
        x: -0.6396, y: -2.586, z: -1.29181,
        size: 1.0,
        link: 'https://player-widget.mixcloud.com/widget/iframe/?hide_cover=1&feed=%2Fkaranchand%2Fkaran-chand-spica%2F',
        textPath: './text/spica.txt'
    },
    { name: 'β Virginis known as Zavijava', x: 5.5248, y: 0.3765216, z: 0.0, size: 0.3 },
    { name: 'γ Virginis known as Porrima', x: 2.1864, y: -0.3196296, z: -0.01463, size: 0.5 },
    { name: 'δ Virginis known as Auva', x: 1.3512, y: 0.7918332, z: -1.14551, size: 0.4 },
    { name: 'ε Virginis known as Vindemiatrix', x: 0.918, y: 2.586, z: -0.4484, size: 0.6 },
    { name: 'ζ Virginis known as Heze', x: -1.2864, y: -0.0925788, z: -0.22287, size: 0.35 },
    { name: 'η Virginis known as Zaniah', x: 3.732, y: -0.1763652, z: -1.42158, size: 0.4 },
    { name: 'θ Virginis', x: 0.3936, y: -1.3079988, z: -1.82229, size: 0.3 },
    { name: 'ι Virginis known as Syrma', x: -4.0056, y: -1.3664424, z: -0.20083, size: 0.35 },
    { name: 'μ Virginis known as Rijl al Awwa', x: -5.79, y: -1.3079988, z: -0.15067, size: 0.35 },
    { name: 'ν Virginis', x: 6.0, y: 1.4652276, z: -1.9, size: 0.3 },
    { name: 'ο Virginis', x: 4.5708, y: 1.905882, z: -0.75848, size: 0.3 },
    { name: 'τ Virginis', x: -3.0732, y: 0.4065192, z: -1.17762, size: 0.3 },
    { name: '109 Virginis', x: -6.0, y: 0.4251384, z: -0.59052, size: 0.3 }
];

export class StarSystem {
    constructor(scene) {
        if (!scene) throw new Error('Scene is required for StarSystem initialization');

        this.scene = scene;
        this.starMeshes = [];
        this.currentlyHoveredStar = null;
        this.activeStar = null;
        this.pulseAnimation = null;
        this.breaths = new Map();
        this.disposables = new Set();

        this.initializeGeometries();
        this.initializeMixcloudContainer();
    }

    initializeGeometries() {
        this.starGeometry = new THREE.SphereGeometry(1, 32, 32);
        this.glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        this.disposables.add(this.starGeometry, this.glowGeometry);
    }

    initializeMixcloudContainer() {
        const existingContainer = document.getElementById('mixcloud-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.createElement('div');
        container.id = 'mixcloud-container';

        const wrapper = document.createElement('div');
        wrapper.className = 'mixcloud-wrapper';

        const closeButton = document.createElement('button');
        closeButton.className = 'mixcloud-close-btn';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Close player');

        closeButton.addEventListener('click', () => {
            if (typeof window.resetPage === 'function') {
                window.resetPage();
            }
        });

        container.appendChild(wrapper);
        container.appendChild(closeButton);
        document.body.appendChild(container);
    }

    createStars() {
        try {
            starData.forEach(star => {
                const live = !!(star.link || star.textPath);
                const mesh = this.createStarMesh(star, live);
                this.scene.add(mesh);
                this.starMeshes.push({
                    mesh,
                    name: star.name,
                    link: star.link || '',
                    textPath: star.textPath || '',
                    live
                });
                if (live) this.startBreath(mesh);
            });
        } catch (error) {
            console.error('Error creating stars:', error);
            throw error;
        }
    }

    createStarMesh(star, live) {
        try {
            const scale = star.size || 0.3;
            // Faithful magnitude: fainter (smaller) stars glow dimmer.
            const restIntensity = live
                ? STAR_CONFIG.resting.liveMin
                : STAR_CONFIG.resting.inertBase * scale;

            const material = new THREE.MeshStandardMaterial({
                color: STAR_CONFIG.defaultColor,
                emissive: STAR_CONFIG.emissiveColor,
                emissiveIntensity: restIntensity,
                metalness: 0.1,
                roughness: 0.2
            });

            const glowMaterial = new THREE.MeshBasicMaterial({
                color: STAR_CONFIG.defaultColor,
                transparent: true,
                opacity: live ? 0.30 : Math.max(0.05, 0.14 * scale),
                side: THREE.BackSide
            });

            const starMesh = new THREE.Mesh(this.starGeometry, material);
            const glowMesh = new THREE.Mesh(this.glowGeometry, glowMaterial);

            starMesh.scale.setScalar(scale);
            glowMesh.scale.setScalar(scale);

            const group = new THREE.Group();
            group.add(starMesh, glowMesh);

            group.position.set(
                star.x * STAR_CONFIG.scaleMultiplier,
                star.y * STAR_CONFIG.scaleMultiplier,
                star.z * STAR_CONFIG.scaleMultiplier
            );

            group.userData = { starMesh, glowMesh, live, restIntensity };
            this.disposables.add(material, glowMaterial);

            return group;
        } catch (error) {
            console.error('Error creating star mesh:', error);
            throw error;
        }
    }

    // --- resting / breathing -------------------------------------------------

    startBreath(group) {
        if (!group?.userData?.starMesh?.material) return;
        this.killBreath(group);
        const { starMesh } = group.userData;
        const tween = gsap.to(starMesh.material, {
            emissiveIntensity: STAR_CONFIG.resting.liveMax,
            duration: STAR_CONFIG.resting.breathDuration,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });
        this.breaths.set(group, tween);
    }

    killBreath(group) {
        const tween = this.breaths.get(group);
        if (tween) {
            tween.kill();
            this.breaths.delete(group);
        }
    }

    applyRest(group) {
        if (!group?.userData?.starMesh?.material) return;
        const { starMesh, live, restIntensity } = group.userData;
        this.killBreath(group);
        gsap.killTweensOf(starMesh.material);
        if (live) {
            starMesh.material.emissiveIntensity = STAR_CONFIG.resting.liveMin;
            this.startBreath(group);
        } else {
            starMesh.material.emissiveIntensity = restIntensity;
        }
    }

    // --- hover (live stars only) ---------------------------------------------

    handleHover(group) {
        if (!group?.userData?.live) return;

        if (this.currentlyHoveredStar !== group) {
            this.resetPreviousHover();
            this.applyHoverEffect(group);
            this.currentlyHoveredStar = group;
        }
    }

    clearHover() {
        if (!this.currentlyHoveredStar || this.currentlyHoveredStar === this.activeStar) return;
        this.resetPreviousHover();
        this.currentlyHoveredStar = null;
    }

    applyHoverEffect(group) {
        if (!group?.userData?.starMesh?.material) return;
        const { starMesh } = group.userData;
        this.killBreath(group);
        gsap.killTweensOf(starMesh.material);
        gsap.to(starMesh.material, {
            emissiveIntensity: STAR_CONFIG.resting.hover,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: 'power2.inOut'
        });
    }

    resetPreviousHover() {
        if (!this.currentlyHoveredStar || this.currentlyHoveredStar === this.activeStar) return;
        this.applyRest(this.currentlyHoveredStar);
    }

    // --- active (clicked) pulse ----------------------------------------------

    startPulse(group) {
        if (!group?.userData?.starMesh?.material) return;
        this.stopPulse();
        this.killBreath(group);

        const { material: starMaterial } = group.userData.starMesh;
        gsap.killTweensOf(starMaterial);

        gsap.to(starMaterial, {
            emissiveIntensity: STAR_CONFIG.resting.hover,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: 'power2.inOut',
            onComplete: () => {
                this.pulseAnimation = gsap.to(starMaterial, {
                    emissiveIntensity: STAR_CONFIG.pulseConfig.maxIntensity,
                    duration: STAR_CONFIG.pulseConfig.duration,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut'
                });
            }
        });
    }

    stopPulse(group = this.activeStar) {
        if (this.pulseAnimation) {
            this.pulseAnimation.kill();
            this.pulseAnimation = null;
        }
        if (group?.userData?.starMesh?.material) {
            this.applyRest(group);
        }
    }

    resetAllStars() {
        this.stopPulse();
        this.starMeshes.forEach(({ mesh }) => this.applyRest(mesh));
        this.activeStar = null;
        this.currentlyHoveredStar = null;
        this.hideMixcloud();
    }

    // --- mixcloud player -----------------------------------------------------

    showMixcloud(url) {
        const container = document.getElementById('mixcloud-container');
        const wrapper = container?.querySelector('.mixcloud-wrapper');

        if (!container || !wrapper) {
            console.error('Mixcloud container or wrapper not found');
            return;
        }

        wrapper.innerHTML = '';

        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.frameBorder = '0';
        wrapper.appendChild(iframe);

        container.classList.add('visible');
    }

    hideMixcloud() {
        const container = document.getElementById('mixcloud-container');
        if (!container) return;

        container.classList.remove('visible');

        setTimeout(() => {
            const wrapper = container.querySelector('.mixcloud-wrapper');
            if (wrapper) {
                wrapper.innerHTML = '';
            }
        }, 300);
    }

    cleanup() {
        this.breaths.forEach(tween => tween.kill());
        this.breaths.clear();
        this.resetAllStars();

        this.disposables.forEach(item => {
            if (item?.dispose) item.dispose();
        });

        this.disposables.clear();
        this.starMeshes = [];

        document.getElementById('mixcloud-container')?.remove();
    }
}
