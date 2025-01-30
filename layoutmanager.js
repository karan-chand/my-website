const gsap = window.gsap;

export class LayoutManager {
    constructor() {
        this.layout = this.createLayout();
        this.setupEventListeners();
        this.isDragging = false;
        this.startY = 0;
        this.startHeight = 0;
        this.isExpanded = false;
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
        this.layout.expandBtn.addEventListener('click', this.toggleExpand.bind(this));
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
    }

    toggleExpand() {
        const mixcloudHeight = this.layout.mixcloudContainer?.classList.contains('visible') ? 60 : 0;
        const availableHeight = window.innerHeight - mixcloudHeight;
        
        if (this.isExpanded) {
            // Collapse to just title
            this.updateLayout(80);
            this.layout.expandBtn.textContent = 'Expand';
        } else {
            // Expand to show full text
            this.updateLayout(availableHeight * 0.7);
            this.layout.expandBtn.textContent = 'Collapse';
        }
        
        this.isExpanded = !this.isExpanded;
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
            
            // Show with just title initially
            this.updateLayout(80);
            this.layout.expandBtn.textContent = 'Expand';
            this.isExpanded = false;
            
            if (withMixcloud && this.layout.mixcloudContainer) {
                this.layout.mixcloudContainer.classList.add('visible');
            }
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.layout.textInner.innerHTML = 'Failed to load content';
        }
    }

    hideContent() {
        // Animate to zero height
        gsap.to(this.layout.textContent, {
            height: 0,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
                // Reset state
                this.layout.textContent.scrollTop = 0;
                this.layout.expandBtn.textContent = 'Expand';
                this.isExpanded = false;
            }
        });

        // Restore constellation to full height
        gsap.to(this.layout.constellationView, {
            height: '100%',
            duration: 0.3,
            ease: 'power2.out'
        });
        
        // Hide Mixcloud player if visible
        if (this.layout.mixcloudContainer?.classList.contains('visible')) {
            this.layout.mixcloudContainer.classList.remove('visible');
        }
    }

    cleanup() {
        if (this.layout.container && this.layout.container.parentNode) {
            this.layout.container.parentNode.removeChild(this.layout.container);
        }
    }
}