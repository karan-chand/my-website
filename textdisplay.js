const gsap = window.gsap;
import { UI_CONFIG } from './constants.js';

export class TextDisplay {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.textElements = new Map();
        this.isMinimized = false;
        this.createModal();
        this.initializeDrag();
        this.setupKeyboardControls();
        this.currentPage = 0;
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'text-modal';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-label', 'Star Information');
        
        this.modal.innerHTML = `
            <div class="modal-header" role="heading" aria-level="1">
                <div class="modal-title">
                    <span class="title-text">Star Information</span>
                    <span class="star-name"></span>
                </div>
                <div class="modal-controls">
                    <button class="modal-button minimize" aria-label="Minimize">
                        <span class="minimize-icon">_</span>
                    </button>
                    <button class="modal-button close" aria-label="Close">
                        <span class="close-icon">×</span>
                    </button>
                </div>
            </div>
            <div class="modal-content">
                <div class="text-content" role="article"></div>
                <div class="navigation" role="navigation">
                    <button class="prev" aria-label="Previous page">Previous</button>
                    <span class="page-counter" aria-live="polite">1/1</span>
                    <button class="next" aria-label="Next page">Next</button>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.bindEventListeners();
    }

    bindEventListeners() {
        this.modal.querySelector('.close').addEventListener('click', () => this.hide());
        this.modal.querySelector('.minimize').addEventListener('click', () => this.toggleMinimize());
        this.modal.querySelector('.prev').addEventListener('click', () => this.prevPage());
        this.modal.querySelector('.next').addEventListener('click', () => this.nextPage());

        // Add touch swipe support
        let touchStartX = 0;
        this.modal.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        this.modal.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    this.nextPage();
                } else {
                    this.prevPage();
                }
            }
        });
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.modal.style.display || this.modal.style.display === 'none') return;
            
            switch (e.key) {
                case 'Escape':
                    this.hide();
                    break;
                case 'ArrowRight':
                    this.nextPage();
                    break;
                case 'ArrowLeft':
                    this.prevPage();
                    break;
            }
        });
    }

    async show(starName, textPath) {
        try {
            await this.loadContent(textPath);
            this.modal.querySelector('.star-name').textContent = starName;
            
            // Reset position and show modal
            this.modal.style.opacity = '0';
            this.modal.style.display = 'block';
            this.modal.style.transform = 'translate(-50%, 20px)';
            
            gsap.to(this.modal, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
            
            this.updateProgressBar();
        } catch (error) {
            console.error('Error showing text:', error);
            this.showError();
        }
    }

    hide() {
        gsap.to(this.modal, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                this.modal.style.display = 'none';
                this.currentPage = 0;
            }
        });
    }

    async loadContent(textPath) {
        const response = await fetch(textPath);
        if (!response.ok) throw new Error('Text content not found');
        
        const text = await response.text();
        this.pages = this.splitIntoPages(text);
        this.currentPage = 0;
        this.updateModalContent();
    }

    showError() {
        this.modal.querySelector('.text-content').innerHTML = `
            <div class="error-message">
                <p>Unable to load content.</p>
                <button onclick="this.hide()">Close</button>
            </div>
        `;
    }

    updateModalContent() {
        const content = this.modal.querySelector('.text-content');
        content.textContent = this.pages[this.currentPage];
        
        this.modal.querySelector('.page-counter').textContent = 
            `${this.currentPage + 1}/${this.pages.length}`;
            
        this.updateProgressBar();
    }

    updateProgressBar() {
        const progress = ((this.currentPage + 1) / this.pages.length) * 100;
        const progressFill = this.modal.querySelector('.progress-fill');
        
        gsap.to(progressFill, {
            width: `${progress}%`,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    toggleMinimize() {
        const content = this.modal.querySelector('.modal-content');
        const minimizeIcon = this.modal.querySelector('.minimize-icon');
        
        if (this.isMinimized) {
            gsap.to(this.modal, {
                width: '80%',
                maxWidth: '800px',
                duration: 0.3,
                ease: 'power2.out'
            });
            content.style.display = 'block';
            minimizeIcon.textContent = '_';
        } else {
            gsap.to(this.modal, {
                width: '200px',
                duration: 0.3,
                ease: 'power2.out'
            });
            content.style.display = 'none';
            minimizeIcon.textContent = '□';
        }
        
        this.isMinimized = !this.isMinimized;
    }

    splitIntoPages(text, wordsPerPage = 200) {
        return text.split(/\n\n+/).map(paragraph => paragraph.trim());
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.animatePageTransition('right', () => {
                this.currentPage--;
                this.updateModalContent();
            });
        }
    }

    nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.animatePageTransition('left', () => {
                this.currentPage++;
                this.updateModalContent();
            });
        }
    }

    animatePageTransition(direction, callback) {
        const content = this.modal.querySelector('.text-content');
        const xOffset = direction === 'left' ? -20 : 20;
        
        gsap.to(content, {
            opacity: 0,
            x: xOffset,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
                callback();
                gsap.fromTo(content, 
                    { opacity: 0, x: -xOffset },
                    { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' }
                );
            }
        });
    }
}