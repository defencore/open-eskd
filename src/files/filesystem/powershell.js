const psQuote = (value) => "'" + value.replace(/'/g, "''") + "'";

export function generatePowerShell(
  projectId,
  inventory,
  fingerprint,
  placeholders,
) {
  const preamble = `# Open ESKD: Windows PowerShell 5.1 or PowerShell 7. Run from the project directory.
# When saved as a script, an optional first argument selects an existing project directory.
& {
  param([string]$EskdRoot = '.')
  $ErrorActionPreference = 'Stop'
  $EskdRoot = [System.IO.Path]::GetFullPath($EskdRoot)
  if (-not [System.IO.Directory]::Exists($EskdRoot)) { throw 'Choose an existing project directory.' }
  function Test-EskdSafe([string]$RelativePath) {
    $current = $EskdRoot
    foreach ($part in $RelativePath.Split('/')) {
      $current = [System.IO.Path]::Combine($current, $part)
      $item = Get-Item -LiteralPath $current -Force -ErrorAction SilentlyContinue
      if ($item -and ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) { return $false }
    }
    return $true
  }
  function Get-EskdPath([string]$RelativePath) { return [System.IO.Path]::Combine($EskdRoot, $RelativePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)) }
`;
  const ending = "\n} $(if ($args.Count) { $args[0] } else { '.' })\n";
  const create =
    preamble +
    `  function New-EskdDirectory([string]$RelativePath) {
    if (-not (Test-EskdSafe $RelativePath)) { throw ('Unsafe link: ' + $RelativePath) }
    $current = $EskdRoot
    foreach ($part in $RelativePath.Split('/')) {
      $current = [System.IO.Path]::Combine($current, $part)
      if ([System.IO.File]::Exists($current)) { throw ('Directory blocked: ' + $current) }
      [void][System.IO.Directory]::CreateDirectory($current)
    }
  }
` +
    inventory.directories
      .map((path) => '  New-EskdDirectory ' + psQuote(path))
      .join('\n') +
    '\n' +
    (placeholders
      ? `  function New-EskdPlaceholder([string]$RelativePath) {
    $marker = $RelativePath + '.eskd-placeholder'
    if (-not (Test-EskdSafe $RelativePath) -or -not (Test-EskdSafe $marker)) { throw ('Unsafe link: ' + $RelativePath) }
    $file = Get-EskdPath $RelativePath
    $target = Get-EskdPath $marker
    if (-not (Test-Path -LiteralPath $file) -and -not (Test-Path -LiteralPath $target)) {
      $stream = [System.IO.File]::Open($target, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write)
      try { $bytes = [System.Text.Encoding]::UTF8.GetBytes('Open ESKD absence marker. The required file has not been supplied.'); $stream.Write($bytes, 0, $bytes.Length) } finally { $stream.Dispose() }
    }
  }
` +
        inventory.files
          .map((file) => '  New-EskdPlaceholder ' + psQuote(file.path))
          .join('\n') +
        '\n'
      : '') +
    "  Write-Output 'Directories created; existing files preserved. Move your real files into these directories.'" +
    ending;
  const check =
    preamble +
    '  $results = @()\n' +
    inventory.files
      .map(
        (file) => `  $relative = ${psQuote(file.path)}
  $expected = ${psQuote(file.sha256 || '')}
  $file = Get-EskdPath $relative
  $status = 'present'
  if (-not (Test-EskdSafe $relative) -or -not (Test-EskdSafe ($relative + '.eskd-placeholder'))) { $status = 'unsafe' }
  elseif (-not (Test-Path -LiteralPath $file)) { if (Test-Path -LiteralPath ($file + '.eskd-placeholder')) { $status = 'placeholder' } else { $status = 'missing' } }
  elseif (-not [System.IO.File]::Exists($file)) { $status = 'unsafe' }
  elseif ((Get-Item -LiteralPath $file -Force).Length -eq 0) { $status = 'empty' }
  else {
    $stream = $null
    $algorithm = $null
    try {
      $stream = [System.IO.File]::OpenRead($file)
      if ($expected) {
        $algorithm = [System.Security.Cryptography.SHA256]::Create()
        $actual = [System.BitConverter]::ToString($algorithm.ComputeHash($stream)).Replace('-', '').ToLowerInvariant()
        if ($actual -eq $expected) { $status = 'verified' } else { $status = 'mismatch' }
      }
    } catch { $status = 'unreadable' }
    finally { if ($algorithm) { $algorithm.Dispose() }; if ($stream) { $stream.Dispose() } }
  }
  [Console]::Error.WriteLine($status + ': ' + $relative)
  $results += [pscustomobject]@{ path = $relative; status = $status }
`,
      )
      .join('\n') +
    `  [pscustomobject]@{ schema = 'open-eskd-file-check-1'; projectId = ${psQuote(projectId)}; fingerprint = ${psQuote(fingerprint)}; checkedAt = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'); files = @($results) } | ConvertTo-Json -Depth 4
` +
    ending;
  return { create, check, fingerprint, inventory };
}
