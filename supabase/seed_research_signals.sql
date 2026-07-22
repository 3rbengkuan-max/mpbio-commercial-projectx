-- Research-sourced signals, gathered via live web search (July 2026).
-- These are REAL market items with real source URLs — not invented demo data.
-- Run after 0003_signal_origin.sql. Safe to re-run: guarded by title uniqueness
-- through a not-exists check per row.
--
-- user_id is null (unowned, like the starter demo rows), origin = 'research'.

insert into signals (title, source_url, source_name, signal_date, category, signal_type, summary, status, origin)
select * from (values
  (
    'Thermo Fisher scaling GMP monoclonal antibody manufacturing in H2 2026',
    'https://www.biospace.com/press-releases/thermo-fisher-scientific-showcases-new-capabilities-across-manufacturing-clinical-development-and-ai-enabled-research-at-bio-international-2026',
    'BioSpace',
    date '2026-06-15',
    'competitor',
    'threat',
    'Thermo Fisher is bringing large-scale GMP monoclonal antibody manufacturing online in Plainville, MA in the second half of 2026, alongside AI-enabled research capabilities shown at BIO International 2026. Deepens their reach into bioproduction where MPbio competes on reagents and antibodies.',
    'new',
    'research'
  ),
  (
    'NIH FY2026 budget set at $48.7B (+$415M) but fewer new grants awarded',
    'https://www.statnews.com/2026/01/20/nih-funding-deal-trump-cuts-rejected-budget-boosted-415-million/',
    'STAT News',
    date '2026-01-20',
    'trend',
    'opportunity',
    'Congress set NIH FY2026 at $48.7B, a $415M increase, with boosts for cancer and Alzheimer''s. But the agency is awarding thousands fewer new grants and labs remain conservative on spend — a mixed signal: budget up, but reagent purchasing sluggish and concentrated in funded areas.',
    'new',
    'research'
  ),
  (
    'China''s April 2026 supply-chain security rules can trigger export restrictions with no transition period',
    'https://www.pharmaceuticalcommerce.com/view/how-china-turned-us-trade-compliance-into-a-supply-chain-risk',
    'Pharmaceutical Commerce',
    date '2026-04-10',
    'geopolitical',
    'threat',
    'Beijing''s Regulations on Industrial and Supply Chain Security took effect immediately in April 2026, meaning routine US trade compliance can now trigger Chinese export restrictions on raw materials and reagents. Direct lead-time and sourcing risk for APAC reagent supply.',
    'new',
    'research'
  ),
  (
    'Rising tariffs reshaping laboratory budgets for 2026',
    'https://www.labmanager.com/rising-tariffs-reshape-laboratory-budgets-for-2026-34483',
    'Lab Manager',
    date '2026-02-01',
    'geopolitical',
    'threat',
    'Tariffs on China and other partners threaten the flow of raw materials, reagents and instruments into the US. Clinical labs are especially exposed because validated reagents cannot be easily substituted — pressure on procurement and an opening for stable-priced domestic alternatives.',
    'new',
    'research'
  ),
  (
    'CRO market to reach ~$93B in 2026; APAC fastest-growing at 11.3% CAGR',
    'https://www.mordorintelligence.com/industry-reports/contract-research-organization-market',
    'Mordor Intelligence',
    date '2026-03-01',
    'customer',
    'opportunity',
    'The contract research organisation market is projected at ~$92.98B in 2026, with Asia-Pacific the fastest-growing region (11.26% CAGR to 2031), led by Pharmaron and WuXi AppTec. Expanding APAC CRO capacity means rising consumable and reagent demand in MPbio''s regional footprint.',
    'new',
    'research'
  ),
  (
    'China barred Illumina sequencer imports amid US-China trade escalation',
    'https://www.science.org/content/article/china-trade-war-u-s-taking-toll-research-labs',
    'Science (AAAS)',
    date '2026-05-05',
    'geopolitical',
    'opportunity',
    'After tit-for-tat tariffs, China placed Illumina on its "unreliable entities" list and barred import of its sequencers, while US reagents face steep markups in China. Disruption to incumbent US suppliers in the China market may open switching windows for alternative reagent and consumable vendors.',
    'new',
    'research'
  )
) as v(title, source_url, source_name, signal_date, category, signal_type, summary, status, origin)
where not exists (
  select 1 from signals s where s.title = v.title
);
