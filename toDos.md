# ApplyFlow – WHV Application CRM (MVP Plan)

**Offline-first, mobile-friendly PWA (English UI)**  
**Created:** 2026-01-26

## 1. What you are building
**ApplyFlow** is a personal application tracker for Working Holiday travelers in Australia. It is **not** a job platform like Seek/Indeed. It helps you get and manage jobs by tracking applications, contacts, follow-ups, and interaction history — fully usable offline on your phone (installable as a PWA).

## 2. MVP goals (deadline: 14.02)
- Create, edit, search, and filter job applications
- Pipeline status as a list *(To apply / Applied / Follow-up / Interview / Offer / Rejected)*
- Follow-up date per job + dashboard highlighting **overdue / today / next 7 days**
- Contacts per job *(name + channel + handle + notes)*
- Interaction log per job *(date + type + notes)*
- Message templates with one-click copy *(WhatsApp/email)*
- Works offline and is installable on mobile *(PWA)*

## 3. What you need on your Mac (apps + tools)
You already have VS Code. For this project you do **not** need Oracle SQL Developer or a paid database.

### 3.1 Required
- Homebrew *(package manager for macOS)*
- Git *(usually already installed, but Homebrew version is fine)*
- Node.js LTS + npm *(install via nvm so you can switch versions easily)*
- A package manager: **pnpm** *(recommended)* or **yarn** *(optional)*
- A modern browser for testing: **Chrome** or **Firefox**

### 3.2 Recommended
- Vercel account *(free)* for deployment + preview links
- Vercel CLI *(optional)* for faster deploys
- VS Code extensions: **ESLint**, **Prettier**, **Tailwind CSS IntelliSense**, **GitHub Copilot** *(optional)*
- Insomnia or Postman *(only needed later if you add a backend API)*

### 3.3 Not needed (for MVP)
- A paid database *(we store data locally in the browser)*
- Docker
- Conda environments *(keep Python separate; this project is Node/TypeScript)*

## 4. Tech stack (MVP)
- Next.js (React) + TypeScript
- Tailwind CSS for responsive UI
- IndexedDB local storage using **Dexie** *(fast, reliable offline persistence)*
- PWA setup *(manifest + service worker)* so the app can be installed and used offline
- Optional later: Supabase for login + cloud sync

## 5. Data model (simple & extensible)

### Jobs
**Fields:** `id`, `company`, `role`, `location`, `status`, `nextFollowUpDate`, `notes`, `tags[]`, `createdAt`, `updatedAt`

### Contacts (linked to a job)
**Fields:** `id`, `jobId`, `name`, `channel` *(WhatsApp/Call/Email/In-person)*, `handle` *(phone/email)*, `notes`, `createdAt`

### Interactions (linked to a job)
**Fields:** `id`, `jobId`, `date`, `type` *(msg/call/email/in-person)*, `outcome` *(optional)*, `notes`, `createdAt`

## 6. Pages (MVP)
- **Dashboard:** follow-ups *(overdue/today/next 7 days)*, quick stats, quick add
- **Jobs list:** search + filters + sort by next follow-up date
- **Job detail:** edit job + contacts + interactions + templates
- **Templates:** message templates with variable placeholders and copy button
- **Settings:** export/import *(CSV/JSON)* + data reset *(optional)*

## 7. Build plan (09.02–14.02, full-time)

1. **Day 1 – Project setup + UI skeleton**
   - Create Next.js app with TypeScript
   - Install Tailwind
   - Set up routing and basic layout
   - Create components: `JobCard`, `StatusBadge`, `SearchBar`, `BottomNav` *(mobile)*

2. **Day 2 – Offline database (Dexie + IndexedDB)**
   - Create Dexie database + tables *(jobs, contacts, interactions)*
   - Implement CRUD for jobs
   - Seed demo data toggle for testing

3. **Day 3 – Pipeline + follow-ups**
   - Implement status field + status filter
   - Dashboard follow-up sections: **overdue / today / next 7 days**
   - Sort jobs by `nextFollowUpDate`

4. **Day 4 – Contacts + interactions**
   - Contacts CRUD inside job detail
   - Interactions log *(last contact date visible on job list)*

5. **Day 5 – Templates + copy flow**
   - Templates library
   - Variable placeholders: `{{company}}`, `{{role}}`, `{{name}}`
   - One-click copy + toast confirmation

6. **Day 6 – PWA + polish + deploy**
   - Add manifest + service worker caching
   - Offline test *(airplane mode)*
   - Mobile UX polish + empty states
   - Deploy to Vercel + create a short README

## 8. Backlog (Jira-style tickets)

| Ticket | Description |
|---|---|
| APP-1 | Create Next.js project + Tailwind + basic layout |
| APP-2 | Jobs list page with search + status filter |
| APP-3 | Job create/edit form (mobile friendly) |
| APP-4 | Offline database with Dexie (jobs CRUD) |
| APP-5 | Dashboard follow-up widgets (overdue/today/week) |
| APP-6 | Job detail page with Contacts CRUD |
| APP-7 | Interactions log (add/view) |
| APP-8 | Templates page + copy button + variable fill |
| APP-9 | PWA manifest + service worker + install prompt |
| APP-10 | Deploy to Vercel + README + basic analytics counters |

## 9. Definition of Done (MVP)
- You can install the app on your phone *(Add to Home Screen)*
- You can add a job, set a follow-up date, and see it highlighted on the dashboard
- Contacts and interactions save and load correctly offline
- Search and filters work
- Templates copy correctly and replace placeholders
- Deployed link is working and looks good on mobile

## 10. First message templates (copy/paste)

### Cold outreach (WhatsApp)
- Hi {{name}}, I’m currently in {{location}} and looking for work ({{role}}). Are you hiring at the moment? I’m reliable and can start immediately. Thanks!

### Follow-up after 3 days
- Hi {{name}}, just following up on my message about the {{role}} role at {{company}}. I’m still available and happy to jump on a quick call. Thanks!

## 11. Next after MVP (optional V2)
- Export/Import (JSON) + automatic backups
- Job quality scoring *(pay, travel time, accommodation)*
- Push notifications for follow-ups *(requires permissions)*
- Cloud sync + login *(Supabase)*
- Add Timesheet + Budget modules
