# PowerShell Script to Create .env File
# This helps you set up your environment variables securely

Write-Host "🔐 Firebase Environment Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  WARNING: .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (yes/no)"
    if ($overwrite -ne "yes") {
        Write-Host "❌ Cancelled. Your existing .env file was not modified." -ForegroundColor Red
        exit
    }
}

Write-Host "📝 Please enter your NEW Firebase credentials" -ForegroundColor Green
Write-Host "   (Get these from: https://console.firebase.google.com/)" -ForegroundColor Gray
Write-Host ""

# Prompt for each value
$apiKey = Read-Host "Enter your Firebase API Key"
$authDomain = Read-Host "Enter your Firebase Auth Domain (or press Enter for default: carpoolv2-c05f3.firebaseapp.com)"
if ([string]::IsNullOrWhiteSpace($authDomain)) {
    $authDomain = "carpoolv2-c05f3.firebaseapp.com"
}

$projectId = Read-Host "Enter your Firebase Project ID (or press Enter for default: carpoolv2-c05f3)"
if ([string]::IsNullOrWhiteSpace($projectId)) {
    $projectId = "carpoolv2-c05f3"
}

$storageBucket = Read-Host "Enter your Firebase Storage Bucket (or press Enter for default: carpoolv2-c05f3.firebasestorage.app)"
if ([string]::IsNullOrWhiteSpace($storageBucket)) {
    $storageBucket = "carpoolv2-c05f3.firebasestorage.app"
}

$messagingSenderId = Read-Host "Enter your Firebase Messaging Sender ID (or press Enter for default: 861636228670)"
if ([string]::IsNullOrWhiteSpace($messagingSenderId)) {
    $messagingSenderId = "861636228670"
}

$appId = Read-Host "Enter your Firebase App ID"

$measurementId = Read-Host "Enter your Firebase Measurement ID (or press Enter for default: G-LYEVEL0QDK)"
if ([string]::IsNullOrWhiteSpace($measurementId)) {
    $measurementId = "G-LYEVEL0QDK"
}

# Validate required fields
if ([string]::IsNullOrWhiteSpace($apiKey) -or [string]::IsNullOrWhiteSpace($appId)) {
    Write-Host ""
    Write-Host "❌ ERROR: API Key and App ID are required!" -ForegroundColor Red
    exit
}

# Create .env file content
$envContent = @"
# Firebase Configuration
# IMPORTANT: This file contains sensitive credentials
# NEVER commit this file to git!

FIREBASE_API_KEY=$apiKey
FIREBASE_AUTH_DOMAIN=$authDomain
FIREBASE_PROJECT_ID=$projectId
FIREBASE_STORAGE_BUCKET=$storageBucket
FIREBASE_MESSAGING_SENDER_ID=$messagingSenderId
FIREBASE_APP_ID=$appId
FIREBASE_MEASUREMENT_ID=$measurementId
"@

# Write to .env file
try {
    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
    Write-Host ""
    Write-Host "✅ SUCCESS! .env file created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Verify the .env file is NOT tracked by git:" -ForegroundColor White
    Write-Host "      git status" -ForegroundColor Gray
    Write-Host "   2. Clear Metro cache and restart:" -ForegroundColor White
    Write-Host "      npx expo start --clear" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔒 Security Reminder:" -ForegroundColor Yellow
    Write-Host "   - NEVER share your .env file" -ForegroundColor White
    Write-Host "   - NEVER commit it to git" -ForegroundColor White
    Write-Host "   - The .gitignore file should protect it" -ForegroundColor White
    Write-Host ""
}
catch {
    Write-Host "❌ ERROR: Failed to create .env file: $_" -ForegroundColor Red
}

