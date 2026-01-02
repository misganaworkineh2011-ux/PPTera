import { type NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import React from "react";

// Theme colors for preview
const THEME_COLORS: Record<string, { title: string; body: string; accent: string }> = {
  sprout: {
    title: "#006747",
    body: "#4b4a4a",
    accent: "#006747",
  },
};

const DEFAULT_COLORS = {
  title: "#1a1a1a",
  body: "#4a4a4a",
  accent: "#3b82f6",
};

// Font URLs from Google Fonts (gstatic) - same approach as Gamma
const NOTO_SERIF_SC_URL = "https://fonts.gstatic.com/s/notoserifsc/v34/H4chBXePl9DZ0Xe7gG9cyOj7kqGWbg.woff2";
const GEIST_URL = "https://fonts.gstatic.com/s/geist/v4/gyByhwUxId8gMEwcGFU.woff2";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ themeId: string }> }
) {
  const { themeId } = await params;
  const colors = THEME_COLORS[themeId] || DEFAULT_COLORS;
  const { title: titleColor, body: bodyColor, accent: accentColor } = colors;

  // Try Satori/ImageResponse first (works on Vercel, may fail locally with woff2)
  try {
    const [notoSerifData, geistData] = await Promise.all([
      fetch(NOTO_SERIF_SC_URL).then((res) => res.arrayBuffer()),
      fetch(GEIST_URL).then((res) => res.arrayBuffer()),
    ]);

    return new ImageResponse(
      React.createElement(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px",
            backgroundColor: "white",
          },
        },
        // Title
        React.createElement(
          "div",
          {
            style: {
              fontFamily: "Noto Serif SC",
              fontSize: 120,
              fontWeight: 700,
              color: titleColor,
              marginBottom: 30,
            },
          },
          "Title"
        ),
        // Body & link container
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "8px",
            },
          },
          // Body text
          React.createElement(
            "span",
            {
              style: {
                fontFamily: "Geist",
                fontSize: 48,
                fontWeight: 400,
                color: bodyColor,
              },
            },
            "Body & "
          ),
          // Link with underline
          React.createElement(
            "span",
            {
              style: {
                fontFamily: "Geist",
                fontSize: 48,
                fontWeight: 400,
                color: accentColor,
                borderBottom: `3px solid ${accentColor}`,
                paddingBottom: "4px",
              },
            },
            "link"
          )
        )
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "Noto Serif SC", data: notoSerifData, weight: 700, style: "normal" },
          { name: "Geist", data: geistData, weight: 400, style: "normal" },
        ],
      }
    );
  } catch (error) {
    // Fallback: simple SVG with system fonts (works locally)
    console.log("ImageResponse failed, using SVG fallback:", error);

    const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="white"/>
  <text x="60" y="280" font-family="Georgia, 'Times New Roman', serif" font-size="120" font-weight="700" fill="${titleColor}">Title</text>
  <text x="60" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="48" fill="${bodyColor}">Body &amp; </text>
  <text x="270" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="48" fill="${accentColor}">link</text>
  <line x1="270" y1="410" x2="370" y2="410" stroke="${accentColor}" stroke-width="3"/>
</svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
