"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { 
  JobStatus, 
  ContactChannel, 
  InteractionType
} from "@/lib/domain/types";
import { generateId, copyToClipboard } from "@/lib/utils";

function isoNow() {
  return new Date().toISOString();
}

function addDays(dateStr: string | undefined, days: number): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function JobDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const job = useLiveQuery(() => db.jobs.get(id), [id]);

  if (!job) {
    return (
      <div className="p-8 text-center">
        <p className="opacity-60">Loading or job not found...</p>
        <Link href="/jobs" className="mt-4 inline-block underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  async function updateStatus(s: JobStatus) {
    let updates: any = { status: s, updatedAt: isoNow() };
    
    // Smart Defaults for Follow-up (Phase 2)
    if (s === JobStatus.Applied) {
      if (!job?.nextFollowUpDate) updates.nextFollowUpDate = addDays(undefined, 3);
    } else if (s === JobStatus.FollowUp) {
       updates.nextFollowUpDate = addDays(undefined, 4);
    } else if (s === JobStatus.Interview) {
       updates.nextFollowUpDate = addDays(undefined, 1);
    }
    
    await db.jobs.update(id, updates);
  }

  async function setFollowUp(days: number) {
    const nextDate = addDays(undefined, days); // from today
    await db.jobs.update(id, { nextFollowUpDate: nextDate, updatedAt: isoNow() });
  }

  async function deleteJob() {
    if (!confirm("Delete this job application?")) return;
    await db.jobs.delete(id);
    router.push("/jobs");
  }

  return (
    <main className="mx-auto max-w-3xl p-4">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/jobs" className="mb-2 inline-block text-sm opacity-60 hover:opacity-100">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold">{job.company}</h1>
          <p className="text-xl opacity-80">
            {job.role} · {job.location}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/jobs/${id}/edit`}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Edit
          </Link>
          <button
            onClick={deleteJob}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        
        {/* Left Column (Main) */}
        <div className="space-y-6 sm:col-span-2">
          
          {/* Status Section */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Status</h2>
            <div className="flex flex-wrap gap-2">
              {Object.values(JobStatus).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    job.status === s
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Follow Up Display */}
          <section className="space-y-2 rounded-xl border p-4">
            <div className="text-sm font-medium opacity-70">Next follow-up</div>
            <div className="text-lg">
              {job.nextFollowUpDate ? (
                <div className="flex items-center gap-2">
                  <span>{job.nextFollowUpDate}</span>
                  {job.nextFollowUpDate < isoNow().split("T")[0] && (
                     <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-900/30">Overdue</span>
                  )}
                </div>
              ) : (
                <span className="italic opacity-50">None set</span>
              )}
            </div>
          </section>

          {/* Notes */}
          <section className="space-y-2 rounded-xl border p-4">
            <div className="text-sm font-medium opacity-70">Notes</div>
            <div className="whitespace-pre-wrap">
              {job.notes || <span className="italic opacity-50">No notes</span>}
            </div>
          </section>

          {/* Tags */}
          <section className="space-y-2 rounded-xl border p-4">
            <div className="text-sm font-medium opacity-70">Tags</div>
            <div className="flex flex-wrap gap-2">
              {job.tags?.length ? (
                job.tags.map((t) => (
                  <span key={t} className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                    {t}
                  </span>
                ))
              ) : (
                <span className="italic opacity-50">No tags</span>
              )}
            </div>
          </section>

          {/* Templates Component */}
          <TemplatesSection job={job} />
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
            
            {/* Quick Actions */}
            <section className="rounded-xl border p-4 space-y-3">
                <h3 className="font-semibold text-sm opacity-70">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFollowUp(1)}
                        className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        📅 Tmrw
                    </button>
                    <button
                        onClick={() => setFollowUp(7)}
                        className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        📅 +1 week
                    </button>
                    {job.status !== JobStatus.Applied && (
                        <button
                        onClick={() => updateStatus(JobStatus.Applied)}
                        className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                        ✅ Mark Applied
                        </button>
                    )}
                </div>
            </section>

            {/* Contacts */}
            <ContactsSection jobId={id} />

            {/* Interactions */}
            <InteractionsSection jobId={id} />
        </div>
      </div>
    </main>
  );
}

// ------------------------------------------------------------------
// Subcomponents
// ------------------------------------------------------------------

function TemplatesSection({ job }: { job: any }) {
  const templates = useLiveQuery(() => db.templates.toArray()) ?? [];
  const contacts = useLiveQuery(() => db.contacts.where("jobId").equals(job.id).toArray()) ?? [];
  
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [preview, setPreview] = useState("");

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  // Auto-update preview when template or contact changes
  useMemo(() => {
    if (!selectedTemplate) {
      setPreview("");
      return;
    }
  
    let text = selectedTemplate.body;
    text = text.replace(/{{role}}/g, job.role || "");
    text = text.replace(/{{company}}/g, job.company || "");
    text = text.replace(/{{location}}/g, job.location || "");
    text = text.replace(/{{name}}/g, selectedContact?.name || "(Name)");
    
    setPreview(text);
  }, [selectedTemplate, selectedContact, job]);

  async function copyAndLog() {
    if (!selectedTemplate) return;

    try {
      const ok = await copyToClipboard(preview);
      
      // Log interaction
      await db.interactions.add({
        id: generateId(),
        jobId: job.id,
        date: isoNow().split("T")[0],
        type: selectedTemplate.channel === "WHATSAPP" ? "MSG" : "EMAIL",
        notes: `Template used: ${selectedTemplate.title}`,
        createdAt: isoNow(),
      });
      
      if (ok) {
        alert("Copied to clipboard & logged! ✅");
      } else {
        alert("Logged to history! (Clipboard blocked, please copy manually)");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing request.");
    }
  }

  if (templates.length === 0) return null;

  return (
    <section className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900 border">
      <h2 className="mb-3 text-lg font-semibold">Message Templates</h2>
      
      <div className="space-y-3">
        <div>
           <label className="text-xs font-medium opacity-70">1. Choose Template</label>
           <select 
             className="w-full rounded border p-2 text-sm bg-white dark:bg-black"
             value={selectedTemplateId}
             onChange={(e) => setSelectedTemplateId(e.target.value)}
           >
             <option value="">-- Select template --</option>
             {templates.map(t => (
               <option key={t.id} value={t.id}>{t.title}</option>
             ))}
           </select>
        </div>

        {selectedTemplate && (
            <div>
              <label className="text-xs font-medium opacity-70">2. Choose Contact (for {"{{name}}"})</label>
              <select 
                className="w-full rounded border p-2 text-sm bg-white dark:bg-black"
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
              >
                <option value="">-- No specific contact --</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.channel})</option>
                ))}
              </select>
            </div>
        )}

        {preview && (
          <div className="space-y-2">
            <div className="relative rounded border bg-white p-3 text-sm dark:bg-black">
              <pre className="whitespace-pre-wrap font-sans">{preview}</pre>
            </div>
            <button 
              onClick={copyAndLog}
              className="w-full rounded-xl bg-black py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
            >
              Copy & Log Interaction
            </button>
             {selectedTemplate?.channel === "EMAIL" && (
              <a 
                href={`mailto:${selectedContact?.handle || ""}?body=${encodeURIComponent(preview)}`}
                className="block text-center text-xs opacity-60 hover:opacity-100"
              >
                Click to open Mail app
              </a>
            )}
            {selectedTemplate?.channel === "WHATSAPP" && selectedContact?.handle && (
               <a 
                href={`https://wa.me/${selectedContact.handle.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(preview)}`}
                target="_blank"
                className="block text-center text-xs opacity-60 hover:opacity-100"
              >
                Open WhatsApp Web
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ContactsSection({ jobId }: { jobId: string }) {
  const contacts = useLiveQuery(() => db.contacts.where("jobId").equals(jobId).toArray()) ?? [];
  const [isAdding, setIsAdding] = useState(false);
  
  // Form
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<ContactChannel>("WHATSAPP");
  const [handle, setHandle] = useState("");

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    
    await db.contacts.add({
      id: generateId(),
      jobId,
      name: name.trim(),
      channel,
      handle: handle.trim(),
      createdAt: isoNow(),
    });
    setName("");
    setHandle("");
    setIsAdding(false);
  }

  async function onDelete(id: string) {
    if(confirm("Delete contact?")) await db.contacts.delete(id);
  }

  return (
    <section>
       <div className="mb-3 flex items-center justify-between">
         <h2 className="text-lg font-semibold">Contacts</h2>
         <button onClick={() => setIsAdding(!isAdding)} className="text-sm underline">
           {isAdding ? "Cancel" : "+ Add"}
         </button>
       </div>

       {isAdding && (
         <form onSubmit={onAdd} className="mb-4 space-y-2 rounded-xl border p-3 bg-gray-50 dark:bg-gray-900">
            <input 
              className="w-full rounded border px-2 py-1 text-sm mb-2" 
              placeholder="Name *" 
              value={name} onChange={e => setName(e.target.value)} 
              autoFocus
            />
            <div className="flex gap-2 mb-2">
                <select 
                className="w-1/3 rounded border px-2 py-1 text-sm"
                value={channel} onChange={e => setChannel(e.target.value as ContactChannel)}
                >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="CALL">Call</option>
                <option value="EMAIL">Email</option>
                <option value="IN_PERSON">In Person</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="OTHER">Other</option>
                </select>
                <input 
                className="w-2/3 rounded border px-2 py-1 text-sm" 
                placeholder="Handle (phone/email)" 
                value={handle} onChange={e => setHandle(e.target.value)} 
                />
            </div>
            <button className="w-full rounded bg-black py-1 text-sm text-white dark:bg-white dark:text-black">Save Contact</button>
         </form>
       )}

       <div className="space-y-2">
         {contacts.length === 0 && !isAdding && (
            <p className="text-sm opacity-50">No contacts yet.</p>
         )}
         {contacts.map(c => (
           <div key={c.id} className="group relative rounded-lg border p-3 text-sm flex justify-between items-center">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="opacity-70 text-xs">{c.channel} · {c.handle}</div>
              </div>
              <button 
                onClick={() => onDelete(c.id)}
                className="opacity-0 group-hover:opacity-50 hover:!opacity-100 text-lg px-2"
              >
                ×
              </button>
           </div>
         ))}
       </div>
    </section>
  );
}

function InteractionsSection({ jobId }: { jobId: string }) {
  // Sort interactions by date desc (newest first)
  const interactions = useLiveQuery(
    () => db.interactions.where("jobId").equals(jobId).reverse().sortBy("date")
  ) ?? [];
  
  const [isAdding, setIsAdding] = useState(false);
  
  // Form
  const [type, setType] = useState<InteractionType>("MSG");
  const [date, setDate] = useState(() => isoNow().split("T")[0]);
  const [notes, setNotes] = useState("");

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!notes && !confirm("Save without notes?")) return;
    
    await db.interactions.add({
      id: generateId(),
      jobId,
      date,
      type,
      notes: notes.trim(),
      createdAt: isoNow(),
    });
    setNotes("");
    setIsAdding(false);
  }

  async function onDelete(id: string) {
    if(confirm("Delete log?")) await db.interactions.delete(id);
  }

  return (
    <section>
       <div className="mb-3 flex items-center justify-between">
         <h2 className="text-lg font-semibold">History</h2>
         <button onClick={() => setIsAdding(!isAdding)} className="text-sm underline">
           {isAdding ? "Cancel" : "+ Log"}
         </button>
       </div>

       {isAdding && (
         <form onSubmit={onAdd} className="mb-4 space-y-2 rounded-xl border p-3 bg-gray-50 dark:bg-gray-900">
            <div className="flex gap-2 mb-2">
              <input 
                type="date"
                className="w-full rounded border px-2 py-1 text-sm" 
                value={date} onChange={e => setDate(e.target.value)} 
              />
              <select 
                className="w-full rounded border px-2 py-1 text-sm"
                value={type} onChange={e => setType(e.target.value as InteractionType)}
              >
                <option value="MSG">Msg</option>
                <option value="CALL">Call</option>
                <option value="EMAIL">Email</option>
                <option value="IN_PERSON">Visit</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <textarea 
              className="w-full rounded border px-2 py-1 text-sm mb-2" 
              placeholder="What happened? outcome?" 
              rows={2}
              value={notes} onChange={e => setNotes(e.target.value)} 
            />
            <button className="w-full rounded bg-black py-1 text-sm text-white dark:bg-white dark:text-black">Save Log</button>
         </form>
       )}

       <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-3 space-y-6">
         {interactions.length === 0 && !isAdding && (
            <p className="ml-4 text-sm opacity-50">No interactions yet.</p>
         )}
         {interactions.map(i => (
           <div key={i.id} className="relative ml-4">
              <div className="absolute -left-[21px] mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-300 dark:border-black dark:bg-gray-700"></div>
              <div className="group text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold opacity-80">{i.date} · {i.type}</span>
                  <button 
                    onClick={() => onDelete(i.id)}
                    className="opacity-0 group-hover:opacity-50 hover:!opacity-100 px-2"
                  >
                    ×
                  </button>
                </div>
                <div className="whitespace-pre-wrap opacity-70">{i.notes}</div>
              </div>
           </div>
         ))}
       </div>
    </section>
  );
}
