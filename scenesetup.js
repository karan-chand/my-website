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
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupPostProcessing();
            this.setupControls();
            this.setupResizeHandler();
            this.setupPerformanceMonitor();
            this.disposables = new Set();
        } catch (error) {
            console.error('Scene setup failed:', error);
            throw error;
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);
        this.disposables.add(this.scene);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            CAMERA_CONFIG.fov, 
            window.innerWidth / window.innerHeight,
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

            this.renderer.setSize(window.innerWidth, window.innerHeight);
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

            this.bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                BLOOM_CONFIG.defaultStrength,
                BLOOM_CONFIG.defaultRadius,
                BLOOM_CONFIG.defaultThreshold
            );
            this.composer.addPass(this.bloomPass);

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

    setupResizeHandler() {
        this.resizeHandler = () => {
            try {
                const width = window.innerWidth;
                const height = window.innerHeight;
                const pixelRatio = Math.min(window.devicePixelRatio, 2);

                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();

                this.renderer.setSize(width, height);
                this.renderer.setPixelRatio(pixelRatio);

                this.composer.setSize(width, height);
                this.composer.setPixelRatio(pixelRatio);
            } catch (error) {
                console.error('Resize handling failed:', error);
            }
        };

        window.addEventListener('resize', this.resizeHandler);
    }

    setupPerformanceMonitor() {
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
        
        this.adjustQuality = () => {
            const currentTime = performance.now();
            this.frameCount++;

            if (currentTime - this.lastTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastTime = currentTime;

                if (this.fps < 30) {
                    this.renderer.setPixelRatio(1);
                    this.composer.setPixelRatio(1);
                    this.bloomPass.strength *= 0.9;
                } else if (this.fps > 55 && window.devicePixelRatio > 1) {
                    const newPixelRatio = Math.min(
                        this.renderer.getPixelRatio() + 0.1,
                        Math.min(window.devicePixelRatio, 2)
                    );
                    this.renderer.setPixelRatio(newPixelRatio);
                    this.composer.setPixelRatio(newPixelRatio);
                }
            }
        };
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