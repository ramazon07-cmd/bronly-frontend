/**
 * BRONLY - Restaurants JavaScript
 * CRUD operations for restaurants
 */

import { restaurantsAPI } from './api.js';
import { Toast, Modal, confirmDialog, createRestaurantCard, createFormGroup, createEmptyState, createPagination } from './components.js';
import { requireAuth } from './auth.js';
import { DataManager, renderUtils, simulateDelay, setErrorSimulation, getErrorSimulation, maybeThrowError } from './seed.js';

// State
const state = {
    restaurants: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    editingId: null,
    isLoading: false
};

// Initialize
export async function initRestaurants() {
    if (!requireAuth()) return;
    
    setupEventListeners();
    await loadRestaurants();
    
    console.log('Restaurants page initialized');
}

// Setup event listeners
function setupEventListeners() {
    // Add restaurant button
    const addBtn = document.querySelector('[data-add-restaurant]');
    if (addBtn) {
        addBtn.addEventListener('click', () => openModal());
    }
    
    // Search
    const searchInput = document.querySelector('.table-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            loadRestaurants(1, e.target.value);
        }, 300));
    }
}

// Load restaurants
async function loadRestaurants(page = 1, search = '') {
    state.isLoading = true;
    showLoading();
    
    try {
        // Simulate loading delay
        await simulateDelay();
        
        // Maybe throw error for simulation
        maybeThrowError();
        
        // Load restaurants from seed data
        let restaurants = [
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
        
        // Apply search filter
        if (search) {
            restaurants = restaurants.filter(restaurant => 
                restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
                restaurant.address.toLowerCase().includes(search.toLowerCase()) ||
                restaurant.description.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        state.restaurants = restaurants;
        state.totalItems = restaurants.length;
        state.totalPages = Math.ceil(state.totalItems / 10) || 1;
        state.currentPage = page;
        
        renderRestaurants();
        renderPagination();
    } catch (error) {
        console.error('Failed to load restaurants:', error);
        Toast.error('Failed to load restaurants');
        renderEmptyState();
    } finally {
        state.isLoading = false;
        hideLoading();
    }
}

// Show loading state
function showLoading() {
    const grid = document.querySelector('.cards-grid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="card skeleton" style="height: 200px;"></div>
        <div class="card skeleton" style="height: 200px;"></div>
        <div class="card skeleton" style="height: 200px;"></div>
    `;
}

// Hide loading state
function hideLoading() {
    document.querySelectorAll('.skeleton').forEach(el => el.remove());
}

// Render restaurants
function renderRestaurants() {
    const grid = document.querySelector('.cards-grid');
    if (!grid) return;
    
    if (!state.restaurants.length) {
        renderEmptyState();
        return;
    }
    
    grid.innerHTML = '';
    
    state.restaurants.forEach(restaurant => {
        const card = createRestaurantCard(
            restaurant,
            () => openModal(restaurant),
            () => handleDelete(restaurant)
        );
        grid.appendChild(card);
    });
}

// Render empty state
function renderEmptyState() {
    const grid = document.querySelector('.cards-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    grid.appendChild(createEmptyState({
        icon: '🏪',
        title: 'No restaurants yet',
        description: 'Add your first restaurant to start managing tables and reservations.',
        actionText: 'Add Restaurant',
        onAction: () => openModal()
    }));
}

// Render pagination
function renderPagination() {
    const container = document.querySelector('.table-pagination');
    if (!container || state.totalPages <= 1) return;
    
    const pagination = createPagination({
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalItems: state.totalItems,
        onPageChange: (page) => loadRestaurants(page)
    });
    
    container.innerHTML = '';
    container.appendChild(pagination);
}

// Open modal (add/edit)
function openModal(restaurant = null) {
    state.editingId = restaurant?.id || null;
    
    const isEdit = !!restaurant;
    const title = isEdit ? 'Edit Restaurant' : 'Add Restaurant';
    
    const content = `
        <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close">&times;</button>
        </div>
        <form id="restaurant-form">
            <div style="margin-bottom: 24px;">
                <label class="form-label">Restaurant Name *</label>
                <input type="text" class="form-input" name="name" required 
                    value="${restaurant?.name || ''}" placeholder="Enter restaurant name">
            </div>
            <div style="margin-bottom: 24px;">
                <label class="form-label">Address</label>
                <input type="text" class="form-input" name="address" 
                    value="${restaurant?.address || ''}" placeholder="Enter address">
            </div>
            <div style="margin-bottom: 24px;">
                <label class="form-label">Phone</label>
                <input type="tel" class="form-input" name="phone" 
                    value="${restaurant?.phone || ''}" placeholder="Enter phone number">
            </div>
            <div style="margin-bottom: 24px;">
                <label class="form-label">Description</label>
                <textarea class="form-input" name="description" rows="3" 
                    placeholder="Enter description">${restaurant?.description || ''}</textarea>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" class="btn btn-ghost" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Restaurant'}</button>
            </div>
        </form>
    `;
    
    const modal = Modal.open(content);
    
    // Form submission
    const form = modal.querySelector('#restaurant-form');
    form.addEventListener('submit', handleSubmit);
}

// Handle form submit
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        // Simulate delay
        await simulateDelay();
        
        // Maybe throw error for simulation
        maybeThrowError();
        
        if (state.editingId) {
            // For now, we'll just log the update since we're using static seed data
            console.log('Updating restaurant:', state.editingId, data);
            Toast.success('Restaurant updated successfully');
        } else {
            // For now, we'll just log the addition since we're using static seed data
            console.log('Adding restaurant:', data);
            Toast.success('Restaurant added successfully');
        }
        
        Modal.close();
        loadRestaurants(state.currentPage);
    } catch (error) {
        console.error('Failed to save restaurant:', error);
        Toast.error(error.message || 'Failed to save restaurant');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Handle delete
async function handleDelete(restaurant) {
    confirmDialog(
        `Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`,
        async () => {
            try {
                // Simulate delay
                await simulateDelay();
                
                // Maybe throw error for simulation
                maybeThrowError();
                
                // For now, we'll just log the deletion since we're using static seed data
                console.log('Deleting restaurant:', restaurant.id);
                Toast.success('Restaurant deleted');
                loadRestaurants(state.currentPage);
            } catch (error) {
                console.error('Failed to delete restaurant:', error);
                Toast.error('Failed to delete restaurant');
            }
        }
    );
}

// Utility debounce
function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', initRestaurants);

// Add logout functionality
const logoutBtn = document.querySelector('[data-logout]');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        // Import and use the logout function from auth.js
        const { logout } = await import('./auth.js');
        await logout();
    });
}

// Add sidebar toggle functionality
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

export default {
    initRestaurants,
    loadRestaurants,
    openModal,
    handleDelete
};
