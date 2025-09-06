// Main Application JavaScript
class CryptoPortfolio {
    constructor() {
        this.apiUrl = 'api/price.php';
        this.currentPrices = {
            usd: 0,
            inr: 0
        };
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.loadPrices();
        this.setupAutoRefresh();
    }

    // Authentication Status Check
    checkAuthStatus() {
        const user = this.getStoredUser();
        const authNav = document.getElementById('auth-nav');
        const quickAuth = document.getElementById('quick-auth');

        if (user && authNav) {
            authNav.innerHTML = `
                <div class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        Welcome, ${user.name}
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="portfolio.html">My Portfolio</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="app.logout()">Logout</a></li>
                    </ul>
                </div>
            `;

            if (quickAuth) {
                quickAuth.textContent = 'My Account';
                quickAuth.href = '#';
                quickAuth.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = 'portfolio.html';
                };
            }
        }
    }

    // Get stored user data
    getStoredUser() {
        const userData = localStorage.getItem('crypto_portfolio_user');
        return userData ? JSON.parse(userData) : null;
    }

    // Logout function
    logout() {
        localStorage.removeItem('crypto_portfolio_user');
        localStorage.removeItem('crypto_portfolio_session');
        window.location.href = 'index.html';
    }

    // Load Bitcoin prices
    async loadPrices() {
        try {
            this.updateLoadingStatus('Fetching latest prices...');
            
            // Try to fetch from PHP API first, fallback to direct API call
            let data;
            try {
                const response = await fetch(this.apiUrl);
                if (response.ok) {
                    data = await response.json();
                } else {
                    throw new Error('PHP API not available');
                }
            } catch (error) {
                console.log('PHP API not available, using fallback...');
                data = await this.fetchPricesFallback();
            }

            if (data && data.success) {
                this.currentPrices.usd = data.prices.usd;
                this.currentPrices.inr = data.prices.inr;
                this.updatePriceDisplay();
                this.updateLoadingStatus('Last updated: ' + new Date().toLocaleTimeString());
            } else {
                throw new Error(data.error || 'Failed to load prices');
            }
        } catch (error) {
            console.error('Error loading prices:', error);
            this.updateLoadingStatus('Error loading prices. Using demo data.');
            this.loadDemoPrices();
        }
    }

    // Fallback price fetching (direct to CoinGecko)
    async fetchPricesFallback() {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,inr');
        const data = await response.json();
        
        return {
            success: true,
            prices: {
                usd: data.bitcoin.usd,
                inr: data.bitcoin.inr
            }
        };
    }

    // Load demo prices for development
    loadDemoPrices() {
        this.currentPrices.usd = 109270.00;
        this.currentPrices.inr = 9633503.00;
        this.updatePriceDisplay();
    }

    // Update price display on page
    updatePriceDisplay() {
        const btcUSD = document.getElementById('btc-usd');
        const btcINR = document.getElementById('btc-inr');
        
        if (btcUSD) {
            const usdValue = btcUSD.querySelector('.price-value');
            if (usdValue) {
                usdValue.textContent = this.formatPrice(this.currentPrices.usd, 'USD');
            }
        }

        if (btcINR) {
            const inrValue = btcINR.querySelector('.price-value');
            if (inrValue) {
                inrValue.textContent = this.formatPrice(this.currentPrices.inr, 'INR');
            }
        }

        // Update other price displays if present
        this.updateOtherPriceDisplays();
    }

    // Update other price displays on different pages
    updateOtherPriceDisplays() {
        const currentUSD = document.getElementById('currentUSD');
        const currentINR = document.getElementById('currentINR');
        const priceUSD = document.getElementById('priceUSD');
        const priceINR = document.getElementById('priceINR');

        if (currentUSD) {
            currentUSD.textContent = '$' + this.formatPrice(this.currentPrices.usd, 'USD');
        }
        if (currentINR) {
            currentINR.textContent = '₹' + this.formatPrice(this.currentPrices.inr, 'INR');
        }
        if (priceUSD) {
            priceUSD.textContent = '$' + this.formatPrice(this.currentPrices.usd, 'USD');
        }
        if (priceINR) {
            priceINR.textContent = '₹' + this.formatPrice(this.currentPrices.inr, 'INR');
        }
    }

    // Format price for display
    formatPrice(price, currency) {
        if (currency === 'USD') {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(price);
        } else if (currency === 'INR') {
            return new Intl.NumberFormat('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(price);
        }
        return price.toString();
    }

    // Update loading status
    updateLoadingStatus(message) {
        const loadingStatus = document.getElementById('loading-status');
        if (loadingStatus) {
            loadingStatus.textContent = message;
        }
    }

    // Setup auto-refresh for prices
    setupAutoRefresh() {
        // Refresh prices every 30 seconds
        setInterval(() => {
            this.loadPrices();
        }, 30000);
    }

    // Get current prices (for other modules)
    getCurrentPrices() {
        return this.currentPrices;
    }

    // Calculate portfolio value
    calculatePortfolioValue(btcAmount) {
        return {
            usd: btcAmount * this.currentPrices.usd,
            inr: btcAmount * this.currentPrices.inr
        };
    }

    // Utility function to show alerts
    showAlert(elementId, message, type = 'info') {
        const alertElement = document.getElementById(elementId);
        if (!alertElement) return;

        alertElement.className = `alert alert-${type} fade-in`;
        alertElement.textContent = message;
        alertElement.style.display = 'block';

        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                alertElement.style.display = 'none';
            }, 5000);
        }
    }

    // Save data to localStorage
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to storage:', error);
            return false;
        }
    }

    // Load data from localStorage
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return null;
        }
    }

    // Format date for display
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    // Animate elements
    animateElement(element, animationClass = 'fade-in') {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 500);
    }
}

// Global functions for inline event handlers
function showRegister() {
    // Scroll to register form
    document.querySelector('#registerForm').scrollIntoView({ behavior: 'smooth' });
}

function showLogin() {
    // Scroll to login form
    document.querySelector('#loginForm').scrollIntoView({ behavior: 'smooth' });
}

// Initialize the application
const app = new CryptoPortfolio();

// Make app globally available
window.app = app;

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips if any
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});