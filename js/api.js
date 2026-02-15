/**
 * BRONLY - API Layer
 * Django REST API integration with Demo Mode support
 */

import { isDemoMode, getDemoData, updateDemoData, initMockData } from './mockData.js';

const API_BASE_URL = 'http://localhost:8000/api';

// API response handler
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'An error occurred'
        }));
        throw new Error(error.message || error.detail || `HTTP ${response.status}`);
    }
    return response.json();
}

// Simulate network delay for demo mode
function simulateDelay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Get auth headers
function getHeaders() {
    const token = localStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

// Generic API request
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        headers: getHeaders(),
        ...options
    };
    
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }
    
    const response = await fetch(url, config);
    return handleResponse(response);
}

// Auth API
export const authAPI = {
    async login(email, password) {
        // Always check/initialize demo data first
        let demoUsers = getDemoData('users');
        
        // If no demo data, seed it
        if (!demoUsers) {
            initMockData();
            demoUsers = getDemoData('users');
        }
        
        if (demoUsers) {
            await simulateDelay();
            const user = demoUsers.find(u => u.email === email && u.password === password);
            
            if (!user) {
                throw new Error('Invalid email or password');
            }
            
            // Create demo tokens
            const token = 'demo_token_' + Date.now();
            localStorage.setItem('access_token', token);
            localStorage.setItem('refresh_token', token);
            localStorage.setItem('user', JSON.stringify({
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                avatar: user.avatar
            }));
            
            return {
                access: token,
                refresh: token,
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role
                }
            };
        }
        
        const response = await apiRequest('/auth/login/', {
            method: 'POST',
            body: { email, password }
        });
        
        // Store tokens
        if (response.access) {
            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);
        }
        
        return response;
    },
    
    async register(userData) {
        // In demo mode, just create a new demo user
        if (isDemoMode() || getDemoData('users')) {
            await simulateDelay();
            
            const demoUsers = getDemoData('users') || [];
            const newUser = {
                id: demoUsers.length + 1,
                email: userData.email,
                password: userData.password,
                first_name: userData.first_name,
                last_name: userData.last_name,
                role: userData.role || 'restaurant_owner',
                avatar: (userData.first_name?.[0] || 'U') + (userData.last_name?.[0] || 'N')
            };
            
            demoUsers.push(newUser);
            updateDemoData('users', demoUsers);
            
            // Create demo tokens
            const token = 'demo_token_' + Date.now();
            localStorage.setItem('access_token', token);
            localStorage.setItem('refresh_token', token);
            localStorage.setItem('user', JSON.stringify({
                id: newUser.id,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                role: newUser.role,
                avatar: newUser.avatar
            }));
            
            return {
                access: token,
                refresh: token,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    role: newUser.role
                }
            };
        }
        
        const response = await apiRequest('/auth/register/', {
            method: 'POST',
            body: userData
        });
        
        // Auto login after registration
        if (response.access) {
            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);
        }
        
        return response;
    },
    
    async refreshToken() {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');
        
        const response = await apiRequest('/auth/refresh/', {
            method: 'POST',
            body: { refresh }
        });
        
        if (response.access) {
            localStorage.setItem('access_token', response.access);
        }
        
        return response;
    },
    
    async logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        return { success: true };
    },
    
    async getProfile() {
        return apiRequest('/auth/profile/');
    },
    
    async updateProfile(data) {
        return apiRequest('/auth/profile/', {
            method: 'PUT',
            body: data
        });
    }
};

// Restaurants API
export const restaurantsAPI = {
    async getAll() {
        let demoData = getDemoData('restaurants');
        // Auto-seed if missing
        if (!demoData) {
            initMockData();
            demoData = getDemoData('restaurants');
        }
        if (demoData) {
            await simulateDelay();
            return demoData;
        }
        return apiRequest('/restaurants/');
    },
    
    async getById(id) {
        const demoData = getDemoData('restaurants');
        if (demoData) {
            await simulateDelay();
            const restaurant = demoData.find(r => r.id === id);
            if (!restaurant) throw new Error('Restaurant not found');
            return restaurant;
        }
        return apiRequest(`/restaurants/${id}/`);
    },
    
    async create(data) {
        const demoData = getDemoData('restaurants');
        if (demoData) {
            await simulateDelay();
            const newRestaurant = {
                id: demoData.length + 1,
                ...data,
                table_count: 0,
                created_at: new Date().toISOString()
            };
            demoData.push(newRestaurant);
            updateDemoData('restaurants', demoData);
            return newRestaurant;
        }
        return apiRequest('/restaurants/', {
            method: 'POST',
            body: data
        });
    },
    
    async update(id, data) {
        const demoData = getDemoData('restaurants');
        if (demoData) {
            await simulateDelay();
            const index = demoData.findIndex(r => r.id === id);
            if (index === -1) throw new Error('Restaurant not found');
            demoData[index] = { ...demoData[index], ...data };
            updateDemoData('restaurants', demoData);
            return demoData[index];
        }
        return apiRequest(`/restaurants/${id}/`, {
            method: 'PUT',
            body: data
        });
    },
    
    async delete(id) {
        const demoData = getDemoData('restaurants');
        if (demoData) {
            await simulateDelay();
            const index = demoData.findIndex(r => r.id === id);
            if (index === -1) throw new Error('Restaurant not found');
            demoData.splice(index, 1);
            updateDemoData('restaurants', demoData);
            return { success: true };
        }
        return apiRequest(`/restaurants/${id}/`, {
            method: 'DELETE'
        });
    },
    
    async getStats(id) {
        const demoData = getDemoData('stats');
        if (demoData) {
            await simulateDelay();
            return demoData;
        }
        return apiRequest(`/restaurants/${id}/stats/`);
    }
};

// Tables API
export const tablesAPI = {
    async getAll(restaurantId = null) {
        let demoData = getDemoData('tables');
        // Auto-seed if missing
        if (!demoData) {
            initMockData();
            demoData = getDemoData('tables');
        }
        if (demoData) {
            await simulateDelay();
            // Filter by restaurant if specified
            if (restaurantId) {
                return demoData.filter(t => t.restaurant_id === parseInt(restaurantId));
            }
            return demoData;
        }
        const params = restaurantId ? `?restaurant=${restaurantId}` : '';
        return apiRequest(`/tables/${params}`);
    },

    async getById(id) {
        let demoData = getDemoData('tables');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('tables');
        }
        if (demoData) {
            await simulateDelay();
            const table = demoData.find(t => t.id === id);
            if (!table) throw new Error('Table not found');
            return table;
        }
        return apiRequest(`/tables/${id}/`);
    },

    async create(data) {
        let demoData = getDemoData('tables');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('tables');
        }
        if (demoData) {
            await simulateDelay();
            const newTable = {
                id: demoData.length + 1,
                ...data,
                current_guests: 0
            };
            demoData.push(newTable);
            updateDemoData('tables', demoData);
            return newTable;
        }
        return apiRequest('/tables/', {
            method: 'POST',
            body: data
        });
    },

    async update(id, data) {
        let demoData = getDemoData('tables');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('tables');
        }
        if (demoData) {
            await simulateDelay();
            const index = demoData.findIndex(t => t.id === id);
            if (index === -1) throw new Error('Table not found');
            demoData[index] = { ...demoData[index], ...data };
            updateDemoData('tables', demoData);
            return demoData[index];
        }
        return apiRequest(`/tables/${id}/`, {
            method: 'PUT',
            body: data
        });
    },

    async delete(id) {
        let demoData = getDemoData('tables');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('tables');
        }
        if (demoData) {
            await simulateDelay();
            const index = demoData.findIndex(t => t.id === id);
            if (index === -1) throw new Error('Table not found');
            demoData.splice(index, 1);
            updateDemoData('tables', demoData);
            return { success: true };
        }
        return apiRequest(`/tables/${id}/`, {
            method: 'DELETE'
        });
    },

    async updateStatus(id, status) {
        let demoData = getDemoData('tables');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('tables');
        }
        if (demoData) {
            await simulateDelay();
            const index = demoData.findIndex(t => t.id === id);
            if (index === -1) throw new Error('Table not found');
            demoData[index].status = status;
            if (status === 'occupied' && demoData[index].current_guests === 0) {
                demoData[index].current_guests = Math.floor(Math.random() * demoData[index].capacity) + 1;
            } else if (status === 'available') {
                demoData[index].current_guests = 0;
            }
            updateDemoData('tables', demoData);
            return demoData[index];
        }
        return apiRequest(`/tables/${id}/status/`, {
            method: 'PATCH',
            body: { status }
        });
    }
};

// Reservations API with demo support
export const reservationsAPI = {
    async getAll(params = {}) {
        let demoData = getDemoData('reservations');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('reservations');
        }
        if (demoData) {
            await simulateDelay();
            // Apply filters if provided
            let filtered = demoData;
            if (params.restaurant_id) {
                filtered = filtered.filter(r => r.restaurant_id === parseInt(params.restaurant_id));
            }
            if (params.status) {
                filtered = filtered.filter(r => r.status === params.status);
            }
            if (params.date) {
                filtered = filtered.filter(r => r.date === params.date);
            }
            return filtered;
        }
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/reservations/?${queryString}`);
    },

    async getById(id) {
        let demoData = getDemoData('reservations');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('reservations');
        }
        if (demoData) {
            await simulateDelay();
            const reservation = demoData.find(r => r.id === id);
            if (!reservation) throw new Error('Reservation not found');
            return reservation;
        }
        return apiRequest(`/reservations/${id}/`);
    },

    async create(data) {
        let demoData = getDemoData('reservations');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('reservations');
        }
        if (demoData) {
            await simulateDelay();
            const newReservation = {
                id: demoData.length + 1,
                ...data,
                status: data.status || 'confirmed',
                created_at: new Date().toISOString()
            };
            demoData.push(newReservation);
            updateDemoData('reservations', demoData);
            return newReservation;
        }
        return apiRequest('/reservations/', {
            method: 'POST',
            body: data
        });
    },

    async update(id, data) {
        let demoData = getDemoData('reservations');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('reservations');
        }
        if (demoData) {
            await simulateDelay();
            const index = demoData.findIndex(r => r.id === id);
            if (index === -1) throw new Error('Reservation not found');
            demoData[index] = { ...demoData[index], ...data };
            updateDemoData('reservations', demoData);
            return demoData[index];
        }
        return apiRequest(`/reservations/${id}/`, {
            method: 'PUT',
            body: data
        });
    },

    async delete(id) {
        let demoData = getDemoData('reservations');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('reservations');
        }
        if (demoData) {
            await simulateDelay();
            const index = demoData.findIndex(r => r.id === id);
            if (index === -1) throw new Error('Reservation not found');
            demoData.splice(index, 1);
            updateDemoData('reservations', demoData);
            return { success: true };
        }
        return apiRequest(`/reservations/${id}/`, {
            method: 'DELETE'
        });
    },

    async getStats() {
        let demoData = getDemoData('stats');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('stats');
        }
        if (demoData) {
            await simulateDelay();
            return demoData;
        }
        return apiRequest('/reservations/stats/');
    }
};

// Dashboard API
export const dashboardAPI = {
    async getOverview() {
        let demoData = getDemoData('stats');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('stats');
        }
        if (demoData) {
            await simulateDelay();
            return demoData;
        }
        return apiRequest('/dashboard/overview/');
    },

    async getAnalytics(period = '7d') {
        let demoData = getDemoData('chart_data');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('chart_data');
        }
        if (demoData) {
            await simulateDelay();
            return demoData;
        }
        return apiRequest(`/dashboard/analytics/?period=${period}`);
    },

    async getRecentActivity() {
        let demoData = getDemoData('activity');
        if (!demoData) {
            initMockData();
            demoData = getDemoData('activity');
        }
        if (demoData) {
            await simulateDelay();
            return demoData;
        }
        return apiRequest('/dashboard/activity/');
    }
};

// Upload API
export const uploadAPI = {
    async uploadFile(file, type = 'image') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        
        const token = localStorage.getItem('access_token');
        
        const response = await fetch(`${API_BASE_URL}/upload/`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: formData
        });
        
        return handleResponse(response);
    }
};

// Error interceptor
export function setupErrorInterceptor(callback) {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);
            
            // Handle 401 Unauthorized
            if (response.status === 401) {
                const refresh = localStorage.getItem('refresh_token');
                if (refresh && !args[0].includes('/auth/refresh/')) {
                    try {
                        await authAPI.refreshToken();
                        // Retry original request
                        const [url, config] = args;
                        config.headers = {
                            ...config.headers,
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        };
                        return originalFetch(url, config);
                    } catch (refreshError) {
                        // Token refresh failed, logout
                        authAPI.logout();
                        window.location.href = '/login.html';
                    }
                }
            }
            
            return response;
        } catch (error) {
            if (callback) callback(error);
            throw error;
        }
    };
}

// API health check
export async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health/`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.ok;
    } catch {
        return false;
    }
}

export default {
    authAPI,
    restaurantsAPI,
    tablesAPI,
    reservationsAPI,
    dashboardAPI,
    uploadAPI,
    setupErrorInterceptor,
    checkAPIHealth
};
