/**
 * Curated starting templates — structure-only deck skeletons (no colors; the
 * user's chosen theme or brand kit styles them). Each "Use template" creates
 * an Outline the normal generation flow expands, so every template benefits
 * from smart layouts, images, and premium components.
 *
 * contentLayoutHint values must be real layout-family ids from
 * src/lib/layouts/style-catalog.ts — the generation pass gives the hinted
 * family a scoring bonus, so a valid hint steers the slide's design.
 */

export interface TemplateSlide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  kicker?: string;
  bulletPoints?: string[];
  contentLayoutHint?: string;
}

export interface CuratedTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  slides: TemplateSlide[];
}

const t = (
  id: string,
  name: string,
  category: string,
  description: string,
  slides: TemplateSlide[],
): CuratedTemplate => ({ id, name, category, description, slides });

export const CURATED_TEMPLATES: CuratedTemplate[] = [
  // ───────────────────────────── Pitch ─────────────────────────────
  t(
    "pitch-deck",
    "Startup Pitch Deck",
    "Pitch",
    "The classic 10-slide investor narrative: problem → solution → market → ask.",
    [
      { type: "title", title: "[Company] — [One-line promise]", subtitle: "Pre-seed pitch" },
      { type: "content", title: "The Problem", kicker: "THE PROBLEM", contentLayoutHint: "editorial", bulletPoints: ["Pain point: Who hurts and how badly", "Current fix: Why today's workaround fails", "Cost: What staying broken costs per year"] },
      { type: "content", title: "Our Solution", kicker: "THE FIX", contentLayoutHint: "showcase", bulletPoints: ["What it is: The product in one sentence", "How it works: The magic in three steps", "Why now: The shift that makes this possible"] },
      { type: "content", title: "Market Opportunity", kicker: "BY THE NUMBERS", contentLayoutHint: "dashboard", bulletPoints: ["TAM: Total addressable market size", "SAM: The slice we can serve today", "Growth: Why this market is expanding"] },
      { type: "content", title: "How It Works", kicker: "PRODUCT", contentLayoutHint: "steps", bulletPoints: ["Step 1: User onboards in minutes", "Step 2: The core loop delivers value", "Step 3: Results compound over time"] },
      { type: "content", title: "Competitive Landscape", kicker: "OUR EDGE", contentLayoutHint: "comparison", bulletPoints: ["Them: How incumbents approach it", "Us: What we do fundamentally differently", "Moat: Why this stays defensible"] },
      { type: "content", title: "Traction", kicker: "PROOF", contentLayoutHint: "dashboard", bulletPoints: ["Users: Growth since launch", "Revenue: MRR and trajectory", "Retention: The number that matters most"] },
      { type: "content", title: "The Team", kicker: "WHO WE ARE", contentLayoutHint: "team", bulletPoints: ["Founder: Name — relevant superpower", "Founder: Name — relevant superpower", "Advisor: Name — unfair advantage"] },
      { type: "content", title: "The Ask", kicker: "THE ASK", contentLayoutHint: "editorial", bulletPoints: ["Raising: Amount and instrument", "Use of funds: Where every dollar goes", "Milestones: What this round unlocks"] },
      { type: "content", title: "Thank You", kicker: "NEXT STEPS", contentLayoutHint: "spotlight", bulletPoints: ["Let's build the future together — [contact]"] },
    ],
  ),

  // ─────────────────────────── Strategy ────────────────────────────
  t(
    "board-meeting",
    "Board Meeting",
    "Strategy",
    "A CEO-grade board pack: headline, KPIs, deep dives, decisions needed.",
    [
      { type: "title", title: "[Company] Board Meeting", subtitle: "[Quarter, Year] — Confidential" },
      { type: "content", title: "CEO Summary", kicker: "THE HEADLINE", contentLayoutHint: "callout", bulletPoints: ["State of the business in three honest sentences — what's working, what's worrying, what we're doing about it"] },
      { type: "content", title: "KPI Scorecard", kicker: "THE NUMBERS", contentLayoutHint: "dashboard", bulletPoints: ["ARR: Actual vs plan and delta", "Net revenue retention: Trend line", "Burn multiple: Efficiency of growth", "Runway: Months at current burn"] },
      { type: "content", title: "Financial Deep Dive", kicker: "P&L", contentLayoutHint: "table", bulletPoints: ["Revenue: By segment vs last quarter", "Gross margin: Movement and driver", "Opex: Where spend shifted", "Cash: Position and forecast"] },
      { type: "content", title: "Strategic Bets", kicker: "PORTFOLIO", contentLayoutHint: "matrix", bulletPoints: ["Bet 1: Status — evidence it's working", "Bet 2: Status — evidence it's working", "Bet 3: Status — kill, pivot, or double down", "New bet: What we want to start"] },
      { type: "content", title: "Organization", kicker: "PEOPLE", contentLayoutHint: "orgchart", bulletPoints: ["Leadership: Changes and key hires", "Headcount: Plan vs actual by function", "Risk: Retention hotspots and actions"] },
      { type: "content", title: "Risks & Mitigations", kicker: "WATCH LIST", contentLayoutHint: "proscons", bulletPoints: ["Risk: The thing most likely to hurt us", "Mitigation: What we're doing about it", "Risk: The external threat we can't control", "Mitigation: How we'd absorb the hit"] },
      { type: "content", title: "Decisions Needed", kicker: "FOR APPROVAL", contentLayoutHint: "checklist", bulletPoints: ["Approve: [Decision with dollar amount]", "Advise: [Open strategic question]", "Note: [Item for the record]"] },
    ],
  ),
  t(
    "annual-strategy",
    "Annual Strategy Plan",
    "Strategy",
    "V2MOM-style: vision, values, methods, obstacles, measures — one aligned story.",
    [
      { type: "title", title: "[Year] Strategy", subtitle: "[Company] — Where we're going and how" },
      { type: "content", title: "The Vision", kicker: "NORTH STAR", contentLayoutHint: "spotlight", bulletPoints: ["The one-sentence picture of the world when we've won"] },
      { type: "content", title: "What We Believe", kicker: "VALUES", contentLayoutHint: "circles", bulletPoints: ["Value 1: The behavior it demands daily", "Value 2: The behavior it demands daily", "Value 3: The behavior it demands daily"] },
      { type: "content", title: "How We'll Win", kicker: "METHODS", contentLayoutHint: "boxes", bulletPoints: ["Method 1: The initiative and its owner", "Method 2: The initiative and its owner", "Method 3: The initiative and its owner", "Method 4: The initiative and its owner"] },
      { type: "content", title: "What Stands in the Way", kicker: "OBSTACLES", contentLayoutHint: "proscons", bulletPoints: ["Obstacle: The internal constraint", "Counter: How we neutralize it", "Obstacle: The market headwind", "Counter: How we sail through it"] },
      { type: "content", title: "How We'll Know", kicker: "MEASURES", contentLayoutHint: "dashboard", bulletPoints: ["Measure 1: Baseline → target", "Measure 2: Baseline → target", "Measure 3: Baseline → target"] },
      { type: "content", title: "From Vision to Action", kicker: "THE CASCADE", contentLayoutHint: "pyramid", bulletPoints: ["Vision: The destination", "Strategy: The three methods", "Execution: Team-level commitments"] },
      { type: "content", title: "The Year Ahead", kicker: "ROLLOUT", contentLayoutHint: "roadmap", bulletPoints: ["Q1: Foundations — what must be true first", "Q2: Acceleration — the big push", "H2: Compounding — scale what worked"] },
    ],
  ),
  t(
    "competitive-teardown",
    "Competitive Teardown",
    "Strategy",
    "Map the landscape, dissect each rival, and leave with a battle plan.",
    [
      { type: "title", title: "Competitive Teardown: [Market]", subtitle: "Know the enemy, choose the ground" },
      { type: "content", title: "The Landscape", kicker: "MARKET MAP", contentLayoutHint: "matrix", bulletPoints: ["Axis 1: The dimension buyers actually feel", "Axis 2: The dimension that predicts margin", "Clusters: Who sits where and why", "White space: The quadrant nobody owns"] },
      { type: "content", title: "The Contenders", kicker: "WHO WE FIGHT", contentLayoutHint: "bento", bulletPoints: ["[Rival A]: Position, strength, blind spot", "[Rival B]: Position, strength, blind spot", "[Rival C]: Position, strength, blind spot", "[Dark horse]: Why they could surprise everyone"] },
      { type: "content", title: "Feature by Feature", kicker: "HEAD TO HEAD", contentLayoutHint: "featurematrix", bulletPoints: ["Capability 1: Us vs them, honestly scored", "Capability 2: Us vs them, honestly scored", "Capability 3: Where we're behind and by how much", "Capability 4: Where we're untouchable"] },
      { type: "content", title: "Pricing & Packaging", kicker: "THE MONEY", contentLayoutHint: "pricing", bulletPoints: ["Their model: How rivals charge and anchor", "Our model: Where we sit and why", "The gap: What the price delta buys a customer"] },
      { type: "content", title: "Their Playbook", kicker: "PATTERNS", contentLayoutHint: "sequence", bulletPoints: ["Move 1: How they enter an account", "Move 2: How they expand and lock in", "Move 3: How they respond when threatened"] },
      { type: "content", title: "Our Counter-Strategy", kicker: "THE COUNTER", contentLayoutHint: "zigzag", bulletPoints: ["Where we fight: The segment we can win now", "Where we don't: Battles we deliberately skip", "The wedge: Our unfair advantage, weaponized"] },
      { type: "content", title: "Voices from the Field", kicker: "WIN / LOSS", contentLayoutHint: "quotes", bulletPoints: ["The most telling quote from a deal we won — and the most painful one from a deal we lost"] },
      { type: "content", title: "Battle Plan", kicker: "DO THIS", contentLayoutHint: "checklist", bulletPoints: ["Ship: The capability that closes the gap", "Arm: Battlecards and objection handling", "Watch: The signal that triggers plan B"] },
    ],
  ),
  t(
    "okr-planning",
    "OKR Planning",
    "Strategy",
    "From mission to measurable key results, with owners and a scoring rhythm.",
    [
      { type: "title", title: "[Team] OKRs", subtitle: "[Quarter, Year]" },
      { type: "content", title: "Why We Exist", kicker: "MISSION", contentLayoutHint: "spotlight", bulletPoints: ["The team's mission in one memorable sentence"] },
      { type: "content", title: "Strategy Context", kicker: "THE CASCADE", contentLayoutHint: "pyramid", bulletPoints: ["Company goal: What the business must achieve", "Our lever: How this team moves that goal", "This quarter: The slice we commit to now"] },
      { type: "content", title: "Objectives", kicker: "WHERE WE'RE GOING", contentLayoutHint: "boxes", bulletPoints: ["O1: Inspiring, qualitative, time-bound", "O2: Inspiring, qualitative, time-bound", "O3: The stretch objective we might miss"] },
      { type: "content", title: "Key Results", kicker: "HOW WE MEASURE", contentLayoutHint: "table", bulletPoints: ["O1-KR1: Metric, baseline → target", "O1-KR2: Metric, baseline → target", "O2-KR1: Metric, baseline → target", "O3-KR1: Metric, baseline → target"] },
      { type: "content", title: "Owners & Support", kicker: "WHO", contentLayoutHint: "team", bulletPoints: ["[Name]: Owns O1 — needs [support]", "[Name]: Owns O2 — needs [support]", "[Name]: Owns O3 — needs [support]"] },
      { type: "content", title: "The Rhythm", kicker: "CADENCE", contentLayoutHint: "cycle", bulletPoints: ["Weekly: Check-in — confidence scores", "Monthly: Deep dive — unblock the red KRs", "End of quarter: Score, learn, reset"] },
      { type: "content", title: "How We Score", kicker: "GRADING", contentLayoutHint: "definitionlist", bulletPoints: ["0.7+: Ambitious and achieved — the sweet spot", "1.0 every time: We're sandbagging", "Below 0.3: Wrong goal or wrong plan — discuss"] },
    ],
  ),

  // ─────────────────────────── Business ────────────────────────────
  t(
    "qbr",
    "Quarterly Business Review",
    "Business",
    "Results, learnings, and next-quarter plan for stakeholders.",
    [
      { type: "title", title: "Q[X] Business Review", subtitle: "[Team] — [Quarter, Year]" },
      { type: "content", title: "Agenda", kicker: "TODAY", contentLayoutHint: "agenda", bulletPoints: ["Results: The quarter in numbers", "Wins & misses: What worked and what didn't", "Plan: Priorities for next quarter"] },
      { type: "content", title: "The Quarter in Numbers", kicker: "RESULTS", contentLayoutHint: "dashboard", bulletPoints: ["Revenue: Actual vs target", "Customers: New and churned", "NPS: Trend vs last quarter"] },
      { type: "content", title: "Key Wins", kicker: "WINS", contentLayoutHint: "checklist", bulletPoints: ["Win 1: What happened and why it matters", "Win 2: What happened and why it matters", "Win 3: What happened and why it matters"] },
      { type: "content", title: "What Didn't Work", kicker: "LEARNINGS", contentLayoutHint: "editorial", bulletPoints: ["Miss 1: What we expected vs what happened", "Root cause: The honest diagnosis", "Change: What we'll do differently"] },
      { type: "content", title: "Customer Voice", kicker: "FEEDBACK", contentLayoutHint: "quotes", bulletPoints: ["The single most telling customer quote of the quarter — attribution"] },
      { type: "content", title: "Next Quarter Priorities", kicker: "THE PLAN", contentLayoutHint: "editorial", bulletPoints: ["Priority 1: Goal and success metric", "Priority 2: Goal and success metric", "Priority 3: Goal and success metric"] },
      { type: "content", title: "Risks & Asks", kicker: "SUPPORT NEEDED", contentLayoutHint: "proscons", bulletPoints: ["Risk: What could derail the plan", "Mitigation: How we reduce it", "Ask: What we need from leadership"] },
    ],
  ),
  t(
    "project-proposal",
    "Project Proposal",
    "Business",
    "Scope, timeline, budget — get the green light.",
    [
      { type: "title", title: "[Project Name] Proposal", subtitle: "Prepared for [Stakeholder]" },
      { type: "content", title: "Background & Objective", kicker: "CONTEXT", contentLayoutHint: "editorial", bulletPoints: ["Situation: Where we are today", "Problem: What's blocking progress", "Objective: The outcome this project delivers"] },
      { type: "content", title: "Proposed Approach", kicker: "THE PLAN", contentLayoutHint: "steps", bulletPoints: ["Phase 1: Discover — align on requirements", "Phase 2: Build — deliver the core scope", "Phase 3: Launch — roll out and measure"] },
      { type: "content", title: "Scope", kicker: "IN & OUT", contentLayoutHint: "comparison", bulletPoints: ["In scope: What we will deliver", "In scope: Key deliverable two", "Out of scope: What we deliberately exclude"] },
      { type: "content", title: "Timeline", kicker: "WHEN", contentLayoutHint: "timeline", bulletPoints: ["Week 1-2: Kickoff and discovery", "Week 3-6: Build and review cycles", "Week 7-8: Launch and handover"] },
      { type: "content", title: "Budget", kicker: "INVESTMENT", contentLayoutHint: "table", bulletPoints: ["Build: Core delivery cost", "Contingency: Buffer for unknowns", "Total: All-in investment"] },
      { type: "content", title: "Success Metrics", kicker: "MEASURING", contentLayoutHint: "dashboard", bulletPoints: ["Metric 1: Target and how we track it", "Metric 2: Target and how we track it", "Metric 3: Target and how we track it"] },
      { type: "content", title: "Decision & Next Steps", kicker: "APPROVAL", contentLayoutHint: "checklist", bulletPoints: ["Approve: Scope and budget sign-off", "Assign: Project sponsor and team", "Kick off: Target start date"] },
    ],
  ),

  // ─────────────────────────── Reporting ───────────────────────────
  t(
    "investor-update",
    "Monthly Investor Update",
    "Reporting",
    "The update investors actually read: TL;DR, metrics, honesty, asks.",
    [
      { type: "title", title: "[Company] Investor Update", subtitle: "[Month, Year]" },
      { type: "content", title: "TL;DR", kicker: "30 SECONDS", contentLayoutHint: "callout", bulletPoints: ["The month in three sentences: the headline number, the biggest win, the thing keeping us up at night"] },
      { type: "content", title: "Metrics That Matter", kicker: "SCOREBOARD", contentLayoutHint: "dashboard", bulletPoints: ["MRR: Number and month-over-month", "Burn: Net, and runway in months", "North star: The usage metric we live by", "Pipeline: What's coming"] },
      { type: "content", title: "Highlights", kicker: "WINS", contentLayoutHint: "checklist", bulletPoints: ["Shipped: The release customers noticed", "Signed: The logo or partnership", "Hired: The person who changes our ceiling"] },
      { type: "content", title: "Lowlights", kicker: "THE HONEST PART", contentLayoutHint: "editorial", bulletPoints: ["What went wrong: Said plainly", "Why: The real cause, not the comfortable one", "Fix: What we changed already"] },
      { type: "content", title: "Product Momentum", kicker: "SHIPPED & SHIPPING", contentLayoutHint: "timeline", bulletPoints: ["Last month: What went live", "This month: What's in flight", "Next: The bet after that"] },
      { type: "content", title: "How You Can Help", kicker: "ASKS", contentLayoutHint: "spotlight", bulletPoints: ["The one specific intro, hire, or door-open we need this month"] },
    ],
  ),
  t(
    "project-postmortem",
    "Post-mortem / Incident Review",
    "Reporting",
    "Blameless autopsy: timeline, five whys, and actions that stick.",
    [
      { type: "title", title: "Post-mortem: [Incident / Project]", subtitle: "Blameless review — [Date]" },
      { type: "content", title: "What Happened", kicker: "SUMMARY", contentLayoutHint: "editorial", bulletPoints: ["In one paragraph: What broke or missed, who was affected, how it ended", "Severity: The honest classification", "Detection: How we found out — and how we should have"] },
      { type: "content", title: "Timeline of Events", kicker: "MINUTE BY MINUTE", contentLayoutHint: "timeline", bulletPoints: ["T-0: First signal appears", "T+[x]: Escalation and response begins", "T+[y]: Mitigation lands", "T+[z]: Full resolution confirmed"] },
      { type: "content", title: "Impact", kicker: "THE COST", contentLayoutHint: "dashboard", bulletPoints: ["Users affected: Count and duration", "Revenue / SLA: What it cost", "Trust: Support tickets and sentiment"] },
      { type: "content", title: "Root Cause", kicker: "FIVE WHYS", contentLayoutHint: "funnel", bulletPoints: ["Why 1: The immediate trigger", "Why 2: The condition that allowed it", "Why 3: The process gap beneath that", "Root: The systemic cause we're actually fixing"] },
      { type: "content", title: "What Went Well / Badly", kicker: "RESPONSE REVIEW", contentLayoutHint: "proscons", bulletPoints: ["Well: What limited the damage", "Well: The heroics that shouldn't be needed", "Badly: Where response was slow or blind", "Badly: The runbook that didn't exist"] },
      { type: "content", title: "Action Items", kicker: "NEVER AGAIN", contentLayoutHint: "kanban", bulletPoints: ["Now: Fix with owner and date", "Next sprint: Prevention with owner", "This quarter: Systemic change with owner"] },
      { type: "content", title: "Lessons Learned", kicker: "TAKEAWAY", contentLayoutHint: "quotes", bulletPoints: ["The one-sentence lesson every team should remember from this incident"] },
    ],
  ),
  t(
    "all-hands",
    "Company All-Hands",
    "Reporting",
    "Monthly rally: numbers, wins, people, and one deep dive.",
    [
      { type: "title", title: "[Company] All-Hands", subtitle: "[Month, Year]" },
      { type: "content", title: "Welcome", kicker: "KICKOFF", contentLayoutHint: "spotlight", bulletPoints: ["The one-line theme of this month's all-hands"] },
      { type: "content", title: "The Month in Numbers", kicker: "SCOREBOARD", contentLayoutHint: "dashboard", bulletPoints: ["Revenue: Where we landed", "Customers: Growth and champions", "Product: Usage milestone", "Team: Headcount and new faces"] },
      { type: "content", title: "Wins Worth Celebrating", kicker: "HIGHLIGHTS", contentLayoutHint: "showcase", bulletPoints: ["Win 1: The story behind the number", "Win 2: The customer moment", "Win 3: The thing that almost didn't work"] },
      { type: "content", title: "Shoutouts", kicker: "PEOPLE", contentLayoutHint: "team", bulletPoints: ["[Name]: What they did and why it mattered", "[Name]: What they did and why it mattered", "[Name]: What they did and why it mattered"] },
      { type: "content", title: "Deep Dive", kicker: "SPOTLIGHT TOPIC", contentLayoutHint: "editorial", bulletPoints: ["Context: Why this topic, why now", "Inside view: How it actually works", "What's next: Where it goes from here"] },
      { type: "content", title: "What's Coming", kicker: "LOOK AHEAD", contentLayoutHint: "roadmap", bulletPoints: ["This month: The launch to watch", "Next month: The milestone we're driving to", "This quarter: The goal it all adds to"] },
      { type: "content", title: "Questions & Answers", kicker: "OPEN FLOOR", contentLayoutHint: "callout", bulletPoints: ["Ask anything — submitted questions first, then open mic"] },
    ],
  ),

  // ─────────────────────────── Product ─────────────────────────────
  t(
    "product-roadmap",
    "Product Roadmap Review",
    "Product",
    "Vision, Now-Next-Later, dependencies, and the tradeoffs behind them.",
    [
      { type: "title", title: "[Product] Roadmap", subtitle: "[Half / Year] — living document" },
      { type: "content", title: "Product Vision", kicker: "WHY", contentLayoutHint: "spotlight", bulletPoints: ["Where the product is going in one sentence a customer would repeat"] },
      { type: "content", title: "Strategic Themes", kicker: "THE PILLARS", contentLayoutHint: "boxes", bulletPoints: ["Theme 1: The customer problem it attacks", "Theme 2: The customer problem it attacks", "Theme 3: The bet on where the market goes"] },
      { type: "content", title: "Now — Next — Later", kicker: "THE BOARD", contentLayoutHint: "kanban", bulletPoints: ["Now: In build — shipping this cycle", "Next: Committed — starts when Now clears", "Later: Directional — sequenced, not promised"] },
      { type: "content", title: "Launch Timeline", kicker: "WHEN", contentLayoutHint: "timeline", bulletPoints: ["[Month]: Release and its headline capability", "[Month]: Release and its headline capability", "[Month]: The flagship moment"] },
      { type: "content", title: "Dependencies & Risks", kicker: "WATCH", contentLayoutHint: "matrix", bulletPoints: ["Dependency: Team/platform we're waiting on", "Risk: The estimate most likely to slip", "Constraint: The capacity ceiling", "Assumption: What we're betting is true"] },
      { type: "content", title: "What We're Not Doing", kicker: "TRADEOFFS", contentLayoutHint: "proscons", bulletPoints: ["Cut: Requested feature we're declining", "Because: The theme it would starve", "Deferred: Good idea, wrong quarter", "Because: The dependency it needs first"] },
      { type: "content", title: "How We Decide", kicker: "PRINCIPLES", contentLayoutHint: "definitionlist", bulletPoints: ["Evidence first: Usage and revenue beat opinions", "Sequenced: Platform before features that need it", "Reversible: Prefer bets we can undo"] },
    ],
  ),
  t(
    "user-research-readout",
    "User Research Readout",
    "Product",
    "From questions to verbatims to an opportunity map the team can act on.",
    [
      { type: "title", title: "[Study] Research Readout", subtitle: "[n] participants — [Date range]" },
      { type: "content", title: "What We Asked", kicker: "QUESTIONS", contentLayoutHint: "agenda", bulletPoints: ["Q1: The behavior we needed to understand", "Q2: The assumption we needed to test", "Q3: The decision this research unblocks"] },
      { type: "content", title: "How We Studied It", kicker: "METHOD", contentLayoutHint: "steps", bulletPoints: ["Recruit: Who qualified and why", "Sessions: Format and duration", "Synthesis: How we coded the data"] },
      { type: "content", title: "Who We Met", kicker: "PARTICIPANTS", contentLayoutHint: "team", bulletPoints: ["[Persona A]: Count — defining trait", "[Persona B]: Count — defining trait", "[Persona C]: Count — the surprise segment"] },
      { type: "content", title: "Key Findings", kicker: "WHAT WE LEARNED", contentLayoutHint: "cascading", bulletPoints: ["Finding 1: The headline insight — seen in [x] of [n]", "Finding 2: The workflow breakdown nobody reported", "Finding 3: The delight moment worth amplifying", "Finding 4: The assumption we can now retire"] },
      { type: "content", title: "In Their Words", kicker: "VERBATIMS", contentLayoutHint: "quotes", bulletPoints: ["The single quote that captures the core finding — [Participant, role]"] },
      { type: "content", title: "Opportunity Map", kicker: "SO WHAT", contentLayoutHint: "matrix", bulletPoints: ["High impact / low effort: Do immediately", "High impact / high effort: Plan properly", "Low impact: Log and move on", "Needs evidence: The follow-up study"] },
      { type: "content", title: "Recommendations", kicker: "DO THIS", contentLayoutHint: "checklist", bulletPoints: ["Fix: The breakdown, with owning team", "Test: The concept the findings suggest", "Share: Who else needs this readout"] },
    ],
  ),
  t(
    "sprint-retro",
    "Sprint Retrospective",
    "Product",
    "Honest look back, root causes, kudos, and experiments for next sprint.",
    [
      { type: "title", title: "Sprint [N] Retrospective", subtitle: "[Team] — [Date range]" },
      { type: "content", title: "The Sprint in Numbers", kicker: "SCOREBOARD", contentLayoutHint: "dashboard", bulletPoints: ["Committed vs done: Points and percentage", "Carryover: What rolled and why", "Bugs: Found vs fixed"] },
      { type: "content", title: "What We Shipped", kicker: "DELIVERED", contentLayoutHint: "checklist", bulletPoints: ["Shipped: Feature and its user impact", "Shipped: The fix customers noticed", "Shipped: The invisible-but-vital platform work"] },
      { type: "content", title: "Well vs Not Well", kicker: "THE HONEST BOARD", contentLayoutHint: "proscons", bulletPoints: ["Well: The practice to keep", "Well: The collaboration highlight", "Not well: The recurring friction", "Not well: The surprise that cost us days"] },
      { type: "content", title: "Root Cause", kicker: "DIG DEEPER", contentLayoutHint: "funnel", bulletPoints: ["Symptom: The visible problem", "Beneath it: The process gap", "Root: The thing we'll actually change"] },
      { type: "content", title: "Kudos", kicker: "APPRECIATION", contentLayoutHint: "spotlight", bulletPoints: ["[Name] — for the moment that saved the sprint"] },
      { type: "content", title: "Experiments for Next Sprint", kicker: "TRY", contentLayoutHint: "kanban", bulletPoints: ["Start: New practice, with success signal", "Stop: The habit we're dropping", "Continue: What's working — protect it"] },
    ],
  ),
  t(
    "feature-brief",
    "Feature Brief (PRD)",
    "Product",
    "Problem, evidence, scope, flow, and how we'll know it worked.",
    [
      { type: "title", title: "[Feature] Brief", subtitle: "Owner: [Name] — Status: [Draft]" },
      { type: "content", title: "The Problem", kicker: "WHY BUILD THIS", contentLayoutHint: "editorial", bulletPoints: ["User pain: Who hits it and how often", "Business cost: Churn, tickets, or lost deals", "Today's workaround: Why it isn't enough"] },
      { type: "content", title: "The Evidence", kicker: "PROOF", contentLayoutHint: "quotes", bulletPoints: ["The customer quote that makes the problem impossible to ignore — plus the data point that backs it"] },
      { type: "content", title: "Goals & Non-Goals", kicker: "SCOPE", contentLayoutHint: "comparison", bulletPoints: ["Goal: The outcome v1 must deliver", "Goal: The quality bar it must clear", "Non-goal: Explicitly out of v1", "Non-goal: The adjacent problem we're not solving"] },
      { type: "content", title: "The User Flow", kicker: "HOW IT WORKS", contentLayoutHint: "sequence", bulletPoints: ["Entry: Where users discover it", "Core: The main interaction, step by step", "Success: What the user sees when it works", "Edge: What happens when it doesn't"] },
      { type: "content", title: "Requirements", kicker: "MUST / SHOULD", contentLayoutHint: "definitionlist", bulletPoints: ["Must: Non-negotiable for launch", "Should: Important, can follow fast", "Could: Delighters if time allows"] },
      { type: "content", title: "Success Metrics", kicker: "MEASURING", contentLayoutHint: "dashboard", bulletPoints: ["Adoption: Target within 30 days", "Impact: The metric it should move", "Guardrail: What must not regress"] },
      { type: "content", title: "Launch Plan", kicker: "ROLLOUT", contentLayoutHint: "timeline", bulletPoints: ["Alpha: Internal dogfood and bar to pass", "Beta: Cohort and feedback loop", "GA: Announcement and enablement"] },
    ],
  ),

  // ─────────────────────────── Marketing ───────────────────────────
  t(
    "product-launch",
    "Product Launch Plan",
    "Marketing",
    "Positioning, channels, and launch-week orchestration.",
    [
      { type: "title", title: "[Product] Launch Plan", subtitle: "Go-to-market — [Date]" },
      { type: "content", title: "Positioning", kicker: "THE STORY", contentLayoutHint: "editorial", bulletPoints: ["For: The exact audience", "Who: The pain they feel", "Unlike: The alternative and our difference"] },
      { type: "content", title: "Audience Segments", kicker: "WHO", contentLayoutHint: "orbit", bulletPoints: ["Early adopters: First to try", "Core users: The volume segment", "Champions: Who amplifies the message"] },
      { type: "content", title: "Channel Mix", kicker: "WHERE", contentLayoutHint: "icongrid", bulletPoints: ["Owned: Site, email, in-product", "Earned: Press, community, reviews", "Paid: The one channel we'll fund"] },
      { type: "content", title: "Launch Timeline", kicker: "WHEN", contentLayoutHint: "roadmap", bulletPoints: ["T-2 weeks: Teasers and press briefings", "Launch day: Coordinated announcements", "T+2 weeks: Momentum and case studies"] },
      { type: "content", title: "Success Metrics", kicker: "TARGETS", contentLayoutHint: "dashboard", bulletPoints: ["Signups: Week-one target", "Activation: First-value rate", "Coverage: Press and social mentions"] },
      { type: "content", title: "Risks & Contingencies", kicker: "IF-THEN", contentLayoutHint: "proscons", bulletPoints: ["Risk: Low day-one traction", "Contingency: The backup lever we pull", "Owner: Who makes the call"] },
    ],
  ),
  t(
    "marketing-plan",
    "Marketing Plan",
    "Marketing",
    "Goals, audience, channels, budget, and measurement.",
    [
      { type: "title", title: "[Year] Marketing Plan", subtitle: "[Company / Product]" },
      { type: "content", title: "Goals", kicker: "TARGETS", contentLayoutHint: "dashboard", bulletPoints: ["Pipeline: Target and current baseline", "Brand: Awareness metric to move", "Efficiency: CAC or ROI target"] },
      { type: "content", title: "Audience & Insight", kicker: "WHO", contentLayoutHint: "editorial", bulletPoints: ["Segment: The buyer who matters most", "Insight: What they believe that others miss", "Message: The one thing they must remember"] },
      { type: "content", title: "Strategy Pillars", kicker: "HOW", contentLayoutHint: "boxes", bulletPoints: ["Pillar 1: Theme and flagship activity", "Pillar 2: Theme and flagship activity", "Pillar 3: Theme and flagship activity"] },
      { type: "content", title: "Channel Plan", kicker: "WHERE", contentLayoutHint: "icongrid", bulletPoints: ["Content: Cadence and owner", "Social: Platforms and voice", "Events: The two that matter", "Paid: Budget and target CPA"] },
      { type: "content", title: "Calendar", kicker: "WHEN", contentLayoutHint: "timeline", bulletPoints: ["Q1: Foundation and first campaign", "Q2: Flagship launch moment", "Q3-Q4: Scale what worked"] },
      { type: "content", title: "Budget Split", kicker: "INVESTMENT", contentLayoutHint: "table", bulletPoints: ["People: Team and freelance", "Programs: Campaigns and content", "Tools: Stack and data"] },
      { type: "content", title: "Measurement", kicker: "PROOF", contentLayoutHint: "dashboard", bulletPoints: ["Weekly: The dashboard we watch", "Monthly: The report we send", "Quarterly: The decision we revisit"] },
    ],
  ),
  t(
    "brand-guidelines",
    "Brand Guidelines",
    "Marketing",
    "Story, voice, messaging house, and the do/don't rules that keep it sharp.",
    [
      { type: "title", title: "[Brand] Guidelines", subtitle: "How we look, sound, and behave" },
      { type: "content", title: "The Brand Story", kicker: "ORIGIN", contentLayoutHint: "editorial", bulletPoints: ["Why we exist: The founding conviction", "Who it's for: The person we champion", "The enemy: What we stand against"] },
      { type: "content", title: "Brand Personality", kicker: "CHARACTER", contentLayoutHint: "circles", bulletPoints: ["Trait 1: What it means in practice", "Trait 2: What it means in practice", "Trait 3: The trait we deliberately avoid"] },
      { type: "content", title: "Voice: Do & Don't", kicker: "HOW WE SOUND", contentLayoutHint: "proscons", bulletPoints: ["Do: Write like this — with an example", "Do: The rhythm and confidence we keep", "Don't: The jargon we ban", "Don't: The tone that isn't us"] },
      { type: "content", title: "Messaging House", kicker: "WHAT WE SAY", contentLayoutHint: "pyramid", bulletPoints: ["Roof: The one-line brand promise", "Pillars: Three proof-backed messages", "Foundation: Evidence, numbers, stories"] },
      { type: "content", title: "The Visual World", kicker: "HOW WE LOOK", contentLayoutHint: "images", bulletPoints: ["Photography: The mood and subjects we choose", "Color & type: How the system flexes", "Composition: The signature layout moves"] },
      { type: "content", title: "In the Wild", kicker: "APPLICATIONS", contentLayoutHint: "icongrid", bulletPoints: ["Product: Where brand meets UI", "Social: The formats and cadence", "Decks & docs: Templates everyone uses", "Swag & events: The physical brand"] },
      { type: "content", title: "Guardianship", kicker: "KEEPING IT SHARP", contentLayoutHint: "checklist", bulletPoints: ["Ask: Who approves new applications", "Kit: Where to find logos and templates", "Review: The quarterly brand audit"] },
    ],
  ),

  // ───────────────────────────── Sales ─────────────────────────────
  t(
    "case-study",
    "Customer Case Study",
    "Sales",
    "Challenge → solution → measurable results.",
    [
      { type: "title", title: "[Customer] × [Company]", subtitle: "A customer success story" },
      { type: "content", title: "About the Customer", kicker: "WHO", contentLayoutHint: "editorial", bulletPoints: ["Company: Size, industry, market", "Team: Who used the product", "Stakes: What they had to get right"] },
      { type: "content", title: "The Challenge", kicker: "BEFORE", contentLayoutHint: "bullets", bulletPoints: ["Pain: The daily struggle in their words", "Impact: What it cost them", "Trigger: Why they finally acted"] },
      { type: "content", title: "The Solution", kicker: "THE CHANGE", contentLayoutHint: "steps", bulletPoints: ["Rollout: How adoption actually went", "Key feature: What clicked for the team", "Timeline: Idea to full adoption"] },
      { type: "content", title: "The Results", kicker: "AFTER", contentLayoutHint: "beforeafter", bulletPoints: ["Metric: Before → after", "Metric: Before → after", "Time saved: Hours per week returned"] },
      { type: "content", title: "In Their Words", kicker: "QUOTE", contentLayoutHint: "quotes", bulletPoints: ["The single strongest customer quote about the transformation — Name, Title"] },
      { type: "content", title: "Key Takeaways", kicker: "LESSONS", contentLayoutHint: "checklist", bulletPoints: ["Takeaway 1: What made it work", "Takeaway 2: What surprised everyone", "Takeaway 3: Advice for similar teams"] },
    ],
  ),
  t(
    "sales-kickoff",
    "Sales Kickoff",
    "Sales",
    "Rally the team: results, strategy, and targets.",
    [
      { type: "title", title: "[Year] Sales Kickoff", subtitle: "Let's go" },
      { type: "content", title: "Last Year in Review", kicker: "RESULTS", contentLayoutHint: "dashboard", bulletPoints: ["Bookings: Final vs plan", "Best win: The deal that defined us", "Team: Who crushed it"] },
      { type: "content", title: "What We Learned", kicker: "LESSONS", contentLayoutHint: "editorial", bulletPoints: ["Worked: The play to double down on", "Didn't: The habit we're dropping", "Surprise: What the market told us"] },
      { type: "content", title: "This Year's Strategy", kicker: "THE PLAN", contentLayoutHint: "orbit", bulletPoints: ["Focus: The segment we win first", "Motion: How we sell differently", "Expansion: Where growth compounds"] },
      { type: "content", title: "Targets", kicker: "NUMBERS", contentLayoutHint: "dashboard", bulletPoints: ["Team quota: The headline number", "Per rep: What great looks like", "Logos: New accounts to land"] },
      { type: "content", title: "New Tools & Enablement", kicker: "SUPPORT", contentLayoutHint: "icongrid", bulletPoints: ["Playbooks: What's new in the library", "Tooling: The stack upgrade", "Training: Sessions on the calendar"] },
      { type: "content", title: "Incentives", kicker: "REWARDS", contentLayoutHint: "checklist", bulletPoints: ["Accelerators: How overachievement pays", "President's club: The trip and the bar", "Spiffs: Quarterly bonus plays"] },
      { type: "content", title: "One Team", kicker: "TOGETHER", contentLayoutHint: "spotlight", bulletPoints: ["The single rally cry for the year"] },
    ],
  ),

  // ───────────────────────────── People ────────────────────────────
  t(
    "team-onboarding",
    "New Hire Onboarding",
    "People",
    "Everything a new teammate needs in week one.",
    [
      { type: "title", title: "Welcome to [Team]", subtitle: "Your first 30 days" },
      { type: "content", title: "Who We Are", kicker: "THE TEAM", contentLayoutHint: "team", bulletPoints: ["Name: Role — what to ask them about", "Name: Role — what to ask them about", "Name: Role — what to ask them about"] },
      { type: "content", title: "What We Do", kicker: "MISSION", contentLayoutHint: "showcase", bulletPoints: ["Mission: Why the team exists", "Customers: Who we serve", "Now: The current top priority"] },
      { type: "content", title: "Your First Week", kicker: "WEEK 1", contentLayoutHint: "checklist", bulletPoints: ["Day 1: Accounts, tools, and buddy intro", "Day 2-3: Shadow the core workflow", "Day 4-5: Ship something tiny"] },
      { type: "content", title: "30-60-90 Plan", kicker: "RAMP", contentLayoutHint: "orbit", bulletPoints: ["30 days: Learn — context and relationships", "60 days: Contribute — own a small area", "90 days: Lead — drive an initiative"] },
      { type: "content", title: "How We Work", kicker: "RITUALS", contentLayoutHint: "definitionlist", bulletPoints: ["Standup: Daily 10-minute sync", "Review: How work gets feedback", "Retro: How we improve every sprint"] },
      { type: "content", title: "Who to Ask", kicker: "HELP", contentLayoutHint: "editorial", bulletPoints: ["Tools & access: [Name/channel]", "Process questions: [Name/channel]", "Anything else: Your onboarding buddy"] },
    ],
  ),

  // ──────────────────────────── Creative ───────────────────────────
  t(
    "conference-keynote",
    "Conference Keynote",
    "Creative",
    "A story-arc talk: hook, old world, the shift, the reveal, the future.",
    [
      { type: "title", title: "[The Big Idea]", subtitle: "[Conference] — [Speaker]" },
      { type: "content", title: "The Hook", kicker: "COLD OPEN", contentLayoutHint: "spotlight", bulletPoints: ["The startling fact, story, or question that earns the next 20 minutes"] },
      { type: "content", title: "The World as It Is", kicker: "STATUS QUO", contentLayoutHint: "editorial", bulletPoints: ["The accepted way: How everyone does it today", "The hidden cost: What we've stopped noticing", "The tension: Why this can't hold"] },
      { type: "content", title: "The Turning Point", kicker: "THE SHIFT", contentLayoutHint: "zigzag", bulletPoints: ["Signal 1: The early evidence of change", "Signal 2: The technology or behavior tipping it", "Signal 3: The moment it became inevitable"] },
      { type: "content", title: "The Reveal", kicker: "ENTER THE NEW", contentLayoutHint: "showcase", bulletPoints: ["What it is: Show, don't tell", "What it changes: The before/after for a real person", "Why it wins: The principle underneath"] },
      { type: "content", title: "How It Works", kicker: "UNDER THE HOOD", contentLayoutHint: "hubspoke", bulletPoints: ["Core: The engine at the center", "Spoke: The capability it powers", "Spoke: The capability it powers", "Spoke: The ecosystem around it"] },
      { type: "content", title: "The Proof", kicker: "RECEIPTS", contentLayoutHint: "dashboard", bulletPoints: ["Result: The number that silences skeptics", "Scale: Who's already living in the new world", "Momentum: The curve, not the point"] },
      { type: "content", title: "The World as It Could Be", kicker: "THE VISION", contentLayoutHint: "images", bulletPoints: ["Paint the picture: A day in the transformed future, made concrete"] },
      { type: "content", title: "Your Move", kicker: "CALL TO ACTION", contentLayoutHint: "callout", bulletPoints: ["The one thing the audience should do before they leave the room"] },
    ],
  ),
  t(
    "idea-talk",
    "TED-style Idea Talk",
    "Creative",
    "One idea worth spreading: story, surprise, reframe, takeaway.",
    [
      { type: "title", title: "[The Idea in Eight Words]", subtitle: "A talk by [Speaker]" },
      { type: "content", title: "The Question", kicker: "OPEN", contentLayoutHint: "spotlight", bulletPoints: ["The question the audience has never thought to ask — until now"] },
      { type: "content", title: "A Story", kicker: "PERSONAL", contentLayoutHint: "editorial", bulletPoints: ["The moment: Where this idea found you", "The struggle: What it cost to see it", "The click: When it all made sense"] },
      { type: "content", title: "The Surprise", kicker: "PLOT TWIST", contentLayoutHint: "beforeafter", bulletPoints: ["What we assumed: The intuitive belief", "What's true: The evidence that flips it", "The gap: Why we got it so wrong"] },
      { type: "content", title: "The Idea", kicker: "THE HEART", contentLayoutHint: "callout", bulletPoints: ["The idea, stated once, plainly, in a sentence the audience will repeat tomorrow"] },
      { type: "content", title: "What It Touches", kicker: "RIPPLES", contentLayoutHint: "circles", bulletPoints: ["For individuals: How daily life shifts", "For teams: How work reorganizes", "For the field: The doctrine it rewrites"] },
      { type: "content", title: "The Skeptics", kicker: "FAIR PUSHBACK", contentLayoutHint: "proscons", bulletPoints: ["Objection: The strongest counter-argument", "Answer: The honest response", "Limit: Where the idea genuinely stops"] },
      { type: "content", title: "The Takeaway", kicker: "CLOSE", contentLayoutHint: "quotes", bulletPoints: ["Return to the opening question — answered in one unforgettable line"] },
    ],
  ),
  t(
    "portfolio",
    "Portfolio & Case Work",
    "Creative",
    "Selected work, process, capabilities, praise — built to win the next brief.",
    [
      { type: "title", title: "[Name / Studio]", subtitle: "Selected work — [Year]" },
      { type: "content", title: "Hello", kicker: "INTRO", contentLayoutHint: "spotlight", bulletPoints: ["Who you are and the kind of problems you love, in two sentences"] },
      { type: "content", title: "Selected Work", kicker: "THE WORK", contentLayoutHint: "images", bulletPoints: ["[Project 1]: Client — one-line outcome", "[Project 2]: Client — one-line outcome", "[Project 3]: Client — one-line outcome", "[Project 4]: Client — one-line outcome"] },
      { type: "content", title: "Case: [Flagship Project]", kicker: "DEEP DIVE", contentLayoutHint: "beforeafter", bulletPoints: ["The brief: What the client needed", "The move: The creative leap we made", "The result: What changed, in numbers"] },
      { type: "content", title: "How I Work", kicker: "PROCESS", contentLayoutHint: "cycle", bulletPoints: ["Discover: Questions before pixels", "Make: Prototypes over presentations", "Refine: Critique and iteration", "Ship: And measure what happens"] },
      { type: "content", title: "Capabilities", kicker: "TOOLKIT", contentLayoutHint: "icongrid", bulletPoints: ["Discipline 1: Depth and years", "Discipline 2: Depth and years", "Discipline 3: Depth and years", "Discipline 4: The rare combination"] },
      { type: "content", title: "Kind Words", kicker: "PRAISE", contentLayoutHint: "quotes", bulletPoints: ["The client quote that says what you can't say about yourself — Name, Company"] },
      { type: "content", title: "Let's Talk", kicker: "CONTACT", contentLayoutHint: "callout", bulletPoints: ["Availability, email, and the kind of project you're looking for next"] },
    ],
  ),
  t(
    "agency-pitch",
    "Agency Creative Pitch",
    "Creative",
    "Insight → big idea → three routes → rollout → chemistry → investment.",
    [
      { type: "title", title: "[Brand] × [Agency]", subtitle: "Creative response — [Date]" },
      { type: "content", title: "The Brief, As We Heard It", kicker: "PLAYBACK", contentLayoutHint: "editorial", bulletPoints: ["The task: What you asked for", "The real problem: What we think you need", "Success: What we'd both toast to in a year"] },
      { type: "content", title: "The Insight", kicker: "THE SPARK", contentLayoutHint: "callout", bulletPoints: ["The human truth about your audience that unlocks everything that follows"] },
      { type: "content", title: "The Big Idea", kicker: "THE IDEA", contentLayoutHint: "spotlight", bulletPoints: ["The organizing creative thought — in a line short enough for a billboard"] },
      { type: "content", title: "Three Ways In", kicker: "THE ROUTES", contentLayoutHint: "bento", bulletPoints: ["Route A: The brave version", "Route B: The scalable version", "Route C: The unexpected version", "Our pick: And why"] },
      { type: "content", title: "The Campaign World", kicker: "ROLLOUT", contentLayoutHint: "roadmap", bulletPoints: ["Tease: How we earn attention", "Launch: The hero moment", "Sustain: How it lives for months, not days"] },
      { type: "content", title: "We've Done This Before", kicker: "PROOF", contentLayoutHint: "showcase", bulletPoints: ["[Case 1]: Brand — result in one number", "[Case 2]: Brand — result in one number", "[Case 3]: The award that matters"] },
      { type: "content", title: "Your Team", kicker: "CHEMISTRY", contentLayoutHint: "team", bulletPoints: ["[Name]: Creative lead — superpower", "[Name]: Strategy — superpower", "[Name]: Delivery — superpower"] },
      { type: "content", title: "Investment", kicker: "THE NUMBERS", contentLayoutHint: "pricing", bulletPoints: ["Phase 1: Scope and fee", "Phase 2: Scope and fee", "Options: Where we can flex"] },
    ],
  ),

  // ─────────────────────────── Education ───────────────────────────
  t(
    "workshop",
    "Interactive Workshop",
    "Education",
    "Objectives, framework, guided exercise, ideas board, and homework.",
    [
      { type: "title", title: "[Workshop Title]", subtitle: "[Facilitator] — [Duration]" },
      { type: "content", title: "What You'll Leave With", kicker: "OBJECTIVES", contentLayoutHint: "checklist", bulletPoints: ["Skill: What you'll be able to do", "Artifact: What you'll have built", "Plan: What you'll do next week"] },
      { type: "content", title: "Warm-up", kicker: "ICEBREAKER", contentLayoutHint: "callout", bulletPoints: ["The 5-minute prompt that gets every voice in the room within the first ten minutes"] },
      { type: "content", title: "The Framework", kicker: "CORE MODEL", contentLayoutHint: "pyramid", bulletPoints: ["Principle: The foundation everything rests on", "Practice: The method built on it", "Mastery: What expert application looks like"] },
      { type: "content", title: "Guided Exercise", kicker: "HANDS ON", contentLayoutHint: "steps", bulletPoints: ["Step 1: Solo — apply the model to your case", "Step 2: Pairs — trade and critique", "Step 3: Group — the patterns we found"] },
      { type: "content", title: "Ideas Board", kicker: "DIVERGE & CONVERGE", contentLayoutHint: "kanban", bulletPoints: ["Collect: Every idea, no filtering", "Cluster: Group by theme", "Commit: Each person picks one to pursue"] },
      { type: "content", title: "Key Takeaways", kicker: "RECAP", contentLayoutHint: "agenda", bulletPoints: ["Takeaway 1: The core model in one line", "Takeaway 2: The mistake to avoid", "Takeaway 3: The habit to start"] },
      { type: "content", title: "Your Homework", kicker: "NEXT 7 DAYS", contentLayoutHint: "spotlight", bulletPoints: ["The single small action to complete before we meet again"] },
    ],
  ),
  t(
    "masterclass-lecture",
    "Masterclass Lecture",
    "Education",
    "A teaching arc: big question, concepts, worked example, misconceptions.",
    [
      { type: "title", title: "[Subject]: [The Provocative Question]", subtitle: "[Course / Series] — Session [N]" },
      { type: "content", title: "Today's Question", kicker: "THE HOOK", contentLayoutHint: "spotlight", bulletPoints: ["The question this session answers — and why it's harder than it looks"] },
      { type: "content", title: "How We Got Here", kicker: "CONTEXT", contentLayoutHint: "timeline", bulletPoints: ["Origin: Where the field started", "Breakthrough: The discovery that changed it", "Today: The frontier we're standing on"] },
      { type: "content", title: "Core Concepts", kicker: "VOCABULARY", contentLayoutHint: "definitionlist", bulletPoints: ["Concept 1: Definition in plain words", "Concept 2: Definition in plain words", "Concept 3: How they connect"] },
      { type: "content", title: "Worked Example", kicker: "WATCH IT DONE", contentLayoutHint: "steps", bulletPoints: ["Setup: The problem, stated precisely", "Method: Each move, with the reasoning aloud", "Answer: And how to sanity-check it"] },
      { type: "content", title: "Where Everyone Goes Wrong", kicker: "MISCONCEPTIONS", contentLayoutHint: "proscons", bulletPoints: ["Myth: The intuitive-but-wrong belief", "Reality: What's actually true", "Tell: How to catch yourself doing it"] },
      { type: "content", title: "Now You Try", kicker: "PRACTICE", contentLayoutHint: "chevron", bulletPoints: ["Warm-up: The confidence builder", "Challenge: The one with the twist", "Stretch: For those who finish early"] },
      { type: "content", title: "Summary & Further Study", kicker: "CLOSE", contentLayoutHint: "checklist", bulletPoints: ["Remember: The one-sentence answer to today's question", "Read: The two sources that go deeper", "Next session: The question we tackle next"] },
    ],
  ),
];

export function getCuratedTemplate(id: string): CuratedTemplate | undefined {
  return CURATED_TEMPLATES.find((tpl) => tpl.id === id);
}
