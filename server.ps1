$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8080

try {
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add("http://127.0.0.1:$port/")
  $listener.Start()
  Write-Host "Server запущен на http://127.0.0.1:$port"
  Start-Process "http://127.0.0.1:$port"
  
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $resp = $ctx.Response
    $path = $req.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    $fullPath = Join-Path $root $path.Substring(1)
    
    if (Test-Path $fullPath) {
      $data = [System.IO.File]::ReadAllBytes($fullPath)
      $ext = [System.IO.Path]::GetExtension($path)
      $ct = switch ($ext) {
        ".js" { "application/javascript; charset=utf-8" }
        ".css" { "text/css; charset=utf-8" }
        ".html" { "text/html; charset=utf-8" }
      ".png" { "image/png" }
      ".jpg" { "image/jpeg" }
      ".jpeg" { "image/jpeg" }
      ".mp3" { "audio/mpeg" }
      default { "application/octet-stream" }
      }
      $resp.ContentType = $ct
      $resp.Headers.Add("Cache-Control", "no-cache, must-revalidate")
      $resp.Headers.Add("Pragma", "no-cache")
      $resp.ContentLength64 = $data.Length
      $resp.OutputStream.Write($data, 0, $data.Length)
    } else {
      $resp.StatusCode = 404
    }
    $resp.Close()
  }
} catch {
  Write-Host "Ошибка: $_"
  Read-Host "Нажми Enter для выхода"
} finally {
  if ($listener -and $listener.IsListening) { $listener.Stop() }
}
