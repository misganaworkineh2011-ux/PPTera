# PPTMaster - Complete Setup Guide

## Prerequisites

Before you begin, make sure you have:
- Node.js 18+ installed
- A PostgreSQL database (Neon recommended)
- Accounts created on:
  - [Clerk](https://clerk.com) - Authentication
  - [Polar](https://polar.sh) - Payments
  - [OpenAI](https://platform.openai.com) - AI API
  - [Neon](https://neon.tech) - PostgreSQL Database (optional)

---

## Step 1: Clone and Install

```bash
# Navigate to your project directory
cd pptmaster

# Install dependencies
npm install
```

---

## Step 2: Database Setup (Neon)

### Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Click **Create Project**
3. Name it "pptmaster"
4. Select a region close to you
5. Click **Create Project**
6. Copy the **Connection String** (starts with `postgresql://`)

### Update .env

```bash
# Copy the example env file
cp .env.example .env
```

Edit `.env` and add your database URL:
```
DATABASE_URL="postgresql://user:password@host.neon.tech/pptmaster?sslmode=require"
```

### Initialize Database

```bash
# Push the Prisma schema to your database
npm run db:push

# (Optional) Open Prisma Studio to view your database
npm run db:studio
```

---

## Step 3: Clerk Setup (Authentication)

### Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **Add Application**
3. Name it "PPTMaster"
4. Select authentication methods (Email, Google, GitHub, etc.)
5. Click **Create Application**

### Get API Keys

1. In your Clerk application dashboard, go to **API Keys**
2. Copy the following:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Update .env

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

### Configure Clerk Webhook

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. For local development, use ngrok (see below)
4. For production, use: `https://your-domain.com/api/webhooks/clerk`
5. Select events: `user.created`, `user.updated`, `user.deleted`
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add to `.env`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

## Step 4: Polar Setup (Payments)

### Create Polar Account

1. Go to [Polar](https://polar.sh)
2. Sign up and create an organization
3. Complete your profile setup

### Create Products

1. In Polar Dashboard, go to **Products**
2. Create three subscription products:

**Starter Plan:**
- Name: Starter
- Price: $9/month
- Description: 50 presentations per month

**Pro Plan:**
- Name: Pro
- Price: $29/month
- Description: 200 presentations per month

**Enterprise Plan:**
- Name: Enterprise
- Price: $99/month
- Description: 1000 presentations per month

3. Copy each **Product ID** (starts with `prod_`)

### Get API Keys

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it "PPTMaster"
4. Copy the **Access Token** (starts with `polar_`)

### Configure Webhook

1. Go to **Settings** → **Webhooks**
2. Click **Create Webhook**
3. URL: `https://your-domain.com/api/webhooks/polar`
4. Select events: `subscription.created`, `subscription.cancelled`, `subscription.updated`
5. Copy the **Webhook Secret**

### Update .env

```
POLAR_ACCESS_TOKEN=polar_xxxxxxxxxxxxx
POLAR_ENV=sandbox
POLAR_WEBHOOK_SECRET=your_webhook_secret
POLAR_PRODUCT_STARTER=prod_xxxxxxxxxxxxx
POLAR_PRODUCT_PRO=prod_xxxxxxxxxxxxx
POLAR_PRODUCT_ENTERPRISE=prod_xxxxxxxxxxxxx
```

---

## Step 5: OpenAI Setup

### Get API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign in or create an account
3. Go to **API Keys**
4. Click **Create new secret key**
5. Name it "PPTMaster"
6. Copy the key (starts with `sk-`)

### Update .env

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

**Note:** Make sure you have credits in your OpenAI account. GPT-4 is required for best results.

---

## Step 6: Local Development with ngrok

For testing webhooks locally, you need ngrok:

### Install ngrok

```bash
# Download from https://ngrok.com/download
# Or install via npm
npm install -g ngrok

# Sign up for free account and authenticate
ngrok authtoken YOUR_AUTH_TOKEN
```

### Start Development Server

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000
```

### Update Webhook URLs

Copy your ngrok URL (e.g., `https://abc123.ngrok.io`) and update:

**Clerk:**
- Go to Webhooks → Edit your endpoint
- URL: `https://abc123.ngrok.io/api/webhooks/clerk`

**Polar:**
- Go to Webhooks → Edit your endpoint
- URL: `https://abc123.ngrok.io/api/webhooks/polar`

---

## Step 7: Test Your Setup

### Test Authentication

1. Open `http://localhost:3000`
2. Click **Sign In**
3. Create a new account
4. Check your database (Prisma Studio) to verify user was created
5. You should see 3 free credits

### Test Presentation Generation

1. Go to Dashboard
2. Enter a topic (e.g., "Climate Change")
3. Select number of slides
4. Click **Generate Presentation**
5. Download should start automatically
6. Check that credits were deducted

### Test Webhooks

**Clerk Webhook:**
- Sign up a new user
- Check application logs for webhook event
- Verify user in database

**Polar Webhook:**
- Create a test subscription in Polar Dashboard
- Check application logs for webhook event
- Verify subscription in database

---

## Step 8: Production Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts
```

### Add Environment Variables

In Vercel Dashboard:
1. Go to your project → **Settings** → **Environment Variables**
2. Add all variables from your `.env` file
3. Make sure to use production keys (not test keys)

### Update Webhook URLs

Update both Clerk and Polar webhooks to use your production URL:
- Clerk: `https://your-app.vercel.app/api/webhooks/clerk`
- Polar: `https://your-app.vercel.app/api/webhooks/polar`

### Switch to Production Mode

Update `.env` in Vercel:
```
POLAR_ENV=production
```

Use production API keys for:
- Clerk (pk_live_*, sk_live_*)
- OpenAI (production key)
- Polar (production access token)

---

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
npm run db:studio

# Reset database
npm run db:push
```

### Webhook Not Working
- Check ngrok is running
- Verify webhook URLs are correct
- Check webhook secrets match
- Review application logs

### OpenAI API Errors
- Verify API key is correct
- Check you have credits
- Ensure GPT-4 access is enabled

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

---

## Environment Variables Checklist

Make sure all these are set in your `.env`:

```bash
# Database
✅ DATABASE_URL

# Clerk
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
✅ CLERK_SECRET_KEY
✅ CLERK_WEBHOOK_SECRET

# Polar
✅ POLAR_ACCESS_TOKEN
✅ POLAR_ENV
✅ POLAR_WEBHOOK_SECRET
✅ POLAR_PRODUCT_STARTER
✅ POLAR_PRODUCT_PRO
✅ POLAR_PRODUCT_ENTERPRISE

# OpenAI
✅ OPENAI_API_KEY

# App
✅ NODE_ENV
```

---

## Next Steps

1. ✅ Customize the UI and branding
2. ✅ Add more presentation templates
3. ✅ Implement presentation editing
4. ✅ Add team collaboration features
5. ✅ Set up analytics and monitoring
6. ✅ Create marketing pages
7. ✅ Add email notifications

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run db:studio        # Open Prisma Studio
npm run db:push          # Push schema changes

# Production
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations

# Code Quality
npm run lint             # Run ESLint
npm run check            # Type check + lint
```

---

## Support Resources

- **Clerk Docs:** https://clerk.com/docs
- **Polar Docs:** https://docs.polar.sh
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs
- **OpenAI Docs:** https://platform.openai.com/docs

---

## Security Checklist

- ✅ Never commit `.env` file
- ✅ Use environment variables for all secrets
- ✅ Enable webhook signature verification
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Validate all user inputs
- ✅ Keep dependencies updated

---

**You're all set! 🚀**

Run `npm run dev` and start building amazing presentations with AI!
