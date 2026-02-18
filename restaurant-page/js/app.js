/**
 * BRONLY RESTAURANT PAGE - APPLICATION LOGIC
 * Production-ready JavaScript for restaurant booking platform
 * 
 * Features:
 * - Dynamic data management
 * - Shopping cart with localStorage persistence
 * - Form validation
 * - Smooth scrolling navigation
 * - Mobile-responsive interactions
 * - Category filtering
 * - Modal management
 */

// ========================================
// RESTAURANT DATA CONFIGURATION
// ========================================

/**
 * Restaurant configuration object
 * In production, this would come from an API
 */
const restaurantConfig = {
    id: 'restaurant-name',
    name: 'The Gourmet Kitchen',
    description: 'Experience culinary excellence in a warm, inviting atmosphere. Our chefs craft memorable dishes using locally sourced ingredients.',
    logo: null, // URL to logo image
    phone: '+1 (234) 567-890',
    email: 'hello@restaurant.com',
    address: {
        street: '123 Gourmet Street',
        city: 'Culinary District',
        state: 'NY',
        zip: '10001',
        full: '123 Gourmet Street, Culinary District, New York, NY 10001'
    },
    hours: {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '22:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false },
        sunday: { open: '10:00', close: '21:00', closed: false }
    },
    social: {
        instagram: '#',
        facebook: '#',
        twitter: '#'
    },
    settings: {
        currency: 'USD',
        currencySymbol: '$',
        taxRate: 0.08,
        maxGuests: 20,
        minBookingHours: 24
    }
};

// ========================================
// MENU DATA
// ========================================

/**
 * Menu items data
 * Organized by categories for easy filtering
 */
const menuData = [
    // STARTERS
    {
        id: 1,
        name: 'Truffle Arancini',
        description: 'Crispy risotto balls infused with black truffle, served with garlic aioli',
        price: 14.00,
        category: 'starters',
        image: null,
        calories: 320,
        popular: true,
        dietary: ['vegetarian']
    },
    {
        id: 2,
        name: 'Burrata Salad',
        description: 'Fresh burrata cheese, heirloom tomatoes, basil pesto, balsamic glaze',
        price: 16.00,
        category: 'starters',
        image: null,
        calories: 280,
        popular: false,
        dietary: ['vegetarian', 'gluten-free']
    },
    {
        id: 3,
        name: 'Tuna Tartare',
        description: 'Fresh yellowfin tuna, avocado, sesame seeds, soy-ginger dressing',
        price: 18.00,
        category: 'starters',
        image: null,
        calories: 240,
        popular: true,
        dietary: ['gluten-free']
    },
    {
        id: 4,
        name: 'French Onion Soup',
        description: 'Caramelized onions, rich beef broth, gruyère cheese, toasted baguette',
        price: 12.00,
        category: 'starters',
        image: null,
        calories: 380,
        popular: false,
        dietary: []
    },
    
    // MAINS
    {
        id: 5,
        name: 'Grilled Ribeye Steak',
        description: '12oz prime ribeye, herb butter, roasted garlic mashed potatoes, seasonal vegetables',
        price: 42.00,
        category: 'mains',
        image: null,
        calories: 850,
        popular: true,
        dietary: ['gluten-free']
    },
    {
        id: 6,
        name: 'Pan-Seared Salmon',
        description: 'Atlantic salmon, lemon butter sauce, quinoa pilaf, asparagus',
        price: 32.00,
        category: 'mains',
        image: null,
        calories: 620,
        popular: true,
        dietary: ['gluten-free']
    },
    {
        id: 7,
        name: 'Wild Mushroom Risotto',
        description: 'Arborio rice, porcini mushrooms, parmesan, truffle oil, microgreens',
        price: 26.00,
        category: 'mains',
        image: null,
        calories: 580,
        popular: false,
        dietary: ['vegetarian', 'gluten-free']
    },
    {
        id: 8,
        name: 'Lamb Chops',
        description: 'New Zealand lamb, mint chimichurri, rosemary potatoes, grilled vegetables',
        price: 38.00,
        category: 'mains',
        image: null,
        calories: 720,
        popular: false,
        dietary: ['gluten-free']
    },
    {
        id: 9,
        name: 'Pasta Carbonara',
        description: 'House-made fettuccine, pancetta, egg yolk, pecorino romano, black pepper',
        price: 24.00,
        category: 'mains',
        image: null,
        calories: 680,
        popular: true,
        dietary: []
    },
    
    // DESSERTS
    {
        id: 10,
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake, molten center, vanilla bean ice cream',
        price: 12.00,
        category: 'desserts',
        image: null,
        calories: 450,
        popular: true,
        dietary: ['vegetarian']
    },
    {
        id: 11,
        name: 'Crème Brûlée',
        description: 'Classic vanilla custard, caramelized sugar crust, fresh berries',
        price: 10.00,
        category: 'desserts',
        image: null,
        calories: 320,
        popular: false,
        dietary: ['vegetarian', 'gluten-free']
    },
    {
        id: 12,
        name: 'Tiramisu',
        description: 'Espresso-soaked ladyfingers, mascarpone cream, cocoa powder',
        price: 11.00,
        category: 'desserts',
        image: null,
        calories: 380,
        popular: true,
        dietary: ['vegetarian']
    },
    
    // DRINKS
    {
        id: 13,
        name: 'Signature Cocktails',
        description: 'Ask your server about our rotating selection of craft cocktails',
        price: 14.00,
        category: 'drinks',
        image: null,
        calories: 180,
        popular: false,
        dietary: ['vegan', 'gluten-free']
    },
    {
        id: 14,
        name: 'Premium Wine Selection',
        description: 'Curated wines by the glass - red, white, and rosé options available',
        price: 16.00,
        category: 'drinks',
        image: null,
        calories: 120,
        popular: true,
        dietary: ['vegan', 'gluten-free']
    },
    {
        id: 15,
        name: 'Artisan Coffee',
        description: 'Single-origin espresso drinks, pour-over, or cold brew',
        price: 6.00,
        category: 'drinks',
        image: null,
        calories: 5,
        popular: false,
        dietary: ['vegan', 'gluten-free']
    }
];

// ========================================
// SHOPPING CART MANAGEMENT
// ========================================

/**
 * Cart class for managing shopping cart operations
 * Uses localStorage for persistence
 */
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartUI();
    }
    
    /**
     * Load cart from localStorage
     * @returns {Array} Cart items
     */
    loadCart() {
        try {
            const saved = localStorage.getItem('bronly_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('Failed to load cart from localStorage:', error);
            return [];
        }
    }
    
    /**
     * Save cart to localStorage
     */
    saveCart() {
        try {
            localStorage.setItem('bronly_cart', JSON.stringify(this.items));
        } catch (error) {
            console.warn('Failed to save cart to localStorage:', error);
        }
    }
    
    /**
     * Add item to cart
     * @param {Object} item - Menu item to add
     * @param {number} quantity - Quantity to add
     */
    addItem(item, quantity = 1) {
        const existingItem = this.items.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...item,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showAddConfirmation(item.name);
    }
    
    /**
     * Remove item from cart
     * @param {number} itemId - ID of item to remove
     */
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartUI();
    }
    
    /**
     * Update item quantity
     * @param {number} itemId - ID of item to update
     * @param {number} quantity - New quantity
     */
    updateQuantity(itemId, quantity) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartUI();
            }
        }
    }
    
    /**
     * Get total item count
     * @returns {number} Total items in cart
     */
    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    /**
     * Calculate subtotal
     * @returns {number} Subtotal amount
     */
    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    /**
     * Calculate tax
     * @returns {number} Tax amount
     */
    getTax() {
        return this.getSubtotal() * restaurantConfig.settings.taxRate;
    }
    
    /**
     * Calculate total
     * @returns {number} Total amount
     */
    getTotal() {
        return this.getSubtotal() + this.getTax();
    }
    
    /**
     * Clear cart
     */
    clear() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
    }
    
    /**
     * Update cart UI elements
     */
    updateCartUI() {
        // Update cart count badge
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const count = this.getItemCount();
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
        
        // Update cart panel
        this.renderCartItems();
        this.updateCartTotals();
    }
    
    /**
     * Render cart items in panel
     */
    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartFooter = document.getElementById('cartFooter');
        
        if (!cartItems) return;
        
        if (this.items.length === 0) {
            cartItems.innerHTML = '';
            if (cartEmpty) cartEmpty.style.display = 'flex';
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }
        
        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'block';
        
        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}" loading="lazy">` :
                        `<div style="width:100%;height:100%;background:linear-gradient(135deg,#e2e8f0,#cbd5e1);display:flex;align-items:center;justify-content:center;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                        </div>`
                    }
                </div>
                <div class="cart-item-details">
                    <div>
                        <p class="cart-item-name">${item.name}</p>
                        <p class="cart-item-price">${restaurantConfig.settings.currencySymbol}${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})" aria-label="Decrease quantity">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})" aria-label="Increase quantity">+</button>
                        <button class="remove-item-btn" onclick="cart.removeItem(${item.id})" aria-label="Remove item">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Update cart totals
     */
    updateCartTotals() {
        const subtotalEl = document.getElementById('cartSubtotal');
        const taxEl = document.getElementById('cartTax');
        const totalEl = document.getElementById('cartTotal');
        
        if (subtotalEl) subtotalEl.textContent = `${restaurantConfig.settings.currencySymbol}${this.getSubtotal().toFixed(2)}`;
        if (taxEl) taxEl.textContent = `${restaurantConfig.settings.currencySymbol}${this.getTax().toFixed(2)}`;
        if (totalEl) totalEl.textContent = `${restaurantConfig.settings.currencySymbol}${this.getTotal().toFixed(2)}`;
    }
    
    /**
     * Show add confirmation toast
     * @param {string} itemName - Name of item added
     */
    showAddConfirmation(itemName) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: #10b981;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 500;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 1000;
            transition: transform 0.3s ease;
        `;
        toast.textContent = `Added ${itemName} to cart`;
        document.body.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// ========================================
// MENU RENDERING
// ========================================

/**
 * Render menu items to the grid
 * @param {string} category - Category to filter by (default: 'all')
 */
function renderMenu(category = 'all') {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;
    
    const filteredItems = category === 'all' 
        ? menuData 
        : menuData.filter(item => item.category === category);
    
    menuGrid.innerHTML = filteredItems.map(item => `
        <article class="menu-item" data-category="${item.category}">
            <div class="menu-item-image">
                ${item.popular ? '<span class="menu-item-badge">Popular</span>' : ''}
                ${item.image ? 
                    `<img src="${item.image}" alt="${item.name}" loading="lazy">` :
                    `<div style="width:100%;height:100%;background:linear-gradient(135deg,#e0e7ff,#dbeafe);display:flex;align-items:center;justify-content:center;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                    </div>`
                }
            </div>
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3 class="menu-item-name">${item.name}</h3>
                    <span class="menu-item-price">${restaurantConfig.settings.currencySymbol}${item.price.toFixed(2)}</span>
                </div>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-calories">${item.calories} cal</span>
                    <button class="add-to-cart-btn" onclick="cart.addItem(${JSON.stringify(item).replace(/"/g, '&quot;')})" aria-label="Add ${item.name} to cart">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add
                    </button>
                </div>
            </div>
        </article>
    `).join('');
}

/**
 * Initialize category filters
 */
function initCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter menu
            const category = btn.dataset.category;
            renderMenu(category);
        });
    });
}

// ========================================
// FORM VALIDATION
// ========================================

/**
 * Validate booking form
 * @returns {boolean} Whether form is valid
 */
function validateBookingForm() {
    const form = document.getElementById('bookingForm');
    const guestName = document.getElementById('guestName');
    const guestPhone = document.getElementById('guestPhone');
    const bookingDate = document.getElementById('bookingDate');
    const bookingTime = document.getElementById('bookingTime');
    
    let isValid = true;
    
    // Reset errors
    form.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('has-error');
    });
    
    // Validate name
    if (!guestName.value.trim()) {
        guestName.parentElement.classList.add('has-error');
        guestName.classList.add('error');
        isValid = false;
    } else {
        guestName.classList.remove('error');
    }
    
    // Validate phone
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(guestPhone.value.trim())) {
        guestPhone.parentElement.classList.add('has-error');
        guestPhone.classList.add('error');
        isValid = false;
    } else {
        guestPhone.classList.remove('error');
    }
    
    // Validate date
    if (!bookingDate.value) {
        bookingDate.parentElement.classList.add('has-error');
        bookingDate.classList.add('error');
        isValid = false;
    } else {
        // Check if date is in the past
        const selectedDate = new Date(bookingDate.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            bookingDate.parentElement.classList.add('has-error');
            bookingDate.classList.add('error');
            isValid = false;
        } else {
            bookingDate.classList.remove('error');
        }
    }
    
    // Validate time
    if (!bookingTime.value) {
        bookingTime.parentElement.classList.add('has-error');
        bookingTime.classList.add('error');
        isValid = false;
    } else {
        bookingTime.classList.remove('error');
    }
    
    return isValid;
}

/**
 * Handle booking form submission
 */
function handleBookingSubmit(e) {
    e.preventDefault();
    
    if (!validateBookingForm()) {
        return;
    }
    
    const submitBtn = document.getElementById('submitBooking');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = {
        name: document.getElementById('guestName').value,
        phone: document.getElementById('guestPhone').value,
        date: document.getElementById('bookingDate').value,
        time: document.getElementById('bookingTime').value,
        guests: document.getElementById('guestCount').value,
        specialRequests: document.getElementById('specialRequests').value
    };
    
    // Simulate API call
    setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        // Show success modal with details
        showBookingSuccessModal(formData);
        
        // Reset form
        document.getElementById('bookingForm').reset();
        document.getElementById('guestCount').value = '2';
    }, 1500);
}

/**
 * Adjust guest count
 * @param {number} delta - Amount to adjust by
 */
function adjustGuests(delta) {
    const input = document.getElementById('guestCount');
    const currentValue = parseInt(input.value) || 2;
    const newValue = currentValue + delta;
    
    if (newValue >= 1 && newValue <= restaurantConfig.settings.maxGuests) {
        input.value = newValue;
    }
}

/**
 * Set minimum date for booking
 */
function setMinBookingDate() {
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
}

// ========================================
// MODAL MANAGEMENT
// ========================================

/**
 * Show booking success modal
 * @param {Object} bookingData - Booking details
 */
function showBookingSuccessModal(bookingData) {
    const modal = document.getElementById('bookingSuccessModal');
    const detailsContainer = document.getElementById('bookingDetails');
    
    // Format date
    const dateObj = new Date(bookingData.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Format time
    const [hours, minutes] = bookingData.time.split(':');
    const timeObj = new Date();
    timeObj.setHours(parseInt(hours), parseInt(minutes));
    const formattedTime = timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });
    
    detailsContainer.innerHTML = `
        <div class="booking-detail-row">
            <span class="booking-detail-label">Name</span>
            <span class="booking-detail-value">${bookingData.name}</span>
        </div>
        <div class="booking-detail-row">
            <span class="booking-detail-label">Date</span>
            <span class="booking-detail-value">${formattedDate}</span>
        </div>
        <div class="booking-detail-row">
            <span class="booking-detail-label">Time</span>
            <span class="booking-detail-value">${formattedTime}</span>
        </div>
        <div class="booking-detail-row">
            <span class="booking-detail-label">Guests</span>
            <span class="booking-detail-value">${bookingData.guests}</span>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close booking success modal
 */
function closeBookingModal() {
    const modal = document.getElementById('bookingSuccessModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Place order
 */
function placeOrder() {
    if (cart.getItemCount() === 0) return;
    
    // Generate order number
    const orderNumber = Math.floor(10000 + Math.random() * 90000);
    document.getElementById('orderNumber').textContent = orderNumber;
    
    // Show success modal
    const modal = document.getElementById('orderSuccessModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Clear cart
    cart.clear();
    closeCart();
}

/**
 * Close order success modal
 */
function closeOrderModal() {
    const modal = document.getElementById('orderSuccessModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Open cart panel
 */
function openCart() {
    const panel = document.getElementById('cartPanel');
    panel.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close cart panel
 */
function closeCart() {
    const panel = document.getElementById('cartPanel');
    panel.classList.remove('active');
    document.body.style.overflow = '';
}

// ========================================
// NAVIGATION & SCROLLING
// ========================================

/**
 * Smooth scroll to booking section
 */
function scrollToBooking() {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
        const headerOffset = 80;
        const elementPosition = bookingSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
    
    // Close mobile menu if open
    closeMobileMenu();
}

/**
 * Smooth scroll to menu section
 */
function scrollToMenu() {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
        const headerOffset = 80;
        const elementPosition = menuSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
    
    // Close mobile menu if open
    closeMobileMenu();
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    menuBtn.classList.remove('active');
    mobileMenu.classList.remove('active');
}

/**
 * Handle header scroll effect
 */
function handleHeaderScroll() {
    const header = document.getElementById('header');
    const scrollY = window.scrollY;
    
    if (scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

/**
 * Update active nav link based on scroll position
 */
function updateActiveNavLink() {
    const sections = ['info', 'menu', 'booking'];
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        const navLink = document.querySelector(`a[href="#${sectionId}"]`);
        
        if (section && navLink) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    });
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize dynamic content
 */
function initializeContent() {
    // Update restaurant name
    const nameEl = document.getElementById('restaurantName');
    if (nameEl) nameEl.textContent = restaurantConfig.name;
    
    // Update description
    const descEl = document.getElementById('restaurantDescription');
    if (descEl) descEl.textContent = restaurantConfig.description;
    
    // Render menu
    renderMenu();
    
    // Initialize category filters
    initCategoryFilters();
    
    // Set minimum booking date
    setMinBookingDate();
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Header scroll effect
    window.addEventListener('scroll', () => {
        handleHeaderScroll();
        updateActiveNavLink();
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Booking form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeBookingModal();
            closeOrderModal();
            closeCart();
            closeMobileMenu();
        }
    });
    
    // Input validation - remove error on input
    const inputs = document.querySelectorAll('.form-input, .form-select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
            this.parentElement.classList.remove('has-error');
        });
    });
}

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 500);
    }
}

/**
 * Main initialization function
 */
function init() {
    initializeContent();
    initializeEventListeners();
    
    // Hide loading overlay after initialization
    window.addEventListener('load', hideLoadingOverlay);
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
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

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: restaurantConfig.settings.currency
    }).format(amount);
}

/**
 * Format date
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}