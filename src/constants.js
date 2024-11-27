// Star configuration
export const STAR_CONFIG = {
    defaultIntensity: 0.2,
    hoverIntensityMultiplier: 3.0,    // Increased from 2.5
    clickIntensityMultiplier: 3.0,
    scaleMultiplier: 5,
    defaultColor: 0xe0e0ff,
    emissiveColor: 0xffffff,
    pulseConfig: {
        minIntensity: 1.5,
        maxIntensity: 3.0,
        duration: 1.2
    }
};

// Bloom effect configuration
export const BLOOM_CONFIG = {
    defaultStrength: 0.6,    // Increased from 0.4
    defaultRadius: 0.2,
    defaultThreshold: 0.08,
    activeStrength: 1.8,
    pulseStrength: 2.8,
    pulseRadius: 0.1
};

// Animation timings
export const ANIMATION_CONFIG = {
    defaultDuration: 0.2,     // Reduced from 0.3 for snappier response
    longDuration: 0.5,
    pulseDuration: 1.8,
    resetDuration: 0.2,      // Reduced for quicker reset
    defaultEase: "power1.out", // Changed to simpler easing
    pulseEase: "sine.inOut"
};

// Camera settings
export const CAMERA_CONFIG = {
    fov: 75,
    near: 0.1,
    far: 1000,
    defaultPosition: {
        x: 0,
        y: 0,
        z: 50
    }
};

// Controls settings
export const CONTROLS_CONFIG = {
    dampingFactor: 0.05,
    rotateSpeed: 0.7,
    enableZoom: true,
    enablePan: true,
    minDistance: 20,
    maxDistance: 100,
    defaultTarget: {
        x: 0,
        y: 0,
        z: 0
    }
};

// Audio configuration
export const AUDIO_CONFIG = {
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    minDecibels: -100,
    maxDecibels: -30,
    defaultVolume: 0.7
};

// UI configuration
export const UI_CONFIG = {
    colors: {
        primary: '#00ffcc',
        background: 'rgba(0, 0, 0, 0.8)',
        text: '#ffffff',
        cursor: 'rgba(255, 102, 0, 0.8)',
        dropdownBg: 'rgba(0, 0, 0, 0.9)',
        dropdownShadow: 'rgba(0, 0, 0, 0.2)',
        waveform: '#00ffcc'
    },
    fonts: {
        primary: 'Stanley Regular',
        secondary: 'Halyard Text',
        fallbacks: 'Arial, sans-serif'
    },
    sizes: {
        title: '30px',
        text: '18px',
        button: '14px',
        cursorSize: '10px',
        spacing: '10px',
        mixcloudHeight: '60px',
        playerWidth: '90vw',
        playerMaxWidth: '1200px'
    },
    zIndex: {
        header: 15,
        cursor: 11,
        dropdown: 100,
        player: 10
    }
};

// Font loading configuration
export const FONT_CONFIG = {
    files: {
        stanley: {
            regular: 'fonts/Stanley Regular.woff2'
        },
        halyard: {
            regular: 'fonts/Halyard Text Regular.woff2'
        }
    }
};