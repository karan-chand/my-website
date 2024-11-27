const gsap = window.gsap;

export class TextDisplay {
    constructor() {
        this.createModal();
        this.setupEventListeners();
        this.currentPage = 0;
        this.pages = [];
        this.state = 'normal'; // 'normal', 'minimized', or 'fullscreen'
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'text-modal';
        
        this.modal.innerHTML = `
            <div class="modal-header">
                <div class="modal-title">
                    <span class="star-name"></span>
                </div>
                <div class="modal-controls">
                    <button class="modal-button minimize" aria-label="Minimize">_</button>
                    <button class="modal-button close" aria-label="Close">×</button>
                </div>
            </div>
            <div class="modal-content">
                <div class="text-content"></div>
                <div class="navigation">
                    <button class="prev">Previous</button>
                    <span class="page-counter">1/1</span>
                    <button class="next">Next</button>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
    
        document.body.appendChild(this.modal);
    }
    
    setupEventListeners() {
        // Navigation buttons
        this.modal.querySelector('.prev').addEventListener('click', () => this.prevPage());
        this.modal.querySelector('.next').addEventListener('click', () => this.nextPage());
        
        // Control buttons
        this.modal.querySelector('.close').addEventListener('click', () => this.hide());
        this.modal.querySelector('.minimize').addEventListener('click', () => this.toggleMinimize());
    
        // Touch swipe support
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

    async show(starName, textPath) {
        try {
            // Load content
            const response = await fetch(textPath);
            if (!response.ok) throw new Error('Failed to load text content');
            
            const text = await response.text();
            this.pages = text.split(/\n\n+/);
            this.currentPage = 0;
            
            // Update UI
            this.modal.querySelector('.star-name').textContent = starName;
            this.updateContent();
            
            // Show modal with animation
            this.modal.style.display = 'block';
            gsap.fromTo(this.modal,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
            );
            
            this.updateNavigationButtons();
            this.updateProgressBar();
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
            gsap.to(this.modal, {
                width: '90vw',
                maxWidth: '1200px',
                height: 'auto',
                top: 'auto',
                bottom: '100px',
                duration: 0.3,
                ease: "power2.out"
            });
            gsap.to(content, {
                maxHeight: '50vh',
                duration: 0.3
            });
            fullscreenBtn.textContent = '□';
            this.state = 'normal';
        } else {
            gsap.to(this.modal, {
                width: '96vw',
                maxWidth: '100vw',
                height: 'calc(100vh - 120px)',
                top: '80px',
                bottom: 'auto',
                duration: 0.3,
                ease: "power2.out"
            });
            gsap.to(content, {
                maxHeight: 'calc(100vh - 200px)',
                duration: 0.3
            });
            fullscreenBtn.textContent = '❐';
            this.state = 'fullscreen';
        }
    }

    resetModalSize() {
        gsap.set(this.modal, {
            width: '90vw',
            maxWidth: '1200px',
            height: 'auto',
            top: 'auto',
            bottom: '100px'
        });
        this.modal.querySelector('.modal-content').style.display = 'block';
        this.modal.querySelector('.fullscreen').textContent = '□';
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.animatePageTransition('right', () => {
                this.currentPage--;
                this.updateContent();
            });
        }
    }

    nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.animatePageTransition('left', () => {
                this.currentPage++;
                this.updateContent();
            });
        }
    }

    updateContent() {
        const content = this.modal.querySelector('.text-content');
        content.textContent = this.pages[this.currentPage];
        
        this.updateNavigationButtons();
        this.updateProgressBar();
        this.updatePageCounter();
    }

    updateNavigationButtons() {
        const prevBtn = this.modal.querySelector('.prev');
        const nextBtn = this.modal.querySelector('.next');
        
        prevBtn.disabled = this.currentPage === 0;
        nextBtn.disabled = this.currentPage === this.pages.length - 1;
        
        prevBtn.style.visibility = this.currentPage === 0 ? 'hidden' : 'visible';
        nextBtn.style.visibility = this.currentPage === this.pages.length - 1 ? 'hidden' : 'visible';
    }

    updatePageCounter() {
        const counter = this.modal.querySelector('.page-counter');
        counter.textContent = `${this.currentPage + 1}/${this.pages.length}`;
    }

    updateProgressBar() {
        const progress = ((this.currentPage + 1) / this.pages.length) * 100;
        const progressBar = this.modal.querySelector('.progress-fill');
        
        gsap.to(progressBar, {
            width: `${progress}%`,
            duration: 0.3,
            ease: "power2.out"
        });
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
}