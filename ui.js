import { UI_CONFIG } from './constants.js';
import gsap from 'gsap';

export class UIManager {
    constructor() {
        this.createBaseStructure();
        this.setupEventListeners();
    }

    createBaseStructure() {
        document.body.innerHTML = `
            <header>
                <h1 onclick="resetPage()">KARAN.INK</h1>
                <nav>
                    <ul>
                        <li>
                            <a href="#" class="nav-link">stars</a>
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
                    <button id="rewind-btn">rwd</button>
                    <button id="play-pause-btn">play/pause</button>
                    <button id="stop-btn">stop</button>
                    <button id="fast-forward-btn">ffwd</button>
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

        // Prevent default behavior for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
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
}

export default UIManager;