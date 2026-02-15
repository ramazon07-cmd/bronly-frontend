/**
 * BRONLY - Landing Page JavaScript
 * Scroll animations, interactions, and initialization
 * Inline version for file:// protocol compatibility
 */

// Utility functions
function debounce(fn, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(context, args), wait);
    };
}

function throttle(fn, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            fn.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function createObserver(callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
}

// Toast notification
function showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container') || (() => {
        const c = document.createElement('div');
        c.className = 'toast-container';
        c.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(c);
        return c;
    })();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = 'background:rgba(20,33,61,0.95);border:1px solid rgba(252,163,17,0.3);border-radius:8px;padding:16px 24px;min-width:300px;animation:toastSlideIn 0.3s ease-out;';
    toast.innerHTML = `<span style="color:${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#E5E5E5'}">${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Navigation scroll effect
function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    
    let lastScroll = 0;
    
    const handleScroll = throttle(() => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// Mobile navigation
function initMobileNav() {
    const toggle = document.querySelector('.nav-mobile-toggle');
    const nav = document.querySelector('.nav');
    
    if (!toggle || !nav) return;
    
    toggle.addEventListener('click', () => {
        nav.classList.toggle('mobile-open');
    });
    
    // Close on link click
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('mobile-open');
        });
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80; // Header height
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll reveal animations
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!reveals.length) return;
    
    const observer = createObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add stagger delay based on index
                const index = Array.from(reveals).indexOf(entry.target);
                entry.target.style.transitionDelay = `${index * 0.1}s`;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    reveals.forEach(el => observer.observe(el));
}

// Animated stats counter
function initAnimatedStats() {
    const stats = document.querySelectorAll('[data-count]');
    if (!stats.length) return;
    
    const observer = createObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const duration = 2000;
                const start = 0;
                const startTime = performance.now();
                
                const suffix = el.dataset.suffix || '';
                const prefix = el.dataset.prefix || '';
                
                const update = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Ease out cubic
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(start + (target - start) * easeOut);
                    
                    el.textContent = prefix + current.toLocaleString() + suffix;
                    
                    if (progress < 1) {
                        requestAnimationFrame(update);
                    }
                };
                
                requestAnimationFrame(update);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
}

// Product deep dive tab/slider
function initDeepDive() {
    const tabs = document.querySelectorAll('.deep-dive-tab');
    const panels = document.querySelectorAll('.deep-dive-panel');
    const slides = document.querySelectorAll('.visual-slide');
    const dots = document.querySelectorAll('.dot');

    if (!tabs.length) return;

    let currentIndex = 0;
    let autoPlayInterval;

    function showSlide(index) {
        // Wrap around
        if (index < 0) index = tabs.length - 1;
        if (index >= tabs.length) index = 0;

        // Update tabs
        tabs.forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });

        // Update panels
        panels.forEach((panel, i) => {
            panel.classList.toggle('active', i === index);
        });

        // Update visual slides
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentIndex = index;
    }

    // Tab click handlers
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            showSlide(index);
            resetAutoPlay();
        });
    });

    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetAutoPlay();
        });
    });

    // Auto-play functionality
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % tabs.length;
            showSlide(nextIndex);
        }, 5000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const section = document.querySelector('.product-deep-dive');
        if (!section) return;

        // Check if section is in viewport
        const rect = section.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

        if (isInViewport) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                showSlide(currentIndex - 1);
                resetAutoPlay();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                showSlide(currentIndex + 1);
                resetAutoPlay();
            }
        }
    });

    // Pause on hover
    const section = document.querySelector('.product-deep-dive');
    if (section) {
        section.addEventListener('mouseenter', stopAutoPlay);
        section.addEventListener('mouseleave', startAutoPlay);
    }

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (section) {
        section.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        section.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - next slide
                showSlide(currentIndex + 1);
            } else {
                // Swiped right - previous slide
                showSlide(currentIndex - 1);
            }
            resetAutoPlay();
        }
    }

    // Start auto-play
    startAutoPlay();

    console.log('Deep dive slider initialized');
}

// FAQ accordion
function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;
    
    items.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all
            items.forEach(i => i.classList.remove('active'));
            
            // Open clicked if wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Pricing toggle
function initPricingToggle() {
    const toggle = document.querySelector('.toggle-switch');
    if (!toggle) return;
    
    const monthlyPrices = document.querySelectorAll('.price-monthly');
    const yearlyPrices = document.querySelectorAll('.price-yearly');
    
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        
        const isYearly = toggle.classList.contains('active');
        
        monthlyPrices.forEach(el => {
            el.style.display = isYearly ? 'none' : 'block';
        });
        
        yearlyPrices.forEach(el => {
            el.style.display = isYearly ? 'block' : 'none';
        });
    });
}

// Testimonials slider
function initTestimonials() {
    const slider = document.querySelector('.testimonials-slider');
    if (!slider) return;
    
    const cards = slider.querySelectorAll('.testimonial-card');
    
    if (cards.length <= 1) return;
    
    let currentSlide = 0;
    
    // Show first card
    cards[0].classList.add('active');
    
    // Auto advance
    setInterval(() => {
        // Hide current
        cards[currentSlide].classList.remove('active');
        
        // Move to next
        currentSlide = (currentSlide + 1) % cards.length;
        
        // Show next
        cards[currentSlide].classList.add('active');
    }, 5000);
}

// Button ripple effect
function initRippleEffect() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.add('btn-ripple');
    });
}

// Form validation for newsletter
function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        
        if (!email || !email.includes('@')) {
            Toast.error('Please enter a valid email');
            return;
        }
        
        Toast.success('Thanks for subscribing!');
        form.reset();
    });
}

// Initialize all landing page features
function initLanding() {
    // Navigation
    initNavScroll();
    initMobileNav();
    initSmoothScroll();
    
    // Animations
    initScrollReveal();
    initAnimatedStats();
    initDeepDive();
    
    // Interactive components
    initFAQ();
    initPricingToggle();
    initTestimonials();
    initRippleEffect();
    initNewsletterForm();
    initScrollProgress();
    
    console.log('BRONLY Landing initialized');
}

// Scroll progress bar
function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;
    
    window.addEventListener('scroll', throttle(() => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight;
        progressBar.style.transform = `scaleX(${scrollPercent})`;
    }, 50), { passive: true });
}

// Auto-initialize if on landing page
if (document.querySelector('.split-hero') || document.querySelector('.hero')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanding);
    } else {
        initLanding();
    }
}
