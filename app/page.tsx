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
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

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
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-kaspersky-green">
                Kaspersky
              </h1>
              <span className="text-gray-600 text-sm">Enterprise Security</span>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Hi, {user.full_name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-linear-to-r from-kaspersky-green to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Kaspersky B2B Solutions</h2>
          <p className="text-xl opacity-90">
            Enterprise Security & Technology Alliance
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => handleTabClick("products")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "products"
                  ? "border-kaspersky-green text-kaspersky-green"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Product Showcase
            </button>
            <button
              onClick={() => handleTabClick("quiz")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "quiz"
                  ? "border-kaspersky-green text-kaspersky-green"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Take the Quiz
            </button>
            <button
              onClick={() => handleTabClick("demo")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "demo"
                  ? "border-kaspersky-green text-kaspersky-green"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Book a Demo Session
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "products" && <ProductShowcase user={user} />}
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
