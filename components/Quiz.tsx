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
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to take the quiz</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  if (hasAttempted) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Quiz Already Attempted
        </h2>
        {["School", "College"].includes(user.organization_type) ? (
          <p className="text-gray-600">
            School, college, and university students are not eligible for the
            quiz.
          </p>
        ) : (
          <p className="text-gray-600">
            You have already participated in the quiz. Each user can play only
            once.
          </p>
        )}
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-kaspersky-green rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-xl text-gray-700 mb-2">
            Please collect your gift from the Kaspersky Booth
          </p>
          <p className="text-gray-600">
            First 10 people with all correct answers are eligible for the
            premium gift!
          </p>
        </div>
      </div>
    );
  }

  if (showFeedback) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz Feedback</h2>
        <p className="text-gray-600 mb-4">
          Please share your feedback about the quiz experience:
        </p>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspersky-green focus:border-transparent mb-4"
          rows={5}
          placeholder="Your feedback..."
        />
        <button
          onClick={submitFeedback}
          disabled={!feedback}
          className="w-full bg-kaspersky-green text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          Submit Feedback
        </button>
      </div>
    );
  }

  if (showScore) {
    const maxScore = questions.length * 20;
    const percentage = (score / maxScore) * 100;

    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Quiz Complete!
        </h2>
        <div className="mb-6">
          <p className="text-5xl font-bold text-kaspersky-green mb-2">
            {score} / {maxScore}
          </p>
          <p className="text-gray-600">
            {percentage.toFixed(0)}% - You answered{" "}
            {questions.filter((q) => answers[q.id] === q.correct_answer).length}{" "}
            out of {questions.length} questions correctly
          </p>
        </div>
        <button
          onClick={() => setShowFeedback(true)}
          className="bg-kaspersky-green text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
        >
          Continue to Feedback
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-600">
          No quiz questions available at the moment
        </p>
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
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Participate and WIN
          </h2>
          <p className="text-gray-600">
            WIN Kaspersky Gift - Premium Xech Ellipse II
          </p>
          <p className="text-sm text-gray-500 mt-2">
            First 10 people with all correct answers are eligible
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Object.keys(answers).length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-kaspersky-green h-2 rounded-full transition-all"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            {currentQuestion.question}
          </h3>
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.key}
                onClick={() => handleAnswer(option.key)}
                className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion.id] === option.key
                    ? "border-kaspersky-green bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="font-medium text-gray-700">{option.key}.</span>{" "}
                <span className="text-gray-800">{option.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length < questions.length}
              className="px-8 py-2 bg-kaspersky-green text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="px-6 py-2 bg-kaspersky-green text-white rounded-lg hover:bg-emerald-700"
            >
              Next
            </button>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">
            Terms & Conditions:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 1 user can play only once</li>
            <li>
              • No school, college, university students are eligible for quiz
            </li>
            <li>• Quiz will remain open from 9:00am to 5:00pm on all days</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
