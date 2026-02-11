import { db } from "@/lib/db";
import { Job, JobStatus, Template } from "@/lib/domain/types";
import { generateId } from "@/lib/utils";

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

  // 1. Seed Templates (if empty)
  const templateCount = await db.templates.count();
  if (templateCount === 0) {
    const templates: Template[] = [
      {
        id: generateId(),
        title: "Initial Application (Email)",
        channel: "EMAIL",
        body: "Hi,\n\nI am writing to apply for the {{role}} position at {{company}}. I have experience in similar roles and am available to start immediately.\n\nMy phone number is: 04XX XXX XXX.\n\nBest,\n{{name}}",
        createdAt: now,
      },
      {
        id: generateId(),
        title: "Follow Up (WhatsApp)",
        channel: "WHATSAPP",
        body: "Hi {{name}}, just checking in regarding my application for the {{role}} role at {{company}}. I'm still very interested! Thanks.",
        createdAt: now,
      },
      {
        id: generateId(),
        title: "Availability Update",
        channel: "EMAIL",
        body: "Hi {{name}},\n\nJust wanted to let you know that I am now available 7 days a week for the {{role}} position.\n\nBest regards,",
        createdAt: now,
      }
    ];
    await db.templates.bulkAdd(templates);
  }

  // 2. Seed Jobs
  const demo: Job[] = [
    {
      id: generateId(),
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
      id: generateId(),
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
      id: generateId(),
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
      id: generateId(),
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
      id: generateId(),
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
  alert("Added demo jobs & templates!");
}
