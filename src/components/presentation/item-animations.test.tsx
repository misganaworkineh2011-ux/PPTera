// @vitest-environment jsdom
/**
 * Runtime verification that per-item entrance animations actually play:
 * items start hidden (opacity 0) when presenting, stagger to visible, and
 * click-to-reveal builds keep unrevealed items hidden.
 */
import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import BoxLayoutRenderer from "./BoxLayoutRenderer";
import { getDefaultTheme } from "~/lib/themes";

const ITEMS = [
  { label: "One", text: "First item" },
  { label: "Two", text: "Second item" },
  { label: "Three", text: "Third item" },
  { label: "Four", text: "Fourth item" },
];

const theme = getDefaultTheme();

function boxOpacities(container: HTMLElement): number[] {
  // The renderer root is the grid container; its children are the item boxes.
  const grid = container.firstElementChild as HTMLElement;
  return Array.from(grid.children).map((el) => {
    const inline = (el as HTMLElement).style.opacity;
    return inline === "" ? 1 : Number(inline);
  });
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("per-item entrance animations", () => {
  it("items start hidden and stagger to visible when presenting", async () => {
    const { container } = render(
      <BoxLayoutRenderer
        layoutId="box-style-1"
        items={ITEMS}
        theme={theme}
        isPresenting={true}
        animationKey="test"
        itemAnimation="fade-up"
      />
    );

    // Immediately after mount every item should be at its hidden state.
    const initial = boxOpacities(container);
    expect(initial.every((o) => o < 0.05)).toBe(true);

    // After the stagger completes, every item should be fully visible.
    await wait(1600);
    const settled = boxOpacities(container);
    expect(settled.every((o) => o > 0.95)).toBe(true);
  });

  it("click-to-reveal keeps unrevealed items hidden", async () => {
    const { container } = render(
      <BoxLayoutRenderer
        layoutId="box-style-1"
        items={ITEMS}
        theme={theme}
        isPresenting={true}
        animationKey="test"
        itemAnimation="zoom-in"
        revealCount={2}
      />
    );

    await wait(1200);
    const opacities = boxOpacities(container);
    expect(opacities[0]).toBeGreaterThan(0.95);
    expect(opacities[1]).toBeGreaterThan(0.95);
    expect(opacities[2]).toBeLessThan(0.05);
    expect(opacities[3]).toBeLessThan(0.05);
  });

  it("renders statically (no hidden items) when not presenting", () => {
    const { container } = render(
      <BoxLayoutRenderer layoutId="box-style-1" items={ITEMS} theme={theme} isPresenting={false} />
    );
    const opacities = boxOpacities(container);
    expect(opacities.every((o) => o > 0.95)).toBe(true);
  });
});
