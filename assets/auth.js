// Authentication JavaScript
class AuthSystem {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUsers();
        this.setupEventListeners();
        this.checkSession();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    loadUsers() {
        // Load users from localStorage
        const storedUsers = app.loadFromStorage('crypto_portfolio_users') || [];
        this.users = storedUsers;

        // Add demo user if not exists
        if (!this.users.find(user => user.email === 'demo@example.com')) {
            this.users.push({
                id: 1,
                name: 'Demo User',
                email: 'demo@example.com',
                password: this.hashPassword('demo123'),
                createdAt: new Date().toISOString(),
                verified: true
            });
            this.saveUsers();
        }
    }

    saveUsers() {
        app.saveToStorage('crypto_portfolio_users', this.users);
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Clear previous alerts
        const alertDiv = document.getElementById('loginAlert');
        if (alertDiv) alertDiv.style.display = 'none';

        // Validate inputs
        if (!email || !password) {
            this.showLoginAlert('Please fill in all fields', 'warning');
            return;
        }

        // Find user
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            this.showLoginAlert('User not found. Please check your email or register first.', 'danger');
            return;
        }

        // Verify password
        if (!this.verifyPassword(password, user.password)) {
            this.showLoginAlert('Invalid password. Please try again.', 'danger');
            return;
        }

        // Successful login
        this.loginUser(user, rememberMe);
    }

    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Clear previous alerts
        const alertDiv = document.getElementById('registerAlert');
        if (alertDiv) alertDiv.style.display = 'none';

        // Validate inputs
        if (!this.validateRegistration(name, email, password, confirmPassword, agreeTerms)) {
            return;
        }

        // Check if user already exists
        if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showRegisterAlert('An account with this email already exists. Please login instead.', 'warning');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            verified: false // In real app, would send verification email
        };

        this.users.push(newUser);
        this.saveUsers();

        // Send welcome email (simulated)
        this.sendWelcomeEmail(newUser);

        // Show success and redirect
        this.showRegisterAlert('Account created successfully! You are now logged in.', 'success');
        
        setTimeout(() => {
            this.loginUser(newUser);
        }, 1000);
    }

    validateRegistration(name, email, password, confirmPassword, agreeTerms) {
        let isValid = true;

        // Name validation
        if (!name || name.trim().length < 2) {
            this.showRegisterAlert('Name must be at least 2 characters long', 'warning');
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            this.showRegisterAlert('Please enter a valid email address', 'warning');
            isValid = false;
        }

        // Password validation
        if (!password || password.length < 6) {
            this.showRegisterAlert('Password must be at least 6 characters long', 'warning');
            isValid = false;
        }

        // Confirm password
        if (password !== confirmPassword) {
            this.showRegisterAlert('Passwords do not match', 'warning');
            isValid = false;
        }

        // Terms agreement
        if (!agreeTerms) {
            this.showRegisterAlert('You must agree to the Terms of Service', 'warning');
            isValid = false;
        }

        return isValid;
    }

    loginUser(user, rememberMe = false) {
        // Create session
        const session = {
            userId: user.id,
            email: user.email,
            name: user.name,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe
        };

        // Store session
        app.saveToStorage('crypto_portfolio_user', session);
        if (rememberMe) {
            app.saveToStorage('crypto_portfolio_session', session);
        }

        this.currentUser = user;

        // Show success message
        this.showLoginAlert(`Welcome back, ${user.name}!`, 'success');

        // Redirect to home page after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    checkSession() {
        // Check if user is already logged in
        let session = app.loadFromStorage('crypto_portfolio_user');
        
        if (!session) {
            // Check remembered session
            session = app.loadFromStorage('crypto_portfolio_session');
        }

        if (session) {
            const user = this.users.find(u => u.id === session.userId);
            if (user) {
                this.currentUser = user;
                // Update navigation if on login page
                if (window.location.pathname.includes('login.html')) {
                    this.showLoginAlert(`You are already logged in as ${user.name}`, 'info');
                }
            }
        }
    }

    logout() {
        localStorage.removeItem('crypto_portfolio_user');
        localStorage.removeItem('crypto_portfolio_session');
        this.currentUser = null;
        window.location.href = 'index.html';
    }

    sendWelcomeEmail(user) {
        // Simulate sending welcome email
        console.log('Sending welcome email to:', user.email);
        
        // In a real application, this would call the PHP backend
        const emailData = {
            to: user.email,
            subject: 'Welcome to Crypto Portfolio!',
            message: `Hi ${user.name},\n\nWelcome to Crypto Portfolio! Your account has been created successfully.\n\nYou can now start tracking your Bitcoin holdings and explore real-time market prices.\n\nBest regards,\nThe Crypto Portfolio Team`,
            timestamp: new Date().toISOString()
        };

        // Store email log for demo purposes
        const emailLog = app.loadFromStorage('crypto_portfolio_emails') || [];
        emailLog.push(emailData);
        app.saveToStorage('crypto_portfolio_emails', emailLog);
    }

    showLoginAlert(message, type) {
        app.showAlert('loginAlert', message, type);
    }

    showRegisterAlert(message, type) {
        app.showAlert('registerAlert', message, type);
    }

    // Simple password hashing (in real app, use proper hashing)
    hashPassword(password) {
        // This is a simple hash for demo purposes
        // In production, use bcrypt or similar
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Initialize auth system
const authSystem = new AuthSystem();

// Make it globally available
window.authSystem = authSystem;