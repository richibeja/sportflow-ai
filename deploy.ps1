param(
    [switch]$IncludeMedia = $false
)

$token = $env:GH_TOKEN # Recuérda configurar tu GH_TOKEN en las variables de entorno
$owner = "richibeja"
$repo = "sportflow-ai"
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept"        = "application/vnd.github.v3+json"
    "User-Agent"    = "SportFlow-Deploy-Script"
}

function Get-RemoteFiles($path = "") {
    $url = "https://api.github.com/repos/$owner/$repo/contents/$path"
    try {
        return Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    } catch {
        return $null
    }
}

function Push-File($localPath, $remotePath) {
    if (!(Test-Path $localPath)) {
        Write-Host "File $localPath not found"
        return
    }

    $content = [System.IO.File]::ReadAllBytes((Resolve-Path $localPath))
    $base64Content = [Convert]::ToBase64String($content)
    
    # Get SHA if file exists
    $remoteFile = Get-RemoteFiles -path $remotePath
    $sha = $null
    if ($remoteFile -ne $null) {
        $sha = $remoteFile.sha
    }

    $body = @{
        message = "Update: SportFlow AI Pro v5.0 (Optimized Asset Pipeline)"
        content = $base64Content
    }
    if ($sha -ne $null) {
        $body.sha = $sha
    }

    $bodyJson = $body | ConvertTo-Json -Compress
    $url = "https://api.github.com/repos/$owner/$repo/contents/$remotePath"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Put -Body $bodyJson -ContentType "application/json"
        Write-Host "Successfully pushed $remotePath"
    } catch {
        Write-Host "Failed to push $remotePath : " $_.Exception.Message
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorDetail = $reader.ReadToEnd()
            Write-Host "GitHub Error Details: $errorDetail"
        }
    }
}

# Main Execution
Write-Host "Starting Optimized Deployment to GitHub..."

# Core Files (Always pushed)
Push-File -localPath "index.html" -remotePath "index.html"
Push-File -localPath "master-hub-v564.js" -remotePath "master-hub-v564.js"
Push-File -localPath "css/main.css" -remotePath "css/main.css"
Push-File -localPath "vercel.json" -remotePath "vercel.json"
Push-File -localPath "README.md" -remotePath "README.md"
Push-File -localPath "js/stream-finder.js" -remotePath "js/stream-finder.js"
Push-File -localPath "handshake.html" -remotePath "handshake.html"
Push-File -localPath "match-preview.html" -remotePath "match-preview.html"
Push-File -localPath "404.html" -remotePath "404.html"
Push-File -localPath ".gitignore" -remotePath ".gitignore"

if ($IncludeMedia) {
    Write-Host "Including Media & Assets in deployment..." -ForegroundColor Cyan
    # Media Files
    Push-File -localPath "aura_guide.mp4" -remotePath "aura_guide.mp4"
    Push-File -localPath "1.mp4" -remotePath "1.mp4"
    Push-File -localPath "2.mp4" -remotePath "2.mp4"
    Push-File -localPath "3.mp4" -remotePath "3.mp4"
    Push-File -localPath "4.mp4" -remotePath "4.mp4"

    # Images
    Push-File -localPath "sportflow_hero_bg.png" -remotePath "sportflow_hero_bg.png"
    Push-File -localPath "guru_avatar.png" -remotePath "guru_avatar.png"
    Push-File -localPath "favicon.ico" -remotePath "favicon.ico"
} else {
    Write-Host "Skipping Media Files (Use -IncludeMedia to upload them)" -ForegroundColor Yellow
}

# Always push metadata
Push-File -localPath "robots.txt" -remotePath "robots.txt"
Push-File -localPath "sitemap.xml" -remotePath "sitemap.xml"
Push-File -localPath "generate_landings.py" -remotePath "generate_landings.py"

Write-Host "Deployment Complete!"
