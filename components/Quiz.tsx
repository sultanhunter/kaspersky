"use client";

import { createClient } from "@/lib/supabase/client";
import { Profile, QuizQuestion } from "@/lib/types";
import { useEffect, useState } from "react";

interface QuizProps {
  user: Profile | null;
}

export default function Quiz({ user }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadQuestions() {
      // Get all questions
      const { data: allQuestions } = await supabase
        .from("quiz_questions")
        .select("*");

      if (allQuestions && allQuestions.length > 0) {
        // Randomly select 8-10 questions
        const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(10, allQuestions.length));
        setQuestions(selected);
      }
    }

    async function checkAttempt() {
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user is from school/college
      if (["School", "College"].includes(user.organization_type)) {
        setHasAttempted(true);
        setLoading(false);
        return;
      }

      // Check if already attempted
      const { data: attempt } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (attempt) {
        setHasAttempted(true);
      } else {
        await loadQuestions();
      }

      setLoading(false);
    }

    checkAttempt();
  }, [user, supabase]);

  function handleAnswer(answer: string) {
    setAnswers({ ...answers, [questions[currentQuestionIndex].id]: answer });
  }

  function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }

  function previousQuestion() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }

  async function submitQuiz() {
    if (!user) return;

    let totalScore = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        totalScore += q.points;
      }
    });

    setScore(totalScore);

    // Save attempt
    await supabase.from("quiz_attempts").insert([
      {
        user_id: user.id,
        score: totalScore,
        total_questions: questions.length,
        questions_data: { questions, answers },
      },
    ]);

    setShowScore(true);
  }

  async function submitFeedback() {
    if (!user || !feedback) return;

    await supabase.from("quiz_feedback").insert([
      {
        user_id: user.id,
        attempt_id: "", // Would need to get the attempt ID
        feedback,
      },
    ]);

    setShowFeedback(false);
    setShowSuccess(true);
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-kaspersky-100 mb-6">
          <svg
            className="w-10 h-10 text-kaspersky-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Authentication Required
        </h3>
        <p className="text-gray-600">
          Please log in to take the quiz and win exciting prizes
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-kaspersky-100 mb-6 animate-pulse">
          <svg
            className="w-10 h-10 text-kaspersky-600 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading Quiz</h3>
        <p className="text-gray-600">Preparing your questions...</p>
      </div>
    );
  }

  if (hasAttempted) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-soft border-2 border-orange-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-100 mb-6">
          <svg
            className="w-12 h-12 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {["School", "College"].includes(user.organization_type)
            ? "Not Eligible"
            : "Already Completed"}
        </h2>
        {["School", "College"].includes(user.organization_type) ? (
          <p className="text-lg text-gray-700 max-w-md mx-auto">
            School, college, and university students are not eligible to
            participate in the quiz.
          </p>
        ) : (
          <p className="text-lg text-gray-700 max-w-md mx-auto">
            You have already participated in the quiz. Each user can play only
            once. Thank you for participating!
          </p>
        )}
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-xl border-2 border-green-200 p-12 text-center animate-fade-in">
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-kaspersky-500 to-kaspersky-600 rounded-full animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-kaspersky-600 to-kaspersky-500 rounded-full flex items-center justify-center shadow-glow">
              <svg
                className="w-12 h-12 text-white animate-fade-in"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Thank You!
          </h2>
          <p className="text-xl text-gray-800 mb-3 font-semibold">
            Please collect your gift from the Kaspersky Booth
          </p>
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 border-2 border-kaspersky-200">
            <p className="text-sm text-gray-700">
              🏆 First 10 people with all correct answers are eligible for the
              premium gift!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showFeedback) {
    return (
      <div className="bg-white rounded-2xl shadow-glow border-2 border-gray-100 p-8 max-w-2xl mx-auto animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-kaspersky-500 to-kaspersky-600 rounded-xl shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Quiz Feedback</h2>
        </div>
        <p className="text-gray-600 mb-6 text-lg">
          Please share your feedback about the quiz experience:
        </p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-kaspersky-500 focus:border-kaspersky-500 transition-all mb-6 text-lg"
          rows={6}
          placeholder="Tell us what you think..."
        />
        <button
          onClick={submitFeedback}
          disabled={!feedback}
          className="w-full bg-gradient-to-r from-kaspersky-600 to-kaspersky-500 text-white py-4 rounded-xl font-bold text-lg hover:from-kaspersky-700 hover:to-kaspersky-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Submit Feedback
        </button>
      </div>
    );
  }

  if (showScore) {
    const maxScore = questions.length * 20;
    const percentage = (score / maxScore) * 100;
    const correctAnswers = questions.filter(
      (q) => answers[q.id] === q.correct_answer
    ).length;

    return (
      <div className="bg-gradient-to-br from-kaspersky-50 to-green-50 rounded-2xl shadow-xl border-2 border-kaspersky-200 p-12 text-center max-w-2xl mx-auto animate-fade-in">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">
          🎊 Quiz Complete!
        </h2>
        <div className="mb-10">
          <div className="relative inline-flex items-center justify-center w-48 h-48 mb-6">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#E5E7EB"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#00A88E"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${
                  2 * Math.PI * 88 * (1 - percentage / 100)
                }`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute">
              <p className="text-5xl font-bold text-kaspersky-600 mb-1">
                {percentage.toFixed(0)}%
              </p>
              <p className="text-sm text-gray-600 font-medium">
                {score} / {maxScore}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl text-gray-800 font-semibold">
              You answered{" "}
              <span className="text-kaspersky-600">{correctAnswers}</span> out
              of <span className="text-kaspersky-600">{questions.length}</span>{" "}
              questions correctly
            </p>
            {percentage === 100 && (
              <p className="text-lg text-green-600 font-bold">
                🌟 Perfect Score! You&apos;re among the top performers!
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowFeedback(true)}
          className="bg-gradient-to-r from-kaspersky-600 to-kaspersky-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-kaspersky-700 hover:to-kaspersky-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        >
          Continue to Feedback →
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 mb-6">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          No Questions Available
        </h3>
        <p className="text-gray-500">Quiz questions will be available soon</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const options = [
    { key: "A", text: currentQuestion.option_a },
    { key: "B", text: currentQuestion.option_b },
    { key: "C", text: currentQuestion.option_c },
    { key: "D", text: currentQuestion.option_d },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-glow border-2 border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-kaspersky-600 via-kaspersky-500 to-kaspersky-700 p-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern
                id="quiz-pattern"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="2" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#quiz-pattern)" />
            </svg>
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">
                Participate and WIN
              </h2>
            </div>
            <p className="text-white/90 text-lg mb-2">
              🎁 WIN Kaspersky Gift - Premium Xech Ellipse II
            </p>
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
              <p className="text-sm text-white/90">
                🏆 First 10 people with all correct answers are eligible
              </p>
            </div>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="p-8">
          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-kaspersky-600 bg-kaspersky-50 px-3 py-1 rounded-full">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {Object.keys(answers).length} / {questions.length} answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-kaspersky-600 to-kaspersky-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / questions.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">
              {currentQuestion.question}
            </h3>
            <div className="space-y-3">
              {options.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleAnswer(option.key)}
                  className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                    answers[currentQuestion.id] === option.key
                      ? "border-kaspersky-500 bg-kaspersky-50 shadow-md"
                      : "border-gray-200 hover:border-kaspersky-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        answers[currentQuestion.id] === option.key
                          ? "bg-kaspersky-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {option.key}
                    </span>
                    <span className="text-gray-800 flex-1">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            >
              ← Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                disabled={Object.keys(answers).length < questions.length}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                Submit Quiz ✓
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-6 py-3 bg-gradient-to-r from-kaspersky-600 to-kaspersky-500 text-white rounded-xl font-semibold hover:from-kaspersky-700 hover:to-kaspersky-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                Next →
              </button>
            )}
          </div>

          {/* Terms */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200 bg-gray-50 -mx-8 px-8 py-6 rounded-b-2xl">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-kaspersky-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Terms & Conditions
            </h4>
            <ul className="text-sm text-gray-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-kaspersky-600 mt-1">•</span>
                <span>1 user can play only once</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-kaspersky-600 mt-1">•</span>
                <span>
                  No school, college, university students are eligible for quiz
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-kaspersky-600 mt-1">•</span>
                <span>
                  Quiz will remain open from 9:00am to 5:00pm on all days
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
