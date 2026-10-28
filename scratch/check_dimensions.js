const fs = require('fs');

function getJpegSize(filePath) {
  const buf = fs.readFileSync(filePath);
  let i = 0;
  if (buf[i] !== 0xFF || buf[i + 1] !== 0xD8) return null;
  i += 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) return null;
    const marker = buf[i + 1];
    if (marker === 0xC0 || marker === 0xC2) {
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      return { width, height };
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return null;
}

console.log('images/photo.jpg:', getJpegSize('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/images/photo.jpg'));
console.log('images/face.jpg:', getJpegSize('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/images/face.jpg'));

