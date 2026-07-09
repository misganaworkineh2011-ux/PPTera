import { describe, it, expect } from "vitest";
import {
  bulletToSection,
  bulletsToSections,
  sectionsToBullets,
  normalizeSections,
} from "../section-utils";

describe("bulletToSection", () => {
  it("splits the em-dash convention", () => {
    expect(bulletToSection("Fast onboarding — New users ship in under a day")).toEqual({
      heading: "Fast onboarding",
      description: "New users ship in under a day",
    });
  });

  it("splits en dash and spaced hyphen", () => {
    expect(bulletToSection("Growth – 3x year over year")).toEqual({
      heading: "Growth",
      description: "3x year over year",
    });
    expect(bulletToSection("Security - SOC2 and SSO included")).toEqual({
      heading: "Security",
      description: "SOC2 and SSO included",
    });
  });

  it("never splits hyphenated words", () => {
    expect(bulletToSection("Real-time analytics power the dashboard")).toEqual({
      heading: "",
      description: "Real-time analytics power the dashboard",
    });
  });

  it("splits 'Label: text' on a colon near the start", () => {
    expect(bulletToSection("Warning: rollout requires a migration window")).toEqual({
      heading: "Warning",
      description: "rollout requires a migration window",
    });
  });

  it("ignores colons deep inside a sentence", () => {
    const b = "The team shipped every quarterly milestone on schedule this year: remarkable";
    expect(bulletToSection(b).heading).toBe("");
  });

  it("keeps plain statements whole with no fabricated label", () => {
    expect(bulletToSection("Climate change affects global temperatures")).toEqual({
      heading: "",
      description: "Climate change affects global temperatures",
    });
  });

  it("prefers dash over a later colon", () => {
    expect(bulletToSection("Metrics — track these KPIs: revenue, churn")).toEqual({
      heading: "Metrics",
      description: "track these KPIs: revenue, churn",
    });
  });
});

describe("bulletsToSections / sectionsToBullets", () => {
  it("drops empty bullets and roundtrips labeled items", () => {
    const sections = bulletsToSections(["A — one", "", "  ", "B — two"]);
    expect(sections).toEqual([
      { heading: "A", description: "one" },
      { heading: "B", description: "two" },
    ]);
    expect(sectionsToBullets(sections)).toEqual(["A — one", "B — two"]);
  });

  it("emits label-less sections as bare text bullets", () => {
    expect(sectionsToBullets([{ heading: "", description: "Just a statement" }])).toEqual([
      "Just a statement",
    ]);
  });

  it("tolerates null/undefined", () => {
    expect(bulletsToSections(undefined)).toEqual([]);
    expect(sectionsToBullets(null)).toEqual([]);
  });
});

describe("normalizeSections", () => {
  it("passes clean sections through trimmed", () => {
    expect(
      normalizeSections([{ heading: "  Speed  ", description: " Ships fast " }])
    ).toEqual([{ heading: "Speed", description: "Ships fast" }]);
  });

  it("accepts title/text aliases from misbehaving models", () => {
    expect(normalizeSections([{ title: "Speed", text: "Ships fast" }])).toEqual([
      { heading: "Speed", description: "Ships fast" },
    ]);
  });

  it("splits string entries with the canonical splitter", () => {
    expect(normalizeSections(["Speed: ships fast"])).toEqual([
      { heading: "Speed", description: "ships fast" },
    ]);
  });

  it("moves heading-only sections into the description", () => {
    expect(normalizeSections([{ heading: "Standalone statement" }])).toEqual([
      { heading: "", description: "Standalone statement" },
    ]);
  });

  it("drops empty/garbage entries and non-arrays", () => {
    expect(normalizeSections([{ heading: "", description: "" }, null, 42])).toEqual([]);
    expect(normalizeSections("not an array")).toEqual([]);
    expect(normalizeSections(undefined)).toEqual([]);
  });
});
