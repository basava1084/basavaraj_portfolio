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

const img = unfilterPNG(fs.readFileSync('C:/Users/basav/.gemini/antigravity/brain/a1bf7450-c980-4a43-a0e8-b1e2ec97710f/.user_uploaded/media_1793113077793_4ae90a6f.png'));
console.log('Image dimensions:', img.width, img.height);

// 1. Welcome text bounding box
let minWx = 9999, maxWx = -1, minWy = 9999, maxWy = -1;
for (let y = 0; y < img.height; y++) {
  for (let x = 0; x < 550; x++) {
    const idx = (y * img.width + x) * 4;
    const r = img.pixels[idx], g = img.pixels[idx+1], b = img.pixels[idx+2];
    if (r > 240 && g > 240 && b > 240 && y < 330) {
      if (x < minWx) minWx = x;
      if (x > maxWx) maxWx = x;
      if (y < minWy) minWy = y;
      if (y > maxWy) maxWy = y;
    }
  }
}
console.log('Welcome bounds:', { minWx, maxWx, minWy, maxWy, w: maxWx - minWx, h: maxWy - minWy });

// 2. Gold text bounds
let minGx = 9999, maxGx = -1, minGy = 9999, maxGy = -1;
for (let y = 320; y < 400; y++) {
  for (let x = 0; x < 550; x++) {
    const idx = (y * img.width + x) * 4;
    const r = img.pixels[idx], g = img.pixels[idx+1], b = img.pixels[idx+2];
    if (r > 170 && g > 120 && g < 185 && b < 90) {
      if (x < minGx) minGx = x;
      if (x > maxGx) maxGx = x;
      if (y < minGy) minGy = y;
      if (y > maxGy) maxGy = y;
    }
  }
}
console.log('Gold text bounds:', { minGx, maxGx, minGy, maxGy, w: maxGx - minGx, h: maxGy - minGy });

// 3. Subtitle bounds
let minSx = 9999, maxSx = -1, minSy = 9999, maxSy = -1;
for (let y = 390; y < 430; y++) {
  for (let x = 0; x < 550; x++) {
    const idx = (y * img.width + x) * 4;
    const r = img.pixels[idx], g = img.pixels[idx+1], b = img.pixels[idx+2];
    if (r > 190 && g > 190 && b > 190) {
      if (x < minSx) minSx = x;
      if (x > maxSx) maxSx = x;
      if (y < minSy) minSy = y;
      if (y > maxSy) maxSy = y;
    }
  }
}
console.log('Subtitle bounds:', { minSx, maxSx, minSy, maxSy, w: maxSx - minSx, h: maxSy - minSy });

// 4. Gold bar bounds
let minBx = 9999, maxBx = -1, minBy = 9999, maxBy = -1;
for (let y = 430; y < 470; y++) {
  for (let x = 0; x < 550; x++) {
    const idx = (y * img.width + x) * 4;
    const r = img.pixels[idx], g = img.pixels[idx+1], b = img.pixels[idx+2];
    if (r > 140 && g > 100 && b < 80) {
      if (x < minBx) minBx = x;
      if (x > maxBx) maxBx = x;
      if (y < minBy) minBy = y;
      if (y > maxBy) maxBy = y;
    }
  }
}
console.log('Bar bounds:', { minBx, maxBx, minBy, maxBy, w: maxBx - minBx, h: maxBy - minBy });

