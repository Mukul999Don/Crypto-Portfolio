<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // CoinGecko API endpoint
    $apiUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,inr&include_24hr_change=true';
    
    // Initialize cURL
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $apiUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_USERAGENT => 'Crypto Portfolio Demo/1.0',
        CURLOPT_HTTPHEADER => [
            'Accept: application/json'
        ]
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    if (curl_errno($curl)) {
        throw new Exception('cURL Error: ' . curl_error($curl));
    }
    
    curl_close($curl);
    
    if ($httpCode !== 200) {
        throw new Exception('API request failed with HTTP code: ' . $httpCode);
    }
    
    $data = json_decode($response, true);
    
    if (!$data || !isset($data['bitcoin'])) {
        throw new Exception('Invalid API response format');
    }
    
    $bitcoinData = $data['bitcoin'];
    
    // Format response
    $response = [
        'success' => true,
        'prices' => [
            'usd' => $bitcoinData['usd'],
            'inr' => $bitcoinData['inr']
        ],
        'changes' => [
            'usd_24h' => isset($bitcoinData['usd_24h_change']) ? $bitcoinData['usd_24h_change'] : 0,
            'inr_24h' => isset($bitcoinData['inr_24h_change']) ? $bitcoinData['inr_24h_change'] : 0
        ],
        'timestamp' => date('c'),
        'source' => 'CoinGecko API'
    ];
    
    echo json_encode($response);

} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('c')
    ]);
}
?>