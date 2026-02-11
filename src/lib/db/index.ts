import Dexie, { Table } from "dexie";
import type { Job, Contact, Interaction, Template } from "@/lib/domain/types";

export class ApplyFlowDB extends Dexie {
  jobs!: Table<Job, string>;
  contacts!: Table<Contact, string>;
  interactions!: Table<Interaction, string>;
  templates!: Table<Template, string>;

  constructor() {
    super("applyflow");
    this.version(2).stores({
      jobs: "id, status, company, role, location, nextFollowUpDate, createdAt, updatedAt",
      contacts: "id, jobId, name, channel, createdAt",
      interactions: "id, jobId, date, type, createdAt",
      templates: "id, title"
    });
  }
}

export const db = new ApplyFlowDB();
