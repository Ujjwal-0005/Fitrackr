# PowerShell script to remove all logger imports and replace logger calls with console

$files = @(
    "c:\GymTrackr\backend\src\utils\goalRecalculation.js",
    "c:\GymTrackr\backend\src\services\geminiNutritionService.js",
    "c:\GymTrackr\backend\src\services\calorieNinjasService.js",
    "c:\GymTrackr\backend\src\routes\goalRoutes.js",
    "c:\GymTrackr\backend\src\middleware\nutritionRateLimiter.js",
    "c:\GymTrackr\backend\src\middleware\authmiddleware.js",
    "c:\GymTrackr\backend\src\controllers\userProgressController.js",
    "c:\GymTrackr\backend\src\controllers\workoutPlansController.js",
    "c:\GymTrackr\backend\src\controllers\userController.js",
    "c:\GymTrackr\backend\src\controllers\templateController.js",
    "c:\GymTrackr\backend\src\controllers\streakController.js",
    "c:\GymTrackr\backend\src\controllers\statsController.js",
    "c:\GymTrackr\backend\src\controllers\smartGoalController.js",
    "c:\GymTrackr\backend\src\controllers\sessionController.js",
    "c:\GymTrackr\backend\src\controllers\personalRecordController.js",
    "c:\GymTrackr\backend\src\controllers\nutritionController.js",
    "c:\GymTrackr\backend\src\controllers\exerciseController.js",
    "c:\GymTrackr\backend\src\controllers\authController.js",
    "c:\GymTrackr\backend\src\controllers\customSessionController.js",
    "c:\GymTrackr\backend\src\controllers\aiController.js",
    "c:\GymTrackr\backend\src\controllers\adminController.js",
    "c:\GymTrackr\backend\src\controllers\achievementController.js",
    "c:\GymTrackr\backend\src\config\email.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        
        # Read file content
        $content = Get-Content $file -Raw
        
        # Remove logger import lines
        $content = $content -replace "import logger from ['\`"]\.\.\/utils\/logger\.js['\`"];?\r?\n", ""
        
        # Replace logger.log with console.log
        $content = $content -replace "logger\.log\(", "console.log("
        
        # Replace logger.error with console.error
        $content = $content -replace "logger\.error\(", "console.error("
        
        # Replace logger.warn with console.warn
        $content = $content -replace "logger\.warn\(", "console.warn("
        
        # Replace logger.info with console.info
        $content = $content -replace "logger\.info\(", "console.info("
        
        # Replace logger.debug with console.debug
        $content = $content -replace "logger\.debug\(", "console.debug("
        
        # Write back to file
        Set-Content $file -Value $content -NoNewline
        
        Write-Host "  ✅ Updated: $file"
    } else {
        Write-Host "  ⚠️ File not found: $file"
    }
}

Write-Host "`n✅ All files processed - logger references removed!"
