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

const refImg = unfilterPNG(fs.readFileSync('C:/Users/basav/.gemini/antigravity/brain/a1bf7450-c980-4a43-a0e8-b1e2ec97710f/.user_uploaded/media_1793113473766_af030aca.png'));
const srcImg = unfilterPNG(fs.readFileSync('assets/profile-portrait.png'));

console.log('refImg:', refImg.width, refImg.height);
console.log('srcImg:', srcImg.width, srcImg.height);

// In srcImg (1024x576):
// Find face location
// Let's sample nose/beard region in srcImg at x=540..560, y=180..200
// And find where it appears in refImg (1024x513)
let bestDiff = 1e9, bestX = 0, bestY = 0, bestScale = 1;

for (let scale = 0.85; scale <= 1.05; scale += 0.02) {
  for (let y = 100; y <= 220; y += 4) {
    for (let x = 650; x <= 800; x += 4) {
      let diff = 0, count = 0;
      for (let dy = -20; dy <= 20; dy += 4) {
        for (let dx = -20; dx <= 20; dx += 4) {
          const sx = Math.round(550 + dx / scale);
          const sy = Math.round(180 + dy / scale);
          const rx = x + dx;
          const ry = y + dy;
          if (sx >= 0 && sx < srcImg.width && sy >= 0 && sy < srcImg.height &&
              rx >= 0 && rx < refImg.width && ry >= 0 && ry < refImg.height) {
            const sIdx = (sy * srcImg.width + sx) * 4;
            const rIdx = (ry * refImg.width + rx) * 4;
            diff += Math.abs(srcImg.pixels[sIdx] - refImg.pixels[rIdx])
                  + Math.abs(srcImg.pixels[sIdx+1] - refImg.pixels[rIdx+1])
                  + Math.abs(srcImg.pixels[sIdx+2] - refImg.pixels[rIdx+2]);
            count++;
          }
        }
      }
      if (count > 80 && (diff / count) < bestDiff) {
        bestDiff = diff / count;
        bestX = x;
        bestY = y;
        bestScale = scale;
      }
    }
  }
}

console.log('Best match for face:', { bestX, bestY, bestScale, avgDiff: bestDiff / 3 });

