// @vitest-environment jsdom
/**
 * Reproduces the PRESENTER composition end to end: AnimatedSlide (slide
 * transition wrapper) > SlideRenderer with a realistic content slide, exactly
 * as /present/[id] renders it — to verify item entrance animations fire
 * through the full chain, not just in the bare renderer.
 */
import { describe, it, expect, beforeAll } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import AnimatedSlide from "./AnimatedSlide";
import SlideRenderer from "./SlideRenderer";
import { RevealContext } from "./item-animations";
import { getDefaultTheme } from "~/lib/themes";
import type { SlideData } from "./types";

beforeAll(() => {
  // Browser APIs used by slide internals that jsdom lacks
  if (!("ResizeObserver" in globalThis)) {
    (globalThis as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (!("IntersectionObserver" in globalThis)) {
    (globalThis as Record<string, unknown>).IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;
  }
});

const theme = getDefaultTheme();

const makeSlide = (): SlideData => ({
  type: "content",
  title: "From Seance Halls to the Pulpit",
  slideDescription: "A journey in four parts.",
  bulletPoints: [
    "English Origins: Born in Nottingham in 1886.",
    "Occult Entanglement: Involved in Theosophy in his youth.",
    "Spiritual Turning Point: Converted around 1908.",
    "Theological Education: Studied at Moody Bible Institute.",
  ],
  transformedContent: {
    items: [
      { label: "English Origins", text: "Born in Nottingham in 1886." },
      { label: "Occult Entanglement", text: "Involved in Theosophy in his youth." },
      { label: "Spiritual Turning Point", text: "Converted around 1908." },
      { label: "Theological Education", text: "Studied at Moody Bible Institute." },
    ],
  } as SlideData["transformedContent"],
  contentLayout: "box-style-1",
  slideLayout: "no-image",
  animation: "rise",
});

const noop = () => {};
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const hiddenCount = () =>
  Array.from(document.querySelectorAll<HTMLElement>("[style]")).filter((el) => {
    const o = el.style.opacity;
    return o !== "" && Number(o) < 0.05;
  }).length;

function renderPresenter(slide: SlideData, revealCount?: number) {
  return render(
    <AnimatedSlide slideKey={1} animationId={slide.animation || "rise"} isPresenting={true}>
      <SlideRenderer
        slide={slide}
        index={1}
        totalSlides={10}
        theme={theme}
        isOwner={false}
        isFullscreen={true}
        isHovered={false}
        isEditing={false}
        editingText={null}
        isPresenting={true}
        revealCount={revealCount}
        onStartEditing={noop}
        onUpdateContent={noop}
        onFinishEditing={noop}
        onAddBullet={noop}
        onDeleteBullet={noop}
      />
    </AnimatedSlide>
  );
}

describe("presenter chain animations (AnimatedSlide > SlideRenderer)", () => {
  it("content items start hidden and animate to visible", async () => {
    renderPresenter(makeSlide());

    // Right after mount, the staggered items should be at their hidden state.
    const initiallyHidden = hiddenCount();
    expect(initiallyHidden).toBeGreaterThanOrEqual(4);

    // After the stagger completes everything should be visible.
    await wait(2200);
    expect(hiddenCount()).toBe(0);
  }, 10000);

  it("click-to-reveal holds items hidden until revealed", async () => {
    renderPresenter(makeSlide(), 2);
    await wait(1500);
    // Two of the four items must still be hidden.
    expect(hiddenCount()).toBeGreaterThanOrEqual(2);
  }, 10000);

  it("previously revealed items stay static while the next item animates in", async () => {
    // Reveal travels via context (as in production) so SlideRenderer is not
    // re-rendered — a re-render would remount its inline content blocks and
    // replay every already-revealed item.
    const slide = makeSlide();
    const ui = (reveal: number) => (
      <RevealContext.Provider value={reveal}>
        <AnimatedSlide slideKey={1} animationId="rise" isPresenting={true}>
          <SlideRenderer
            slide={slide}
            index={1}
            totalSlides={10}
            theme={theme}
            isOwner={false}
            isFullscreen={true}
            isHovered={false}
            isEditing={false}
            editingText={null}
            isPresenting={true}
            onStartEditing={noop}
            onUpdateContent={noop}
            onFinishEditing={noop}
            onAddBullet={noop}
            onDeleteBullet={noop}
          />
        </AnimatedSlide>
      </RevealContext.Provider>
    );

    const { rerender } = render(ui(2));
    await wait(1400); // items 1-2 fully revealed and settled

    rerender(ui(3)); // presenter presses Next
    await wait(180); // mid-entrance of item 3

    // Item 3 is animating (partial) and item 4 is hidden — but items 1-2 must
    // be untouched. If the subtree remounted, all four would be partial.
    // Per-item wrapper opacity (some decorative children have static design
    // opacities like 0.75, so assert on the item wrappers specifically).
    const itemOpacity = (label: string): number => {
      const el = Array.from(document.querySelectorAll<HTMLElement>("div")).find(
        (d) => d.className.includes("h-full") && (d.textContent || "").startsWith(label) && d.style.opacity !== ""
      );
      return el ? Number(el.style.opacity) : 1; // settled items may have no inline opacity
    };

    expect(itemOpacity("English Origins")).toBeGreaterThan(0.95); // revealed earlier — static
    expect(itemOpacity("Occult Entanglement")).toBeGreaterThan(0.95); // revealed earlier — static
    expect(itemOpacity("Spiritual Turning Point")).toBeLessThan(0.9); // the newly revealed item, mid-entrance
    expect(itemOpacity("Theological Education")).toBeLessThan(0.05); // still hidden

    await wait(1200);
    // Settled: three revealed, one still hidden.
    expect(hiddenCount()).toBeGreaterThanOrEqual(1);
  }, 12000);
});
