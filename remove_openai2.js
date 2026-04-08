const fs = require('fs');
const files = [
  'C:/Users/HP/Desktop/pptmaster/src/app/api/ai/edit-presentation/route.ts',
  'C:/Users/HP/Desktop/pptmaster/src/app/api/ai/edit-presentation-stream/route.ts',
  'C:/Users/HP/Desktop/pptmaster/src/app/api/ai/edit-slide/route.ts',
  'C:/Users/HP/Desktop/pptmaster/src/app/api/ai/enhance-text/route.ts',
  'C:/Users/HP/Desktop/pptmaster/src/app/api/ai/generate-slide/route.ts',
  'C:/Users/HP/Desktop/pptmaster/src/app/api/generate/route.ts',
  'C:/Users/HP/Desktop/pptmaster/src/app/api/generate-outline/route.ts',
  'C:/Users/HP/Desktop/pptmaster/src/app/api/generate-outline/stream/route.ts',
  'C:/Users/HP/Desktop/pptmaster/src/app/api/presentations/[id]/stream-content/route.ts'
];
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import\s+OpenAI\s+from\s+[\"']openai[\"'];?\r?\n/g, '');
  content = content.replace(/const\s+openai\s+=\s+new\s+OpenAI\([\s\S]*?\);\r?\n/g, '');
  
  // Also aggressively remove fallback blocks where it falls back to openai
  content = content.replace(/catch\s*\((geminiError(?:[a-zA-Z0-9_]*))\)\s*\{[\s\S]*?console\.warn\([^\)]*OpenAI[^\)]*\);\s*throw\s+\1;\s*\}/g, 'catch () { throw ; }');
  
  // Then we also need to remove the else { ... } branches entirely that use openai
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Imports and const openai removed.');
