// constants.js
export const STAR_CONFIG = {
    scaleMultiplier: 5,
    defaultColor: 0xe0e0ff,
    emissiveColor: 0xffffff,
    // Brightness model. Inert stars glow at their true (faint) magnitude so the
    // real constellation stays legible; live stars sit brighter and breathe.
    resting: {
        inertBase: 0.30,      // inert intensity = inertBase * magnitude(size)
        liveMin: 0.85,        // live star resting trough
        liveMax: 1.25,        // live star resting peak (breath)
        hover: 2.2,           // live star intensity on hover
        breathDuration: 2.8
    },
    pulseConfig: {
        maxIntensity: 3.0,    // active (clicked) star pulse
        duration: 1.2
    }
};

export const BLOOM_CONFIG = {
    defaultStrength: 1.8,
    defaultRadius: 0.1,
    defaultThreshold: 0.08,
    activeStrength: 1.8,
    pulseRadius: 0.1
};

export const ANIMATION_CONFIG = {
    defaultDuration: 0.3,
    longDuration: 0.5,
    resetDuration: 1.0,
    defaultEase: "power2.out"
};

export const CAMERA_CONFIG = {
    fov: 75,
    near: 0.1,
    far: 1000,
    defaultPosition: { x: 0, y: 0, z: 50 }
};

export const CONTROLS_CONFIG = {
    dampingFactor: 0.05,
    rotateSpeed: 0.7,
    enableZoom: false,
    enablePan: true,
    minDistance: 20,
    maxDistance: 100,
    defaultTarget: { x: 0, y: 0, z: 0 }
};
