// @vitest-environment jsdom
/**
 * Runtime verification of block move + resize: handles emit scale-corrected
 * canvas-px offsets/sizes through onMove, saved sizes render as explicit
 * width/height in non-editable views (present/export), and reset clears both.
 */
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import DraggableBlock, { computeFitZoom, type BlockOffset } from "./DraggableBlock";

function pointer(type: string, x: number, y: number) {
  window.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y }));
}

function renderBlock(opts: { offset?: BlockOffset; editable?: boolean; onMove?: (id: string, o: BlockOffset) => void }) {
  return render(
    <DraggableBlock blockId="content" fill offset={opts.offset} editable={opts.editable} onMove={opts.onMove}>
      <div data-testid="child">content</div>
    </DraggableBlock>
  );
}

describe("DraggableBlock resize", () => {
  it("is a zero-DOM passthrough when not editable and untouched", () => {
    const { container } = renderBlock({});
    expect(container.querySelector(".group\\/drag")).toBeNull();
    expect(container.querySelector("[data-testid=child]")).toBeTruthy();
  });

  it("applies a saved size as explicit width/height in view mode (present/export)", () => {
    const { container } = renderBlock({ offset: { x: 0, y: 0, w: 420, h: 260 } });
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe("420px");
    expect(wrapper.style.height).toBe("260px");
    // No editing handles in view mode.
    expect(container.querySelector("button")).toBeNull();
  });

  it("corner resize emits rounded w/h deltas on top of the stored size", () => {
    const onMove = vi.fn();
    const { getByLabelText } = renderBlock({
      offset: { x: 5, y: -3, w: 200, h: 100 },
      editable: true,
      onMove,
    });
    fireEvent.pointerDown(getByLabelText("Resize content"), { clientX: 0, clientY: 0 });
    pointer("pointermove", 40, 30);
    pointer("pointerup", 40, 30);
    expect(onMove).toHaveBeenCalledWith("content", { x: 5, y: -3, w: 240, h: 130 });
  });

  it("edge handles resize a single axis and respect minimums", () => {
    const onMove = vi.fn();
    const { getByLabelText } = renderBlock({
      offset: { x: 0, y: 0, w: 200, h: 100 },
      editable: true,
      onMove,
    });
    // Width-only handle, dragged far left → clamps to MIN_W (60), height untouched.
    fireEvent.pointerDown(getByLabelText("Resize content width"), { clientX: 0, clientY: 0 });
    pointer("pointermove", -500, 0);
    pointer("pointerup", -500, 0);
    expect(onMove).toHaveBeenCalledWith("content", { x: 0, y: 0, w: 60, h: 100 });

    // Height-only handle grows just the height.
    fireEvent.pointerDown(getByLabelText("Resize content height"), { clientX: 0, clientY: 0 });
    pointer("pointermove", 0, 55);
    pointer("pointerup", 0, 55);
    expect(onMove).toHaveBeenLastCalledWith("content", { x: 0, y: 0, w: 200, h: 155 });
  });

  it("dragging preserves the stored size while updating position", () => {
    const onMove = vi.fn();
    const { getByLabelText } = renderBlock({
      offset: { x: 0, y: 0, w: 200, h: 100 },
      editable: true,
      onMove,
    });
    fireEvent.pointerDown(getByLabelText("Move content"), { clientX: 10, clientY: 10 });
    pointer("pointermove", 60, 30);
    pointer("pointerup", 60, 30);
    expect(onMove).toHaveBeenCalledWith("content", { x: 50, y: 20, w: 200, h: 100 });
  });

  it("reset clears both position and size", () => {
    const onMove = vi.fn();
    const { getByLabelText } = renderBlock({
      offset: { x: 12, y: 4, w: 300, h: 150 },
      editable: true,
      onMove,
    });
    fireEvent.click(getByLabelText("Reset content position and size"));
    expect(onMove).toHaveBeenCalledWith("content", { x: 0, y: 0 });
  });

  it("shows the reset button for a resized-but-not-moved block", () => {
    const { queryByLabelText } = renderBlock({
      offset: { x: 0, y: 0, w: 300 },
      editable: true,
      onMove: vi.fn(),
    });
    expect(queryByLabelText("Reset content position and size")).toBeTruthy();
  });
});

describe("computeFitZoom", () => {
  it("grows content to fill extra height", () => {
    expect(computeFitZoom(1, 200, 100)).toBe(2);
  });

  it("shrinks overflowing content so hidden parts become visible", () => {
    expect(computeFitZoom(1, 100, 200)).toBe(0.5);
  });

  it("compounds from the current zoom", () => {
    expect(computeFitZoom(2, 260, 520)).toBe(1); // 2 * (260/520) = 1
    expect(computeFitZoom(0.5, 300, 100)).toBe(1.5);
  });

  it("clamps to sane bounds", () => {
    expect(computeFitZoom(1, 1000, 100)).toBe(3);
    expect(computeFitZoom(1, 10, 100)).toBe(0.4);
  });

  it("snaps negligible corrections to exactly 1 (no zoom blur)", () => {
    expect(computeFitZoom(1, 102, 100)).toBe(1);
    expect(computeFitZoom(1, 98, 100)).toBe(1);
  });

  it("bails to 1 on degenerate measurements", () => {
    expect(computeFitZoom(1, 0, 100)).toBe(1);
    expect(computeFitZoom(1, 100, 0)).toBe(1);
    expect(computeFitZoom(0, 100, 100)).toBe(1);
  });
});

describe("content-fit on height resize", () => {
  function renderFit(offset: BlockOffset) {
    return render(
      <DraggableBlock blockId="content" fill fitContent offset={offset}>
        <div data-testid="child">content</div>
      </DraggableBlock>
    );
  }

  /** Simulate layout: natural height at zoom 1, optionally growing when zoomed
   *  (the text-rewrap effect that caused the oscillation bug). */
  function mockHeights(inner: HTMLElement, natural: number, rewrapFactor = 0) {
    const local = () => {
      const zoom = parseFloat(inner.style.getPropertyValue("zoom")) || 1;
      return Math.round(natural * (1 + rewrapFactor * (zoom - 1)));
    };
    Object.defineProperty(inner, "offsetHeight", { get: local, configurable: true });
    Object.defineProperty(inner, "scrollHeight", { get: local, configurable: true });
  }

  it("scales inner content up to fill an explicitly-resized height", () => {
    const offset = { x: 0, y: 0, h: 260 };
    const { container, rerender } = renderFit(offset);
    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    mockHeights(inner, 130);

    // Any re-render re-runs the fit pass with the mocked geometry.
    rerender(
      <DraggableBlock blockId="content" fill fitContent offset={offset}>
        <div data-testid="child">content</div>
      </DraggableBlock>
    );
    expect(inner.style.getPropertyValue("zoom")).toBe("2");
  });

  it("scales overflowing content down so hidden content becomes visible", () => {
    const offset = { x: 0, y: 0, h: 150 };
    const { container, rerender } = renderFit(offset);
    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    mockHeights(inner, 300);

    rerender(
      <DraggableBlock blockId="content" fill fitContent offset={offset}>
        <div data-testid="child">content</div>
      </DraggableBlock>
    );
    expect(inner.style.getPropertyValue("zoom")).toBe("0.5");
  });

  it("stays settled across re-renders — no oscillation, no snap back to 1 (regression)", () => {
    const offset = { x: 0, y: 0, h: 260 };
    const { container, rerender } = renderFit(offset);
    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    // Content grows 10% per zoom unit (simulates text re-wrapping when zoomed) —
    // the exact feedback that made the old rect-chasing loop flicker and
    // eventually snap back to zoom 1.
    mockHeights(inner, 130, 0.1);

    const rr = () =>
      rerender(
        <DraggableBlock blockId="content" fill fitContent offset={offset}>
          <div data-testid="child">content</div>
        </DraggableBlock>
      );
    rr();
    const settled = inner.style.getPropertyValue("zoom");
    // One clean fit (2) + one wrap-correction (260/143 ≈ 1.818), then stop.
    expect(parseFloat(settled)).toBeCloseTo(1.818, 2);

    // Further re-renders (hover, typing elsewhere, autosave echoes) must not
    // change the zoom — and must never revert it to 1/original.
    for (let i = 0; i < 5; i++) rr();
    expect(inner.style.getPropertyValue("zoom")).toBe(settled);
  });

  it("clears the zoom when the height override is removed", () => {
    const offset = { x: 0, y: 0, h: 260 };
    const { container, rerender } = renderFit(offset);
    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    mockHeights(inner, 130);
    rerender(
      <DraggableBlock blockId="content" fill fitContent offset={offset}>
        <div data-testid="child">content</div>
      </DraggableBlock>
    );
    expect(inner.style.getPropertyValue("zoom")).toBe("2");

    // Back to natural height (e.g. reset, but still moved so the wrapper stays).
    rerender(
      <DraggableBlock blockId="content" fill fitContent offset={{ x: 5, y: 0 }}>
        <div data-testid="child">content</div>
      </DraggableBlock>
    );
    expect(inner.style.getPropertyValue("zoom")).toBe("");
  });

  it("keeps the fill classes on the inner wrapper only while unfitted", () => {
    const { container, rerender } = renderFit({ x: 0, y: 0, h: 200 });
    const inner = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    // Fitting: auto height so natural content height is measurable.
    expect(inner.className).not.toContain("h-full");

    rerender(
      <DraggableBlock blockId="content" fill fitContent offset={{ x: 5, y: 0 }}>
        <div data-testid="child">content</div>
      </DraggableBlock>
    );
    // Not fitting: preserve the stretched fill behavior.
    expect(inner.className).toContain("h-full");
  });
});
