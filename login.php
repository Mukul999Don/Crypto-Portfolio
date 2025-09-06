<?php
session_start();

// Database configuration (using SQLite for simplicity)
$dbFile = 'data/users.db';

// Create data directory if it doesn't exist
if (!file_exists('data')) {
    mkdir('data', 0755, true);
}

// Initialize database
function initDatabase() {
    global $dbFile;
    
    if (!file_exists($dbFile)) {
        $pdo = new PDO("sqlite:$dbFile");
        $pdo->exec("
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                verified INTEGER DEFAULT 0
            )
        ");
    }
}

// Get database connection
function getConnection() {
    global $dbFile;
    return new PDO("sqlite:$dbFile");
}

// Send email function using PHPMailer
function sendWelcomeEmail($email, $name) {
    // PHPMailer configuration
    require_once 'vendor/autoload.php'; // You'll need to install PHPMailer via Composer
    
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'your-email@gmail.com'; // Replace with your Gmail
        $mail->Password   = 'your-app-password';    // Replace with your App Password
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Recipients
        $mail->setFrom('your-email@gmail.com', 'Crypto Portfolio');
        $mail->addAddress($email, $name);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Welcome to Crypto Portfolio!';
        $mail->Body    = "
            <h2>Welcome to Crypto Portfolio, $name!</h2>
            <p>Your account has been created successfully.</p>
            <p>You can now:</p>
            <ul>
                <li>Track your Bitcoin holdings</li>
                <li>View live market prices</li>
                <li>Save and manage multiple portfolios</li>
                <li>Access historical price data</li>
            </ul>
            <p>Thank you for joining us!</p>
            <p>Best regards,<br>The Crypto Portfolio Team</p>
        ";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Email could not be sent. Mailer Error: {$mail->ErrorInfo}");
        return false;
    }
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    initDatabase();
    $pdo = getConnection();
    
    if ($action === 'register') {
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        
        // Validation
        if (empty($name) || empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'error' => 'All fields are required']);
            exit;
        }
        
        if (strlen($password) < 6) {
            echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
            exit;
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'error' => 'Invalid email address']);
            exit;
        }
        
        // Check if user already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'error' => 'Email already registered']);
            exit;
        }
        
        // Create user
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        
        if ($stmt->execute([$name, $email, $hashedPassword])) {
            $userId = $pdo->lastInsertId();
            
            // Set session
            $_SESSION['user_id'] = $userId;
            $_SESSION['user_name'] = $name;
            $_SESSION['user_email'] = $email;
            
            // Send welcome email
            $emailSent = sendWelcomeEmail($email, $name);
            
            echo json_encode([
                'success' => true,
                'message' => 'Account created successfully!',
                'user' => ['id' => $userId, 'name' => $name, 'email' => $email],
                'emailSent' => $emailSent
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to create account']);
        }
        
    } elseif ($action === 'login') {
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        
        if (empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'error' => 'Email and password are required']);
            exit;
        }
        
        $stmt = $pdo->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            
            echo json_encode([
                'success' => true,
                'message' => 'Login successful!',
                'user' => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email']]
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Invalid email or password']);
        }
        
    } elseif ($action === 'logout') {
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
    }
    
    exit;
}

// Handle GET requests - check session status
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    
    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            'loggedIn' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'name' => $_SESSION['user_name'],
                'email' => $_SESSION['user_email']
            ]
        ]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
    exit;
}
?>