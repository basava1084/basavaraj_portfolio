const fs = require('fs');
const content = fs.readFileSync('C:/Users/basav/.gemini/antigravity/brain/a1bf7450-c980-4a43-a0e8-b1e2ec97710f/.system_generated/logs/transcript_full.jsonl', 'utf8');
const lines = content.split('\n');
for (const line of lines) {
  if (line.includes('"step_index":2731')) {
    const data = JSON.parse(line);
    const htmlStart = data.content.indexOf('<!DOCTYPE html>');
    const promptText = data.content.substring(0, htmlStart);
    fs.writeFileSync('C:/Users/basav/Downloads/portfolio-ref-source/portfolio/scratch/prompt2731_text.txt', promptText, 'utf8');
    console.log('Saved prompt text, length:', promptText.length);
  }
}

