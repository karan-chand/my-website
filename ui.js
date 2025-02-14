import { UI_CONFIG } from './constants.js';
const gsap = window.gsap;

export class UIManager {
    constructor() {
        this.appendBaseStructure();
        this.setupEventListeners();
        this.touchDevice = 'ontouchstart' in window;
    }

    appendBaseStructure() {
        const header = document.createElement('header');
        header.innerHTML = `
            <h1 onclick="window.resetPage()" tabindex="0" role="button" aria-label="Reset view">KARAN.INK</h1>
            <nav role="navigation" aria-label="Main navigation">
                <ul>
                    <li>
                        <a href="#" class="nav-link" aria-haspopup="true" aria-expanded="false">stars</a>
                        <ul class="dropdown" role="menu">
                            <li role="none">
                                <a href="#" id="spica-menu" onclick="window.triggerSpica()" role="menuitem">
                                    spica - feb25 jazz & ragas [mixcloud]
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
        `;

        const starName = document.createElement('div');
        starName.id = 'star-name';
        starName.className = 'static-text';
        starName.style.opacity = '0';
        starName.style.pointerEvents = 'none';
        starName.setAttribute('aria-hidden', 'true');

        const cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        cursor.className = 'custom-cursor';
        cursor.setAttribute('aria-hidden', 'true');

        document.body.appendChild(header);
        document.body.appendChild(starName);
        if (!this.touchDevice) {
            document.body.appendChild(cursor);
        }
    }

    setupEventListeners() {
        const dropdownTriggers = document.querySelectorAll('nav ul li');
        
        dropdownTriggers.forEach(trigger => {
            const dropdown = trigger.querySelector('.dropdown');
            const link = trigger.querySelector('.nav-link');
            const spicaLink = trigger.querySelector('#spica-menu');
            
            const showDropdown = () => {
                if (dropdown) {
                    dropdown.style.display = 'block';
                    link.setAttribute('aria-expanded', 'true');
                    gsap.fromTo(dropdown, 
                        { opacity: 0, y: -10 },
                        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                    );
                }
            };
    
            const hideDropdown = () => {
                if (dropdown) {
                    link.setAttribute('aria-expanded', 'false');
                    gsap.to(dropdown, {
                        opacity: 0,
                        y: -10,
                        duration: 0.2,
                        ease: 'power2.in',
                        onComplete: () => dropdown.style.display = 'none'
                    });
                }
            };
    
            // Handle Spica link click
            if (spicaLink) {
                spicaLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof window.triggerSpica === 'function') {
                        window.triggerSpica();
                        hideDropdown();
                    }
                });
            }
    
            if (this.touchDevice) {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isVisible = dropdown.style.display === 'block';
                    isVisible ? hideDropdown() : showDropdown();
                });
            } else {
                trigger.addEventListener('mouseenter', showDropdown);
                trigger.addEventListener('mouseleave', hideDropdown);
            }
    
            // Keyboard navigation
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showDropdown();
                }
                if (e.key === 'Escape') {
                    hideDropdown();
                }
            });
        });
    
        // Title keyboard handling
        const title = document.querySelector('header h1');
        title.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.resetPage();
            }
        });
    }

    cleanup() {
        const cursor = document.getElementById('custom-cursor');
        if (cursor) {
            cursor.remove();
        }
    }
}