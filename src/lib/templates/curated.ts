/**
 * Curated starting templates — structure-only deck skeletons (no colors; the
 * user's chosen theme or brand kit styles them). Each "Use template" creates
 * an Outline the normal generation flow expands, so every template benefits
 * from smart layouts, images, and premium components.
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
  t(
    "pitch-deck",
    "Startup Pitch Deck",
    "Pitch",
    "The classic 10-slide investor narrative: problem → solution → market → ask.",
    [
      { type: "title", title: "[Company] — [One-line promise]", subtitle: "Pre-seed pitch" },
      { type: "content", title: "The Problem", kicker: "THE PROBLEM", contentLayoutHint: "editorial", bulletPoints: ["Pain point: Who hurts and how badly", "Current fix: Why today's workaround fails", "Cost: What staying broken costs per year"] },
      { type: "content", title: "Our Solution", kicker: "THE FIX", contentLayoutHint: "showcase", bulletPoints: ["What it is: The product in one sentence", "How it works: The magic in three steps", "Why now: The shift that makes this possible"] },
      { type: "content", title: "Market Opportunity", kicker: "BY THE NUMBERS", contentLayoutHint: "numbers", bulletPoints: ["TAM: Total addressable market size", "SAM: The slice we can serve today", "Growth: Why this market is expanding"] },
      { type: "content", title: "How It Works", kicker: "PRODUCT", contentLayoutHint: "steps", bulletPoints: ["Step 1: User onboards in minutes", "Step 2: The core loop delivers value", "Step 3: Results compound over time"] },
      { type: "content", title: "Competitive Landscape", kicker: "OUR EDGE", contentLayoutHint: "comparison", bulletPoints: ["Them: How incumbents approach it", "Us: What we do fundamentally differently", "Moat: Why this stays defensible"] },
      { type: "content", title: "Traction", kicker: "PROOF", contentLayoutHint: "dashboard", bulletPoints: ["Users: Growth since launch", "Revenue: MRR and trajectory", "Retention: The number that matters most"] },
      { type: "content", title: "The Team", kicker: "WHO WE ARE", contentLayoutHint: "team", bulletPoints: ["Founder: Name — relevant superpower", "Founder: Name — relevant superpower", "Advisor: Name — unfair advantage"] },
      { type: "content", title: "The Ask", kicker: "THE ASK", contentLayoutHint: "editorial", bulletPoints: ["Raising: Amount and instrument", "Use of funds: Where every dollar goes", "Milestones: What this round unlocks"] },
      { type: "content", title: "Thank You", kicker: "NEXT STEPS", contentLayoutHint: "spotlight", bulletPoints: ["Let's build the future together — [contact]"] },
    ],
  ),
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
      { type: "content", title: "Success Metrics", kicker: "MEASURING", contentLayoutHint: "numbers", bulletPoints: ["Metric 1: Target and how we track it", "Metric 2: Target and how we track it", "Metric 3: Target and how we track it"] },
      { type: "content", title: "Decision & Next Steps", kicker: "APPROVAL", contentLayoutHint: "checklist", bulletPoints: ["Approve: Scope and budget sign-off", "Assign: Project sponsor and team", "Kick off: Target start date"] },
    ],
  ),
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
      { type: "content", title: "The Results", kicker: "AFTER", contentLayoutHint: "numbers", bulletPoints: ["Metric: Before → after", "Metric: Before → after", "Time saved: Hours per week returned"] },
      { type: "content", title: "In Their Words", kicker: "QUOTE", contentLayoutHint: "quotes", bulletPoints: ["The single strongest customer quote about the transformation — Name, Title"] },
      { type: "content", title: "Key Takeaways", kicker: "LESSONS", contentLayoutHint: "checklist", bulletPoints: ["Takeaway 1: What made it work", "Takeaway 2: What surprised everyone", "Takeaway 3: Advice for similar teams"] },
    ],
  ),
  t(
    "marketing-plan",
    "Marketing Plan",
    "Marketing",
    "Goals, audience, channels, budget, and measurement.",
    [
      { type: "title", title: "[Year] Marketing Plan", subtitle: "[Company / Product]" },
      { type: "content", title: "Goals", kicker: "TARGETS", contentLayoutHint: "numbers", bulletPoints: ["Pipeline: Target and current baseline", "Brand: Awareness metric to move", "Efficiency: CAC or ROI target"] },
      { type: "content", title: "Audience & Insight", kicker: "WHO", contentLayoutHint: "editorial", bulletPoints: ["Segment: The buyer who matters most", "Insight: What they believe that others miss", "Message: The one thing they must remember"] },
      { type: "content", title: "Strategy Pillars", kicker: "HOW", contentLayoutHint: "boxes", bulletPoints: ["Pillar 1: Theme and flagship activity", "Pillar 2: Theme and flagship activity", "Pillar 3: Theme and flagship activity"] },
      { type: "content", title: "Channel Plan", kicker: "WHERE", contentLayoutHint: "icongrid", bulletPoints: ["Content: Cadence and owner", "Social: Platforms and voice", "Events: The two that matter", "Paid: Budget and target CPA"] },
      { type: "content", title: "Calendar", kicker: "WHEN", contentLayoutHint: "timeline", bulletPoints: ["Q1: Foundation and first campaign", "Q2: Flagship launch moment", "Q3-Q4: Scale what worked"] },
      { type: "content", title: "Budget Split", kicker: "INVESTMENT", contentLayoutHint: "table", bulletPoints: ["People: Team and freelance", "Programs: Campaigns and content", "Tools: Stack and data"] },
      { type: "content", title: "Measurement", kicker: "PROOF", contentLayoutHint: "dashboard", bulletPoints: ["Weekly: The dashboard we watch", "Monthly: The report we send", "Quarterly: The decision we revisit"] },
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
      { type: "content", title: "Targets", kicker: "NUMBERS", contentLayoutHint: "numbers", bulletPoints: ["Team quota: The headline number", "Per rep: What great looks like", "Logos: New accounts to land"] },
      { type: "content", title: "New Tools & Enablement", kicker: "SUPPORT", contentLayoutHint: "icongrid", bulletPoints: ["Playbooks: What's new in the library", "Tooling: The stack upgrade", "Training: Sessions on the calendar"] },
      { type: "content", title: "Incentives", kicker: "REWARDS", contentLayoutHint: "checklist", bulletPoints: ["Accelerators: How overachievement pays", "President's club: The trip and the bar", "Spiffs: Quarterly bonus plays"] },
      { type: "content", title: "One Team", kicker: "TOGETHER", contentLayoutHint: "spotlight", bulletPoints: ["The single rally cry for the year"] },
    ],
  ),
];

export function getCuratedTemplate(id: string): CuratedTemplate | undefined {
  return CURATED_TEMPLATES.find((tpl) => tpl.id === id);
}
