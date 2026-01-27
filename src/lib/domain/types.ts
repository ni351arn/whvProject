export type JobId = string;
export type ContactId = string;
export type InteractionId = string;

export enum JobStatus {
  ToApply = "TO_APPLY",
  Applied = "APPLIED",
  FollowUp = "FOLLOW_UP",
  Interview = "INTERVIEW",
  Offer = "OFFER",
  Rejected = "REJECTED",
}

export type ContactChannel = "WHATSAPP" | "CALL" | "EMAIL" | "IN_PERSON" | "OTHER";
export type InteractionType = "MSG" | "CALL" | "EMAIL" | "IN_PERSON" | "OTHER";

export interface Job {
  id: JobId;
  company: string;
  role: string;
  location: string;
  status: JobStatus;
  nextFollowUpDate?: string; // "YYYY-MM-DD"
  lastContactDate?: string;  // "YYYY-MM-DD"
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: ContactId;
  jobId: JobId;
  name: string;
  channel: ContactChannel;
  handle: string;
  notes?: string;
  createdAt: string;
}

export interface Interaction {
  id: InteractionId;
  jobId: JobId;
  date: string; // "YYYY-MM-DD"
  type: InteractionType;
  outcome?: string;
  notes?: string;
  createdAt: string;
}
