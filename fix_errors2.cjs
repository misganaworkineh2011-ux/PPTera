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
files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/catch \(\)\s*\{\s*throw\s*;\s*\}/g, 'catch (err) { throw err; }');
    c = c.replace(/gemini-1\.5-flash/g, 'gemini-2.5-flash-lite');
    c = c.replace(/gemini-1\.5-pro/g, 'gemini-2.5-flash-lite');
    c = c.replace(/gemini-flash-latest/g, 'gemini-2.5-flash-lite');
    fs.writeFileSync(f, c, 'utf8');
    console.log('Checked', f);
  }
});
