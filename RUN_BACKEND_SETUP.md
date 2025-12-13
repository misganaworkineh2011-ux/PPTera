# Backend Setup Instructions

## Quick Start

Follow these steps to set up the backend for your landing pages:

### 1. Run Database Migration

```bash
npx prisma migrate dev --name add_landing_page_models
```

This will:
- Create all new database tables
- Update your Prisma schema
- Generate the Prisma Client

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. (Optional) Seed Sample Data

```bash
npx prisma db seed
```

This adds:
- 3 sample job postings
- 3 inspiration gallery items
- 3 blog posts

### 4. Restart Your Development Server

```bash
npm run dev
```

## Verify Setup

### Test the APIs:

1. **Contact Form**:
   - Go to `/contact`
   - Fill out and submit the form
   - Check for success message

2. **Inspiration Gallery**:
   - Go to `/inspiration`
   - Should load items from database
   - Try category filtering

3. **Newsletter**:
   - Add newsletter form to footer
   - Test subscription

## What's Working Now

✅ Contact form submissions saved to database
✅ Inspiration gallery loads from database
✅ Category filtering works
✅ Pagination with "Load More"
✅ View count tracking
✅ Newsletter subscriptions

## What Needs Frontend Updates

The following pages have backend APIs ready but need frontend updates:

### 1. Insights Page (`src/app/insights/page.tsx`)
- Update to fetch from `/api/insights`
- Add category filtering
- Add pagination

### 2. Careers Page (`src/app/careers/page.tsx`)
- Fetch jobs from `/api/careers/jobs`
- Add application form
- Connect to `/api/careers/apply`

### 3. Community Page (`src/app/community/page.tsx`)
- Fetch posts from `/api/community/posts`
- Add post creation form
- Display comments

## Database Schema Overview

```
ContactSubmission
├── id, name, email, subject, message
├── status (pending/replied/closed)
└── timestamps

CommunityPost
├── id, title, content, category
├── authorName, authorEmail
├── likes, views, isPinned, isApproved
└── comments[]

JobPosting
├── id, title, department, location, type
├── description, requirements, benefits
├── isActive
└── applications[]

InspirationGallery
├── id, title, description, imageUrl
├── category, tags[], likes, views
├── authorName, isPublic, isFeatured
└── timestamps

InsightPost
├── id, title, slug, excerpt, content
├── coverImage, category, tags[]
├── author, authorImage, readTime
├── views, likes, isPublished, isFeatured
└── publishedAt

Newsletter
├── id, email, isActive
└── subscribedAt, unsubscribedAt
```

## Troubleshooting

### Migration Fails
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Try: `npx prisma migrate reset` (WARNING: deletes all data)

### Prisma Client Not Found
- Run: `npx prisma generate`
- Restart your IDE/editor

### API Returns 500 Error
- Check server logs
- Verify database connection
- Check Prisma Client is generated

### No Data Showing
- Run seed script: `npx prisma db seed`
- Or manually add data via Prisma Studio: `npx prisma studio`

## Next Steps

1. Update remaining pages (Insights, Careers, Community)
2. Add admin dashboard for content management
3. Implement email notifications
4. Add file upload for resumes/images
5. Add rate limiting
6. Set up monitoring

## Support

Check `BACKEND_IMPLEMENTATION.md` for detailed documentation.
