const API_BASE = '/api';

class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        
        console.log('🔧 Auth initialized:', { 
            hasToken: !!this.token, 
            hasUser: !!this.user 
        });
    }

    async login(email, password) {
        try {
            console.log('🔐 Attempting login for:', email);
            
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('📡 Login response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Login successful:', data);

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
            console.log('👤 Attempting registration for:', email);
            
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, userType }),
            });

            console.log('📡 Register response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Registration successful:', data);

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

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const appContainer = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const authMessage = document.getElementById('auth-message');

// Event Listeners
if (loginTab && signupTab) {
    loginTab.addEventListener('click', () => {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        hideMessage();
    });

    signupTab.addEventListener('click', () => {
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        hideMessage();
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            showMessage('Please fill all fields', 'error');
            return;
        }

        try {
            showMessage('Logging in...', 'success');
            await auth.login(email, password);
            showApp();
        } catch (error) {
            showMessage(error.message || 'Login failed', 'error');
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const userType = document.getElementById('user-type').value;

        if (!name || !email || !password || !userType) {
            showMessage('Please fill all fields', 'error');
            return;
        }

        try {
            showMessage('Creating account...', 'success');
            await auth.register(name, email, password, userType);
            showApp();
        } catch (error) {
            showMessage(error.message || 'Registration failed', 'error');
        }
    });
}

function showMessage(message, type) {
    if (authMessage) {
        authMessage.textContent = message;
        authMessage.className = `message ${type}`;
        authMessage.classList.remove('hidden');
    }
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
}

function hideMessage() {
    if (authMessage) {
        authMessage.classList.add('hidden');
    }
}

function showApp() {
    console.log('🚀 Showing main app...');
    
    if (authScreen) {
        authScreen.classList.add('hidden');
        console.log('✅ Auth screen hidden');
    }
    
    if (appContainer) {
        appContainer.classList.remove('hidden');
        console.log('✅ App container shown');
        
        // Initialize the main app
        if (typeof initializeApp === 'function') {
            console.log('🔧 Initializing main app...');
            initializeApp();
        } else {
            console.log('❌ initializeApp function not found');
        }
    } else {
        console.log('❌ App container not found');
    }
}

// Check authentication status on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, checking auth status...');
    
    if (auth.isAuthenticated()) {
        console.log('✅ User is authenticated, showing app');
        showApp();
    } else {
        console.log('❌ User not authenticated, showing login');
        if (authScreen) {
            authScreen.classList.remove('hidden');
        }
    }
});