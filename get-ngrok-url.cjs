// Simple script to get ngrok URL
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4040,
  path: '/api/tunnels',
  method: 'GET'
};

console.log('Fetching ngrok URL...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const tunnels = JSON.parse(data);
      if (tunnels.tunnels && tunnels.tunnels.length > 0) {
        const httpsTunnel = tunnels.tunnels.find(t => t.proto === 'https');
        if (httpsTunnel) {
          console.log('✅ ngrok is running!\n');
          console.log('Public URL:', httpsTunnel.public_url);
          console.log('\n📋 Use these webhook URLs:\n');
          console.log('Clerk:  ', httpsTunnel.public_url + '/api/webhooks/clerk');
          console.log('Polar:  ', httpsTunnel.public_url + '/api/webhooks/polar');
          console.log('\n🌐 ngrok Dashboard: http://localhost:4040');
        }
      } else {
        console.log('❌ No tunnels found. Make sure ngrok is running.');
      }
    } catch (error) {
      console.log('❌ Error parsing ngrok response:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Could not connect to ngrok.');
  console.log('\nMake sure ngrok is running:');
  console.log('  ngrok http 3000\n');
  console.log('If this is your first time:');
  console.log('  1. Sign up at https://dashboard.ngrok.com/signup');
  console.log('  2. Get your authtoken');
  console.log('  3. Run: ngrok config add-authtoken YOUR_TOKEN\n');
});

req.end();
