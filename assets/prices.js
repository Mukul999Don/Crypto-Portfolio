// Bitcoin Prices Page JavaScript
class PricesPage {
    constructor() {
        this.chart = null;
        this.priceHistory = [];
        this.init();
    }

    init() {
        this.loadMarketData();
        this.initChart();
        this.setupEventListeners();
        this.setupAutoRefresh();
    }

    setupEventListeners() {
        const refreshButton = document.getElementById('refreshChart');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refreshData();
            });
        }
    }

    async loadMarketData() {
        try {
            // Try to fetch extended market data
            const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false');
            
            if (response.ok) {
                const data = await response.json();
                this.updateMarketInfo(data.market_data);
            } else {
                this.loadDemoMarketData();
            }
        } catch (error) {
            console.error('Error loading market data:', error);
            this.loadDemoMarketData();
        }
    }

    updateMarketInfo(marketData) {
        const change24h = document.getElementById('change24h');
        const marketCap = document.getElementById('marketCap');
        const volume24h = document.getElementById('volume24h');
        const lastUpdated = document.getElementById('lastUpdated');

        if (change24h && marketData.price_change_percentage_24h) {
            const changePercent = marketData.price_change_percentage_24h.toFixed(2);
            const changeClass = changePercent >= 0 ? 'text-success' : 'text-danger';
            const changeSymbol = changePercent >= 0 ? '+' : '';
            change24h.innerHTML = `<span class="${changeClass}">${changeSymbol}${changePercent}%</span>`;
        }

        if (marketCap && marketData.market_cap && marketData.market_cap.usd) {
            marketCap.textContent = '$' + this.formatLargeNumber(marketData.market_cap.usd);
        }

        if (volume24h && marketData.total_volume && marketData.total_volume.usd) {
            volume24h.textContent = '$' + this.formatLargeNumber(marketData.total_volume.usd);
        }

        if (lastUpdated) {
            lastUpdated.textContent = new Date().toLocaleTimeString();
        }
    }

    loadDemoMarketData() {
        const change24h = document.getElementById('change24h');
        const marketCap = document.getElementById('marketCap');
        const volume24h = document.getElementById('volume24h');
        const lastUpdated = document.getElementById('lastUpdated');

        if (change24h) {
            change24h.innerHTML = '<span class="text-success">+2.45%</span>';
        }
        if (marketCap) {
            marketCap.textContent = '$2.1T';
        }
        if (volume24h) {
            volume24h.textContent = '$28.5B';
        }
        if (lastUpdated) {
            lastUpdated.textContent = new Date().toLocaleTimeString();
        }
    }

    async initChart() {
        try {
            // Fetch historical price data (last 24 hours)
            const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1&interval=hourly');
            
            if (response.ok) {
                const data = await response.json();
                this.priceHistory = data.prices;
                this.createChart();
            } else {
                this.createDemoChart();
            }
        } catch (error) {
            console.error('Error loading chart data:', error);
            this.createDemoChart();
        }
    }

    createChart() {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;

        const labels = this.priceHistory.map(price => {
            return new Date(price[0]).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        });

        const prices = this.priceHistory.map(price => price[1]);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Bitcoin Price (USD)',
                    data: prices,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 8
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Price: $' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    createDemoChart() {
        const ctx = document.getElementById('priceChart');
        if (!ctx) return;

        // Generate demo data for last 24 hours
        const now = new Date();
        const demoData = [];
        const basePrice = 109270;

        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
            const variance = (Math.random() - 0.5) * 2000; // Random variance of ±$1000
            demoData.push({
                time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                price: basePrice + variance
            });
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: demoData.map(d => d.time),
                datasets: [{
                    label: 'Bitcoin Price (USD) - Demo Data',
                    data: demoData.map(d => d.price),
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 8
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Price: $' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    setupAutoRefresh() {
        // Refresh data every 2 minutes
        setInterval(() => {
            this.refreshData();
        }, 120000);
    }

    async refreshData() {
        const refreshButton = document.getElementById('refreshChart');
        if (refreshButton) {
            refreshButton.disabled = true;
            refreshButton.textContent = 'Refreshing...';
        }

        await this.loadMarketData();
        
        // Update chart data
        if (this.chart) {
            this.chart.destroy();
            await this.initChart();
        }

        if (refreshButton) {
            refreshButton.disabled = false;
            refreshButton.textContent = 'Refresh';
        }
    }

    formatLargeNumber(num) {
        if (num >= 1e12) {
            return (num / 1e12).toFixed(1) + 'T';
        }
        if (num >= 1e9) {
            return (num / 1e9).toFixed(1) + 'B';
        }
        if (num >= 1e6) {
            return (num / 1e6).toFixed(1) + 'M';
        }
        if (num >= 1e3) {
            return (num / 1e3).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }
}

// Initialize prices page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('priceChart')) {
        new PricesPage();
    }
});