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

const img1 = unfilterPNG(fs.readFileSync('C:/Users/basav/.gemini/antigravity/brain/a1bf7450-c980-4a43-a0e8-b1e2ec97710f/.user_uploaded/media_1793107489883_193e14c4.png'));

// Sample pixels around y=330..360, x=75..300 where 'I’m Basavaraj H G' is
const colors = [];
for (let y = 330; y < 360; y++) {
  for (let x = 75; x < 300; x++) {
    const idx = (y * img1.width + x) * 4;
    const r = img1.pixels[idx], g = img1.pixels[idx+1], b = img1.pixels[idx+2];
    if (r > 190 && g > 140 && g < 190 && b < 100) {
      colors.push({ r, g, b });
    }
  }
}

if (colors.length) {
  const avgR = Math.round(colors.reduce((a, c) => a + c.r, 0) / colors.length);
  const avgG = Math.round(colors.reduce((a, c) => a + c.g, 0) / colors.length);
  const avgB = Math.round(colors.reduce((a, c) => a + c.b, 0) / colors.length);
  console.log('Average gold text color:', { avgR, avgG, avgB }, `hex: #${avgR.toString(16)}${avgG.toString(16)}${avgB.toString(16)}`);
}

