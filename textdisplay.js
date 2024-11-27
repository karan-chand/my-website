const gsap = window.gsap;

export class TextDisplay {
    constructor() {
        this.modal = this.createModal();
        this.setupEventListeners();
        this.currentPage = 0;
        this.pages = [];
        this.state = 'normal';
        this.previewLength = 150;
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'text-modal';
        
        modal.innerHTML = `
            <div class="modal-header">
                <div class="modal-title">
                    <span class="star-name"></span>
                </div>
                <div class="modal-controls">
                    <button class="modal-button minimize" aria-label="Minimize">_</button>
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
        
        document.body.appendChild(modal);
        return modal;
    }

    setupEventListeners() {
        this.modal.querySelector('.prev').addEventListener('click', () => this.prevPage());
        this.modal.querySelector('.next').addEventListener('click', () => this.nextPage());
        this.modal.querySelector('.close').addEventListener('click', () => this.hide());
        this.modal.querySelector('.minimize').addEventListener('click', () => this.toggleMinimize());
        this.modal.querySelector('.fullscreen').addEventListener('click', () => this.toggleFullscreen());
        
        document.addEventListener('keydown', (e) => this.handleEscape(e));

        let touchStartX = 0;
        this.modal.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        this.modal.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0 && this.state === 'fullscreen') {
                    this.nextPage();
                } else if (diff < 0 && this.state === 'fullscreen') {
                    this.prevPage();
                }
            }
        });
    }

    async show(starName, textPath) {
        try {
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
        gsap.to(this.modal, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                this.modal.style.display = 'none';
                this.currentPage = 0;
                this.state = 'normal';
                this.resetModalSize();
            }
        });
    }

    toggleMinimize() {
        const content = this.modal.querySelector('.modal-content');
        const minimizeBtn = this.modal.querySelector('.minimize');
        const fullscreenBtn = this.modal.querySelector('.fullscreen');

        if (this.state === 'minimized') {
            gsap.to(this.modal, {
                width: '90vw',
                maxWidth: '1200px',
                duration: 0.3,
                ease: "power2.out"
            });
            content.style.display = 'block';
            minimizeBtn.textContent = '_';
            fullscreenBtn.style.display = 'inline-block';
            this.state = 'normal';
        } else {
            gsap.to(this.modal, {
                width: '200px',
                duration: 0.3,
                ease: "power2.out"
            });
            content.style.display = 'none';
            minimizeBtn.textContent = '□';
            fullscreenBtn.style.display = 'none';
            this.state = 'minimized';
        }
    }

    toggleFullscreen() {
        const content = this.modal.querySelector('.modal-content');
        const fullscreenBtn = this.modal.querySelector('.fullscreen');

        if (this.state === 'fullscreen') {
            this.modal.classList.remove('fullscreen');
            content.textContent = this.createPreview(this.fullText);
            fullscreenBtn.textContent = '□';
            this.state = 'normal';
        } else {
            this.modal.classList.add('fullscreen');
            this.currentPage = 0;
            content.textContent = this.pages[0];
            fullscreenBtn.textContent = '❐';
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
        const content = this.modal.querySelector('.text-content');
        content.textContent = this.pages[this.currentPage];
        this.updateNavigationUI();
    }

    updateNavigationUI() {
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

    resetModalSize() {
        gsap.set(this.modal, {
            width: '90vw',
            maxWidth: '1200px'
        });
        this.modal.querySelector('.modal-content').style.display = 'block';
        this.modal.querySelector('.fullscreen').textContent = '□';
    }

    handleEscape(event) {
        if (event.key === 'Escape') {
            this.hide();
            document.querySelector('header h1').click();
        }
    }

    cleanup() {
        document.removeEventListener('keydown', this.handleEscape);
    }
}