"use client";

import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { useEffect, useState } from "react";

interface DemoBookingProps {
  user: Profile | null;
}

interface DemoSession {
  id: string;
  product_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
}

interface UserBooking {
  id: string;
  user_id: string;
  product_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export default function DemoBooking({ user }: DemoBookingProps) {
  const [sessions, setSessions] = useState<DemoSession[]>([]);
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const supabase = createClient();

  const products = [
    "Threat Intelligence",
    "XDR Expert",
    "SIEM",
    "Technology Alliance",
  ];

  // Generate demo sessions dynamically based on requirements
  const generateSessions = () => {
    const generatedSessions: DemoSession[] = [];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dates = [today, tomorrow]; // 2 days

    // Time slots: 11:00-11:30, 12:00-12:30, 15:00-15:30, 16:00-16:30
    // Excluding lunch break 1:00pm-3:00pm
    const timeSlots = [
      { start: "11:00", end: "11:30" },
      { start: "12:00", end: "12:30" },
      { start: "15:00", end: "15:30" },
      { start: "16:00", end: "16:30" },
    ];

    dates.forEach((date) => {
      products.forEach((product) => {
        timeSlots.forEach((slot) => {
          generatedSessions.push({
            id: `${product}-${date.toISOString().split("T")[0]}-${slot.start}`,
            product_name: product,
            session_date: date.toISOString().split("T")[0],
            start_time: slot.start,
            end_time: slot.end,
          });
        });
      });
    });

    return generatedSessions;
  };

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Generate sessions dynamically
    const generatedSessions = generateSessions();
    setSessions(generatedSessions);

    // Load user's existing bookings
    const { data: bookings } = await supabase
      .from("demo_bookings")
      .select("*")
      .eq("user_id", user.id);

    if (bookings) {
      setUserBookings(bookings);
    }

    // Count bookings per session across all users
    const { data: allBookings } = await supabase
      .from("demo_bookings")
      .select("product_name, session_date, start_time");

    if (allBookings) {
      const counts: Record<string, number> = {};
      allBookings.forEach((booking) => {
        const key = `${booking.product_name}-${booking.session_date}-${booking.start_time}`;
        counts[key] = (counts[key] || 0) + 1;
      });
      setBookingCounts(counts);
    }

    setLoading(false);
  };

  const canBookProduct = (productName: string) => {
    return !userBookings.some((b) => b.product_name === productName);
  };

  const getTotalBookings = () => {
    return userBookings.length;
  };

  const getSessionKey = (session: DemoSession) => {
    return `${session.product_name}-${session.session_date}-${session.start_time}`;
  };

  const getBookingCount = (session: DemoSession) => {
    const key = getSessionKey(session);
    return bookingCounts[key] || 0;
  };

  const isSessionFull = (session: DemoSession) => {
    const capacity = 20; // 20 people per session
    return getBookingCount(session) >= capacity;
  };

  const handleBooking = async (session: DemoSession) => {
    if (!user) return;

    if (getTotalBookings() >= 3) {
      alert("You can book a maximum of 3 product demos");
      return;
    }

    if (!canBookProduct(session.product_name)) {
      alert("You have already booked this product demo");
      return;
    }

    if (isSessionFull(session)) {
      alert("This session is fully booked");
      return;
    }

    try {
      // Create booking - only save user booking, not session
      const { error: bookingError } = await supabase
        .from("demo_bookings")
        .insert([
          {
            user_id: user.id,
            product_name: session.product_name,
            session_date: session.session_date,
            start_time: session.start_time,
            end_time: session.end_time,
          },
        ]);

      if (bookingError) throw bookingError;

      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);

      // Reload data to update booking counts
      loadData();
    } catch {
      alert("Booking failed. Please try again.");
    }
  };

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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Authentication Required
        </h3>
        <p className="text-gray-600">Please log in to book demo sessions</p>
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
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Loading Sessions
        </h3>
        <p className="text-gray-600">Preparing available demo slots...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Success Banner */}
      {bookingSuccess && (
        <div className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-bold text-lg">
              ✓ Booking successful! Win Kaspersky Surprise Goodie!
            </span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-kaspersky-600 via-kaspersky-500 to-kaspersky-700 rounded-2xl shadow-xl p-8 mb-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="demo-pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="2" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#demo-pattern)" />
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">
              Book Your Demo Slots
            </h2>
          </div>
          <p className="text-white/90 text-lg mb-4">
            🎁 Win Kaspersky Surprise Goodie by attending our product demos
          </p>

          {/* Booking Status Badge */}
          <div className="inline-block bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Booking Status</h3>
                <p className="text-white/90">
                  You have booked{" "}
                  <span className="font-bold text-white">
                    {getTotalBookings()}
                  </span>{" "}
                  out of <span className="font-bold text-white">3</span>{" "}
                  possible demos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="mt-6 pt-6 border-t-2 border-white/20">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Session Guidelines
          </h4>
          <ul className="text-sm text-white/90 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-white mt-1">•</span>
              <span>Demo sessions between 11:00am and 5:00pm</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white mt-1">•</span>
              <span>
                30 min session each with 30 mins break between sessions
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white mt-1">•</span>
              <span>2 hour lunch break from 1:00pm to 3:00pm</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white mt-1">•</span>
              <span>One person can book 3 product demos at a time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white mt-1">•</span>
              <span>
                One person can book one product demo only once across 2 days
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* User Bookings */}
      {userBookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-soft border-2 border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Your Confirmed Bookings
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg mb-1">
                      {booking.product_name}
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-kaspersky-600"
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
                        {new Date(booking.session_date).toLocaleDateString(
                          "en-US",
                          { weekday: "short", month: "short", day: "numeric" }
                        )}
                      </p>
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-kaspersky-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {booking.start_time} - {booking.end_time}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                  <svg
                    className="w-4 h-4"
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
                  Confirmed
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Sessions */}
      <div className="space-y-6">
        {products.map((product) => {
          const productSessions = sessions.filter(
            (s) => s.product_name === product
          );
          const isBooked = !canBookProduct(product);

          return (
            <div
              key={product}
              className="bg-white rounded-2xl shadow-soft border-2 border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-kaspersky-500 to-kaspersky-600 rounded-xl shadow-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {product}
                  </h3>
                </div>
                {isBooked && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
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
                    Already Booked
                  </span>
                )}
              </div>

              {productSessions.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  No sessions available
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {productSessions.map((session) => {
                    const isFull = isSessionFull(session);
                    const capacity = 20;
                    const bookedCount = getBookingCount(session);
                    const availableSlots = capacity - bookedCount;
                    const fillPercentage = (bookedCount / capacity) * 100;

                    return (
                      <div
                        key={session.id}
                        className={`p-5 border-2 rounded-xl transition-all ${
                          isFull || isBooked
                            ? "border-gray-200 bg-gray-50"
                            : "border-gray-200 hover:border-kaspersky-400 hover:shadow-md bg-white hover:-translate-y-1"
                        }`}
                      >
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <svg
                              className="w-4 h-4 text-kaspersky-600"
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
                            <p className="text-sm font-bold text-gray-900">
                              {new Date(
                                session.session_date
                              ).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-kaspersky-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p className="text-sm font-semibold text-gray-700">
                              {session.start_time} - {session.end_time}
                            </p>
                          </div>
                        </div>

                        {/* Availability Indicator */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <p
                              className={`text-xs font-bold ${
                                availableSlots > 10
                                  ? "text-green-600"
                                  : availableSlots > 5
                                  ? "text-orange-600"
                                  : availableSlots > 0
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {availableSlots > 0
                                ? `${availableSlots} slots left`
                                : "Fully Booked"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {bookedCount}/{capacity}
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                fillPercentage >= 100
                                  ? "bg-gray-400"
                                  : fillPercentage >= 75
                                  ? "bg-red-500"
                                  : fillPercentage >= 50
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${fillPercentage}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleBooking(session)}
                          disabled={
                            isFull || isBooked || getTotalBookings() >= 3
                          }
                          className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                            isFull || isBooked || getTotalBookings() >= 3
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-kaspersky-600 to-kaspersky-500 text-white hover:from-kaspersky-700 hover:to-kaspersky-600 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                          }`}
                        >
                          {isFull
                            ? "❌ Fully Booked"
                            : isBooked
                            ? "✓ Already Booked"
                            : "🕒 Book Slot"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sessions.length === 0 && (
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No Sessions Available
          </h3>
          <p className="text-gray-500">Demo sessions will be available soon</p>
        </div>
      )}
    </div>
  );
}
