/**
 * BRONLY - Reservations Page JavaScript
 * Using seed data for reservations management
 */

import { DataManager, renderUtils, simulateDelay, setErrorSimulation, getErrorSimulation, maybeThrowError } from './seed.js';
import { Toast, Modal, confirmDialog, createEmptyState, createStatsCard } from './components.js';
import { requireAuth, getUser } from './auth.js';
import { animateNumber, formatNumber, device } from './utils.js';

// Reservations state
const state = {
    reservations: [],
    filteredReservations: [],
    currentFilter: 'all',
    isLoading: true,
    userRole: null
};

// Initialize reservations page
export async function initReservations() {
    if (!requireAuth()) return;
    
    // Get user role
    const user = getUser();
    state.userRole = user?.role || 'restaurant_owner';
    
    setupEventListeners();
    
    // Load data
    await loadData();
    
    console.log('Reservations page initialized for role:', state.userRole);
}

// Load data using seed data
async function loadData() {
    try {
        state.isLoading = true;
        
        // Simulate loading delay
        await simulateDelay();
        
        // Maybe throw error for simulation
        maybeThrowError();
        
        // Load reservations from seed data
        state.reservations = DataManager.getReservations();
        state.filteredReservations = [...state.reservations];
        
        // Render reservations
        renderReservations(state.filteredReservations);
        
    } catch (error) {
        console.error('Failed to load reservations:', error);
        Toast.error('Failed to load reservations');
        
        // Show empty state
        showEmptyState();
    } finally {
        state.isLoading = false;
        hideLoadingIndicators();
    }
}

// Render reservations in table
function renderReservations(reservations) {
    const tbody = document.querySelector('#reservations-table tbody');
    if (!tbody) return;
    
    if (reservations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;">
                        <div style="font-size: 3rem;">📅</div>
                        <h3>No reservations found</h3>
                        <p style="color: var(--color-text-muted);">Try changing your filters or add a new reservation</p>
                        <button class="btn btn-primary" data-add-reservation>Add Reservation</button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = reservations.map(reservation => {
        const restaurant = getRestaurantById(reservation.restaurant_id);
        const table = getTableById(reservation.table_id);
        const customer = getCustomerById(reservation.customer_id);
        
        return `
            <tr data-id="${reservation.id}">
                <td>
                    <div class="reservation-guest">
                        <div class="reservation-guest-info">
                            <strong>${customer?.first_name} ${customer?.last_name || ''}</strong>
                            <small>${customer?.email}</small>
                        </div>
                    </div>
                </td>
                <td>${restaurant?.name || 'Unknown'}</td>
                <td>
                    <div>${renderUtils.formatDate(reservation.date)}</div>
                    <div>${renderUtils.formatTime(reservation.time)}</div>
                </td>
                <td>${reservation.party_size}</td>
                <td>${table?.number || 'TBD'}</td>
                <td>${renderUtils.formatStatus(reservation.status)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-ghost btn-sm" data-edit-reservation="${reservation.id}" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                            </svg>
                        </button>
                        <button class="btn btn-ghost btn-sm" data-delete-reservation="${reservation.id}" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Get restaurant by ID
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

// Get table by ID
function getTableById(id) {
    return DataManager.getTableById(id);
}

// Get customer by ID
function getCustomerById(id) {
    return DataManager.getCustomerById(id);
}

// Filter reservations
function filterReservations(filter) {
    state.currentFilter = filter;
    
    if (filter === 'all') {
        state.filteredReservations = [...state.reservations];
    } else {
        state.filteredReservations = state.reservations.filter(res => res.status === filter);
    }
    
    renderReservations(state.filteredReservations);
}

// Add new reservation
async function addReservation(reservationData) {
    try {
        // Simulate delay
        await simulateDelay();
        
        // Maybe throw error for simulation
        maybeThrowError();
        
        // Add reservation
        const newReservation = DataManager.addReservation(reservationData);
        
        // Update state
        state.reservations = DataManager.getReservations();
        filterReservations(state.currentFilter);
        
        Toast.success('Reservation added successfully');
        
        return newReservation;
    } catch (error) {
        console.error('Failed to add reservation:', error);
        Toast.error('Failed to add reservation');
        return null;
    }
}

// Update reservation
async function updateReservation(id, updates) {
    try {
        // Simulate delay
        await simulateDelay();
        
        // Maybe throw error for simulation
        maybeThrowError();
        
        // Update reservation
        const updatedReservation = DataManager.updateReservation(id, updates);
        
        if (updatedReservation) {
            // Update state
            state.reservations = DataManager.getReservations();
            filterReservations(state.currentFilter);
            
            Toast.success('Reservation updated successfully');
            return updatedReservation;
        } else {
            throw new Error('Reservation not found');
        }
    } catch (error) {
        console.error('Failed to update reservation:', error);
        Toast.error('Failed to update reservation');
        return null;
    }
}

// Delete reservation
async function deleteReservation(id) {
    try {
        // Confirm deletion
        const confirmed = await confirmDialog('Are you sure you want to delete this reservation?');
        if (!confirmed) return false;
        
        // Simulate delay
        await simulateDelay();
        
        // Maybe throw error for simulation
        maybeThrowError();
        
        // Delete reservation
        const deleted = DataManager.deleteReservation(id);
        
        if (deleted) {
            // Update state
            state.reservations = DataManager.getReservations();
            filterReservations(state.currentFilter);
            
            Toast.success('Reservation deleted successfully');
            return true;
        } else {
            throw new Error('Reservation not found');
        }
    } catch (error) {
        console.error('Failed to delete reservation:', error);
        Toast.error('Failed to delete reservation');
        return false;
    }
}

// Show empty state
function showEmptyState() {
    const tbody = document.querySelector('#reservations-table tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div style="font-size: 3rem; margin-bottom: 16px;">📋</div>
                        <h3>No Reservations</h3>
                        <p>There are currently no reservations to display.</p>
                        <button class="btn btn-primary" data-add-reservation>Add Reservation</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Hide loading indicators
function hideLoadingIndicators() {
    // Hide skeleton loaders if present
    document.querySelectorAll('.skeleton').forEach(el => el.remove());
}

// Setup event listeners
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', (e) => {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter reservations
            const filter = button.dataset.filter;
            filterReservations(filter);
        });
    });
    
    // Add reservation button
    document.querySelector('[data-add-reservation]')?.addEventListener('click', () => {
        openReservationModal();
    });
    
    // Edit reservation buttons (using event delegation)
    document.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-edit-reservation]');
        if (editBtn) {
            const id = editBtn.dataset.editReservation;
            openReservationModal(DataManager.getReservationById(parseInt(id)));
        }
        
        const deleteBtn = e.target.closest('[data-delete-reservation]');
        if (deleteBtn) {
            const id = deleteBtn.dataset.deleteReservation;
            deleteReservation(parseInt(id));
        }
    });
    
    // Search functionality
    const searchInput = document.querySelector('.table-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (!searchTerm) {
                state.filteredReservations = state.currentFilter === 'all' 
                    ? [...state.reservations] 
                    : state.reservations.filter(res => res.status === state.currentFilter);
            } else {
                state.filteredReservations = state.reservations.filter(res => {
                    const customer = getCustomerById(res.customer_id);
                    const restaurant = getRestaurantById(res.restaurant_id);
                    
                    return (
                        customer?.first_name.toLowerCase().includes(searchTerm) ||
                        customer?.last_name.toLowerCase().includes(searchTerm) ||
                        customer?.email.toLowerCase().includes(searchTerm) ||
                        restaurant?.name.toLowerCase().includes(searchTerm) ||
                        res.party_size.toString().includes(searchTerm)
                    );
                });
            }
            
            renderReservations(state.filteredReservations);
        });
    }
}

// Open reservation modal (simplified version)
function openReservationModal(reservation = null) {
    // Create a simple modal for adding/editing reservations
    const isEdit = !!reservation;
    const title = isEdit ? 'Edit Reservation' : 'Add Reservation';
    
    // For simplicity, we'll just log this action
    console.log(isEdit ? 'Editing reservation:' : 'Adding new reservation', reservation);
    
    // In a real implementation, this would open a modal form
    Toast.info(isEdit ? 'Edit functionality would open here' : 'Add reservation form would open here');
}

// Export default functions
export default {
    initReservations,
    loadData,
    renderReservations,
    filterReservations,
    addReservation,
    updateReservation,
    deleteReservation
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initReservations);

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