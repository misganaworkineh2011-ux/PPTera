# 🧪 PPTMaster Testing Checklist

## ✅ Completed

- [x] Project setup and dependencies installed
- [x] Database connected (Neon PostgreSQL)
- [x] Prisma schema synced
- [x] Development server running
- [x] ngrok tunnel active
- [x] Polar products API working
- [x] Pricing page fetching from Polar

## ⏳ To Test

### 1. Authentication Flow (Clerk)

- [ ] Visit homepage: http://localhost:3000
- [ ] Click "Sign In" or "Get Started"
- [ ] Create a new account
- [ ] Verify redirect to dashboard
- [ ] Check user created in database (Prisma Studio: `npm run db:studio`)
- [ ] Verify 3 free credits assigned

**Expected Result:** User created with 3 credits

### 2. Pricing Page

- [ ] Visit: http://localhost:3000/pricing
- [ ] Verify 3 plans displayed (Starter, PRO, Ultra)
- [ ] Verify prices match Polar ($10, $25, $100)
- [ ] Check "Most Popular" badge on middle plan

**Expected Result:** All plans display correctly with Polar pricing

### 3. Checkout Flow (Not Signed In)

- [ ] Visit pricing page (not signed in)
- [ ] Click "Get Started" on any plan
- [ ] Verify redirect to sign-in page

**Expected Result:** Redirects to /sign-in

### 4. Checkout Flow (Signed In)

- [ ] Sign in to your account
- [ ] Go to pricing page
- [ ] Click "Get Started" on Starter plan
- [ ] Verify redirect to Polar checkout page
- [ ] Check checkout page shows correct product and price

**Expected Result:** Polar checkout page opens

### 5. Presentation Generation

- [ ] Go to dashboard: http://localhost:3000/dashboard
- [ ] Enter topic: "Artificial Intelligence"
- [ ] Select slides: 5
- [ ] Click "Generate Presentation"
- [ ] Wait for generation (may take 30-60 seconds)
- [ ] Verify PPTX file downloads
- [ ] Open PPTX file and check content
- [ ] Verify credits deducted (should be 2 remaining)

**Expected Result:** PPTX file downloads with AI-generated content

### 6. Clerk Webhook

**Setup:**
- [ ] Go to https://dashboard.clerk.com
- [ ] Navigate to Webhooks
- [ ] Add endpoint: `https://viperous-cordia-fervently.ngrok-free.dev/api/webhooks/clerk`
- [ ] Select events: user.created, user.updated, user.deleted
- [ ] Copy signing secret to `.env` as `CLERK_WEBHOOK_SECRET`

**Test:**
- [ ] Create a new user account
- [ ] Check ngrok dashboard (http://localhost:4040) for webhook request
- [ ] Verify user created in database
- [ ] Check dev server logs for webhook event

**Expected Result:** Webhook received, user created in DB

### 7. Polar Webhook

**Setup:**
- [ ] Go to https://polar.sh/dashboard
- [ ] Navigate to Settings → Webhooks
- [ ] Create webhook: `https://viperous-cordia-fervently.ngrok-free.dev/api/webhooks/polar`
- [ ] Select events: subscription.created, subscription.cancelled, subscription.updated
- [ ] Copy webhook secret to `.env` as `POLAR_WEBHOOK_SECRET`

**Test:**
- [ ] Complete a test purchase (use Polar test mode)
- [ ] Check ngrok dashboard for webhook request
- [ ] Verify subscription updated in database
- [ ] Check credits added to user account

**Expected Result:** Webhook received, subscription activated

### 8. Database Verification

- [ ] Run: `npm run db:studio`
- [ ] Check User table for created users
- [ ] Verify credits column
- [ ] Check Presentation table for generated presentations
- [ ] Verify subscriptionPlan and polarCustomerId fields

**Expected Result:** All data correctly stored

### 9. Error Handling

- [ ] Try generating presentation with 0 credits
- [ ] Try accessing dashboard without signing in
- [ ] Try invalid topic for presentation
- [ ] Check error messages display correctly

**Expected Result:** Appropriate error messages shown

### 10. Public Access (ngrok)

- [ ] Share ngrok URL with another device/browser
- [ ] Test sign up from external device
- [ ] Verify full flow works publicly

**Expected Result:** App accessible and functional via ngrok URL

## 🔧 Debugging Tools

### View Logs
```bash
# Dev server logs (in terminal running npm run dev)
# Look for API calls, errors, webhook events

# ngrok dashboard
open http://localhost:4040
# Shows all incoming requests including webhooks
```

### Database
```bash
npm run db:studio
# Opens Prisma Studio to view/edit database
```

### API Testing
```bash
# Test Polar products
curl http://localhost:3000/api/polar/products

# Test with authentication (replace with your token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/generate
```

## 📊 Success Criteria

- ✅ Users can sign up and get 3 free credits
- ✅ Pricing page shows real Polar products
- ✅ Users can subscribe via Polar checkout
- ✅ Presentations generate successfully
- ✅ Credits are deducted after generation
- ✅ Webhooks update database correctly
- ✅ App accessible via ngrok URL

## 🐛 Common Issues

### Presentation Generation Fails
- Check OpenAI API key is valid
- Verify you have OpenAI credits
- Check API key has GPT-4 access

### Webhook Not Received
- Verify ngrok is running
- Check webhook URL is correct
- Verify webhook secrets match
- Look at ngrok dashboard for requests

### Database Connection Error
- Check DATABASE_URL in .env
- Run: `npm run db:push`
- Verify Neon database is active

### Pricing Page Shows Error
- Check POLAR_ACCESS_TOKEN is valid
- Verify POLAR_PRODUCT_* IDs are correct
- Check Polar environment (sandbox/production)

## 📝 Notes

- ngrok URL changes on free plan (update webhooks each restart)
- Test mode purchases don't charge real money
- Keep dev server and ngrok running during testing
- Check both terminal logs and ngrok dashboard

## 🎯 Ready for Production

Before deploying to production:
- [ ] Switch to production Polar environment
- [ ] Use production API keys (Clerk, OpenAI, Polar)
- [ ] Deploy to Vercel or similar
- [ ] Update webhook URLs to production domain
- [ ] Test complete flow in production
- [ ] Set up monitoring and error tracking

---

**Current Status:** Development environment ready for testing!

**Your URLs:**
- Local: http://localhost:3000
- Public: https://viperous-cordia-fervently.ngrok-free.dev
- ngrok Dashboard: http://localhost:4040
