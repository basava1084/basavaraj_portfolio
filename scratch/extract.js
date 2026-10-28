const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/basav/.gemini/antigravity/brain/a1bf7450-c980-4a43-a0e8-b1e2ec97710f/.system_generated/logs/transcript_full.jsonl'),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  if (line.includes('"step_index":2731')) {
    const data = JSON.parse(line);
    const content = data.content;
    const htmlStart = content.indexOf('<!DOCTYPE html>');
    if (htmlStart !== -1) {
      const htmlEnd = content.lastIndexOf('</html>') + 7;
      const html = content.substring(htmlStart, htmlEnd);
      fs.writeFileSync('C:/Users/basav/Downloads/portfolio-ref-source/portfolio/provided_landing.html', html, 'utf8');
      console.log('Successfully extracted provided_landing.html from step 2731, length:', html.length);
    } else {
      console.log('<!DOCTYPE html> not found in step 2731');
    }
  }
});

