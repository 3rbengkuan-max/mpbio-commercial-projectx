# Data Model

## signals
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid nullable | owner (populated at lock-down sprint) |
| created_at | timestamptz | default now() |
| title | text | required |
| source_url | text | |
| source_name | text | |
| signal_date | date | |
| category | text | `competitor`, `customer`, `trend`, `geopolitical` |
| signal_type | text | `opportunity`, `threat` |
| summary | text | manual entry |
| ai_summary | text | AI field |
| ai_summary_source | text | e.g. `openai/gpt-4o` |
| ai_summary_confidence | numeric | 0–1 |
| ai_summary_review_status | text | `unreviewed`, `accepted`, `overridden` |
| ai_relevance_score | numeric | 0–100 |
| ai_relevance_score_source / _confidence / _review_status | text/numeric/text | |
| ai_suggested_category | text | |
| ai_suggested_category_source / _confidence / _review_status | text/numeric/text | |
| status | text | `new`, `reviewed`, `archived` |

## projects
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| created_at | timestamptz | |
| title | text | required |
| description | text | |
| signal_id | uuid FK → signals.id | |
| owner_name | text | free-text until auth sprint |
| owner_role | text | role label |
| status | text | `active`, `on-hold`, `completed`, `dropped` |
| priority | text | `high`, `medium`, `low` |
| due_date | date | |
| outcome | text | filled on completion |

## activities
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| created_at | timestamptz | |
| project_id | uuid FK → projects.id | |
| signal_id | uuid FK → signals.id nullable | |
| actor_name | text | |
| actor_role | text | |
| action_type | text | `comment`, `status_change`, `assignment` |
| note | text | |
| status_change_from | text | |
| status_change_to | text | |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| created_at | timestamptz | |
| actor_name | text | |
| action | text | verb e.g. `signal.created` |
| target_table | text | |
| target_id | uuid | |
| detail | jsonb | full before/after snapshot |

## RLS
All tables: v1 open policies (select + all for `true`). Replaced with `auth.uid() = user_id` at lock-down sprint.
