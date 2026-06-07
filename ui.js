export class UIManager {
    constructor() {
        this.touchDevice = 'ontouchstart' in window;
        this.appendBaseStructure();
        this.setupEventListeners();
    }

    appendBaseStructure() {
        // Custom cursor (pointer devices only)
        if (!this.touchDevice) {
            const cursor = document.createElement('div');
            cursor.id = 'custom-cursor';
            cursor.className = 'custom-cursor';
            cursor.setAttribute('aria-hidden', 'true');
            document.body.appendChild(cursor);
        }
    }

    setupEventListeners() {
        const wordmark = document.querySelector('.wordmark');
        if (!wordmark) return;

        const reset = () => {
            if (typeof window.resetPage === 'function') {
                window.resetPage();
            }
        };

        wordmark.addEventListener('click', reset);
        wordmark.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                reset();
            }
        });
    }

    cleanup() {
        document.getElementById('custom-cursor')?.remove();
    }
}
