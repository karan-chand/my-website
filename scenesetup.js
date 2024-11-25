import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneSetup {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
        this.camera.position.set(0, 0, 50);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.7;
        this.controls.enableZoom = true;
        this.controls.enablePan = false;
        this.controls.target.set(0, 0, 0);
    }

    setupBloom() {
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.6,
            0.2,
            0.08
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
        gsap.to(this.camera.position, {
            x: 0,
            y: 0,
            z: 50,
            duration: 2.0,
            ease: "power2.inOut"
        });
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    animate(callback) {
        requestAnimationFrame(() => this.animate(callback));
        this.controls.update();
        this.composer.render();
        if (callback) callback();
    }
}