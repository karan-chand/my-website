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
        // First remove any existing container
        const existingContainer = document.getElementById('mixcloud-container');
        if (existingContainer) {
            existingContainer.remove();
        }
    
        const container = document.createElement('div');
        container.id = 'mixcloud-container';
        container.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 120px;
            background-color: rgba(0, 0, 0, 0.95);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1200;
            display: none;
        `;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'mixcloud-wrapper';
        wrapper.style.cssText = `
            position: absolute;
            left: 40px;
            right: 0;
            top: 0;
            height: 120px;
            z-index: 1201;
        `;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'mixcloud-close-btn';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Close player');
        closeButton.style.cssText = `
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: white;
            font-size: 32px;
            cursor: pointer;
            z-index: 1203;
        `;
        
        closeButton.addEventListener('click', () => {
            if (typeof window.resetPage === 'function') {
                window.resetPage();
            }
        });
    
        container.appendChild(wrapper);
        container.appendChild(closeButton);
        document.body.appendChild(container);
    
        console.log('Mixcloud container initialized:', container);
        console.log('Wrapper created:', wrapper);
        console.log('Close button added:', closeButton);
    }

    createStars() {
        try {
            starData.forEach(star => {
                const mesh = this.createStarMesh(star);
                this.scene.add(mesh);
                this.starMeshes.push({
                    mesh,
                    name: star.name,
                    link: star.link || '',
                    textPath: star.textPath || ''
                });
            });
        } catch (error) {
            console.error('Error creating stars:', error);
            throw error;
        }
    }

    createStarMesh(star) {
        try {
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

            const starMesh = new THREE.Mesh(this.starGeometry, material);
            const glowMesh = new THREE.Mesh(this.glowGeometry, glowMaterial);
            
            const scale = star.size || 1;
            starMesh.scale.setScalar(scale);
            glowMesh.scale.setScalar(scale);

            const group = new THREE.Group();
            group.add(starMesh, glowMesh);
            
            group.position.set(
                star.x * STAR_CONFIG.scaleMultiplier,
                star.y * STAR_CONFIG.scaleMultiplier,
                star.z * STAR_CONFIG.scaleMultiplier
            );
            
            group.userData = { starMesh, glowMesh };
            this.disposables.add(material, glowMaterial);
            
            return group;
        } catch (error) {
            console.error('Error creating star mesh:', error);
            throw error;
        }
    }

    handleHover(hoveredMesh, starNameElement) {
        if (!hoveredMesh || !starNameElement) return;

        const hoveredStarData = this.starMeshes.find(star => star.mesh === hoveredMesh);
        
        if (this.currentlyHoveredStar !== hoveredMesh && hoveredStarData) {
            this.resetPreviousHover();
            this.applyHoverEffect(hoveredMesh);
            this.currentlyHoveredStar = hoveredMesh;
            starNameElement.textContent = hoveredStarData.name;
            starNameElement.style.opacity = '1';
        }
    }

    clearHover(starNameElement) {
        if (!this.currentlyHoveredStar || this.currentlyHoveredStar === this.activeStar) return;
        
        this.resetPreviousHover();
        if (starNameElement) {
            starNameElement.textContent = '♍︎';
            starNameElement.style.opacity = '1';
        }
        this.currentlyHoveredStar = null;
    }

    showMixcloud(url) {
        console.log('Showing Mixcloud with URL:', url);
        
        const container = document.getElementById('mixcloud-container');
        const wrapper = container?.querySelector('.mixcloud-wrapper');
        
        console.log('Container:', container);
        console.log('Wrapper:', wrapper);
        
        if (!container || !wrapper) {
            console.error('Container or wrapper not found');
            return;
        }
    
        // Clear wrapper
        wrapper.innerHTML = '';
        
        // Create iframe with explicit styles
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 120px;
            border: none;
            z-index: 1202;
        `;
        iframe.src = url;
        iframe.frameBorder = '0';
        
        console.log('Created iframe:', iframe);
        
        // Add to wrapper
        wrapper.appendChild(iframe);
        console.log('Iframe added to wrapper');
        
        // Explicitly show container with all needed styles
        container.style.display = 'block';
        container.classList.add('visible');
        container.style.opacity = '1';
        
        console.log('Container now visible');
        console.log('Final wrapper contents:', wrapper.innerHTML);
    }

    hideMixcloud() {
        const container = document.getElementById('mixcloud-container');
        if (!container) return;
        
        // First remove the visible class
        container.classList.remove('visible');
        
        // Wait for any CSS transitions to complete
        setTimeout(() => {
            container.style.display = 'none';
            const wrapper = container.querySelector('.mixcloud-wrapper');
            if (wrapper) {
                wrapper.innerHTML = '';
            }
        }, 300); // Match your CSS transition duration
    }

    startPulse(mesh) {
        if (!mesh?.userData?.starMesh?.material) return;

        this.stopPulse();

        const { material: starMaterial } = mesh.userData.starMesh;

        gsap.to(starMaterial, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.clickIntensityMultiplier,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: "power2.inOut",
            onComplete: () => {
                this.pulseAnimation = gsap.to(starMaterial, {
                    emissiveIntensity: STAR_CONFIG.pulseConfig.maxIntensity,
                    duration: STAR_CONFIG.pulseConfig.duration,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }
        });
    }

    stopPulse(mesh = this.activeStar) {
        if (this.pulseAnimation) {
            this.pulseAnimation.kill();
            this.pulseAnimation = null;
        }

        if (mesh?.userData?.starMesh?.material) {
            mesh.userData.starMesh.material.emissiveIntensity = STAR_CONFIG.defaultIntensity;
        }
    }

    resetPreviousHover() {
        if (!this.currentlyHoveredStar || this.currentlyHoveredStar === this.activeStar) return;

        const { starMesh } = this.currentlyHoveredStar.userData;
        
        gsap.killTweensOf(starMesh.material);
        
        gsap.to(starMesh.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: "power2.inOut"
        });
    }

    applyHoverEffect(mesh) {
        if (!mesh?.userData) return;

        const { starMesh } = mesh.userData;

        gsap.to(starMesh.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.hoverIntensityMultiplier,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: "power2.inOut"
        });
    }

    resetAllStars() {
        this.stopPulse();
        
        this.starMeshes.forEach(({ mesh }) => {
            const { starMesh } = mesh.userData;
            gsap.killTweensOf(starMesh.material);
            starMesh.material.emissiveIntensity = STAR_CONFIG.defaultIntensity;
        });

        this.activeStar = null;
        this.currentlyHoveredStar = null;
        this.hideMixcloud();
    }

    findStarByName(name) {
        return this.starMeshes.find(star => 
            star.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    cleanup() {
        this.resetAllStars();
        
        this.disposables.forEach(item => {
            if (item?.dispose) item.dispose();
        });
        
        this.disposables.clear();
        this.starMeshes = [];
        
        document.getElementById('mixcloud-container')?.remove();
    }
}