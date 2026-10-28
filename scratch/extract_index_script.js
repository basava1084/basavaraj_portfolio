const fs = require('fs');

const index = fs.readFileSync('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/index.html', 'utf8');
const scriptStart = index.indexOf('<script>');
const scriptEnd = index.indexOf('</script>');
const script = index.substring(scriptStart + 8, scriptEnd);

fs.writeFileSync('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/scratch/index_script.js', script, 'utf8');
console.log('Saved index_script.js, length:', script.length);

