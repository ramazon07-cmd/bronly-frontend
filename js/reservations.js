/**
 * BRONLY - Reservations JavaScript
 * Reservation management with filtering and CRUD
 */

import { reservationsAPI, restaurantsAPI } from './api.js';
import { Toast, Modal, confirmDialog, createEmptyState, createPagination } from './components.js';
import { requireAuth, getUser } from './auth.js';

// State
const state = {
    reservations: [],
    restaurants: [],
    selectedRestaurant: null,
    currentFilter: 'all',
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    editingId: null,
    isLoading: false
};

// Initialize
export async function initReservations() {
    if (!requireAuth()) return;

    await loadRestaurants();
    setupEventListeners();

    // Load all reservations initially
    await loadReservations();

    console.log('Reservations page initialized');
}

// Setup event listeners
function setupEventListeners() {
    // Add reservation button
    const addBtn = document.querySelector('[data-add-reservation]');
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

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFilter = btn.dataset.filter;
            loadReservations(state.selectedRestaurant, 1);
        });
    });

    // Search
    const searchInput = document.querySelector('.table-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            loadReservations(state.selectedRestaurant, 1, e.target.value);
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

    let html = `
        <div class="restaurant-selector-item" data-restaurant-id="all">
            <span>🏪</span>
            <span>All Restaurants</span>
        </div>
    `;

    if (state.restaurants.length) {
        html += state.restaurants.map(r => `
            <div class="restaurant-selector-item" data-restaurant-id="${r.id}">
                <span>🏪</span>
                <span>${r.name}</span>
            </div>
        `).join('');
    }

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('[data-restaurant-id]').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.restaurantId;
            if (id === 'all') {
                selectRestaurant(null);
            } else {
                selectRestaurant(parseInt(id));
            }
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
    if (btn) {
        if (id) {
            const restaurant = state.restaurants.find(r => r.id === id);
            btn.textContent = restaurant ? restaurant.name : 'Select Restaurant';
        } else {
            btn.textContent = 'All Restaurants';
        }
    }

    // Close dropdown
    document.querySelector('.restaurant-selector')?.classList.remove('active');

    // Load reservations
    loadReservations(id);
}

// Load reservations
async function loadReservations(restaurantId = null, page = 1, search = '') {
    state.isLoading = true;
    showLoading();

    try {
        const params = {};
        if (restaurantId) {
            params.restaurant_id = restaurantId;
        }
        if (state.currentFilter !== 'all') {
            params.status = state.currentFilter;
        }

        const response = await reservationsAPI.getAll(params);
        state.reservations = response.results || response;

        // Apply search filter if provided
        if (search) {
            const searchLower = search.toLowerCase();
            state.reservations = state.reservations.filter(r =>
                r.customer_name.toLowerCase().includes(searchLower) ||
                r.customer_email.toLowerCase().includes(searchLower)
            );
        }

        state.totalItems = state.reservations.length;
        state.totalPages = Math.ceil(state.totalItems / 10) || 1;
        state.currentPage = page;

        renderReservations();
        renderPagination();
    } catch (error) {
        console.error('Failed to load reservations:', error);
        Toast.error('Failed to load reservations');
        renderEmptyState();
    } finally {
        state.isLoading = false;
        hideLoading();
    }
}

// Show loading state
function showLoading() {
    const tbody = document.querySelector('#reservations-table tbody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px;">
                <div class="skeleton" style="height: 20px; width: 100%; margin-bottom: 10px;"></div>
                <div class="skeleton" style="height: 20px; width: 90%; margin-bottom: 10px;"></div>
                <div class="skeleton" style="height: 20px; width: 95%;"></div>
            </td>
        </tr>
    `;
}

// Hide loading state
function hideLoading() {
    document.querySelectorAll('.skeleton').forEach(el => el.remove());
}

// Get restaurant name
function getRestaurantName(restaurantId) {
    const restaurant = state.restaurants.find(r => r.id === restaurantId);
    return restaurant ? restaurant.name : 'Unknown Restaurant';
}

// Get status badge class
function getStatusBadgeClass(status) {
    const classes = {
        'confirmed': 'badge-primary',
        'seated': 'badge-success',
        'completed': 'badge-ghost',
        'cancelled': 'badge-error',
        'no-show': 'badge-warning'
    };
    return classes[status] || 'badge-ghost';
}

// Render reservations
function renderReservations() {
    const tbody = document.querySelector('#reservations-table tbody');
    if (!tbody) return;

    if (!state.reservations.length) {
        renderEmptyState();
        return;
    }

    tbody.innerHTML = state.reservations.map(reservation => `
        <tr>
            <td>
                <div class="table-cell-info">
                    <div class="table-cell-avatar">${reservation.customer_name.charAt(0)}</div>
                    <div class="table-cell-text">
                        <div class="table-cell-title">${reservation.customer_name}</div>
                        <div class="table-cell-subtitle">${reservation.customer_phone || reservation.customer_email}</div>
                    </div>
                </div>
            </td>
            <td>${getRestaurantName(reservation.restaurant_id)}</td>
            <td>
                <div class="table-cell-text">
                    <div class="table-cell-title">${reservation.date}</div>
                    <div class="table-cell-subtitle">${reservation.time}</div>
                </div>
            </td>
            <td>${reservation.party_size} guests</td>
            <td>Table ${reservation.table_id}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(reservation.status)}">${reservation.status}</span>
            </td>
            <td>
                <div class="table-actions-cell">
                    <button class="table-action-btn" onclick="window.updateReservationStatus(${reservation.id}, 'seated')" title="Mark as Seated">
                        🪑
                    </button>
                    <button class="table-action-btn" onclick="window.updateReservationStatus(${reservation.id}, 'completed')" title="Mark as Completed">
                        ✅
                    </button>
                    <button class="table-action-btn" onclick="window.editReservation(${reservation.id})" title="Edit">
                        ✏️
                    </button>
                    <button class="table-action-btn delete" onclick="window.deleteReservation(${reservation.id})" title="Delete">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Render empty state
function renderEmptyState() {
    const tbody = document.querySelector('#reservations-table tbody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 3rem; margin-bottom: 16px;">📅</div>
                <h3 style="margin-bottom: 8px;">No reservations found</h3>
                <p style="color: var(--color-text-muted); margin-bottom: 24px;">
                    ${state.currentFilter !== 'all'
                        ? `No ${state.currentFilter} reservations for this filter.`
                        : 'Add your first reservation to get started.'}
                </p>
                <button class="btn btn-primary" onclick="window.openReservationModal()">
                    Add Reservation
                </button>
            </td>
        </tr>
    `;
}

// Render pagination
function renderPagination() {
    const container = document.querySelector('.table-pagination');
    if (!container || state.totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    const pagination = createPagination({
        currentPage: state.currentPage,
        totalPages: state.totalPages,
        totalItems: state.totalItems,
        onPageChange: (page) => loadReservations(state.selectedRestaurant, page)
    });

    container.innerHTML = '';
    container.appendChild(pagination);
}

// Open modal (add/edit)
function openModal(reservation = null) {
    state.editingId = reservation?.id || null;

    const isEdit = !!reservation;
    const title = isEdit ? 'Edit Reservation' : 'Add Reservation';

    const restaurantOptions = state.restaurants.map(r =>
        `<option value="${r.id}" ${reservation?.restaurant_id === r.id ? 'selected' : ''}>${r.name}</option>`
    ).join('');

    const content = `
        <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close">&times;</button>
        </div>
        <form id="reservation-form">
            <div style="margin-bottom: 20px;">
                <label class="form-label">Restaurant *</label>
                <select class="form-input" name="restaurant_id" required>
                    <option value="">Select Restaurant</option>
                    ${restaurantOptions}
                </select>
            </div>
            <div style="margin-bottom: 20px;">
                <label class="form-label">Guest Name *</label>
                <input type="text" class="form-input" name="customer_name" required
                    value="${reservation?.customer_name || ''}" placeholder="Guest name">
            </div>
            <div style="margin-bottom: 20px;">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" name="customer_email"
                    value="${reservation?.customer_email || ''}" placeholder="guest@example.com">
            </div>
            <div style="margin-bottom: 20px;">
                <label class="form-label">Phone</label>
                <input type="tel" class="form-input" name="customer_phone"
                    value="${reservation?.customer_phone || ''}" placeholder="+1 (555) 000-0000">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div>
                    <label class="form-label">Date *</label>
                    <input type="date" class="form-input" name="date" required
                        value="${reservation?.date || new Date().toISOString().split('T')[0]}">
                </div>
                <div>
                    <label class="form-label">Time *</label>
                    <input type="time" class="form-input" name="time" required
                        value="${reservation?.time || '19:00'}">
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <label class="form-label">Party Size *</label>
                <input type="number" class="form-input" name="party_size" required min="1" max="50"
                    value="${reservation?.party_size || '2'}" placeholder="Number of guests">
            </div>
            <div style="margin-bottom: 20px;">
                <label class="form-label">Table ID</label>
                <input type="number" class="form-input" name="table_id"
                    value="${reservation?.table_id || ''}" placeholder="Table number">
            </div>
            <div style="margin-bottom: 20px;">
                <label class="form-label">Status</label>
                <select class="form-input" name="status">
                    <option value="confirmed" ${reservation?.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="seated" ${reservation?.status === 'seated' ? 'selected' : ''}>Seated</option>
                    <option value="completed" ${reservation?.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${reservation?.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
            <div style="margin-bottom: 24px;">
                <label class="form-label">Special Requests</label>
                <textarea class="form-input" name="special_requests" rows="2" placeholder="Any special requests or notes...">${reservation?.special_requests || ''}</textarea>
            </div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" class="btn btn-ghost" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Reservation'}</button>
            </div>
        </form>
    `;

    const modal = Modal.open(content);

    // Form submission
    const form = modal.querySelector('#reservation-form');
    form.addEventListener('submit', handleSubmit);
}

// Handle form submit
async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Convert numeric fields
    data.restaurant_id = parseInt(data.restaurant_id);
    data.table_id = data.table_id ? parseInt(data.table_id) : null;
    data.party_size = parseInt(data.party_size);

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        if (state.editingId) {
            await reservationsAPI.update(state.editingId, data);
            Toast.success('Reservation updated successfully');
        } else {
            await reservationsAPI.create(data);
            Toast.success('Reservation added successfully');
        }

        Modal.close();
        loadReservations(state.selectedRestaurant, state.currentPage);
    } catch (error) {
        console.error('Failed to save reservation:', error);
        Toast.error(error.message || 'Failed to save reservation');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Update reservation status
async function updateStatus(id, status) {
    try {
        await reservationsAPI.update(id, { status });
        Toast.success(`Reservation marked as ${status}`);
        loadReservations(state.selectedRestaurant, state.currentPage);
    } catch (error) {
        console.error('Failed to update status:', error);
        Toast.error('Failed to update status');
    }
}

// Edit reservation
async function editReservation(id) {
    const reservation = state.reservations.find(r => r.id === id);
    if (reservation) {
        openModal(reservation);
    }
}

// Delete reservation
async function deleteReservation(id) {
    confirmDialog(
        'Are you sure you want to delete this reservation? This action cannot be undone.',
        async () => {
            try {
                await reservationsAPI.delete(id);
                Toast.success('Reservation deleted');
                loadReservations(state.selectedRestaurant, state.currentPage);
            } catch (error) {
                console.error('Failed to delete reservation:', error);
                Toast.error('Failed to delete reservation');
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

// Expose functions to window for inline onclick handlers
window.updateReservationStatus = updateStatus;
window.editReservation = editReservation;
window.deleteReservation = deleteReservation;
window.openReservationModal = openModal;

// Auto-initialize
document.addEventListener('DOMContentLoaded', initReservations);

export default {
    initReservations,
    loadReservations,
    selectRestaurant,
    openModal,
    updateStatus,
    editReservation,
    deleteReservation
};
