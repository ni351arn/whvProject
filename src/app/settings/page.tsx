"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function SettingsPage() {
  const jobCount = useLiveQuery(() => db.jobs.count()) ?? 0;
  const [importing, setImporting] = useState(false);

  async function downloadBackup() {
    const data = {
      jobs: await db.jobs.toArray(),
      contacts: await db.contacts.toArray(),
      interactions: await db.interactions.toArray(),
      templates: await db.templates.toArray(),
      exportedAt: new Date().toISOString(),
      version: 2
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applyflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("This will OVERWRITE your current data using the backup file. Continue?")) {
        e.target.value = ""; // reset input
        return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      await db.transaction("rw", db.jobs, db.contacts, db.interactions, db.templates, async () => {
        // Clear current data
        await db.jobs.clear();
        await db.contacts.clear();
        await db.interactions.clear();
        await db.templates.clear();

        // Add new data
        if (data.jobs) await db.jobs.bulkAdd(data.jobs);
        if (data.contacts) await db.contacts.bulkAdd(data.contacts);
        if (data.interactions) await db.interactions.bulkAdd(data.interactions);
        if (data.templates) await db.templates.bulkAdd(data.templates);
      });

      alert("Import successful! App will reload.");
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Failed to import file. Invalid format?");
    } finally {
      setImporting(false);
    }
  }

  async function resetApp() {
    if (prompt("Type 'DELETE' to confirm wiping all data.") !== "DELETE") return;
    
    await db.jobs.clear();
    await db.contacts.clear();
    await db.interactions.clear();
    await db.templates.clear(); // keeping templates might be nice, but "reset" implies clean slate.
    
    alert("App reset complete.");
    window.location.reload();
  }

  return (
    <main className="mx-auto max-w-xl p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="opacity-70">Manage your data and preferences.</p>
      </header>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Data & Backup</h2>
        <div className="rounded-xl border p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            <div>
                <div className="font-medium">Export Data</div>
                <p className="text-sm opacity-60 mb-2">Save a JSON file with all your jobs ({jobCount}), contacts, and templates.</p>
                <button 
                  onClick={downloadBackup}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-80 dark:bg-white dark:text-black"
                >
                  Download Backup
                </button>
            </div>
            
            <hr className="border-gray-200 dark:border-gray-700"/>

            <div>
                <div className="font-medium">Import Data</div>
                <p className="text-sm opacity-60 mb-2">Restore from a backup JSON file. ⚠️ Overwrites current data.</p>
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleImport}
                  disabled={importing}
                  className="text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-gray-200 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-gray-300 dark:file:bg-gray-800 dark:hover:file:bg-gray-700"
                />
            </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:bg-red-900/10 dark:border-red-900/50">
           <div className="font-medium text-red-800 dark:text-red-200">Reset Application</div>
           <p className="text-sm text-red-600/80 mb-3">Permanently delete all jobs and data.</p>
           <button 
             onClick={resetApp}
             className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:bg-black dark:border-red-900"
           >
             Reset Everything
           </button>
        </div>
      </section>

      <div className="text-center text-xs opacity-40 pt-8">
        ApplyFlow v0.3.0
      </div>

    </main>
  );
}
