# Deployment Checklist - Async Export System

## ✅ Completed Steps

### 1. Database Migration
- ✅ Added `ExportJob` model to `prisma/schema.prisma`
- ✅ Ran `npx prisma db push` - Database synced successfully
- ✅ Ran `npx prisma generate` - Prisma Client updated

### 2. Backend Implementation
- ✅ Created email template: `src/lib/email/templates/export-ready.tsx`
- ✅ Created email sender: `src/lib/email/send-export-ready.ts`
- ✅ Updated email exports: `src/lib/email/index.ts`
- ✅ Created async export endpoint: `src/app/api/presentations/[id]/export-async/route.ts`
- ✅ Created job processor: `src/app/api/export-jobs/process/route.ts`
- ✅ Created download endpoint: `src/app/api/export-jobs/download/[jobId]/route.ts`
- ✅ Created cleanup cron: `src/app/api/cron/cleanup-exports/route.ts`

### 3. Vercel Configuration
- ✅ Created `vercel.json` with cron jobs:
  - Cleanup exports: Every hour
  - Reset credits: Daily at midnight

## 📋 Next Steps (Before Production)

### 1. Frontend Integration
Update `src/components/presentation/ExportModal.tsx` to:
- Add 1-minute timeout detection
- Switch to async export after timeout
- Show "We'll email you" message
- Display job status

See `ASYNC_EXPORT_IMPLEMENTATION.md` for code examples.

### 2. Environment Variables
Add to Vercel environment variables:
```bash
# Already configured (verify):
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_REPLY_TO_EMAIL=support@yourdomain.com

# Optional (recommended for security):
CRON_SECRET=generate_random_secret_here
```

### 3. Production Improvements

#### A. File Storage (CRITICAL)
Current implementation re-fetches files on download. For production:
- Set up Cloudflare R2 or AWS S3
- Upload exported files to cloud storage
- Store cloud URL in `ExportJob.fileUrl`
- Delete from cloud in cleanup cron

#### B. Queue System (RECOMMENDED)
Current implementation uses simple HTTP calls. For production:
- Use **Inngest** (easiest, serverless-friendly)
- Or **BullMQ** with Redis
- Or **Trigger.dev**
- Provides retry logic, monitoring, and better reliability

#### C. Authentication for Background Jobs
Current implementation has security gap. Solutions:
- Add internal API key validation
- Use signed JWTs
- Use service account tokens

### 4. Testing Checklist

#### Local Testing:
```bash
# 1. Test async export initiation
curl -X POST http://localhost:3000/api/presentations/[id]/export-async \
  -H "Content-Type: application/json" \
  -d '{"format":"pdf"}'

# 2. Test job processor (use jobId from step 1)
curl -X POST http://localhost:3000/api/export-jobs/process \
  -H "Content-Type: application/json" \
  -d '{"jobId":"[job-id]"}'

# 3. Test download (use jobId from step 1)
curl http://localhost:3000/api/export-jobs/download/[job-id]

# 4. Test cleanup cron
curl http://localhost:3000/api/cron/cleanup-exports
```

#### Production Testing:
1. Create a large presentation (20+ slides)
2. Click Export → PDF
3. Wait for timeout (1 minute)
4. Verify "We'll email you" message appears
5. Check email for download link
6. Click download link
7. Verify file downloads correctly
8. Wait 24 hours and verify file is deleted

### 5. Monitoring Setup

Add monitoring for:
- Failed export jobs (alert if > 5% failure rate)
- Processing time (alert if > 5 minutes average)
- Email delivery failures
- Storage usage
- Cron job execution

Recommended tools:
- Vercel Analytics (built-in)
- Sentry (error tracking)
- LogDNA/Datadog (logs)

### 6. Rate Limiting

Add to prevent abuse:
```typescript
// In export-async route
const recentJobs = await db.exportJob.count({
  where: {
    userId: authUser.id,
    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  }
});

if (recentJobs >= 20) {
  return NextResponse.json(
    { error: "Daily export limit reached" },
    { status: 429 }
  );
}
```

## 🚀 Deployment Steps

1. **Commit all changes**:
```bash
git add .
git commit -m "Add async export system with email notifications"
```

2. **Push to Vercel**:
```bash
git push origin main
```

3. **Verify in Vercel Dashboard**:
   - Go to Project → Cron Jobs
   - Verify both cron jobs are listed
   - Check first execution logs

4. **Add environment variables** (if not already set):
   - Go to Project → Settings → Environment Variables
   - Add `CRON_SECRET` (optional but recommended)

5. **Test in production**:
   - Create test presentation
   - Export as PDF
   - Verify email received
   - Test download link

## 📊 Database Schema

The `ExportJob` table structure:
```sql
CREATE TABLE "export_job" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "presentationId" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "status" TEXT DEFAULT 'pending',
  "fileUrl" TEXT,
  "fileSize" INTEGER,
  "error" TEXT,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "completedAt" TIMESTAMP
);

-- Indexes for performance
CREATE INDEX "export_job_userId_status_idx" ON "export_job"("userId", "status");
CREATE INDEX "export_job_status_createdAt_idx" ON "export_job"("status", "createdAt");
CREATE INDEX "export_job_expiresAt_idx" ON "export_job"("expiresAt");
```

## 🎯 Success Metrics

Track these metrics after deployment:
- Export completion rate (target: >95%)
- Average processing time (target: <3 minutes)
- Email delivery rate (target: >99%)
- User satisfaction (survey after download)
- Storage costs (monitor monthly)

## 📚 Documentation

- Full implementation guide: `ASYNC_EXPORT_IMPLEMENTATION.md`
- API endpoints documented in each route file
- Email templates in `src/lib/email/templates/`

## ⚠️ Known Limitations

1. Files are re-generated on download (not stored)
2. No proper queue system (simple HTTP call)
3. No retry logic for failed jobs
4. Authentication gap for background jobs
5. No rate limiting implemented yet

These should be addressed before heavy production use.

## 🆘 Troubleshooting

### Export jobs stuck in "processing"
- Check processor logs in Vercel
- Verify Adobe PDF Services is configured
- Check for timeout errors

### Emails not sending
- Verify RESEND_API_KEY is set
- Check Resend dashboard for delivery logs
- Verify email domain is verified

### Cron jobs not running
- Check Vercel Cron Jobs dashboard
- Verify `vercel.json` is in root directory
- Check cron execution logs

### Downloads failing
- Check if job is completed
- Verify job hasn't expired (24 hours)
- Check export endpoint logs

## 📞 Support

For issues:
1. Check Vercel logs
2. Check Prisma Studio for job status
3. Check Resend dashboard for email delivery
4. Review `ASYNC_EXPORT_IMPLEMENTATION.md`
