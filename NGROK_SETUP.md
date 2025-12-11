# 🚀 ngrok Setup & Running Guide

## ✅ Current Status

- ✅ **Next.js Dev Server**: Running on http://localhost:3000
- ✅ **Database**: Connected and synced
- ⏳ **ngrok**: Needs authentication

## 🔐 Step 1: Authenticate ngrok (First Time Only)

### 1. Sign up for ngrok (Free)
Go to: https://dashboard.ngrok.com/signup

### 2. Get Your Authtoken
After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken

You'll see something like:
```
Your Authtoken: 2abc123def456ghi789jkl0mno1pqr2stu3vwx4yz5
```

### 3. Authenticate ngrok
Open a **new terminal** and run:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

Example:
```bash
ngrok config add-authtoken 2abc123def456ghi789jkl0mno1pqr2stu3vwx4yz5
```

You should see:
```
Authtoken saved to configuration file: C:\Users\YourName\.ngrok2\ngrok.yml
```

## 🌐 Step 2: Start ngrok

In the same terminal (or a new one), run:
```bash
ngrok http 3000
```

You'll see output like this:
```
ngrok                                                                           

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

## 📋 Step 3: Get Your Public URL

### Option A: From ngrok Terminal
Look for the **Forwarding** line in the ngrok output:
```
Forwarding    https://abc123def456.ngrok-free.app -> http://localhost:3000
```

Copy the HTTPS URL: `https://abc123def456.ngrok-free.app`

### Option B: Use the Helper Script
Open a **new terminal** and run:
```bash
node get-ngrok-url.cjs
```

This will show you:
```
✅ ngrok is running!

Public URL: https://abc123def456.ngrok-free.app

📋 Use these webhook URLs:

Clerk:   https://abc123def456.ngrok-free.app/api/webhooks/clerk
Polar:   https://abc123def456.ngrok-free.app/api/webhooks/polar

🌐 ngrok Dashboard: http://localhost:4040
```

### Option C: Open ngrok Dashboard
Open in your browser: http://localhost:4040

You'll see a web interface showing all requests and your public URL.

## 🔗 Step 4: Configure Webhooks

### Clerk Webhook Setup

1. Go to https://dashboard.clerk.com
2. Select your application: **PPTMaster**
3. Click **Webhooks** in the left sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL:
   ```
   https://YOUR-NGROK-URL.ngrok-free.app/api/webhooks/clerk
   ```
6. Select these events:
   - ✅ user.created
   - ✅ user.updated
   - ✅ user.deleted
7. Click **Create**
8. Copy the **Signing Secret** (starts with `whsec_`)
9. Update your `.env` file:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Polar Webhook Setup

1. Go to https://polar.sh/dashboard
2. Click **Settings** → **Webhooks**
3. Click **Create Webhook**
4. Enter your webhook URL:
   ```
   https://YOUR-NGROK-URL.ngrok-free.app/api/webhooks/polar
   ```
5. Select these events:
   - ✅ subscription.created
   - ✅ subscription.cancelled
   - ✅ subscription.updated
6. Click **Create**
7. Copy the **Webhook Secret**
8. Update your `.env` file:
   ```
   POLAR_WEBHOOK_SECRET=your_webhook_secret_here
   ```

## 🧪 Step 5: Test Everything

### Test the Application
1. Open your ngrok URL in a browser: `https://YOUR-NGROK-URL.ngrok-free.app`
2. Click **Sign In** or **Get Started**
3. Create a new account
4. You should be redirected to the dashboard with 3 free credits

### Test Presentation Generation
1. Go to Dashboard
2. Enter a topic: "Artificial Intelligence"
3. Select slides: 5
4. Click **Generate Presentation**
5. Wait for the download

### Monitor Webhooks
Open the ngrok dashboard: http://localhost:4040

You'll see all incoming requests including webhook calls from Clerk and Polar.

## 📊 Useful Commands

```bash
# Get your ngrok URL
node get-ngrok-url.cjs

# View database
npm run db:studio

# Check if servers are running
# Next.js: http://localhost:3000
# ngrok: http://localhost:4040
```

## 🛑 Stopping Servers

To stop everything:
1. Press `Ctrl+C` in the terminal running `npm run dev`
2. Press `Ctrl+C` in the terminal running `ngrok http 3000`

## 🔄 Restarting

To restart everything:
```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Terminal 3: Get ngrok URL
node get-ngrok-url.cjs
```

Or use the quick start script:
```bash
QUICK_START.bat
```

## ⚠️ Important Notes

### Free Plan Limitations
- ngrok URLs change every time you restart ngrok
- You'll need to update webhook URLs in Clerk and Polar each time
- For persistent URLs, upgrade to ngrok's paid plan ($8/month)

### Production Deployment
For production, deploy to Vercel and use permanent URLs:
- Clerk: `https://your-app.vercel.app/api/webhooks/clerk`
- Polar: `https://your-app.vercel.app/api/webhooks/polar`

## 🐛 Troubleshooting

### ngrok: command not found
```bash
npm install -g ngrok
```

### ngrok: authentication required
```bash
ngrok config add-authtoken YOUR_TOKEN
```

### Port 3000 already in use
```bash
npx kill-port 3000
npm run dev
```

### Webhook not receiving events
- Check ngrok is running: http://localhost:4040
- Verify webhook URLs are correct
- Check webhook secrets in `.env`
- Look at ngrok dashboard for incoming requests

### Database connection error
```bash
npm run db:push
```

## 📱 Access Points Summary

| Service | URL |
|---------|-----|
| **Local App** | http://localhost:3000 |
| **Public App** | https://YOUR-NGROK-URL.ngrok-free.app |
| **ngrok Dashboard** | http://localhost:4040 |
| **Prisma Studio** | Run `npm run db:studio` |

## 🎉 You're Ready!

Once ngrok is authenticated and running, your app is accessible publicly and webhooks will work!

**Next Steps:**
1. Authenticate ngrok (one-time setup)
2. Start ngrok: `ngrok http 3000`
3. Get your URL: `node get-ngrok-url.cjs`
4. Configure webhooks in Clerk and Polar
5. Test your application!
