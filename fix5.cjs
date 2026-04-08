const fs = require('fs');

function fix(file) {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/import\s+OpenAI\s+from\s+['"\]openai['"\];?\r?\n?/g, '');
  c = c.replace(/const\s+openai\s*=\s*new\s+OpenAI\([^)]*\);\r?\n?/g, '');
  
  if (file.includes('generate-outline/route.ts')) {
      const idx1 = c.indexOf('if (!responseContent && env.OPENAI_API_KEY)');
      const idx2 = c.indexOf('if (!responseContent || !responseContent.trim())');
      if (idx1 > -1 && idx2 > -1) {
        c = c.slice(0, idx1) + c.slice(idx2);
      }
      c = c.replace(/\} catch \(geminiError\) \{\s*console\.warn[^}]*;\s*\}/, '} catch (geminiError) { console.warn("[generate-outline] Gemini failed:", geminiError); throw geminiError; }');
      c = c.replace(/if \(error instanceof OpenAI\.APIError\) \{[\s\S]*?\}\s*return NextResponse\.json/g, 'return NextResponse.json');
  } else if (file.includes('generate-outline/stream/route.ts')) {
      // Find OpenAI fallback logic and remove it
      // Same concept
      const idx1 = c.indexOf('if (useGeminiFallback && env.OPENAI_API_KEY)');
      const idx2 = c.indexOf('controller.close();\r\n        return; // Success with OpenAI');
      if (idx1 > -1 && idx2 > -1) {
          // It's a bit harder to slice manually, let's just use regex to remove OpenAI completely.
      }
  }

  fs.writeFileSync(file, c, 'utf8');
  console.log('Fixed', file);
}

fix('./src/app/api/generate-outline/route.ts');
fix('./src/app/api/generate-outline/stream/route.ts');
fix('./src/app/api/ presentations/[id]/stream-content/route.ts');
