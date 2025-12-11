# Webhook Setup Guide for PPTMaster

## Clerk Webhook Setup

### 1. Get Your Webhook URL

Your webhook endpoint will be:
```
https://your-domain.com/api/webhooks/clerk
```

For local development with ngrok:
```bash
ngrok http 3000
# Use: https://your-ngrok-url.ngrok.io/api/webhooks/clerk
```

### 2. Configure Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the left sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
6. Select the following events:
   - ✅ `user.created` (Required - creates user in database)
   - ✅ `user.updated` (Optional - syncs user data)
   - ✅ `user.deleted` (Optional - cleanup)
7. Click **Create**
8. Copy the **Signing Secret** (starts with `whsec_`)
9. Add to your `.env` file:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### 3. Test Clerk Webhook

```bash
# In Clerk Dashboard, go to your webhook endpoint
# Click "Send Example" to test the webhook
# Check your application logs to verify it's working
```

---

## Polar Webhook Setup

### 1. Get Your Webhook URL

Your webhook endpoint will be:
```
https://your-domain.com/api/webhooks/polar
```

For local development:
```bash
ngrok http 3000
# Use: https://your-ngrok-url.ngrok.io/api/webhooks/polar
```

### 2. Configure Polar Webhook

1. Go to [Polar Dashboard](https://polar.sh/dashboard)
2. Navigate to **Settings** → **Webhooks**
3. Click **Create Webhook**
4. Enter your webhook URL: `https://your-domain.com/api/webhooks/polar`
5. Select the following events:
   - ✅ `subscription.created` (Required - activates subscription)
   - ✅ `subscription.updated` (Optional - updates subscription)
   - ✅ `subscription.cancelled` (Required - handles cancellations)
   - ✅ `subscription.active` (Optional - confirms active status)
   - ✅ `order.created` (Optional - one-time purchases)
6. Click **Create**
7. Copy the **Webhook Secret**
8. Add to your `.env` file:
   ```
   POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
   ```

### 3. Get Polar Product IDs

1. In Polar Dashboard, go to **Products**
2. Create your products (or use existing ones):
   - **Starter Plan** - $9/month, 50 credits
   - **Pro Plan** - $29/month, 200 credits
   - **Enterprise Plan** - $99/month, 1000 credits
3. Click on each product and copy the **Product ID**
4. Add to your `.env` file:
   ```
   POLAR_PRODUCT_STARTER=prod_xxxxxxxxxxxxx
   POLAR_PRODUCT_PRO=prod_xxxxxxxxxxxxx
   POLAR_PRODUCT_ENTERPRISE=prod_xxxxxxxxxxxxx
   ```

### 4. Get Polar Access Token

1. In Polar Dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "PPTMaster Production")
4. Select appropriate permissions:
   - ✅ Read products
   - ✅ Read subscriptions
   - ✅ Write subscriptions
5. Copy the **Access Token**
6. Add to your `.env` file:
   ```
   POLAR_ACCESS_TOKEN=polar_xxxxxxxxxxxxx
   ```

### 5. Set Polar Environment

Add to your `.env` file:
```
# Use 'sandbox' for testing, 'production' for live
POLAR_ENV=sandbox
```

---

## Local Development with ngrok

### Install ngrok
```bash
# Download from https://ngrok.com/download
# Or install via npm
npm install -g ngrok
```

### Start ngrok
```bash
# Start your Next.js app
npm run dev

# In another terminal, start ngrok
ngrok http 3000
```

### Update Webhooks
Use the ngrok URL (e.g., `https://abc123.ngrok.io`) for both webhooks:
- Clerk: `https://abc123.ngrok.io/api/webhooks/clerk`
- Polar: `https://abc123.ngrok.io/api/webhooks/polar`

**Note:** ngrok URLs change each time you restart. For persistent URLs, use ngrok's paid plan or deploy to production.

---

## Testing Webhooks

### Test Clerk Webhook
1. Sign up a new user in your app
2. Check your database to verify the user was created
3. Check application logs for webhook events

### Test Polar Webhook
1. Create a test subscription in Polar Dashboard
2. Use Polar's test mode/sandbox
3. Verify subscription is reflected in your database
4. Check application logs for webhook events

---

## Webhook Security

Both webhooks verify signatures to ensure authenticity:

### Clerk
- Uses `svix` library for verification
- Checks `svix-id`, `svix-timestamp`, and `svix-signature` headers

### Polar
- Uses HMAC SHA256 signature verification
- Checks `webhook-signature` header

**Never skip signature verification in production!**

---

## Troubleshooting

### Webhook Not Receiving Events
- ✅ Check webhook URL is correct and accessible
- ✅ Verify webhook secrets are correct in `.env`
- ✅ Check firewall/security settings
- ✅ Review application logs for errors
- ✅ Use ngrok for local testing

### Signature Verification Failing
- ✅ Ensure webhook secret matches exactly
- ✅ Check for extra spaces or newlines in `.env`
- ✅ Verify you're using the correct secret for the environment

### Database Not Updating
- ✅ Check database connection string
- ✅ Verify Prisma schema is up to date (`npm run db:push`)
- ✅ Check application logs for database errors

---

## Production Deployment

### Vercel Deployment
1. Deploy your app to Vercel
2. Get your production URL (e.g., `https://pptmaster.vercel.app`)
3. Update webhook URLs in Clerk and Polar dashboards:
   - Clerk: `https://pptmaster.vercel.app/api/webhooks/clerk`
   - Polar: `https://pptmaster.vercel.app/api/webhooks/polar`
4. Add all environment variables in Vercel dashboard
5. Redeploy if needed

### Environment Variables Checklist
```bash
# Database
DATABASE_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Polar
POLAR_ACCESS_TOKEN=polar_...
POLAR_ENV=production
POLAR_WEBHOOK_SECRET=...
POLAR_PRODUCT_STARTER=prod_...
POLAR_PRODUCT_PRO=prod_...
POLAR_PRODUCT_ENTERPRISE=prod_...

# OpenAI
OPENAI_API_KEY=sk-...
```

---

## Monitoring Webhooks

### Clerk Dashboard
- View webhook logs in Clerk Dashboard
- See delivery status and response codes
- Retry failed webhooks manually

### Polar Dashboard
- View webhook events in Polar Dashboard
- Check delivery status
- Resend failed webhooks

### Application Logs
Monitor your application logs for:
- Webhook received events
- Signature verification results
- Database update confirmations
- Any errors or exceptions

---

## Quick Reference

| Service | Webhook URL | Events to Subscribe |
|---------|-------------|---------------------|
| **Clerk** | `/api/webhooks/clerk` | `user.created`, `user.updated`, `user.deleted` |
| **Polar** | `/api/webhooks/polar` | `subscription.created`, `subscription.cancelled`, `subscription.updated` |

**Need Help?**
- Clerk Docs: https://clerk.com/docs/integrations/webhooks
- Polar Docs: https://docs.polar.sh/webhooks
