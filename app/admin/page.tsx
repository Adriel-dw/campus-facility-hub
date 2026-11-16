
"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  event_name: string;
  facility_name: string;
  start_time: string;
  end_time: string;
  attendee_count: number;
  status: string;
};

const tabs = ["Overview", "Approvals", "Facilities"];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadBookings() {
    try {
      const response = await fetch("/api/bookings");
      if (!response.ok) throw new Error("Unable to load bookings.");

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch {
      setMessage("Could not load booking requests. Check the backend connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Action failed.");

      setMessage(`Booking ${status.toLowerCase()} successfully.`);
      await loadBookings();
    } catch {
      setMessage("The action could not be completed. Check the backend API.");
    } finally {
      setBusyId("");
    }
  }

  const pending = bookings.filter(
    (booking) => booking.status.toUpperCase() === "PENDING"
  );

  const approved = bookings.filter(
    (booking) => booking.status.toUpperCase() === "APPROVED"
  );

  const rejected = bookings.filter(
    (booking) => booking.status.toUpperCase() === "REJECTED"
  );

  function formatDate(value: string) {
    return value ? new Date(value).toLocaleString() : "Not specified";
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <aside className="fixed hidden h-screen w-64 flex-col bg-slate-950 p-6 text-white md:flex">
        <div>
          <p className="text-xs font-bold tracking-widest text-blue-300">
            CAMPUS FACILITY HUB
          </p>
          <h1 className="mt-2 text-2xl font-bold">Admin Console</h1>
        </div>

        <nav className="mt-12 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium ${
                activeTab === tab
                  ? "bg-blue-700 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {tab === "Overview" && "▦ "}
              {tab === "Approvals" && "✓ "}
              {tab === "Facilities" && "▣ "}
              {tab}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <a href="/" className="text-sm text-slate-300 hover:text-white">
            ← Back to home
          </a>
        </div>
      </aside>

      <section className="md:ml-64">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-6 py-5">
          <div>
            <p className="text-sm text-slate-500">Administration</p>
            <h2 className="text-xl font-bold text-slate-900">
              {activeTab}
            </h2>
          </div>
          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Admin
          </span>
        </header>

        <div className="flex gap-2 overflow-x-auto border-b bg-white p-3 md:hidden">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm ${
                activeTab === tab
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {message && (
            <div className="mb-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
              {message}
            </div>
          )}

          {activeTab === "Overview" && (
            <>
              <div className="mb-7">
                <h3 className="text-2xl font-bold text-slate-900">
                  Dashboard overview
                </h3>
                <p className="mt-1 text-slate-500">
                  Monitor campus facility reservations and operations.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Total bookings", value: bookings.length },
                  { label: "Pending approval", value: pending.length },
                  { label: "Approved", value: approved.length },
                  { label: "Rejected", value: rejected.length },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border bg-white p-5 shadow-sm"
                  >
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {loading ? "..." : item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl border bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    Priority approval queue
                  </h3>
                  <button
                    onClick={() => setActiveTab("Approvals")}
                    className="text-sm font-semibold text-blue-700"
                  >
                    View all →
                  </button>
                </div>

                {loading ? (
                  <p className="mt-5 text-slate-500">Loading requests...</p>
                ) : pending.length === 0 ? (
                  <p className="mt-5 text-sm text-slate-500">
                    No pending requests at the moment.
                  </p>
                ) : (
                  <div className="mt-5 space-y-3">
                    {pending.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {booking.event_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {booking.facility_name}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "Approvals" && (
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Reservation approvals
              </h3>
              <p className="mt-1 text-slate-500">
                Review requests and take administrative action.
              </p>

              {loading ? (
                <p className="mt-6 text-slate-500">Loading requests...</p>
              ) : pending.length === 0 ? (
                <div className="mt-6 rounded-xl border bg-white p-10 text-center text-slate-500">
                  No pending reservations to review.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {pending.map((booking) => (
                    <article
                      key={booking.id}
                      className="rounded-xl border bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">
                            {booking.event_name}
                          </h4>
                          <p className="mt-1 text-sm text-slate-500">
                            {booking.facility_name}
                          </p>
                        </div>
                        <span className="h-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                          Pending review
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
                          <p className="text-slate-400">Attendees</p>
                          <p className="mt-1 font-medium text-slate-800">
                            {booking.attendee_count}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3 border-t pt-5">
                        <button
                          onClick={() => updateStatus(booking.id, "APPROVED")}
                          disabled={busyId === booking.id}
                          className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, "REJECTED")}
                          disabled={busyId === booking.id}
                          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() =>
                            updateStatus(booking.id, "ACADEMIC_OVERRIDE")
                          }
                          disabled={busyId === booking.id}
                          className="rounded-lg border border-blue-300 px-5 py-2.5 text-sm font-semibold text-blue-700 disabled:opacity-50"
                        >
                          Academic Override
                        </button>
                        <button
                          onClick={() =>
                            updateStatus(booking.id, "AUTO_RELOCATE")
                          }
                          disabled={busyId === booking.id}
                          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
                        >
                          Auto-Relocate
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Facilities" && (
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Facility operations
              </h3>
              <p className="mt-1 text-slate-500">
                Facility maintenance and operational controls.
              </p>
              <div className="mt-6 rounded-xl border bg-white p-6">
                <h4 className="font-bold text-slate-900">
                  Maintenance controls
                </h4>
                <p className="mt-2 text-sm text-slate-500">
                  Facility maintenance controls will connect to the facilities
                  API when the operations backend is available.
                </p>
                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  Maintenance actions are not connected yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
