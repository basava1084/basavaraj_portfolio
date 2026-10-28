const fs = require('fs');
const content = fs.readFileSync('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/provided_landing.html', 'utf8');

const styleStart = content.indexOf('<style>');
const styleEnd = content.indexOf('</style>');
const style = content.substring(styleStart + 7, styleEnd);
console.log(style);

