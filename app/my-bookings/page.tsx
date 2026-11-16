
"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  facility_name: string;
  event_name: string;
  start_time: string;
  end_time: string;
  status: string;
  attendee_count: number;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadBookings() {
    try {
      const response = await fetch("/api/bookings/my-bookings");
      if (!response.ok) throw new Error("Could not load bookings.");

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch {
      setMessage("Unable to load reservations. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function cancelBooking(id: string) {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    setBusyId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Cancellation failed.");

      setMessage("Reservation cancelled successfully.");
      await loadBookings();
    } catch {
      setMessage("Could not cancel this reservation.");
    } finally {
      setBusyId("");
    }
  }

  async function checkIn(id: string) {
    setBusyId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/bookings/${id}/check-in`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Check-in failed.");

      setMessage("Check-in successful!");
      await loadBookings();
    } catch {
      setMessage("Check-in failed. Please contact the facility custodian.");
    } finally {
      setBusyId("");
    }
  }

  function formatDate(value: string) {
    if (!value) return "Not specified";
    return new Date(value).toLocaleString();
  }

  const activeBookings = bookings.filter(
    (booking) =>
      !["CANCELLED", "REJECTED", "COMPLETED"].includes(
        booking.status.toUpperCase()
      )
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-slate-950 px-6 py-5 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-blue-300">
              CAMPUS FACILITY HUB
            </p>
            <h1 className="mt-1 text-xl font-bold">My Bookings</h1>
          </div>
          <a href="/" className="text-sm text-slate-300 hover:text-white">
            Back to Home
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Your Reservations
          </h2>
          <p className="mt-2 text-slate-500">
            View your facility reservations, manage bookings and check in.
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Total reservations</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {bookings.length}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Active reservations</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">
              {activeBookings.length}
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-slate-500">
            Loading your reservations...
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center">
            <div className="text-4xl">📅</div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">
              No reservations yet
            </h3>
            <p className="mt-2 text-slate-500">
              Your facility bookings will appear here.
            </p>
            <a
              href="/"
              className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
            >
              Explore facilities
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const status = booking.status.toUpperCase();
              const canCancel = ["PENDING", "APPROVED"].includes(status);
              const canCheckIn = status === "APPROVED";

              return (
                <article
                  key={booking.id}
                  className="rounded-xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {booking.event_name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {booking.facility_name}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-slate-400">Start</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {formatDate(booking.start_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">End</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {formatDate(booking.end_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Expected attendees</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {booking.attendee_count}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
                    {canCheckIn && (
                      <button
                        onClick={() => checkIn(booking.id)}
                        disabled={busyId === booking.id}
                        className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {busyId === booking.id ? "Please wait..." : "Check in"}
                      </button>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        disabled={busyId === booking.id}
                        className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50"
                      >
                        Cancel reservation
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
