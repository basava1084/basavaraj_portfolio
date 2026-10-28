const fs = require('fs');
const content = fs.readFileSync('C:/Users/basav/.gemini/antigravity/brain/a1bf7450-c980-4a43-a0e8-b1e2ec97710f/.system_generated/logs/transcript_full.jsonl', 'utf8');
const lines = content.split('\n');
for (const line of lines) {
  if (line.includes('"step_index":2731')) {
    const data = JSON.parse(line);
    const m = data.content.match(/\{k:'([^']+)',t:'Deploy'/);
    if (m) console.log('Deploy k:', m[1], 'charCodes:', Array.from(m[1]).map(c => c.charCodeAt(0).toString(16)));
    const m2 = data.content.match(/Skip to portfolio ([^<"]+)/);
    if (m2) console.log('Skip link arrow:', m2[1], 'charCodes:', Array.from(m2[1]).map(c => c.charCodeAt(0).toString(16)));
    const m3 = data.content.match(/Enter portfolio<span>([^<]+)<\/span>/);
    if (m3) console.log('Enter arrow:', m3[1], 'charCodes:', Array.from(m3[1]).map(c => c.charCodeAt(0).toString(16)));
    const m4 = data.content.match(/<title>([^<]+)<\/title>/);
    if (m4) console.log('Title:', m4[1], 'charCodes:', Array.from(m4[1]).map(c => c.charCodeAt(0).toString(16)));
  }
}

