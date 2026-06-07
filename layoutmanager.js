export class LayoutManager {
    constructor() {
        this.post = document.getElementById('post');
    }

    escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (c) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c]));
    }

    // "α Virginis known as Spica" -> "Spica"
    displayName(name) {
        const marker = 'known as';
        const idx = name.toLowerCase().indexOf(marker);
        return idx >= 0 ? name.slice(idx + marker.length).trim() : name;
    }

    renderBody(text) {
        return text
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const m = line.match(/^(\d{1,2}:\d{2})\s+(.*)$/);
                if (m) {
                    return `<div class="track"><span class="ts">${m[1]}</span><span class="t">${this.escapeHtml(m[2])}</span></div>`;
                }
                return `<p>${this.escapeHtml(line)}</p>`;
            })
            .join('');
    }

    async showContent(title, textPath, withMixcloud = false) {
        if (!this.post) return;

        try {
            const response = await fetch(textPath);
            if (!response.ok) throw new Error(`Failed to load text: ${response.status}`);
            const text = await response.text();

            this.post.innerHTML = `
                <h2 class="post-title">${this.escapeHtml(this.displayName(title))}</h2>
                <div class="post-body">${this.renderBody(text)}</div>
            `;
            this.post.classList.add('visible');

            if (withMixcloud) {
                document.body.classList.add('player-open');
            }

            requestAnimationFrame(() => {
                this.post.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        } catch (error) {
            console.error('Error loading content:', error);
            this.post.innerHTML = `<p style="color:#b00000;">couldn't load this one. check back later.</p>`;
            this.post.classList.add('visible');
        }
    }

    hideContent() {
        if (!this.post) return;

        this.post.classList.remove('visible');
        document.body.classList.remove('player-open');

        setTimeout(() => {
            if (!this.post.classList.contains('visible')) {
                this.post.innerHTML = '';
            }
        }, 450);
    }

    cleanup() {
        if (this.post) {
            this.post.classList.remove('visible');
            this.post.innerHTML = '';
        }
        document.body.classList.remove('player-open');
    }
}
