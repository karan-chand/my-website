import gsap from 'gsap';
import { STAR_CONFIG, BLOOM_CONFIG, ANIMATION_CONFIG, AUDIO_CONFIG, UI_CONFIG } from './constants.js';

export class AudioPlayer {
    constructor(starSystem, bloomPass) {
        this.audio = new Audio();
        this.starSystem = starSystem;
        this.bloomPass = bloomPass;
        this.isPlaying = false;
        this.activePulseTween = null;
        this.currentStarMesh = null;
        
        this.initializeAudioContext();
        this.cacheElements();
        this.initializeEventListeners();

        // Listen for playAudio events
        document.addEventListener("playAudio", (event) => {
            if (event.detail && event.detail.audioSrc) {
                console.log('Playing audio:', event.detail.audioSrc);
                this.play(event.detail.audioSrc, event.detail.textPath);
                if (this.playerContainer) {
                    this.playerContainer.style.display = 'flex';
                }
            }
        });
    }

    cacheElements() {
        this.playerContainer = document.getElementById('audio-player-container');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.rewindBtn = document.getElementById('rewind-btn');
        this.fastForwardBtn = document.getElementById('fast-forward-btn');
        this.waveVisualizer = document.getElementById('waveform-visualizer');
        
        if (!this.playerContainer || !this.playPauseBtn || !this.stopBtn || 
            !this.rewindBtn || !this.fastForwardBtn || !this.waveVisualizer) {
            console.error('Failed to cache audio player elements');
        }

        // Set initial styles
        if (this.playerContainer) {
            this.playerContainer.style.width = UI_CONFIG.sizes.playerWidth;
            this.playerContainer.style.maxWidth = UI_CONFIG.sizes.playerMaxWidth;
        }
    }

    initializeAudioContext() {
        if (typeof window !== 'undefined' && 
            (window.AudioContext || window.webkitAudioContext)) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyzer = this.audioContext.createAnalyser();
            this.analyzer.fftSize = AUDIO_CONFIG.fftSize;
            this.analyzer.smoothingTimeConstant = AUDIO_CONFIG.smoothingTimeConstant;
            this.analyzer.minDecibels = AUDIO_CONFIG.minDecibels;
            this.analyzer.maxDecibels = AUDIO_CONFIG.maxDecibels;
            
            // Create gain node
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = AUDIO_CONFIG.defaultVolume;
            
            // Set up audio processing chain (removed biquadFilter)
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source
                .connect(this.gainNode)
                .connect(this.analyzer)
                .connect(this.audioContext.destination);

            this.setupVisualizerData();
        } else {
            console.error('Web Audio API is not supported in this browser');
        }
    }

    initializeEventListeners() {
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }
        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => this.stop());
        }
        if (this.rewindBtn) {
            this.rewindBtn.addEventListener('click', () => this.seek(-10));
        }
        if (this.fastForwardBtn) {
            this.fastForwardBtn.addEventListener('click', () => this.seek(10));
        }

        this.audio.addEventListener('ended', () => {
            this.playPauseBtn.textContent = 'play';
            this.isPlaying = false;
            if (this.currentStarMesh) {
                this.starSystem.stopPulse(this.currentStarMesh);
            }
        });

        window.addEventListener('resize', () => {
            this.resizeVisualizer();
        });
    }

    setupVisualizerData() {
        this.bufferLength = this.analyzer.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.peaks = new Uint8Array(this.bufferLength);
        this.peakTimes = new Float32Array(this.bufferLength);
        this.lastDrawTime = performance.now();
    }

    async play(audioSrc, textPath) {
        try {
            console.log('Loading audio file:', audioSrc);
            this.showLoadingState();
            
            // Stop any existing playback
            if (this.isPlaying) {
                this.stop();
            }

            this.audio.src = audioSrc;
            
            await new Promise((resolve, reject) => {
                this.audio.oncanplaythrough = resolve;
                this.audio.onerror = reject;
                this.audio.load();
            });

            console.log('Audio file loaded successfully');
            await this.startPlayback();
            this.hideLoadingState();
            this.startVisualizer();

        } catch (error) {
            console.error('Audio playback error:', error);
            this.handlePlaybackError(error);
        }
    }

    async startPlayback() {
        try {
            await this.audioContext.resume();
            await this.audio.play();
            this.isPlaying = true;
            if (this.playPauseBtn) {
                this.playPauseBtn.textContent = 'pause';
            }
            if (this.currentStarMesh) {
                this.starSystem.startPulse(this.currentStarMesh);
            }
        } catch (error) {
            console.error('Playback error:', error);
            throw error;
        }
    }

    togglePlayPause() {
        if (this.audio.paused) {
            this.audio.play();
            this.playPauseBtn.textContent = 'pause';
            this.isPlaying = true;
            if (this.currentStarMesh) {
                this.starSystem.startPulse(this.currentStarMesh);
            }
            this.startVisualizer();
        } else {
            this.audio.pause();
            this.playPauseBtn.textContent = 'play';
            this.isPlaying = false;
            if (this.currentStarMesh) {
                this.starSystem.stopPulse(this.currentStarMesh);
            }
        }
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.playPauseBtn.textContent = 'play';
        this.isPlaying = false;
        if (this.currentStarMesh) {
            this.starSystem.stopPulse(this.currentStarMesh);
        }
        
        if (this.playerContainer) {
            gsap.to(this.playerContainer, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    this.playerContainer.style.display = 'none';
                    this.playerContainer.style.opacity = 1;
                }
            });
        }
    }

    seek(seconds) {
        const newTime = Math.max(0, Math.min(this.audio.duration, this.audio.currentTime + seconds));
        this.audio.currentTime = newTime;
    }

    resizeVisualizer() {
        if (this.waveVisualizer) {
            const rect = this.waveVisualizer.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            this.waveVisualizer.width = rect.width * dpr;
            this.waveVisualizer.height = rect.height * dpr;
            const ctx = this.waveVisualizer.getContext('2d');
            ctx.scale(dpr, dpr);
        }
    }

    startVisualizer() {
        const draw = () => {
            if (!this.isPlaying) return;
            
            requestAnimationFrame(draw);
            this.analyzer.getByteTimeDomainData(this.dataArray);
            
            const canvas = this.waveVisualizer;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            
            // Clear canvas with slight fade effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, width, height);
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = UI_CONFIG.colors.waveform;
            ctx.beginPath();
            
            const sliceWidth = width / this.bufferLength;
            let x = 0;
            
            for (let i = 0; i < this.bufferLength; i++) {
                const v = this.dataArray[i] / 128.0;
                const y = v * height / 2;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            ctx.lineTo(width, height / 2);
            ctx.stroke();
        };
        
        this.resizeVisualizer();
        draw();
    }

    showLoadingState() {
        if (this.playerContainer) {
            this.playerContainer.classList.add('loading');
            if (!this.loadingSpinner) {
                this.loadingSpinner = document.createElement('div');
                this.loadingSpinner.className = 'loading-spinner';
                this.playerContainer.appendChild(this.loadingSpinner);
            }
        }
    }

    hideLoadingState() {
        if (this.playerContainer) {
            this.playerContainer.classList.remove('loading');
            if (this.loadingSpinner) {
                this.loadingSpinner.remove();
            }
        }
    }

    handlePlaybackError(error) {
        console.error('Playback error:', error);
        this.hideLoadingState();
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'audio-error';
        errorMessage.textContent = 'Unable to play audio. Please try again.';
        
        if (this.playerContainer) {
            this.playerContainer.appendChild(errorMessage);
            setTimeout(() => errorMessage.remove(), 3000);
        }
        
        this.stop();
    }

    setCurrentStar(mesh) {
        this.currentStarMesh = mesh;
    }

    cleanup() {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}