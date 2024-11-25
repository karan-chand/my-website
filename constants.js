export const STAR_CONFIG = {
    defaultIntensity: 0.4,
    hoverIntensityMultiplier: 1.8,
    clickIntensityMultiplier: 1.8,
    scaleMultiplier: 5,
    defaultColor: 0xe0e0ff,
    emissiveColor: 0xffffff
};

export const BLOOM_CONFIG = {
    defaultStrength: 0.6,
    defaultRadius: 0.2,
    defaultThreshold: 0.08,
    activeStrength: 1.6,
    pulseStrength: 2.8,
    pulseRadius: 0.1
};

export const ANIMATION_CONFIG = {
    defaultDuration: 0.5,
    longDuration: 1.0,
    pulseDuration: 1.8,
    resetDuration: 2.0,
    defaultEase: "power2.inOut",
    pulseEase: "sine.inOut"
};

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