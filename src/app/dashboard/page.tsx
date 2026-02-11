"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Job, JobStatus } from "@/lib/domain/types";

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardPage() {
  const jobs = useLiveQuery(() => db.jobs.toArray()) ?? [];

  const today = getTodayStr();

  // KPIs
  const total = jobs.length;
  const toApply = jobs.filter(j => j.status === JobStatus.ToApply).length;
  const applied = jobs.filter(j => j.status === JobStatus.Applied).length;
  const interview = jobs.filter(j => j.status === JobStatus.Interview).length;

  // Due / Upcoming
  const activeJobs = jobs.filter(j => j.status !== JobStatus.Rejected && j.status !== JobStatus.Offer);
  const overdue = activeJobs.filter(
    (j) => j.nextFollowUpDate && j.nextFollowUpDate < today
  );
  
  const dueToday = activeJobs.filter(
    (j) => j.nextFollowUpDate === today
  );

  return (
    <main className="mx-auto max-w-2xl p-4 space-y-8">
      
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="opacity-70">Welcome back! Here is your status.</p>
      </header>

      {/* KPI Grid */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="To Apply" value={toApply} />
        <KpiCard label="Applied" value={applied} />
        <KpiCard label="Interviews" value={interview} />
        <KpiCard label="Total Jobs" value={total} />
      </section>

      {/* Action Required Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Action Required</h2>
        
        {overdue.length === 0 && dueToday.length === 0 && (
            <div className="rounded-xl border border-dashed p-6 text-center opacity-60">
                🎉 All caught up! No follow-ups due today.
            </div>
        )}

        {overdue.length > 0 && (
            <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-red-600 tracking-wider">Overdue</h3>
                {overdue.map(j => (
                    <JobTaskCard key={j.id} job={j} type="overdue" />
                ))}
            </div>
        )}

        {dueToday.length > 0 && (
            <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase opacity-60 tracking-wider">Due Today</h3>
                {dueToday.map(j => (
                    <JobTaskCard key={j.id} job={j} type="today" />
                ))}
            </div>
        )}
      </section>

      {/* Navigation Shortcuts */}
      <section className="grid grid-cols-2 gap-4">
        <Link href="/jobs/new" className="flex flex-col items-center justify-center rounded-xl bg-black p-6 text-white dark:bg-white dark:text-black">
            <span className="text-2xl mb-2">+</span>
            <span className="font-medium">New Job</span>
        </Link>
        <Link href="/jobs" className="flex flex-col items-center justify-center rounded-xl border p-6 hover:bg-gray-50 dark:hover:bg-gray-900">
            <span className="text-2xl mb-2">📋</span>
            <span className="font-medium">View List</span>
        </Link>
      </section>
    </main>
  );
}

function KpiCard({ label, value }: { label: string, value: number }) {
    return (
        <div className="rounded-xl border p-3 text-center bg-gray-50 dark:bg-gray-900">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs opacity-60 uppercase tracking-wide">{label}</div>
        </div>
    );
}

function JobTaskCard({ job, type }: { job: Job, type: 'overdue' | 'today' }) {
    return (
        <Link href={`/jobs/${job.id}`} className={`block rounded-xl border p-4 ${type === 'overdue' ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}>
            <div className="flex justify-between items-center">
                <div>
                    <div className="font-semibold">{job.company}</div>
                    <div className="text-sm opacity-70">{job.role}</div>
                </div>
                <div className="text-right">
                   <div className="text-xs rounded px-2 py-1 bg-white/50 dark:bg-black/50 border font-medium">
                     {job.status}
                   </div>
                </div>
            </div>
            <div className="mt-2 text-xs flex items-center gap-1 opacity-70">
                <span>🕒 Follow-up: {job.nextFollowUpDate}</span>
            </div>
        </Link>
    )
}
