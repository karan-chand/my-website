import { UI_CONFIG } from './constants.js';
const gsap = window.gsap;

export class UIManager {
    constructor() {
        console.log('Initializing UIManager');
        this.appendBaseStructure();
        this.setupEventListeners();
        this.touchDevice = 'ontouchstart' in window;
    }

    appendBaseStructure() {
        console.log('Creating base structure');
        const header = document.createElement('header');
        header.innerHTML = `
            <h1 tabindex="0" role="button" aria-label="Reset view">KARAN.INK</h1>
            <nav role="navigation" aria-label="Main navigation">
                <ul>
                    <li>
                        <a href="#" class="nav-link" aria-haspopup="true" aria-expanded="false">stars</a>
                        <ul class="dropdown" role="menu">
                            <li role="none">
                                <a href="#" id="spica-menu" role="menuitem">
                                    spica - feb25 jazz & ragas [mixcloud]
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
        `;

        const cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        cursor.className = 'custom-cursor';
        cursor.setAttribute('aria-hidden', 'true');

        document.body.appendChild(header);
        if (!this.touchDevice) {
            document.body.appendChild(cursor);
        }

        console.log('Base structure created');
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Add title click handler
        const title = document.querySelector('header h1');
        title.addEventListener('click', () => {
            console.log('Title clicked');
            if (typeof window.resetPage === 'function') {
                window.resetPage();
            }
        });

        // Setup dropdown handlers
        const dropdownTriggers = document.querySelectorAll('nav ul li');
        dropdownTriggers.forEach(trigger => {
            const dropdown = trigger.querySelector('.dropdown');
            const link = trigger.querySelector('.nav-link');
            
            // Setup dropdown visibility functions
            const showDropdown = () => {
                if (dropdown) {
                    console.log('Showing dropdown');
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
                    console.log('Hiding dropdown');
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

            // Setup Spica click handler
            const spicaLink = document.getElementById('spica-menu');
            if (spicaLink) {
                console.log('Setting up Spica click handler');
                spicaLink.addEventListener('click', (e) => {
                    console.log('Spica clicked');
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof window.triggerSpica === 'function') {
                        console.log('Calling triggerSpica');
                        window.triggerSpica();
                        hideDropdown();
                    } else {
                        console.error('triggerSpica not found');
                    }
                });
            }
    
            // Setup touch/mouse handlers
            if (this.touchDevice) {
                trigger.addEventListener('click', (e) => {
                    console.log('Touch click');
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
                    console.log('Keyboard trigger');
                    e.preventDefault();
                    showDropdown();
                }
                if (e.key === 'Escape') {
                    hideDropdown();
                }
            });
        });

        console.log('Event listeners setup complete');
    }

    cleanup() {
        console.log('Cleaning up UI');
        const cursor = document.getElementById('custom-cursor');
        if (cursor) {
            cursor.remove();
        }
    }
}