document.addEventListener("DOMContentLoaded", () => {
    const audioPlayerContainer = document.getElementById("audio-player-container");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const stopBtn = document.getElementById("stop-btn");
    const waveVisualizer = document.getElementById("wave-visualizer");
    const audioElement = new Audio();

    let isPlaying = false;

    // Function to show the audio player
    function showAudioPlayer(src) {
        audioElement.src = src;
        audioPlayerContainer.style.display = "flex";
        audioElement.play();
        isPlaying = true;
        playPauseBtn.textContent = "Pause";
    }

    // Function to hide the audio player
    function hideAudioPlayer() {
        audioPlayerContainer.style.display = "none";
        audioElement.pause();
        isPlaying = false;
        playPauseBtn.textContent = "Play";
    }

    // Play or pause audio
    playPauseBtn.addEventListener("click", () => {
        if (isPlaying) {
            audioElement.pause();
            playPauseBtn.textContent = "Play";
        } else {
            audioElement.play();
            playPauseBtn.textContent = "Pause";
        }
        isPlaying = !isPlaying;
    });

    // Stop audio and hide player
    stopBtn.addEventListener("click", hideAudioPlayer);

    // Handle audio file clicked from the constellation
    document.addEventListener("playAudio", (event) => {
        showAudioPlayer(event.detail.audioSrc);
    });

    // Audio ended event to hide player
    audioElement.addEventListener("ended", hideAudioPlayer);

    // Wave visualizer setup
    let waveAnimation;
    function createWaveVisualizer() {
        const context = waveVisualizer.getContext("2d");
        context.clearRect(0, 0, waveVisualizer.width, waveVisualizer.height);

        const bars = 50;
        const barWidth = waveVisualizer.width / bars;
        const maxBarHeight = waveVisualizer.height;

        waveAnimation = setInterval(() => {
            context.clearRect(0, 0, waveVisualizer.width, waveVisualizer.height);
            for (let i = 0; i < bars; i++) {
                const barHeight = Math.random() * maxBarHeight;
                context.fillStyle = "rgba(255, 255, 255, 0.5)";
                context.fillRect(i * barWidth, maxBarHeight - barHeight, barWidth - 2, barHeight);
            }
        }, 100);
    }

    function stopWaveVisualizer() {
        clearInterval(waveAnimation);
        const context = waveVisualizer.getContext("2d");
        context.clearRect(0, 0, waveVisualizer.width, waveVisualizer.height);
    }

    // Start or stop wave visualizer based on audio state
    audioElement.addEventListener("play", createWaveVisualizer);
    audioElement.addEventListener("pause", stopWaveVisualizer);
    audioElement.addEventListener("ended", stopWaveVisualizer);
});
