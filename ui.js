import { UI_CONFIG, FONT_CONFIG } from './constants.js';

export class UIManager {
    constructor(audioPlayer, starSystem) {
        this.loadFonts();
        this.createBaseStructure();
    }

    async loadFonts() {
        const fontFaces = [
            new FontFace(UI_CONFIG.fonts.primary, `url(${FONT_CONFIG.files.stanley.regular})`),
            new FontFace(UI_CONFIG.fonts.secondary, `url(${FONT_CONFIG.files.halyard.regular})`)
        ];
        const loadedFonts = await Promise.all(fontFaces.map(font => font.load()));
        loadedFonts.forEach(font => document.fonts.add(font));
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
}