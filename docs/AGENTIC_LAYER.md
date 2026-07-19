# Agentic Layer

## Risk Levels & Actions

### Low — Auto-execute (no approval needed)
- Summarise signal text via LLM → store in `ai_summary` with `review_status = unreviewed`
- Score signal relevance → store in `ai_relevance_score`
- Suggest category/type → store in `ai_suggested_category`

### Medium — Draft shown, one-click approval
- Create a project draft from a signal cluster (agent drafts title + description, human confirms before insert)
- Suggest owner assignment based on project category and past ownership patterns

### High — Explicit approval required
- Post a summary to a team Slack/Teams channel
- Send an email digest to the team

### Critical — Human only, never automated
- Delete a signal or project
- Mark a project as dropped (irreversible status)
- Any action touching billing or external systems

## Named Tools (approved list)
- `llm_summarise(text)` → returns summary string
- `llm_score_relevance(text, context)` → returns 0–100 score
- `llm_suggest_category(text)` → returns category + confidence
- `db_insert_signal_ai_fields(signal_id, fields)` → writes AI results to DB only

No `run_any`, `eval`, or `send_any` tools permitted.

## Audit Log Fields
`actor_name`, `action` (e.g. `ai.summary_generated`), `target_table`, `target_id`, `detail` (input + output snapshot), `created_at`.

## v1 vs Later
**v1:** No agent actions — all manual.
**Sprint 5:** Low-risk AI summarisation on signal save.
**Later:** Medium-risk project drafting; high-risk comms require explicit approval UI.
