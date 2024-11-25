import gsap from 'gsap';
import { STAR_CONFIG } from './starsystem.js';

export class AudioPlayer {
    constructor(starSystem, bloomPass) {
        this.audio = new Audio();
        this.audio.loop = false;
        this.isPlaying = false;
        this.starSystem = starSystem;
        this.bloomPass = bloomPass;
        this.activePulseTween = null;
        
        // Initialize audio context and analyzer
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyzer = this.audioContext.createAnalyser();
        this.analyzer.fftSize = 1024;
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.analyzer);
        this.analyzer.connect(this.audioContext.destination);

        // Cache DOM elements
        this.playerContainer = document.getElementById('audio-player-container');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.rewindBtn = document.getElementById('rewind-btn');
        this.fastForwardBtn = document.getElementById('fast-forward-btn');
        this.waveVisualizer = document.getElementById('waveform-visualizer');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.rewindBtn.addEventListener('click', () => this.seek(-30));
        this.fastForwardBtn.addEventListener('click', () => this.seek(30));
        document.addEventListener("playAudio", (event) => this.play(event.detail.audioSrc));
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.resume();
        }
        this.isPlaying = !this.isPlaying;
        this.playPauseBtn.textContent = 'play/pause';
    }

    play(audioSrc) {
        this.audio.src = audioSrc;
        this.playerContainer.style.display = 'flex';
        this.audio.play();
        this.isPlaying = true;
        this.audioContext.resume();
        this.startVisualizer();
    }

    pause() {
        this.audio.pause();
        if (this.starSystem.activeStar) {
            this.handleStarPause();
        }
    }

    resume() {
        this.audio.play();
        this.audioContext.resume();
        if (this.starSystem.activeStar) {
            this.handleStarResume();
        }
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.hidePlayer();
        this.starSystem.resetAllStars();
    }

    seek(seconds) {
        this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, 
            this.audio.currentTime + seconds));
    }

    hidePlayer() {
        this.playerContainer.style.display = 'none';
    }

    handleStarPause() {
        gsap.killTweensOf(this.starSystem.activeStar.material);
        gsap.to(this.starSystem.activeStar.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.hoverIntensityMultiplier,
            duration: 0.5,
            ease: "power2.inOut"
        });
        this.handleBloomPause();
    }

    handleStarResume() {
        this.handleBloomResume();
        gsap.to(this.starSystem.activeStar.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.clickIntensityMultiplier,
            duration: 0.5,
            ease: "power2.inOut"
        });
    }

    handleBloomPause() {
        gsap.to(this.bloomPass, {
            strength: 0.6,
            duration: 1.5,
            ease: "power4.out",
            onComplete: () => {
                this.bloomPass.radius = 0.2;
                if (this.activePulseTween) {
                    this.activePulseTween.kill();
                    this.activePulseTween = null;
                }
            }
        });
    }

    handleBloomResume() {
        gsap.to(this.bloomPass, {
            strength: 1.6,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                this.bloomPass.radius = 0.1;
                this.activePulseTween = gsap.to(this.bloomPass, {
                    strength: 2.8,
                    duration: 1.8,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }
        });
    }

    startVisualizer() {
        const drawFrame = () => {
            requestAnimationFrame(drawFrame);
            const bufferLength = this.analyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.analyzer.getByteTimeDomainData(dataArray);

            const ctx = this.waveVisualizer.getContext('2d');
            ctx.clearRect(0, 0, this.waveVisualizer.width, this.waveVisualizer.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#00ffcc';
            ctx.beginPath();

            const sliceWidth = this.waveVisualizer.width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * this.waveVisualizer.height) / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(this.waveVisualizer.width, this.waveVisualizer.height / 2);
            ctx.stroke();
        };
        
        drawFrame();
    }
}