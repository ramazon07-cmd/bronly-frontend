/**
 * BRONLY Landing Page v2 - Main JavaScript
 * Vanilla JavaScript - no ES6 modules for file:// compatibility
 */

// ============================================
// PAGE LOADER - SLOWED DOWN
// ============================================
function initPageLoader() {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;

    const hideLoader = function() {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        setTimeout(function() {
            loader.style.display = 'none';
        }, 800);
    };

    // Show loader for at least 3 seconds for better UX
    setTimeout(hideLoader, 3000);
}

// ============================================
// SCROLL PROGRESS
// ============================================
function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;

    let ticking = false;

    function updateProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
        progressBar.style.transform = 'scaleX(' + Math.min(scrollPercent, 1) + ')';
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateProgress);
            ticking = true;
        }
    }, { passive: true });
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // Scroll effect
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // Mobile toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close on link click
        const links = navLinks.querySelectorAll('a');
        for (let i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function() {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        }
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    for (let i = 0; i < anchors.length; i++) {
        anchors[i].addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// ============================================
// SCROLL REVEAL ANIMATIONS - ENHANCED
// ============================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    if (revealElements.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry, index) {
            if (entry.isIntersecting) {
                // Add stagger delay based on element index
                setTimeout(function() {
                    entry.target.classList.add('revealed');
                }, index * 200);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(function(el) {
        observer.observe(el);
    });
}

// ============================================
// HERO ANIMATIONS - SLOWED DOWN
// ============================================
function initHeroAnimations() {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    const elements = heroContent.querySelectorAll('.hero-badge, .hero-title, .hero-description, .hero-cta, .hero-stats');
    
    elements.forEach(function(el, index) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        setTimeout(function() {
            el.style.transition = 'all 1.6s cubic-bezier(0.16, 1, 0.3, 1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 800 + (index * 400));
    });
}

// ============================================
// COUNTER ANIMATION - SLOWED DOWN
// ============================================
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    if (counters.length === 0) return;

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(function(counter) {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseFloat(element.dataset.count);
    const duration = 6000; // 6 seconds - 2x slower
    const startTime = performance.now();
    const startValue = 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic - smoother
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const current = startValue + (target - startValue) * easeOut;
        
        // Format number
        if (target % 1 === 0) {
            element.textContent = Math.floor(current).toLocaleString();
        } else {
            element.textContent = current.toFixed(1);
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ============================================
// FAQ ACCORDION
// ============================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(function(item) {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all others
            faqItems.forEach(function(otherItem) {
                otherItem.classList.remove('active');
            });
            
            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ============================================
// BUTTON RIPPLE EFFECT
// ============================================
function initRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = [
                'position: absolute;',
                'background: rgba(255, 255, 255, 0.3);',
                'border-radius: 50%;',
                'transform: scale(0);',
                'animation: ripple 1.6s ease-out;',
                'pointer-events: none;',
                'left: ' + x + 'px;',
                'top: ' + y + 'px;',
                'width: 100px;',
                'height: 100px;',
                'margin-left: -50px;',
                'margin-top: -50px;'
            ].join(' ');
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(function() {
                ripple.remove();
            }, 1600);
        });
    });
}

// ============================================
// PARALLAX EFFECT - ENHANCED
// ============================================
function initParallax() {
    const heroSection = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (!heroSection) return;

    let ticking = false;

    function updateParallax() {
        const scrolled = window.pageYOffset;
        const heroHeight = heroSection.offsetHeight;
        
        // Only apply effects while in hero section
        if (scrolled < heroHeight) {
            const progress = scrolled / heroHeight;
            
            // Fade and move hero content up
            if (heroContent) {
                heroContent.style.opacity = 1 - (progress * 1.5);
                heroContent.style.transform = 'translateY(' + (scrolled * 0.4) + 'px)';
            }
            
            // Move visual slower (parallax)
            if (heroVisual) {
                heroVisual.style.transform = 'translateY(' + (scrolled * 0.2) + 'px)';
                heroVisual.style.opacity = 1 - (progress * 0.8);
            }
        }
        
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}

// ============================================
// CURSOR/P POINTER EFFECTS
// ============================================
function initCursorEffects() {
    // Check if device has fine pointer (mouse)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
    document.body.appendChild(cursor);

    const cursorDot = cursor.querySelector('.cursor-dot');
    const cursorRing = cursor.querySelector('.cursor-ring');

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    }, { passive: true });

    // Smooth follow for ring
    function animateCursor() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .feature-card, .pricing-card, .testimonial-card');
    
    interactiveElements.forEach(function(el) {
        el.addEventListener('mouseenter', function() {
            cursor.classList.add('cursor-hover');
        });
        
        el.addEventListener('mouseleave', function() {
            cursor.classList.remove('cursor-hover');
        });
    });
}

// ============================================
// MAGNETIC BUTTON EFFECT
// ============================================
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary');
    
    buttons.forEach(function(button) {
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0, 0)';
            this.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
}

// ============================================
// 3D TILT EFFECT FOR CARDS
// ============================================
function initTiltEffect() {
    const cards = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card');
    
    cards.forEach(function(card) {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px) scale(1.02)';
            this.style.transition = 'transform 0.1s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            this.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
}

// ============================================
// INITIALIZE ALL
// ============================================
function initLanding() {
    try {
        initPageLoader();
        initScrollProgress();
        initNavigation();
        initSmoothScroll();
        initHeroAnimations();
        initScrollReveal();
        initCounters();
        initFAQ();
        initRippleEffect();
        initParallax();
        initCursorEffects();
        initMagneticButtons();
        initTiltEffect();
        
        // Initialize WebGL hero
        if (typeof initWebGLHero === 'function') {
            try {
                initWebGLHero();
            } catch (e) {
                console.warn('WebGL init failed:', e);
            }
        }
        
        console.log('BRONLY Landing v2 initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        // Ensure loader is hidden even if init fails
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(function() {
                loader.style.display = 'none';
            }, 500);
        }
    }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanding);
} else {
    initLanding();
}
