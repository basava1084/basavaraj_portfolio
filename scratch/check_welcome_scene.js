const fs = require('fs');

const fRef = 'C:/Users/basav/.gemini/antigravity/brain/a1bf7450-c980-4a43-a0e8-b1e2ec97710f/.user_uploaded/media_1793195457567_cc2e0858.png';
const fScene = 'c:/Users/basav/Downloads/portfolio-ref-source/portfolio/assets/welcome-scene.png';
const fBoard = 'c:/Users/basav/Downloads/portfolio-ref-source/portfolio/assets/welcome-board.png';

console.log('fRef size:', fs.statSync(fRef).size);
console.log('fScene size:', fs.statSync(fScene).size);
console.log('fBoard size:', fs.statSync(fBoard).size);

