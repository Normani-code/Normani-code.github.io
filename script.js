document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Intersection Observer for fade-in animations on scroll
    const fadeInElements = document.querySelectorAll('.fade-in-section');

    const observerOptions = {
        root: null,
        rootMargin: '200px',  // Start triggering 200px before element enters viewport
        threshold: 0.01       // Trigger when just 1% is visible (was 15%, too high for large sections)
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeInElements.forEach(element => {
        observer.observe(element);
    });

    // 3. Force-load lazy images when they approach the viewport
    // This fixes the issue where lazy images don't load after smooth-scroll or direct navigation
    const forceLoadImage = (img) => {
        if (img.loading === 'lazy') {
            img.loading = 'eager';
        }
        // Re-trigger the load by re-assigning the src
        const currentSrc = img.getAttribute('src');
        if (currentSrc && !img.complete) {
            img.src = currentSrc;
        }
    };

    const lazyImages = document.querySelectorAll('.masonry-item img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                forceLoadImage(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '300px', // Start loading 300px before they enter viewport
        threshold: 0.01
    });

    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });

    // Helper: force-load ALL images inside a given container
    const forceLoadAllImages = (container) => {
        if (!container) return;
        container.querySelectorAll('img[loading="lazy"]').forEach(img => {
            forceLoadImage(img);
        });
    };

    // 4. Smooth scrolling for anchor links matching current page
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // After scroll lands, trigger visibility so the fade-in animation plays naturally
                setTimeout(() => {
                    targetElement.classList.add('is-visible');
                    targetElement.querySelectorAll('.fade-in-section').forEach(el => {
                        el.classList.add('is-visible');
                    });
                }, 400);

                // After scroll animation completes, force-load any lazy images in the target section
                setTimeout(() => {
                    forceLoadAllImages(targetElement);
                }, 600);
                setTimeout(() => {
                    forceLoadAllImages(targetElement);
                }, 1200);
            }
        });
    });

    // 5. Language Toggle Logic
    const langBtn = document.getElementById('lang-toggle');
    const esElements = document.querySelectorAll('.lang-es');
    const enElements = document.querySelectorAll('.lang-en');

    let currentLang = localStorage.getItem('language') || 'es';
    
    const applyLanguage = (lang) => {
        if (lang === 'en') {
            esElements.forEach(el => el.style.display = 'none');
            enElements.forEach(el => el.style.display = '');
            langBtn.textContent = 'ES';
            document.documentElement.lang = 'en';
        } else {
            enElements.forEach(el => el.style.display = 'none');
            esElements.forEach(el => el.style.display = '');
            langBtn.textContent = 'EN';
            document.documentElement.lang = 'es';
        }
    };

    applyLanguage(currentLang);

    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        localStorage.setItem('language', currentLang);
        applyLanguage(currentLang);
    });
});
