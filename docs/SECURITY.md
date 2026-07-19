# Security

## Secret Handling
- Supabase service-role key and OpenAI API key stored in Vercel environment variables only
- Never imported into any client component or exposed in browser network calls
- All AI calls made from Next.js server actions or API routes — client receives only the stored result

## Permission Model (v1 — open demo)
- RLS enabled on all tables with permissive v1 policies (no login required)
- No user identity enforced yet — `user_id` columns are nullable

## Permission Model (lock-down sprint)
- Supabase Auth enabled; `user_id` populated on every write
- Team-scoped read: all authenticated team members can read all rows
- Write scope: row creator can edit/delete their own rows; Sales Manager role can edit any
- RLS policies replaced with `auth.uid() = user_id` owner checks + role-based overrides
- Audit log written server-side on every state-changing action — never skippable from the client

## Approved Tools Rule
Agent may only call tools on the named list in AGENTIC_LAYER.md. No dynamic tool construction. Every agent invocation logs to `audit_logs` before and after execution.

## Audit Principle
Every create, update, delete, and AI action writes an `audit_logs` row server-side. The client cannot bypass it. Logs are append-only — no delete policy on `audit_logs`.

## What to Stop and Escalate
Any change to RLS policies, deletion of audit logs, or integration with payment/external-comms systems must be reviewed by a human with Supabase project admin access before deployment.
