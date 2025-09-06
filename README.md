# Crypto Portfolio - Complete Web Application

A modern, responsive web application for tracking Bitcoin holdings and market prices, built with HTML, CSS, JavaScript, Bootstrap, and PHP.

## 🚀 Features

### Frontend Features
- **Responsive Design**: Built with Bootstrap 5, optimized for all device sizes
- **Live Bitcoin Prices**: Real-time USD and INR price updates from CoinGecko API
- **Portfolio Calculator**: Calculate your Bitcoin holdings value in multiple currencies
- **Price Charts**: Interactive charts showing Bitcoin price history
- **User Authentication**: Secure login/registration system with PHP sessions
- **Contact System**: Contact form with email notifications
- **Multiple Pages**: Home, Portfolio, Prices, About, FAQ, Contact, and Login pages

### Backend Features
- **PHP API Proxy**: Secure proxy for CoinGecko API calls
- **User Management**: SQLite database for user accounts
- **Email Notifications**: PHPMailer integration for welcome emails
- **Session Management**: PHP sessions for user authentication
- **Contact Form Processing**: Server-side form handling and storage

## 📋 Prerequisites

- **XAMPP** (Apache, MySQL, PHP) - [Download here](https://www.apachefriends.org/)
- **Composer** (for PHPMailer) - [Download here](https://getcomposer.org/)
- **Gmail Account** (for SMTP email sending)

## 🛠️ Installation & Setup

### 1. Install XAMPP
1. Download and install XAMPP
2. Start Apache from XAMPP Control Panel
3. Ensure Apache is running on port 80

### 2. Setup Project
1. Clone or download this project
2. Copy the entire project folder to `C:\xampp\htdocs\crypto-portfolio\` (Windows) or `/Applications/XAMPP/xamppfiles/htdocs/crypto-portfolio/` (Mac)

### 3. Install PHPMailer
```bash
cd C:\xampp\htdocs\crypto-portfolio
composer require phpmailer/phpmailer
```

### 4. Configure Email (Optional but Recommended)

#### Setup Gmail App Password
1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Click "Security" → "2-Step Verification" (enable if not already)
3. Click "App passwords"
4. Generate an app password for "Mail"
5. Copy the generated password

#### Update Email Configuration
Edit these files and replace the placeholders:
- `login.php` (lines 28-29)
- `contact.php` (lines 67-68)

```php
$mail->Username   = 'your-email@gmail.com';     // Your Gmail address
$mail->Password   = 'your-app-password';        // Your Gmail app password
```

### 5. Set Permissions
Ensure the `data/` directory is writable:
```bash
chmod 755 data/
```

## 🚀 Running the Application

1. Start XAMPP and ensure Apache is running
2. Open your web browser
3. Navigate to: `http://localhost/crypto-portfolio/`
4. The application should load with live Bitcoin prices

**Note**: This application requires PHP and Apache to run properly. It cannot be run with Node.js or other JavaScript runtimes as it uses PHP for backend functionality including user authentication, database operations, and API proxying.

If you don't have XAMPP installed:
1. Download XAMPP from https://www.apachefriends.org/
2. Install and start Apache from the XAMPP Control Panel
3. Copy this project to the `htdocs` folder
4. Access via `http://localhost/crypto-portfolio/`

## 📱 Usage

### User Registration/Login
- Click "Login/Register" in the navigation
- Create a new account with name, email, and password
- Login with existing credentials
- Demo account: `demo@example.com` / `demo123`

### Portfolio Calculator
1. Navigate to "Portfolio" page
2. Enter your Bitcoin amount
3. View calculated USD and INR values
4. Save portfolios when logged in

### Price Tracking
- View live Bitcoin prices on the home page
- Visit "Prices" page for detailed charts and market data
- Prices update automatically every 30 seconds

### Contact Form
- Use the "Contact" page to send messages
- Messages are saved and email notifications sent (if configured)

## 🗂️ Project Structure

```
crypto-portfolio/
├── index.html              # Home page
├── portfolio.html          # Portfolio calculator
├── prices.html            # Price tracking and charts
├── about.html             # About page with team info
├── faq.html               # Frequently asked questions
├── contact.html           # Contact form
├── login.html             # Login/registration page
├── api/
│   └── price.php          # Bitcoin price API proxy
├── assets/
│   ├── styles.css         # Custom CSS styles
│   ├── app.js            # Main application JavaScript
│   ├── portfolio.js      # Portfolio calculator logic
│   ├── prices.js         # Price page functionality
│   ├── contact.js        # Contact form handling
│   └── auth.js           # Authentication JavaScript
├── data/                  # Data storage (created automatically)
│   ├── users.db          # SQLite user database
│   └── contacts.json     # Contact form submissions
├── vendor/                # Composer dependencies (PHPMailer)
├── login.php             # Authentication backend
├── contact.php           # Contact form backend
└── README.md             # This file
```

## 🔧 Configuration

### API Settings
- The application uses CoinGecko's free API
- No API key required for basic price data
- Rate limit: ~30 requests per minute

### Database
- Uses SQLite for simplicity (no MySQL setup required)
- User data stored in `data/users.db`
- Database created automatically on first run

### Email Configuration
Update these settings in `login.php` and `contact.php`:
```php
$mail->Host       = 'smtp.gmail.com';           // SMTP server
$mail->Username   = 'your-email@gmail.com';     // Your email
$mail->Password   = 'your-app-password';        // App password
$mail->Port       = 587;                        // SMTP port
```

## 🐛 Troubleshooting

### Apache Not Starting
- Check if port 80 is already in use
- Try using port 8080 instead
- Access via `http://localhost:8080/crypto-portfolio/`

### Email Not Sending
- Verify Gmail App Password is correct
- Check that 2-Step Verification is enabled
- Ensure PHPMailer is installed via Composer
- Check PHP error logs in XAMPP

### API Errors
- Check internet connection
- CoinGecko API might be temporarily down
- Application will show demo data as fallback

### Database Issues
- Ensure `data/` directory exists and is writable
- Check file permissions on `data/users.db`
- Delete database file to reset if corrupted

## 🔒 Security Notes

This is a **demo application**. For production use:

1. **Use HTTPS** for all authentication pages
2. **Implement CSRF protection** for forms
3. **Use MySQL/PostgreSQL** instead of SQLite
4. **Add input sanitization** and validation
5. **Implement rate limiting** for API calls
6. **Store sensitive data** in environment variables
7. **Add password complexity requirements**
8. **Implement account verification** via email

## 👥 Team

- **Kavya** - Frontend Developer
- **Kunal** - Backend Developer  
- **Mukul** - Full Stack Developer

## 📄 License

This project is for educational/demo purposes. Feel free to use and modify as needed.

## 🤝 Support

For questions or issues:
1. Check the FAQ page in the application
2. Use the contact form
3. Review this README for common solutions

---

**Built with ❤️ using HTML, CSS, JavaScript, Bootstrap, and PHP**