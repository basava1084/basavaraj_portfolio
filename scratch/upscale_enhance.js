const fs = require('fs');
const zlib = require('zlib');

function unfilterPNG(buffer) {
  let pos = 8, width, height, idat = [];
  while (pos < buffer.length) {
    const len = buffer.readUInt32BE(pos);
    const type = buffer.toString('ascii', pos + 4, pos + 8);
    const data = buffer.slice(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const pixels = Buffer.alloc(width * height * 4);

  let rawPos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rawPos++];
    const rowStart = y * stride;
    const prevRowStart = (y - 1) * stride;

    for (let x = 0; x < stride; x++) {
      const bpp = 4;
      const left = x >= bpp ? pixels[rowStart + x - bpp] : 0;
      const up = y > 0 ? pixels[prevRowStart + x] : 0;
      const upLeft = (y > 0 && x >= bpp) ? pixels[prevRowStart + x - bpp] : 0;

      let val = raw[rawPos++];
      if (filter === 1) val = (val + left) & 0xff;
      else if (filter === 2) val = (val + up) & 0xff;
      else if (filter === 3) val = (val + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        let pr;
        if (pa <= pb && pa <= pc) pr = left;
        else if (pb <= pc) pr = up;
        else pr = upLeft;
        val = (val + pr) & 0xff;
      }
      pixels[rowStart + x] = val;
    }
  }
  return { width, height, pixels };
}

function encodePNG(width, height, rgbaBuffer) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // Filter 0
    rgbaBuffer.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c >>> 0;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = crc32(buf.slice(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const srcImg = unfilterPNG(fs.readFileSync('C:/Users/basav/.gemini/antigravity/brain/a1bf7450-c980-4a43-a0e8-b1e2ec97710f/.user_uploaded/media_1793109441255_249ec14e.png'));
const W = srcImg.width;
const H = srcImg.height;

// 1. Remove the floating watermark icons on the right edge (x >= 980, y between 315 and 390)
// Interpolate vertically from y1=310 and y2=395 for each column in x: 980..W-1
const cleanImg = Buffer.from(srcImg.pixels);
const y1 = 312;
const y2 = 396;
for (let y = y1 + 1; y < y2; y++) {
  const t = (y - y1) / (y2 - y1);
  for (let x = 975; x < W; x++) {
    const idx = (y * W + x) * 4;
    const r = srcImg.pixels[idx], g = srcImg.pixels[idx+1], b = srcImg.pixels[idx+2];
    // Check if pixel belongs to the icon (white/bright or purple)
    const isIcon = (r > 220 && g > 220 && b > 220) || (b > 160 && r > 90) || (x >= 990 && (r > 150 || g > 150 || b > 150));
    if (isIcon) {
      const idx1 = (y1 * W + x) * 4;
      const idx2 = (y2 * W + x) * 4;
      cleanImg[idx] = Math.round(srcImg.pixels[idx1] * (1 - t) + srcImg.pixels[idx2] * t);
      cleanImg[idx + 1] = Math.round(srcImg.pixels[idx1 + 1] * (1 - t) + srcImg.pixels[idx2 + 1] * t);
      cleanImg[idx + 2] = Math.round(srcImg.pixels[idx1 + 2] * (1 - t) + srcImg.pixels[idx2 + 2] * t);
    }
  }
}

// 2. High-Quality 2x Upscaling using Bicubic Spline (Catmull-Rom)
const scale = 2;
const outW = W * scale;
const outH = H * scale;
const upscaled = Buffer.alloc(outW * outH * 4);

function cubicWeight(x) {
  const a = -0.5; // Catmull-Rom spline
  x = Math.abs(x);
  if (x <= 1) return (a + 2) * x * x * x - (a + 3) * x * x + 1;
  if (x < 2) return a * x * x * x - 5 * a * x * x + 8 * a * x - 4 * a;
  return 0;
}

console.log('Upscaling to', outW, 'x', outH, '...');

for (let y = 0; y < outH; y++) {
  const srcY = y / scale;
  const iy = Math.floor(srcY);
  const fy = srcY - iy;

  for (let x = 0; x < outW; x++) {
    const srcX = x / scale;
    const ix = Math.floor(srcX);
    const fx = srcX - ix;

    let rSum = 0, gSum = 0, bSum = 0, aSum = 0, wSum = 0;

    for (let m = -1; m <= 2; m++) {
      const py = Math.min(H - 1, Math.max(0, iy + m));
      const wy = cubicWeight(m - fy);

      for (let n = -1; n <= 2; n++) {
        const px = Math.min(W - 1, Math.max(0, ix + n));
        const wx = cubicWeight(n - fx);
        const weight = wx * wy;

        const idx = (py * W + px) * 4;
        rSum += cleanImg[idx] * weight;
        gSum += cleanImg[idx + 1] * weight;
        bSum += cleanImg[idx + 2] * weight;
        aSum += cleanImg[idx + 3] * weight;
        wSum += weight;
      }
    }

    const outIdx = (y * outW + x) * 4;
    upscaled[outIdx] = Math.min(255, Math.max(0, Math.round(rSum / wSum)));
    upscaled[outIdx + 1] = Math.min(255, Math.max(0, Math.round(gSum / wSum)));
    upscaled[outIdx + 2] = Math.min(255, Math.max(0, Math.round(bSum / wSum)));
    upscaled[outIdx + 3] = Math.min(255, Math.max(0, Math.round(aSum / wSum)));
  }
}

// 3. Unsharp Mask Sharpening for razor-sharp clarity
console.log('Applying clarity enhancement & unsharp mask...');
const enhanced = Buffer.from(upscaled);
const stride = outW * 4;

for (let y = 1; y < outH - 1; y++) {
  for (let x = 1; x < outW - 1; x++) {
    const idx = y * stride + x * 4;

    for (let c = 0; c < 3; c++) {
      const center = upscaled[idx + c];
      // 3x3 Laplacian blur
      const blur = (
        upscaled[idx - stride + c] +
        upscaled[idx + stride + c] +
        upscaled[idx - 4 + c] +
        upscaled[idx + 4 + c]
      ) * 0.25;

      const diff = center - blur;
      // Sharpening strength
      let sharp = center + diff * 0.65;

      // Subtle contrast / vibrance enhancement
      // S-curve for contrast:
      const norm = sharp / 255;
      let s;
      if (norm < 0.5) {
        s = Math.pow(norm * 2, 1.08) / 2;
      } else {
        s = 1 - Math.pow((1 - norm) * 2, 1.08) / 2;
      }
      enhanced[idx + c] = Math.min(255, Math.max(0, Math.round(s * 255)));
    }
  }
}

// 4. Save enhanced 2048x1028 Ultra-HD image
const outPng = encodePNG(outW, outH, enhanced);
fs.writeFileSync('assets/welcome-board.png', outPng);
console.log('Saved enhanced Ultra-HD welcome-board.png, bytes:', outPng.length);

