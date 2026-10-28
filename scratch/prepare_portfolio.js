const fs = require('fs');

const original = fs.readFileSync('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/_old_landing_backup/index.html', 'utf8');

// Find where <div class="intro-portal" starts and ends
const portalStart = original.indexOf('<!-- NEW INTERACTIVE PARTICLE LANDING PORTAL -->');
const portalEnd = original.indexOf('</div>\n\n<header class="nav">');

console.log('portalStart index:', portalStart);
console.log('portalEnd index:', portalEnd);

let portfolioHtml = '';

if (portalStart !== -1 && portalEnd !== -1) {
  // Before portal, replace <body> with <body class="ld">
  let beforePortal = original.substring(0, portalStart);
  beforePortal = beforePortal.replace('<body>', '<body class="ld">');
  
  // After portal (skipping the closing </div> of intro-portal)
  let afterPortal = original.substring(portalEnd + 6); // start at \n\n<header class="nav">
  
  // Update logo link to navigate back to index.html (landing page)
  afterPortal = afterPortal.replace('<a class="logo" href="#top" id="logoIntroBtn"', '<a class="logo" href="index.html" id="logoIntroBtn"');
  
  portfolioHtml = beforePortal + afterPortal;
} else {
  console.error('Could not locate introPortal markers!');
  process.exit(1);
}

fs.writeFileSync('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/portfolio.html', portfolioHtml, 'utf8');
console.log('Successfully wrote portfolio.html, length:', portfolioHtml.length);

