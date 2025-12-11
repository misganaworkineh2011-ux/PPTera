# 🌐 Your PPTMaster URLs

## ✅ All Systems Running!

### 🌍 Application URLs
- **Local App**: http://localhost:3000
- **Public App**: https://viperous-cordia-fervently.ngrok-free.dev
- **ngrok Dashboard**: http://localhost:4040

---

## 🔗 Webhook URLs for Configuration

### Clerk Webhook
```
https://viperous-cordia-fervently.ngrok-free.dev/api/webhooks/clerk
```

**Setup Steps:**
1. Go to https://dashboard.clerk.com
2. Select your application
3. Navigate to **Webhooks** → **Add Endpoint**
4. Paste the URL above
5. Select events: `user.created`, `user.updated`, `user.deleted`
6. Copy the **Signing Secret** and update `.env`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Polar Webhook
```
https://viperous-cordia-fervently.ngrok-free.dev/api/webhooks/polar
```

**Setup Steps:**
1. Go to https://polar.sh/dashboard
2. Navigate to **Settings** → **Webhooks**
3. Click **Create Webhook**
4. Paste the URL above
5. Select events: `subscription.created`, `subscription.cancelled`, `subscription.updated`
6. Copy the **Webhook Secret** and update `.env`:
   ```
   POLAR_WEBHOOK_SECRET=your_webhook_secret
   ```

---

## 🧪 Testing Your Application

### 1. Open Your App
Click here: https://viperous-cordia-fervently.ngrok-free.dev

Or locally: http://localhost:3000

### 2. Sign Up
- Click "Sign In" or "Get Started"
- Create a new account
- You should get 3 free credits

### 3. Generate a Presentation
- Go to Dashboard
- Enter a topic (e.g., "Artificial Intelligence")
- Select number of slides (5-10)
- Click "Generate Presentation"
- Download should start automatically

### 4. Monitor Webhooks
Open ngrok dashboard: http://localhost:4040

You'll see all incoming requests including webhooks from Clerk and Polar.

---

## 📊 Current Status

| Service | Status | URL |
|---------|--------|-----|
| Next.js Dev Server | ✅ Running | http://localhost:3000 |
| ngrok Tunnel | ✅ Running | https://viperous-cordia-fervently.ngrok-free.dev |
| Database (Neon) | ✅ Connected | - |
| Polar Products API | ✅ Working | /api/polar/products |
| Pricing Page | ✅ Fetching from Polar | /pricing |
| Clerk Auth | ⏳ Configure webhook | https://dashboard.clerk.com |
| Polar Payments | ⏳ Configure webhook | https://polar.sh/dashboard |

---

## ⚠️ Important Notes

1. **ngrok URL Changes**: This URL will change when you restart ngrok (free plan)
2. **Update Webhooks**: You'll need to update webhook URLs in Clerk and Polar each time
3. **Keep Terminals Open**: Don't close the terminals running the dev server and ngrok
4. **Production**: Deploy to Vercel for permanent URLs

---

## 🛑 Stop Servers

When you're done:
```bash
# Press Ctrl+C in both terminals
# Or close the terminal windows
```

---

## 🔄 Restart Everything

If you need to restart:
```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Terminal 3: Get new URL
node get-ngrok-url.cjs
```

---

## 🎯 Next Steps Checklist

- [ ] Configure Clerk webhook with the URL above
- [ ] Configure Polar webhook with the URL above
- [ ] Test sign up at https://viperous-cordia-fervently.ngrok-free.dev
- [ ] Test presentation generation
- [ ] Monitor webhooks in ngrok dashboard (http://localhost:4040)
- [ ] Check database updates in Prisma Studio (`npm run db:studio`)

---

## 🆘 Quick Commands

```bash
# Get current ngrok URL
node get-ngrok-url.cjs

# View database
npm run db:studio

# Check running processes
# Dev server should be on port 3000
# ngrok dashboard on port 4040
```

---

## 🎉 You're Live!

Your application is now accessible publicly at:
**https://viperous-cordia-fervently.ngrok-free.dev**

Configure your webhooks and start testing! 🚀
