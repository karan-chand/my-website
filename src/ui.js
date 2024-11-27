import { UI_CONFIG } from './constants.js';
const gsap = window.gsap;

export class UIManager {
    constructor() {
        this.appendBaseStructure();
        this.setupEventListeners();
    }

    appendBaseStructure() {
        const header = document.createElement('header');
        header.innerHTML = `
            <h1 onclick="window.resetPage()">KARAN.INK</h1>
            <nav>
                <ul>
                    <li>
                        <a href="#" class="nav-link">stars</a>
                        <ul class="dropdown">
                            <li>
                                <a href="#" id="spica-menu" onclick="window.triggerSpica()">
                                    nada sutra 001: spica
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

        document.body.appendChild(header);
        document.body.appendChild(cursor);
    }

    setupEventListeners() {
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

        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (link.id === 'spica-menu') {
                    window.triggerSpica();
                }
            });
        });
    }
}