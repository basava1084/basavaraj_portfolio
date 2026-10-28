const fs = require('fs');

const ref = fs.readFileSync('C:/Users/basav/.gemini/antigravity/brain/a1bf7450-c980-4a43-a0e8-b1e2ec97710f/.user_uploaded/media_1793195457567_cc2e0858.png');
const scene = fs.readFileSync('assets/welcome-scene.png');

console.log('ref length:', ref.length);
console.log('scene length:', scene.length);

