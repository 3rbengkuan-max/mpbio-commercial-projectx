# Intelligence Layer

## Messy Inputs
- Raw news article URL pasted by a team member
- Free-text signal summary typed manually
- Inconsistent category/type labelling across team members

## Auto-Structure Schema (JSON example)
```json
{
  "signal_id": "uuid",
  "ai_summary": "Thermo Fisher cuts immunoassay pricing 12% below market, targeting clinical labs.",
  "ai_summary_source": "openai/gpt-4o",
  "ai_summary_confidence": 0.91,
  "ai_summary_review_status": "unreviewed",
  "ai_relevance_score": 85,
  "ai_relevance_score_source": "rule+llm",
  "ai_relevance_score_confidence": 0.78,
  "ai_relevance_score_review_status": "unreviewed",
  "ai_suggested_category": "competitor",
  "ai_suggested_category_confidence": 0.95
}
```

## Events to Track
- Signal created (manual)
- AI suggestion generated
- Team member accepts or overrides AI suggestion
- Project created from signal

## Scoring Rules (v1 — rule-based)
- Contains competitor name → +30 relevance
- Contains MPbio product category keyword → +25
- Signal type = `threat` AND category = `competitor` → priority boost to `high`
- Source is known trade publication → +10 confidence

## What Gets Ranked
- Signals by relevance score (desc) on dashboard
- Projects by priority + due date

## v1 vs Later
**v1:** Manual entry only; no AI calls.
**Next:** LLM auto-summarises and scores on signal save; team reviews inline.
**Later:** Clustering of related signals; proactive project suggestions; weekly AI digest.
