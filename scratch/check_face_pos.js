const fs = require('fs');

// Check face position in assets/profile-portrait.png
// and in assets/welcome-scene.png
console.log('profile-portrait exists:', fs.existsSync('assets/profile-portrait.png'));
console.log('welcome-scene exists:', fs.existsSync('assets/welcome-scene.png'));

