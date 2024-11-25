export function initializeCursor() {
    const customCursor = document.getElementById('custom-cursor');
    if (customCursor) {
        // Update cursor position on pointermove (for mobile/touch support)
        window.addEventListener('pointermove', (event) => {
            console.log('Pointer moved:', event.pageX, event.pageY);
            customCursor.style.left = `${event.pageX}px`;
            customCursor.style.top = `${event.pageY}px`;
        });
    } else {
        console.error('Custom cursor element not found.');
    }
} 