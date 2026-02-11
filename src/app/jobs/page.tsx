"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { seedDemoJobs } from "@/lib/db/demo";
import { JobStatus } from "@/lib/domain/types";
import { Search, Filter, X } from "lucide-react";

function statusLabel(s: JobStatus) {
  switch (s) {
    case JobStatus.ToApply: return "To apply";
    case JobStatus.Applied: return "Applied";
    case JobStatus.FollowUp: return "Follow-up";
    case JobStatus.Interview: return "Interview";
    case JobStatus.Offer: return "Offer";
    case JobStatus.Rejected: return "Rejected";
    default: return s;
  }
}

function isoToday() {
  return new Date().toISOString().split("T")[0];
}

type QuickFilter = "ALL" | "OVERDUE" | "UPCOMING" | "NO_CONTACT";

export default function JobsPage() {
  const jobs = useLiveQuery(() => db.jobs.toArray()) ?? [];
  
  // -- State --
  const [showFilters, setShowFilters] = useState(false);
  
  // Persistable filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<JobStatus | "ALL">("ALL");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("ALL");

  // Load filters from localStorage on mount (optional polish)
  useEffect(() => {
    const saved = localStorage.getItem("applyflow_filters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.status) setStatus(parsed.status);
        if (parsed.quickFilter) setQuickFilter(parsed.quickFilter);
      } catch (e) { /* ignore */ }
    }
  }, []);

  // Save filters on change
  useEffect(() => {
    localStorage.setItem("applyflow_filters", JSON.stringify({ status, quickFilter }));
  }, [status, quickFilter]);


  // -- Derived Data --
  const availableTags = useMemo(() => {
     const tags = new Set<string>();
     jobs.forEach(j => j.tags?.forEach(t => tags.add(t)));
     return Array.from(tags).sort();
  }, [jobs]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const today = isoToday();

    return jobs
      .filter((j) => {
        // 1. Status Filter
        if (status !== "ALL" && j.status !== status) return false;
        
        // 2. Quick Filter
        if (quickFilter === "OVERDUE") {
            if (!j.nextFollowUpDate || j.nextFollowUpDate >= today) return false;
        } else if (quickFilter === "UPCOMING") {
            if (!j.nextFollowUpDate || j.nextFollowUpDate < today) return false;
        } else if (quickFilter === "NO_CONTACT") {
            // jobs table doesn't have contacts embedded. We need another strategy or just ignore for MVP.
            // Actually let's pivot "NO_CONTACT" to "Has Unset Followup" for simplicity on this view
            if (j.nextFollowUpDate) return false;
        }

        // 3. Tags Filter (AND logic: must have ALL selected tags)
        if (selectedTags.length > 0) {
            const jobTags = j.tags ?? [];
            const hasAll = selectedTags.every(t => jobTags.includes(t));
            if (!hasAll) return false;
        }

        // 4. Text Search
        if (!query) return true;
        return (
          j.company.toLowerCase().includes(query) ||
          j.role.toLowerCase().includes(query) ||
          j.location.toLowerCase().includes(query) ||
          (j.tags ?? []).join(" ").toLowerCase().includes(query)
        );
      })
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  }, [jobs, q, status, quickFilter, selectedTags]);

  // -- Handlers --
  function toggleTag(tag: string) {
    setSelectedTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  function clearFilters() {
      setQ("");
      setStatus("ALL");
      setSelectedTags([]);
      setQuickFilter("ALL");
  }

  const activeFilterCount = (status !== "ALL" ? 1 : 0) + (quickFilter !== "ALL" ? 1 : 0) + selectedTags.length + (q ? 1 : 0);

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-4 pb-20">
      
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-sm opacity-60">{filtered.length} applications found</p>
        </div>
        <div className="flex gap-2">
            <button
                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={async () => await seedDemoJobs()}
            >
                Demo
            </button>
            <Link
                href="/jobs/new"
                className="flex items-center gap-1 rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90 dark:bg-white dark:text-black"
            >
                + New
            </Link>
        </div>
      </header>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 opacity-40"/>
            <input
                className="w-full rounded-xl border pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-black transition-colors"
                placeholder="Search company, role..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
            />
             {q && (
                <button onClick={() => setQ("")} className="absolute right-3 top-2.5 opacity-40 hover:opacity-100">
                    <X className="h-4 w-4"/>
                </button>
             )}
        </div>
        <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-xl border px-3 flex items-center gap-2 ${showFilters || activeFilterCount > 0 ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'bg-white dark:bg-black'}`}
        >
            <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded Filters Area */}
      {showFilters && (
          <div className="rounded-xl border p-4 space-y-4 bg-gray-50 dark:bg-gray-900 animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold opacity-70">Filters</h3>
                <button onClick={clearFilters} className="text-xs underline opacity-60 hover:opacity-100">Clear all</button>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
                 <div>
                    <label className="text-xs font-medium opacity-60 mb-1 block">Status</label>
                    <select
                        className="w-full rounded-lg border px-2 py-1.5 text-sm bg-white dark:bg-black"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as JobStatus | "ALL")}
                    >
                    <option value="ALL">All statuses</option>
                    {Object.values(JobStatus).map((s) => (
                        <option key={s} value={s}>{statusLabel(s)}</option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-medium opacity-60 mb-1 block">Urgency</label>
                    <div className="flex rounded-lg border bg-white p-1 dark:bg-black">
                        {[
                            { id: "ALL", label: "All" },
                            { id: "OVERDUE", label: "Overdue" },
                            { id: "UPCOMING", label: "Upcoming" }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setQuickFilter(opt.id as QuickFilter)}
                                className={`flex-1 rounded py-1 text-xs font-medium transition-all ${quickFilter === opt.id ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {availableTags.length > 0 && (
                <div>
                     <label className="text-xs font-medium opacity-60 mb-2 block">Tags</label>
                     <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`rounded-full border px-3 py-1 text-xs transition-colors ${selectedTags.includes(tag) ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-800'}`}
                            >
                                {tag}
                            </button>
                        ))}
                     </div>
                </div>
            )}
          </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center opacity-60">
            <p>No jobs found matching your filters.</p>
            <button onClick={clearFilters} className="mt-2 text-sm underline text-blue-500">Reset filters</button>
          </div>
        ) : (
          filtered.map((j) => (
            <Link
              key={j.id}
              href={`/jobs/${j.id}`}
              className="block group relative rounded-2xl border bg-white p-4 transition-all hover:border-black dark:bg-black dark:hover:border-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold truncate text-lg pr-8">{j.company}</h3>
                  <div className="text-sm opacity-70 mb-2">
                    {j.role} · {j.location}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {j.tags?.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">#{t}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                   <Badge status={j.status} />
                   {j.nextFollowUpDate && (
                       <span className={`text-xs font-medium ${j.nextFollowUpDate < isoToday() ? 'text-red-600' : 'opacity-40'}`}>
                           {j.nextFollowUpDate < isoToday() ? 'Overdue!' : j.nextFollowUpDate}
                       </span>
                   )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

    </main>
  );
}

function Badge({ status }: { status: JobStatus }) {
    const colors = {
        [JobStatus.ToApply]: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        [JobStatus.Applied]: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        [JobStatus.FollowUp]: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
        [JobStatus.Interview]: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
        [JobStatus.Offer]: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        [JobStatus.Rejected]: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    };

    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${colors[status]}`}>
            {statusLabel(status)}
        </span>
    );
}
