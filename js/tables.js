/**
 * BRONLY - Tables Page JavaScript
 * Using seed data for tables management
 */

import { DataManager, renderUtils, simulateDelay, setErrorSimulation, getErrorSimulation, maybeThrowError } from './seed.js';
import { Toast, Modal, confirmDialog, createEmptyState, createStatsCard } from './components.js';
import { requireAuth, getUser } from './auth.js';
import { animateNumber, formatNumber, device } from './utils.js';

// Tables state
const state = {
    tables: [],
    filteredTables: [],
    currentFilter: 'all',
    isLoading: true,
    userRole: null
};

// Initialize tables page
export async function initTables() {
    if (!requireAuth()) return;
    
    // Get user role
    const user = getUser();
    state.userRole = user?.role || 'restaurant_owner';
    
    setupEventListeners();
    
    // Load data
    await loadData();
    
    console.log('Tables page initialized for role:', state.userRole);
}

// Load data using seed data
async function loadData() {
    try {
        state.isLoading = true;
        
        // Simulate loading delay
        await simulateDelay();
        
        // Maybe throw error for simulation
        maybeThrowError();
        
        // Load tables from seed data
        state.tables = DataManager.getTables();
        state.filteredTables = [...state.tables];
        
        // Render tables
        renderTables(state.filteredTables);
        
    } catch (error) {
        console.error('Failed to load tables:', error);
        Toast.error('Failed to load tables');
        
        // Show empty state
        showEmptyState();
    } finally {
        state.isLoading = false;
        hideLoadingIndicators();
    }
}

// Render tables in grid
function renderTables(tables) {
    const container = document.querySelector('.tables-grid') || document.querySelector('.table-wrapper');
    if (!container) return;
    
    if (tables.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px;">
                <div style="font-size: 3rem; margin-bottom: 16px;">🪑</div>
                <h3>No tables found</h3>
                <p style="color: var(--color-text-muted);">Try changing your filters or add a new table</p>
                <button class="btn btn-primary" data-add-table>Add Table</button>
            </div>
        `;
        return;
    }
    
    // If it's a table wrapper, render as table
    if (container.classList.contains('table-wrapper')) {
        const table = document.createElement('table');
        table.className = 'data-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Table #</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Section</th>
                    <th>Current Guests</th>
                    <th>Restaurant</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tables.map(tableData => {
                    const restaurant = getRestaurantById(tableData.restaurant_id);
                    return `
                        <tr data-id="${tableData.id}">
                            <td><strong>${tableData.number}</strong></td>
                            <td>${tableData.capacity}</td>
                            <td>${renderStatusBadge(tableData.status)}</td>
                            <td>${tableData.section}</td>
                            <td>${tableData.current_guests}</td>
                            <td>${restaurant?.name || 'Unknown'}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn btn-ghost btn-sm" data-edit-table="${tableData.id}" title="Edit">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                        </svg>
                                    </button>
                                    <button class="btn btn-ghost btn-sm" data-delete-table="${tableData.id}" title="Delete">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        container.innerHTML = '';
        container.appendChild(table);
    } else {
        // Otherwise render as grid
        container.innerHTML = tables.map(tableData => {
            const restaurant = getRestaurantById(tableData.restaurant_id);
            return `
                <div class="table-card ${tableData.status}" data-id="${tableData.id}">
                    <div class="table-header">
                        <h3 class="table-number">${tableData.number}</h3>
                        <span class="table-status ${tableData.status}">${tableData.status}</span>
                    </div>
                    <div class="table-info">
                        <div class="table-capacity">Capacity: ${tableData.capacity}</div>
                        <div class="table-section">Section: ${tableData.section}</div>
                        <div class="table-guests">Guests: ${tableData.current_guests}</div>
                        <div class="table-restaurant">Restaurant: ${restaurant?.name || 'Unknown'}</div>
                    </div>
                    <div class="table-actions">
                        <button class="btn btn-ghost" data-edit-table="${tableData.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                            </svg>
                            Edit
                        </button>
                        <button class="btn btn-danger" data-delete-table="${tableData.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Render status badge
function renderStatusBadge(status) {
    const statusClasses = {
        available: 'badge-success',
        occupied: 'badge-warning',
        reserved: 'badge-primary',
        maintenance: 'badge-error'
    };

    return `
        <span class="badge ${statusClasses[status] || 'badge-ghost'}">
            ${status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    `;
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

// Filter tables
function filterTables(filter) {
    state.currentFilter = filter;
    
    if (filter === 'all') {
        state.filteredTables = [...state.tables];
    } else {
        state.filteredTables = state.tables.filter(table => table.status === filter);
    }
    
    renderTables(state.filteredTables);
}

// Add new table
async function addTable(tableData) {
    try {
        // Simulate delay
        await simulateDelay();
        
        // Maybe throw error for simulation
        maybeThrowError();
        
        // Add table
        const newTable = DataManager.addTable(tableData);
        
        // Update state
        state.tables = DataManager.getTables();
        filterTables(state.currentFilter);
        
        Toast.success('Table added successfully');
        
        return newTable;
    } catch (error) {
        console.error('Failed to add table:', error);
        Toast.error('Failed to add table');
        return null;
    }
}

// Update table
async function updateTable(id, updates) {
    try {
        // Simulate delay
        await simulateDelay();
        
        // Maybe throw error for simulation
        maybeThrowError();
        
        // Update table
        const updatedTable = DataManager.updateTable(id, updates);
        
        if (updatedTable) {
            // Update state
            state.tables = DataManager.getTables();
            filterTables(state.currentFilter);
            
            Toast.success('Table updated successfully');
            return updatedTable;
        } else {
            throw new Error('Table not found');
        }
    } catch (error) {
        console.error('Failed to update table:', error);
        Toast.error('Failed to update table');
        return null;
    }
}

// Delete table
async function deleteTable(id) {
    try {
        // Confirm deletion
        const confirmed = await confirmDialog('Are you sure you want to delete this table?');
        if (!confirmed) return false;
        
        // Simulate delay
        await simulateDelay();
        
        // Maybe throw error for simulation
        maybeThrowError();
        
        // Delete table
        const deleted = DataManager.deleteTable(id);
        
        if (deleted) {
            // Update state
            state.tables = DataManager.getTables();
            filterTables(state.currentFilter);
            
            Toast.success('Table deleted successfully');
            return true;
        } else {
            throw new Error('Table not found');
        }
    } catch (error) {
        console.error('Failed to delete table:', error);
        Toast.error('Failed to delete table');
        return false;
    }
}

// Change table status
async function changeTableStatus(id, newStatus) {
    try {
        // Simulate delay
        await simulateDelay();
        
        // Maybe throw error for simulation
        maybeThrowError();
        
        // Update table status
        const updatedTable = DataManager.updateTable(id, { status: newStatus });
        
        if (updatedTable) {
            // Update state
            state.tables = DataManager.getTables();
            filterTables(state.currentFilter);
            
            Toast.success(`Table status changed to ${newStatus}`);
            return updatedTable;
        } else {
            throw new Error('Table not found');
        }
    } catch (error) {
        console.error('Failed to change table status:', error);
        Toast.error('Failed to change table status');
        return null;
    }
}

// Show empty state
function showEmptyState() {
    const container = document.querySelector('.tables-grid') || document.querySelector('.table-wrapper');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 3rem; margin-bottom: 16px;">🪑</div>
                <h3>No Tables</h3>
                <p>There are currently no tables to display.</p>
                <button class="btn btn-primary" data-add-table>Add Table</button>
            </div>
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
            
            // Filter tables
            const filter = button.dataset.filter;
            filterTables(filter);
        });
    });
    
    // Add table button
    document.querySelector('[data-add-table]')?.addEventListener('click', () => {
        openTableModal();
    });
    
    // Edit table buttons (using event delegation)
    document.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-edit-table]');
        if (editBtn) {
            const id = editBtn.dataset.editTable;
            openTableModal(DataManager.getTableById(parseInt(id)));
        }
        
        const deleteBtn = e.target.closest('[data-delete-table]');
        if (deleteBtn) {
            const id = deleteBtn.dataset.deleteTable;
            deleteTable(parseInt(id));
        }
    });
    
    // Search functionality
    const searchInput = document.querySelector('.table-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            if (!searchTerm) {
                state.filteredTables = state.currentFilter === 'all' 
                    ? [...state.tables] 
                    : state.tables.filter(table => table.status === state.currentFilter);
            } else {
                state.filteredTables = state.tables.filter(table => {
                    const restaurant = getRestaurantById(table.restaurant_id);
                    
                    return (
                        table.number.toLowerCase().includes(searchTerm) ||
                        table.section.toLowerCase().includes(searchTerm) ||
                        restaurant?.name.toLowerCase().includes(searchTerm) ||
                        table.capacity.toString().includes(searchTerm)
                    );
                });
            }
            
            renderTables(state.filteredTables);
        });
    }
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

// Open table modal (simplified version)
function openTableModal(table = null) {
    // Create a simple modal for adding/editing tables
    const isEdit = !!table;
    const title = isEdit ? 'Edit Table' : 'Add Table';
    
    // For simplicity, we'll just log this action
    console.log(isEdit ? 'Editing table:' : 'Adding new table', table);
    
    // In a real implementation, this would open a modal form
    Toast.info(isEdit ? 'Edit functionality would open here' : 'Add table form would open here');
}

// Export default functions
export default {
    initTables,
    loadData,
    renderTables,
    filterTables,
    addTable,
    updateTable,
    deleteTable,
    changeTableStatus
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initTables);

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