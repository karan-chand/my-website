import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { CAMERA_CONFIG, CONTROLS_CONFIG, BLOOM_CONFIG, ANIMATION_CONFIG } from './constants.js';

export class SceneSetup {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            CAMERA_CONFIG.fov, 
            window.innerWidth / window.innerHeight,
            CAMERA_CONFIG.near,
            CAMERA_CONFIG.far
        );
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('virgo-constellation'), 
            antialias: true 
        });
        
        this.setupRenderer();
        this.setupCamera();
        this.setupBloom();
        this.setupControls();
        
        window.addEventListener('resize', () => this.handleResize());
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000);
    }

    setupCamera() {
        const { x, y, z } = CAMERA_CONFIG.defaultPosition;
        this.camera.position.set(x, y, z);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = CONTROLS_CONFIG.dampingFactor;
        this.controls.rotateSpeed = CONTROLS_CONFIG.rotateSpeed;
        this.controls.enableZoom = CONTROLS_CONFIG.enableZoom;
        this.controls.enablePan = CONTROLS_CONFIG.enablePan;
        this.controls.target.set(
            CONTROLS_CONFIG.defaultTarget.x,
            CONTROLS_CONFIG.defaultTarget.y,
            CONTROLS_CONFIG.defaultTarget.z
        );
    }

    setupBloom() {
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            BLOOM_CONFIG.defaultStrength,
            BLOOM_CONFIG.defaultRadius,
            BLOOM_CONFIG.defaultThreshold
        );
        this.composer.addPass(this.bloomPass);
    }

    setupControls() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    handleResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    resetCamera() {
        const { x, y, z } = CAMERA_CONFIG.defaultPosition;
        gsap.to(this.camera.position, {
            x, y, z,
            duration: ANIMATION_CONFIG.resetDuration,
            ease: ANIMATION_CONFIG.defaultEase
        });
        this.controls.target.set(
            CONTROLS_CONFIG.defaultTarget.x,
            CONTROLS_CONFIG.defaultTarget.y,
            CONTROLS_CONFIG.defaultTarget.z
        );
        this.controls.update();
    }

    animate(callback) {
        requestAnimationFrame(() => this.animate(callback));
        this.controls.update();
        this.composer.render();
        if (callback) callback();
    }
}