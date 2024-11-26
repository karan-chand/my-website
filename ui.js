import { UI_CONFIG, FONT_CONFIG } from './constants.js';

export class UIManager {
    constructor() {
        this.loadFonts();
        this.createBaseStructure();
        this.setupEventListeners();
    }

    async loadFonts() {
        try {
            const fontFaces = [
                new FontFace(UI_CONFIG.fonts.primary, `url(${FONT_CONFIG.files.stanley.regular})`),
                new FontFace(UI_CONFIG.fonts.secondary, `url(${FONT_CONFIG.files.halyard.regular})`)
            ];
            
            const loadedFonts = await Promise.all(fontFaces.map(font => font.load()));
            loadedFonts.forEach(font => document.fonts.add(font));
        } catch (error) {
            console.error('Error loading fonts:', error);
            // Fallback to system fonts is handled in CSS
        }
    }

    createBaseStructure() {
        document.body.innerHTML = `
            <header>
                <h1 onclick="resetPage()">KARAN.INK</h1>
                <nav>
                    <ul>
                        <li>
                            <a href="#">stars</a>
                            <ul class="dropdown">
                                <li>
                                    <a href="#" id="spica-menu" onclick="triggerSpica()">
                                        nada sutra 001: spica
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </header>

            <div id="star-name" class="static-text">♍︎</div>
            <div id="custom-cursor" class="custom-cursor"></div>

            <div id="audio-player-container" class="audio-player-container">
                <div class="audio-controls">
                    <button id="rewind-btn" aria-label="Rewind 30 seconds">rwd</button>
                    <button id="play-pause-btn" aria-label="Play or pause">play/pause</button>
                    <button id="stop-btn" aria-label="Stop">stop</button>
                    <button id="fast-forward-btn" aria-label="Forward 30 seconds">ffwd</button>
                </div>
                <canvas id="waveform-visualizer" class="wave-visualizer"></canvas>
            </div>

            <canvas id="virgo-constellation"></canvas>
        `;
    }

    setupEventListeners() {
        // Handle dropdown hover states
        const dropdownTriggers = document.querySelectorAll('nav ul li');
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', () => {
                const dropdown = trigger.querySelector('.dropdown');
                if (dropdown) {
                    dropdown.style.display = 'block';
                    gsap.fromTo(dropdown, 
                        { opacity: 0, y: -10 },
                        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                    );
                }
            });

            trigger.addEventListener('mouseleave', () => {
                const dropdown = trigger.querySelector('.dropdown');
                if (dropdown) {
                    gsap.to(dropdown, {
                        opacity: 0,
                        y: -10,
                        duration: 0.2,
                        ease: 'power2.in',
                        onComplete: () => dropdown.style.display = 'none'
                    });
                }
            });
        });

        // Handle mobile menu
        if (window.innerWidth <= 768) {
            this.setupMobileMenu();
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                this.setupMobileMenu();
            } else {
                this.removeMobileMenu();
            }
        });
    }

    setupMobileMenu() {
        const nav = document.querySelector('nav');
        if (!document.querySelector('.mobile-menu-btn')) {
            const menuButton = document.createElement('button');
            menuButton.className = 'mobile-menu-btn';
            menuButton.setAttribute('aria-label', 'Toggle menu');
            menuButton.innerHTML = '☰';
            
            nav.insertBefore(menuButton, nav.firstChild);
            
            menuButton.addEventListener('click', () => {
                nav.classList.toggle('mobile-open');
                menuButton.innerHTML = nav.classList.contains('mobile-open') ? '×' : '☰';
            });
        }
    }

    removeMobileMenu() {
        const menuButton = document.querySelector('.mobile-menu-btn');
        if (menuButton) {
            menuButton.remove();
        }
        document.querySelector('nav')?.classList.remove('mobile-open');
    }

    showLoadingScreen() {
        const loader = document.createElement('div');
        loader.className = 'loading-screen';
        loader.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading Virgo Constellation...</div>
            </div>
        `;
        document.body.appendChild(loader);

        return () => {
            gsap.to(loader, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => loader.remove()
            });
        };
    }

    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.body.appendChild(errorElement);

        gsap.to(errorElement, {
            opacity: 0,
            delay: 3,
            duration: 0.5,
            onComplete: () => errorElement.remove()
        });
    }

    updateStarInfo(starData) {
        const starName = document.getElementById('star-name');
        if (starName && starData) {
            starName.textContent = starData.name;
        }
    }
}

export default UIManager;