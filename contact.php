<?php
session_start();

// Handle POST requests for contact form
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $subject = trim($input['subject'] ?? '');
    $message = trim($input['message'] ?? '');
    $newsletter = $input['newsletter'] ?? false;
    
    // Validation
    if (empty($name) || empty($email) || empty($message)) {
        echo json_encode(['success' => false, 'error' => 'Name, email, and message are required']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'Invalid email address']);
        exit;
    }
    
    // Save contact message to file (in production, use database)
    $contactData = [
        'id' => uniqid(),
        'name' => $name,
        'email' => $email,
        'subject' => $subject,
        'message' => $message,
        'newsletter' => $newsletter,
        'timestamp' => date('c'),
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    
    // Create data directory if it doesn't exist
    if (!file_exists('data')) {
        mkdir('data', 0755, true);
    }
    
    // Save to JSON file
    $contactFile = 'data/contacts.json';
    $contacts = [];
    
    if (file_exists($contactFile)) {
        $contacts = json_decode(file_get_contents($contactFile), true) ?: [];
    }
    
    $contacts[] = $contactData;
    file_put_contents($contactFile, json_encode($contacts, JSON_PRETTY_PRINT));
    
    // Send email notification (optional)
    try {
        require_once 'vendor/autoload.php';
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'your-email@gmail.com';
        $mail->Password   = 'your-app-password';
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Send to admin
        $mail->setFrom($email, $name);
        $mail->addAddress('your-email@gmail.com', 'Crypto Portfolio Admin');
        
        $mail->isHTML(true);
        $mail->Subject = "Contact Form: " . ($subject ?: 'General Inquiry');
        $mail->Body    = "
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> $name</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Subject:</strong> $subject</p>
            <p><strong>Message:</strong></p>
            <p>" . nl2br(htmlspecialchars($message)) . "</p>
            <p><strong>Newsletter:</strong> " . ($newsletter ? 'Yes' : 'No') . "</p>
            <p><strong>Time:</strong> " . date('Y-m-d H:i:s') . "</p>
        ";

        $mail->send();
        $emailSent = true;
    } catch (Exception $e) {
        $emailSent = false;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your message! We\'ll get back to you within 24-48 hours.',
        'emailSent' => $emailSent ?? false
    ]);
    
    exit;
}
?>