# Theme Refactor Script - Replace Cyan with Orange
# This script replaces all cyan color codes with orange equivalents

$files = Get-ChildItem -Path "src" -Include *.jsx,*.js,*.css -Recurse

$replacements = @{
    '#00ADB5' = '#FE9A00'
    '#1ac5cd' = '#FF9F0A'
    '#00d4dd' = '#FFA500'
    'rgba(0, 173, 181,' = 'rgba(254, 154, 0,'
    'rgba(0,173,181,' = 'rgba(254,154,0,'
}

$fileCount = 0
$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }
    
    $originalContent = $content
    $fileReplacements = 0
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $new
            $fileReplacements++
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fileCount++
        $totalReplacements += $fileReplacements
        Write-Host "Updated: $($file.Name) - $fileReplacements replacements" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "Theme Refactor Complete!" -ForegroundColor Green
Write-Host "Files updated: $fileCount"
Write-Host "Total replacements: $totalReplacements"
Write-Host "========================================"
