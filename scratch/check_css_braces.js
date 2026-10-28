const fs = require('fs');

const index = fs.readFileSync('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/index.html', 'utf8');
const styleStart = index.indexOf('<style>');
const styleEnd = index.indexOf('</style>');
const style = index.substring(styleStart + 7, styleEnd);

let openBraces = 0, closeBraces = 0;
for (const char of style) {
  if (char === '{') openBraces++;
  if (char === '}') closeBraces++;
}

console.log('CSS Open braces:', openBraces, 'Close braces:', closeBraces);
if (openBraces === closeBraces) {
  console.log('Braces are perfectly balanced!');
} else {
  console.error('MISMATCH!');
}

