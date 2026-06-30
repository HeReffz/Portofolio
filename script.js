document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    // 2. Lazy Video Autoplay (Intersection Observer)
    const lazyVideoContainer = document.querySelector('.lazy-video-container');
    if (lazyVideoContainer) {
        const videoSrc = lazyVideoContainer.getAttribute('data-video-src');
        
        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Inject video tag
                    const videoEl = document.createElement('video');
                    videoEl.src = videoSrc;
                    videoEl.autoplay = true;
                    videoEl.loop = true;
                    videoEl.muted = true;
                    videoEl.playsInline = true;
                    videoEl.style.width = '100%';
                    videoEl.style.height = '100%';
                    videoEl.style.objectFit = 'cover';
                    videoEl.style.position = 'absolute';
                    videoEl.style.top = '0';
                    videoEl.style.left = '0';
                    videoEl.style.zIndex = '1';
                    
                    lazyVideoContainer.appendChild(videoEl);
                    
                    // Stop observing once loaded
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% visible
        
        videoObserver.observe(lazyVideoContainer);
    }

    // 3. Smooth Scrolling
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

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
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });

    // 4. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => revealOnScroll.observe(el));

    // 5. Generate GitHub Contribution Matrix Simulation
    const matrixContainer = document.querySelector('.github-matrix');
    if (matrixContainer) {
        // Generate 60 blocks to simulate 5 weeks of 12 columns
        for(let i=0; i<60; i++) {
            const cell = document.createElement('div');
            cell.className = 'matrix-cell';
            // Randomly assign contribution levels to some cells to make it look realistic
            const random = Math.random();
            if(random > 0.85) cell.classList.add('lvl-4');
            else if(random > 0.7) cell.classList.add('lvl-3');
            else if(random > 0.5) cell.classList.add('lvl-2');
            else if(random > 0.3) cell.classList.add('lvl-1');
            
            matrixContainer.appendChild(cell);
        }
    }
});
