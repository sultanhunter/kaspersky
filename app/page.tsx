"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Profile } from "@/lib/types";
import LoginModal from "@/components/LoginModal";
import ProductShowcase from "@/components/ProductShowcase";
import Quiz from "@/components/Quiz";
import DemoBooking from "@/components/DemoBooking";

export default function Home() {
  const [user, setUser] = useState<Profile | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "quiz" | "demo">(
    "products"
  );
  const [pendingTab, setPendingTab] = useState<
    "products" | "quiz" | "demo" | null
  >(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser(profile);
        }
      }
    }

    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTabClick(tab: "products" | "quiz" | "demo") {
    if (!user) {
      setPendingTab(tab);
      setShowLogin(true);
    } else {
      setActiveTab(tab);
    }
  }

  function handleLoginSuccess(profile: Profile) {
    setUser(profile);
    setShowLogin(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setActiveTab("products");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 backdrop-blur-lg border-b border-gray-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-kaspersky-500 to-kaspersky-600 rounded-lg flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-kaspersky-600">
                  Kaspersky
                </h1>
                <span className="text-xs text-gray-500 font-medium">
                  Enterprise Security
                </span>
              </div>
            </div>
            {mounted && user && (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-kaspersky-50 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-kaspersky-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-kaspersky-700">
                    Hi, {user.full_name.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-kaspersky-600 px-4 py-2 rounded-lg hover:bg-kaspersky-50 transition-all"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-kaspersky-600 via-kaspersky-500 to-kaspersky-400">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              backgroundSize: "60px 60px",
            }}
          ></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-5xl font-bold text-white mb-4 animate-fade-in">
            Kaspersky B2B Solutions
          </h2>
          <p className="text-xl text-white/90 font-light animate-slide-up">
            Enterprise Security & Technology Alliance Platform
          </p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white font-medium">
              🛡️ Enterprise Protection
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white font-medium">
              🚀 Advanced Security
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white font-medium">
              💼 B2B Solutions
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass border-b border-kaspersky-100/30 shadow-soft -mt-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => handleTabClick("products")}
              className={`group py-4 px-6 border-b-3 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === "products"
                  ? "border-kaspersky-500 text-kaspersky-600 bg-kaspersky-50/50"
                  : "border-transparent text-gray-600 hover:text-kaspersky-600 hover:bg-kaspersky-50/30"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Product Showcase
              </span>
            </button>
            <button
              onClick={() => handleTabClick("quiz")}
              className={`group py-4 px-6 border-b-3 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === "quiz"
                  ? "border-kaspersky-500 text-kaspersky-600 bg-kaspersky-50/50"
                  : "border-transparent text-gray-600 hover:text-kaspersky-600 hover:bg-kaspersky-50/30"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Take the Quiz
              </span>
            </button>
            <button
              onClick={() => handleTabClick("demo")}
              className={`group py-4 px-6 border-b-3 font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === "demo"
                  ? "border-kaspersky-500 text-kaspersky-600 bg-kaspersky-50/50"
                  : "border-transparent text-gray-600 hover:text-kaspersky-600 hover:bg-kaspersky-50/30"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Book a Demo Session
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
        {activeTab === "products" && (
          <ProductShowcase
            user={user}
            onLoginClick={() => setShowLogin(true)}
          />
        )}
        {activeTab === "quiz" && <Quiz user={user} />}
        {activeTab === "demo" && <DemoBooking user={user} />}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          onClose={() => {
            setShowLogin(false);
            setPendingTab(null);
          }}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
