/**
 * IndexNow Submission Script
 * 
 * Run after deployments to notify search engines of all pages:
 * node scripts/submit-indexnow.cjs
 * 
 * Or submit specific pages:
 * node scripts/submit-indexnow.cjs /pricing
 * node scripts/submit-indexnow.cjs /insights/my-new-post
 */

const https = require('https');

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pptmaster.app';

async function submitToIndexNow(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    
    const options = {
      hostname: new URL(SITE_URL).hostname,
      port: 443,
      path: '/api/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch {
          resolve({ success: false, message: responseData });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  
  console.log('🔍 IndexNow Submission Tool');
  console.log('===========================\n');

  try {
    let result;
    
    if (args.length === 0) {
      // Submit all sitemap URLs (all pages, all languages)
      console.log('📤 Submitting all pages in all 12 languages...');
      console.log('   This will submit ~168 URLs to Bing/Yandex/ChatGPT\n');
      result = await submitToIndexNow({ sitemap: true });
    } else if (args[0] === '--all-languages' && args[1]) {
      // Submit a specific page in all languages
      console.log(`📤 Submitting ${args[1]} in all 12 languages...`);
      result = await submitToIndexNow({ path: args[1], allLanguages: true });
    } else {
      // Submit a specific path
      console.log(`📤 Submitting ${args[0]}...`);
      result = await submitToIndexNow({ path: args[0] });
    }

    if (result.success) {
      console.log('✅ Success:', result.message);
      if (result.endpoint) {
        console.log('   Endpoint:', result.endpoint);
      }
    } else {
      console.log('❌ Failed:', result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure your app is running and accessible at:', SITE_URL);
    process.exit(1);
  }
}

main();
