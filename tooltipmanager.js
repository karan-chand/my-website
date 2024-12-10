export class TooltipManager {
    constructor() {
        this.tooltip = this.createTooltip();
        this.visible = false;
    }

    createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'star-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(50, 50, 50, 0.95);
            padding: 12px;
            border-radius: 4px;
            font-family: 'Halyard Text', Arial, sans-serif;  // Changed to match dropdown
            font-size: 14px;
            color: white;
            pointer-events: none;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.2s ease;
            backdrop-filter: blur(4px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            width: auto;
            white-space: nowrap;
        `;
        document.body.appendChild(tooltip);
        return tooltip;
    }

    update(event, starData) {
        if (!starData) {
            this.hide();
            return;
        }
    
        const padding = 15;
        const x = event.clientX + padding;
        const y = event.clientY + padding;
    
        const hasAudio = !!starData.link;
        const hasText = !!starData.textPath;
        const containsColor = hasAudio || hasText ? '#00ffcc' : '#ff4444';
        
        let containsText = 'contains: ';
        if (starData.name.includes('Spica')) {
            containsText += 'SOUND THREAD 001: SPICA';
        } else if (hasAudio && hasText) {
            containsText += `${starData.name.toLowerCase()} mix, ${this.getFileName(starData.textPath)}`;
        } else if (hasAudio) {
            containsText += `${starData.name.toLowerCase()} mix`;
        } else if (hasText) {
            containsText += this.getFileName(starData.textPath);
        } else {
            containsText += 'nothing yet';
        }
    
        this.tooltip.innerHTML = `
            star: ${starData.name.toLowerCase()}<br>
            constellation: virgo<br>
            <span style="color: ${containsColor}">${containsText}</span>
        `;
    
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
    
        const finalX = x + tooltipRect.width > viewportWidth 
            ? event.clientX - tooltipRect.width - padding 
            : x;
    
        const finalY = y + tooltipRect.height > viewportHeight 
            ? event.clientY - tooltipRect.height - padding 
            : y;
    
        this.tooltip.style.transform = `translate(${finalX}px, ${finalY}px)`;
        this.show();
    }

    getFileName(path) {
        if (!path) return '';
        return path.split('/').pop().toLowerCase();
    }

    show() {
        if (!this.visible) {
            this.visible = true;
            this.tooltip.style.opacity = '1';
        }
    }

    hide() {
        if (this.visible) {
            this.visible = false;
            this.tooltip.style.opacity = '0';
        }
    }

    cleanup() {
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
    }
}