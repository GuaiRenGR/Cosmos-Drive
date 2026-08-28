param(
  [ValidateSet('armv7', 'aarch64')]
  [string]$Architecture = $(if ($env:COSMOS_ARCH) { $env:COSMOS_ARCH } else { 'armv7' })
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path $PSScriptRoot).Path
$out = Join-Path (Join-Path $root 'libs') 'arm'; New-Item -ItemType Directory -Force -Path $out | Out-Null
function Find-Tool($name, $envName, $candidates) {
  $configured = [Environment]::GetEnvironmentVariable($envName)
  if ($configured -and (Test-Path -LiteralPath $configured)) { return (Resolve-Path -LiteralPath $configured).Path }
  foreach ($p in $candidates) { if (Test-Path -LiteralPath $p) { return (Resolve-Path -LiteralPath $p).Path } }
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  throw "$name not found. Set $envName or add it to PATH. No download is attempted."
}
$runningWindows = ($env:OS -eq 'Windows_NT' -or $PSVersionTable.PSEdition -eq 'Desktop')
$goName = if ($runningWindows) { 'go.exe' } else { 'go' }
$zigName = if ($runningWindows) { 'zig.exe' } else { 'zig' }
$goCandidates = @()
$zigCandidates = @()
if ($runningWindows) {
  $goCandidates = @((Join-Path $root 'node_modules\.go-sdk\go\bin\go.exe'),(Join-Path $root '..\clash_for_pen\node_modules\.go-sdk\go\bin\go.exe'),(Join-Path $root '..\control\node_modules\.go-sdk\go\bin\go.exe'))
  $zigCandidates = @((Join-Path $root 'tools\zig-0.13.0\zig.exe'),(Join-Path $root '..\doge-comic-net\tools\zig\zig.exe'),(Join-Path $root '..\control\tools\zig\zig.exe'))
}
$go = Find-Tool $goName 'GO_BINARY' $goCandidates
$zig = Find-Tool $zigName 'ZIG_EXE' $zigCandidates
$core = Join-Path $out 'cosmos-drive-core'; $env:GOOS='linux'; $env:CGO_ENABLED='0'; $env:GOMAXPROCS='1'; $env:GOMEMLIMIT='18MiB'; $env:GOGC='50'; $env:GOCACHE=(Join-Path $root '.gocache'); New-Item -ItemType Directory -Force -Path $env:GOCACHE | Out-Null
if ($Architecture -eq 'aarch64') { $env:GOARCH = 'arm64'; Remove-Item Env:GOARM -ErrorAction SilentlyContinue; $zigTarget = 'aarch64-linux-musl'; $zigCpu = 'cortex_a53'; $elfMachine = 0xB7 } else { $env:GOARCH = 'arm'; $env:GOARM = '7'; $zigTarget = 'arm-linux-musleabihf'; $zigCpu = 'cortex_a7'; $elfMachine = 0x28 }
if ($env:COSMOS_ZIG_TARGET) { $zigTarget = $env:COSMOS_ZIG_TARGET }
if ($env:COSMOS_ZIG_CPU) { $zigCpu = $env:COSMOS_ZIG_CPU }
Push-Location (Join-Path $root 'core'); try { & $go build -trimpath -ldflags '-s -w' -o $core .; if ($LASTEXITCODE -ne 0) { throw "Go build failed with exit code $LASTEXITCODE" } } finally { Pop-Location }
$native = Join-Path (Join-Path $root 'native') 'cosmos-drive'; $cache = Join-Path (Join-Path $root '.tmp') 'cosmos-drive-zig-cache'; $obj = Join-Path $cache 'module.o'; New-Item -ItemType Directory -Force -Path $cache | Out-Null; $env:ZIG_GLOBAL_CACHE_DIR=(Join-Path $cache 'global'); $env:ZIG_LOCAL_CACHE_DIR=(Join-Path $cache 'local')
& $zig cc -target $zigTarget -mcpu=$zigCpu -Os -fPIC -fvisibility=hidden -ffunction-sections -fdata-sections -c (Join-Path $native 'module.c') -o $obj; if ($LASTEXITCODE -ne 0) { throw "Zig compile failed with exit code $LASTEXITCODE" }
$so = Join-Path $out 'libjsapi_cosmos_drive.so'; & $zig cc -target $zigTarget -mcpu=$zigCpu -shared -nostdlib '-Wl,--gc-sections' '-Wl,--hash-style=sysv' '-Wl,--build-id=none' '-Wl,-soname,libjsapi_cosmos_drive.so' $obj -o $so; if ($LASTEXITCODE -ne 0) { throw "Zig link failed with exit code $LASTEXITCODE" }

foreach ($elf in @($core, $so)) {
  $bytes = [IO.File]::ReadAllBytes($elf)
  if ($bytes.Length -lt 20 -or $bytes[0] -ne 0x7f -or $bytes[1] -ne 0x45 -or $bytes[2] -ne 0x4c -or $bytes[3] -ne 0x46) { throw "$elf is not ELF" }
  if ($bytes[4] -ne 1 -or $bytes[5] -ne 1 -or $bytes[18] -ne $elfMachine -or $bytes[19] -ne 0x00) { throw "$elf has an unexpected ELF machine for $Architecture" }
}
$symbols = (& $go tool nm $so 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect SO symbols' }
if ($symbols -notmatch 'custom_init_jsapis') { throw 'SO does not export custom_init_jsapis' }
if ($symbols -match '(?i)(time64|stat64|fstat64|lstat64|utimensat64)') { throw 'SO contains a time64/64-bit stat dependency incompatible with the target ARMv7 firmware' }
Write-Host "Built $core"; Write-Host "Built $so"
