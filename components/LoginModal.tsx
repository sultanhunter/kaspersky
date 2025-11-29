"use client";

import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { useState } from "react";

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (profile: Profile) => void;
}

type AuthMethod = "mobile" | "email";
type Step = "method" | "credential" | "otp" | "signup";

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const [step, setStep] = useState<Step>("method");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("mobile");
  const [credential, setCredential] = useState("");
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    mobile: "",
    email: "",
    organization: "",
    designation: "",
    organization_type: "Corporation",
    consent_communication: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const organizationTypes = [
    "School",
    "College",
    "Corporation",
    "Pvt. Ltd",
    "Government Org.",
    "Other",
  ];

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (authMethod === "mobile") {
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(credential)) {
          throw new Error("Please enter a valid 10-digit mobile number");
        }
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credential)) {
          throw new Error("Please enter a valid email address");
        }
      }

      if (authMethod === "mobile") {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: `+91${credential}`,
        });
        if (otpError) throw otpError;
      } else {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: credential.toLowerCase(),
          options: {
            shouldCreateUser: true,
            emailRedirectTo: undefined,
          },
        });
        if (otpError) throw otpError;
      }

      setStep("otp");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (otp.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP");
      }

      const verifyData =
        authMethod === "mobile"
          ? {
              phone: `+91${credential}`,
              token: otp,
              type: "sms" as const,
            }
          : {
              email: credential.toLowerCase(),
              token: otp,
              type: "email" as const,
            };

      const { data: authData, error: verifyError } =
        await supabase.auth.verifyOtp(verifyData);

      if (verifyError) throw verifyError;

      if (!authData.user) {
        throw new Error("Verification failed");
      }

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq(authMethod, credential)
        .single();

      if (existingProfile) {
        onSuccess(existingProfile);
      } else {
        setFormData({
          ...formData,
          [authMethod]: credential,
        });
        setStep("signup");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Authentication session expired. Please try again.");
      }

      if (authMethod === "mobile") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          throw new Error("Please enter a valid email address");
        }

        const { data: existingEmail } = await supabase
          .from("profiles")
          .select("email")
          .eq("email", formData.email.toLowerCase())
          .single();

        if (existingEmail) {
          throw new Error("This email is already registered");
        }
      } else {
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(formData.mobile)) {
          throw new Error("Please enter a valid 10-digit mobile number");
        }

        const { data: existingMobile } = await supabase
          .from("profiles")
          .select("mobile")
          .eq("mobile", formData.mobile)
          .single();

        if (existingMobile) {
          throw new Error("This mobile number is already registered");
        }
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            ...formData,
            email: formData.email.toLowerCase(),
          },
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      onSuccess(profile);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const renderContent = () => {
    if (step === "method") {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Choose Login Method
            </h3>
            <p className="text-gray-600">
              Select how you want to verify your identity
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled
              className="p-6 border-2 border-gray-200 rounded-xl opacity-50 cursor-not-allowed relative"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="font-bold text-gray-500">Mobile Number</span>
                <span className="text-xs text-gray-400">Coming Soon</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod("email");
                setStep("credential");
              }}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-kaspersky-500 hover:bg-kaspersky-50 transition-all group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-kaspersky-100 rounded-full flex items-center justify-center group-hover:bg-kaspersky-500 transition-all">
                  <svg
                    className="w-8 h-8 text-kaspersky-600 group-hover:text-white transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="font-bold text-gray-900">Email Address</span>
                <span className="text-sm text-gray-500">
                  Verify via Email OTP
                </span>
              </div>
            </button>
          </div>
        </div>
      );
    }

    if (step === "credential") {
      return (
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Enter Your {authMethod === "mobile" ? "Mobile Number" : "Email"}
            </h3>
            <p className="text-gray-600">
              We&apos;ll send you a verification code
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {authMethod === "mobile" ? "Mobile Number" : "Email Address"} *
            </label>
            {authMethod === "mobile" ? (
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-kaspersky-500 focus:border-kaspersky-500 transition-all text-lg"
                placeholder="9876543210"
                autoFocus
              />
            ) : (
              <input
                type="email"
                required
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-kaspersky-500 focus:border-kaspersky-500 transition-all text-lg"
                placeholder="john@company.com"
                autoFocus
              />
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 animate-fade-in">
              <svg
                className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep("method");
                setError("");
                setCredential("");
              }}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-kaspersky-600 to-kaspersky-500 text-white py-3 rounded-xl font-bold hover:from-kaspersky-700 hover:to-kaspersky-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        </form>
      );
    }

    if (step === "otp") {
      return (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-kaspersky-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-kaspersky-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Enter Verification Code
            </h3>
            <p className="text-gray-600">
              We sent a code to{" "}
              <span className="font-semibold text-gray-900">{credential}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
              6-Digit OTP *
            </label>
            <input
              type="text"
              required
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-kaspersky-500 focus:border-kaspersky-500 transition-all text-2xl text-center font-bold tracking-widest"
              placeholder="000000"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 animate-fade-in">
              <svg
                className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setStep("credential");
                setError("");
                setOtp("");
              }}
              className="text-sm text-kaspersky-600 hover:text-kaspersky-700 font-medium"
            >
              Change {authMethod === "mobile" ? "number" : "email"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-kaspersky-600 to-kaspersky-500 text-white py-3 rounded-xl font-bold hover:from-kaspersky-700 hover:to-kaspersky-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      );
    }

    if (step === "signup") {
      return (
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h3>
            <p className="text-gray-600">
              Just a few more details to get started
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-kaspersky-500 focus:border-kaspersky-500 transition-all"
              placeholder="John Doe"
            />
          </div>

          {authMethod === "mobile" ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-kaspersky-500 focus:border-kaspersky-500 transition-all"
                placeholder="john@company.com"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-kaspersky-500 focus:border-kaspersky-500 transition-all"
                placeholder="9876543210"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organization *
              </label>
              <input
                type="text"
                required
                value={formData.organization}
                onChange={(e) =>
                  setFormData({ ...formData, organization: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-kaspersky-500 focus:border-kaspersky-500 transition-all"
                placeholder="Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Designation *
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-kaspersky-500 focus:border-kaspersky-500 transition-all"
                placeholder="Your Role"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Organization Type *
            </label>
            <select
              required
              value={formData.organization_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  organization_type: e.target.value,
                })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-kaspersky-500 focus:border-kaspersky-500 transition-all bg-white"
            >
              {organizationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-start p-4 bg-kaspersky-50 rounded-xl border-2 border-kaspersky-100">
            <input
              type="checkbox"
              id="consent"
              required
              checked={formData.consent_communication}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  consent_communication: e.target.checked,
                })
              }
              className="mt-1 h-5 w-5 text-kaspersky-600 focus:ring-2 focus:ring-kaspersky-500 border-gray-300 rounded transition-all"
            />
            <label
              htmlFor="consent"
              className="ml-3 text-sm text-gray-700 leading-relaxed"
            >
              I consent to future communication from Kaspersky *
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 animate-fade-in">
              <svg
                className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-kaspersky-600 to-kaspersky-500 text-white py-4 rounded-xl font-bold text-lg hover:from-kaspersky-700 hover:to-kaspersky-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                Creating Account...
              </span>
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="bg-gradient-to-r from-kaspersky-600 to-kaspersky-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {step === "method" && "Welcome! 👋"}
                {step === "credential" && "Login / Sign Up"}
                {step === "otp" && "Verify OTP"}
                {step === "signup" && "Create Account"}
              </h2>
              <p className="text-white/80 text-sm">
                {step === "method" && "Choose your preferred login method"}
                {step === "credential" && "Enter your credentials to continue"}
                {step === "otp" && "Check your messages for the code"}
                {step === "signup" && "Complete your profile to get started"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-8">{renderContent()}</div>
      </div>
    </div>
  );
}
