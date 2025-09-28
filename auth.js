// Auto-detect API base URL for Vercel

// Auto-detect environment
const isVercel = window.location.hostname.includes('vercel.app');
const API_BASE = isVercel ? '/api' : '/api';

console.log('🌐 Environment:', isVercel ? 'Vercel' : 'Local');
console.log('🔗 API Base:', API_BASE);

class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        
        this.testBackendConnection();
    }

    async testBackendConnection() {
        try {
            const response = await fetch(`${API_BASE}/test`);
            const data = await response.json();
            console.log('✅ Backend connection successful:', data);
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
        }
    }

    // ... rest of your Auth class remains the same
}
const API_BASE = window.location.hostname.includes('vercel.app') 
    ? '/api' 
    : '/api';

console.log('🌐 API Base URL:', API_BASE);
console.log('📍 Current Host:', window.location.hostname);

class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        
        // Test backend connection
        this.testBackendConnection();
    }

    async testBackendConnection() {
        try {
            const response = await fetch(`${API_BASE}/test`);
            const data = await response.json();
            console.log('✅ Backend connection successful:', data);
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));

            return data;
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    }

    async register(name, email, password, userType) {
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, userType }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));

            return data;
        } catch (error) {
            console.error('❌ Registration error:', error);
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    }

    isAuthenticated() {
        return !!this.token;
    }

    isArtist() {
        return this.user?.userType === 'artist';
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
        };
    }
    
}

const auth = new Auth();

// Rest of your auth.js code remains the same...
// [Include the rest of your existing auth.js code here]

