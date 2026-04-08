# Design System Specification: The Lucid Precision Framework

## 1. Overview & Creative North Star: "The Digital Architect"
This design system moves away from the cluttered, "widget-heavy" dashboard of the past decade. Our Creative North Star is **The Digital Architect**—a philosophy that treats data as structural art. The system is defined by an editorial-grade clarity where information is prioritized through scale and tonal depth rather than boxes and lines.

We break the traditional "admin template" look by utilizing intentional asymmetry and high-contrast typography scales. By pairing the technical precision of **Inter** with the expansive, geometric elegance of **Manrope**, we create an environment that feels both authoritative and approachable.

---

## 2. Colors & Tonal Depth
The palette is rooted in a sophisticated spectrum of cerulean and slate. We do not use "pure" grays; every neutral is infused with a hint of blue to maintain a cohesive, "chilled" atmosphere.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined through background shifts or elevation.
*   **Method:** Use `surface-container-low` for the page background and `surface-container-lowest` (Pure White) for content cards. This creates a soft, natural separation that feels premium rather than "templated."

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, frosted layers:
1.  **Base Layer:** `surface` (#f6fafd)
2.  **Sectioning Layer:** `surface-container-low` (#f0f4f8)
3.  **Active Content Layer:** `surface-container-lowest` (#ffffff)
4.  **Interactive Overlays:** `surface-bright` with 80% opacity and 12px Backdrop Blur.

### Signature Textures
Main CTAs and Hero moments should utilize a **Linear Gradient**:
*   *Direction:* 135deg
*   *From:* `primary` (#006482)
*   *To:* `primary-container` (#007ea3)
This adds a "visual soul" and depth that prevents the UI from looking flat or "cheap."

---

## 3. Typography: Editorial Authority
The hierarchy relies on extreme scale differences to guide the user’s eye.

*   **Display & Headlines (Manrope):** These are your "Anchors." Use `display-lg` for dashboard greetings or high-level KPIs. The wide apertures of Manrope convey a sense of modern transparency.
*   **Body & Labels (Inter):** These are your "Workhorses." Inter’s tall x-height ensures maximum legibility for data-dense tables. 
*   **The "Micro-Copy" Rule:** Use `label-sm` in `secondary` color for metadata. It should be visible but never compete with the `headline-sm` titles.

---

## 4. Elevation & Depth
We eschew traditional "Drop Shadows" in favor of **Tonal Layering**.

*   **The Layering Principle:** Place a card using `surface-container-lowest` onto a background of `surface-container-low`. The contrast (White on Light Blue-Gray) provides all the "lift" required.
*   **Ambient Shadows:** For floating elements (Modals/Popovers), use:
    *   *Y-Offset:* 8px | *Blur:* 24px
    *   *Color:* `on-surface` (#171c1f) at **4% opacity**. This mimics natural sunlight rather than a digital shadow.
*   **The "Ghost Border" Fallback:** If a container requires definition against an identical background, use a 1px border of `outline-variant` (#bdc8cf) at **20% opacity**.

---

## 5. Components

### Buttons: The Precision Actuators
*   **Primary:** Gradient fill (Primary to Primary-Container), `on-primary` text. No border. 8px (`lg`) corner radius.
*   **Secondary:** `surface-container-high` fill. `primary` text color. No border.
*   **Tertiary:** Transparent background, `primary` text. Use for low-priority actions like "Cancel."

### Input Fields: The Soft Focus
*   **Default State:** `surface-container-lowest` fill with a `ghost border`.
*   **Focus State:** Border shifts to `primary` (#006482) at 100% opacity, with a 2px "glow" using the `primary` color at 10% opacity.
*   **Corners:** All inputs must use the `lg` (0.5rem / 8px) rounding.

### Cards & Data Lists
*   **Rule:** Forbid divider lines. 
*   **Separation:** Separate list items using a 4px vertical gap of the background color, or by alternating background tones between `surface-container-lowest` and `surface-container-low`.
*   **Thin-Line Icons:** All icons must be 1.5px or 2px stroke weight. Avoid filled icons unless indicating an "Active" navigation state.

### Sophisticated Overlays (Glassmorphism)
When a user opens a filter drawer or profile menu, apply a backdrop-blur (10px-16px) to the `surface-container-lowest` container at 90% opacity. This keeps the user grounded in the dashboard context.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Whitespace:** If a section feels crowded, add 16px of padding. If it still feels crowded, add another 8px.
*   **Use Tonal Shifts:** Use `primary-fixed-dim` for "Quiet" primary actions that shouldn't scream for attention.
*   **Layer Surfaces:** Place high-priority data on the "Highest" surface tier.

### Don’t:
*   **No High-Contrast Borders:** Never use #000000 or high-opacity grays for borders. It breaks the "Architect" aesthetic.
*   **No Sharp Corners:** Avoid the `none` or `sm` roundedness tokens. The dashboard should feel ergonomic and safe.
*   **No Flat Blue Buttons:** Avoid using a single flat hex code for large buttons; always use the signature gradient to ensure a premium feel.
*   **No Generic Shadows:** Never use the default "Drop Shadow" preset in design tools. Always tint the shadow with the surface color.

---

## 7. Spacing Scale
Consistency in breathing room is what separates a dashboard from a tool. 
*   **Container Padding:** Always `1.5rem` (24px).
*   **Inter-Component Gap:** Always `1rem` (16px).
*   **Micro-spacing:** `0.5rem` (8px) for related label/input pairs.