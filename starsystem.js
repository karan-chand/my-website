import * as THREE from 'three';
import gsap from 'gsap';
import { STAR_CONFIG, ANIMATION_CONFIG } from './constants.js';

// Enhanced star data maintaining all Virgo stars
const starData = [
    { 
        name: 'α Virginis known as Spica', 
        x: -0.6396, y: -2.586, z: -1.29181, 
        size: 1.0,
        magnitude: 0.98,
        link: 'audio/Kahin%20Deep%20Jale%20Kahin%20Dil.mp3',
        textPath: 'text/spica.txt',
        connectsTo: [1, 5] // Indices of connected stars
    },
    { 
        name: 'β Virginis known as Zavijava', 
        x: 5.5248, y: 0.3765216, z: 0.0, 
        size: 0.3,
        magnitude: 3.61,
        connectsTo: [0, 2]
    },
    { 
        name: 'γ Virginis known as Porrima', 
        x: 2.1864, y: -0.3196296, z: -0.01463, 
        size: 0.5,
        magnitude: 2.74,
        connectsTo: [1, 3]
    },
    { 
        name: 'δ Virginis known as Auva', 
        x: 1.3512, y: 0.7918332, z: -1.14551, 
        size: 0.4,
        magnitude: 3.38,
        connectsTo: [2, 4]
    },
    { 
        name: 'ε Virginis known as Vindemiatrix', 
        x: 0.918, y: 2.586, z: -0.4484, 
        size: 0.6,
        magnitude: 2.85,
        connectsTo: [3]
    },
    { 
        name: 'ζ Virginis known as Heze', 
        x: -1.2864, y: -0.0925788, z: -0.22287, 
        size: 0.35,
        magnitude: 3.37,
        connectsTo: [0, 6]
    },
    { 
        name: 'η Virginis known as Zaniah', 
        x: 3.732, y: -0.1763652, z: -1.42158, 
        size: 0.4,
        magnitude: 3.89,
        connectsTo: [5]
    }
];

export class StarSystem {
    constructor(scene) {
        this.scene = scene;
        this.starMeshes = [];
        this.currentlyHoveredStar = null;
        this.activeStar = null;
        this.constellationLines = [];
    }

    createStars() {
        // Create constellation lines first so they appear behind stars
        this.createConstellationLines();
        
        // Create stars
        starData.forEach(star => {
            const mesh = this.createStarMesh(star);
            this.scene.add(mesh);
            this.starMeshes.push({
                mesh,
                name: star.name,
                link: star.link,
                textPath: star.textPath,
                magnitude: star.magnitude
            });
        });
    }

    createStarMesh(star) {
        // Base geometry
        const geometry = new THREE.SphereGeometry(star.size, 32, 32);
        
        // Create glow geometry
        const glowGeometry = new THREE.SphereGeometry(star.size * 1.2, 32, 32);
        
        // Materials
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

        // Create meshes
        const starMesh = new THREE.Mesh(geometry, material);
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        
        // Create group and add both meshes
        const group = new THREE.Group();
        group.add(starMesh);
        group.add(glowMesh);
        
        // Position
        group.position.set(
            star.x * STAR_CONFIG.scaleMultiplier,
            star.y * STAR_CONFIG.scaleMultiplier,
            star.z * STAR_CONFIG.scaleMultiplier
        );
        
        // Store references
        group.userData.starMesh = starMesh;
        group.userData.glowMesh = glowMesh;
        
        return group;
    }

    createConstellationLines() {
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x334455,
            transparent: true,
            opacity: 0.3,
            linewidth: 1
        });

        starData.forEach(star => {
            star.connectsTo.forEach(targetIndex => {
                const targetStar = starData[targetIndex];
                const points = [];
                
                points.push(new THREE.Vector3(
                    star.x * STAR_CONFIG.scaleMultiplier,
                    star.y * STAR_CONFIG.scaleMultiplier,
                    star.z * STAR_CONFIG.scaleMultiplier
                ));
                
                points.push(new THREE.Vector3(
                    targetStar.x * STAR_CONFIG.scaleMultiplier,
                    targetStar.y * STAR_CONFIG.scaleMultiplier,
                    targetStar.z * STAR_CONFIG.scaleMultiplier
                ));

                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, lineMaterial);
                this.constellationLines.push(line);
                this.scene.add(line);
            });
        });
    }

    handleHover(hoveredMesh, starNameElement) {
        const hoveredStarData = this.starMeshes.find(star => star.mesh === hoveredMesh);
        
        if (this.currentlyHoveredStar !== hoveredMesh && hoveredStarData) {
            this.resetPreviousHover();
            this.applyHoverEffect(hoveredMesh);
            this.currentlyHoveredStar = hoveredMesh;
            
            // Update star info with magnitude
            starNameElement.innerHTML = `${hoveredStarData.name}<br><span class="magnitude">Magnitude: ${hoveredStarData.magnitude}</span>`;
            
            // Highlight connected constellation lines
            this.highlightConnectedLines(hoveredMesh);
        }
    }

    highlightConnectedLines(hoveredMesh) {
        const position = hoveredMesh.position;
        this.constellationLines.forEach(line => {
            const linePositions = line.geometry.attributes.position.array;
            const isConnected = (
                (Math.abs(linePositions[0] - position.x) < 0.1 &&
                 Math.abs(linePositions[1] - position.y) < 0.1 &&
                 Math.abs(linePositions[2] - position.z) < 0.1) ||
                (Math.abs(linePositions[3] - position.x) < 0.1 &&
                 Math.abs(linePositions[4] - position.y) < 0.1 &&
                 Math.abs(linePositions[5] - position.z) < 0.1)
            );

            if (isConnected) {
                gsap.to(line.material, {
                    opacity: 0.8,
                    color: 0x66aaff,
                    duration: 0.3
                });
            }
        });
    }

    resetPreviousHover() {
        if (this.currentlyHoveredStar && this.currentlyHoveredStar !== this.activeStar) {
            gsap.killTweensOf(this.currentlyHoveredStar.userData.starMesh.material);
            gsap.killTweensOf(this.currentlyHoveredStar.userData.glowMesh.material);
            
            gsap.to(this.currentlyHoveredStar.userData.starMesh.material, {
                emissiveIntensity: STAR_CONFIG.defaultIntensity,
                duration: ANIMATION_CONFIG.longDuration,
                ease: ANIMATION_CONFIG.defaultEase
            });
            
            gsap.to(this.currentlyHoveredStar.userData.glowMesh.material, {
                opacity: 0.15,
                duration: ANIMATION_CONFIG.longDuration,
                ease: ANIMATION_CONFIG.defaultEase
            });

            // Reset constellation lines
            this.constellationLines.forEach(line => {
                gsap.to(line.material, {
                    opacity: 0.3,
                    color: 0x334455,
                    duration: 0.3
                });
            });
        }
    }

    applyHoverEffect(mesh) {
        gsap.to(mesh.userData.starMesh.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.hoverIntensityMultiplier,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: ANIMATION_CONFIG.defaultEase
        });

        gsap.to(mesh.userData.glowMesh.material, {
            opacity: 0.3,
            duration: ANIMATION_CONFIG.defaultDuration,
            ease: ANIMATION_CONFIG.defaultEase
        });
    }

    resetAllStars() {
        this.starMeshes.forEach(starData => {
            gsap.to(starData.mesh.userData.starMesh.material, {
                emissiveIntensity: STAR_CONFIG.defaultIntensity,
                duration: ANIMATION_CONFIG.longDuration,
                ease: ANIMATION_CONFIG.defaultEase
            });
            
            gsap.to(starData.mesh.userData.glowMesh.material, {
                opacity: 0.15,
                duration: ANIMATION_CONFIG.longDuration,
                ease: ANIMATION_CONFIG.defaultEase
            });
        });

        this.constellationLines.forEach(line => {
            gsap.to(line.material, {
                opacity: 0.3,
                color: 0x334455,
                duration: 0.3
            });
        });

        this.activeStar = null;
        this.currentlyHoveredStar = null;
    }

    cleanup() {
        // Dispose of geometries and materials
        this.starMeshes.forEach(starData => {
            starData.mesh.userData.starMesh.geometry.dispose();
            starData.mesh.userData.starMesh.material.dispose();
            starData.mesh.userData.glowMesh.geometry.dispose();
            starData.mesh.userData.glowMesh.material.dispose();
            this.scene.remove(starData.mesh);
        });

        this.constellationLines.forEach(line => {
            line.geometry.dispose();
            line.material.dispose();
            this.scene.remove(line);
        });
    }
}

export { starData };