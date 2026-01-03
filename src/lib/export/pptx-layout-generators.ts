import PptxGenJS from "pptxgenjs";
import { type Theme } from "~/lib/themes";

export interface SlideData {
    type: "title" | "content";
    title: string;
    subtitle?: string;
    bulletPoints?: string[];
    image?: { url: string; alt: string; source: string } | null;
    images?: { url: string; alt: string; source: string }[];
    layout?: string;
    transformedContent?: {
        intro?: string;
        items: { label?: string; text: string }[];
    };
}

// Helper: Strip HTML
export function stripHtml(html: string): string {
    if (!html) return "";
    return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<\/div>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s*\n/g, "\n")
        .trim();
}

// Helper: Process Color (Hex or RGBA)
export interface ColorProps {
    color: string;
    transparency?: number;
}

export function processColor(colorStr: string, defaultTransparency?: number): ColorProps {
    if (!colorStr) return { color: "FFFFFF" };

    let color = "000000";
    let transparency = defaultTransparency;

    if (colorStr.startsWith("#")) {
        color = colorStr.replace("#", "").toUpperCase();
    } else {
        // Handle rgba(r, g, b, a) or rgb(r, g, b)
        const rgbaMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
        if (rgbaMatch) {
            const r = parseInt(rgbaMatch[1]!).toString(16).padStart(2, '0');
            const g = parseInt(rgbaMatch[2]!).toString(16).padStart(2, '0');
            const b = parseInt(rgbaMatch[3]!).toString(16).padStart(2, '0');
            color = (r + g + b).toUpperCase();

            const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
            // Convert alpha 0-1 to transparency 0-100
            const alphaTransparency = Math.round((1 - a) * 100);

            // If alpha transparency is present (and not 0), it usually overrides or combines
            if (alphaTransparency > 0) {
                transparency = alphaTransparency;
            }
        } else {
            if (colorStr.toLowerCase() === "transparent") {
                return { color: "FFFFFF", transparency: 100 };
            }
        }
    }

    return transparency !== undefined ? { color, transparency } : { color };
}

// Compatibility helper
export function hexColor(hex: string): string {
    return processColor(hex).color;
}

// Helper: Fetch Image
export async function fetchImageAsBase64(url: string): Promise<string | null> {
    if (!url || url === "placeholder") return null;
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: controller.signal,
        });
        clearTimeout(id);

        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const contentType = response.headers.get("content-type") || "image/jpeg";
        return "data:" + contentType + ";base64," + base64;
    } catch (e) {
        return null;
    }
}

function getSlideImages(slide: SlideData): string[] {
    const urls: string[] = [];
    if (slide.images?.length) {
        for (const img of slide.images) {
            if (img.url && img.source !== "placeholder") urls.push(img.url);
        }
    }
    if (slide.image?.url && slide.image.source !== "placeholder") {
        if (!urls.includes(slide.image.url)) urls.unshift(slide.image.url);
    }
    return urls;
}

function getItems(slide: SlideData): { text: string; label?: string }[] {
    if (slide.transformedContent?.items) {
        return slide.transformedContent.items.map(i => ({
            text: stripHtml(i.text),
            label: i.label,
        }));
    }
    return (slide.bulletPoints || []).map(bp => ({ text: stripHtml(bp) }));
}

// Helper: Add Background
export async function addBackground(
    pptSlide: PptxGenJS.Slide,
    theme: Theme
): Promise<void> {
    const isHacker = theme.id === "hacker-terminal";

    if (isHacker) {
        // Hacker Terminal Specific Background
        pptSlide.background = { color: "0D0D0D" }; // Dark background

        // Add subtle grid or scanline effect matches web
        // Since we can't do complex CSS scanlines, we use a very transparent pattern or image if available.
        // For now, simpler: Just the dark BG.
    } else {
        // Standard Logic
        const bgProps = processColor(theme.colors.background);
        pptSlide.background = bgProps;

        if (theme.backgroundImage) {
            const bgImage = await fetchImageAsBase64(theme.backgroundImage);
            if (bgImage) {
                pptSlide.background = { data: bgImage };
                const overlayProps = processColor(theme.colors.background);
                pptSlide.addShape("rect", {
                    x: 0, y: 0, w: "100%", h: "100%",
                    fill: { color: overlayProps.color, transparency: 20 },
                });
            }
        }
    }
}

// Helper: Get Font Config based on theme
function getThemeFont(theme: Theme): string {
    if (theme.id === "hacker-terminal") return "Courier New";
    return "Arial";
}

// ==========================================
// Layout Generators
// ==========================================

// 1. Title Center
export async function layoutTitleCenter(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);

    // Hacker Terminal: Matrix Effect Title
    if (theme.id === "hacker-terminal") {
        // Main Title with "Terminal" style
        s.addText(`> ${stripHtml(slide.title)}`, {
            x: 0.5, y: 2.5, w: 9, h: 1.5,
            fontSize: 44,
            fontFace: "Courier New",
            bold: true,
            color: hexColor(theme.colors.primary), // Neon Green
            align: "center",
            valign: "middle",
            glow: { size: 5, color: hexColor(theme.colors.primary), opacity: 0.5 } // Neon glow
        });

        if (slide.subtitle) {
            s.addText(stripHtml(slide.subtitle), {
                x: 1.0, y: 4.0, w: 8, h: 1,
                fontSize: 24,
                fontFace: "Courier New",
                color: hexColor(theme.colors.textMuted),
                align: "center",
                italic: true
            });
        }
    } else {
        // Standard Logic
        s.addText(stripHtml(slide.title), {
            x: 0.5, y: 2.0, w: 9, h: 1.2,
            fontSize: 44,
            fontFace: getThemeFont(theme),
            bold: true,
            color: hexColor(theme.colors.heading),
            align: "center",
            valign: "middle",
        });

        if (slide.subtitle) {
            s.addText(stripHtml(slide.subtitle), {
                x: 0.5, y: 3.4, w: 9, h: 0.8,
                fontSize: 22, fontFace: getThemeFont(theme),
                color: hexColor(theme.colors.textMuted),
                align: "center", valign: "middle",
            });
        }
    }

    addSlideNumber(s, theme, slideNum, total);
}

// 2. Title Left
export async function layoutTitleLeft(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);

    s.addText(stripHtml(slide.title), {
        x: 0.5, y: 1.8, w: 6, h: 1.5,
        fontSize: 40, fontFace: getThemeFont(theme), bold: true,
        color: hexColor(theme.colors.heading),
        align: "left", valign: "middle",
    });

    if (slide.subtitle) {
        s.addText(stripHtml(slide.subtitle), {
            x: 0.5, y: 3.4, w: 6, h: 0.8,
            fontSize: 20, fontFace: getThemeFont(theme),
            color: hexColor(theme.colors.textMuted),
            align: "left", valign: "middle",
        });
    }

    // Decorative element on right
    const decoFill = processColor(theme.colors.surface);
    s.addShape("rect", {
        x: 7, y: 0, w: 3, h: "100%",
        fill: decoFill,
    });

    addSlideNumber(s, theme, slideNum, total);
}

// 3. Content Left, Image Right
export async function layoutContentLeftImageRight(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);
    const images = getSlideImages(slide);
    const items = getItems(slide);

    // Hacker Terminal: Window Style
    if (theme.id === "hacker-terminal") {
        // Window Header Bar
        s.addShape(pptx.ShapeType.rect, {
            x: 0.5, y: 0.5, w: 9, h: 0.5,
            fill: { color: "333333" },
            rectRadius: 0.1
        });
        // Window Controls (Red/Yellow/Green dots)
        s.addShape(pptx.ShapeType.ellipse, { x: 0.6, y: 0.65, w: 0.2, h: 0.2, fill: { color: "FF5F56" } });
        s.addShape(pptx.ShapeType.ellipse, { x: 0.9, y: 0.65, w: 0.2, h: 0.2, fill: { color: "FFBD2E" } });
        s.addShape(pptx.ShapeType.ellipse, { x: 1.2, y: 0.65, w: 0.2, h: 0.2, fill: { color: "27C93F" } });

        // Window Body
        s.addShape(pptx.ShapeType.rect, {
            x: 0.5, y: 1.0, w: 9, h: 4.0,
            fill: { color: "000000", transparency: 10 },
            line: { color: hexColor(theme.colors.primary), width: 1 }
        });

        // Title inside window
        s.addText(`$ ${stripHtml(slide.title)}`, {
            x: 0.7, y: 1.2, w: 8, h: 0.5,
            fontSize: 28,
            fontFace: "Courier New",
            bold: true,
            color: hexColor(theme.colors.primary),
        });

        // Content
        if (items.length > 0) {
            s.addText(items.map(i => i.text).join("\n"), {
                x: 0.7, y: 1.8, w: 8.5, h: 3.0,
                fontSize: 14,
                fontFace: "Courier New",
                color: hexColor(theme.colors.text),
                align: "left",
                valign: "top",
                lineSpacing: 18,
            });
        }
    } else {
        // Standard Layout
        // Title
        s.addText(stripHtml(slide.title), {
            x: 0.5, y: 0.3, w: 9, h: 0.7,
            fontSize: 28, fontFace: getThemeFont(theme), bold: true,
            color: hexColor(theme.colors.heading), align: "left",
        });

        // Bullets
        const bullets: PptxGenJS.TextProps[] = items.slice(0, 7).map(item => ({
            text: item.label ? item.label + ": " + item.text : item.text,
            options: {
                fontSize: 15, fontFace: getThemeFont(theme),
                color: hexColor(theme.colors.text),
                bullet: { type: "bullet" }, paraSpaceAfter: 6,
            }
        }));

        if (bullets.length > 0) {
            s.addText(bullets, { x: 0.5, y: 1.2, w: 5, h: 4.0, valign: "top" });
        }

        // Image
        if (images[0]) {
            const imgData = await fetchImageAsBase64(images[0]);
            if (imgData) {
                s.addImage({ data: imgData, x: 5.8, y: 1.2, w: 3.7, h: 3.8, rounding: true });
            }
        } else {
            // Placeholder shape if no image
            const phFill = processColor(theme.colors.surface);
            const phLine = processColor(theme.colors.border);
            s.addShape("rect", {
                x: 5.8, y: 1.2, w: 3.7, h: 3.8,
                fill: phFill,
                line: { color: phLine.color, width: 1 }
            });
        }
    }

    addSlideNumber(s, theme, slideNum, total);
}

// 4. Image Left, Content Right
export async function layoutContentRightImageLeft(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);
    const images = getSlideImages(slide);
    const items = getItems(slide);

    // Hacker Terminal: Window Style
    if (theme.id === "hacker-terminal") {
        // Window Header Bar
        s.addShape(pptx.ShapeType.rect, {
            x: 0.5, y: 0.5, w: 9, h: 0.5,
            fill: { color: "333333" },
            rectRadius: 0.1
        });
        // Window Controls (Red/Yellow/Green dots)
        s.addShape(pptx.ShapeType.ellipse, { x: 0.6, y: 0.65, w: 0.2, h: 0.2, fill: { color: "FF5F56" } });
        s.addShape(pptx.ShapeType.ellipse, { x: 0.9, y: 0.65, w: 0.2, h: 0.2, fill: { color: "FFBD2E" } });
        s.addShape(pptx.ShapeType.ellipse, { x: 1.2, y: 0.65, w: 0.2, h: 0.2, fill: { color: "27C93F" } });

        // Window Body
        s.addShape(pptx.ShapeType.rect, {
            x: 0.5, y: 1.0, w: 9, h: 4.0,
            fill: { color: "000000", transparency: 10 },
            line: { color: hexColor(theme.colors.primary), width: 1 }
        });

        // Title inside window
        s.addText(`$ ${stripHtml(slide.title)}`, {
            x: 0.7, y: 1.2, w: 8, h: 0.5,
            fontSize: 28,
            fontFace: "Courier New",
            bold: true,
            color: hexColor(theme.colors.primary),
        });

        // Content
        if (items.length > 0) {
            s.addText(items.map(i => i.text).join("\n"), {
                x: 0.7, y: 1.8, w: 8.5, h: 3.0,
                fontSize: 14,
                fontFace: "Courier New",
                color: hexColor(theme.colors.text),
                align: "left",
                valign: "top",
                lineSpacing: 18,
            });
        }
    } else {
        // Standard Layout
        // Title
        s.addText(stripHtml(slide.title), {
            x: 0.5, y: 0.3, w: 9, h: 0.7,
            fontSize: 28, fontFace: getThemeFont(theme), bold: true,
            color: hexColor(theme.colors.heading), align: "left",
        });

        // Image
        if (images[0]) {
            const imgData = await fetchImageAsBase64(images[0]);
            if (imgData) {
                s.addImage({ data: imgData, x: 0.5, y: 1.2, w: 3.7, h: 3.8, rounding: true });
            }
        } else {
            const phFill = processColor(theme.colors.surface);
            const phLine = processColor(theme.colors.border);
            s.addShape("rect", {
                x: 0.5, y: 1.2, w: 3.7, h: 3.8,
                fill: phFill,
                line: { color: phLine.color, width: 1 }
            });
        }

        // Bullets
        const bullets: PptxGenJS.TextProps[] = items.slice(0, 7).map(item => ({
            text: item.label ? item.label + ": " + item.text : item.text,
            options: {
                fontSize: 15, fontFace: getThemeFont(theme),
                color: hexColor(theme.colors.text),
                bullet: { type: "bullet" }, paraSpaceAfter: 6,
            }
        }));

        if (bullets.length > 0) {
            s.addText(bullets, { x: 4.5, y: 1.2, w: 5, h: 4.0, valign: "top" });
        }
    }

    addSlideNumber(s, theme, slideNum, total);
}

// 5. Grid 2
export async function layoutGrid2(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);
    const items = getItems(slide);

    s.addText(stripHtml(slide.title), {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 28, fontFace: getThemeFont(theme), bold: true,
        color: hexColor(theme.colors.heading), align: "center",
    });

    // Colors
    const cardFill = processColor(theme.colors.surface || theme.colors.backgroundAlt, 10);
    const cardLine = processColor(theme.colors.border || theme.colors.primary);

    // Card 1
    s.addShape("roundRect", {
        x: 0.5, y: 1.2, w: 4.3, h: 3.6,
        fill: cardFill,
        line: { color: cardLine.color, width: 1 },
    });

    const leftItems = items.slice(0, Math.ceil(items.length / 2));
    if (leftItems.length > 0) {
        const leftBullets: PptxGenJS.TextProps[] = leftItems.map(item => ({
            text: item.label ? item.label + ": " + item.text : item.text,
            options: { fontSize: 14, fontFace: getThemeFont(theme), color: hexColor(theme.colors.text), bullet: { type: "bullet" }, paraSpaceAfter: 6 }
        }));
        s.addText(leftBullets, { x: 0.7, y: 1.4, w: 3.9, h: 3.2, valign: "top" });
    }

    // Card 2
    s.addShape("roundRect", {
        x: 5.2, y: 1.2, w: 4.3, h: 3.6,
        fill: cardFill,
        line: { color: cardLine.color, width: 1 },
    });

    const rightItems = items.slice(Math.ceil(items.length / 2), 8);
    if (rightItems.length > 0) {
        const rightBullets: PptxGenJS.TextProps[] = rightItems.map(item => ({
            text: item.label ? item.label + ": " + item.text : item.text,
            options: { fontSize: 14, fontFace: getThemeFont(theme), color: hexColor(theme.colors.text), bullet: { type: "bullet" }, paraSpaceAfter: 6 }
        }));
        s.addText(rightBullets, { x: 5.4, y: 1.4, w: 3.9, h: 3.2, valign: "top" });
    }

    addSlideNumber(s, theme, slideNum, total);
}

// 6. Grid 3
export async function layoutGrid3(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);
    const items = getItems(slide);

    s.addText(stripHtml(slide.title), {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 28, fontFace: getThemeFont(theme), bold: true,
        color: hexColor(theme.colors.heading), align: "center",
    });

    const colWidth = 2.9;
    const colGap = 0.3;
    const startX = 0.5;
    const cardFill = processColor(theme.colors.surface || theme.colors.backgroundAlt, 10);
    const cardLine = processColor(theme.colors.border || theme.colors.primary);

    for (let col = 0; col < 3; col++) {
        const x = startX + col * (colWidth + colGap);
        s.addShape("roundRect", {
            x, y: 1.2, w: colWidth, h: 3.6,
            fill: cardFill,
            line: { color: cardLine.color, width: 1 },
        });

        // Distribute items
        const itemsPerCol = Math.ceil(items.length / 3);
        const colItems = items.slice(col * itemsPerCol, (col + 1) * itemsPerCol);

        if (colItems.length > 0) {
            const bullets: PptxGenJS.TextProps[] = colItems.map(item => ({
                text: item.label ? item.label + ": " + item.text : item.text,
                options: { fontSize: 13, fontFace: getThemeFont(theme), color: hexColor(theme.colors.text), bullet: { type: "bullet" }, paraSpaceAfter: 6 }
            }));
            s.addText(bullets, { x: x + 0.15, y: 1.4, w: colWidth - 0.3, h: 3.2, valign: "top" });
        }
    }

    addSlideNumber(s, theme, slideNum, total);
}

// 7. Grid 4 (2x2)
export async function layoutGrid4(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);
    const items = getItems(slide);

    s.addText(stripHtml(slide.title), {
        x: 0.5, y: 0.2, w: 9, h: 0.6,
        fontSize: 26, fontFace: getThemeFont(theme), bold: true,
        color: hexColor(theme.colors.heading), align: "center",
    });

    const cardW = 4.3;
    const cardH = 1.8;
    const positions = [
        { x: 0.5, y: 1.0 }, { x: 5.2, y: 1.0 },
        { x: 0.5, y: 3.0 }, { x: 5.2, y: 3.0 },
    ];

    const cardFill = processColor(theme.colors.surface || theme.colors.backgroundAlt, 10);
    const cardLine = processColor(theme.colors.border || theme.colors.primary);

    for (let i = 0; i < 4; i++) {
        const pos = positions[i];
        if (!pos) continue;

        s.addShape("roundRect", {
            x: pos.x, y: pos.y, w: cardW, h: cardH,
            fill: cardFill,
            line: { color: cardLine.color, width: 1 },
        });

        if (items[i]) {
            const item = items[i];
            if (item!.label) {
                s.addText(item!.label, {
                    x: pos.x + 0.2, y: pos.y + 0.15, w: cardW - 0.4, h: 0.4,
                    fontSize: 14, fontFace: getThemeFont(theme), bold: true,
                    color: hexColor(theme.colors.primary),
                });
                s.addText(item!.text, {
                    x: pos.x + 0.2, y: pos.y + 0.55, w: cardW - 0.4, h: 1.0,
                    fontSize: 12, fontFace: getThemeFont(theme),
                    color: hexColor(theme.colors.text), valign: "top",
                });
            } else {
                s.addText(item!.text, {
                    x: pos.x + 0.2, y: pos.y + 0.2, w: cardW - 0.4, h: cardH - 0.4,
                    fontSize: 13, fontFace: getThemeFont(theme),
                    color: hexColor(theme.colors.text), valign: "top",
                });
            }
        }
    }

    addSlideNumber(s, theme, slideNum, total);
}

// 8. Cards 2
export async function layoutCards2(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);
    const items = getItems(slide);

    s.addText(stripHtml(slide.title), {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 28, fontFace: getThemeFont(theme), bold: true,
        color: hexColor(theme.colors.heading), align: "center",
    });

    const cardW = 4.3;
    const cardH = 3.4;
    const positions = [{ x: 0.5, y: 1.2 }, { x: 5.2, y: 1.2 }];
    const cardFill = processColor(theme.colors.backgroundAlt, 10);
    const primary = processColor(theme.colors.primary);
    const accent = processColor(theme.colors.accent || theme.colors.primary);

    for (let i = 0; i < 2; i++) {
        const pos = positions[i]!;
        s.addShape("roundRect", {
            x: pos.x, y: pos.y, w: cardW, h: cardH,
            fill: cardFill,
            line: { color: i === 0 ? primary.color : accent.color, width: 2 },
        });

        const cardItems = items.slice(i * 3, i * 3 + 3);
        if (cardItems.length > 0) {
            const bullets: PptxGenJS.TextProps[] = cardItems.map(item => ({
                text: item.label ? item.label + ": " + item.text : item.text,
                options: { fontSize: 14, fontFace: getThemeFont(theme), color: hexColor(theme.colors.text), bullet: { type: "bullet" }, paraSpaceAfter: 8 }
            }));
            s.addText(bullets, { x: pos.x + 0.2, y: pos.y + 0.3, w: cardW - 0.4, h: cardH - 0.6, valign: "top" });
        }
    }

    addSlideNumber(s, theme, slideNum, total);
}

// 9. Cards 3
export async function layoutCards3(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);
    const items = getItems(slide);

    s.addText(stripHtml(slide.title), {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 28, fontFace: getThemeFont(theme), bold: true,
        color: hexColor(theme.colors.heading), align: "center",
    });

    const cardW = 2.9;
    const cardH = 3.4;
    const startX = 0.5;
    const gap = 0.3;
    const cardFill = processColor(theme.colors.backgroundAlt, 10);
    const primary = processColor(theme.colors.primary);

    for (let i = 0; i < 3; i++) {
        const x = startX + i * (cardW + gap);
        s.addShape("roundRect", {
            x, y: 1.2, w: cardW, h: cardH,
            fill: cardFill,
            line: { color: primary.color, width: 2 },
        });

        const cardItems = items.slice(i * 2, i * 2 + 2);
        if (cardItems.length > 0) {
            const bullets: PptxGenJS.TextProps[] = cardItems.map(item => ({
                text: item.label ? item.label + ": " + item.text : item.text,
                options: { fontSize: 12, fontFace: getThemeFont(theme), color: hexColor(theme.colors.text), bullet: { type: "bullet" }, paraSpaceAfter: 6 }
            }));
            s.addText(bullets, { x: x + 0.15, y: 1.4, w: cardW - 0.3, h: cardH - 0.4, valign: "top" });
        }
    }

    addSlideNumber(s, theme, slideNum, total);
}

// 10. Quote
export async function layoutQuote(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);
    const items = getItems(slide);
    const quoteText = items[0]?.text || slide.subtitle || "";
    const author = items[1]?.text || "";
    const prime = processColor(theme.colors.primary);

    s.addText("❝", {
        x: 0.5, y: 1.0, w: 1, h: 1,
        fontSize: 72, fontFace: getThemeFont(theme),
        color: prime.color, transparency: 50,
    });

    s.addText(stripHtml(quoteText), {
        x: 1.2, y: 1.5, w: 7.5, h: 2.5,
        fontSize: 24, fontFace: getThemeFont(theme), italic: true,
        color: hexColor(theme.colors.text), align: "center", valign: "middle",
    });

    if (author) {
        s.addText("— " + author, {
            x: 1.2, y: 4.0, w: 7.5, h: 0.5,
            fontSize: 16, fontFace: getThemeFont(theme),
            color: hexColor(theme.colors.textMuted), align: "center",
        });
    }

    addSlideNumber(s, theme, slideNum, total);
}

// 11. Stats
export async function layoutStats(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);
    const items = getItems(slide);

    s.addText(stripHtml(slide.title), {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 28, fontFace: getThemeFont(theme), bold: true,
        color: hexColor(theme.colors.heading), align: "center",
    });

    const statCount = Math.min(items.length, 4);
    const statW = statCount > 0 ? 9 / statCount : 9;
    const startX = 0.5;
    const bgAlt = processColor(theme.colors.backgroundAlt);
    const border = processColor(theme.colors.border);

    for (let i = 0; i < statCount; i++) {
        const item = items[i];
        const x = startX + i * statW;

        // Attempt to extract number vs label
        const numMatch = item!.text.match(/[\d,.]+%?/);
        const statNum = numMatch ? numMatch[0] : (i + 1).toString();
        const statLabel = item!.label || item!.text.replace(numMatch?.[0] || "", "").trim();

        s.addShape("rect", {
            x, y: 1.6, w: statW, h: 2.8,
            fill: bgAlt,
            line: { color: border.color, width: 1 },
        });

        s.addText(statNum, {
            x, y: 1.5, w: statW - 0.2, h: 1.5,
            fontSize: 48, fontFace: getThemeFont(theme), bold: true,
            color: hexColor(theme.colors.primary), align: "center", valign: "middle",
        });

        s.addText(statLabel, {
            x, y: 3.0, w: statW - 0.2, h: 1.0,
            fontSize: 14, fontFace: getThemeFont(theme),
            color: hexColor(theme.colors.text), align: "center", valign: "top",
        });
    }

    addSlideNumber(s, theme, slideNum, total);
}

// 12. Full Image
export async function layoutFullImage(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    const images = getSlideImages(slide);

    if (images[0]) {
        const imgData = await fetchImageAsBase64(images[0]);
        if (imgData) {
            s.background = { data: imgData };
        } else {
            s.background = processColor(theme.colors.background);
        }
    } else {
        s.background = processColor(theme.colors.background);
    }

    // Dark overlay
    s.addShape("rect", {
        x: 0, y: 0, w: "100%", h: "100%",
        fill: { color: "000000", transparency: 40 },
    });

    s.addText(stripHtml(slide.title), {
        x: 0.5, y: 2.0, w: 9, h: 1.5,
        fontSize: 36, fontFace: getThemeFont(theme), bold: true,
        color: "FFFFFF", align: "center", valign: "middle",
    });

    if (slide.subtitle) {
        s.addText(stripHtml(slide.subtitle), {
            x: 0.5, y: 3.5, w: 9, h: 0.8,
            fontSize: 18, fontFace: getThemeFont(theme),
            color: "FFFFFF", align: "center", transparency: 20,
        });
    }

    s.addText(slideNum + " / " + total, {
        x: 8.5, y: 5.2, w: 1.2, h: 0.3,
        fontSize: 10, fontFace: getThemeFont(theme),
        color: "FFFFFF", align: "right", transparency: 30,
    });
}

// 13. Timeline
export async function layoutTimeline(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);
    const items = getItems(slide);
    const prime = processColor(theme.colors.primary);

    s.addText(stripHtml(slide.title), {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 28, fontFace: getThemeFont(theme), bold: true,
        color: hexColor(theme.colors.heading), align: "center",
    });

    s.addShape("rect", {
        x: 0.8, y: 2.5, w: 8.4, h: 0.05,
        fill: prime,
    });

    const pointCount = Math.min(items.length, 4);
    const spacing = pointCount > 0 ? 8.4 / (pointCount + 1) : 2;

    for (let i = 0; i < pointCount; i++) {
        const item = items[i]!;
        const x = 0.8 + spacing * (i + 1);

        s.addShape("ellipse", {
            x: x - 0.15, y: 2.35, w: 0.3, h: 0.3,
            fill: prime,
        });

        if (item.label) {
            s.addText(item.label, {
                x: x - 1, y: 1.5, w: 2, h: 0.6,
                fontSize: 12, fontFace: getThemeFont(theme), bold: true,
                color: prime.color, align: "center",
            });
        }

        s.addText(item.text, {
            x: x - 1, y: 2.8, w: 2, h: 1.5,
            fontSize: 11, fontFace: getThemeFont(theme),
            color: hexColor(theme.colors.text), align: "center", valign: "top",
        });
    }

    addSlideNumber(s, theme, slideNum, total);
}

// 14. Comparison
export async function layoutComparison(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    slideNum: number,
    total: number
) {
    const s = pptx.addSlide();
    await addBackground(s, theme);
    const items = getItems(slide);
    const prime = processColor(theme.colors.primary);
    const sec = processColor(theme.colors.secondary || theme.colors.primary);

    s.addText(stripHtml(slide.title), {
        x: 0.5, y: 0.3, w: 9, h: 0.7,
        fontSize: 28, fontFace: getThemeFont(theme), bold: true,
        color: hexColor(theme.colors.heading), align: "center",
    });

    s.addShape("roundRect", {
        x: 0.5, y: 1.1, w: 4.3, h: 0.6,
        fill: prime,
    });
    s.addText(items[0]?.label || "Option A", {
        x: 0.5, y: 1.1, w: 4.3, h: 0.6,
        fontSize: 16, fontFace: getThemeFont(theme), bold: true,
        color: "FFFFFF", align: "center", valign: "middle",
    });

    s.addShape("roundRect", {
        x: 5.2, y: 1.1, w: 4.3, h: 0.6,
        fill: sec,
    });
    s.addText(items[1]?.label || "Option B", {
        x: 5.2, y: 1.1, w: 4.3, h: 0.6,
        fontSize: 16, fontFace: getThemeFont(theme), bold: true,
        color: "FFFFFF", align: "center", valign: "middle",
    });

    const leftItems = items.filter((_, i) => i % 2 === 0).slice(0, 4);
    if (leftItems.length > 0) {
        const leftBullets: PptxGenJS.TextProps[] = leftItems.map(item => ({
            text: item.text,
            options: { fontSize: 13, fontFace: getThemeFont(theme), color: hexColor(theme.colors.text), bullet: { type: "bullet" }, paraSpaceAfter: 8 }
        }));
        s.addText(leftBullets, { x: 0.7, y: 1.9, w: 3.9, h: 2.8, valign: "top" });
    }

    const rightItems = items.filter((_, i) => i % 2 === 1).slice(0, 4);
    if (rightItems.length > 0) {
        const rightBullets: PptxGenJS.TextProps[] = rightItems.map(item => ({
            text: item.text,
            options: { fontSize: 13, fontFace: getThemeFont(theme), color: hexColor(theme.colors.text), bullet: { type: "bullet" }, paraSpaceAfter: 8 }
        }));
        s.addText(rightBullets, { x: 5.4, y: 1.9, w: 3.9, h: 2.8, valign: "top" });
    }

    addSlideNumber(s, theme, slideNum, total);
}

// Helper
function addSlideNumber(s: PptxGenJS.Slide, theme: Theme, num: number, total: number) {
    if (num === 0) return; // For templates, typically we might want a placeholder, but handled by caller?
    s.addText(num + " / " + total, {
        x: 8.5, y: 5.2, w: 1.2, h: 0.3,
        fontSize: 10, fontFace: getThemeFont(theme),
        color: hexColor(theme.colors.textMuted), align: "right",
    });
}

// ==========================================
// Main Switch
// ==========================================

export async function generateSlideLayout(
    pptx: PptxGenJS,
    slide: SlideData,
    theme: Theme,
    index: number,
    total: number
): Promise<void> {
    const layout = slide.layout || "title-center"; // Default

    switch (layout) {
        case "title-center":
        case "centered":
            await layoutTitleCenter(pptx, slide, theme, index + 1, total);
            break;

        case "title-left":
        case "minimal-left":
            await layoutTitleLeft(pptx, slide, theme, index + 1, total);
            break;

        case "content-left-image-right":
        case "left-content":
            await layoutContentLeftImageRight(pptx, slide, theme, index + 1, total);
            break;

        case "content-right-image-left":
        case "right-content":
            await layoutContentRightImageLeft(pptx, slide, theme, index + 1, total);
            break;

        case "content-grid-2":
        case "grid-2-col":
        case "content-cards-2":
        case "cards-2":
            await layoutGrid2(pptx, slide, theme, index + 1, total);
            break;

        case "content-cards-2":
            await layoutCards2(pptx, slide, theme, index + 1, total);
            break;

        case "content-grid-3":
        case "grid-3-col":
            await layoutGrid3(pptx, slide, theme, index + 1, total);
            break;

        case "content-cards-3":
        case "cards-3":
            await layoutCards3(pptx, slide, theme, index + 1, total);
            break;

        case "content-grid-4":
        case "grid-4-card":
            await layoutGrid4(pptx, slide, theme, index + 1, total);
            break;

        case "content-quote":
        case "quote-style":
            await layoutQuote(pptx, slide, theme, index + 1, total);
            break;

        case "content-stats":
        case "stats-grid":
            await layoutStats(pptx, slide, theme, index + 1, total);
            break;

        case "content-full-image":
        case "full-image":
            await layoutFullImage(pptx, slide, theme, index + 1, total);
            break;

        case "content-timeline":
        case "timeline":
            await layoutTimeline(pptx, slide, theme, index + 1, total);
            break;

        case "content-comparison":
        case "comparison":
            await layoutComparison(pptx, slide, theme, index + 1, total);
            break;

        default:
            // Fallback
            if (slide.type === "title") {
                await layoutTitleCenter(pptx, slide, theme, index + 1, total);
            } else {
                const images = getSlideImages(slide);
                if (images.length > 0) {
                    await layoutContentLeftImageRight(pptx, slide, theme, index + 1, total);
                } else {
                    // Just simple content
                    const s = pptx.addSlide();
                    await addBackground(s, theme);
                    s.addText(stripHtml(slide.title), {
                        x: 0.5, y: 0.3, w: 9, h: 0.7,
                        fontSize: 28, fontFace: getThemeFont(theme), bold: true,
                        color: hexColor(theme.colors.heading), align: "left"
                    });
                    const items = getItems(slide);
                    if (items.length > 0) {
                        const bullets: PptxGenJS.TextProps[] = items.map(item => ({
                            text: item.text,
                            options: { fontSize: 15, fontFace: getThemeFont(theme), color: hexColor(theme.colors.text), bullet: { type: "bullet" } }
                        }));
                        s.addText(bullets, { x: 0.5, y: 1.2, w: 9, h: 4.0, valign: "top" });
                    }
                    addSlideNumber(s, theme, index + 1, total);
                }
            }
            break;
    }
}
