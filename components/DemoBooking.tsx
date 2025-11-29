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
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to book demo sessions</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading sessions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {bookingSuccess && (
        <div className="mb-6 bg-kaspersky-green text-white px-6 py-4 rounded-lg">
          ✓ Booking successful! Win Kaspersky Surprise Goodie!
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Book Your Demo Slots
        </h2>
        <p className="text-gray-600 mb-4">
          Win Kaspersky Surprise Goodie by attending our product demos
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Booking Status:</h3>
          <p className="text-sm text-gray-700">
            You have booked {getTotalBookings()} out of 3 possible demos
          </p>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>• Demo sessions between 11:00am and 5:00pm</p>
          <p>• 30 min session each with 30 mins break between sessions</p>
          <p>• 2 hour lunch break from 1:00pm to 3:00pm</p>
          <p>• One person can book 3 product demos at a time</p>
          <p>• One person can book one product demo only once across 2 days</p>
        </div>
      </div>

      {userBookings.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Your Bookings
          </h3>
          <div className="space-y-3">
            {userBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {booking.product_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.session_date).toLocaleDateString()} at{" "}
                    {booking.start_time}
                  </p>
                </div>
                <span className="text-kaspersky-green font-medium">
                  Confirmed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {products.map((product) => {
          const productSessions = sessions.filter(
            (s) => s.product_name === product
          );
          const isBooked = !canBookProduct(product);

          return (
            <div key={product} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{product}</h3>
                {isBooked && (
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    Already Booked
                  </span>
                )}
              </div>

              {productSessions.length === 0 ? (
                <p className="text-gray-500 text-sm">No sessions available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {productSessions.map((session) => {
                    const isFull = isSessionFull(session);
                    const capacity = 20;
                    const bookedCount = getBookingCount(session);
                    const availableSlots = capacity - bookedCount;

                    return (
                      <div
                        key={session.id}
                        className={`p-4 border-2 rounded-lg ${
                          isFull || isBooked
                            ? "border-gray-200 bg-gray-50"
                            : "border-gray-200 hover:border-kaspersky-green"
                        }`}
                      >
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(session.session_date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {session.start_time} - {session.end_time}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          {availableSlots} slots available
                        </p>
                        <button
                          onClick={() => handleBooking(session)}
                          disabled={
                            isFull || isBooked || getTotalBookings() >= 3
                          }
                          className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                            isFull || isBooked || getTotalBookings() >= 3
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-kaspersky-green text-white hover:bg-emerald-700"
                          }`}
                        >
                          {isFull
                            ? "Fully Booked"
                            : isBooked
                            ? "Already Booked"
                            : "Book Slot"}
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

      {sessions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">
            No demo sessions available at the moment
          </p>
        </div>
      )}
    </div>
  );
}
