export interface Profile {
  id: string;
  full_name: string;
  mobile: string;
  email: string;
  organization: string;
  designation: string;
  organization_type: string;
  consent_communication: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  points: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  score: number;
  total_questions: number;
  questions_data: Record<string, unknown>;
  completed_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  whitepaper_url?: string;
  external_url?: string;
  created_at: string;
}

export interface DemoBooking {
  id: string;
  user_id: string;
  product_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  created_at: string;
}
