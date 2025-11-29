-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  organization TEXT NOT NULL,
  designation TEXT NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('School', 'College', 'Corporation', 'Pvt. Ltd', 'Government Org.', 'Other')),
  consent_communication BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  points INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  questions_data JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Quiz feedback table
CREATE TABLE public.quiz_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  attempt_id UUID REFERENCES public.quiz_attempts(id) NOT NULL,
  feedback TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  whitepaper_url TEXT,
  external_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document tracking table
CREATE TABLE public.document_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('preview', 'download')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demo bookings table (simplified - no demo_sessions table needed)
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

-- Create indexes
CREATE INDEX idx_profiles_mobile ON public.profiles(mobile);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX idx_demo_bookings_user ON public.demo_bookings(user_id);
CREATE INDEX idx_demo_bookings_session ON public.demo_bookings(product_name, session_date, start_time);
CREATE INDEX idx_document_views_user ON public.document_views(user_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Quiz questions: Anyone authenticated can read
CREATE POLICY "Authenticated users can view quiz questions" ON public.quiz_questions
  FOR SELECT TO authenticated USING (true);

-- Quiz attempts: Users can view and insert their own attempts
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quiz feedback: Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON public.quiz_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Products: Anyone authenticated can read
CREATE POLICY "Authenticated users can view products" ON public.products
  FOR SELECT TO authenticated USING (true);

-- Document views: Users can insert their own views
CREATE POLICY "Users can track own document views" ON public.document_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Demo bookings: Users can view and insert their own bookings
CREATE POLICY "Users can view own bookings" ON public.demo_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" ON public.demo_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view all bookings for counting purposes
CREATE POLICY "Users can view all bookings for availability" ON public.demo_bookings
  FOR SELECT TO authenticated USING (true);

-- Insert sample products
INSERT INTO public.products (name, description, category, external_url) VALUES
('Kaspersky Threat Intelligence', 'Advanced threat intelligence solutions', 'Security', 'https://www.kaspersky.co.in/enterprise-security/threat-intelligence'),
('Kaspersky Next XDR Expert', 'Extended Detection and Response platform', 'Security', 'https://www.kaspersky.co.in/enterprise-security/xdr'),
('Kaspersky SIEM', 'Unified Monitoring and Analysis Platform', 'Security', 'https://www.kaspersky.co.in/enterprise-security/unified-monitoring-and-analysis-platform'),
('Kaspersky Technology Alliance', 'Technology partnership solutions', 'Partnership', 'https://www.kaspersky.com/partners/technology/solutions');

-- Insert sample quiz questions
INSERT INTO public.quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer) VALUES
('What does XDR stand for?', 'Extended Detection and Response', 'Extra Data Recovery', 'External Device Recognition', 'Expanded Digital Resource', 'A'),
('Which Kaspersky solution provides unified monitoring?', 'XDR', 'SIEM', 'Threat Intelligence', 'Technology Alliance', 'B'),
('What is the primary purpose of Threat Intelligence?', 'Antivirus protection', 'Proactive threat detection', 'Data backup', 'Password management', 'B'),
('SIEM stands for?', 'Security Information and Event Management', 'System Integration Event Manager', 'Secure Internet Email Monitor', 'Software Installation Event Module', 'A'),
('Which solution helps with technology partnerships?', 'XDR', 'SIEM', 'Technology Alliance', 'Threat Intelligence', 'C'),
('What type of threats does Threat Intelligence focus on?', 'Physical threats', 'Cyber threats', 'Natural disasters', 'Hardware failures', 'B'),
('Which product is best for real-time security monitoring?', 'Technology Alliance', 'Threat Intelligence', 'SIEM', 'None', 'C'),
('XDR provides extended detection across?', 'Single endpoint', 'Multiple security layers', 'Email only', 'Network only', 'B'),
('What is a key benefit of SIEM?', 'Centralized log management', 'Email encryption', 'File compression', 'Video streaming', 'A'),
('Kaspersky Technology Alliance helps organizations with?', 'Hardware sales', 'Technology integration', 'Office management', 'HR solutions', 'B'),
('Which solution combines multiple data sources for analysis?', 'XDR', 'SIEM', 'Both A and B', 'None', 'C'),
('Threat Intelligence provides insights on?', 'Stock market', 'Cyber threats', 'Weather', 'Sports', 'B'),
('What is the main advantage of XDR over traditional antivirus?', 'Broader visibility', 'Cheaper price', 'Smaller size', 'Faster speed', 'A'),
('SIEM helps organizations comply with?', 'Fashion trends', 'Security regulations', 'Sports rules', 'Cooking standards', 'B'),
('Which Kaspersky product focuses on partnerships?', 'XDR', 'SIEM', 'Technology Alliance', 'Threat Intelligence', 'C'),
('Real-time threat detection is a feature of?', 'Threat Intelligence', 'All Kaspersky products', 'None', 'Only SIEM', 'B'),
('What does unified monitoring mean in SIEM?', 'Single dashboard view', 'Multiple separate tools', 'Manual checking', 'Email alerts only', 'A'),
('XDR extends detection to?', 'Cloud and endpoints', 'Only local files', 'Only emails', 'Only networks', 'A'),
('Technology Alliance enables?', 'Third-party integrations', 'Standalone operation', 'Manual processes', 'Limited compatibility', 'A'),
('Which solution is best for enterprise-wide security visibility?', 'Single antivirus', 'XDR + SIEM', 'None', 'Manual monitoring', 'B');
