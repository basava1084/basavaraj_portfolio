const fs = require('fs');

function checkPixels(file) {
  const buf = fs.readFileSync(file);
  console.log(file, 'size:', buf.length);
}

checkPixels('assets/profile-portrait.png');
checkPixels('assets/welcome-board.png');
checkPixels('assets/welcome-scene.png');
checkPixels('assets/profile-welcome.png');

