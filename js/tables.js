/**
 * BRONLY - Tables JavaScript
 * Table management with restaurant selector
 */

import { tablesAPI, restaurantsAPI } from './api.js';
import { Toast, Modal, confirmDialog, createTableCard, createEmptyState, createPagination } from './components.js';
import { requireAuth } from './auth.js';

// State
const state = {
    tables: [],
    restaurants: [],
    selectedRestaurant: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    editingId: null,
    isLoading: false
};

// Initialize
export async function initTables() {
    if (!requireAuth()) return;
    
    await loadRestaurants();
    setupEventListeners();
    
    // Load tables for first restaurant
    if (state.restaurants.length > 0) {
        selectRestaurant(state.restaurants[0].id);
    }
    
    console.log('Tables page initialized');
}

// Setup event listeners
function setupEventListeners() {
    // Add table button
    const addBtn = document.querySelector('[data-add-table]');
    if (addBtn) {
        addBtn.addEventListener('click', () => openModal());
    }
    
    // Restaurant selector
    const selectorBtn = document.querySelector('.restaurant-selector-btn');
    const selector = document.querySelector('.restaurant-selector');
    
    if (selectorBtn && selector) {
        selectorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selector.classList.toggle('active');
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!selector.contains(e.target)) {
                selector.classList.remove('active');
            }
        });
    }
    
    // Search
    const searchInput = document.querySelector('.table-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            loadTables(state.selectedRestaurant, 1, e.target.value);
        }, 300));
    }
}

// Load restaurants for selector
async function loadRestaurants() {
    try {
        const response = await restaurantsAPI.getAll();
        state.restaurants = response.results || response;
        renderRestaurantSelector();
    } catch (error) {
        console.error('Failed to load restaurants:', error);
        Toast.error('Failed to load restaurants');
    }
}

// Render restaurant selector
function renderRestaurantSelector() {
    const container = document.querySelector('.restaurant-selector-dropdown');
    const btn = document.querySelector('.restaurant-selector-btn span');
    
    if (!container) return;
    
    if (!state.restaurants.length) {
        container.innerHTML = `
            <div class="restaurant-selector-item">
                <span>No restaurants</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.restaurants.map(r => `
        <div class="restaurant-selector-item" data-restaurant-id="${r.id}">
            <span>🏪</span>
            <span>${r.name}</span>
        </div>
    `).join('');
    
    // Add click handlers
    container.querySelectorAll('[data-restaurant-id]').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.restaurantId);
            selectRestaurant(id);
        });
    });
    
    // Update button text
    if (btn && state.selectedRestaurant) {
        const restaurant = state.restaurants.find(r => r.id === state.selectedRestaurant);
        if (restaurant) {
            btn.textContent = restaurant.name;
        }
    }
}

// Select restaurant
function selectRestaurant(id) {
    state.selectedRestaurant = id;
    
    // Update button text
    const btn = document.querySelector('.restaurant-selector-btn span');
    const restaurant = state.restaurants.find(r => r.id === id);
    if (btn && restaurant) {
        btn.textContent = restaurant.name;
    }
    
    // Close dropdown
    document.querySelector('.restaurant-selector')?.classList.remove('active');
    
    // Load tables
    loadTables(id);
}

// Load tables
async function loadTables(restaurantId, page = 1, search = '') {
    if (!restaurantId) return;
    
    state.isLoading = true;
    showLoading();
    
    try {
        const response = await tablesAPI.getAll(restaurantId);
        state.tables = response.results || response;
        state.totalItems = response.count || state.tables.length;
        state.totalPages = Math.ceil(state.totalItems / 10) || 1;
        state.currentPage = page;
        
        renderTables();
        renderPagination();
    } catch (error) {
        console.error('Failed to load tables:', error);
        Toast.error('Failed to load tables');
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
        <div class="card skeleton" style="height: 200px;"></div>
    `;
}

// Hide loading state
function hideLoading() {
    document.querySelectorAll('.skeleton').forEach(el => el.remove());
}

// Render tables
function renderTables() {
    const grid = document.querySelector('.cards-grid');
    if (!grid) return;
    
    if (!state.tables.length) {
        renderEmptyState();
        return;
    }
    
    grid.innerHTML = '';
    
    state.tables.forEach(table => {
        const card = createTableCard(
            table,
            () => openModal(table),
            () => handleDelete(table)
        );
        grid.appendChild(card);
    });
}

// Render empty state
function renderEmptyState() {
    const grid = document.querySelector('.cards-grid');
    if (!grid) return;
    
    const restaurant = state.restaurants.find(r => r.id === state.selectedRestaurant);
    
    grid.innerHTML = '';
    grid.appendChild(createEmptyState({
        icon: '🪑',
        title: 'No tables yet',
        description: restaurant 
            ? `Add tables to ${restaurant.name} to start taking reservations.`
            : 'Select a restaurant and add tables to start.',
        actionText: 'Add Table',
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
        onPageChange: (page) => loadTables(state.selectedRestaurant, page)
    });
    
    container.innerHTML = '';
    container.appendChild(pagination);
}

// Open modal (add/edit)
function openModal(table = null) {
    if (!state.selectedRestaurant && !table) {
        Toast.error('Please select a restaurant first');
        return;
    }
    
    state.editingId = table?.id || null;
    
    const isEdit = !!table;
    const title = isEdit ? 'Edit Table' : 'Add Table';
    
    const content = `
        <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close">&times;</button>
        </div>
        <form id="table-form">
            ${!isEdit ? `
                <input type="hidden" name="restaurant" value="${state.selectedRestaurant}">
            ` : ''}
            <div style="margin-bottom: 24px;">
                <label class="form-label">Table Number *</label>
                <input type="text" class="form-input" name="number" required 
                    value="${table?.number || ''}" placeholder="e.g., A1, 12">
            </div>
            <div style="margin-bottom: 24px;">
                <label class="form-label">Capacity *</label>
                <input type="number" class="form-input" name="capacity" required min="1" max="50"
                    value="${table?.capacity || '4'}" placeholder="Number of seats">
            </div>
            <div style="margin-bottom: 24px;">
                <label class="form-label">Status</label>
                <select class="form-input" name="status">
                    <option value="available" ${table?.status === 'available' ? 'selected' : ''}>Available</option>
                    <option value="occupied" ${table?.status === 'occupied' ? 'selected' : ''}>Occupied</option>
                    <option value="reserved" ${table?.status === 'reserved' ? 'selected' : ''}>Reserved</option>
                    <option value="maintenance" ${table?.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                </select>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" class="btn btn-ghost" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Table'}</button>
            </div>
        </form>
    `;
    
    const modal = Modal.open(content);
    
    // Form submission
    const form = modal.querySelector('#table-form');
    form.addEventListener('submit', handleSubmit);
}

// Handle form submit
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Convert capacity to number
    data.capacity = parseInt(data.capacity);
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        if (state.editingId) {
            await tablesAPI.update(state.editingId, data);
            Toast.success('Table updated successfully');
        } else {
            await tablesAPI.create(data);
            Toast.success('Table added successfully');
        }
        
        Modal.close();
        loadTables(state.selectedRestaurant, state.currentPage);
    } catch (error) {
        console.error('Failed to save table:', error);
        Toast.error(error.message || 'Failed to save table');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Handle delete
async function handleDelete(table) {
    confirmDialog(
        `Are you sure you want to delete Table ${table.number}?`,
        async () => {
            try {
                await tablesAPI.delete(table.id);
                Toast.success('Table deleted');
                loadTables(state.selectedRestaurant, state.currentPage);
            } catch (error) {
                console.error('Failed to delete table:', error);
                Toast.error('Failed to delete table');
            }
        }
    );
}

// Quick status update
async function updateStatus(tableId, status) {
    try {
        await tablesAPI.updateStatus(tableId, status);
        Toast.success('Status updated');
        loadTables(state.selectedRestaurant, state.currentPage);
    } catch (error) {
        console.error('Failed to update status:', error);
        Toast.error('Failed to update status');
    }
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
document.addEventListener('DOMContentLoaded', initTables);

export default {
    initTables,
    loadTables,
    selectRestaurant,
    openModal,
    handleDelete,
    updateStatus
};
