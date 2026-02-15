/**
 * BRONLY - Authentication Module
 * JWT simulation and session management
 */

import { authAPI } from './api.js';
import { Toast } from './components.js';
import { initMockData, setDemoMode } from './mockData.js';

// Auth state
const authState = {
    user: null,
    isAuthenticated: false,
    isLoading: false
};

// Initialize auth
export function initAuth() {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        authState.user = JSON.parse(user);
        authState.isAuthenticated = true;
        return true;
    }
    
    return false;
}

// Check if authenticated
export function isAuthenticated() {
    return authState.isAuthenticated;
}

// Get current user
export function getUser() {
    return authState.user;
}

// Login
export async function login(email, password) {
    authState.isLoading = true;
    
    try {
        // Enable demo mode for demo credentials
        if (email.includes('demo') || email.includes('admin') || email.includes('staff')) {
            setDemoMode(true);
            initMockData();
        }
        
        const response = await authAPI.login(email, password);
        
        authState.user = response.user;
        authState.isAuthenticated = true;
        authState.isLoading = false;
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(response.user));
        
        Toast.success('Welcome back!');
        
        return { success: true, user: response.user };
    } catch (error) {
        authState.isLoading = false;
        Toast.error(error.message || 'Login failed');
        return { success: false, error: error.message };
    }
}

// Register
export async function register(userData) {
    authState.isLoading = true;
    
    try {
        // Enable demo mode and initialize mock data
        setDemoMode(true);
        initMockData();
        
        const response = await authAPI.register(userData);
        
        authState.user = response.user;
        authState.isAuthenticated = true;
        authState.isLoading = false;
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(response.user));
        
        Toast.success('Account created successfully!');
        
        return { success: true, user: response.user };
    } catch (error) {
        authState.isLoading = false;
        Toast.error(error.message || 'Registration failed');
        return { success: false, error: error.message };
    }
}

// Logout
export async function logout() {
    try {
        await authAPI.logout();
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    authState.user = null;
    authState.isAuthenticated = false;
    
    // Clear stored data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    Toast.success('Logged out successfully');
    
    // Redirect to login
    window.location.href = '/login.html';
}

// Update user profile
export async function updateProfile(data) {
    try {
        const response = await authAPI.updateProfile(data);
        authState.user = { ...authState.user, ...response };
        localStorage.setItem('user', JSON.stringify(authState.user));
        
        Toast.success('Profile updated');
        return { success: true, user: authState.user };
    } catch (error) {
        Toast.error(error.message || 'Update failed');
        return { success: false, error: error.message };
    }
}

// Refresh user data
export async function refreshUser() {
    try {
        const user = await authAPI.getProfile();
        authState.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    } catch (error) {
        console.error('Failed to refresh user:', error);
        return null;
    }
}

// Protected route guard
export function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Redirect if authenticated
export function redirectIfAuth(redirectTo = '/dashboard.html') {
    if (isAuthenticated()) {
        window.location.href = redirectTo;
        return true;
    }
    return false;
}

// Validate login form
export function validateLoginForm(email, password) {
    const errors = [];
    
    if (!email || !email.trim()) {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
    }
    
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// Validate register form
export function validateRegisterForm(data) {
    const errors = [];
    
    if (!data.email || !data.email.trim()) {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format');
    }
    
    if (!data.password || data.password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    
    if (data.password !== data.confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    if (!data.firstName || !data.firstName.trim()) {
        errors.push('First name is required');
    }
    
    if (!data.lastName || !data.lastName.trim()) {
        errors.push('Last name is required');
    }
    
    // Validate role if provided
    const validRoles = ['restaurant_owner', 'admin', 'staff'];
    if (data.role && !validRoles.includes(data.role)) {
        errors.push('Invalid role selected');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// Show field errors
export function showFieldErrors(form, errors) {
    // Clear previous errors
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.form-input').forEach(el => {
        el.classList.remove('error');
    });
    
    // Show new errors
    errors.forEach(error => {
        // Try to find related field
        const field = form.querySelector(`[name="${error.field}"]`);
        if (field) {
            field.classList.add('error');
            const errorEl = document.createElement('span');
            errorEl.className = 'form-error';
            errorEl.textContent = error.message;
            field.parentNode.appendChild(errorEl);
        }
    });
}

// Setup form validation
export function setupFormValidation(form, validator, onSubmit) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const validation = validator(data);
        
        if (!validation.valid) {
            // Show general error toast
            Toast.error(validation.errors[0]);
            return;
        }
        
        // Clear errors
        form.querySelectorAll('.form-error').forEach(el => el.remove());
        form.querySelectorAll('.form-input').forEach(el => {
            el.classList.remove('error');
        });
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Loading...';
        
        try {
            await onSubmit(data);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Auth event emitter
const authEvents = {
    listeners: {},
    
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },
    
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    },
    
    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
};

// Emit auth events
export function onAuthChange(callback) {
    authEvents.on('authChange', callback);
}

export function offAuthChange(callback) {
    authEvents.off('authChange', callback);
}

// Update auth state and emit events
function updateAuthState(newState) {
    Object.assign(authState, newState);
    authEvents.emit('authChange', authState);
}

export default {
    initAuth,
    isAuthenticated,
    getUser,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    requireAuth,
    redirectIfAuth,
    validateLoginForm,
    validateRegisterForm,
    showFieldErrors,
    setupFormValidation,
    onAuthChange,
    offAuthChange
};
