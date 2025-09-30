# Carpool App Quick Start Script for Windows PowerShell
# This automates the setup and testing process

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Carpool App - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found" -ForegroundColor Red
    Write-Host "Please run this script from the CarpoolApp directory" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Initializing Firebase test data..." -ForegroundColor Yellow
Write-Host "(This may take a moment...)" -ForegroundColor Gray
node initialize-firebase-testdata.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Firebase initialization had issues (this is okay if data already exists)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Firebase initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Running automated tests..." -ForegroundColor Yellow
node run-tests.js
$testResult = $LASTEXITCODE

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($testResult -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed, but you can still proceed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📱 Next Steps:" -ForegroundColor Cyan
Write-Host "1. The app will start in a moment..." -ForegroundColor White
Write-Host "2. Install 'Expo Go' app on your phone" -ForegroundColor White
Write-Host "3. Scan the QR code that appears" -ForegroundColor White
Write-Host "4. Test login with: +972500000001" -ForegroundColor White
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Cyan
Write-Host "  Parent: +972500000001 (has car)" -ForegroundColor White
Write-Host "  Student: +972510000001 (kid)" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server anytime" -ForegroundColor Gray
Write-Host ""

# Ask user if they want to start the app
Write-Host "Ready to start the app? (Y/N) " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y" -or $response -eq "") {
    Write-Host ""
    Write-Host "Starting Expo development server..." -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    npm start
} else {
    Write-Host ""
    Write-Host "To start later, run: npm start" -ForegroundColor Yellow
    Write-Host ""
}


