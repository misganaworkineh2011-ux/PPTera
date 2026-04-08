const fs = require('fs');

const files = [
  './src/app/api/ai/edit-presentation/route.ts',
  './src/app/api/ai/edit-presentation-stream/route.ts',
  './src/app/api/ai/edit-slide/route.ts',
  './src/app/api/ai/enhance-text/route.ts',
  './src/app/api/ai/generate-slide/route.ts',
  './src/app/api/generate/route.ts',
  './src/app/api/generate-outline/route.ts',
  './src/app/api/generate-outline/stream/route.ts',
  './src/app/api/presentations/[id]/stream-content/route.ts',
  './src/lib/presentation/llm-layout-suggester.ts',
  './src/lib/presentation/transform-outline-to-presentation.ts'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Fix syntax error from my previous regex
  content = content.replace(/\} catch \(\)\s*\{\s*throw\s*;\s*\}/g, '} catch (err) { throw err; }');
  
  // Replace references
  content = content.replace(/gemini-1\.5-flash/g, 'gemini-2.5-flash-lite');
  content = content.replace(/gemini-1\.5-pro/g, 'gemini-2.5-flash-lite');
  content = content.replace(/gemini-flash-latest/g, 'gemini-2.5-flash-lite');
  
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed syntax and updated model string.');
