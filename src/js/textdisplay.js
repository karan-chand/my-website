const gsap = window.gsap;

export class TextDisplay {
    constructor() {
        this.currentPage = 0;
        this.pages = [];
        this.state = 'default';
        this.previewLength = 150;
        this.isVisible = false;
        this.modal = null;
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'text-modal';
        this.modal.style.display = 'none';
        
        this.modal.innerHTML = `
            <div class="modal-header">
                <div class="modal-title">
                    <span class="star-name"></span>
                </div>
                <div class="modal-controls">
                    <button class="modal-button minimize" aria-label="Default view" style="display: none">_</button>
                    <button class="modal-button fullscreen" aria-label="Toggle fullscreen">□</button>
                    <button class="modal-button close" aria-label="Close">×</button>
                </div>
            </div>
            <div class="modal-content">
                <div class="text-content"></div>
                <div class="navigation">
                    <button class="prev" disabled>Previous</button>
                    <span class="page-counter">1/1</span>
                    <button class="next">Next</button>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.setupEventListeners();
        return this.modal;
    }

    setupEventListeners() {
        if (!this.modal) return;
        
        this.modal.querySelector('.prev').addEventListener('click', () => this.prevPage());
        this.modal.querySelector('.next').addEventListener('click', () => this.nextPage());
        this.modal.querySelector('.close').addEventListener('click', () => this.hide());
        this.modal.querySelector('.fullscreen').addEventListener('click', () => this.toggleFullscreen());
        this.modal.querySelector('.minimize').addEventListener('click', () => this.toggleFullscreen());
        
        document.addEventListener('keydown', (e) => this.handleEscape(e));
    }

    async show(starName, textPath) {
        try {
            if (!this.modal) {
                this.createModal();
            }
            
            const response = await fetch(textPath);
            if (!response.ok) throw new Error('Failed to load text');
            
            const text = await response.text();
            this.fullText = text;
            this.pages = this.paginateText(text);
            
            const preview = this.createPreview(text);
            this.modal.querySelector('.text-content').textContent = preview;
            this.modal.querySelector('.star-name').textContent = starName;
            
            this.modal.classList.remove('fullscreen');
            this.modal.style.display = 'block';
            this.isVisible = true;

            const fullscreenBtn = this.modal.querySelector('.fullscreen');
            const minimizeBtn = this.modal.querySelector('.minimize');
            fullscreenBtn.style.display = 'inline-flex';
            minimizeBtn.style.display = 'none';

            gsap.fromTo(this.modal,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
            );
            
            this.updateNavigationUI();
        } catch (error) {
            console.error('Error loading text:', error);
        }
    }

    hide() {
        if (!this.modal) return;
        
        gsap.to(this.modal, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                this.modal.style.display = 'none';
                this.currentPage = 0;
                this.state = 'default';
                this.isVisible = false;
            }
        });
    }

    toggleFullscreen() {
        if (!this.modal) return;
        
        const content = this.modal.querySelector('.text-content');
        const fullscreenBtn = this.modal.querySelector('.fullscreen');
        const minimizeBtn = this.modal.querySelector('.minimize');

        if (this.state === 'fullscreen') {
            this.modal.classList.remove('fullscreen');
            content.textContent = this.createPreview(this.fullText);
            fullscreenBtn.style.display = 'inline-flex';
            minimizeBtn.style.display = 'none';
            this.state = 'default';
        } else {
            this.modal.classList.add('fullscreen');
            this.currentPage = 0;
            content.textContent = this.pages[0];
            fullscreenBtn.style.display = 'none';
            minimizeBtn.style.display = 'inline-flex';
            this.state = 'fullscreen';
        }
        
        this.updateNavigationUI();
    }

    createPreview(text) {
        const preview = text.substring(0, this.previewLength);
        return preview + (text.length > this.previewLength ? '...' : '');
    }

    paginateText(text) {
        const wordsPerPage = 300;
        const words = text.split(/\s+/);
        const pages = [];
        
        for (let i = 0; i < words.length; i += wordsPerPage) {
            pages.push(words.slice(i, i + wordsPerPage).join(' '));
        }
        
        return pages;
    }

    prevPage() {
        if (this.currentPage > 0 && this.state === 'fullscreen') {
            this.animatePageTransition('right', () => {
                this.currentPage--;
                this.updateContent();
            });
        }
    }

    nextPage() {
        if (this.currentPage < this.pages.length - 1 && this.state === 'fullscreen') {
            this.animatePageTransition('left', () => {
                this.currentPage++;
                this.updateContent();
            });
        }
    }

    updateContent() {
        if (!this.modal) return;
        const content = this.modal.querySelector('.text-content');
        content.textContent = this.pages[this.currentPage];
        this.updateNavigationUI();
    }

    updateNavigationUI() {
        if (!this.modal) return;
        const nav = this.modal.querySelector('.navigation');
        const counter = this.modal.querySelector('.page-counter');
        const prevBtn = this.modal.querySelector('.prev');
        const nextBtn = this.modal.querySelector('.next');
        const progressBar = this.modal.querySelector('.progress-fill');

        nav.style.display = this.state === 'fullscreen' ? 'flex' : 'none';
        
        if (this.state === 'fullscreen') {
            counter.textContent = `${this.currentPage + 1}/${this.pages.length}`;
            prevBtn.disabled = this.currentPage === 0;
            nextBtn.disabled = this.currentPage === this.pages.length - 1;
            
            const progress = ((this.currentPage + 1) / this.pages.length) * 100;
            gsap.to(progressBar, {
                width: `${progress}%`,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }

    animatePageTransition(direction, callback) {
        if (!this.modal) return;
        const content = this.modal.querySelector('.text-content');
        const xOffset = direction === 'left' ? -20 : 20;
        
        gsap.to(content, {
            opacity: 0,
            x: xOffset,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
                callback();
                gsap.fromTo(content,
                    { opacity: 0, x: -xOffset },
                    { opacity: 1, x: 0, duration: 0.2, ease: "power2.out" }
                );
            }
        });
    }

    handleEscape(event) {
        if (event.key === 'Escape') {
            const header = document.querySelector('header h1');
            gsap.to(this.modal, {
                opacity: 0,
                y: 20,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    this.modal.style.display = 'none';
                    this.currentPage = 0;
                    this.state = 'default';
                    header.click();
                }
            });
        }
    }
    
    cleanup() {
        document.removeEventListener('keydown', this.handleEscape);
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}