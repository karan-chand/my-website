const gsap = window.gsap;

export class LayoutManager {
    constructor() {
        this.layout = this.createLayout();
        this.setupEventListeners();
        this.isDragging = false;
        this.startY = 0;
        this.startHeight = 0;
        this.isExpanded = false;
        this.minHeight = 60;
    }

    createLayout() {
        const layoutContainer = document.createElement('div');
        layoutContainer.className = 'layout-container';
        layoutContainer.style.position = 'absolute';
        layoutContainer.style.top = '0';
        layoutContainer.style.left = '0';
        layoutContainer.style.width = '100%';
        layoutContainer.style.height = '100%';
        layoutContainer.style.zIndex = '15';

        const constellationView = document.createElement('div');
        constellationView.className = 'constellation-view';
        const existingCanvas = document.getElementById('virgo-constellation');
        if (existingCanvas) {
            constellationView.appendChild(existingCanvas);
        }

        const textContent = document.createElement('div');
        textContent.className = 'text-content';
        textContent.innerHTML = `
            <div class="handle" role="slider" aria-label="Drag to resize text panel"></div>
            <button class="expand-collapse" aria-label="Toggle track IDs visibility">show track IDs</button>
            <div class="text-content-inner"></div>
        `;

        layoutContainer.appendChild(constellationView);
        layoutContainer.appendChild(textContent);
        document.body.appendChild(layoutContainer);

        return {
            container: layoutContainer,
            constellationView,
            textContent,
            handle: textContent.querySelector('.handle'),
            expandBtn: textContent.querySelector('.expand-collapse'),
            textInner: textContent.querySelector('.text-content-inner'),
            mixcloudContainer: document.getElementById('mixcloud-container')
        };
    }

    setupEventListeners() {
        this.layout.expandBtn.addEventListener('click', this.toggleExpand.bind(this));
        
        this.layout.handle.addEventListener('mousedown', this.startDragging.bind(this));
        document.addEventListener('mousemove', this.handleDrag.bind(this));
        document.addEventListener('mouseup', this.stopDragging.bind(this));
        
        this.layout.handle.addEventListener('touchstart', this.startDragging.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleDrag.bind(this), { passive: false });
        document.addEventListener('touchend', this.stopDragging.bind(this));
        
        this.layout.handle.addEventListener('keydown', (e) => {
            const step = 20;
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.updateLayout(Math.max(this.minHeight, this.layout.textContent.offsetHeight - step));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const maxHeight = window.innerHeight * 0.7;
                this.updateLayout(Math.min(maxHeight, this.layout.textContent.offsetHeight + step));
            }
        });
    }

    startDragging(e) {
        this.isDragging = true;
        this.startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        this.startHeight = this.layout.textContent.offsetHeight;
        document.body.style.cursor = 'row-resize';
        this.layout.handle.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
    }

    handleDrag(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        const deltaY = this.startY - currentY;
        const newHeight = Math.max(this.minHeight, this.startHeight + deltaY);
        const maxHeight = window.innerHeight * 0.7;
        
        if (newHeight <= maxHeight) {
            this.updateLayout(newHeight);
            this.isExpanded = newHeight > this.minHeight;
            this.layout.expandBtn.textContent = this.isExpanded ? 'hide track IDs' : 'show track IDs';
        }
    }

    stopDragging() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        document.body.style.cursor = '';
        this.layout.handle.style.backgroundColor = '';
        
        const threshold = this.minHeight + 50;
        if (this.layout.textContent.offsetHeight < threshold && this.layout.textContent.offsetHeight > this.minHeight) {
            this.updateLayout(this.minHeight);
            this.isExpanded = false;
            this.layout.expandBtn.textContent = 'show track IDs';
        }
    }

    updateLayout(textHeight) {
        const mixcloudHeight = this.layout.mixcloudContainer?.classList.contains('visible') ? 60 : 0;
        const availableHeight = window.innerHeight - mixcloudHeight;
        const adjustedTextHeight = Math.min(textHeight, availableHeight * 0.7);
        
        gsap.to(this.layout.textContent, {
            height: adjustedTextHeight,
            duration: 0.3,
            ease: 'power2.out'
        });

        gsap.to(this.layout.constellationView, {
            height: availableHeight - adjustedTextHeight,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    toggleExpand() {
        const mixcloudHeight = this.layout.mixcloudContainer?.classList.contains('visible') ? 60 : 0;
        const availableHeight = window.innerHeight - mixcloudHeight;
        
        if (this.isExpanded) {
            this.updateLayout(this.minHeight);
            this.layout.expandBtn.textContent = 'show track IDs';
        } else {
            this.updateLayout(availableHeight * 0.7);
            this.layout.expandBtn.textContent = 'hide track IDs';
        }
        
        this.isExpanded = !this.isExpanded;
    }

    async showContent(title, textPath, withMixcloud = false) {
        try {
            const response = await fetch(textPath);
            if (!response.ok) throw new Error(`Failed to load text: ${response.status}`);
            
            if (withMixcloud && this.layout.mixcloudContainer) {
                this.layout.mixcloudContainer.classList.add('visible');
                // Wait for mixcloud container to be fully visible
                await new Promise(resolve => {
                    const observer = new MutationObserver((mutations) => {
                        const container = document.getElementById('mixcloud-container');
                        if (container && getComputedStyle(container).transform === 'matrix(1, 0, 0, 1, 0, 0)') {
                            observer.disconnect();
                            resolve();
                        }
                    });
                    
                    observer.observe(document.getElementById('mixcloud-container'), {
                        attributes: true,
                        attributeFilter: ['style']
                    });
                });
            }
    
            const text = await response.text();
            this.layout.textInner.innerHTML = `
                <div style="font-family: 'Halyard Text', Arial, sans-serif; line-height: 1.6; white-space: pre-wrap;">
                    ${text}
                </div>
            `;
            
            this.updateLayout(this.minHeight);
            this.layout.expandBtn.textContent = 'show track IDs';
            this.isExpanded = false;
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.layout.textInner.innerHTML = `
                <div style="color: #ff4444; padding: 20px;">
                    Failed to load content. Please try again later.
                </div>
            `;
        }
    }

    hideContent() {
        gsap.to(this.layout.textContent, {
            height: 0,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
                this.layout.textContent.scrollTop = 0;
                this.layout.textInner.innerHTML = '';
                this.layout.expandBtn.textContent = 'show track IDs';
                this.isExpanded = false;
            }
        });

        gsap.to(this.layout.constellationView, {
            height: '100%',
            duration: 0.3,
            ease: 'power2.out'
        });
        
        if (this.layout.mixcloudContainer?.classList.contains('visible')) {
            this.layout.mixcloudContainer.classList.remove('visible');
        }
    }

    cleanup() {
        this.layout.expandBtn.removeEventListener('click', this.toggleExpand);
        this.layout.handle.removeEventListener('mousedown', this.startDragging);
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.stopDragging);
        this.layout.handle.removeEventListener('touchstart', this.startDragging);
        document.removeEventListener('touchmove', this.handleDrag);
        document.removeEventListener('touchend', this.stopDragging);
        
        if (this.layout.container && this.layout.container.parentNode) {
            this.layout.container.parentNode.removeChild(this.layout.container);
        }
    }
}