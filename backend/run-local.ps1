$ErrorActionPreference = "Stop"

$backendRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $backendRoot

function Import-EnvFile([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) { return }
    foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith("#")) { continue }
        $name, $value = $trimmed -split "=", 2
        if ($name -and $null -ne $value) {
            Set-Item -Path "Env:$($name.Trim())" -Value $value.Trim()
        }
    }
}

Import-EnvFile (Join-Path $projectRoot "docker\.env")
Import-EnvFile (Join-Path $backendRoot ".env")

if ($env:MINIO_ROOT_USER) { $env:MINIO_ACCESS_KEY = $env:MINIO_ROOT_USER }
if ($env:MINIO_ROOT_PASSWORD) { $env:MINIO_SECRET_KEY = $env:MINIO_ROOT_PASSWORD }

if (-not $env:DB_PASSWORD -or $env:DB_PASSWORD -eq "replace_with_database_password") {
    throw "请先在 backend/.env 中填写 DB_PASSWORD"
}

& (Join-Path $backendRoot "mvnw.cmd") spring-boot:run
