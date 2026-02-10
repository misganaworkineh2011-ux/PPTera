# Async Export Implementation Guide

## Overview
This document describes the async export system that sends users an email with a download link when exports take longer than 1 minute, instead of making them wait.

## What Was Implemented

### 1. Database Schema (`prisma/schema.prisma`)
Added `ExportJob` model to track export jobs:
```prisma
model ExportJob {
  id             String    @id @default(cuid())
  userId         String
  presentationId String
  format         String    // pdf, pptx, images
  status         String    @default("pending") // pending, processing, completed, failed
  fileUrl        String?   // Download URL
  fileSize       Int?      // File size in bytes
  error          String?   // Error message if failed
  expiresAt      DateTime? // When file will be deleted (24 hours)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  completedAt    DateTime?
}
```

**Migration needed:**
```bash
npx prisma migrate dev --name add_export_jobs
npx prisma generate
```

### 2. Email Template (`src/lib/email/templates/export-ready.tsx`)
React Email template for notifying users when their export is ready.

### 3. Email Sender (`src/lib/email/send-export-ready.ts`)
Function to send export ready notifications using Resend.

### 4. API Endpoints

#### `/api/presentations/[id]/export-async` (POST)
- Initiates an async export job
- Returns immediately with a job ID
- Triggers background processing

#### `/api/export-jobs/process` (POST)
- Background processor that handles the actual export
- Calls the existing `/api/presentations/[id]/export` endpoint
- Sends email when complete
- Updates job status

#### `/api/export-jobs/download/[jobId]` (GET)
- Allows users to download completed exports
- Checks expiration (24 hours)
- Logs download activity

#### `/api/cron/cleanup-exports` (GET)
- Cron job to delete expired exports
- Runs hourly (configure in `vercel.json`)

### 5. Frontend Integration (TODO)

The ExportModal needs to be updated to:

1. **Add timeout detection** (1 minute):
```typescript
const [exportTimeout, setExportTimeout] = useState(false);
const [jobId, setJobId] = useState<string | null>(null);

const handleExport = async () => {
  setIsExporting(true);
  
  // Start timeout timer
  const timeoutId = setTimeout(() => {
    setExportTimeout(true);
    // Switch to async export
    initiateAsyncExport();
  }, 60000); // 1 minute
  
  try {
    // Try synchronous export first
    const response = await fetch(`/api/presentations/${presentationId}/export?format=${format}`);
    
    if (response.ok) {
      // Success - download immediately
      clearTimeout(timeoutId);
      const blob = await response.blob();
      downloadFile(blob, filename);
    }
  } catch (error) {
    // If it fails or times out, use async
    clearTimeout(timeoutId);
    await initiateAsyncExport();
  } finally {
    setIsExporting(false);
  }
};

const initiateAsyncExport = async () => {
  const response = await fetch(`/api/presentations/${presentationId}/export-async`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ format, range, customRange }),
  });
  
  const data = await response.json();
  setJobId(data.jobId);
  
  toast.success("Export is taking longer than expected. We'll email you when it's ready!");
};
```

2. **Add UI for async export state**:
```tsx
{exportTimeout && (
  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-sm text-blue-900">
      📧 Your export is being processed. We'll send you an email with a download link when it's ready.
    </p>
    {jobId && (
      <p className="text-xs text-blue-700 mt-2">
        Job ID: {jobId}
      </p>
    )}
  </div>
)}
```

## How It Works

### Flow Diagram

```
User clicks Export
       ↓
Try sync export (existing endpoint)
       ↓
   [1 minute timeout]
       ↓
If still processing:
  1. Call /export-async → Create ExportJob
  2. Show "We'll email you" message
  3. Close modal
       ↓
Background processor:
  1. Calls existing /export endpoint
  2. Stores file (temp solution: re-fetch on download)
  3. Sends email with download link
       ↓
User receives email
       ↓
Clicks download link
       ↓
/export-jobs/download/[jobId]
       ↓
File downloads
       ↓
After 24 hours: Cron job deletes expired exports
```

## Production Considerations

### 1. File Storage
Current implementation re-fetches the file on download. For production:
- Upload to S3/R2/Cloudflare R2
- Store the cloud URL in `fileUrl`
- Delete from cloud storage in cleanup cron

### 2. Queue System
Current implementation uses a simple HTTP call. For production:
- Use **BullMQ** with Redis
- Or **Inngest** (serverless-friendly)
- Or **Trigger.dev** (easiest)
- Or **Vercel Queues** (when available)

### 3. Authentication for Background Jobs
Current implementation has a security gap. Solutions:
- Use internal API keys
- Use service account tokens
- Use signed JWTs with long expiration

### 4. Monitoring
Add monitoring for:
- Failed export jobs
- Processing time
- Email delivery failures
- Storage usage

### 5. Rate Limiting
Add rate limits to prevent abuse:
- Max 5 concurrent exports per user
- Max 20 exports per day for free users

## Environment Variables

Add to `.env`:
```bash
# Already configured
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Optional: For cron job security
CRON_SECRET=your_random_secret_string
```

## Vercel Configuration

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup-exports",
    "schedule": "0 * * * *"
  }]
}
```

## Testing

1. **Test async export**:
```bash
curl -X POST http://localhost:3000/api/presentations/[id]/export-async \
  -H "Content-Type: application/json" \
  -d '{"format":"pdf"}'
```

2. **Test job processor**:
```bash
curl -X POST http://localhost:3000/api/export-jobs/process \
  -H "Content-Type: application/json" \
  -d '{"jobId":"[job-id]"}'
```

3. **Test download**:
```bash
curl http://localhost:3000/api/export-jobs/download/[job-id]
```

4. **Test cleanup**:
```bash
curl http://localhost:3000/api/cron/cleanup-exports
```

## Next Steps

1. Run database migration
2. Update ExportModal component (see Frontend Integration above)
3. Test with a large presentation (20+ slides)
4. Set up cloud storage (S3/R2)
5. Implement proper queue system
6. Add monitoring and alerts
7. Deploy and test in production

## Benefits

- ✅ Better UX - users don't wait for long exports
- ✅ No timeout errors
- ✅ Email notification when ready
- ✅ 24-hour download window
- ✅ Automatic cleanup
- ✅ Scalable architecture

## Limitations (Current Implementation)

- ⚠️ Files are re-generated on download (not stored)
- ⚠️ No proper queue system (simple HTTP call)
- ⚠️ No retry logic for failed jobs
- ⚠️ Authentication gap for background jobs

These should be addressed before production deployment.
