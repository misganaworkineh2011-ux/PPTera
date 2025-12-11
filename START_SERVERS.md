# 🚀 PPTMaster is Running!

## ✅ Status

- **Next.js Dev Server**: Running on http://localhost:3000
- **Database**: Connected to Neon PostgreSQL
- **Ngrok**: Starting...

## 📋 Next Steps

### 1. Set up ngrok (First Time Only)

If you haven't used ngrok before, you need to sign up and authenticate:

1. Go to https://dashboard.ngrok.com/signup
2. Sign up for a free account
3. Copy your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
4. Run this command:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

### 2. Start ngrok

Open a **new terminal** and run:
```bash
ngrok http 3000
```

You'll see output like:
```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

### 3. Copy Your ngrok URL

Look for the line that says **Forwarding** and copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 4. Configure Webhooks

#### Clerk Webhook:
1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **Webhooks** → **Add Endpoint**
4. URL: `https://YOUR-NGROK-URL.ngrok.io/api/webhooks/clerk`
5. Events: Select `user.created`, `user.updated`, `user.deleted`
6. Copy the **Signing Secret** and update your `.env`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

#### Polar Webhook:
1. Go to https://polar.sh/dashboard
2. Go to **Settings** → **Webhooks** → **Create Webhook**
3. URL: `https://YOUR-NGROK-URL.ngrok.io/api/webhooks/polar`
4. Events: Select `subscription.created`, `subscription.cancelled`, `subscription.updated`
5. Copy the **Webhook Secret** and update your `.env`:
   ```
   POLAR_WEBHOOK_SECRET=your_webhook_secret
   ```

### 5. Test Your Application

Open your browser and go to:
- **Local**: http://localhost:3000
- **Public (ngrok)**: https://YOUR-NGROK-URL.ngrok.io

## 🧪 Testing

### Test Authentication:
1. Click "Sign In" or "Get Started"
2. Create a new account
3. You should be redirected to the dashboard
4. Check that you have 3 free credits

### Test Presentation Generation:
1. Go to Dashboard
2. Enter a topic (e.g., "Artificial Intelligence")
3. Select number of slides (5-10)
4. Click "Generate Presentation"
5. Wait for the download to start

### Test Webhooks:
1. Sign up a new user → Check logs for Clerk webhook
2. Create a test subscription in Polar → Check logs for Polar webhook

## 📊 View Logs

The dev server is running in the background. To see logs:
- Check the terminal where you ran `npm run dev`
- Or check the Kiro process output

## 🛑 Stop Servers

To stop the servers:
```bash
# Press Ctrl+C in the terminal running npm run dev
# Press Ctrl+C in the terminal running ngrok
```

## 🔧 Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Kill the process using port 3000
npx kill-port 3000
# Then restart: npm run dev
```

### ngrok Not Working
- Make sure you've authenticated ngrok with your authtoken
- Check if ngrok is running: Open http://localhost:4040 in your browser
- Try restarting ngrok

### Database Connection Error
- Check your DATABASE_URL in `.env`
- Make sure your Neon database is active
- Run: `npm run db:push`

### Webhook Not Receiving Events
- Make sure ngrok is running
- Verify webhook URLs are correct
- Check webhook secrets match in `.env`
- Look at application logs for errors

## 📱 Access Points

- **Local App**: http://localhost:3000
- **Public App**: https://YOUR-NGROK-URL.ngrok.io
- **ngrok Dashboard**: http://localhost:4040
- **Prisma Studio**: Run `npm run db:studio` in a new terminal

## 🎉 You're All Set!

Your PPTMaster application is now running and ready for development!

**Important**: Remember that ngrok URLs change every time you restart ngrok (on the free plan). You'll need to update your webhook URLs each time.

For a persistent URL, consider:
- Upgrading to ngrok's paid plan
- Deploying to Vercel/production
