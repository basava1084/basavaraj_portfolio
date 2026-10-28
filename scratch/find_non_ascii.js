const fs = require('fs');

const raw = fs.readFileSync('c:/Users/basav/Downloads/portfolio-ref-source/portfolio/provided_landing.html', 'utf8');

// Search for non-ASCII characters or replacement characters
for (let i = 0; i < raw.length; i++) {
  const code = raw.charCodeAt(i);
  if (code > 127) {
    const snippet = raw.substring(Math.max(0, i - 15), Math.min(raw.length, i + 20));
    console.log(`char at ${i}: code 0x${code.toString(16)} ("${raw[i]}") in: ...${JSON.stringify(snippet)}...`);
    i += 10; // skip a bit
  }
}

