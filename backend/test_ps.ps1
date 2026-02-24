$process = Start-Process npx -ArgumentList "tsx --env-file=.env src/index.ts" -PassThru -NoNewWindow -RedirectStandardOutput "svr.log" -RedirectStandardError "svr_err.log"
Start-Sleep -Seconds 5
try {
    Invoke-WebRequest -Uri "http://localhost:3000/api/submit" -Method Post -Body "{}" -ContentType "application/json"
} catch {
    Write-Host "Request failed: $_"
}
Start-Sleep -Seconds 2
Stop-Process -Id $process.Id
