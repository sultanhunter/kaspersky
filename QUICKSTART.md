# 🚀 Quick Start - Kaspersky B2B Platform

## ✅ Your App is Ready!

The development server is running at: **http://localhost:3000**

## 📋 What You Need to Do Next (3 Steps)

### Step 1: Set Up Database (1 minute)

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Copy all content from `supabase-schema.sql` and run it

✅ Done! Your database is ready with:

- All tables created
- 4 products added
- 20 quiz questions loaded
- Demo sessions generated dynamically in the frontend (for today and tomorrow)

**Note**: Demo sessions are now automatically generated based on the current date. No need to add them manually to the database!

### Step 2: Test the Application

Open http://localhost:3000 and try:

1. **Register a User**

   - Click on any tab (triggers login modal)
   - Fill in the registration form
   - ⚠️ Use "Corporation" or "Pvt. Ltd" as org type (not School/College)
   - Submit

2. **Explore Features**
   - ✅ View Product Showcase
   - ✅ Take the Quiz (8-10 random questions)
   - ✅ Book Demo Sessions (up to 3)

### Step 3: Deploy to Production (Optional)

When ready to go live:

```bash
# Push to GitHub
git add .
git commit -m "Kaspersky B2B Platform"
git push origin main

# Then deploy on Vercel
# https://vercel.com - Import your repo
```

## 🎯 Key Features Implemented

✅ **User Registration** - with mobile & email validation  
✅ **Product Showcase** - 4 Kaspersky products with tracking  
✅ **Interactive Quiz** - Random questions, one-time play  
✅ **Demo Booking** - Time slots with capacity management  
✅ **User Personalization** - Greetings and activity tracking

## 📱 What the User Sees

1. **Homepage** → Kaspersky banner + 3 tabs
2. **Click any tab** → Login modal appears
3. **After login** → Personalized greeting "Hi, [Name]"
4. **Redirected** → To the tab they clicked

## ⚙️ Business Rules Working

- ✅ Mobile numbers must be unique
- ✅ Email addresses must be unique
- ✅ School/college students can't take quiz
- ✅ One quiz attempt per user
- ✅ Max 3 demo bookings per user
- ✅ One product demo booking per user
- ✅ Real-time session availability

## 📊 Database Tables

All tables created and ready:

- `profiles` - User data
- `products` - Kaspersky products (4 pre-loaded)
- `quiz_questions` - Quiz pool (20 questions)
- `quiz_attempts` - User quiz scores
- `quiz_feedback` - Post-quiz feedback
- `demo_bookings` - User bookings (sessions generated dynamically in frontend)
- `document_views` - Activity tracking

**Note**: The `demo_sessions` table has been removed. Sessions are now generated dynamically in the frontend based on the current date!

## 🎨 UI/UX

- Clean, modern design
- Kaspersky brand colors (#00A88E)
- Responsive layout
- Smooth transitions
- User-friendly forms

## 📖 Documentation

- `DEPLOYMENT.md` - Complete deployment guide
- `SETUP.md` - Technical setup instructions
- `supabase-schema.sql` - Database schema
- `demo-sessions.sql` - Demo session data

## 🐛 Troubleshooting

**Can't see quiz questions?**
→ Run `supabase-schema.sql` in Supabase

**Demo sessions not showing?**
→ Sessions are generated automatically for today and tomorrow. Check your system date is correct.

**Registration not working?**
→ Check Supabase tables are created

## 💡 Next Steps

1. Run the SQL scripts in Supabase (if not done)
2. Test all features locally
3. Demo sessions will show for today and tomorrow automatically
4. Replace quiz questions with final questions
5. Deploy to production

## 🎉 You're All Set!

Everything is configured and ready to use. Just set up the database and start testing!

---

**Need Help?** Check `DEPLOYMENT.md` for detailed instructions.
