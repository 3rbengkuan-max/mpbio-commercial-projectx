# PRD — MPbio Commercial Intelligence Workspace

## Problem
The commercial team (sales, BD, marketing, R&D, customer service) tracks life-science industry signals — competitor moves, customer news, trends, geopolitical shifts — in scattered spreadsheets and chat messages. There is no shared, structured place to log signals, link them to strategic actions, and track who is doing what.

## Target Users
Cross-functional team of ~5: Sales Manager, Business Developer, Product Specialist, Field Application Specialist, Customer Service Specialist.

## Core Objects
- **Signal** — a captured market event (news item, announcement, intel) tagged by category and type
- **Project** — a strategic response (opportunity to develop, threat to mitigate) linked to one or more signals, with an owner and status
- **Activity** — a logged update, comment, or status change on a project
- **Audit Log** — immutable record of every meaningful action

## MVP Must-Haves
- [ ] Any team member can log a signal (title, source, category, type, summary)
- [ ] Any team member can create a project linked to a signal, assign an owner and due date
- [ ] Any team member can add an activity update to a project
- [ ] Shared dashboard shows live signal feed, open projects, and recent activity — same view for everyone
- [ ] All data persists to database; page refresh shows current state
- [ ] No login required in v1 — app is demoable immediately

## Non-Goals (v1)
- Automated feed ingestion / web scraping
- AI scoring or summarisation
- Email notifications or digests
- CRM integration
- Per-user login and data isolation

## Definition of Done
A team member opens the app, logs a new signal about a competitor price change, creates a linked project, assigns it to a colleague by name, adds an activity note — and a second team member opening the app on a different browser sees all of it immediately, with correct data and no page errors.
