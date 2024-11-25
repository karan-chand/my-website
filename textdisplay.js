export class TextDisplay {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.textElements = new Map();
        this.createModal();
        this.initializeDrag();
        this.isMinimized = false;
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'text-modal';
        this.modal.innerHTML = `
            <div class="modal-header">
                <span>Star Information</span>
                <div class="modal-controls">
                    <button class="modal-button minimize">_</button>
                    <button class="modal-button close">×</button>
                </div>
            </div>
            <div class="modal-content">
                <div class="text-content"></div>
                <div class="navigation">
                    <button class="prev">Previous</button>
                    <span class="page-counter">1/1</span>
                    <button class="next">Next</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);

        this.modal.querySelector('.close').addEventListener('click', () => this.hideText());
        this.modal.querySelector('.minimize').addEventListener('click', () => this.toggleMinimize());
        
        this.currentPage = 0;
        this.modal.querySelector('.prev').addEventListener('click', () => this.prevPage());
        this.modal.querySelector('.next').addEventListener('click', () => this.nextPage());
    }

    initializeDrag() {
        const header = this.modal.querySelector('.modal-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', (e) => {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            if (e.target === header) {
                isDragging = true;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                this.modal.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    toggleMinimize() {
        if (this.isMinimized) {
            this.modal.style.width = '80%';
            this.modal.style.height = 'auto';
            this.modal.querySelector('.modal-content').style.display = 'block';
        } else {
            this.modal.style.width = '200px';
            this.modal.style.height = 'auto';
            this.modal.querySelector('.modal-content').style.display = 'none';
        }
        this.isMinimized = !this.isMinimized;
    }
}