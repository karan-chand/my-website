// Optional enhancements
export function initializeCustomCursor() {
    const customCursor = document.getElementById('custom-cursor');
    if (!customCursor) {
        console.error('Custom cursor element not found.');
        return;
    }
    
    const updateCursorPosition = (event) => {
        customCursor.style.left = `${event.pageX}px`;
        customCursor.style.top = `${event.pageY}px`;
    };

    window.addEventListener('pointermove', updateCursorPosition);
    
    // Optional: cleanup function
    return () => {
        window.removeEventListener('pointermove', updateCursorPosition);
    };
}