# 🚨 Database Setup Required

## Error: Tables Don't Exist

You're seeing this error because the database tables haven't been created yet:
```
The table `public.inspiration_gallery` does not exist in the current database.
```

## ✅ Quick Fix - Run These Commands:

### Step 1: Run Migration
```bash
npx prisma migrate dev --name add_landing_page_models
```

This will:
- Create all 8 new database tables
- Update your database schema
- Generate the Prisma Client

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: (Optional) Add Sample Data
```bash
npx prisma db seed
```

This adds:
- 3 sample job postings
- 3 inspiration gallery items
- 3 blog posts

### Step 4: Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## 🎯 What This Does

The migration creates these tables:
1. `contact_submission` - Contact form data
2. `inspiration_gallery` - Presentation showcase
3. `insight_post` - Blog articles
4. `job_posting` - Career opportunities
5. `job_application` - Job applications
6. `community_post` - Forum posts
7. `community_comment` - Post comments
8. `newsletter` - Email subscriptions

## ⚠️ Important Notes

- Make sure your `DATABASE_URL` is set in `.env`
- PostgreSQL must be running
- You only need to run this once
- The migration is safe and won't delete existing data

## 🔍 Verify Setup

After running the commands, check:

```bash
# View your database
npx prisma studio
```

This opens a GUI where you can see all your tables and data.

## 🐛 Troubleshooting

### If migration fails:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migration again
npx prisma migrate dev --name add_landing_page_models
```

### If Prisma Client not found:
```bash
npx prisma generate
```

### If connection fails:
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check database credentials

## ✅ Success!

Once complete, you should see:
- ✅ All pages load without errors
- ✅ Forms submit successfully
- ✅ Data appears in database
- ✅ Filtering and pagination work

## 📝 Quick Commands Summary

```bash
# Complete setup in 3 commands:
npx prisma migrate dev --name add_landing_page_models
npx prisma generate
npx prisma db seed

# Then restart:
npm run dev
```

That's it! Your backend will be fully operational. 🚀
