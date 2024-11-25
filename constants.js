// Star configuration
export const STAR_CONFIG = {
    defaultIntensity: 0.4,
    hoverIntensityMultiplier: 1.8,
    clickIntensityMultiplier: 1.8,
    scaleMultiplier: 5,
    defaultColor: 0xe0e0ff,
    emissiveColor: 0xffffff
};

// Bloom effect configuration
export const BLOOM_CONFIG = {
    defaultStrength: 0.6,
    defaultRadius: 0.2,
    defaultThreshold: 0.08,
    activeStrength: 1.6,
    pulseStrength: 2.8,
    pulseRadius: 0.1
};

// Animation timings
export const ANIMATION_CONFIG = {
    defaultDuration: 0.5,
    longDuration: 1.0,
    pulseDuration: 1.8,
    resetDuration: 2.0,
    defaultEase: "power2.inOut",
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
    enablePan: false,
    defaultTarget: {
        x: 0,
        y: 0,
        z: 0
    }
};

// UI configuration
export const UI_CONFIG = {
    colors: {
        primary: '#00ffcc',
        background: 'rgba(0, 0, 0, 0.8)',
        text: '#ffffff',
        cursor: 'rgba(255, 102, 0, 0.8)',
        dropdownBg: 'rgba(0, 0, 0, 0.9)',
        dropdownShadow: 'rgba(0, 0, 0, 0.2)'
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
        playerWidth: '300px',
        playerHeight: '100px'
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