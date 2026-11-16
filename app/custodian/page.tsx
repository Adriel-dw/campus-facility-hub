
"use client";

import { useState } from "react";

type Ticket = {
  id: number;
  event: string;
  facility: string;
  date: string;
  time: string;
  equipment: string[];
  status: "Pending" | "Preparing" | "Ready";
};

const initialTickets: Ticket[] = [
  {
    id: 1,
    event: "Student Association Meeting",
    facility: "Main Auditorium",
    date: "2026-11-18",
    time: "09:00 AM",
    equipment: ["Projector", "PA System"],
    status: "Pending",
  },
  {
    id: 2,
    event: "Departmental Seminar",
    facility: "Conference Room",
    date: "2026-11-18",
    time: "01:00 PM",
    equipment: ["Projector"],
    status: "Preparing",
  },
  {
    id: 3,
    event: "Inter-departmental Sports",
    facility: "University Sports Field",
    date: "2026-11-19",
    time: "03:00 PM",
    equipment: ["Goalposts"],
    status: "Ready",
  },
];

export default function CustodianPage() {
  const [tickets, setTickets] = useState(initialTickets);
  const [maintenance, setMaintenance] = useState([
    { id: 1, name: "Main Auditorium", unavailable: false },
    { id: 2, name: "Conference Room", unavailable: false },
    { id: 3, name: "University Sports Field", unavailable: false },
    { id: 4, name: "Science Lecture Hall", unavailable: true },
  ]);
  const [message, setMessage] = useState("");

  function updateTicket(id: number, status: Ticket["status"]) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id ? { ...ticket, status } : ticket
      )
    );
    setMessage(`Ticket #${id} marked as ${status}.`);
  }

  function toggleMaintenance(id: number) {
    setMaintenance((current) =>
      current.map((facility) =>
        facility.id === id
          ? { ...facility, unavailable: !facility.unavailable }
          : facility
      )
    );
    setMessage("Facility maintenance status updated locally.");
  }

  const readyCount = tickets.filter(
    (ticket) => ticket.status === "Ready"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-950 px-6 py-5 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-300">
              CAMPUS FACILITY HUB
            </p>
            <h1 className="mt-1 text-2xl font-bold">
              Custodian Operations
            </h1>
          </div>
          <a href="/" className="text-sm text-slate-300 hover:text-white">
            Back to Home
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Daily Operations
          </h2>
          <p className="mt-2 text-slate-500">
            Manage equipment preparation and facility availability.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            {message}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Total preparation tickets</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {tickets.length}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Ready for collection</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {readyCount}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Unavailable facilities</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {maintenance.filter((item) => item.unavailable).length}
            </p>
          </div>
        </div>

        <div className="mb-10 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">
              Equipment preparation tickets
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Prepare equipment requested for approved campus events.
            </p>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <article
                key={ticket.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-blue-700">
                      TICKET #{ticket.id}
                    </p>
                    <h4 className="mt-1 font-bold text-slate-900">
                      {ticket.event}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500">
                      {ticket.facility}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      ticket.status === "Ready"
                        ? "bg-green-100 text-green-700"
                        : ticket.status === "Preparing"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <p className="text-slate-600">
                    <strong>Date:</strong> {ticket.date}
                  </p>
                  <p className="text-slate-600">
                    <strong>Time:</strong> {ticket.time}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500">
                    REQUIRED EQUIPMENT
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ticket.equipment.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">
                  {ticket.status === "Pending" && (
                    <button
                      onClick={() => updateTicket(ticket.id, "Preparing")}
                      className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Start preparation
                    </button>
                  )}

                  {ticket.status === "Preparing" && (
                    <button
                      onClick={() => updateTicket(ticket.id, "Ready")}
                      className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Mark as ready
                    </button>
                  )}

                  {ticket.status === "Ready" && (
                    <p className="text-sm font-semibold text-green-700">
                      ✓ Equipment preparation completed
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">
            Facility maintenance controls
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Mark facilities unavailable when maintenance is required.
          </p>

          <div className="mt-6 space-y-3">
            {maintenance.map((facility) => (
              <div
                key={facility.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {facility.name}
                  </p>
                  <p
                    className={`mt-1 text-xs font-medium ${
                      facility.unavailable
                        ? "text-red-600"
                        : "text-green-700"
                    }`}
                  >
                    {facility.unavailable
                      ? "Unavailable — maintenance"
                      : "Available"}
                  </p>
                </div>

                <button
                  onClick={() => toggleMaintenance(facility.id)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    facility.unavailable
                      ? "bg-green-700 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {facility.unavailable
                    ? "Restore facility"
                    : "Mark unavailable"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
