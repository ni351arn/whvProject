import { db } from "@/lib/db";
import { Job, JobStatus } from "@/lib/domain/types";

function isoNow() {
  return new Date().toISOString();
}

function isoDatePlusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function seedDemoJobs() {
  const now = isoNow();

  const demo: Job[] = [
    {
      id: crypto.randomUUID(),
      company: "Sandy Beach Gardens",
      role: "Gardener (casual)",
      location: "Sandy Beach, NSW",
      status: JobStatus.FollowUp,
      nextFollowUpDate: isoDatePlusDays(1),
      lastContactDate: isoDatePlusDays(-1),
      tags: ["gardening", "casual"],
      notes: "Texted on WhatsApp. Waiting for hours confirmation.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      company: "Byron Hostel",
      role: "Reception / Cleaner",
      location: "Byron Bay, NSW",
      status: JobStatus.Applied,
      nextFollowUpDate: isoDatePlusDays(3),
      tags: ["hostel", "accommodation"],
      notes: "Applied via email. Mention flexible start date.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      company: "Cafe Corner",
      role: "Kitchen hand",
      location: "Coffs Harbour, NSW",
      status: JobStatus.ToApply,
      nextFollowUpDate: isoDatePlusDays(0),
      tags: ["cafe", "kitchen"],
      notes: "Walk-in application recommended.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      company: "Coastal Construction",
      role: "Labourer",
      location: "Coffs Harbour, NSW",
      status: JobStatus.Interview,
      nextFollowUpDate: isoDatePlusDays(2),
      tags: ["construction"],
      notes: "Interview scheduled. Ask about PPE.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      company: "Farm Connect",
      role: "Picking / Packing",
      location: "Bundaberg, QLD",
      status: JobStatus.Rejected,
      tags: ["farm"],
      notes: "No vacancies right now. Try again in 2 weeks.",
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.jobs.bulkAdd(demo);
}
