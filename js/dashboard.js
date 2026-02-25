/**
 * BRONLY - Dashboard JavaScript
 * Overview, charts, and statistics
 */

import { authAPI, dashboardAPI, restaurantsAPI } from './api.js';
import { Toast, Modal, confirmDialog, createEmptyState, createStatsCard } from './components.js';
import { requireAuth, getUser } from './auth.js';
import { animateNumber, formatNumber, device } from './utils.js';
import { DataManager, renderUtils, simulateDelay, setErrorSimulation, getErrorSimulation, maybeThrowError } from './seed.js';

// Dashboard state
const state = {
    stats: null,
    restaurants: [],
    activities: [],
    isLoading: true,
    userRole: null
};

// Role permissions
const rolePermissions = {
    admin: {
        canManageRestaurants: true,
        canManageTables: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canAccessSettings: true,
        label: 'Administrator'
    },
    restaurant_owner: {
        canManageRestaurants: true,
        canManageTables: true,
        canViewAnalytics: true,
        canManageUsers: false,
        canAccessSettings: true,
        label: 'Restaurant Owner'
    },
    staff: {
        canManageRestaurants: false,
        canManageTables: true,
        canViewAnalytics: false,
        canManageUsers: false,
        canAccessSettings: false,
        label: 'Staff Member'
    }
};

// Initialize dashboard
export async function initDashboard() {
    if (!requireAuth()) return;
    
    // Get user role
    const user = getUser();
    state.userRole = user?.role || 'restaurant_owner';
    
    // Apply role-based UI
    applyRoleBasedUI();
    
    setupSidebar();
    setupHeader();
    setupEventListeners();
    setupNotificationSystem();
    
    // Load data
    await loadDashboardData();
    
    // Initialize charts
    initCharts();
    
    console.log('Dashboard initialized for role:', state.userRole);
}

// Apply role-based UI modifications
function applyRoleBasedUI() {
    const permissions = rolePermissions[state.userRole] || rolePermissions.restaurant_owner;
    
    // Update sidebar based on role
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        // Hide/show restaurants link for staff
        const restaurantsLink = sidebarNav.querySelector('a[href="restaurants.html"]');
        if (restaurantsLink && !permissions.canManageRestaurants) {
            restaurantsLink.style.display = 'none';
        }
        
        // Add role badge to sidebar
        const sidebarHeader = document.querySelector('.sidebar-header');
        if (sidebarHeader) {
            const existingBadge = sidebarHeader.querySelector('.role-badge');
            if (!existingBadge) {
                const badge = document.createElement('span');
                badge.className = 'role-badge';
                badge.textContent = permissions.label;
                badge.style.cssText = `
                    display: inline-block;
                    padding: 4px 12px;
                    background: var(--gradient-accent);
                    color: var(--color-bg-primary);
                    font-size: 10px;
                    font-weight: 700;
                    border-radius: 20px;
                    margin-top: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                `;
                const logo = sidebarHeader.querySelector('.sidebar-logo');
                if (logo) {
                    logo.style.flexDirection = 'column';
                    logo.style.alignItems = 'flex-start';
                    logo.appendChild(badge);
                }
            }
        }
    }
    
    // Hide analytics for staff
    if (!permissions.canViewAnalytics) {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">📊</div>
                    <h3 style="margin-bottom: 8px;">Analytics Access Restricted</h3>
                    <p style="color: var(--color-text-muted);">Contact your administrator for analytics access.</p>
                </div>
            `;
        }
        
        // Hide stats that staff shouldn't see
        const statsContainer = document.querySelector('.stats-grid-dashboard');
        if (statsContainer) {
            // Keep only operational stats for staff
            statsContainer.style.display = 'none';
        }
    }
    
    // Show quick actions based on role
    const content = document.querySelector('.content');
    if (content && permissions.canManageTables) {
        const quickActions = document.createElement('div');
        quickActions.className = 'quick-actions';
        quickActions.style.cssText = `
            display: flex;
            gap: 12px;
            margin-bottom: 24px;
            flex-wrap: wrap;
        `;
        
        if (permissions.canManageTables) {
            quickActions.innerHTML += `
                <a href="tables.html" class="btn btn-secondary">
                    <span>🪑</span> Manage Tables
                </a>
            `;
        }
        
        if (permissions.canManageRestaurants) {
            quickActions.innerHTML += `
                <a href="restaurants.html" class="btn btn-secondary">
                    <span>🏪</span> Restaurants
                </a>
            `;
        }
        
        // Insert at the beginning of content
        const firstChild = content.firstElementChild;
        if (firstChild) {
            content.insertBefore(quickActions, firstChild);
        }
    }
}

// Setup sidebar navigation
function setupSidebar() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'dashboard.html')) {
            link.classList.add('active');
        }
    });
    
    // Mobile sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
            sidebarToggle.classList.toggle('active');
            
            // Toggle overlay
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
            
            // Prevent body scroll when sidebar is open
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('open');
                sidebarToggle.classList.remove('active');
                
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
                
                document.body.style.overflow = '';
            }
        });
        
        // Close sidebar when clicking on overlay
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                sidebarToggle.classList.remove('active');
                sidebarOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    }
    
    // Setup logout
    const logoutBtn = document.querySelector('[data-logout]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Setup header
function setupHeader() {
    const user = getUser();
    if (!user) return;

    // Update user info in sidebar
    const userNameEl = document.querySelector('.sidebar-user-name');
    const userRoleEl = document.querySelector('.sidebar-user-role');
    const userAvatarEl = document.querySelector('.sidebar-user-avatar');

    if (userNameEl) userNameEl.textContent = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
    if (userRoleEl) userRoleEl.textContent = user.role || 'Restaurant Owner';
    if (userAvatarEl) userAvatarEl.textContent = (user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase();

    // Add demo reset button if in demo mode
    const headerRight = document.querySelector('.header-right');
    if (headerRight && localStorage.getItem('demo_mode') === 'true') {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'header-action';
        resetBtn.innerHTML = '🔄';
        resetBtn.title = 'Reset Demo Data';
        resetBtn.onclick = () => {
            if (confirm('Reset all demo data? This will restore original demo data.')) {
                localStorage.removeItem('mock_data_initialized');
                localStorage.removeItem('demo_users');
                localStorage.removeItem('demo_restaurants');
                localStorage.removeItem('demo_tables');
                localStorage.removeItem('demo_reservations');
                localStorage.removeItem('demo_activity');
                localStorage.removeItem('demo_stats');
                localStorage.removeItem('demo_chart_data');
                window.location.reload();
            }
        };
        headerRight.insertBefore(resetBtn, headerRight.firstChild);
    }

    // Header search
    const searchInput = document.querySelector('.header-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value;
            if (query.length > 2) {
                performSearch(query);
            }
        }, 300));
    }
    
    // Setup settings button
    const settingsBtn = document.querySelector('.header-actions .header-action:last-child');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = '/settings.html';
        });
        settingsBtn.title = 'Settings';
    }
    
    // Setup notifications button
    const notificationsBtn = document.querySelector('.header-actions .header-action:first-child');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', toggleNotificationsPanel);
        notificationsBtn.title = 'Notifications';
    }
    
    // Add click outside listener for notifications panel
    document.addEventListener('click', handleOutsideClick);
    
    // Add keyboard shortcut for notifications ('n' key)
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Simulate loading delay
        await simulateDelay();
        
        // Maybe throw error for simulation
        maybeThrowError();
        
        // Load stats (using mock data)
        const statsData = {
            restaurant_count: 3,
            restaurant_growth: 12,
            table_count: 42,
            table_growth: 8,
            today_reservations: DataManager.getReservations().length,
            today_revenue: 3840,
            revenue_growth: 15,
            occupancy_rate: 78,
            total_guests_served: 156,
            average_party_size: 3.2
        };
        state.stats = statsData;
        renderStats(statsData);
        
        // Load restaurants (using mock data)
        const restaurantsData = [
            {
                id: 1,
                name: 'The Golden Spoon',
                address: '123 Gourmet Avenue, New York, NY 10001',
                phone: '+1 (555) 123-4567',
                description: 'Fine dining with modern American cuisine',
                cuisine: 'American',
                rating: 4.8,
                table_count: 24,
                created_at: '2024-01-15T10:00:00Z',
                owner_id: 1
            },
            {
                id: 2,
                name: 'Bella Vista',
                address: '456 Ocean Drive, Miami, FL 33139',
                phone: '+1 (555) 234-5678',
                description: 'Authentic Italian with waterfront views',
                cuisine: 'Italian',
                rating: 4.6,
                table_count: 32,
                created_at: '2024-02-20T14:30:00Z',
                owner_id: 1
            },
            {
                id: 3,
                name: 'Sakura Sushi Bar',
                address: '789 Cherry Blossom Lane, San Francisco, CA 94102',
                phone: '+1 (555) 345-6789',
                description: 'Fresh sushi and Japanese specialties',
                cuisine: 'Japanese',
                rating: 4.9,
                table_count: 18,
                created_at: '2024-03-10T09:15:00Z',
                owner_id: 1
            }
        ];
        state.restaurants = restaurantsData;
        renderRecentRestaurants(state.restaurants.slice(0, 5));
        
        // Load activity from notifications (using seed data)
        const notifications = DataManager.getNotifications().slice(0, 5);
        state.activities = notifications.map(notification => ({
            id: notification.id,
            type: notification.type,
            description: notification.message,
            created_at: notification.timestamp
        }));
        renderActivity(state.activities);
        
        // Render recent reservations using seed data
        renderRecentReservations();
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        Toast.error('Failed to load dashboard data');
        
        // Show empty states
        showEmptyStates();
    } finally {
        state.isLoading = false;
        hideSkeletons();
    }
}

// Render stats cards
function renderStats(stats) {
    const container = document.querySelector('.stats-grid-dashboard');
    if (!container) return;
    
    container.innerHTML = '';
    
    const permissions = rolePermissions[state.userRole] || rolePermissions.restaurant_owner;
    
    // Define stats based on role
    let statConfigs = [];
    
    if (state.userRole === 'admin') {
        // Admin sees everything
        statConfigs = [
            { title: 'Total Restaurants', value: stats.restaurant_count || 0, icon: '🏪', trend: stats.restaurant_growth || 12 },
            { title: 'Total Tables', value: stats.table_count || 0, icon: '🪑', trend: stats.table_growth || 8 },
            { title: 'All Reservations', value: stats.today_reservations || 0, icon: '📅', trend: -3 },
            { title: 'Total Revenue', value: `$${stats.today_revenue || 0}`, icon: '💰', trend: stats.revenue_growth || 15 }
        ];
    } else if (state.userRole === 'restaurant_owner') {
        // Owner sees their restaurants
        statConfigs = [
            { title: 'My Restaurants', value: stats.restaurant_count || 0, icon: '🏪', trend: stats.restaurant_growth || 12 },
            { title: 'Active Tables', value: stats.table_count || 0, icon: '🪑', trend: stats.table_growth || 8 },
            { title: 'Today Reservations', value: stats.today_reservations || 0, icon: '📅', trend: -3 },
            { title: 'Revenue Today', value: `$${stats.today_revenue || 0}`, icon: '💰', trend: stats.revenue_growth || 15 }
        ];
    } else {
        // Staff sees operational stats only
        statConfigs = [
            { title: 'Available Tables', value: Math.floor((stats.table_count || 42) * 0.6), icon: '🪑', trend: 5 },
            { title: 'Occupied Tables', value: Math.floor((stats.table_count || 42) * 0.3), icon: '🍽️', trend: -2 },
            { title: 'Upcoming Reservations', value: stats.today_reservations || 24, icon: '📅', trend: 8 },
            { title: 'Guests Served Today', value: stats.total_guests_served || 156, icon: '👥', trend: 12 }
        ];
    }
    
    statConfigs.forEach(config => {
        const card = createStatsCard({
            title: config.title,
            value: config.value,
            trend: config.trend,
            icon: config.icon
        });
        container.appendChild(card);
        
        // Animate the number
        const valueEl = card.querySelector('[data-count]');
        if (valueEl) {
            const numValue = parseInt(config.value.toString().replace(/[^0-9]/g, ''));
            animateNumber(valueEl, numValue, 2000);
        }
    });
}

// Render recent restaurants
function renderRecentRestaurants(restaurants) {
    const container = document.querySelector('.recent-restaurants-list');
    if (!container) return;
    
    if (!restaurants.length) {
        container.innerHTML = '';
        container.appendChild(createEmptyState({
            icon: '🏪',
            title: 'No restaurants yet',
            description: 'Add your first restaurant to get started',
            actionText: 'Add Restaurant',
            onAction: () => window.location.href = '/restaurants.html'
        }));
        return;
    }
    
    container.innerHTML = restaurants.map(r => `
        <div class="activity-item">
            <div class="activity-avatar">🏪</div>
            <div class="activity-content">
                <div class="activity-text">
                    <strong>${r.name}</strong> added
                </div>
                <div class="activity-time">${formatTimeAgo(r.created_at)}</div>
            </div>
        </div>
    `).join('');
}

// Render activity feed
function renderActivity(activities) {
    const container = document.querySelector('.activity-list');
    if (!container) return;
    
    if (!activities.length) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 24px;">
                <p style="color: var(--color-text-muted);">No recent activity</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activities.map(a => `
        <div class="activity-item">
            <div class="activity-avatar">${getActivityIcon(a.type)}</div>
            <div class="activity-content">
                <div class="activity-text">
                    ${a.description}
                </div>
                <div class="activity-time">${formatTimeAgo(a.created_at)}</div>
            </div>
        </div>
    `).join('');
}

// Render recent reservations
function renderRecentReservations() {
    const reservations = DataManager.getReservations().slice(0, 5); // Get latest 5 reservations
    const container = document.querySelector('.recent-reservations-list');
    
    if (!container) return;
    
    if (!reservations.length) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 24px; text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 12px;">📅</div>
                <p style="color: var(--color-text-muted);">No recent reservations</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reservations.map(reservation => {
        const customer = DataManager.getCustomerById(reservation.customer_id);
        const restaurant = getRestaurantById(reservation.restaurant_id);
        const table = DataManager.getTableById(reservation.table_id);
        
        return `
            <div class="reservation-item">
                <div class="reservation-info">
                    <div class="reservation-guest">
                        <strong>${customer ? customer.first_name + ' ' + customer.last_name : 'Unknown Customer'}</strong>
                        <small>${customer ? customer.email : 'N/A'}</small>
                    </div>
                    <div class="reservation-details">
                        <div class="reservation-meta">
                            <span class="reservation-date">${renderUtils.formatDate(reservation.date)}</span>
                            <span class="reservation-time">${renderUtils.formatTime(reservation.time)}</span>
                            <span class="reservation-party">${reservation.party_size} guests</span>
                        </div>
                        <div class="reservation-location">
                            <span class="restaurant-name">${restaurant ? restaurant.name : 'Unknown'}</span>
                            <span class="table-number">Table ${table ? table.number : 'TBD'}</span>
                        </div>
                    </div>
                </div>
                <div class="reservation-status">
                    ${renderUtils.formatStatus(reservation.status)}
                </div>
            </div>
        `;
    }).join('');
}

// Helper function to get restaurant by ID
function getRestaurantById(id) {
    const restaurants = [
        {
            id: 1,
            name: 'The Golden Spoon',
            address: '123 Gourmet Avenue, New York, NY 10001',
            phone: '+1 (555) 123-4567',
            description: 'Fine dining with modern American cuisine',
            cuisine: 'American',
            rating: 4.8,
            table_count: 24,
            created_at: '2024-01-15T10:00:00Z',
            owner_id: 1
        },
        {
            id: 2,
            name: 'Bella Vista',
            address: '456 Ocean Drive, Miami, FL 33139',
            phone: '+1 (555) 234-5678',
            description: 'Authentic Italian with waterfront views',
            cuisine: 'Italian',
            rating: 4.6,
            table_count: 32,
            created_at: '2024-02-20T14:30:00Z',
            owner_id: 1
        },
        {
            id: 3,
            name: 'Sakura Sushi Bar',
            address: '789 Cherry Blossom Lane, San Francisco, CA 94102',
            phone: '+1 (555) 345-6789',
            description: 'Fresh sushi and Japanese specialties',
            cuisine: 'Japanese',
            rating: 4.9,
            table_count: 18,
            created_at: '2024-03-10T09:15:00Z',
            owner_id: 1
        }
    ];
    return restaurants.find(r => r.id === parseInt(id));
}

// Get activity icon
function getActivityIcon(type) {
    const icons = {
        'reservation': '📅',
        'table': '🪑',
        'restaurant': '🏪',
        'user': '👤',
        'payment': '💰'
    };
    return icons[type] || '📌';
}

// Format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

// Initialize canvas charts
function initCharts() {
    const canvas = document.getElementById('reservationsChart');
    if (!canvas) return;
    
    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    // Generate sample data
    const data = generateSampleData();
    
    // Draw chart
    drawLineChart(ctx, canvas, data);
    
    // Animate chart
    animateChart(ctx, canvas, data);
}

// Generate sample chart data
function generateSampleData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
        label: day,
        value: Math.floor(Math.random() * 50) + 20
    }));
}

// Draw line chart
function drawLineChart(ctx, canvas, data) {
    const padding = 40;
    const width = canvas.width / (window.devicePixelRatio || 1) - padding * 2;
    const height = canvas.height / (window.devicePixelRatio || 1) - padding * 2;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const xStep = width / (data.length - 1);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 4; i++) {
        const y = padding + (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + width, y);
        ctx.stroke();
    }
    
    // Draw line
    ctx.strokeStyle = '#FCA311';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    data.forEach((point, i) => {
        const x = padding + i * xStep;
        const y = padding + height - (point.value / maxValue) * height;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            // Smooth curve
            const prevX = padding + (i - 1) * xStep;
            const prevY = padding + height - (data[i - 1].value / maxValue) * height;
            const cpX = (prevX + x) / 2;
            ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
    });
    ctx.stroke();
    
    // Draw fill
    ctx.lineTo(padding + width, padding + height);
    ctx.lineTo(padding, padding + height);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, padding, 0, padding + height);
    gradient.addColorStop(0, 'rgba(252, 163, 17, 0.3)');
    gradient.addColorStop(1, 'rgba(252, 163, 17, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw points
    data.forEach((point, i) => {
        const x = padding + i * xStep;
        const y = padding + height - (point.value / maxValue) * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#FCA311';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(252, 163, 17, 0.2)';
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    data.forEach((point, i) => {
        const x = padding + i * xStep;
        ctx.fillText(point.label, x, padding + height + 20);
    });
}

// Animate chart
function animateChart(ctx, canvas, data) {
    // Simple animation - could be enhanced
    let progress = 0;
    
    function step() {
        progress += 0.02;
        if (progress <= 1) {
            requestAnimationFrame(step);
        }
    }
    
    step();
}

// Handle logout
async function handleLogout(e) {
    e.preventDefault();
    
    confirmDialog('Are you sure you want to logout?', async () => {
        const { logout } = await import('./auth.js');
        await logout();
    });
}

// Perform search
function performSearch(query) {
    console.log('Searching for:', query);
    // Implement search functionality
}

// Utility debounce
function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Show empty states
function showEmptyStates() {
    const containers = document.querySelectorAll('.skeleton');
    containers.forEach(el => {
        el.style.display = 'none';
    });
}

// Hide skeletons
function hideSkeletons() {
    document.querySelectorAll('.skeleton').forEach(el => el.remove());
}

// Setup event listeners
function setupEventListeners() {
    // Chart filter buttons
    document.querySelectorAll('.chart-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Reload chart with new filter
            const period = btn.dataset.period || '7d';
            loadChartData(period);
        });
    });
}

// Load chart data
async function loadChartData(period) {
    try {
        const data = await dashboardAPI.getAnalytics(period);
        // Update chart with new data
        console.log('Chart data:', data);
    } catch (error) {
        console.error('Failed to load chart data:', error);
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', initDashboard);

// Notification system state
const notificationState = {
    isOpen: false,
    notifications: [
        {
            id: 1,
            title: 'New reservation',
            message: 'New reservation at The Golden Spoon for 4 guests',
            timestamp: new Date(Date.now() - 10 * 60000), // 10 minutes ago
            read: false,
            type: 'reservation'
        },
        {
            id: 2,
            title: 'Table available',
            message: 'Table A2 at The Golden Spoon is now available',
            timestamp: new Date(Date.now() - 25 * 60000), // 25 minutes ago
            read: false,
            type: 'table'
        },
        {
            id: 3,
            title: 'System update',
            message: 'BRONLY platform has been updated with new features',
            timestamp: new Date(Date.now() - 120 * 60000), // 2 hours ago
            read: true,
            type: 'system'
        }
    ]
};

// Initialize notification system
function setupNotificationSystem() {
    // Create notification panel if it doesn't exist
    if (!document.querySelector('#notifications-panel')) {
        createNotificationsPanel();
    }
}

// Create notifications panel
function createNotificationsPanel() {
    const panel = document.createElement('div');
    panel.id = 'notifications-panel';
    panel.className = 'notifications-panel';
    panel.innerHTML = `
        <div class="notifications-header">
            <h3>Notifications</h3>
            <button class="notifications-clear" id="clearAllNotifications">Clear All</button>
        </div>
        <div class="notifications-list" id="notificationsList"></div>
        <div class="notifications-footer">
            <button class="btn btn-secondary" id="viewAllNotifications">View All</button>
        </div>
    `;
    document.body.appendChild(panel);
    
    // Initially hide the panel
    panel.style.display = 'none';
    
    // Add event listeners for buttons
    const clearButton = document.getElementById('clearAllNotifications');
    if (clearButton) {
        clearButton.addEventListener('click', (e) => {
            e.stopPropagation();
            clearAllNotifications();
        });
    }
    
    const viewAllButton = document.getElementById('viewAllNotifications');
    if (viewAllButton) {
        viewAllButton.addEventListener('click', (e) => {
            e.stopPropagation();
            viewAllNotifications();
        });
    }
    
    // Add event listener for notification items
    const notificationsList = document.getElementById('notificationsList');
    if (notificationsList) {
        notificationsList.addEventListener('click', (e) => {
            const notificationItem = e.target.closest('.notification-item');
            if (notificationItem) {
                const id = parseInt(notificationItem.dataset.id);
                markAsRead(id);
            }
        });
    }
}

// Toggle notifications panel
function toggleNotificationsPanel(e) {
    e.stopPropagation();
    const panel = document.getElementById('notifications-panel');
    if (panel) {
        if (notificationState.isOpen) {
            panel.style.display = 'none';
            notificationState.isOpen = false;
        } else {
            updateNotificationsList();
            panel.style.display = 'block';
            positionNotificationsPanel(panel);
            notificationState.isOpen = true;
        }
    }
}

// Position notifications panel near the trigger button
function positionNotificationsPanel(panel) {
    const triggerBtn = document.querySelector('.header-actions .header-action:first-child');
    if (triggerBtn && panel) {
        const rect = triggerBtn.getBoundingClientRect();
        panel.style.position = 'fixed';
        panel.style.top = `${rect.bottom + 5}px`;
        panel.style.right = `${window.innerWidth - rect.right}px`;
        panel.style.zIndex = 'var(--z-dropdown)';
        panel.style.minWidth = '350px';
    }
}

// Update notifications list
function updateNotificationsList() {
    const listElement = document.getElementById('notificationsList');
    if (!listElement) return;
    
    const unreadCount = notificationState.notifications.filter(n => !n.read).length;
    updateUnreadBadge(unreadCount);
    
    listElement.innerHTML = notificationState.notifications
        .map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon">
                    ${getNotificationIcon(notification.type)}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${formatTimeAgo(notification.timestamp)}</div>
                </div>
                ${!notification.read ? '<div class="notification-unread-dot"></div>' : ''}
            </div>
        `).join('');
}

// Get notification icon based on type
function getNotificationIcon(type) {
    const icons = {
        'reservation': '📅',
        'table': '🪑',
        'system': '⚙️',
        'payment': '💳',
        'user': '👤'
    };
    return icons[type] || '🔔';
}

// Format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const timeDiff = now - date;
    
    const minutes = Math.floor(timeDiff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

// Mark notification as read
function markAsRead(id) {
    const notification = notificationState.notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        updateNotificationsList();
    }
}

// Mark all notifications as read
function clearAllNotifications() {
    notificationState.notifications.forEach(notification => {
        notification.read = true;
    });
    updateNotificationsList();
}

// View all notifications
function viewAllNotifications() {
    window.location.href = '/notifications.html';
}

// Update unread badge
function updateUnreadBadge(count) {
    const badge = document.querySelector('.header-action:first-child .header-action-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Handle outside click to close notifications
function handleOutsideClick(e) {
    const panel = document.getElementById('notifications-panel');
    const triggerBtn = document.querySelector('.header-actions .header-action:first-child');
    
    if (panel && panel.style.display === 'block' && 
        !panel.contains(e.target) && 
        (!triggerBtn || !triggerBtn.contains(e.target))) {
        
        panel.style.display = 'none';
        notificationState.isOpen = false;
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // 'n' key to open notifications
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        const notificationsBtn = document.querySelector('.header-actions .header-action:first-child');
        if (notificationsBtn) {
            notificationsBtn.click();
        }
    }
}

export default {
    initDashboard,
    loadDashboardData,
    renderStats,
    initCharts
};
