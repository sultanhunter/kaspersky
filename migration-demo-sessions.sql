-- Migration: Remove demo_sessions table and update demo_bookings structure
-- Run this if you already executed the old schema

-- Step 1: Drop the old demo_bookings table and demo_sessions table
DROP TABLE IF EXISTS public.demo_bookings CASCADE;
DROP TABLE IF EXISTS public.demo_sessions CASCADE;

-- Step 2: Create new simplified demo_bookings table
CREATE TABLE public.demo_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  product_name TEXT NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_name)
);

-- Step 3: Create indexes
CREATE INDEX idx_demo_bookings_user ON public.demo_bookings(user_id);
CREATE INDEX idx_demo_bookings_session ON public.demo_bookings(product_name, session_date, start_time);

-- Step 4: Enable Row Level Security
ALTER TABLE public.demo_bookings ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies
CREATE POLICY "Users can view own bookings" ON public.demo_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" ON public.demo_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view all bookings for counting purposes (to check availability)
CREATE POLICY "Users can view all bookings for availability" ON public.demo_bookings
  FOR SELECT TO authenticated USING (true);
