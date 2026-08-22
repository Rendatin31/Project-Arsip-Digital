# Test FCM Notification via PowerShell
# This bypasses browser copy-paste issues

Write-Host "=== Testing FCM Notification ===" -ForegroundColor Cyan
Write-Host ""

# STEP 1: Get Service Role Key
Write-Host "STEP 1: Get your Supabase Service Role Key" -ForegroundColor Yellow
Write-Host "1. Open: https://app.supabase.com/project/axpanhequppcviaimwte/settings/api" -ForegroundColor Gray
Write-Host "2. Scroll down to 'service_role' key (secret)" -ForegroundColor Gray
Write-Host "3. Click 'Reveal' and copy the key" -ForegroundColor Gray
Write-Host ""
$serviceRoleKey = Read-Host "Paste your service_role key here"

if ([string]::IsNullOrWhiteSpace($serviceRoleKey)) {
    Write-Host "Error: Service role key is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "STEP 2: Sending test notification..." -ForegroundColor Yellow

# Prepare request
$headers = @{
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type" = "application/json"
}

$body = @{
    userId = "e914e98a-d34c-4710-9dd2-f2f602a96379"
    title = "Test FCM dari PowerShell"
    message = "Ini adalah test notifikasi FCM yang dikirim via PowerShell script"
    type = "test"
} | ConvertTo-Json

$uri = "https://axpanhequppcviaimwte.supabase.co/functions/v1/send-fcm-notification"

try {
    Write-Host "Invoking Edge Function..." -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
    
    Write-Host ""
    Write-Host "=== SUCCESS! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | Format-List
    
    Write-Host ""
    Write-Host "CHECK YOUR ANDROID DEVICE NOW!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "You should see a notification!" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "=== ERROR ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message:" -ForegroundColor Red
    
    $errorBody = $_.ErrorDetails.Message
    if ($errorBody) {
        $errorBody | ConvertFrom-Json | Format-List
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
