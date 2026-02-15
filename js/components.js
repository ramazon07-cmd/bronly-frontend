/**
 * BRONLY - UI Components
 * Reusable component builders
 */

import { generateId, formatDate, capitalize } from './utils.js';

// Toast notification system
export const Toast = {
    container: null,
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 5000) {
        this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return toast;
    },
    
    success(message, duration) {
        return this.show(message, 'success', duration);
    },
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    },
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
};

// Modal system
export const Modal = {
    activeModal: null,
    backdrop: null,
    
    init() {
        if (!this.backdrop) {
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'modal-backdrop';
            document.body.appendChild(this.backdrop);
            
            this.backdrop.addEventListener('click', () => this.close());
        }
    },
    
    open(content, options = {}) {
        this.init();
        
        const id = generateId();
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = `modal-${id}`;
        modal.innerHTML = content;
        
        document.body.appendChild(modal);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Show backdrop and modal
        requestAnimationFrame(() => {
            this.backdrop.classList.add('active');
            modal.classList.add('active');
        });
        
        this.activeModal = modal;
        
        // Close on escape
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
        
        // Close button
        const closeBtn = modal.querySelector('.modal-close, [data-close-modal]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        return modal;
    },
    
    close() {
        if (!this.activeModal) return;
        
        this.backdrop.classList.remove('active');
        this.activeModal.classList.remove('active');
        
        setTimeout(() => {
            this.activeModal.remove();
            this.activeModal = null;
            document.body.style.overflow = '';
        }, 300);
    }
};

// Confirm dialog
export function confirmDialog(message, onConfirm, onCancel) {
    const content = `
        <div class="modal-header">
            <h3>Confirm Action</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div style="margin-bottom: 24px;">
            <p style="color: var(--color-text-secondary);">${message}</p>
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="btn btn-ghost" data-close-modal>Cancel</button>
            <button class="btn btn-primary" id="confirm-btn">Confirm</button>
        </div>
    `;
    
    const modal = Modal.open(content);
    
    const confirmBtn = modal.querySelector('#confirm-btn');
    confirmBtn.addEventListener('click', () => {
        Modal.close();
        if (onConfirm) onConfirm();
    });
    
    const cancelBtn = modal.querySelector('[data-close-modal]');
    cancelBtn.addEventListener('click', () => {
        if (onCancel) onCancel();
    });
}

// Loading skeleton
export function createSkeleton(type = 'text', count = 1) {
    const wrapper = document.createElement('div');
    
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton';
        
        switch (type) {
            case 'text':
                skeleton.style.height = '16px';
                skeleton.style.width = `${Math.random() * 40 + 60}%`;
                skeleton.style.marginBottom = '8px';
                break;
            case 'title':
                skeleton.style.height = '24px';
                skeleton.style.width = '200px';
                skeleton.style.marginBottom = '16px';
                break;
            case 'avatar':
                skeleton.style.width = '40px';
                skeleton.style.height = '40px';
                skeleton.style.borderRadius = '50%';
                break;
            case 'card':
                skeleton.style.height = '200px';
                skeleton.style.borderRadius = '12px';
                break;
            case 'circle':
                skeleton.style.width = '48px';
                skeleton.style.height = '48px';
                skeleton.style.borderRadius = '50%';
                break;
        }
        
        wrapper.appendChild(skeleton);
    }
    
    return wrapper;
}

// Create badge
export function createBadge(text, type = 'primary') {
    const badge = document.createElement('span');
    badge.className = `badge badge-${type}`;
    badge.textContent = text;
    return badge;
}

// Create button
export function createButton(text, options = {}) {
    const {
        variant = 'primary',
        size = 'md',
        icon = null,
        onClick = null,
        className = '',
        type = 'button'
    } = options;
    
    const button = document.createElement('button');
    button.type = type;
    button.className = `btn btn-${variant} btn-${size} ${className}`;
    
    if (icon) {
        button.innerHTML = `<span>${icon}</span><span>${text}</span>`;
    } else {
        button.textContent = text;
    }
    
    if (onClick) {
        button.addEventListener('click', onClick);
    }
    
    return button;
}

// Create card
export function createCard(options = {}) {
    const {
        title = '',
        subtitle = '',
        content = '',
        footer = '',
        className = ''
    } = options;
    
    const card = document.createElement('div');
    card.className = `card ${className}`;
    
    let html = '';
    
    if (title) {
        html += `<h3 class="card-title">${title}</h3>`;
    }
    
    if (subtitle) {
        html += `<p class="card-subtitle">${subtitle}</p>`;
    }
    
    if (content) {
        html += `<div class="card-content">${content}</div>`;
    }
    
    if (footer) {
        html += `<div class="card-footer">${footer}</div>`;
    }
    
    card.innerHTML = html;
    return card;
}

// Create form group
export function createFormGroup(options = {}) {
    const {
        label = '',
        type = 'text',
        name = '',
        placeholder = '',
        value = '',
        required = false,
        floating = false,
        options: selectOptions = []
    } = options;
    
    const group = document.createElement('div');
    group.className = 'form-group';
    
    if (floating) {
        group.classList.add('form-floating');
        group.innerHTML = `
            <input 
                type="${type}" 
                class="form-input" 
                id="${name}" 
                name="${name}" 
                placeholder=" "
                value="${value}"
                ${required ? 'required' : ''}
            >
            <label class="form-label" for="${name}">${label}</label>
        `;
    } else if (type === 'select') {
        const optionsHtml = selectOptions.map(opt => 
            `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`
        ).join('');
        
        group.innerHTML = `
            <label class="form-label" for="${name}">${label}</label>
            <select class="form-input" id="${name}" name="${name}" ${required ? 'required' : ''}>
                ${optionsHtml}
            </select>
        `;
    } else if (type === 'textarea') {
        group.innerHTML = `
            <label class="form-label" for="${name}">${label}</label>
            <textarea 
                class="form-input" 
                id="${name}" 
                name="${name}" 
                placeholder="${placeholder}"
                rows="4"
                ${required ? 'required' : ''}
            >${value}</textarea>
        `;
    } else {
        group.innerHTML = `
            <label class="form-label" for="${name}">${label}</label>
            <input 
                type="${type}" 
                class="form-input" 
                id="${name}" 
                name="${name}" 
                placeholder="${placeholder}"
                value="${value}"
                ${required ? 'required' : ''}
            >
        `;
    }
    
    return group;
}

// Create empty state
export function createEmptyState(options = {}) {
    const {
        icon = '📦',
        title = 'No items found',
        description = 'Get started by creating your first item.',
        actionText = 'Create Item',
        onAction = null
    } = options;
    
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
        <div class="empty-state-icon">${icon}</div>
        <h3 class="empty-state-title">${title}</h3>
        <p class="empty-state-description">${description}</p>
    `;
    
    if (onAction) {
        const btn = createButton(actionText, {
            variant: 'primary',
            onClick: onAction
        });
        emptyState.appendChild(btn);
    }
    
    return emptyState;
}

// Create pagination
export function createPagination(options = {}) {
    const {
        currentPage = 1,
        totalPages = 1,
        totalItems = 0,
        onPageChange = () => {}
    } = options;
    
    const container = document.createElement('div');
    container.className = 'table-pagination';
    
    const startItem = (currentPage - 1) * 10 + 1;
    const endItem = Math.min(currentPage * 10, totalItems);
    
    container.innerHTML = `
        <div class="pagination-info">
            Showing ${startItem} to ${endItem} of ${totalItems} results
        </div>
        <div class="pagination-controls">
            <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                Previous
            </button>
            ${generatePageButtons(currentPage, totalPages)}
            <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                Next
            </button>
        </div>
    `;
    
    container.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = parseInt(btn.dataset.page);
            onPageChange(page);
        });
    });
    
    return container;
}

function generatePageButtons(current, total) {
    let buttons = '';
    const maxButtons = 5;
    
    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = Math.min(total, start + maxButtons - 1);
    
    if (end - start < maxButtons - 1) {
        start = Math.max(1, end - maxButtons + 1);
    }
    
    for (let i = start; i <= end; i++) {
        buttons += `
            <button class="pagination-btn ${i === current ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }
    
    return buttons;
}

// Create restaurant card
export function createRestaurantCard(restaurant, onEdit, onDelete) {
    const card = document.createElement('div');
    card.className = 'card-dashboard';
    card.innerHTML = `
        <div class="card-header">
            <div class="card-icon">🍽️</div>
            <button class="card-menu" data-menu>⋮</button>
        </div>
        <h3 class="card-title">${restaurant.name}</h3>
        <p class="card-subtitle">${restaurant.address || 'No address'}</p>
        <div class="card-meta">
            <div class="card-meta-item">
                <span>📞</span>
                <span>${restaurant.phone || 'No phone'}</span>
            </div>
            <div class="card-meta-item">
                <span>🪑</span>
                <span>${restaurant.table_count || 0} tables</span>
            </div>
        </div>
    `;
    
    // Add menu actions
    const menuBtn = card.querySelector('[data-menu]');
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Show dropdown with edit/delete options
        showCardMenu(e.target, restaurant, onEdit, onDelete);
    });
    
    return card;
}

// Create table card
export function createTableCard(table, onEdit, onDelete) {
    const statusClass = getStatusClass(table.status);
    
    const card = document.createElement('div');
    card.className = 'card-dashboard';
    card.innerHTML = `
        <div class="card-header">
            <div class="card-icon">🪑</div>
            <span class="badge badge-${statusClass}">${capitalize(table.status)}</span>
        </div>
        <h3 class="card-title">Table ${table.number}</h3>
        <p class="card-subtitle">Capacity: ${table.capacity} people</p>
        <div class="card-meta">
            <div class="card-meta-item">
                <span>👥</span>
                <span>Seats ${table.capacity}</span>
            </div>
            ${table.current_guests ? `
                <div class="card-meta-item">
                    <span>🍽️</span>
                    <span>${table.current_guests} guests</span>
                </div>
            ` : ''}
        </div>
    `;
    
    card.addEventListener('click', () => {
        if (onEdit) onEdit(table);
    });
    
    return card;
}

function getStatusClass(status) {
    const map = {
        'available': 'success',
        'occupied': 'error',
        'reserved': 'warning'
    };
    return map[status] || 'ghost';
}

function showCardMenu(trigger, item, onEdit, onDelete) {
    // Implementation for dropdown menu
    // This would create a dropdown with edit/delete options
    console.log('Show menu for', item);
}

// Create stats card
export function createStatsCard(options = {}) {
    const {
        title = '',
        value = 0,
        trend = 0,
        icon = '📊'
    } = options;
    
    const trendDirection = trend >= 0 ? 'up' : 'down';
    const trendIcon = trend >= 0 ? '↑' : '↓';
    
    const card = document.createElement('div');
    card.className = 'stat-card-dashboard';
    card.innerHTML = `
        <div class="stat-card-header">
            <div class="stat-card-icon">${icon}</div>
            ${trend !== 0 ? `
                <div class="stat-card-trend ${trendDirection}">
                    <span>${trendIcon}</span>
                    <span>${Math.abs(trend)}%</span>
                </div>
            ` : ''}
        </div>
        <div class="stat-card-value" data-count="${value}">0</div>
        <div class="stat-card-label">${title}</div>
    `;
    
    return card;
}

// Initialize all components
export function initComponents() {
    Toast.init();
    Modal.init();
}

export default {
    Toast,
    Modal,
    confirmDialog,
    createSkeleton,
    createBadge,
    createButton,
    createCard,
    createFormGroup,
    createEmptyState,
    createPagination,
    createRestaurantCard,
    createTableCard,
    createStatsCard,
    initComponents
};
