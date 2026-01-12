import { type NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";

// Theme colors for preview
const THEME_COLORS: Record<string, { title: string; body: string; accent: string }> = {
  sprout: {
    title: "#0d5c4a",
    body: "#2d3b2d",
    accent: "#0d5c4a",
  },
};

const DEFAULT_COLORS = {
  title: "#1a1a1a",
  body: "#4a4a4a",
  accent: "#3b82f6",
};

// Font URLs from Google Fonts (gstatic)
const NOTO_SERIF_SC_URL = "https://fonts.gstatic.com/s/notoserifsc/v34/H4chBXePl9DZ0Xe7gG9cyOj7kqGWbg.woff2";
const GEIST_URL = "https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwcGFU.woff2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ themeId: string }> }
) {
  const { themeId } = await params;
  const colors = THEME_COLORS[themeId] || DEFAULT_COLORS;
  const { title: titleColor, body: bodyColor, accent: accentColor } = colors;

  try {
    const [notoSerifData, geistData] = await Promise.all([
      fetch(NOTO_SERIF_SC_URL).then((res) => res.arrayBuffer()),
      fetch(GEIST_URL).then((res) => res.arrayBuffer()),
    ]);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px",
          }}
        >
          <div
            style={{
              fontFamily: "Noto Serif SC",
              fontSize: 100,
              fontWeight: 700,
              color: titleColor,
              marginBottom: 20,
            }}
          >
            Title
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span
              style={{
                fontFamily: "Geist",
                fontSize: 40,
                fontWeight: 400,
                color: bodyColor,
              }}
            >
              Body &amp;{" "}
            </span>
            <span
              style={{
                fontFamily: "Geist",
                fontSize: 40,
                fontWeight: 400,
                color: accentColor,
                textDecoration: "underline",
                textUnderlineOffset: "8px",
              }}
            >
              link
            </span>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 315,
        fonts: [
          { name: "Noto Serif SC", data: notoSerifData, weight: 700, style: "normal" },
          { name: "Geist", data: geistData, weight: 400, style: "normal" },
        ],
      }
    );
  } catch (error) {
    console.log("ImageResponse failed, using SVG fallback:", error);

    const svg = `<svg width="600" height="315" viewBox="0 0 600 315" xmlns="http://www.w3.org/2000/svg">
  <text x="60" y="140" font-family="Georgia, serif" font-size="100" font-weight="700" fill="${titleColor}">Title</text>
  <text x="60" y="220" font-family="system-ui, sans-serif" font-size="40" fill="${bodyColor}">Body &amp; </text>
  <text x="215" y="220" font-family="system-ui, sans-serif" font-size="40" fill="${accentColor}">link</text>
  <line x1="215" y1="230" x2="295" y2="230" stroke="${accentColor}" stroke-width="3"/>
</svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
