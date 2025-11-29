"use client";

import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { useState } from "react";

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (profile: Profile) => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate mobile number
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(formData.mobile)) {
        throw new Error("Please enter a valid 10-digit mobile number");
      }

      // Check for duplicate mobile
      const { data: existingMobile } = await supabase
        .from("profiles")
        .select("mobile")
        .eq("mobile", formData.mobile)
        .single();

      if (existingMobile) {
        throw new Error("This mobile number is already registered");
      }

      // Check for duplicate email
      const { data: existingEmail } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", formData.email.toLowerCase())
        .single();

      if (existingEmail) {
        throw new Error("This email is already registered");
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(),
        password: formData.mobile + formData.email, // Simple password for demo
        options: {
          data: {
            full_name: formData.full_name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: authData.user.id,
              ...formData,
              email: formData.email.toLowerCase(),
            },
          ])
          .select()
          .single();

        if (profileError) throw profileError;

        onSuccess(profile);
      }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Login / Register
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <p className="text-gray-600 mb-6">Please enter your details:</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspersky-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspersky-green focus:border-transparent"
                placeholder="10-digit number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspersky-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization *
              </label>
              <input
                type="text"
                required
                value={formData.organization}
                onChange={(e) =>
                  setFormData({ ...formData, organization: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspersky-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation *
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspersky-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kaspersky-green focus:border-transparent"
              >
                {organizationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start">
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
                className="mt-1 h-4 w-4 text-kaspersky-green focus:ring-kaspersky-green border-gray-300 rounded"
              />
              <label htmlFor="consent" className="ml-2 text-sm text-gray-600">
                I consent to future communication from Kaspersky *
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-kaspersky-green text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "SUBMIT"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
