@echo off
echo ========================================
echo   PPTMaster Database Setup
echo ========================================
echo.
echo This will create all database tables...
echo.
pause

echo.
echo [1/3] Running database migration...
call npx prisma migrate dev --name add_landing_page_models

echo.
echo [2/3] Generating Prisma Client...
call npx prisma generate

echo.
echo [3/3] Seeding sample data...
call npx prisma db seed

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Your database is ready to use.
echo.
echo Next steps:
echo 1. Start your dev server: npm run dev
echo 2. Visit http://localhost:3000
echo 3. Test the pages:
echo    - /contact
echo    - /inspiration
echo    - /insights
echo    - /careers
echo    - /community
echo.
echo To view your database, run: npx prisma studio
echo.
pause
