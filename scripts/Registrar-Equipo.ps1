# Ejecutar en Windows PowerShell desde la carpeta raiz del repositorio:
# powershell -ExecutionPolicy Bypass -File .\scripts\Registrar-Equipo.ps1
# Los datos se leen EN ESTE EQUIPO; no son valores de ejemplo.
$ErrorActionPreference = 'Stop'
$destino = Join-Path (Get-Location) 'docs\s2\evidencias'
New-Item -Path $destino -ItemType Directory -Force | Out-Null
$cpu = (Get-CimInstance Win32_Processor | Select-Object -First 1).Name
$ram = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
$fecha = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz')
$salida = @(
  'REGISTRO DE EQUIPO - SISTEMAS DISTRIBUIDOS',
  "Fecha y hora: $fecha",
  "Procesador: $cpu",
  "RAM total: $ram GB",
  'Fuente: Win32_Processor / Win32_ComputerSystem (WMI)'
)
$salida | Tee-Object -FilePath (Join-Path $destino '00-entorno.txt')
Write-Host 'Captura esta ventana con Win+Shift+S y guardala en docs/s2/evidencias/00-entorno-terminal.png' -ForegroundColor Cyan
# Ficha visual basada SOLO en las lecturas reales del equipo.
Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::new(1250, 420)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.Clear([System.Drawing.Color]::FromArgb(14, 28, 46))
$fuenteCab = [System.Drawing.Font]::new('Consolas', 26, [System.Drawing.FontStyle]::Bold)
$fuente = [System.Drawing.Font]::new('Consolas', 19)
$blanco = [System.Drawing.Brushes]::White
$accent = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(66, 211, 183))
$gfx.DrawString('LECTURA REAL DEL EQUIPO', $fuenteCab, $accent, 35, 35)
$y = 112
foreach ($linea in $salida) {
  $gfx.DrawString($linea, $fuente, $blanco, 35, $y)
  $y += 52
}
$rutaPNG = Join-Path $destino '00-entorno-ficha.png'
$bmp.Save($rutaPNG, [System.Drawing.Imaging.ImageFormat]::Png)
$gfx.Dispose(); $bmp.Dispose(); $fuente.Dispose(); $fuenteCab.Dispose(); $accent.Dispose()
Write-Host "Ficha generada con datos reales: $rutaPNG" -ForegroundColor Green
