# Kaspersky B2B Platform

A Next.js web application for Kaspersky's enterprise security showcase, quiz, and demo booking system.

## Features

- **User Authentication**: Registration and login with Supabase Auth
- **Product Showcase**: Browse Kaspersky enterprise products with download tracking
- **Interactive Quiz**: Participate in a quiz with random questions and win prizes
- **Demo Booking**: Book demo sessions for various Kaspersky products
- **User Personalization**: Personalized greetings and activity tracking

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Authentication)
- **Styling**: Tailwind CSS with custom Kaspersky theme

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## Setup Instructions

### 1. Database Setup

Run the SQL schema in your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Execute the SQL to create all tables, policies, and sample data

### 2. Environment Variables

The `.env.local` file is already configured with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Application Flow

### Step 1: Landing Page

- User scans QR code and lands on homepage
- Homepage displays Kaspersky banner and 3 tabs:
  - Product Showcase
  - Take the Quiz
  - Book a Demo Session
- Clicking any CTA triggers login popup

### Step 2: Login/Register

- Full-screen login form with fields:
  - Full Name
  - Mobile Number (validated for uniqueness)
  - Email Address (validated for uniqueness)
  - Organization
  - Designation
  - Organization Type (dropdown)
  - Consent checkbox
- Mobile validation to prevent duplicates
- Email validation to prevent duplicates

### Step 3: Logged In Experience

- Personalized greeting: "Hi, [User Name]"
- User is redirected to the tab they clicked before login

## Features Details

### Product Showcase

- Displays 4 Kaspersky products:
  - Threat Intelligence
  - Next XDR Expert
  - SIEM
  - Technology Alliance
- Each product links to external documentation
- Tracks user downloads and previews

### Quiz System

- Random 8-10 questions from pool of 20+ questions
- Each question worth 20 points
- One-time participation per user
- School/college students not eligible
- Post-quiz feedback survey
- Success message: "Collect your gift from Kaspersky Booth"
- Quiz available 9:00am to 5:00pm

### Demo Booking

- 4 products available: TI, XDR, SIEM, TA
- Sessions between 11:00am - 5:00pm
- 30-minute sessions with 30-minute breaks
- Lunch break: 1:00pm - 3:00pm
- Users can book up to 3 demos
- One product demo per user across 2 days
- Real-time availability tracking

## Database Structure

- `profiles`: User information
- `products`: Product catalog
- `document_views`: Track user document interactions
- `quiz_questions`: Quiz question pool
- `quiz_attempts`: User quiz submissions
- `quiz_feedback`: Post-quiz feedback
- `demo_sessions`: Available demo time slots
- `demo_bookings`: User demo reservations

## Build for Production

```bash
npm run build
npm start
```

## Deployment

This application can be deployed to Vercel, Netlify, or any platform supporting Next.js:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

## Notes

- Email/phone verification is not implemented as per requirements
- Sample quiz questions are included in the schema
- Demo session slots need to be created manually in the database
- The application uses Kaspersky brand colors (#00A88E)

## Support

For issues or questions, please refer to the documentation or contact the development team.
