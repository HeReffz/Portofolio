/* ==========================================================================
   Awwwards SOTD Portfolio Interactive Animation Engine (HeRePage Redesign)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. Lenis Smooth Inertial Scroll (Awwwards Physics)
    // ----------------------------------------------------------------------
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.5,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Register Lenis to GSAP ScrollTrigger if present
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0, 0);
        }
    }

    // Smooth Scroll for internal anchor links using Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                if (lenis) {
                    lenis.scrollTo(targetElement, { offset: -80, duration: 1.5 });
                } else {
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }
        });
    });

    // ----------------------------------------------------------------------
    // 2. Custom Follower Cursor & Floating Image Preview
    // ----------------------------------------------------------------------
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const cursorPreviewImg = document.getElementById('cursor-preview-img');
    const backdropText = document.getElementById('backdrop-text');
    const backdropOutlineText = document.getElementById('backdrop-outline-text');
    const heroSubjectContainer = document.querySelector('.hero-subject-container');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let previewX = mouseX;
    let previewY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Update Dot position
        if (cursorDot) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }

        // Update Mouse Background Spotlight
        const spotlightMesh = document.getElementById('spotlight-mesh');
        if (spotlightMesh) {
            spotlightMesh.style.setProperty('--mouse-x', `${mouseX}px`);
            spotlightMesh.style.setProperty('--mouse-y', `${mouseY}px`);
        }
    });

    function renderCursorPhysics() {
        // Lerp formula for smooth delay
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        previewX += (mouseX - previewX) * 0.12;
        previewY += (mouseY - previewY) * 0.12;

        if (cursorRing) {
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
        }

        if (cursorPreviewImg) {
            cursorPreviewImg.style.left = `${previewX}px`;
            cursorPreviewImg.style.top = `${previewY}px`;
        }

        requestAnimationFrame(renderCursorPhysics);
    }
    requestAnimationFrame(renderCursorPhysics);

    // Hover Elements Cursor Expand
    const hoverElements = document.querySelectorAll('[data-cursor="hover"], a, button, .service-box, .work-item, .table-row, .hud-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursorRing) cursorRing.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            if (cursorRing) cursorRing.classList.remove('active');
        });
    });

    // Work Item Floating Image Preview Trigger
    const workItems = document.querySelectorAll('.work-item[data-preview]');
    workItems.forEach(item => {
        const previewSrc = item.getAttribute('data-preview');
        item.addEventListener('mouseenter', () => {
            if (cursorPreviewImg && previewSrc) {
                cursorPreviewImg.style.backgroundImage = `url('${previewSrc}')`;
                cursorPreviewImg.classList.add('visible');
            }
        });
        item.addEventListener('mouseleave', () => {
            if (cursorPreviewImg) {
                cursorPreviewImg.classList.remove('visible');
            }
        });
    });

    // ----------------------------------------------------------------------
    // 3. Awwwards Magnetic Button Pull Effect
    // ----------------------------------------------------------------------
    const magneticBtns = document.querySelectorAll('.magnetic');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const btnCenterX = rect.left + rect.width / 2;
            const btnCenterY = rect.top + rect.height / 2;
            
            const deltaX = (e.clientX - btnCenterX) * 0.35;
            const deltaY = (e.clientY - btnCenterY) * 0.35;

            btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px)`;
            btn.style.transition = 'transform 0.5s var(--ease-out-expo)';
        });

        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'none';
        });
    });

    // ----------------------------------------------------------------------
    // 4. 3D Tilt Effect for HUD Cards, Service & Matrix Boxes
    // ----------------------------------------------------------------------
    const tiltCards = document.querySelectorAll('.hud-card, .service-box, .matrix-box');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            const liftY = card.classList.contains('hud-card') ? -14 : 0;

            card.style.transform = `perspective(1000px) translateY(${liftY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ----------------------------------------------------------------------
    // 4b. Refined 3D Interlocking Text & Photo Physics Engine
    // ----------------------------------------------------------------------
    let targetRotateX = 0, currentRotateX = 0;
    let targetRotateY = 0, currentRotateY = 0;
    let targetTextX = 0, currentTextX = 0;
    let targetTextY = 0, currentTextY = 0;

    window.addEventListener('mousemove', (e) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const deltaX = (e.clientX - centerX) / centerX;
        const deltaY = (e.clientY - centerY) / centerY;

        // Subtle 3D tilt angles for hero photo
        targetRotateY = deltaX * 5.0;
        targetRotateX = deltaY * -2.5;

        // Target offset for backdrop & foreground PORTFOLIO text layers
        targetTextX = (e.clientX - centerX) * 0.03;
        targetTextY = (e.clientY - centerY) * 0.03;
    });

    // Reset Hero Photo & Backdrop Text targets to center on all window boundaries & blur
    const resetHeroTargets = () => {
        targetRotateX = 0;
        targetRotateY = 0;
        targetTextX = 0;
        targetTextY = 0;
    };

    document.addEventListener('mouseleave', resetHeroTargets);
    window.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget || e.relatedTarget.nodeName === "HTML") {
            resetHeroTargets();
        }
    });
    window.addEventListener('blur', resetHeroTargets);

    function animateHeroPhysics() {
        // Lerp factor for silky-smooth fluid inertia (0.075)
        const lerpFactor = 0.075;

        currentRotateX += (targetRotateX - currentRotateX) * lerpFactor;
        currentRotateY += (targetRotateY - currentRotateY) * lerpFactor;
        currentTextX += (targetTextX - currentTextX) * lerpFactor;
        currentTextY += (targetTextY - currentTextY) * lerpFactor;

        if (heroSubjectContainer) {
            heroSubjectContainer.style.transformOrigin = 'bottom center';
            heroSubjectContainer.style.transform = `perspective(1200px) rotateX(${currentRotateX.toFixed(3)}deg) rotateY(${currentRotateY.toFixed(3)}deg)`;
        }

        // Animate BOTH solid text (behind photo - z:1) and outline text (in front of photo - z:3) in 100% sync
        const transformTextStr = `translate3d(calc(-50% + ${currentTextX.toFixed(2)}px), calc(-50% + ${currentTextY.toFixed(2)}px), 0px)`;
        if (backdropText) {
            backdropText.style.transform = transformTextStr;
        }
        if (backdropOutlineText) {
            backdropOutlineText.style.transform = transformTextStr;
        }

        requestAnimationFrame(animateHeroPhysics);
    }
    requestAnimationFrame(animateHeroPhysics);

    // ----------------------------------------------------------------------
    // 5. Theme Toggle (Light / Dark Mode)
    // ----------------------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        } else {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        }
    }

    // ----------------------------------------------------------------------
    // 6. GSAP & ScrollTrigger Animations
    // ----------------------------------------------------------------------
    if (typeof gsap !== 'undefined') {
        gsap.from(['#backdrop-text', '#backdrop-outline-text'], {
            opacity: 0,
            duration: 1.4,
            ease: 'power3.out',
            delay: 0.1
        });

        gsap.from('.hud-card', {
            opacity: 0,
            y: 40,
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 0.5,
            clearProps: 'transform'
        });

        // Parallax Image Scroll Trigger
        const parallaxImgs = document.querySelectorAll('.parallax-img');
        parallaxImgs.forEach(img => {
            gsap.fromTo(img, 
                { yPercent: -8 },
                {
                    yPercent: 8,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: img.parentElement,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                }
            );
        });

        // ScrollTrigger Animations for Sections
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                x: -30,
                duration: 1,
                ease: 'power3.out'
            });
        });

        const serviceBoxes = document.querySelectorAll('.service-box');
        gsap.from(serviceBoxes, {
            scrollTrigger: {
                trigger: '.services-hairline-grid',
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out'
        });

        const workItemsList = document.querySelectorAll('.work-item');
        workItemsList.forEach(item => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 50,
                duration: 1.2,
                ease: 'power3.out'
            });
        });

        const tableRows = document.querySelectorAll('.table-row:not(.table-head)');
        gsap.from(tableRows, {
            scrollTrigger: {
                trigger: '.experience-table',
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out'
        });

        const matrixBoxes = document.querySelectorAll('.matrix-box');
        gsap.from(matrixBoxes, {
            scrollTrigger: {
                trigger: '.tech-matrix-grid',
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out'
        });
    }

    // ----------------------------------------------------------------------
    // 7. Lazy Video Autoplay (Intersection Observer)
    // ----------------------------------------------------------------------
    const lazyVideoContainer = document.querySelector('.lazy-video-container');
    if (lazyVideoContainer) {
        const videoSrc = lazyVideoContainer.getAttribute('data-video-src');
        
        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const videoEl = document.createElement('video');
                    videoEl.src = videoSrc;
                    videoEl.autoplay = true;
                    videoEl.loop = true;
                    videoEl.muted = true;
                    videoEl.playsInline = true;
                    videoEl.style.width = '100%';
                    videoEl.style.height = '100%';
                    videoEl.style.objectFit = 'cover';
                    videoEl.style.borderRadius = '16px';
                    
                    lazyVideoContainer.appendChild(videoEl);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        videoObserver.observe(lazyVideoContainer);
    }

    // ----------------------------------------------------------------------
    // 8. Valorant Tactical HUD Dynamic Random Seed & Glitch Telemetry Loop
    // ----------------------------------------------------------------------
    const hudSeedLeft = document.getElementById('hud-seed-left');
    const hudFpsCounter = document.getElementById('hud-fps-counter');
    const hudStreamRight = document.getElementById('hud-stream-right');

    const hexChars = '0123456789ABCDEF';
    function getRandomHex(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
        }
        return result;
    }

    if (hudSeedLeft || hudFpsCounter || hudStreamRight) {
        setInterval(() => {
            if (hudSeedLeft) {
                hudSeedLeft.innerText = `SEED: 0x${getRandomHex(6)}`;
            }

            if (hudStreamRight) {
                hudStreamRight.innerText = `HEX: ${getRandomHex(2)}:${getRandomHex(2)}:${getRandomHex(2)}`;
            }

            if (hudFpsCounter) {
                const fps = (141 + Math.random() * 3).toFixed(1);
                const ping = Math.floor(10 + Math.random() * 5);
                hudFpsCounter.innerText = `FPS: ${fps} // ${ping}ms`;
            }
        }, 120);
    }


});
