const fs = require('fs');
const glob = require('glob');
const path = require('path');

function replaceInDir(dir, oldStr, newStr) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath, oldStr, newStr);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(oldStr)) {
        content = content.split(oldStr).join(newStr);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

replaceInDir('./src', 'gemini-1.5-flash', 'gemini-2.5-flash-lite');
