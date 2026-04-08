const fs = require('fs');
const file = './src/app/api/ai/edit-presentation-stream/route.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/\\} catch \\(geminiError\\) \\{ throw geminiError; \\} \\{/, '} catch (geminiError) { throw geminiError; }');
code = code.replace(/\\} catch \\(\\) \\{ throw ; \\}/, '} catch (geminiError) { throw geminiError; }');
code = code.replace(/\\} catch \\(geminiError\\) \\{ throw geminiError; \\}/, '} catch (geminiError) { throw geminiError; }');

fs.writeFileSync(file, code);
