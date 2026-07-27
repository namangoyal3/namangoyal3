# Click-a-thon India 2026 — Winning Strategy & Prep Kit

**Event:** 1–2 August 2026, Bengaluru · 24-hour hackathon · ₹10,00,000 prize pool
**Prepared:** 27 July 2026

---

## 1. The most important reality check

**The handbook does not contain problem statements.** They are revealed at 12:00 pm on 1 August, simultaneously, across four tracks:

1. Real-Time Analytics
2. Observability
3. Data Warehousing
4. Agentic AI & Analytics

Three facts change how you should prep:

- **Problem statements are sourced from production environments of actual partner companies** (confirmed by ClickHouse's own Click-a-thon coverage). These are not toy prompts — expect "here is our real pain at scale" problems from Indian tech companies.
- **Selection is first-come, first-served with per-statement team caps.** You may have **minutes**, not hours, to evaluate and claim. A team with a pre-built decision framework wins the selection race before the hack even starts.
- **Once selected, you cannot change.** A wrong pick at 12:05 pm cannot be undone at 6 pm.

So the strategy is: don't bet on one problem — **pre-rank the likely archetypes, pre-build the reusable scaffolding that works for all of them, and walk in with a 10-minute selection playbook.**

---

## 2. The judging rubric (exact, from Handbook §6.2) — and how to exploit it

| Criteria | Weight | What judges evaluate |
|---|---|---|
| **Use of ClickHouse & OSS Stack** | **25%** | Is ClickHouse genuinely central? Is the OSS integration (ClickStack/Langfuse/LibreChat) meaningful, not superficial? |
| **Problem Fit** | **20%** | Does it solve the *right* problem — the one the partner actually stated? |
| **Technical Implementation** | **20%** | Code quality, architecture, "would this work in production?" |
| **Innovation** | **20%** | Genuinely new approach, not a CRUD wrapper |
| **Scalability & Impact** | **10%** | Real-world applicability, could real users deploy it |
| **Presentation** | **5%** | Pitch deck + demo video clarity |

Scoring: 1–10 per criterion, weighted aggregate → leaderboard → top 10 pitch on stage (5 min + 5 min Q&A) → jury re-ranks top 3.

### Strategic implications (read these twice)

1. **"Huge impact on people's lives" is only worth 10%.** The romantic pick (rural health, farmers) scores 1 point of every 10. The rubric is engineered to reward **ClickHouse depth (25%) + problem fit (20%) + engineering (20%) + novelty (20%) = 85%**. Pick the problem where you can demo ClickHouse doing something *hard* — billions of rows, sub-second queries, materialized views, real streaming — and *then* tell the human-impact story on top for the 10% and the stage narrative.
2. **The 25% criterion is the biggest single lever and the easiest to max.** Judges are ClickHouse engineering leaders. They will smell a bolted-on integration instantly ("Superficial or non-functional inclusion will not be considered" — §4.2). Use engine-level features: `MergeTree` family, materialized views, `AggregatingMergeTree`, TTLs, dictionaries, window functions, `ASOF JOIN`, approximate functions (`uniqHLL`, quantiles). Name them on stage.
3. **All-four integration (ClickHouse + ClickStack + Langfuse + LibreChat) = Spot Award eligibility (₹60,000 pool) AND maxes the 25% criterion.** There is one architecture where all four are *natural*, not forced — see §4.
4. **Problem Fit (20%) means: answer the partner's stated problem, not the grander problem you wish they'd asked.** Teams die here by scope-drifting into their pet idea.
5. **Presentation is only 5% for the leaderboard — but the top-10 stage pitch is re-judged by the jury for the top 3.** So: submission quality gets you shortlisted; storytelling gets you on the podium. Budget the 11 am–12 pm hour on 2 Aug strictly for demo + deck (the schedule literally reserves it).

---

## 3. Predicted problem-statement archetypes, ranked against the rubric

Based on: partner-sourced production problems, the four tracks, ClickHouse's own recent hackathons (AWS MCP Hackathon SF, NYC AI Agents Hackathon — both centred on *agents acting on real-time data*), ClickHouse's current marketing pushes (ClickStack "agentic observability", "Your AI SRE needs better observability" blog), and which Bengaluru-ecosystem companies run ClickHouse at scale (Zomato runs a petabyte-scale ClickHouse logging platform — 150M logs/minute; fintech and quick-commerce players are heavy real-time-analytics users).

Scores are my estimate of *your achievable ceiling in 24h*, per rubric criterion (1–10), weighted:

| # | Archetype (likely track) | CH+OSS 25% | Fit 20% | Tech 20% | Innov 20% | Impact 10% | Pres 5% | **Weighted** |
|---|---|---|---|---|---|---|---|---|
| 1 | **Real-time payment/UPI fraud & anomaly detection with agentic investigation** (Real-Time Analytics) | 10 | 9 | 9 | 8 | 10 | 9 | **9.15** |
| 2 | **AI SRE / agentic observability — agents that diagnose incidents from ClickStack telemetry** (Observability) | 10 | 9 | 8 | 9 | 7 | 9 | **9.00** |
| 3 | **Conversational analytics copilot over partner's data (LibreChat + MCP + text-to-SQL)** (Agentic AI) | 9 | 9 | 8 | 6 | 8 | 9 | **8.10** |
| 4 | **Quick-commerce / delivery ops intelligence — demand surge, dark-store inventory, live SLA dashboards** (Real-Time Analytics) | 9 | 8 | 8 | 7 | 8 | 8 | **8.05** |
| 5 | **Warehouse cost & query optimizer / migration copilot** (Data Warehousing) | 9 | 8 | 8 | 7 | 6 | 8 | **7.85** |
| 6 | **Public-interest analytics — outbreak/civic/traffic surveillance** (any track) | 7 | 6* | 7 | 8 | 10 | 9 | **7.30** |

\* Fit score is low **only because a partner is unlikely to bring this exact problem** — if one does (e.g. a govt-adjacent partner), it jumps to ~8.7 weighted and becomes the pick.

### UPDATE (27 Jul): Partners are announced — InMobi | Glance, Atlys, Sony LIV

ClickHouse's own Click-a-thon blog and event page confirm three partners, "each bringing real engineering challenges to the floor," with problem statements **co-authored with strategic ClickHouse customers** and anonymised datasets + starter repos delivered on 1 Aug. What we know about each partner's production stack lets us predict the statements with high confidence:

**InMobi | Glance** (adtech + lock-screen content; ~250B ad requests and ~30B events/day; already migrated publisher reporting to ClickHouse in "Project Velocity" — P99 from 60s → <3s, cost $40k → $8k/month, 400K+ queries/day over 10TB):
- *Real-Time Analytics:* sub-second advertiser/publisher-facing reporting over billions of ad events — essentially a miniature Project Velocity (a prior ClickHouse hackathon problem was literally "derived from InMobi and Glance's production systems")
- *Real-Time Analytics / Agentic:* **invalid-traffic / click-fraud detection** on the ad event stream → maps 1:1 to archetype #1 (fraud), adtech flavour
- *Agentic AI:* campaign-analyst agent — "why did my eCPM drop 30% in Indonesia last night?" answered with real SQL over ad data (LibreChat + MCP)
- *Glance:* lock-screen content engagement & recommendation analytics at hundreds-of-millions-of-devices scale

**Sony LIV** (OTT streaming; ingests tens of millions of video QoS/QoE events into ClickHouse Cloud today; live cricket drives 50M+ concurrent viewers):
- *Observability:* **real-time QoE/QoS monitoring and anomaly detection during live-sports concurrency spikes** — detect buffering storms, CDN/ISP-level degradation, root-cause within seconds (ClickStack is the natural core) → maps to archetype #2 (AI SRE)
- *Agentic AI:* an AI-SRE agent that watches playback telemetry and diagnoses "viewers in Hyderabad on Airtel are rebuffering" before the ops team's phones ring
- *Real-Time Analytics:* live audience/concurrency dashboards, ad-break delivery analytics

**Atlys** (visa platform; predictive approval/rejection engine; document automation across 150+ countries):
- *Agentic AI:* **visa-outcome copilot** — approval-likelihood and timeline prediction over anonymised application data, plus an applicant/ops-facing chat agent (LibreChat) with every LLM decision traced in Langfuse
- *Real-Time Analytics / Warehousing:* application-funnel and embassy-SLA analytics; unifying the "traveler identity graph" event stream in ClickHouse
- *Highest human-impact story of the three* (people's travel, jobs, family reunification depend on visa outcomes) — but the smallest raw-scale story

**Revised pick order given the partners:**
1. **Sony LIV QoE observability + AI-SRE agent** — ClickStack becomes genuinely central (not bolted on), the 50M-concurrent-cricket-viewers scale story is spectacular on stage, and our all-four architecture fits without modification. Archetype #2, now with a named partner.
2. **InMobi invalid-traffic/fraud detection or real-time reporting** — biggest data-scale story of the event (250B requests/day); fraud variant = our archetype #1. Risk: this will be the most crowded statement (caps!).
3. **Atlys visa copilot** — pick this if you want the human-impact narrative and the Agentic-AI track is your team's strength; Langfuse integration is deepest here (LLM document decisions need tracing/eval most).

The rest of this section's archetype analysis still applies — these partner problems ARE the archetypes with company names attached.

### Why #1 wins: fraud detection is where "huge human impact" and "rubric-maxing" finally overlap

You asked for the problem that echoes a real problem and has huge impact on people's lives. **Real-time payment fraud is that problem, and it's also the rubric-optimal one:**

- **Human impact (real, current, Indian):** India recorded **10.64 lakh UPI fraud incidents worth ₹805 crore in FY26 (till November)**; ₹981 crore across 12.64 lakh cases in FY25. Total cyber fraud losses in 2025: **~₹22,495 crore (~$2.7B)** across 2.81M complaints. Victims are disproportionately first-time digital users — this is genuinely about protecting ordinary people.
- **Scale story judges love:** UPI hit **21.7 billion transactions in January 2026 alone** (~₹28.3 lakh crore). "Score every UPI-scale transaction in <100ms against billions of historical rows" is a sentence that maxes the ClickHouse criterion by itself.
- **ClickHouse is genuinely the right tool** (not forced): streaming ingest (Kafka engine/ClickPipes), materialized views computing rolling per-device/per-VPA velocity features, `AggregatingMergeTree` for real-time aggregates, `ASOF JOIN` for feature lookback, sub-second scoring queries.
- **All four products integrate *naturally*** → Spot Award eligible (see architecture below).
- **Partner probability is high:** Bengaluru fintech (payments, brokers, lenders) is exactly the partner pool for this event, and fraud/risk is their loudest production pain.

### The one architecture to rehearse (it flexes to archetypes 1–4 with the domain swapped)

```
Event stream (Kafka / ClickPipes / simulated feed)
        │
        ▼
ClickHouse (primary DB) ── MergeTree raw events
        ├── Materialized views → real-time features & aggregates
        ├── Anomaly scoring (SQL + rules + light ML)
        │
        ├──► LibreChat + ClickHouse MCP server
        │      "agentic analyst": investigators chat with the data,
        │      agent runs real SQL, explains each flagged case
        ├──► Langfuse: traces every LLM/agent call — cost, latency,
        │      hallucination review of the agent's verdicts
        └──► ClickStack (OTel + HyperDX): observability of YOUR OWN
               pipeline — ingest lag, query latency, alert latency,
               shown live under load during the demo
```

This single diagram is: primary-DB requirement ✅, meaningful integration of **all three** optional products ✅ (Spot Award consideration), a demo where judges watch the system observe itself under load ✅, and a Langfuse story judges will enjoy (self-hosted Langfuse runs ClickHouse under the hood — "we're running ClickHouse twice" is a guaranteed smile from a ClickHouse jury).

**Warning on "meaningful":** each integration must do real work in the critical path. LibreChat = the actual analyst interface (not a demo toy). Langfuse = you show a real trace where you caught and fixed an agent error during the night. ClickStack = the dashboard you actually used to tune ingest. Say, on stage, one sentence per tool about what it *caught*.

---

## 4. Market research: TAM / SAM / SOM for the top 3 picks

> Use the top-down numbers below on slide ~12 of your 15-slide deck. Judges at a technical hackathon reward *honest, defensible* sizing over inflated numbers — always show the SOM logic.

### Pick #1 — Real-time fraud detection & agentic investigation ("FraudLens"-type)

| | Size | Basis |
|---|---|---|
| **TAM** | **~$40–82B (2026), global fraud detection & prevention** | Global FDP market estimates for 2026 range $40.4B (18.1% CAGR to $129B by 2033) to $81.6B (24.2% CAGR to $462B by 2034) depending on scope |
| **SAM** | **~$1.5–2B (2026), India FDP** — reaching **$3.89B by 2030** at 20.9% CAGR | India = 3.9% of global FDP market (2024); Grand View Research India outlook |
| **SOM** | **~$30–75M ARR in 3–5 yrs** | Realistic 2–4% of India SAM: target the ~50 largest banks/PSPs/fintechs handling UPI-scale volume; an OSS-based, ClickHouse-native real-time fraud stack priced at ₹1.5–5 cr/yr per enterprise × 25–40 accounts |
| **Urgency proof** | ₹805 cr UPI fraud in FY26 (to Nov), 10.64 lakh incidents; ₹22,495 cr total cyber fraud in 2025; UPI at 21.7B txns/month | Government (Parliament) data, RBI-reported figures |

**Pitch line:** *"Every month Indians make 21 billion UPI payments and lose ~₹70 crore to fraud. Today's fraud reviews take hours; our agent investigates in seconds — with every ClickHouse query it ran shown as evidence."*

### Pick #2 — AI SRE / agentic observability on ClickStack

| | Size | Basis |
|---|---|---|
| **TAM** | **~$14–34B** — observability platforms $14.2B by 2028 (Gartner); broader observability tools ~$34B (2026) | Gartner via Network World; Research Nester |
| **SAM** | **LLM/agent observability: $2.69B (2026) → $9.26B (2030), 36% CAGR**; AI-agent observability specifically $0.4B (2025) → $7.1B (2035) | Research & Markets; Astute Analytica |
| **SOM** | **~$15–40M ARR in 3–5 yrs** | 1–2% of the LLM-observability SAM: OSS-first wedge (ClickStack-compatible) into India/SEA engineering orgs, monetizing hosted tier |
| **Urgency proof** | Gartner: by 2028, explainable-AI needs drive LLM-observability investment in 50% of secure GenAI deployments | Gartner press release, Mar 2026 |

### Pick #3 — Conversational analytics copilot (LibreChat + MCP)

| | Size | Basis |
|---|---|---|
| **TAM** | **~$27–57B (2026), embedded analytics** → ~$101B by 2035 at ~16% CAGR | Precedence Research and peers (range reflects scope differences) |
| **SAM** | Conversational/NL-BI slice, ~10–15% of embedded analytics ≈ **$3–8B** | AI-conversational interfaces are the fastest-growing embedded-analytics segment |
| **SOM** | **~$10–30M ARR in 3–5 yrs** | OSS conversational-BI layer for ClickHouse shops; monetize per-seat |
| **Caveat** | Most crowded space of the three → Innovation score suffers. Differentiate with *verified* answers (agent shows the SQL + Langfuse trace as proof, no hallucinated numbers) | — |

### If a public-impact statement does appear (health/civic)

India digital health market: **$14.5B (2024) → $107B (2033), 25% CAGR**; AI syndromic surveillance across 700+ districts already cuts outbreak detection from 14 days to <72 hours — a real-time ClickHouse layer has an obvious story. Keep this in your back pocket; only pick it if a partner actually brings it (Problem Fit risk otherwise).

---

## 5. Event-day selection playbook (the FCFS race)

At 12:00 pm, statements drop. You have minutes. Score each statement 1–5 on five questions (pre-print this card):

1. **Can ClickHouse be the star?** (streaming, big aggregations, time-series, sub-second queries — not just "a database")
2. **Does our rehearsed architecture map onto it with only the domain swapped?**
3. **Is there data we can get/simulate in hour 1?** (partner-provided dataset > public dataset > simulator you pre-wrote)
4. **Can we demo something moving in real time on stage?** (live > static, always)
5. **Is the team cap still open, and how many teams will swarm it?** (a slightly-worse uncrowded statement beats a perfect crowded one — judges compare you against teams on the *same* statement)

≥20/25 → claim immediately (captain sprints to organisers). Two statements tie → take the one closest to archetype #1/#2. **Decide in ≤10 minutes; you cannot change later.**

## 6. Pre-event prep checklist (this week)

**Rules-compliance (do not skip):**
- [ ] No pre-building solution code — all submitted code must be written inside the 24h window. Prep = skills, environment, and *practice* repos that you do NOT reuse. (Public OSS libraries, public datasets, AI assistants are fine.)
- [ ] Do NOT create a ClickHouse Cloud account — team signup link with $400 credits is issued at the venue.
- [ ] Confirm Team Captain (only they can submit), team of 2–4, licenses understood (MIT/Apache-2.0, repo public by 12:00 pm 2 Aug).

**Skills (each member owns one lane):**
- [ ] **Lane 1 — ClickHouse core:** SQL Playground (sql.clickhouse.com) daily; practice materialized views, `AggregatingMergeTree`, Kafka engine/ClickPipes, `ASOF JOIN`, window functions on the NYC-taxi/GitHub-events datasets.
- [ ] **Lane 2 — Agents:** ClickHouse MCP server + LibreChat local via Docker; get an agent answering questions against the SQL Playground *today* (the examples repo is pre-wired for it).
- [ ] **Lane 3 — Observability:** ClickStack single-Docker-command local stack; instrument a toy app with OTel; build one HyperDX dashboard. Self-host Langfuse via Docker Compose once, end to end.
- [ ] **Lane 4 — Pitch:** Draft the 15-slide deck skeleton now (problem → demo → architecture → ClickHouse-depth slide → all-four-integration slide → TAM/SAM/SOM → team). Pre-record nothing; pre-structure everything.
- [ ] Pull ALL Docker images at home (LibreChat, Langfuse, ClickStack, ClickHouse) — venue Wi-Fi must never be your critical path (handbook says this explicitly).
- [ ] Write (as practice, not for reuse) a small event-stream simulator — you'll need synthetic transactions/logs within hour 1 whatever the statement is.
- [ ] Dry-run: one 6-hour mock sprint as a team on a Playground dataset, ending with a 5-minute pitch.

**24h time budget (rehearse it):**
- Hr 0–1: claim statement, schema design, data flowing into ClickHouse
- Hr 1–8: core pipeline + materialized views + first end-to-end demo (checkpoint with mentors at 8 pm)
- Hr 8–16: agent layer (LibreChat+MCP), Langfuse tracing, ClickStack dashboards (midnight checkpoint is mandatory)
- Hr 16–21: hardening, load demo, README, deploy
- Hr 21–23: freeze features; record 5-min video, finish deck, write 500-word summary
- Hr 23–24: captain submits with 30+ min buffer — **the 12:00 pm freeze is server-side, no extensions**

---

## Sources

- [Click-a-thon coverage — problem statements sourced from production environments (TipRanks)](https://www.tipranks.com/news/private-companies/clickhouse-showcases-real-time-analytics-focus-with-in-person-hackathon)
- [Click-a-thon 2026 official blog — partners InMobi | Glance, Atlys, Sony LIV](https://clickhouse.com/blog/click-a-thon-2026) · [Event page](https://clickhouse.com/clickathon/india2026)
- [InMobi Project Velocity: 20x faster queries, 80% cost savings with ClickHouse](https://clickhouse.com/blog/inmobi) · [TipRanks case-study coverage](https://www.tipranks.com/news/private-companies/clickhouse-highlighted-as-core-analytics-engine-in-inmobi-project-velocity-case-study)
- [Sony LIV: tens of millions of streaming events in ClickHouse Cloud for QoS/QoE (ClickHouse use cases)](https://clickhouse.com/use-cases) · [50M+ concurrent live-streaming viewers context (Last9)](https://last9.io/customers/reliable-observability-for-50-million-concurrent-live-streaming-viewers/)
- [Atlys predictive visa engine and $36M Series C (Inc42)](https://inc42.com/buzz/visa-processing-platform-atlys-bags-36-mn-to-enter-new-international-markets/) · [Forbes profile](https://www.forbes.com/sites/davidprosser/2025/02/06/opening-up-the-world-with-digital-visa-platform-atlys/)
- [ClickHouse — AWS MCP Hackathon SF highlights](https://clickhouse.com/blog/aws-mcp-hackathon-san-francisco) · [NYC AI Agents Hackathon](https://clickhouse.com/blog/nyc-ai-agents-hackathon) · [ClickStack agentic observability](https://clickhouse.com/clickstack/agentic-observability) · [AI SRE observability blog](https://clickhouse.com/blog/ai-sre-observability-architecture)
- [UPI fraud FY26 ₹805 cr, 10.64 lakh cases (The420/Parliament data)](https://the420.in/india-upi-fraud-data-fy26-parliament-digital-payments/) · [Madhyamam](https://madhyamamonline.com/india/upi-linked-frauds-amount-to-rs-805-crore-far-fy26-govt-1477281)
- [UPI statistics — 21.7B txns Jan 2026 (Demandsage)](https://www.demandsage.com/upi-statistics/) · [GrabOn UPI stats](https://www.grabon.in/indulge/tech/upi-statistics/)
- [₹22,495 cr cyber fraud in 2025 (ScamWatchHQ)](https://scamwatchhq.com/india-scams-2026-digital-arrest-upi-fraud-epidemic/)
- [India FDP market → $3.89B by 2030, 20.9% CAGR (Grand View Research)](https://www.grandviewresearch.com/horizon/outlook/fraud-detection-and-prevention-market/india) · [Global FDP $81.6B 2026 (Businessresearchinsights)](https://www.businessresearchinsights.com/market-reports/fraud-detection-and-prevention-market-102151) · [IMARC](https://www.imarcgroup.com/fraud-detection-prevention-market)
- [Gartner observability platforms $14.2B by 2028 (Network World)](https://www.networkworld.com/article/4032218/in-crowded-observability-market-gartner-calls-out-ai-capabilities-cost-optimization-devops-integration.html) · [Research Nester observability tools ~$34B 2026](https://www.researchnester.com/reports/observability-tools-and-platforms-market/8139)
- [LLM observability $2.69B 2026 → $9.26B 2030 (Research & Markets)](https://www.researchandmarkets.com/reports/6215671/large-language-model-llm-observability) · [AI agent observability $0.4B→$7.1B (Astute Analytica)](https://www.astuteanalytica.com/industry-report/ai-agent-observability-market) · [Gartner LLM-observability prediction](https://www.gartner.com/en/newsroom/press-releases/2026-03-30-gartner-predicts-by-2028-explainable-ai-will-drive-llm-observability-investments-to-50-percent-for-secure-genai-deployment)
- [Embedded analytics $27B 2026 → $101B 2035 (Precedence Research)](https://www.precedenceresearch.com/embedded-analytics-market)
- [India digital health $14.5B → $107B 2033 (Grand View Research)](https://www.grandviewresearch.com/industry-analysis/india-digital-health-market-report)
- [India quick commerce $3.65B 2026 (Mordor Intelligence)](https://www.mordorintelligence.com/industry-reports/q-commerce-industry-in-india)
- [Zomato petabyte-scale ClickHouse logging platform](https://www.zomato.com/blog/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale/)
