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
            this.rewindBtn.addEventListener('click', () => this.seek(-30));
        }
        if (this.fastForwardBtn) {
            this.fastForwardBtn.addEventListener('click', () => this.seek(30));
        }
    }

    setupVisualizerData() {
        this.bufferLength = this.analyzer.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.peaks = new Uint8Array(this.bufferLength);
        this.peakTimes = new Float32Array(this.bufferLength);
        this.lastDrawTime = performance.now();
    }

    createTimeDisplay() {
        this.timeDisplay = document.createElement('div');
        this.timeDisplay.className = 'time-display';
        this.timeDisplay.innerHTML = `
            <span class="current-time">0:00</span>
            <div class="progress-slider">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <input type="range" min="0" max="100" value="0" class="seek-slider">
            </div>
            <span class="total-time">0:00</span>
        `;
        this.playerContainer.insertBefore(this.timeDisplay, this.playerContainer.firstChild);
        
        this.seekSlider = this.timeDisplay.querySelector('.seek-slider');
        this.progressFill = this.timeDisplay.querySelector('.progress-fill');
        
        this.seekSlider.addEventListener('input', () => this.handleSeek());
        this.audio.addEventListener('timeupdate', () => this.updateTimeDisplay());
    }

    createVolumeControl() {
        this.volumeControl = document.createElement('div');
        this.volumeControl.className = 'volume-control';
        this.volumeControl.innerHTML = `
            <button class="volume-button">
                <span class="volume-icon">🔊</span>
            </button>
            <div class="volume-slider-container">
                <input type="range" min="0" max="100" value="100" class="volume-slider">
            </div>
        `;
        this.playerContainer.appendChild(this.volumeControl);
        
        const volumeSlider = this.volumeControl.querySelector('.volume-slider');
        const volumeButton = this.volumeControl.querySelector('.volume-button');
        
        volumeSlider.addEventListener('input', (e) => this.handleVolumeChange(e.target.value));
        volumeButton.addEventListener('click', () => this.toggleMute());
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isPlaying) return;
            
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    this.seek(-5);
                    break;
                case 'ArrowRight':
                    this.seek(5);
                    break;
                case 'ArrowUp':
                    this.adjustVolume(0.1);
                    break;
                case 'ArrowDown':
                    this.adjustVolume(-0.1);
                    break;
                case 'm':
                    this.toggleMute();
                    break;
                case 'v':
                    this.toggleVisualizerMode();
                    break;
            }
        });
    }

    async play(audioSrc, textPath) {
        try {
            this.showLoadingState();
            await this.loadAudio(audioSrc);
            
            if (textPath) {
                await this.textDisplay.loadAndShowText(textPath);
            }
            
            await this.startPlayback();
            this.hideLoadingState();
        } catch (error) {
            console.error('Playback error:', error);
            this.handlePlaybackError(error);
        }
    }

    async loadAudio(src) {
        this.audio.src = src;
        return new Promise((resolve, reject) => {
            this.audio.oncanplaythrough = resolve;
            this.audio.onerror = reject;
            this.audio.load();
        });
    }

    async startPlayback() {
        await this.audioContext.resume();
        await this.audio.play();
        this.isPlaying = true;
        this.startVisualizer();
        this.updateControls();
    }

    startVisualizer() {
        const draw = () => {
            if (!this.isPlaying) return;
            
            requestAnimationFrame(draw);
            const currentTime = performance.now();
            const deltaTime = (currentTime - this.lastDrawTime) / 1000;
            this.lastDrawTime = currentTime;
            
            if (this.visualizerMode === 'waveform') {
                this.drawWaveform(deltaTime);
            } else {
                this.drawFrequencyBars(deltaTime);
            }
        };
        
        draw();
    }

    drawWaveform(deltaTime) {
        this.analyzer.getByteTimeDomainData(this.dataArray);
        
        const canvas = this.waveVisualizer;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00ffcc';
        ctx.beginPath();
        
        const sliceWidth = width / this.bufferLength;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = (v * height) / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            // Update peaks
            if (v > this.peaks[i]) {
                this.peaks[i] = v;
                this.peakTimes[i] = 0;
            }
            
            // Draw peaks
            if (this.peaks[i] > v) {
                ctx.lineTo(x, (this.peaks[i] * height) / 2);
                this.peakTimes[i] += deltaTime;
                this.peaks[i] *= Math.max(0, 1 - this.peakTimes[i] * 2);
            }
            
            x += sliceWidth;
        }
        
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    }

    drawFrequencyBars(deltaTime) {
        this.analyzer.getByteFrequencyData(this.dataArray);
        
        const canvas = this.waveVisualizer;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const barWidth = width / (this.bufferLength / 4);
        let x = 0;
        
        for (let i = 0; i < this.bufferLength / 4; i++) {
            const barHeight = this.dataArray[i] * 1.5;
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
            gradient.addColorStop(0, '#00ffcc');
            gradient.addColorStop(1, '#00fff2');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
            
            x += barWidth;
        }
    }

    toggleVisualizerMode() {
        this.visualizerMode = this.visualizerMode === 'waveform' ? 'frequency' : 'waveform';
    }

    handleSeek() {
        const seekTime = (this.seekSlider.value / 100) * this.audio.duration;
        this.audio.currentTime = seekTime;
    }

    updateTimeDisplay() {
        const currentTime = this.formatTime(this.audio.currentTime);
        const totalTime = this.formatTime(this.audio.duration);
        
        this.timeDisplay.querySelector('.current-time').textContent = currentTime;
        this.timeDisplay.querySelector('.total-time').textContent = totalTime;
        
        // Update slider and progress bar
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.seekSlider.value = progress;
        this.progressFill.style.width = `${progress}%`;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    handleVolumeChange(value) {
        const volume = value / 100;
        this.gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.01);
        this.updateVolumeIcon(volume);
    }

    adjustVolume(delta) {
        const volumeSlider = this.volumeControl.querySelector('.volume-slider');
        const newValue = Math.max(0, Math.min(100, parseInt(volumeSlider.value) + delta * 100));
        volumeSlider.value = newValue;
        this.handleVolumeChange(newValue);
    }

    toggleMute() {
        const volumeSlider = this.volumeControl.querySelector('.volume-slider');
        if (this.gainNode.gain.value > 0) {
            this.lastVolume = volumeSlider.value;
            volumeSlider.value = 0;
            this.handleVolumeChange(0);
        } else {
            volumeSlider.value = this.lastVolume || 100;
            this.handleVolumeChange(this.lastVolume || 100);
        }
    }

    updateVolumeIcon(volume) {
        const icon = this.volumeControl.querySelector('.volume-icon');
        icon.textContent = volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊';
    }

    showLoadingState() {
        this.playerContainer.classList.add('loading');
        if (!this.loadingSpinner) {
            this.loadingSpinner = document.createElement('div');
            this.loadingSpinner.className = 'loading-spinner';
            this.playerContainer.appendChild(this.loadingSpinner);
        }
    }

    hideLoadingState() {
        this.playerContainer.classList.remove('loading');
        if (this.loadingSpinner) {
            this.loadingSpinner.remove();
        }
    }

    handlePlaybackError(error) {
        this.hideLoadingState();
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'audio-error';
        errorMessage.textContent = 'Unable to play audio. Please try again.';
        
        this.playerContainer.appendChild(errorMessage);
        setTimeout(() => errorMessage.remove(), 3000);
        
        this.stop();
    }

    cleanup() {
        this.stop();
        this.audio.removeEventListener('timeupdate', this.updateTimeDisplay);
        // Additional cleanup...
    }

}