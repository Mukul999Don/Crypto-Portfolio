// Portfolio Calculator JavaScript
class PortfolioCalculator {
    constructor() {
        this.savedPortfolios = [];
        this.init();
    }

    init() {
        this.loadSavedPortfolios();
        this.setupEventListeners();
        this.displaySavedPortfolios();
    }

    setupEventListeners() {
        const portfolioForm = document.getElementById('portfolioForm');
        const saveButton = document.getElementById('savePortfolio');

        if (portfolioForm) {
            portfolioForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculatePortfolio();
            });
        }

        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveCurrentPortfolio();
            });
        }
    }

    calculatePortfolio() {
        const btcAmountInput = document.getElementById('btcAmount');
        const resultsDiv = document.getElementById('portfolioResults');
        const saveButton = document.getElementById('savePortfolio');

        if (!btcAmountInput || !resultsDiv) return;

        const btcAmount = parseFloat(btcAmountInput.value);

        if (isNaN(btcAmount) || btcAmount <= 0) {
            app.showAlert('portfolioAlert', 'Please enter a valid Bitcoin amount', 'warning');
            return;
        }

        // Get current prices from main app
        const prices = app.getCurrentPrices();
        const portfolioValue = app.calculatePortfolioValue(btcAmount);

        // Update display
        const portfolioUSD = document.getElementById('portfolioUSD');
        const portfolioINR = document.getElementById('portfolioINR');

        if (portfolioUSD) {
            portfolioUSD.textContent = '$' + app.formatPrice(portfolioValue.usd, 'USD');
        }
        if (portfolioINR) {
            portfolioINR.textContent = '₹' + app.formatPrice(portfolioValue.inr, 'INR');
        }

        // Show results
        resultsDiv.style.display = 'block';
        app.animateElement(resultsDiv);

        // Show save button
        if (saveButton) {
            saveButton.style.display = 'block';
        }

        // Store current calculation for saving
        this.currentCalculation = {
            btcAmount: btcAmount,
            usdValue: portfolioValue.usd,
            inrValue: portfolioValue.inr,
            priceAtCalculation: prices,
            timestamp: new Date().toISOString()
        };
    }

    saveCurrentPortfolio() {
        if (!this.currentCalculation) {
            app.showAlert('portfolioAlert', 'Please calculate portfolio value first', 'warning');
            return;
        }

        const user = app.getStoredUser();
        const portfolioName = prompt('Enter a name for this portfolio:');

        if (!portfolioName || portfolioName.trim() === '') {
            return;
        }

        const portfolio = {
            id: Date.now(),
            name: portfolioName.trim(),
            userId: user ? user.email : 'guest',
            ...this.currentCalculation
        };

        this.savedPortfolios.push(portfolio);
        this.savePortfoliosToStorage();
        this.displaySavedPortfolios();

        app.showAlert('portfolioAlert', 'Portfolio saved successfully!', 'success');
    }

    loadSavedPortfolios() {
        const stored = app.loadFromStorage('crypto_portfolio_saved');
        this.savedPortfolios = stored || [];
    }

    savePortfoliosToStorage() {
        app.saveToStorage('crypto_portfolio_saved', this.savedPortfolios);
    }

    displaySavedPortfolios() {
        const portfolioList = document.getElementById('portfolioList');
        if (!portfolioList) return;

        const user = app.getStoredUser();
        const userPortfolios = this.savedPortfolios.filter(p => 
            p.userId === (user ? user.email : 'guest')
        );

        if (userPortfolios.length === 0) {
            portfolioList.innerHTML = '<p class="text-muted">No saved portfolios yet.</p>';
            return;
        }

        portfolioList.innerHTML = userPortfolios.map(portfolio => `
            <div class="card mb-2">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title mb-1">${portfolio.name}</h6>
                            <p class="card-text text-muted small mb-2">
                                ${portfolio.btcAmount} BTC
                            </p>
                            <div class="row">
                                <div class="col-6">
                                    <small class="text-muted">USD:</small><br>
                                    <strong>$${app.formatPrice(portfolio.usdValue, 'USD')}</strong>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted">INR:</small><br>
                                    <strong>₹${app.formatPrice(portfolio.inrValue, 'INR')}</strong>
                                </div>
                            </div>
                            <small class="text-muted">
                                Saved: ${app.formatDate(portfolio.timestamp)}
                            </small>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                                ⋮
                            </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <a class="dropdown-item" href="#" onclick="portfolioCalc.loadPortfolio(${portfolio.id})">
                                        Load
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item text-danger" href="#" onclick="portfolioCalc.deletePortfolio(${portfolio.id})">
                                        Delete
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadPortfolio(portfolioId) {
        const portfolio = this.savedPortfolios.find(p => p.id === portfolioId);
        if (!portfolio) return;

        const btcAmountInput = document.getElementById('btcAmount');
        if (btcAmountInput) {
            btcAmountInput.value = portfolio.btcAmount;
            this.calculatePortfolio();
        }
    }

    deletePortfolio(portfolioId) {
        if (!confirm('Are you sure you want to delete this portfolio?')) return;

        this.savedPortfolios = this.savedPortfolios.filter(p => p.id !== portfolioId);
        this.savePortfoliosToStorage();
        this.displaySavedPortfolios();

        app.showAlert('portfolioAlert', 'Portfolio deleted successfully', 'success');
    }

    // Export portfolio data
    exportPortfolios() {
        const user = app.getStoredUser();
        const userPortfolios = this.savedPortfolios.filter(p => 
            p.userId === (user ? user.email : 'guest')
        );

        const dataStr = JSON.stringify(userPortfolios, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'crypto_portfolio_export.json';
        link.click();
    }

    // Import portfolio data
    importPortfolios(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedPortfolios = JSON.parse(e.target.result);
                const user = app.getStoredUser();
                
                // Update user ID for imported portfolios
                importedPortfolios.forEach(portfolio => {
                    portfolio.userId = user ? user.email : 'guest';
                    portfolio.id = Date.now() + Math.random(); // Ensure unique ID
                });

                this.savedPortfolios.push(...importedPortfolios);
                this.savePortfoliosToStorage();
                this.displaySavedPortfolios();

                app.showAlert('portfolioAlert', `${importedPortfolios.length} portfolios imported successfully!`, 'success');
            } catch (error) {
                app.showAlert('portfolioAlert', 'Error importing portfolios. Please check the file format.', 'danger');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize portfolio calculator
const portfolioCalc = new PortfolioCalculator();

// Make it globally available
window.portfolioCalc = portfolioCalc;