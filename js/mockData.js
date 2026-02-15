/**
 * BRONLY - Mock Data for Demo
 * Static demo data that looks real
 */

// Demo user accounts
export const demoUsers = [
    {
        id: 1,
        email: 'demo@bronly.io',
        password: 'demo123456',
        first_name: 'Demo',
        last_name: 'User',
        role: 'restaurant_owner',
        avatar: 'DU'
    },
    {
        id: 2,
        email: 'admin@bronly.io',
        password: 'admin123456',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        avatar: 'AU'
    },
    {
        id: 3,
        email: 'staff@bronly.io',
        password: 'staff123456',
        first_name: 'Staff',
        last_name: 'User',
        role: 'staff',
        avatar: 'SU'
    }
];

// Demo restaurants
export const demoRestaurants = [
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

// Demo tables
export const demoTables = [
    // The Golden Spoon tables
    { id: 1, restaurant_id: 1, number: 'A1', capacity: 2, status: 'available', current_guests: 0 },
    { id: 2, restaurant_id: 1, number: 'A2', capacity: 2, status: 'occupied', current_guests: 2 },
    { id: 3, restaurant_id: 1, number: 'A3', capacity: 4, status: 'available', current_guests: 0 },
    { id: 4, restaurant_id: 1, number: 'A4', capacity: 4, status: 'reserved', current_guests: 0 },
    { id: 5, restaurant_id: 1, number: 'B1', capacity: 6, status: 'available', current_guests: 0 },
    { id: 6, restaurant_id: 1, number: 'B2', capacity: 6, status: 'occupied', current_guests: 5 },
    { id: 7, restaurant_id: 1, number: 'B3', capacity: 8, status: 'available', current_guests: 0 },
    { id: 8, restaurant_id: 1, number: 'C1', capacity: 2, status: 'available', current_guests: 0 },
    // Bella Vista tables
    { id: 9, restaurant_id: 2, number: 'T1', capacity: 2, status: 'occupied', current_guests: 2 },
    { id: 10, restaurant_id: 2, number: 'T2', capacity: 4, status: 'available', current_guests: 0 },
    { id: 11, restaurant_id: 2, number: 'T3', capacity: 4, status: 'occupied', current_guests: 4 },
    { id: 12, restaurant_id: 2, number: 'T4', capacity: 6, status: 'reserved', current_guests: 0 },
    { id: 13, restaurant_id: 2, number: 'T5', capacity: 6, status: 'available', current_guests: 0 },
    { id: 14, restaurant_id: 2, number: 'T6', capacity: 8, status: 'available', current_guests: 0 },
    // Sakura Sushi tables
    { id: 15, restaurant_id: 3, number: 'S1', capacity: 2, status: 'available', current_guests: 0 },
    { id: 16, restaurant_id: 3, number: 'S2', capacity: 2, status: 'occupied', current_guests: 2 },
    { id: 17, restaurant_id: 3, number: 'S3', capacity: 4, status: 'available', current_guests: 0 },
    { id: 18, restaurant_id: 3, number: 'S4', capacity: 4, status: 'reserved', current_guests: 0 },
];

// Demo reservations
export const demoReservations = [
    {
        id: 1,
        restaurant_id: 1,
        table_id: 2,
        customer_name: 'John Smith',
        customer_email: 'john@example.com',
        customer_phone: '+1 (555) 111-2222',
        party_size: 2,
        date: '2024-12-15',
        time: '19:00',
        status: 'confirmed',
        special_requests: 'Anniversary dinner',
        created_at: '2024-12-10T10:00:00Z'
    },
    {
        id: 2,
        restaurant_id: 1,
        table_id: 4,
        customer_name: 'Emily Johnson',
        customer_email: 'emily@example.com',
        customer_phone: '+1 (555) 222-3333',
        party_size: 4,
        date: '2024-12-15',
        time: '20:00',
        status: 'confirmed',
        special_requests: 'High chair needed',
        created_at: '2024-12-11T14:30:00Z'
    },
    {
        id: 3,
        restaurant_id: 2,
        table_id: 9,
        customer_name: 'Michael Brown',
        customer_email: 'michael@example.com',
        customer_phone: '+1 (555) 333-4444',
        party_size: 2,
        date: '2024-12-15',
        time: '19:30',
        status: 'seated',
        special_requests: '',
        created_at: '2024-12-09T16:45:00Z'
    },
    {
        id: 4,
        restaurant_id: 2,
        table_id: 12,
        customer_name: 'Sarah Davis',
        customer_email: 'sarah@example.com',
        customer_phone: '+1 (555) 444-5555',
        party_size: 6,
        date: '2024-12-16',
        time: '18:00',
        status: 'confirmed',
        special_requests: 'Birthday celebration',
        created_at: '2024-12-12T11:20:00Z'
    },
    {
        id: 5,
        restaurant_id: 3,
        table_id: 16,
        customer_name: 'David Wilson',
        customer_email: 'david@example.com',
        customer_phone: '+1 (555) 555-6666',
        party_size: 2,
        date: '2024-12-15',
        time: '20:30',
        status: 'seated',
        special_requests: 'Gluten-free options',
        created_at: '2024-12-14T09:00:00Z'
    }
];

// Demo activity feed
export const demoActivity = [
    {
        id: 1,
        type: 'reservation',
        description: 'New reservation at <strong>The Golden Spoon</strong> for 4 guests',
        created_at: new Date(Date.now() - 2 * 60000).toISOString()
    },
    {
        id: 2,
        type: 'table',
        description: 'Table <strong>A2</strong> at The Golden Spoon is now occupied',
        created_at: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
        id: 3,
        type: 'restaurant',
        description: '<strong>Sakura Sushi Bar</strong> updated their menu',
        created_at: new Date(Date.now() - 45 * 60000).toISOString()
    },
    {
        id: 4,
        type: 'reservation',
        description: 'Reservation completed at <strong>Bella Vista</strong>',
        created_at: new Date(Date.now() - 2 * 60 * 60000).toISOString()
    },
    {
        id: 5,
        type: 'table',
        description: 'Table <strong>T5</strong> at Bella Vista is now available',
        created_at: new Date(Date.now() - 3 * 60 * 60000).toISOString()
    }
];

// Demo dashboard stats
export const demoStats = {
    restaurant_count: 3,
    restaurant_growth: 12,
    table_count: 42,
    table_growth: 8,
    today_reservations: 24,
    today_revenue: 3840,
    revenue_growth: 15,
    occupancy_rate: 78,
    total_guests_served: 156,
    average_party_size: 3.2
};

// Demo analytics data for charts
export const demoChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    reservations: [45, 52, 48, 61, 78, 92, 85],
    revenue: [3200, 3800, 3500, 4200, 5600, 6800, 6100],
    occupancy: [65, 72, 68, 78, 85, 92, 88]
};

// Initialize mock data in localStorage
export function initMockData(force = false) {
    // Always seed data unless explicitly skipped
    // This ensures demo works every time
    
    // Store demo credentials
    localStorage.setItem('demo_users', JSON.stringify(demoUsers));
    localStorage.setItem('demo_restaurants', JSON.stringify(demoRestaurants));
    localStorage.setItem('demo_tables', JSON.stringify(demoTables));
    localStorage.setItem('demo_reservations', JSON.stringify(demoReservations));
    localStorage.setItem('demo_activity', JSON.stringify(demoActivity));
    localStorage.setItem('demo_stats', JSON.stringify(demoStats));
    localStorage.setItem('demo_chart_data', JSON.stringify(demoChartData));
    
    // Mark as initialized
    localStorage.setItem('mock_data_initialized', 'true');
    
    console.log('Demo data seeded successfully');
}

// Get demo data
export function getDemoData(key) {
    const data = localStorage.getItem(`demo_${key}`);
    return data ? JSON.parse(data) : null;
}

// Update demo data
export function updateDemoData(key, data) {
    localStorage.setItem(`demo_${key}`, JSON.stringify(data));
}

// Reset mock data
export function resetMockData() {
    localStorage.removeItem('mock_data_initialized');
    localStorage.removeItem('demo_users');
    localStorage.removeItem('demo_restaurants');
    localStorage.removeItem('demo_tables');
    localStorage.removeItem('demo_reservations');
    localStorage.removeItem('demo_activity');
    localStorage.removeItem('demo_stats');
    localStorage.removeItem('demo_chart_data');
    initMockData();
}

// Check if using demo mode
export function isDemoMode() {
    return localStorage.getItem('demo_mode') === 'true';
}

// Set demo mode
export function setDemoMode(enabled) {
    localStorage.setItem('demo_mode', enabled ? 'true' : 'false');
    if (enabled) {
        initMockData();
    }
}

export default {
    demoUsers,
    demoRestaurants,
    demoTables,
    demoReservations,
    demoActivity,
    demoStats,
    demoChartData,
    initMockData,
    getDemoData,
    updateDemoData,
    resetMockData,
    isDemoMode,
    setDemoMode
};
