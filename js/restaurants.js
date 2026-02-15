/**
 * BRONLY - Restaurants JavaScript
 * CRUD operations for restaurants
 */

import { restaurantsAPI } from './api.js';
import { Toast, Modal, confirmDialog, createRestaurantCard, createFormGroup, createEmptyState, createPagination } from './components.js';
import { requireAuth } from './auth.js';

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
        const response = await restaurantsAPI.getAll();
        state.restaurants = response.results || response;
        state.totalItems = response.count || state.restaurants.length;
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
        if (state.editingId) {
            await restaurantsAPI.update(state.editingId, data);
            Toast.success('Restaurant updated successfully');
        } else {
            await restaurantsAPI.create(data);
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
                await restaurantsAPI.delete(restaurant.id);
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

export default {
    initRestaurants,
    loadRestaurants,
    openModal,
    handleDelete
};
