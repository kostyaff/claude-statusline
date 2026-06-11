# Claude Code statusline installer (Windows / PowerShell)
# Usage (one-liner):
#   irm https://raw.githubusercontent.com/kostyaff/claude-statusline/main/install.ps1 | iex
$ErrorActionPreference = "Stop"

$RawBase  = "https://raw.githubusercontent.com/kostyaff/claude-statusline/main"
$ClaudeDir = Join-Path $env:USERPROFILE ".claude"
$Target    = Join-Path $ClaudeDir "statusline.js"
$Settings  = Join-Path $ClaudeDir "settings.json"

if (-not (Test-Path $ClaudeDir)) { New-Item -ItemType Directory -Path $ClaudeDir | Out-Null }

# 1. Get statusline.js — from a local clone if present, otherwise download.
$LocalScript = Join-Path $PSScriptRoot "statusline.js"
if ($PSScriptRoot -and (Test-Path $LocalScript)) {
    Copy-Item $LocalScript $Target -Force
    Write-Host "Copied statusline.js from local folder."
} else {
    Invoke-RestMethod "$RawBase/statusline.js" -OutFile $Target
    Write-Host "Downloaded statusline.js."
}

# 2. Merge the statusLine entry into settings.json (preserving everything else).
$cmd = 'node "' + ($Target -replace '\\','/') + '"'
$node = @"
const fs=require('fs');
const p=process.argv[1], cmd=process.argv[2];
let s={}; try{ s=JSON.parse(fs.readFileSync(p,'utf8')); }catch(e){}
s.statusLine={type:'command',command:cmd};
fs.writeFileSync(p, JSON.stringify(s,null,2));
"@
node -e $node $Settings $cmd

Write-Host ""
Write-Host "Done! Statusline installed. Restart Claude Code (or wait a tick) to see it." -ForegroundColor Green
