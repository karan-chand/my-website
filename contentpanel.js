const gsap = window.gsap;

export class ContentPanel {
    constructor() {
        this.panel = this.createPanel();
        this.setupEventListeners();
        this.isVisible = false;
        this.isDragging = false;
        this.startY = 0;
        this.currentY = 0;
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.className = 'content-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <span class="panel-title"></span>
                <button class="panel-close" aria-label="Close">×</button>
            </div>
            <div class="panel-content"></div>
        `;
        
        document.body.appendChild(panel);
        return panel;
    }

    setupEventListeners() {
        const header = this.panel.querySelector('.panel-header');
        const closeBtn = this.panel.querySelector('.panel-close');
        
        closeBtn.addEventListener('click', () => this.hide());

        // Touch handling
        header.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: true });
        header.addEventListener('touchmove', (e) => this.handleDrag(e), { passive: false });
        header.addEventListener('touchend', () => this.handleDragEnd());

        // Mouse handling
        header.addEventListener('mousedown', (e) => this.handleDragStart(e));
        window.addEventListener('mousemove', (e) => this.handleDrag(e));
        window.addEventListener('mouseup', () => this.handleDragEnd());
    }

    handleDragStart(e) {
        this.isDragging = true;
        this.startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        this.panel.style.transition = 'none';
        this.panel.style.cursor = 'grabbing';
    }

    handleDrag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        const deltaY = currentY - this.startY;
        
        if (deltaY < 0) return; // Prevent dragging up beyond full height
        
        this.panel.style.transform = `translateY(${deltaY}px)`;
    }

    handleDragEnd() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.panel.style.transition = 'transform 0.3s ease-out';
        this.panel.style.cursor = 'grab';
        
        const currentTransform = new WebKitCSSMatrix(getComputedStyle(this.panel).transform);
        if (currentTransform.m42 > 100) { // If dragged down more than 100px
            this.hide();
        } else {
            this.panel.style.transform = 'translateY(0)';
        }
    }

    async show(title, textPath) {
        try {
            const response = await fetch(textPath);
            if (!response.ok) throw new Error(`Failed to load text: ${response.status}`);
            
            const text = await response.text();
            
            this.panel.querySelector('.panel-title').textContent = title;
            this.panel.querySelector('.panel-content').textContent = text;
            
            this.panel.style.transition = 'transform 0.3s ease-out';
            this.panel.style.transform = 'translateY(-100%)';
            this.isVisible = true;
            
        } catch (error) {
            console.error('Error showing content:', error);
            this.panel.querySelector('.panel-content').textContent = 'Failed to load content';
        }
    }

    hide() {
        this.panel.style.transition = 'transform 0.3s ease-out';
        this.panel.style.transform = 'translateY(0)';
        this.isVisible = false;
    }

    cleanup() {
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
    }
}