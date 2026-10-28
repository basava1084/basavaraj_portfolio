const fs = require('fs');

// Let's create images/photo.jpg from assets/welcome-scene.png
// and see how object-position: 72% 20% works for the portrait wheel
// Wait, can we keep photo.jpg as welcome-scene.png?
// In index.html:
// pimg is the circular wheel portrait.
// wimg is the welcome screen background.
// If pimg uses photo.jpg with object-position: 72% 20%, it perfectly frames his head and shoulders!
// And wimg uses photo.jpg with width: 100%; height: 100%; object-fit: cover; object-position: right center!

console.log('Script ready');

