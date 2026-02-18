/**
 * BRONLY Auth Effects
 * Page Loader + Custom Cursor
 */

// ========================================
// PAGE LOADER
// ========================================
function initPageLoader() {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;
    
    setTimeout(function() {
        loader.classList.add('hidden');
        setTimeout(function() {
            loader.style.display = 'none';
        }, 800);
    }, 3000);
}

// ========================================
// CUSTOM CURSOR
// ========================================
function initCustomCursor() {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const cursor = document.getElementById('customCursor');
    if (!cursor) return;
    
    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    
    if (!dot || !ring) return;
    
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    
    // Track mouse movement
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    }, { passive: true });
    
    // Smooth ring follow animation
    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();
    
    // Hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, .auth-visual-logo-icon, .form-floating');
    
    interactiveElements.forEach(function(el) {
        el.addEventListener('mouseenter', function() {
            cursor.classList.add('cursor-hover');
        });
        
        el.addEventListener('mouseleave', function() {
            cursor.classList.remove('cursor-hover');
        });
    });
}

// ========================================
// INITIALIZE
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initPageLoader();
    initCustomCursor();
});