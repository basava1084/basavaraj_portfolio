const fs = require('fs');

// Let's check the pixels on the left side of welcome-scene.png vs welcome-board.png vs profile-portrait.png
// We can use a simple check or check if we have any other images
console.log('Images in assets:');
const files = fs.readdirSync('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/assets');
files.forEach(f => {
  if (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp')) {
    console.log(f);
  }
});

