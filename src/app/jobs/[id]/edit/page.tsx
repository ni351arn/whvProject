"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Job, JobStatus } from "@/lib/domain/types";

function isoNow() {
  return new Date().toISOString();
}

export default function EditJobPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);

  // Form state
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<JobStatus>(JobStatus.ToApply);
  const [nextFollowUpDate, setNextFollowUpDate] = useState<string>("");
  const [tags, setTags] = useState<string>(""); 
  const [notes, setNotes] = useState("");

  useEffect(() => {
    db.jobs.get(id).then((j) => {
      if (j) {
        setJob(j);
        setCompany(j.company);
        setRole(j.role);
        setLocation(j.location);
        setStatus(j.status);
        setNextFollowUpDate(j.nextFollowUpDate || "");
        setTags(j.tags ? j.tags.join(", ") : "");
        setNotes(j.notes || "");
      }
      setLoading(false);
    });
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!job) return;

    const now = isoNow();
    const updates: Partial<Job> = {
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
      updatedAt: now,
    };

    if (!updates.company || !updates.role || !updates.location) {
      alert("Please fill company, role and location.");
      return;
    }

    await db.jobs.update(id, updates);
    router.push(`/jobs/${id}`);
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!job) return <div className="p-8">Job not found.</div>;

  return (
    <main className="mx-auto max-w-3xl p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Edit Job</h1>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Company *</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Role *</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Location *</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className="w-full rounded-xl border px-3 py-2"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl bg-black px-4 py-2 text-sm text-white"
          >
            Save Changes
          </button>
          <Link
            href={`/jobs/${id}`}
            className="rounded-xl border px-4 py-2 text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
