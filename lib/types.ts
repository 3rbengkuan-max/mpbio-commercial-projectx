// Domain vocabulary for the commercial intelligence workspace.
// Values mirror docs/DATA_MODEL.md exactly — the DB stores plain text, so these
// lists are the single source of truth for what the UI offers and validates.

export const SIGNAL_CATEGORIES = [
  "competitor",
  "customer",
  "trend",
  "geopolitical",
] as const;

export const SIGNAL_TYPES = ["opportunity", "threat"] as const;

export const SIGNAL_STATUSES = ["new", "reviewed", "archived"] as const;

export const PROJECT_STATUSES = [
  "active",
  "on-hold",
  "completed",
  "dropped",
] as const;

export const PROJECT_PRIORITIES = ["high", "medium", "low"] as const;

export const ACTION_TYPES = ["comment", "status_change", "assignment"] as const;

export const TEAM_ROLES = [
  "Sales Manager",
  "Business Developer",
  "Product Specialist",
  "Field Application Specialist",
  "Customer Service Specialist",
] as const;

export type SignalCategory = (typeof SIGNAL_CATEGORIES)[number];
export type SignalType = (typeof SIGNAL_TYPES)[number];
export type SignalStatus = (typeof SIGNAL_STATUSES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];
export type ActionType = (typeof ACTION_TYPES)[number];

export type Signal = {
  id: string;
  user_id: string | null;
  created_at: string;
  title: string;
  source_url: string | null;
  source_name: string | null;
  signal_date: string | null;
  category: string | null;
  signal_type: string | null;
  summary: string | null;
  ai_summary: string | null;
  ai_relevance_score: number | null;
  ai_suggested_category: string | null;
  status: string | null;
};

export type Project = {
  id: string;
  user_id: string | null;
  created_at: string;
  title: string;
  description: string | null;
  signal_id: string | null;
  owner_name: string | null;
  owner_role: string | null;
  status: string | null;
  priority: string | null;
  due_date: string | null;
  outcome: string | null;
};

export type Activity = {
  id: string;
  user_id: string | null;
  created_at: string;
  project_id: string | null;
  signal_id: string | null;
  actor_name: string | null;
  actor_role: string | null;
  action_type: string | null;
  note: string | null;
  status_change_from: string | null;
  status_change_to: string | null;
};

/** Shape returned by every server action, consumed by useActionState. */
export type FormState = {
  ok: boolean;
  error?: string;
  /** Field-level validation messages, keyed by form field name. */
  fieldErrors?: Record<string, string>;
};

export const EMPTY_FORM_STATE: FormState = { ok: false };

/** docs/TEST_PLAN.md: activity notes are capped so the UI can warn before submit. */
export const NOTE_MAX_LENGTH = 2000;
