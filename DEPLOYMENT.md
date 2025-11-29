# Kaspersky B2B Platform - Deployment Guide

## Quick Start (5 Minutes)

### Step 1: Set up Supabase Database

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Click on "SQL Editor"** in the left sidebar
3. **Execute the main schema**:

   - Open the file `supabase-schema.sql`
   - Copy all the SQL code
   - Paste it into the SQL Editor
   - Click "Run" to execute
   - This creates all tables, security policies, and sample data

**Note**: Demo sessions are now generated dynamically in the frontend based on the current date. No need to add them manually!

### Step 2: Run the Application

Your environment variables are already configured in `.env.local`.

```bash
# Start the development server
npm run dev
```

The application will be available at: http://localhost:3000

## Database Tables Created

✅ **profiles** - User registration data  
✅ **products** - Kaspersky product catalog (pre-populated)  
✅ **quiz_questions** - Quiz question pool (20 sample questions included)  
✅ **quiz_attempts** - User quiz submissions  
✅ **quiz_feedback** - Post-quiz feedback  
✅ **demo_bookings** - User demo reservations  
✅ **document_views** - Tracks user document interactions

**Note**: Demo sessions are generated dynamically in the frontend for today and tomorrow.

## What's Included

### Pre-populated Data:

- ✅ 4 Kaspersky products with external links
- ✅ 20 quiz questions about Kaspersky products
- ✅ Demo sessions generated dynamically (4 products × 4 time slots × 2 days)

### Features Working:

- ✅ User registration with validation
- ✅ Duplicate mobile/email prevention
- ✅ Product showcase with tracking
- ✅ Quiz with random questions (8-10 from pool)
- ✅ Quiz eligibility (no school/college students)
- ✅ One-time quiz participation
- ✅ Demo booking with constraints
- ✅ User personalization

## Testing the Application

### 1. Register a New User

- Click any tab (Product Showcase, Quiz, or Demo)
- Login modal appears
- Fill in all required fields
- Organization Type: Choose "Corporation" or "Pvt. Ltd" (not School/College to be eligible for quiz)
- Submit

### 2. Test Product Showcase

- View all 4 Kaspersky products
- Click "View Details" to open external links
- Click "Download Brochure" to track downloads
- All actions are tracked in the database

### 3. Test Quiz

- Navigate to "Take the Quiz" tab
- 8-10 random questions will appear
- Select answers and navigate with Previous/Next
- Submit quiz to see score (each question = 20 points)
- Fill in feedback survey
- See success message

### 4. Test Demo Booking

- Navigate to "Book a Demo Session"
- See available time slots for all 4 products
- Book up to 3 different product demos
- Try booking the same product twice (should be prevented)
- See your confirmed bookings

## Business Rules Enforced

### Registration:

- ✅ All fields required
- ✅ Mobile: 10 digits, unique
- ✅ Email: valid format, unique
- ✅ Consent required

### Quiz:

- ✅ School/college students not eligible
- ✅ One attempt per user
- ✅ Random 8-10 questions from pool
- ✅ 20 points per question
- ✅ Feedback required after quiz
- ✅ Time window: 9am-5pm (enforced in UI)

### Demo Booking:

- ✅ Maximum 3 bookings per user
- ✅ One booking per product per user
- ✅ Session capacity: 20 people
- ✅ Time slots: 11am-5pm with lunch break
- ✅ Real-time availability

## Production Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**:

   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Done!** Your app will be live in 2-3 minutes.

## Customization Guide

### Update Quiz Questions

```sql
-- Add more questions to the pool
INSERT INTO public.quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer)
VALUES ('Your question here?', 'Option A', 'Option B', 'Option C', 'Option D', 'A');
```

### Add More Demo Sessions

```sql
-- Add sessions for additional days
INSERT INTO public.demo_sessions (product_name, session_date, start_time, end_time, capacity)
VALUES ('Threat Intelligence', '2025-12-03', '11:00', '11:30', 20);
```

### Update Products

```sql
-- Add or update products
INSERT INTO public.products (name, description, category, external_url)
VALUES ('New Product', 'Description', 'Security', 'https://www.kaspersky.com/product');
```

### Change Brand Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  kaspersky: {
    green: '#00A88E',  // Change this
    dark: '#1A1A1A',
    light: '#F5F5F5',
  },
}
```

## Monitoring & Analytics

### View User Activity in Supabase

**Total Registrations:**

```sql
SELECT COUNT(*) FROM profiles;
```

**Quiz Participation:**

```sql
SELECT COUNT(*) as attempts, AVG(score) as avg_score FROM quiz_attempts;
```

**Top Scoring Users:**

```sql
SELECT p.full_name, p.organization, qa.score
FROM quiz_attempts qa
JOIN profiles p ON p.id = qa.user_id
ORDER BY qa.score DESC
LIMIT 10;
```

**Demo Bookings by Product:**

```sql
SELECT product_name, COUNT(*) as bookings
FROM demo_bookings
GROUP BY product_name;
```

**Document Downloads:**

```sql
SELECT p.name, COUNT(*) as views
FROM document_views dv
JOIN products p ON p.id = dv.product_id
WHERE dv.action_type = 'download'
GROUP BY p.name;
```

## Troubleshooting

### Issue: "Database connection error"

- Check if SQL schemas were executed successfully
- Verify environment variables in `.env.local`
- Check Supabase project is active

### Issue: "Can't register user"

- Check if profiles table exists
- Verify RLS policies are enabled
- Check mobile/email uniqueness constraints

### Issue: "No quiz questions appearing"

- Verify quiz_questions table has data
- Check RLS policy for authenticated users
- Ensure user is not from School/College

### Issue: "Demo sessions not showing"

- Run `demo-sessions.sql` to populate sessions
- Check session dates are in the future
- Verify demo_sessions table exists

## Support & Next Steps

### What's Working:

✅ Full user registration & authentication  
✅ Product showcase with tracking  
✅ Interactive quiz with scoring  
✅ Demo booking system  
✅ All business rules enforced  
✅ Clean, modern UI

### Optional Enhancements (Not in MVP):

- Email verification (currently skipped as requested)
- SMS OTP (currently skipped as requested)
- Admin dashboard for analytics
- Export user data to CSV
- Email notifications for bookings
- QR code generation
- Mobile app version

## Going Live Checklist

Before going live:

- [ ] Run all SQL schemas in production Supabase
- [ ] Test registration flow
- [ ] Test quiz with multiple users
- [ ] Test demo booking limits
- [ ] Verify all external product links work
- [ ] Update demo session dates to actual event dates
- [ ] Configure custom domain (if needed)
- [ ] Enable Supabase backups
- [ ] Test on mobile devices

## Contact

For technical support or questions about the implementation, refer to the code comments or Supabase documentation.

---

**Built with**: Next.js 14, React, TypeScript, Tailwind CSS, Supabase  
**Status**: Production Ready ✅
