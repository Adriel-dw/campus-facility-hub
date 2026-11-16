
"use client";

import { useState } from "react";

type BookingModalProps = {
  facilityName?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  onClose: () => void;
};

const equipmentOptions = [
  { id: "PROJECTOR", label: "Projector" },
  { id: "PA_SYSTEM", label: "PA System" },
  { id: "STAGE_LIGHTING", label: "Stage Lighting" },
  { id: "GOALPOSTS", label: "Goalposts" },
];

export default function BookingModal({
  facilityName = "Main Campus Facility",
  startTime = "",
  endTime = "",
  capacity = 500,
  onClose,
}: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [eventName, setEventName] = useState("");
  const [attendees, setAttendees] = useState("");
  const [description, setDescription] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function toggleEquipment(id: string) {
    setEquipment((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  const attendeeCount = Number(attendees);
  const validAttendees =
    attendees !== "" &&
    Number.isInteger(attendeeCount) &&
    attendeeCount > 0 &&
    attendeeCount <= capacity;

  async function submitBooking() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facility_name: facilityName,
          start_time: startTime,
          end_time: endTime,
          event_name: eventName,
          attendee_count: attendeeCount,
          description,
          equipment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking submission failed.");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <p className="text-sm font-medium text-blue-700">
              CAMPUS FACILITY HUB
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Facility Reservation
            </h2>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-500">
            ×
          </button>
        </div>

        {!success && (
          <div className="flex justify-between gap-2 px-6 pt-6">
            {["Slot", "Event", "Equipment", "Confirm"].map((label, index) => (
              <div key={label} className="flex-1">
                <div
                  className={`h-2 rounded-full ${
                    step >= index + 1 ? "bg-blue-700" : "bg-slate-200"
                  }`}
                />
                <p className="mt-2 text-xs text-slate-500">
                  {index + 1}. {label}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="p-6">
          {success ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
                ✓
              </div>
              <h3 className="mt-5 text-2xl font-bold text-slate-900">
                Booking submitted!
              </h3>
              <p className="mt-2 text-slate-500">
                Your reservation request has been received.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    Review your selected slot
                  </h3>
                  <div className="rounded-xl bg-blue-50 p-5">
                    <p className="text-sm text-blue-700">Selected facility</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {facilityName}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Start time</p>
                        <p className="font-semibold text-slate-800">
                          {startTime || "To be confirmed"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">End time</p>
                        <p className="font-semibold text-slate-800">
                          {endTime || "To be confirmed"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">
                    Please review the facility and selected time before
                    continuing.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Event information
                  </h3>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Event name
                    </label>
                    <input
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="e.g. Student Association Meeting"
                      className="w-full rounded-lg border border-slate-300 p-3 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Expected attendees
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={capacity}
                      value={attendees}
                      onChange={(e) => setAttendees(e.target.value)}
                      placeholder={`Maximum capacity: ${capacity}`}
                      className="w-full rounded-lg border border-slate-300 p-3 text-slate-900"
                    />
                    {attendees !== "" && !validAttendees && (
                      <p className="mt-1 text-sm text-red-600">
                        Enter a whole number between 1 and {capacity}.
                      </p>
                    )}
                    {validAttendees && (
                      <p className="mt-1 text-sm text-green-700">
                        Capacity check passed.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Event description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Briefly describe your event..."
                      className="w-full rounded-lg border border-slate-300 p-3 text-slate-900"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Equipment requirements
                  </h3>
                  <p className="text-sm text-slate-500">
                    Select any equipment you need for your event.
                  </p>
                  {equipmentOptions.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={equipment.includes(item.id)}
                        onChange={() => toggleEquipment(item.id)}
                        className="h-4 w-4 accent-blue-700"
                      />
                      <span className="font-medium text-slate-800">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    Review and confirm
                  </h3>
                  <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                    <p><strong>Facility:</strong> {facilityName}</p>
                    <p><strong>Event:</strong> {eventName}</p>
                    <p><strong>Attendees:</strong> {attendees}</p>
                    <p>
                      <strong>Equipment:</strong>{" "}
                      {equipment.length
                        ? equipment.join(", ")
                        : "None selected"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    Your request is subject to facility availability,
                    university regulations, booking quotas and administrative
                    approval where required.
                  </div>

                  <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      className="mt-1 accent-blue-700"
                    />
                    I agree to follow the university facility reservation
                    policies and regulations.
                  </label>
                </div>
              )}

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="mt-8 flex justify-between border-t pt-5">
                <button
                  onClick={() => step === 1 ? onClose() : setStep(step - 1)}
                  className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700"
                >
                  {step === 1 ? "Cancel" : "Back"}
                </button>

                {step < 4 ? (
                  <button
                    disabled={
                      (step === 2 && (!eventName.trim() || !validAttendees))
                    }
                    onClick={() => setStep(step + 1)}
                    className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-40"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    disabled={!accepted || loading}
                    onClick={submitBooking}
                    className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-40"
                  >
                    {loading ? "Submitting..." : "Submit booking"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
