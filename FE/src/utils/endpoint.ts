// endpoint.ts
export const ENDPOINT_SERVER = {
    LOGIN: '/api/login',
    REFRESH: '/api/refresh_token',
    LOGOUT: '/api/logout',
}

export const ENDPOINT_CLIENT = {
    // Auth
    LOGIN: '/api/auth/login',
    LOGIN_GOOGLE: '/api/auth/login-google',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    VERIFY_REGISTER: '/api/auth/verify-register',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_FORGOT_PASSWORD: '/api/auth/verify-forgot-password',
    CHANGE_EMAIL: '/api/auth/change-email',
    VERIFY_CHANGE_EMAIL: '/api/auth/verify-change-email',
    CHANGE_PASSWORD: '/api/auth/change-password',
    // Users
    USERS: '/api/users',
    USER_DETAIL: (id: string) => `/api/users/${id}`,

    // Roles
    ROLES: '/api/roles',
    ROLE_DETAIL: (id: string) => `/api/roles/${id}`,
    ROLES_DUMB: '/api/roles/dumb',

    // Events
    EVENTS: '/api/events',
    EVENT_DETAIL: (id: string) => `/api/events/${id}`,
    EVENT_STATUS: (id: string) => `/api/events/${id}/status`,

    // Categories
    CATEGORIES: '/api/categories',
    CATEGORY_DETAIL: (id: string) => `/api/categories/${id}`,

    // Organizers
    ORGANIZERS: '/api/organizers',
    ORGANIZER_DETAIL: (id: string) => `/api/organizers/${id}`,
    ORGANIZER_VERIFY: (id: string) => `/api/organizers/${id}/verify`,

    // Event Reviews
    EVENT_REVIEWS: '/api/eventreviews',
    EVENT_REVIEW_DETAIL: (id: string) => `/api/eventreviews/${id}`,

    // Favorites
    FAVORITES: '/api/favorites',
    FAVORITE_DETAIL: (id: string) => `/api/favorites/${id}`,
    FAVORITE_DELETE: (userId: string, eventId: string) => `/api/favorites/${userId}/${eventId}`,
    FAVORITE_SOFT_DELETE: (userId: string, eventId: string) => `/api/favorites/${userId}/${eventId}/soft`,

    // Interactions
    INTERACTIONS: '/api/interactions',
    INTERACTION_DETAIL: (id: string) => `/api/interactions/${id}`,
    INTERACTION_DELETE: (userId: string, eventId: string, type: number) => `/api/interactions/${userId}/${eventId}/${type}`,
    INTERACTION_SOFT_DELETE: (userId: string, eventId: string, type: number) => `/api/interactions/${userId}/${eventId}/${type}/soft`,

    // Tickets
    TICKETS: '/api/tickets',
    TICKET_DETAIL: (id: string) => `/api/tickets/${id}`,

    // Ticket Types
    TICKET_TYPES: '/api/tickettypes',
    TICKET_TYPES_ARRAY: '/api/tickettypes/array',
    TICKET_TYPE_DETAIL: (id: string) => `/api/tickettypes/${id}`,
    TICKET_TYPE_DECREMENT: (id: string) => `/api/tickettypes/${id}/decrement`,

    // Ticket Listings
    TICKET_LISTINGS: '/api/ticketlistings',
    TICKET_LISTING_DETAIL: (id: string) => `/api/ticketlistings/${id}`,
    TICKET_LISTING_VALIDATE: (id: string) => `/api/ticketlistings/${id}/validate`,
    TICKET_LISTING_CANCEL: (id: string) => `/api/ticketlistings/${id}/cancel`,
    TICKET_LISTING_MARK_SOLD: (id: string) => `/api/ticketlistings/${id}/mark-sold`,

    // Bookings
    BOOKINGS: '/api/bookings',
    BOOKING_DETAIL: (id: string) => `/api/bookings/${id}`,

    // Booking Details
    BOOKING_DETAILS: '/api/bookingdetails',
    BOOKING_DETAIL_ITEM: (id: string) => `/api/bookingdetails/${id}`,

    // Payment Methods
    PAYMENT_METHODS: '/api/paymentmethods',
    PAYMENT_METHOD_DETAIL: (id: string) => `/api/paymentmethods/${id}`,

    // Payments
    PAYMENTS: '/api/payments',
    PAYMENT_DETAIL: (id: string) => `/api/payments/${id}`,
    PAYMENT_CALLBACK: '/api/payments/callback',

    // Trade Bookings
    TRADE_BOOKINGS: '/api/trade-bookings',

    // Resales
    RESALES: '/api/resales',
    RESALE_DETAIL: (id: string) => `/api/resales/${id}`,

    // Resale Transactions
    RESALE_TRANSACTIONS: '/api/resaletransactions',
    RESALE_TRANSACTION_DETAIL: (id: string) => `/api/resaletransactions/${id}`,

    // Notifications
    NOTIFICATIONS: '/api/notifications',
    NOTIFICATIONS_ME: '/api/notifications/me',
    NOTIFICATION_DETAIL: (id: string) => `/api/notifications/${id}`,
    NOTIFICATION_MARK_READ: (id: string) => `/api/notifications/${id}/read`,

    // Check-ins
    CHECKINS: '/api/checkins',
    CHECKIN_DETAIL: (id: string) => `/api/checkins/${id}`,

    // Analytics
    ANALYTICS_ADMIN_OVERVIEW: '/api/analytics/admin/overview',
    ANALYTICS_ORGANIZER_OVERVIEW: '/api/analytics/organizer/overview',
}
