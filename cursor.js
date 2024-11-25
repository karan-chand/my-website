export function initializeCustomCursor() {
    const customCursor = document.getElementById('custom-cursor');
    if (customCursor) {
        // Update cursor position on pointermove
        window.addEventListener('pointermove', (event) => {
            customCursor.style.left = `${event.pageX}px`;
            customCursor.style.top = `${event.pageY}px`;
        });
    } else {
        console.error('Custom cursor element not found.');
    }
}