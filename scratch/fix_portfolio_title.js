const fs = require('fs');

let p = fs.readFileSync('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/portfolio.html', 'utf8');

p = p.replace(/<title>[^<]+<\/title>/, '<title>Basavaraj H G · Full Stack Developer</title>');

fs.writeFileSync('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/portfolio.html', p, 'utf8');
console.log('Fixed title in portfolio.html');

