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
    raw[y * (stride + 1)] = 0;
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

const img1 = unfilterPNG(fs.readFileSync('C:/Users/basav/.gemini/antigravity/brain/a1bf7450-c980-4a43-a0e8-b1e2ec97710f/.user_uploaded/media_1793107489883_193e14c4.png'));
const outPixels = Buffer.from(img1.pixels);

// The text box is roughly x in [65, 520], y in [210, 460].
// In this region, any pixel that is bright (text, gold, etc.) should be replaced with the background gradient.
// In this region:
// Left boundary: x < 70 has background colors.
// Top boundary: y = 205 has background colors.
// Bottom boundary: y = 465 has background colors.
// We can compute the background at any (x, y) by interpolating between the top and bottom rows (or left),
// or bilinear interpolation:
const yTop = 200;
const yBot = 465;

for (let y = yTop; y <= yBot; y++) {
  const t = (y - yTop) / (yBot - yTop);
  for (let x = 60; x <= 525; x++) {
    const idx = (y * img1.width + x) * 4;
    const r = img1.pixels[idx], g = img1.pixels[idx+1], b = img1.pixels[idx+2];
    
    // Check if pixel is text / gold / bright
    const isText = (r > 100 || g > 90 || b > 90) || (r > 60 && g > 50 && b < 40); // gold
    
    if (isText) {
      // Interpolate from top pixel and bottom pixel at this column x
      const idxTop = (yTop * img1.width + x) * 4;
      const idxBot = (yBot * img1.width + x) * 4;
      
      const bgR = Math.round(img1.pixels[idxTop] * (1 - t) + img1.pixels[idxBot] * t);
      const bgG = Math.round(img1.pixels[idxTop + 1] * (1 - t) + img1.pixels[idxBot + 1] * t);
      const bgB = Math.round(img1.pixels[idxTop + 2] * (1 - t) + img1.pixels[idxBot + 2] * t);
      
      outPixels[idx] = bgR;
      outPixels[idx + 1] = bgG;
      outPixels[idx + 2] = bgB;
    }
  }
}

// Write the clean welcome scene image!
const png = encodePNG(img1.width, img1.height, outPixels);
fs.writeFileSync('assets/welcome-scene.png', png);
console.log('Saved assets/welcome-scene.png, size:', png.length);

