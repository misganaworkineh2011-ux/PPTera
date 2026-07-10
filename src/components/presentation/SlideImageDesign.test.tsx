// @vitest-environment jsdom
/**
 * Runtime verification of the image design treatments: every ImageShape
 * renders the image, design shapes produce a styled treatment (not the bare
 * full-bleed fallback), banners get the in-flow aspect wrapper that prevents
 * the auto-height collapse, and the theme accent reaches the frame styling.
 */
import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import SlideImageDesign from "./SlideImageDesign";
import { EDGE_IMAGE_SHAPES, DESIGN_IMAGE_SHAPES, type ImageShape } from "~/lib/layouts/slide";
import type { SlideImage } from "./types";

const IMAGE: SlideImage = {
  url: "https://example.com/photo.jpg",
  alt: "A test photo",
  source: "pexels",
} as SlideImage;

const ACCENT = "#f59e0b";

function renderShape(shape: ImageShape, orientation: "left" | "right" | "top" | "bottom") {
  return render(
    <SlideImageDesign
      image={IMAGE}
      alt="A test photo"
      shape={shape}
      orientation={orientation}
      accent={ACCENT}
      isDark={true}
    />
  );
}

describe("SlideImageDesign", () => {
  it("edge + design shape lists cover all 31 unique shapes", () => {
    const all = [...EDGE_IMAGE_SHAPES, ...DESIGN_IMAGE_SHAPES];
    expect(all.length).toBe(31);
    expect(new Set(all).size).toBe(31);
  });

  it("legacy edge shapes render the plain full-bleed image (host clip styles it)", () => {
    for (const shape of EDGE_IMAGE_SHAPES) {
      const { container, unmount } = renderShape(shape, "right");
      const first = container.firstElementChild!;
      expect(first.tagName, `${shape} should render a bare <img>`).toBe("IMG");
      expect(first.className).toContain("object-cover");
      unmount();
    }
  });

  it("every design shape renders a styled treatment containing the image", () => {
    for (const shape of DESIGN_IMAGE_SHAPES) {
      const { container, unmount } = renderShape(shape, "right");
      const first = container.firstElementChild!;
      expect(first.tagName, `${shape} should render a treatment wrapper`).toBe("DIV");
      const img = container.querySelector("img");
      expect(img, `${shape} should still render the image`).toBeTruthy();
      expect(img!.getAttribute("src")).toBe(IMAGE.url);
      unmount();
    }
  });

  it("design shapes in banner orientation get the in-flow aspect wrapper (collapse guard)", () => {
    for (const shape of DESIGN_IMAGE_SHAPES) {
      const { container, unmount } = renderShape(shape, "top");
      const first = container.firstElementChild as HTMLElement;
      expect(first.className, `${shape} banner must be wrapped in an aspect box`).toContain("aspect-[40/9]");
      unmount();
    }
  });

  it("design shapes in side orientation fill the stretched column (no aspect wrapper)", () => {
    for (const shape of DESIGN_IMAGE_SHAPES) {
      const { container, unmount } = renderShape(shape, "left");
      const first = container.firstElementChild as HTMLElement;
      expect(first.className).not.toContain("aspect-[40/9]");
      expect(first.className, `${shape} side treatment should absolutely fill the column`).toContain("absolute");
      unmount();
    }
  });

  it("the theme accent reaches the treatment styling (portal dot, duotone bar)", () => {
    // Note: hex-alpha colors like `${accent}38` are valid in browsers but jsdom
    // drops them, so assert on the solid 6-digit accent usages instead.
    const accentRgb = "rgb(245, 158, 11)"; // #f59e0b
    for (const shape of ["portal", "duotone"] as const) {
      const { container, unmount } = renderShape(shape, "right");
      const styled = Array.from(container.querySelectorAll("div")).some(
        (el) => (el as HTMLElement).style.backgroundColor === accentRgb
      );
      expect(styled, `${shape} should paint a solid accent element`).toBe(true);
      unmount();
    }
  });

  it("slats renders three image strips with distinct object positions", () => {
    const { container } = renderShape("slats", "right");
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(3);
    const positions = Array.from(imgs).map((el) => (el as HTMLElement).style.objectPosition);
    expect(new Set(positions).size).toBe(3);
  });

  it("blend shapes dissolve toward the content side via an alpha mask", () => {
    // Image on the RIGHT column → content is left → fade "to left".
    const right = renderShape("fade", "right");
    const rightStyle = (right.container.firstElementChild as HTMLElement).getAttribute("style") ?? "";
    expect(rightStyle).toContain("mask");
    expect(rightStyle).toContain("to left");
    right.unmount();

    // Image on the LEFT column → content is right → fade "to right".
    const left = renderShape("fade", "left");
    const leftStyle = (left.container.firstElementChild as HTMLElement).getAttribute("style") ?? "";
    expect(leftStyle).toContain("to right");
    left.unmount();

    // Top banner → content below → fade "to bottom". jsdom normalizes the
    // default direction away, so assert the mask exists with no other direction.
    const top = renderShape("fade", "top");
    const inner = (top.container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    const topStyle = inner.getAttribute("style") ?? "";
    expect(topStyle).toContain("mask-image");
    expect(topStyle).not.toContain("to left");
    expect(topStyle).not.toContain("to right");
    expect(topStyle).not.toContain("to top");
    top.unmount();
  });

  it("drag props pass through to the image", () => {
    const { container } = render(
      <SlideImageDesign
        image={IMAGE}
        alt="A test photo"
        shape="portal"
        orientation="right"
        accent={ACCENT}
        isDark={false}
        imgCursor="grab"
        draggable={true}
      />
    );
    const img = container.querySelector("img")!;
    expect(img.getAttribute("draggable")).toBe("true");
    expect((img as HTMLElement).style.cursor).toBe("grab");
  });
});
