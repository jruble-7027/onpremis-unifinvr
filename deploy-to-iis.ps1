<#
.SYNOPSIS
    Automated Deployment Script for UniFi NVR Portal on Windows Server / IIS

.DESCRIPTION
    This script automates setting up IIS to host the UniFi NVR Portal on your Windows Server.
    It can create a Virtual Application under the Default Web Site (e.g., http://<server>/nvr-portal)
    or set up a dedicated site on a custom port.

.EXAMPLE
    # Run in an elevated PowerShell prompt on the Windows Server:
    .\deploy-to-iis.ps1
#>

[CmdletBinding()]
param(
    [string]$TargetDir = "C:\inetpub\wwwroot\nvr-portal",
    [string]$VirtualAppName = "nvr-portal",
    [string]$SiteName = "Default Web Site",
    [int]$CustomPort = 0 # Set to e.g. 8088 if you want a dedicated website instead of a virtual app
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  UniFi Protect NVR Portal - IIS Deployment for Windows   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Administrator Privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Warning "This script requires Administrator privileges. Please re-run PowerShell as Administrator."
    exit 1
}

# 2. Check and Install IIS Web-Server feature if not present
Write-Host "[1/5] Checking IIS installation..." -ForegroundColor Yellow
$iisFeature = Get-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole -ErrorAction SilentlyContinue

if ($iisFeature -and $iisFeature.State -eq 'Enabled') {
    Write-Host "      IIS is already installed." -ForegroundColor Green
} else {
    Write-Host "      Installing IIS Web Server and Static Content..." -ForegroundColor Cyan
    try {
        Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-StaticContent, IIS-DefaultDocument -All -NoRestart
        Write-Host "      IIS installation completed." -ForegroundColor Green
    } catch {
        Write-Error "Failed to install IIS. Error: $_"
        exit 1
    }
}

# Import IIS Administration Module
Import-Module WebAdministration -ErrorAction SilentlyContinue

# 3. Create target directory and copy portal files
Write-Host "[2/5] Copying portal files to $TargetDir..." -ForegroundColor Yellow
if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
}

$sourceDir = $PSScriptRoot
$filesToCopy = @("index.html", "styles.css", "app.js", "config.js", "web.config")

foreach ($file in $filesToCopy) {
    $srcFile = Join-Path $sourceDir $file
    if (Test-Path $srcFile) {
        Copy-Item -Path $srcFile -Destination $TargetDir -Force
        Write-Host "      Copied: $file" -ForegroundColor Gray
    } else {
        Write-Warning "      File not found in source directory: $file"
    }
}

# 4. Configure IIS Application or Site
Write-Host "[3/5] Configuring IIS Application..." -ForegroundColor Yellow

if ($CustomPort -gt 0) {
    # Dedicated Website mode
    $customSiteName = "UniFi-NVR-Portal"
    if (Get-Website -Name $customSiteName -ErrorAction SilentlyContinue) {
        Remove-Website -Name $customSiteName
    }
    New-Website -Name $customSiteName -Port $CustomPort -PhysicalPath $TargetDir -ApplicationPool "DefaultAppPool" | Out-Null
    Write-Host "      Created dedicated website '$customSiteName' on port $CustomPort" -ForegroundColor Green
} else {
    # Virtual Application under Default Web Site mode (http://<server>/nvr-portal)
    if (-not (Get-Website -Name $SiteName -ErrorAction SilentlyContinue)) {
        Write-Host "      '$SiteName' not found. Starting default site or creating on port 80..." -ForegroundColor Yellow
        Start-Website -Name $SiteName -ErrorAction SilentlyContinue
    }

    $existingApp = Get-WebApplication -Site $SiteName | Where-Object { $_.path -eq "/$VirtualAppName" }
    if ($existingApp) {
        Write-Host "      IIS Virtual Application '/$VirtualAppName' already exists. Updating physical path..." -ForegroundColor Green
        Set-ItemProperty "IIS:\Sites\$SiteName\$VirtualAppName" -Name physicalPath -Value $TargetDir
    } else {
        Write-Host "      Creating Virtual Application '/$VirtualAppName' under '$SiteName'..." -ForegroundColor Green
        New-WebApplication -Site $SiteName -Name $VirtualAppName -PhysicalPath $TargetDir -ApplicationPool "DefaultAppPool" | Out-Null
    }
}

# 5. Check Windows Firewall
Write-Host "[4/5] Checking Windows Firewall..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "World Wide Web Services (HTTP Traffic-In)" -ErrorAction SilentlyContinue
if ($firewallRule) {
    Enable-NetFirewallRule -DisplayName "World Wide Web Services (HTTP Traffic-In)" | Out-Null
    Write-Host "      Firewall rule for HTTP (Port 80) is enabled." -ForegroundColor Green
} else {
    Write-Host "      Creating firewall rule for HTTP..." -ForegroundColor Gray
    New-NetFirewallRule -DisplayName "HTTP Web Server (Port 80)" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow | Out-Null
}

# 6. Display Summary & Access URLs
Write-Host "[5/5] Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "                  ACCESS INFORMATION                      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$serverHostname = [System.Net.Dns]::GetHostName()
$ipList = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" }).IPAddress

Write-Host "You can share any of these URLs with your Principal and staff:" -ForegroundColor White
Write-Host ""

if ($CustomPort -gt 0) {
    Write-Host "  • http://${serverHostname}:${CustomPort}/" -ForegroundColor Green
    foreach ($ip in $ipList) {
        Write-Host "  • http://${ip}:${CustomPort}/" -ForegroundColor Green
    }
} else {
    Write-Host "  • http://${serverHostname}/${VirtualAppName}/" -ForegroundColor Green
    foreach ($ip in $ipList) {
        Write-Host "  • http://${ip}/${VirtualAppName}/" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "To customize the NVR names, IPs, and zones, edit:" -ForegroundColor Gray
Write-Host "  $TargetDir\config.js" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
