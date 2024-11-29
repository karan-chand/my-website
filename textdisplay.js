const gsap = window.gsap;

export class TextDisplay {
    constructor() {
        this.modal = this.createModal();
        this.setupEventListeners();
        this.currentPage = 0;
        this.pages = [];
        this.state = 'default';
        this.previewLength = 150;
        this.isVisible = false;
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'text-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        modal.innerHTML = `
            <div class="modal-header">
                <div class="modal-title">
                    <span class="star-name" aria-live="polite"></span>
                </div>
                <div class="modal-controls">
                    <button class="modal-button minimize" aria-label="Default view" style="display: none">_</button>
                    <button class="modal-button fullscreen" aria-label="Toggle fullscreen">□</button>
                    <button class="modal-button close" aria-label="Close">×</button>
                </div>
            </div>
            <div class="modal-content">
                <div class="text-content" aria-live="polite"></div>
                <div class="navigation" role="navigation">
                    <button class="prev" disabled aria-label="Previous page">Previous</button>
                    <span class="page-counter" aria-live="polite">1/1</span>
                    <button class="next" aria-label="Next page">Next</button>
                </div>
                <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    setupEventListeners() {
        const handlers = {
            prev: () => this.prevPage(),
            next: () => this.nextPage(),
            close: () => this.hide(),
            fullscreen: () => this.toggleFullscreen(),
            minimize: () => this.toggleFullscreen()
        };
    
        // Bind handleKeyboard to this instance
        this.handleKeyboard = this.handleKeyboard.bind(this);
    
        Object.entries(handlers).forEach(([className, handler]) => {
            const element = this.modal.querySelector(`.${className}`);
            if (element) {
                element.addEventListener('click', handler.bind(this));
            }
        });
        
        document.addEventListener('keydown', this.handleKeyboard);
    }

    handleKeyboard(e) {
        if (!this.isVisible) return;

        const keyHandlers = {
            'Escape': () => this.hide(),
            'ArrowLeft': () => this.state === 'fullscreen' && this.prevPage(),
            'ArrowRight': () => this.state === 'fullscreen' && this.nextPage()
        };

        if (keyHandlers[e.key]) {
            e.preventDefault();
            keyHandlers[e.key]();
        }
    }

    async show(starName, textPath) {
        try {
            const response = await fetch(textPath);
            if (!response.ok) throw new Error(`Failed to load text: ${response.status}`);
            
            const text = await response.text();
            this.fullText = text;
            this.pages = this.paginateText(text);
            
            const preview = this.createPreview(text);
            const contentEl = this.modal.querySelector('.text-content');
            contentEl.textContent = preview;
            contentEl.setAttribute('aria-label', `Content preview for ${starName}`);
            
            this.modal.querySelector('.star-name').textContent = starName;
            
            this.modal.classList.remove('fullscreen');
            this.modal.style.display = 'block';
            this.isVisible = true;

            const fullscreenBtn = this.modal.querySelector('.fullscreen');
            const minimizeBtn = this.modal.querySelector('.minimize');
            fullscreenBtn.style.display = 'inline-flex';
            minimizeBtn.style.display = 'none';

            await gsap.fromTo(this.modal,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
            );
            
            this.updateNavigationUI();
        } catch (error) {
            console.error('Error showing text:', error);
            this.showError('Failed to load content');
        }
    }

    showError(message) {
        const contentEl = this.modal.querySelector('.text-content');
        contentEl.textContent = message;
        contentEl.setAttribute('aria-label', 'Error message');
    }

    hide() {
        gsap.to(this.modal, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                this.modal.style.display = 'none';
                this.reset();
            }
        });
    }

    reset() {
        this.currentPage = 0;
        this.state = 'default';
        this.isVisible = false;
        this.pages = [];
        this.fullText = '';
    }

    toggleFullscreen() {
        const content = this.modal.querySelector('.text-content');
        const fullscreenBtn = this.modal.querySelector('.fullscreen');
        const minimizeBtn = this.modal.querySelector('.minimize');

        const isEnteringFullscreen = this.state !== 'fullscreen';
        this.state = isEnteringFullscreen ? 'fullscreen' : 'default';
        
        this.modal.classList.toggle('fullscreen', isEnteringFullscreen);
        content.textContent = isEnteringFullscreen ? this.pages[0] : this.createPreview(this.fullText);
        
        fullscreenBtn.style.display = isEnteringFullscreen ? 'none' : 'inline-flex';
        minimizeBtn.style.display = isEnteringFullscreen ? 'inline-flex' : 'none';
        
        this.updateNavigationUI();
    }

    createPreview(text) {
        return text.length > this.previewLength 
            ? `${text.substring(0, this.previewLength)}...`
            : text;
    }

    paginateText(text) {
        const wordsPerPage = 300;
        const words = text.split(/\s+/);
        return Array.from({ length: Math.ceil(words.length / wordsPerPage) }, (_, i) =>
            words.slice(i * wordsPerPage, (i + 1) * wordsPerPage).join(' ')
        );
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
        content.setAttribute('aria-label', `Page ${this.currentPage + 1} of ${this.pages.length}`);
        this.updateNavigationUI();
    }

    updateNavigationUI() {
        const nav = this.modal.querySelector('.navigation');
        const counter = this.modal.querySelector('.page-counter');
        const prevBtn = this.modal.querySelector('.prev');
        const nextBtn = this.modal.querySelector('.next');
        const progressBar = this.modal.querySelector('.progress-fill');
        const progressContainer = progressBar.parentElement;

        nav.style.display = this.state === 'fullscreen' ? 'flex' : 'none';
        
        if (this.state === 'fullscreen') {
            const currentPage = this.currentPage + 1;
            const totalPages = this.pages.length;
            
            counter.textContent = `${currentPage}/${totalPages}`;
            prevBtn.disabled = this.currentPage === 0;
            nextBtn.disabled = this.currentPage === totalPages - 1;
            
            const progress = (currentPage / totalPages) * 100;
            progressContainer.setAttribute('aria-valuenow', progress);
            
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

    cleanup() {
        document.removeEventListener('keydown', this.handleKeyboard);
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
    }
}