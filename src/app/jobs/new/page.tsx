"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { Job, JobStatus } from "@/lib/domain/types";

function isoNow() {
  return new Date().toISOString();
}

export default function NewJobPage() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<JobStatus>(JobStatus.ToApply);
  const [nextFollowUpDate, setNextFollowUpDate] = useState<string>("");
  const [tags, setTags] = useState<string>(""); // comma separated
  const [notes, setNotes] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const now = isoNow();
    const job: Job = {
      id: crypto.randomUUID(),
      company: company.trim(),
      role: role.trim(),
      location: location.trim(),
      status,
      nextFollowUpDate: nextFollowUpDate || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    if (!job.company || !job.role || !job.location) {
      alert("Please fill company, role and location.");
      return;
    }

    await db.jobs.add(job);
    window.location.href = "/jobs";
  }

  return (
    <main className="mx-auto max-w-3xl p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">New job</h1>
        <p className="text-sm opacity-70">Add an application in 30 seconds.</p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Company *</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Byron Hostel"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Role *</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Cleaner / Reception"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Location *</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Byron Bay, NSW"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full rounded-xl border px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
            >
              {Object.values(JobStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="text-xs opacity-60">
              (We’ll improve labels later — for now it’s fine.)
            </p>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Next follow-up</label>
            <input
              type="date"
              className="w-full rounded-xl border px-3 py-2"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Tags (comma-separated)</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. hostel, gardening, cash"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className="w-full rounded-xl border px-3 py-2"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything important…"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl bg-black px-4 py-2 text-sm text-white"
          >
            Save
          </button>
          <a
            href="/jobs"
            className="rounded-xl border px-4 py-2 text-sm"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
