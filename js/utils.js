/**
 * BRONLY - Utility Functions
 * Common helpers and animations
 */

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format date
export function formatDate(date, options = {}) {
    const d = new Date(date);
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };
    return d.toLocaleDateString('en-US', defaultOptions);
}

// Format time
export function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format number with commas
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Animate number counting
export function animateNumber(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Check if element is in viewport
export function isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * (1 - threshold) &&
        rect.bottom >= 0
    );
}

// Smooth scroll to element
export function scrollToElement(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Generate unique ID
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Deep clone object
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Capitalize first letter
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Truncate text
export function truncate(str, length = 100, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
}

// Storage helpers
export const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    },
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            return false;
        }
    }
};

// Cookie helpers
export const cookies = {
    get: (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    },
    set: (name, value, days = 7) => {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
    },
    remove: (name) => {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Strict`;
    }
};

// Device detection
export const device = {
    isMobile: () => window.innerWidth < 768,
    isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: () => window.innerWidth >= 1024,
    isTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    getType: () => {
        if (window.innerWidth < 768) return 'mobile';
        if (window.innerWidth < 1024) return 'tablet';
        return 'desktop';
    }
};

// Performance monitoring
export const perf = {
    measure: (name, fn) => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    },
    mark: (name) => performance.mark(name),
    measureMark: (startMark, endMark, measureName) => {
        performance.measure(measureName, startMark, endMark);
    }
};

// Scroll direction detection
export function getScrollDirection() {
    let lastScrollTop = 0;
    
    return () => {
        const st = window.pageYOffset || document.documentElement.scrollTop;
        const direction = st > lastScrollTop ? 'down' : 'up';
        lastScrollTop = st <= 0 ? 0 : st;
        return direction;
    };
}

// Intersection Observer helper
export function createObserver(callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
        ...options
    };
    
    return new IntersectionObserver(callback, defaultOptions);
}

// Resize Observer helper
export function createResizeObserver(callback) {
    return new ResizeObserver(entries => {
        entries.forEach(entry => {
            callback(entry);
        });
    });
}

// RAF animation helper
export function rafAnimate(duration, callback) {
    const start = performance.now();
    
    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        
        callback(progress);
        
        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }
    
    requestAnimationFrame(tick);
}

// Validate email
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password strength
export function getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
}

// Copy to clipboard
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch (err) {
            document.body.removeChild(textarea);
            return false;
        }
    }
}

// Download file
export function downloadFile(content, filename, contentType = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Parse URL params
export function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// Build URL with params
export function buildUrl(base, params) {
    const url = new URL(base, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            url.searchParams.append(key, value);
        }
    });
    return url.toString();
}

// Wait for element
export function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

// Add ripple effect to button
export function addRippleEffect(element) {
    element.classList.add('btn-ripple');
    
    element.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.style.backgroundImage = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3) 10%, transparent 10.01%)`;
        this.style.backgroundSize = '1000% 1000%';
        this.style.backgroundPosition = 'center';
        
        requestAnimationFrame(() => {
            this.style.transition = 'background-size 0.5s, background-position 0.5s';
            this.style.backgroundSize = '100% 100%';
        });
    });
}

// Initialize scroll progress
export function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;
    
    const updateProgress = throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = `${progress}%`;
    }, 50);
    
    window.addEventListener('scroll', updateProgress, { passive: true });
}

// Initialize reveal animations
export function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!reveals.length) return;
    
    const observer = createObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    reveals.forEach(el => observer.observe(el));
}

// Export all utilities
export default {
    debounce,
    throttle,
    formatDate,
    formatTime,
    formatNumber,
    animateNumber,
    isInViewport,
    scrollToElement,
    generateId,
    deepClone,
    capitalize,
    truncate,
    storage,
    cookies,
    device,
    perf,
    getScrollDirection,
    createObserver,
    createResizeObserver,
    rafAnimate,
    isValidEmail,
    getPasswordStrength,
    copyToClipboard,
    downloadFile,
    getUrlParams,
    buildUrl,
    waitForElement,
    addRippleEffect,
    initScrollProgress,
    initRevealAnimations
};
