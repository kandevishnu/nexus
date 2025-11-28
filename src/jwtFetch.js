// src/jwtFetch.js

// This utility function handles sending the JWT token with every request
const BASE_URL = '/api'; // Use your proxy path

export async function jwtFetch(endpoint, options = {}) {
    // 1. Retrieve the JWT token from localStorage
    const token = localStorage.getItem('authToken');
    
    // 2. Prepare headers
    const defaultHeaders = {
        'Content-Type': 'application/json',
        // 'X-CSRFToken' and credentials are REMOVED
    };

    // 3. If token exists, add Authorization header
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const finalOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        // IMPORTANT: JWT auth is stateless, so credentials: 'include' is generally unnecessary
        // and should be removed from all protected calls to simplify architecture.
        credentials: undefined, 
    };

    const url = `${BASE_URL}${endpoint}`;
    
    // 4. Perform the fetch request
    const response = await fetch(url, finalOptions);

    // 5. Handle JWT expiry/rejection (401/403 errors)
    if (response.status === 401 || response.status === 403) {
        // You might want to automatically redirect to login here and clear the expired token
        console.error("JWT Expired or Invalid. Redirecting to login.");
        localStorage.removeItem('authToken');
        // NOTE: A proper redirect handler should be implemented in your App structure
        // to force the user back to the login page globally.
    }

    return response;
}