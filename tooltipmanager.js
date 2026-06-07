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
            background: rgba(20, 20, 20, 0.92);
            padding: 10px 12px;
            border-radius: 4px;
            font-family: 'Halyard Text', Arial, sans-serif;
            font-size: 13px;
            color: #ffffff;
            pointer-events: none;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.2s ease;
            backdrop-filter: blur(4px);
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

        const name = starData.name.toLowerCase();
        const hasAudio = !!starData.link;
        const hasText = !!starData.textPath;
        const live = hasAudio || hasText;

        // Inert stars just name themselves (the real star); they make no promise.
        let html = `star: ${name}`;
        if (live) {
            let contains = 'contains: ';
            if (name.includes('spica')) {
                contains += 'feb25 jazz & ragas [mixcloud]';
            } else if (hasAudio && hasText) {
                contains += `${name} mix, ${this.getFileName(starData.textPath)}`;
            } else if (hasAudio) {
                contains += `${name} mix`;
            } else {
                contains += this.getFileName(starData.textPath);
            }
            html += `<br><span style="color:#cdd6cf">${contains}</span>`;
        }
        this.tooltip.innerHTML = html;

        const rect = this.tooltip.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const finalX = x + rect.width > vw ? event.clientX - rect.width - padding : x;
        const finalY = y + rect.height > vh ? event.clientY - rect.height - padding : y;

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
