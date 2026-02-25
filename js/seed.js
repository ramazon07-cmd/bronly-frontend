/**
 * BRONLY - Seed Data Module
 * Local data arrays and CRUD simulation for dashboard functionality
 */

// Seed data for reservations
export const seedReservations = [
    {
        id: 1,
        restaurant_id: 1,
        table_id: 2,
        customer_id: 1,
        customer_name: 'John Smith',
        customer_email: 'john@example.com',
        customer_phone: '+1 (555) 111-2222',
        party_size: 2,
        date: '2024-12-15',
        time: '19:00',
        status: 'confirmed',
        special_requests: 'Anniversary dinner',
        created_at: '2024-12-10T10:00:00Z',
        updated_at: '2024-12-10T10:00:00Z'
    },
    {
        id: 2,
        restaurant_id: 1,
        table_id: 4,
        customer_id: 2,
        customer_name: 'Emily Johnson',
        customer_email: 'emily@example.com',
        customer_phone: '+1 (555) 222-3333',
        party_size: 4,
        date: '2024-12-15',
        time: '20:00',
        status: 'confirmed',
        special_requests: 'High chair needed',
        created_at: '2024-12-11T14:30:00Z',
        updated_at: '2024-12-11T14:30:00Z'
    },
    {
        id: 3,
        restaurant_id: 2,
        table_id: 9,
        customer_id: 3,
        customer_name: 'Michael Brown',
        customer_email: 'michael@example.com',
        customer_phone: '+1 (555) 333-4444',
        party_size: 2,
        date: '2024-12-15',
        time: '19:30',
        status: 'seated',
        special_requests: '',
        created_at: '2024-12-09T16:45:00Z',
        updated_at: '2024-12-09T16:45:00Z'
    },
    {
        id: 4,
        restaurant_id: 2,
        table_id: 12,
        customer_id: 4,
        customer_name: 'Sarah Davis',
        customer_email: 'sarah@example.com',
        customer_phone: '+1 (555) 444-5555',
        party_size: 6,
        date: '2024-12-16',
        time: '18:00',
        status: 'confirmed',
        special_requests: 'Birthday celebration',
        created_at: '2024-12-12T11:20:00Z',
        updated_at: '2024-12-12T11:20:00Z'
    },
    {
        id: 5,
        restaurant_id: 3,
        table_id: 16,
        customer_id: 5,
        customer_name: 'David Wilson',
        customer_email: 'david@example.com',
        customer_phone: '+1 (555) 555-6666',
        party_size: 2,
        date: '2024-12-15',
        time: '20:30',
        status: 'seated',
        special_requests: 'Gluten-free options',
        created_at: '2024-12-14T09:00:00Z',
        updated_at: '2024-12-14T09:00:00Z'
    },
    {
        id: 6,
        restaurant_id: 1,
        table_id: 3,
        customer_id: 6,
        customer_name: 'Lisa Anderson',
        customer_email: 'lisa@example.com',
        customer_phone: '+1 (555) 666-7777',
        party_size: 3,
        date: '2024-12-16',
        time: '18:30',
        status: 'pending',
        special_requests: 'Window seat preferred',
        created_at: '2024-12-14T15:20:00Z',
        updated_at: '2024-12-14T15:20:00Z'
    },
    {
        id: 7,
        restaurant_id: 3,
        table_id: 18,
        customer_id: 7,
        customer_name: 'Robert Taylor',
        customer_email: 'robert@example.com',
        customer_phone: '+1 (555) 777-8888',
        party_size: 5,
        date: '2024-12-17',
        time: '19:15',
        status: 'confirmed',
        special_requests: 'Vegetarian options',
        created_at: '2024-12-13T12:45:00Z',
        updated_at: '2024-12-13T12:45:00Z'
    }
];

// Seed data for customers
export const seedCustomers = [
    {
        id: 1,
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@example.com',
        phone: '+1 (555) 111-2222',
        preferred_restaurant: 1,
        visit_count: 12,
        last_visit: '2024-12-01',
        special_requests: 'Likes window seats',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-12-01T19:30:00Z'
    },
    {
        id: 2,
        first_name: 'Emily',
        last_name: 'Johnson',
        email: 'emily@example.com',
        phone: '+1 (555) 222-3333',
        preferred_restaurant: 1,
        visit_count: 8,
        last_visit: '2024-11-28',
        special_requests: 'Brings children, needs high chair',
        created_at: '2024-03-22T14:30:00Z',
        updated_at: '2024-11-28T20:15:00Z'
    },
    {
        id: 3,
        first_name: 'Michael',
        last_name: 'Brown',
        email: 'michael@example.com',
        phone: '+1 (555) 333-4444',
        preferred_restaurant: 2,
        visit_count: 5,
        last_visit: '2024-12-09',
        special_requests: 'Celebrating special occasions',
        created_at: '2024-05-10T09:15:00Z',
        updated_at: '2024-12-09T19:30:00Z'
    },
    {
        id: 4,
        first_name: 'Sarah',
        last_name: 'Davis',
        email: 'sarah@example.com',
        phone: '+1 (555) 444-5555',
        preferred_restaurant: 2,
        visit_count: 15,
        last_visit: '2024-12-12',
        special_requests: 'Often celebrates birthdays',
        created_at: '2024-02-18T11:20:00Z',
        updated_at: '2024-12-12T18:00:00Z'
    },
    {
        id: 5,
        first_name: 'David',
        last_name: 'Wilson',
        email: 'david@example.com',
        phone: '+1 (555) 555-6666',
        preferred_restaurant: 3,
        visit_count: 9,
        last_visit: '2024-12-14',
        special_requests: 'Requires gluten-free options',
        created_at: '2024-04-05T16:45:00Z',
        updated_at: '2024-12-14T20:30:00Z'
    },
    {
        id: 6,
        first_name: 'Lisa',
        last_name: 'Anderson',
        email: 'lisa@example.com',
        phone: '+1 (555) 666-7777',
        preferred_restaurant: 1,
        visit_count: 6,
        last_visit: '2024-12-08',
        special_requests: 'Prefers quiet corner tables',
        created_at: '2024-06-30T13:20:00Z',
        updated_at: '2024-12-08T18:30:00Z'
    },
    {
        id: 7,
        first_name: 'Robert',
        last_name: 'Taylor',
        email: 'robert@example.com',
        phone: '+1 (555) 777-8888',
        preferred_restaurant: 3,
        visit_count: 4,
        last_visit: '2024-12-13',
        special_requests: 'Requests vegetarian options',
        created_at: '2024-07-15T08:45:00Z',
        updated_at: '2024-12-13T19:15:00Z'
    }
];

// Seed data for tables
export const seedTables = [
    // The Golden Spoon tables
    { id: 1, restaurant_id: 1, number: 'A1', capacity: 2, status: 'available', current_guests: 0, section: 'Main Dining', created_at: '2024-01-15T10:00:00Z' },
    { id: 2, restaurant_id: 1, number: 'A2', capacity: 2, status: 'occupied', current_guests: 2, section: 'Main Dining', created_at: '2024-01-15T10:00:00Z' },
    { id: 3, restaurant_id: 1, number: 'A3', capacity: 4, status: 'available', current_guests: 0, section: 'Main Dining', created_at: '2024-01-15T10:00:00Z' },
    { id: 4, restaurant_id: 1, number: 'A4', capacity: 4, status: 'reserved', current_guests: 0, section: 'Main Dining', created_at: '2024-01-15T10:00:00Z' },
    { id: 5, restaurant_id: 1, number: 'B1', capacity: 6, status: 'available', current_guests: 0, section: 'Main Dining', created_at: '2024-01-15T10:00:00Z' },
    { id: 6, restaurant_id: 1, number: 'B2', capacity: 6, status: 'occupied', current_guests: 5, section: 'Main Dining', created_at: '2024-01-15T10:00:00Z' },
    { id: 7, restaurant_id: 1, number: 'B3', capacity: 8, status: 'available', current_guests: 0, section: 'Main Dining', created_at: '2024-01-15T10:00:00Z' },
    { id: 8, restaurant_id: 1, number: 'C1', capacity: 2, status: 'available', current_guests: 0, section: 'Patio', created_at: '2024-01-15T10:00:00Z' },
    // Bella Vista tables
    { id: 9, restaurant_id: 2, number: 'T1', capacity: 2, status: 'occupied', current_guests: 2, section: 'Terrace', created_at: '2024-02-20T14:30:00Z' },
    { id: 10, restaurant_id: 2, number: 'T2', capacity: 4, status: 'available', current_guests: 0, section: 'Terrace', created_at: '2024-02-20T14:30:00Z' },
    { id: 11, restaurant_id: 2, number: 'T3', capacity: 4, status: 'occupied', current_guests: 4, section: 'Terrace', created_at: '2024-02-20T14:30:00Z' },
    { id: 12, restaurant_id: 2, number: 'T4', capacity: 6, status: 'reserved', current_guests: 0, section: 'Garden', created_at: '2024-02-20T14:30:00Z' },
    { id: 13, restaurant_id: 2, number: 'T5', capacity: 6, status: 'available', current_guests: 0, section: 'Garden', created_at: '2024-02-20T14:30:00Z' },
    { id: 14, restaurant_id: 2, number: 'T6', capacity: 8, status: 'available', current_guests: 0, section: 'Garden', created_at: '2024-02-20T14:30:00Z' },
    // Sakura Sushi tables
    { id: 15, restaurant_id: 3, number: 'S1', capacity: 2, status: 'available', current_guests: 0, section: 'Bar Seating', created_at: '2024-03-10T09:15:00Z' },
    { id: 16, restaurant_id: 3, number: 'S2', capacity: 2, status: 'occupied', current_guests: 2, section: 'Bar Seating', created_at: '2024-03-10T09:15:00Z' },
    { id: 17, restaurant_id: 3, number: 'S3', capacity: 4, status: 'available', current_guests: 0, section: 'Private Room', created_at: '2024-03-10T09:15:00Z' },
    { id: 18, restaurant_id: 3, number: 'S4', capacity: 4, status: 'reserved', current_guests: 0, section: 'Private Room', created_at: '2024-03-10T09:15:00Z' }
];

// Seed data for notifications
export const seedNotifications = [
    {
        id: 1,
        title: 'New reservation',
        message: 'New reservation at The Golden Spoon for 4 guests',
        timestamp: new Date(Date.now() - 10 * 60000), // 10 minutes ago
        read: false,
        type: 'reservation',
        priority: 'high',
        restaurant_id: 1
    },
    {
        id: 2,
        title: 'Table available',
        message: 'Table A2 at The Golden Spoon is now available',
        timestamp: new Date(Date.now() - 25 * 60000), // 25 minutes ago
        read: false,
        type: 'table',
        priority: 'medium',
        restaurant_id: 1
    },
    {
        id: 3,
        title: 'System update',
        message: 'BRONLY platform has been updated with new features',
        timestamp: new Date(Date.now() - 120 * 60000), // 2 hours ago
        read: true,
        type: 'system',
        priority: 'low',
        restaurant_id: null
    },
    {
        id: 4,
        title: 'Customer feedback',
        message: 'Positive review received from John Smith',
        timestamp: new Date(Date.now() - 300 * 60000), // 5 hours ago
        read: true,
        type: 'feedback',
        priority: 'medium',
        restaurant_id: 1
    },
    {
        id: 5,
        title: 'Reservation reminder',
        message: 'Reservation for Sarah Davis at 6:00 PM today',
        timestamp: new Date(Date.now() - 360 * 60000), // 6 hours ago
        read: false,
        type: 'reminder',
        priority: 'high',
        restaurant_id: 2
    },
    {
        id: 6,
        title: 'Table turnover alert',
        message: 'Table T6 at Bella Vista has been available for 30 minutes',
        timestamp: new Date(Date.now() - 420 * 60000), // 7 hours ago
        read: true,
        type: 'alert',
        priority: 'medium',
        restaurant_id: 2
    },
    {
        id: 7,
        title: 'Low inventory alert',
        message: 'Soy sauce stock running low at Sakura Sushi',
        timestamp: new Date(Date.now() - 480 * 60000), // 8 hours ago
        read: false,
        type: 'inventory',
        priority: 'high',
        restaurant_id: 3
    }
];

// Data stores with current state
let reservationsStore = [...seedReservations];
let customersStore = [...seedCustomers];
let tablesStore = [...seedTables];
let notificationsStore = [...seedNotifications];

// Helper functions to simulate CRUD operations
export const DataManager = {
    // Reservations
    getReservations: () => reservationsStore,
    getReservationById: (id) => reservationsStore.find(r => r.id === parseInt(id)),
    addReservation: (reservation) => {
        const newReservation = {
            ...reservation,
            id: Math.max(...reservationsStore.map(r => r.id), 0) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        reservationsStore.push(newReservation);
        return newReservation;
    },
    updateReservation: (id, updates) => {
        const index = reservationsStore.findIndex(r => r.id === parseInt(id));
        if (index !== -1) {
            reservationsStore[index] = {
                ...reservationsStore[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            return reservationsStore[index];
        }
        return null;
    },
    deleteReservation: (id) => {
        const initialLength = reservationsStore.length;
        reservationsStore = reservationsStore.filter(r => r.id !== parseInt(id));
        return reservationsStore.length < initialLength;
    },
    getReservationsByRestaurant: (restaurantId) => {
        return reservationsStore.filter(r => r.restaurant_id === parseInt(restaurantId));
    },

    // Customers
    getCustomers: () => customersStore,
    getCustomerById: (id) => customersStore.find(c => c.id === parseInt(id)),
    addCustomer: (customer) => {
        const newCustomer = {
            ...customer,
            id: Math.max(...customersStore.map(c => c.id), 0) + 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        customersStore.push(newCustomer);
        return newCustomer;
    },
    updateCustomer: (id, updates) => {
        const index = customersStore.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            customersStore[index] = {
                ...customersStore[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            return customersStore[index];
        }
        return null;
    },
    deleteCustomer: (id) => {
        const initialLength = customersStore.length;
        customersStore = customersStore.filter(c => c.id !== parseInt(id));
        return customersStore.length < initialLength;
    },

    // Tables
    getTables: () => tablesStore,
    getTableById: (id) => tablesStore.find(t => t.id === parseInt(id)),
    addTable: (table) => {
        const newTable = {
            ...table,
            id: Math.max(...tablesStore.map(t => t.id), 0) + 1,
            created_at: new Date().toISOString()
        };
        tablesStore.push(newTable);
        return newTable;
    },
    updateTable: (id, updates) => {
        const index = tablesStore.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
            tablesStore[index] = {
                ...tablesStore[index],
                ...updates,
                updated_at: new Date().toISOString()
            };
            return tablesStore[index];
        }
        return null;
    },
    deleteTable: (id) => {
        const initialLength = tablesStore.length;
        tablesStore = tablesStore.filter(t => t.id !== parseInt(id));
        return tablesStore.length < initialLength;
    },
    getTablesByRestaurant: (restaurantId) => {
        return tablesStore.filter(t => t.restaurant_id === parseInt(restaurantId));
    },

    // Notifications
    getNotifications: () => notificationsStore,
    getNotificationById: (id) => notificationsStore.find(n => n.id === parseInt(id)),
    addNotification: (notification) => {
        const newNotification = {
            ...notification,
            id: Math.max(...notificationsStore.map(n => n.id), 0) + 1,
            timestamp: new Date().toISOString()
        };
        notificationsStore.unshift(newNotification); // Add to beginning for newest first
        return newNotification;
    },
    updateNotification: (id, updates) => {
        const index = notificationsStore.findIndex(n => n.id === parseInt(id));
        if (index !== -1) {
            notificationsStore[index] = {
                ...notificationsStore[index],
                ...updates
            };
            return notificationsStore[index];
        }
        return null;
    },
    deleteNotification: (id) => {
        const initialLength = notificationsStore.length;
        notificationsStore = notificationsStore.filter(n => n.id !== parseInt(id));
        return notificationsStore.length < initialLength;
    },
    markNotificationAsRead: (id) => {
        const notification = notificationsStore.find(n => n.id === parseInt(id));
        if (notification) {
            notification.read = true;
            return notification;
        }
        return null;
    },
    getUnreadNotifications: () => {
        return notificationsStore.filter(n => !n.read);
    },

    // Utility functions
    resetData: () => {
        reservationsStore = [...seedReservations];
        customersStore = [...seedCustomers];
        tablesStore = [...seedTables];
        notificationsStore = [...seedNotifications];
    }
};

// Render utility functions
export const renderUtils = {
    // Format date for display
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    // Format time for display
    formatTime: (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    },

    // Format relative time (e.g., "2 hours ago")
    formatRelativeTime: (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    },

    // Format status with appropriate styling
    formatStatus: (status) => {
        const statusClasses = {
            confirmed: 'badge-success',
            pending: 'badge-warning',
            seated: 'badge-primary',
            cancelled: 'badge-error',
            completed: 'badge-ghost'
        };

        return `
            <span class="badge ${statusClasses[status] || 'badge-ghost'}">
                ${status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        `;
    }
};

// Simulate API delay for realistic behavior
export const simulateDelay = (delay = 500) => {
    return new Promise(resolve => setTimeout(resolve, delay));
};

// Error simulation toggle
let simulateErrors = false;

export const setErrorSimulation = (shouldSimulate) => {
    simulateErrors = shouldSimulate;
};

export const getErrorSimulation = () => {
    return simulateErrors;
};

// Simulate potential error
export const maybeThrowError = () => {
    if (simulateErrors && Math.random() < 0.1) { // 10% chance of error when simulation is on
        throw new Error('Simulated network error');
    }
};