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
  './src/app/api/presentations/[id]/stream-content/route.ts'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // 1. Remove OpenAI import
    content = content.replace(/import\s+OpenAI\s+from\s+['"]openai['"];?\r?\n/g, '');
    
    // 2. Remove OpenAI instantiate
    content = content.replace(/const\s+openai\s*=\s*new\s+OpenAI\([\s\S]*?\);\r?\n/g, '');
    
    // 3. Find block starting with 'catch (geminiError)' and ending with 'throw geminiError;'
    // Or just manually throw error if Gemini fails. We can replace 'openai.chat.completions.create' with throwing an error when fallback happens.
    
    // Let's indiscriminately replace all const completion = await openai.chat.completions.create({ blocks with throw new Error("Gemini required");
    content = content.replace(/const completion = await openai\.chat\.completions\.create\(\{[\s\S]*?\}\);/g, 'throw new Error("OpenAI fallback disabled");');
    
    // The previous prompt had let responseText = completion.choices[0]?.message?.content?.trim() || "{}";
    // We can replace references to completion.
    content = content.replace(/let responseText = completion\.choices\[0\]\?\.message\?\.content\?\.trim\(\)\s*\|\|\s*"\{\}";/g, '');
    content = content.replace(/responseText = completion\.choices\[0\]\?\.message\?\.content\?\.trim\(\)\s*\|\|\s*"\{\}";/g, '');

    fs.writeFileSync(f, content, 'utf8');
    console.log('Processed:', f);
  }
});
