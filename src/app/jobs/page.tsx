"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import { seedDemoJobs } from "@/lib/db/demo";
import { Job, JobStatus } from "@/lib/domain/types";

function statusLabel(s: JobStatus) {
  switch (s) {
    case JobStatus.ToApply:
      return "To apply";
    case JobStatus.Applied:
      return "Applied";
    case JobStatus.FollowUp:
      return "Follow-up";
    case JobStatus.Interview:
      return "Interview";
    case JobStatus.Offer:
      return "Offer";
    case JobStatus.Rejected:
      return "Rejected";
    default:
      return "Unknown";
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<JobStatus | "ALL">("ALL");

  useEffect(() => {
    db.jobs.toArray().then(setJobs);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return jobs
      .filter((j) => (status === "ALL" ? true : j.status === status))
      .filter((j) => {
        if (!query) return true;

        return (
          j.company.toLowerCase().includes(query) ||
          j.role.toLowerCase().includes(query) ||
          j.location.toLowerCase().includes(query) ||
          (j.tags ?? []).join(" ").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  }, [jobs, q, status]);

  return (
    <main className="mx-auto max-w-3xl p-4">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Jobs</h1>
          <p className="text-sm opacity-70">
            Your personal application tracker (offline).
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-xl border px-4 py-2 text-sm"
            onClick={async () => {
              await seedDemoJobs();
              setJobs(await db.jobs.toArray());
            }}
          >
            Add demo
          </button>

          <a
            className="rounded-xl bg-black px-4 py-2 text-sm text-white"
            href="/jobs/new"
          >
            + New
          </a>
        </div>
      </header>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <input
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Search company, role, location, tags…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="w-full rounded-xl border px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as JobStatus | "ALL")}
        >
          <option value="ALL">All statuses</option>
          {Object.values(JobStatus).map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>

        <button
          className="w-full rounded-xl border px-3 py-2"
          onClick={async () => setJobs(await db.jobs.toArray())}
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border p-4 text-sm opacity-70">
            No jobs yet. Click “New” to add your first application.
          </div>
        ) : (
          filtered.map((j) => (
            <a
              key={j.id}
              href={`/jobs/${j.id}`}
              className="block rounded-xl border p-4 hover:bg-black/5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{j.company}</div>
                  <div className="truncate text-sm opacity-70">
                    {j.role} · {j.location}
                  </div>
                </div>

                <div className="shrink-0 rounded-full border px-3 py-1 text-xs">
                  {statusLabel(j.status)}
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </main>
  );
}
