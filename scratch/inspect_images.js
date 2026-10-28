const fs = require('fs');

const list = [
  'c:/Users/basav/Downloads/portfolio-ref-source/portfolio/assets/welcome-board.png',
  'c:/Users/basav/Downloads/portfolio-ref-source/portfolio/assets/welcome-scene.png',
  'c:/Users/basav/Downloads/portfolio-ref-source/portfolio/assets/profile-welcome.png',
  'c:/Users/basav/Downloads/portfolio-ref-source/portfolio/assets/profile-portrait.png',
  'c:/Users/basav/Downloads/portfolio-ref-source/portfolio/images/photo.jpg',
  'C:/Users/basav/.gemini/antigravity/brain/a1bf7450-c980-4a43-a0e8-b1e2ec97710f/.user_uploaded/media_1793195457567_cc2e0858.png'
];

function getPngDimensions(buf) {
  if (buf.readUInt32BE(0) !== 0x89504E47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

list.forEach(p => {
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    const buf = fs.readFileSync(p);
    let dims = getPngDimensions(buf);
    console.log(p.split('/').pop(), stat.size, dims);
  }
});

