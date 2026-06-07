import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const gsap = window.gsap;
import { CAMERA_CONFIG, CONTROLS_CONFIG, BLOOM_CONFIG, ANIMATION_CONFIG } from './constants.js';

export class SceneSetup {
    constructor() {
        try {
            this.disposables = new Set();
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupPostProcessing();
            this.setupControls();
            this.setupResizeHandler();
        } catch (error) {
            console.error('Scene setup failed:', error);
            throw error;
        }
    }

    // Size the render target to the framed star-box, not the window.
    getSize() {
        const canvas = document.getElementById('virgo-constellation');
        const box = canvas?.parentElement || canvas;
        const width = box?.clientWidth || window.innerWidth;
        const height = box?.clientHeight || window.innerHeight;
        return { width: Math.max(1, width), height: Math.max(1, height) };
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);
        this.disposables.add(this.scene);
    }

    setupCamera() {
        const { width, height } = this.getSize();
        this.camera = new THREE.PerspectiveCamera(
            CAMERA_CONFIG.fov,
            width / height,
            CAMERA_CONFIG.near,
            CAMERA_CONFIG.far
        );

        const { x, y, z } = CAMERA_CONFIG.defaultPosition;
        this.camera.position.set(x, y, z);
    }

    setupRenderer() {
        try {
            this.renderer = new THREE.WebGLRenderer({
                canvas: document.getElementById('virgo-constellation'),
                antialias: true,
                powerPreference: "high-performance",
                stencil: false,
                depth: true
            });

            if (!this.renderer) {
                throw new Error('WebGL renderer creation failed');
            }

            const { width, height } = this.getSize();
            // updateStyle = false: CSS keeps the canvas filling the box.
            this.renderer.setSize(width, height, false);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.setClearColor(0x000000);
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1;
            this.disposables.add(this.renderer);
        } catch (error) {
            console.error('Renderer setup failed:', error);
            throw error;
        }
    }

    setupPostProcessing() {
        try {
            this.composer = new EffectComposer(this.renderer);

            const renderPass = new RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);

            const { width, height } = this.getSize();
            this.bloomPass = new UnrealBloomPass(
                new THREE.Vector2(width, height),
                BLOOM_CONFIG.defaultStrength,
                BLOOM_CONFIG.defaultRadius,
                BLOOM_CONFIG.defaultThreshold
            );
            this.composer.addPass(this.bloomPass);

            this.composer.setSize(width, height);
            this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.disposables.add(this.composer);
        } catch (error) {
            console.error('Post-processing setup failed:', error);
            throw error;
        }
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = CONTROLS_CONFIG.dampingFactor;
        this.controls.rotateSpeed = CONTROLS_CONFIG.rotateSpeed;
        this.controls.enableZoom = CONTROLS_CONFIG.enableZoom;
        this.controls.enablePan = CONTROLS_CONFIG.enablePan;
        this.controls.minDistance = CONTROLS_CONFIG.minDistance;
        this.controls.maxDistance = CONTROLS_CONFIG.maxDistance;
        this.controls.target.set(
            CONTROLS_CONFIG.defaultTarget.x,
            CONTROLS_CONFIG.defaultTarget.y,
            CONTROLS_CONFIG.defaultTarget.z
        );

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    resize() {
        try {
            const { width, height } = this.getSize();
            const pixelRatio = Math.min(window.devicePixelRatio, 2);

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height, false);
            this.renderer.setPixelRatio(pixelRatio);

            this.composer.setSize(width, height);
            this.composer.setPixelRatio(pixelRatio);
        } catch (error) {
            console.error('Resize handling failed:', error);
        }
    }

    setupResizeHandler() {
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);

        // The box is sized with vh/vw, so observe it directly for changes
        // the window 'resize' event might miss (e.g. mobile toolbar collapse).
        const box = document.getElementById('star-box');
        if (box && typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => this.resize());
            this.resizeObserver.observe(box);
        }
    }

    resetCamera() {
        const { x, y, z } = CAMERA_CONFIG.defaultPosition;
        gsap.to(this.camera.position, {
            x, y, z,
            duration: ANIMATION_CONFIG.resetDuration,
            ease: ANIMATION_CONFIG.defaultEase,
            onUpdate: () => this.camera.updateProjectionMatrix()
        });

        gsap.to(this.controls.target, {
            x: CONTROLS_CONFIG.defaultTarget.x,
            y: CONTROLS_CONFIG.defaultTarget.y,
            z: CONTROLS_CONFIG.defaultTarget.z,
            duration: ANIMATION_CONFIG.resetDuration,
            ease: ANIMATION_CONFIG.defaultEase,
            onUpdate: () => this.controls.update()
        });
    }

    cleanup() {
        window.removeEventListener('resize', this.resizeHandler);
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        this.controls.dispose();

        this.disposables.forEach(item => {
            if (item && typeof item.dispose === 'function') {
                item.dispose();
            }
        });

        this.disposables.clear();

        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.remove();
        }
    }
}
