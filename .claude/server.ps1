# Kleiner lokaler Webserver NUR zum Testen durch Claude (der eingebaute Browser
# kann file://-Seiten nicht mit CSS/JS anzeigen). Für die App selbst nicht nötig.
param([int]$Port = 5500)

$wurzel = Split-Path -Parent $PSScriptRoot
$typen = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.js' = 'text/javascript; charset=utf-8'; '.json' = 'application/json'
  '.webmanifest' = 'application/manifest+json'; '.svg' = 'image/svg+xml'
  '.png' = 'image/png'; '.ico' = 'image/x-icon'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Server läuft auf http://localhost:$Port/"

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $pfad = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
  if ($pfad -eq '') { $pfad = 'index.html' }
  $datei = [IO.Path]::GetFullPath((Join-Path $wurzel $pfad))
  $antwort = $ctx.Response
  if ($datei.StartsWith($wurzel) -and (Test-Path $datei -PathType Leaf)) {
    $bytes = [IO.File]::ReadAllBytes($datei)
    $typ = $typen[[IO.Path]::GetExtension($datei)]
    if ($typ) { $antwort.ContentType = $typ }
    $antwort.Headers.Add('Cache-Control', 'no-store')
    $antwort.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $antwort.StatusCode = 404
  }
  $antwort.Close()
}
