git update-ref -d HEAD
git rm --cached -r .

$files = git ls-files -o --exclude-standard

foreach ($file in $files) {
    $f = $file.Trim()
    if ($f -ne '') {
        Write-Host "Committing: $f"
        git add $f
        git commit -m "chore: add $f"
    }
}

git push origin main -f
