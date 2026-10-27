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

// Check top of hair in refImg (around x=750..770)
let topY = 0;
for (let y = 0; y < 200; y++) {
  const idx = (y * refImg.width + 750) * 4;
  const r = refImg.pixels[idx], g = refImg.pixels[idx+1], b = refImg.pixels[idx+2];
  // hair is dark: r < 60, g < 50, b < 50
  if (r < 70 && g < 60 && b < 60) {
    topY = y;
    break;
  }
}
console.log('Top of hair in refImg is around y =', topY);

// Check bottom belt in refImg (around x=740..770, y from 400 down)
let beltY = 0;
for (let y = 440; y < refImg.height; y++) {
  const idx = (y * refImg.width + 740) * 4;
  const r = refImg.pixels[idx], g = refImg.pixels[idx+1], b = refImg.pixels[idx+2];
  // belt buckle has silver/metal: r > 100, g > 100, b > 100
  if (r > 100 && g > 100 && b > 100 && Math.abs(r-g) < 20 && Math.abs(g-b) < 20) {
    beltY = y;
    break;
  }
}
console.log('Belt buckle in refImg is around y =', beltY);

