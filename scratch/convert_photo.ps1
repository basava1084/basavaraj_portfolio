Add-Type -AssemblyName System.Drawing
$dir = "c:\Users\basav\Downloads\portfolio-ref-source\portfolio\images"
$src = "c:\Users\basav\Downloads\portfolio-ref-source\portfolio\assets\welcome-scene.png"
$img = [System.Drawing.Image]::FromFile($src)

# Create 24-bit RGB bitmap
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::FromArgb(14, 26, 47))
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)
$g.Dispose()
$img.Dispose()

# Save with 95 quality JPEG
$encoder = [System.Drawing.Imaging.Encoder]::Quality
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, [long]95)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }

$bmp.Save("$dir\photo.jpg", $jpegCodec, $encoderParams)
$bmp.Dispose()

Write-Host "Updated images\photo.jpg successfully from welcome-scene.png!"

