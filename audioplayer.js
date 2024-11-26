import gsap from 'gsap';
import { STAR_CONFIG, BLOOM_CONFIG, ANIMATION_CONFIG } from './constants.js';

export class AudioPlayer {
    constructor(starSystem, bloomPass) {
        this.audio = new Audio();
        this.starSystem = starSystem;
        this.bloomPass = bloomPass;
        this.isPlaying = false;
        this.activePulseTween = null;
        
        this.initializeAudioContext();
        this.cacheElements();
        this.initializeEventListeners();

        // Listen for playAudio events
        document.addEventListener("playAudio", (event) => {
            if (event.detail && event.detail.audioSrc) {
                console.log('Playing audio:', event.detail.audioSrc);
                this.play(event.detail.audioSrc, event.detail.textPath);
                // Show the player container
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
    }

    initializeAudioContext() {
        if (typeof window !== 'undefined' && 
            (window.AudioContext || window.webkitAudioContext)) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyzer = this.audioContext.createAnalyser();
            this.analyzer.fftSize = 2048;
            
            // Create filters and effects
            this.gainNode = this.audioContext.createGain();
            this.biquadFilter = this.audioContext.createBiquadFilter();
            
            // Set up audio processing chain
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source
                .connect(this.gainNode)
                .connect(this.biquadFilter)
                .connect(this.analyzer)
                .connect(this.audioContext.destination);

            // Initialize visualizer data
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

        // Add audio ended event listener
        this.audio.addEventListener('ended', () => {
            this.playPauseBtn.textContent = 'play';
            this.isPlaying = false;
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
            this.audio.src = audioSrc;
            
            // Wait for the audio to be loaded
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
            this.startVisualizer();
        } else {
            this.audio.pause();
            this.playPauseBtn.textContent = 'play';
            this.isPlaying = false;
        }
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.playPauseBtn.textContent = 'play';
        this.isPlaying = false;
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

    startVisualizer() {
        const draw = () => {
            if (!this.isPlaying) return;
            
            requestAnimationFrame(draw);
            this.analyzer.getByteTimeDomainData(this.dataArray);
            
            const canvas = this.waveVisualizer;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            
            // Clear canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, width, height);
            
            // Draw waveform
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#00ffcc';
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
        
        // Make sure canvas size matches display size
        const dpr = window.devicePixelRatio || 1;
        const rect = this.waveVisualizer.getBoundingClientRect();
        this.waveVisualizer.width = rect.width * dpr;
        this.waveVisualizer.height = rect.height * dpr;
        const ctx = this.waveVisualizer.getContext('2d');
        ctx.scale(dpr, dpr);
        
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

    cleanup() {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}