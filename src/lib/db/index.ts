import Dexie, { Table } from "dexie";
import type { Job, Contact, Interaction } from "@/lib/domain/types";

export class ApplyFlowDB extends Dexie {
  jobs!: Table<Job, string>;
  contacts!: Table<Contact, string>;
  interactions!: Table<Interaction, string>;

  constructor() {
    super("applyflow");
    this.version(1).stores({
      jobs: "id, status, company, role, location, nextFollowUpDate, createdAt, updatedAt",
      contacts: "id, jobId, name, channel, createdAt",
      interactions: "id, jobId, date, type, createdAt",
    });
  }
}

export const db = new ApplyFlowDB();
