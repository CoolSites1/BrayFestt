document.addEventListener('DOMContentLoaded', () => {

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Countdown Timer
    const countdown = () => {
        const countDate = new Date("July 26, 2025 17:00:00").getTime();
        const now = new Date().getTime();
        const gap = countDate - now;

        if (gap < 0) {
            document.getElementById('countdown-timer').innerHTML = "<h3 style='font-size: 2.5rem; color: var(--color-accent);'>¡La fiesta ha comenzado!</h3>";
            clearInterval(interval);
            return;
        }

        const second = 1000;
        const minute = second * 60;
        const hour = minute * 60;
        const day = hour * 24;

        const textDay = Math.floor(gap / day);
        const textHour = Math.floor((gap % day) / hour);
        const textMinute = Math.floor((gap % hour) / minute);
        const textSecond = Math.floor((gap % minute) / second);

        document.getElementById('days').innerText = textDay.toString().padStart(2, '0');
        document.getElementById('hours').innerText = textHour.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = textMinute.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = textSecond.toString().padStart(2, '0');
    };

    const interval = setInterval(countdown, 1000);
    countdown();

    // Add scroll-based animations to elements
    const animatedElements = document.querySelectorAll('.padrino-card, .detail-item, .countdown-item');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // Music Player
    const playPauseBtn = document.getElementById('play-pause-btn');
    const audio = document.getElementById('party-audio');
    const playIcon = playPauseBtn.querySelector('.play-icon');
    const pauseIcon = playPauseBtn.querySelector('.pause-icon');

    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'inline-block';
            playPauseBtn.classList.add('playing');
        } else {
            audio.pause();
            playIcon.style.display = 'inline-block';
            pauseIcon.style.display = 'none';
            playPauseBtn.classList.remove('playing');
        }
    });

    // Interactive DJ Turntable
    const vinyl = document.getElementById('vinyl-record');
    let isDragging = false;
    let rotation = 0;
    let startAngle = 0;
    let audioContext;
    let scratchBuffer;

    const initAudio = () => {
        if (!window.AudioContext) {
            console.error("Web Audio API is not supported in this browser");
            return;
        }
        audioContext = new AudioContext();
        fetch('musi.mp3')
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(buffer => {
                scratchBuffer = buffer;
            })
            .catch(e => console.error("Error with decoding audio data", e));
    };
    
    const playScratch = () => {
        if (!scratchBuffer || audioContext.state === 'suspended') {
            audioContext.resume();
        }
        if (!scratchBuffer) return;
        const source = audioContext.createBufferSource();
        source.buffer = scratchBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    };

    const getAngle = (x, y, el) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
    };

    const startDrag = (clientX, clientY) => {
        if (!audioContext) initAudio();
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        isDragging = true;
        vinyl.style.transition = 'none';
        startAngle = getAngle(clientX, clientY, vinyl) - rotation;
        vinyl.style.cursor = 'grabbing';
    };

    const doDrag = (clientX, clientY) => {
        if (!isDragging) return;
        const currentAngle = getAngle(clientX, clientY, vinyl);
        const newRotation = currentAngle - startAngle;
        const delta = Math.abs(newRotation - rotation);

        if (delta > 5) { // Play sound only on significant rotation
            playScratch();
        }
        
        rotation = newRotation;
        vinyl.style.transform = `rotate(${rotation}deg)`;
    };
    
    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        vinyl.style.transition = 'transform 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
        // Snap back to 0 slowly
        rotation = 0;
        vinyl.style.transform = 'rotate(0deg)';
        vinyl.style.cursor = 'grab';
    };

    // Mouse events
    vinyl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
    });
    document.addEventListener('mousemove', (e) => doDrag(e.clientX, e.clientY));
    document.addEventListener('mouseup', stopDrag);

    // Touch events
    vinyl.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            doDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    });
    document.addEventListener('touchend', stopDrag);
});