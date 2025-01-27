const gsap = window.gsap;

export class LayoutManager {
    constructor() {
        this.layout = this.createLayout();
        this.setupEventListeners();
        this.isDragging = false;
        this.startY = 0;
        this.startHeight = 0;
    }

    createLayout() {
        const layoutContainer = document.createElement('div');
        layoutContainer.className = 'layout-container';

        const constellationView = document.createElement('div');
        constellationView.className = 'constellation-view';
        const existingCanvas = document.getElementById('virgo-constellation');
        if (existingCanvas) {
            constellationView.appendChild(existingCanvas);
        }

        const textContent = document.createElement('div');
        textContent.className = 'text-content';
        textContent.innerHTML = `
            <div class="handle"></div>
            <button class="expand-collapse">Expand</button>
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
        // Mouse events
        this.layout.handle.addEventListener('mousedown', this.startDragging.bind(this));
        window.addEventListener('mousemove', this.handleDrag.bind(this));
        window.addEventListener('mouseup', this.stopDragging.bind(this));
        
        // Touch events
        this.layout.handle.addEventListener('touchstart', this.startDragging.bind(this));
        window.addEventListener('touchmove', this.handleDrag.bind(this));
        window.addEventListener('touchend', this.stopDragging.bind(this));
        
        // Expand/collapse button
        this.layout.expandBtn.addEventListener('click', this.toggleExpand.bind(this));
        
        // ESC key to collapse
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideContent();
            }
        });
    }

    startDragging(e) {
        e.preventDefault();
        this.isDragging = true;
        this.startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        this.startHeight = this.layout.textContent.offsetHeight;
        
        document.body.style.cursor = 'ns-resize';
        this.layout.handle.style.background = 'rgba(255, 255, 255, 0.4)';
    }

    handleDrag(e) {
        if (!this.isDragging) return;
        
        const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        const deltaY = this.startY - currentY;
        const mixcloudHeight = this.layout.mixcloudContainer?.classList.contains('visible') ? 60 : 0;
        const maxHeight = window.innerHeight - mixcloudHeight;
        const newHeight = Math.min(Math.max(0, this.startHeight + deltaY), maxHeight * 0.9);
        
        this.updateLayout(newHeight);
    }

    stopDragging() {
        this.isDragging = false;
        document.body.style.cursor = '';
        if (this.layout.handle) {
            this.layout.handle.style.background = 'rgba(255, 255, 255, 0.2)';
        }
    }

    updateLayout(textHeight) {
        const mixcloudHeight = this.layout.mixcloudContainer?.classList.contains('visible') ? 60 : 0;
        const availableHeight = window.innerHeight - mixcloudHeight;
        
        gsap.to(this.layout.textContent, {
            height: textHeight,
            duration: 0.3,
            ease: 'power2.out'
        });

        gsap.to(this.layout.constellationView, {
            height: availableHeight - textHeight,
            duration: 0.3,
            ease: 'power2.out'
        });

        if (this.layout.expandBtn) {
            this.layout.expandBtn.textContent = textHeight > availableHeight * 0.5 ? 'Collapse' : 'Expand';
        }
    }

    toggleExpand() {
        const mixcloudHeight = this.layout.mixcloudContainer?.classList.contains('visible') ? 60 : 0;
        const availableHeight = window.innerHeight - mixcloudHeight;
        const isExpanded = this.layout.textContent.offsetHeight > availableHeight * 0.5;
        
        this.updateLayout(isExpanded ? availableHeight * 0.3 : availableHeight * 0.7);
    }

    async showContent(title, textPath, withMixcloud = false) {
        try {
            const response = await fetch(textPath);
            if (!response.ok) throw new Error(`Failed to load text: ${response.status}`);
            
            const text = await response.text();
            this.layout.textInner.innerHTML = `
                <h2 style="color: #00ffcc; margin-bottom: 1em; font-family: 'Stanley Regular', Arial, sans-serif;">${title}</h2>
                <div style="font-family: 'Halyard Text', Arial, sans-serif; line-height: 1.6;">
                    ${text}
                </div>
            `;
            
            // If there's a Mixcloud player, show it
            if (withMixcloud && this.layout.mixcloudContainer) {
                this.layout.mixcloudContainer.classList.add('visible');
            }
            
            // Calculate available height
            const mixcloudHeight = withMixcloud ? 60 : 0;
            const availableHeight = window.innerHeight - mixcloudHeight;
            
            // Show content with animation
            this.updateLayout(availableHeight * 0.5);
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.layout.textInner.innerHTML = 'Failed to load content';
        }
    }

    hideContent() {
        // Hide text content
        this.updateLayout(0);
        
        // Hide Mixcloud player if visible
        if (this.layout.mixcloudContainer?.classList.contains('visible')) {
            this.layout.mixcloudContainer.classList.remove('visible');
        }
    }

    cleanup() {
        // Remove event listeners
        window.removeEventListener('mousemove', this.handleDrag.bind(this));
        window.removeEventListener('mouseup', this.stopDragging.bind(this));
        window.removeEventListener('touchmove', this.handleDrag.bind(this));
        window.removeEventListener('touchend', this.stopDragging.bind(this));
        
        // Remove DOM elements
        if (this.layout.container && this.layout.container.parentNode) {
            this.layout.container.parentNode.removeChild(this.layout.container);
        }
    }
}