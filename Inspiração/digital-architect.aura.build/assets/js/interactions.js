// Intersection Observer for Reveals
document.addEventListener('DOMContentLoaded', () => {

    // 1. Initial Hero Animations (Triggered on Load)
    setTimeout(() => {
        document.querySelector('header').classList.add('loaded');
    }, 100);

    // Trigger Hero Title Text Reveal
    setTimeout(() => {
        const heroTitle = document.getElementById('hero-title');
        if(heroTitle) heroTitle.classList.add('reveal-active');
    }, 500);

    // Trigger Hero Badge & Stats manually so they don't wait for scroll
    setTimeout(() => {
        document.querySelectorAll('.hero-badge, .hero-stat').forEach(el => {
            el.classList.add('active');
        });
    }, 500);

    // 2. Scroll Observer for the rest of the page
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Add reveal-active to children if they exist (for text reveals)
                const textWrappers = entry.target.querySelectorAll('.text-reveal-wrapper');
                if(textWrappers.length > 0 || entry.target.classList.contains('text-reveal-wrapper')) {
                    entry.target.classList.add('reveal-active');
                }
                // Handle internal text reveal wrappers specifically
                if(entry.target.tagName === 'H1') { // Catch specific typography section headers
                     entry.target.classList.add('reveal-active');
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    // Observe custom text reveal sections
    document.querySelectorAll('h1').forEach(el => {
        if(el.querySelector('.text-reveal-content')) observer.observe(el);
    });

    // 3. Carousel Logic
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);

    // 4. Parallax Logic
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        document.querySelectorAll('.parallax-img').forEach((el) => {
            const speed = el.dataset.speed || 0.1;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });

        document.querySelectorAll('.parallax-element').forEach((el) => {
            const speed = el.dataset.speed || 0.1;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
});
