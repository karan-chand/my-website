import * as THREE from 'three';
import gsap from 'gsap';
import { STAR_CONFIG, ANIMATION_CONFIG } from './constants.js';

const starData = [
    { 
        name: 'α Virginis known as Spica', 
        x: -0.6396, 
        y: -2.586, 
        z: -1.29181, 
        size: 1.0, 
        link: 'audio/Kahin%20Deep%20Jale%20Kahin%20Dil.mp3',
        textPath: 'text/spica.txt' 
    },
    { name: 'β Virginis known as Zavijava', x: 5.5248, y: 0.3765216, z: 0.0, size: 0.3 },
    { name: 'γ Virginis konwn as Porrima', x: 2.1864, y: -0.3196296, z: -0.01463, size: 0.5 },
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
        this.scene = scene;
        this.starMeshes = [];
        this.currentlyHoveredStar = null;
        this.activeStar = null;
    }

    createStars() {
        starData.forEach(star => {
            const mesh = this.createStarMesh(star);
            this.scene.add(mesh);
            this.starMeshes.push({
                mesh,
                name: star.name,
                link: star.link,
                textPath: star.textPath
            });
        });
    }

    createStarMesh(star) {
        const geometry = new THREE.SphereGeometry(star.size, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: STAR_CONFIG.defaultColor,
            emissive: STAR_CONFIG.emissiveColor,
            emissiveIntensity: STAR_CONFIG.defaultIntensity
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            star.x * STAR_CONFIG.scaleMultiplier,
            star.y * STAR_CONFIG.scaleMultiplier,
            star.z * STAR_CONFIG.scaleMultiplier
        );
        
        return mesh;
    }

    handleHover(hoveredMesh, starNameElement) {
        const hoveredStarData = this.starMeshes.find(star => star.mesh === hoveredMesh);
        
        if (this.currentlyHoveredStar !== hoveredMesh && hoveredStarData) {
            this.resetPreviousHover();
            this.applyHoverEffect(hoveredMesh);
            this.currentlyHoveredStar = hoveredMesh;
            starNameElement.innerHTML = hoveredStarData.name;
        }
    }

    clearHover(starNameElement) {
        if (this.currentlyHoveredStar && this.currentlyHoveredStar !== this.activeStar) {
            this.resetPreviousHover();
            this.currentlyHoveredStar = null;
            starNameElement.innerHTML = "♍︎";
        }
    }

    resetPreviousHover() {
        if (this.currentlyHoveredStar && this.currentlyHoveredStar !== this.activeStar) {
            gsap.killTweensOf(this.currentlyHoveredStar.material);
            gsap.to(this.currentlyHoveredStar.material, {
                emissiveIntensity: STAR_CONFIG.defaultIntensity,
                duration: ANIMATION_CONFIG.longDuration,
                ease: ANIMATION_CONFIG.defaultEase
            });
        }
    }

    applyHoverEffect(mesh) {
        gsap.killTweensOf(mesh.material);
        gsap.to(mesh.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.hoverIntensityMultiplier,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: ANIMATION_CONFIG.defaultEase
        });
    }

    resetAllStars() {
        this.starMeshes.forEach(starData => {
            gsap.to(starData.mesh.material, {
                emissiveIntensity: STAR_CONFIG.defaultIntensity,
                duration: ANIMATION_CONFIG.longDuration,
                ease: ANIMATION_CONFIG.defaultEase
            });
        });

        this.activeStar = null;
        this.currentlyHoveredStar = null;
    }

    findStarByName(name) {
        return this.starMeshes.find(star => star.name.includes(name));
    }

    getStarData(mesh) {
        return this.starMeshes.find(star => star.mesh === mesh);
    }
}

export { starData };