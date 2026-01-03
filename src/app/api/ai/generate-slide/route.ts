import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "~/server/db";
import { env } from "~/env";
import { searchPexelsPhotos } from "~/lib/pexels";
import { type LayoutType, slideLayouts } from "~/lib/slide-layouts";
import { CHART_TEMPLATES, type ChartType, type ChartDataPoint } from "~/lib/charts/types";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

interface SlideImage {
  url: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
  source: string;
}

interface SlideChart {
  type: ChartType;
  title?: string;
  data: ChartDataPoint[];
  config?: {
    showLegend?: boolean;
    showLabels?: boolean;
    showValues?: boolean;
    showGrid?: boolean;
    unit?: string;
    prefix?: string;
  };
}

interface GeneratedSlide {
  type: "content";
  title: string;
  bulletPoints: string[];
  introText?: string;
  layout?: LayoutType;
  slideLayout?: string;
  imageSize?: string;
  imageSearch?: string;
  image?: SlideImage | null;
  chart?: SlideChart | null;
}

// Available layouts for AI reference
const layoutOptions = slideLayouts.slice(0, 10).map(l => ({
  id: l.id,
  name: l.name,
  description: l.description,
}));

// Chart types for AI reference with data requirements
const chartTypeOptions = [
  { 
    type: "bar", 
    description: "Vertical bars for comparing categories",
    bestFor: "Comparing discrete categories, showing rankings",
    dataFormat: "3-7 items with label and numeric value",
    example: [{ label: "Q1", value: 45000 }, { label: "Q2", value: 52000 }]
  },
  { 
    type: "horizontal-bar", 
    description: "Horizontal bars for ranking or comparison",
    bestFor: "Rankings, long category names, many items",
    dataFormat: "3-10 items with label and numeric value",
    example: [{ label: "Product A", value: 85 }, { label: "Product B", value: 72 }]
  },
  { 
    type: "line", 
    description: "Line chart for trends over time",
    bestFor: "Time series, trends, continuous data",
    dataFormat: "5-12 sequential points (dates, months, years)",
    example: [{ label: "Jan", value: 100 }, { label: "Feb", value: 120 }]
  },
  { 
    type: "area", 
    description: "Filled area chart for volume/trends",
    bestFor: "Volume over time, cumulative data, trends with emphasis",
    dataFormat: "5-12 sequential points",
    example: [{ label: "Mon", value: 2400 }, { label: "Tue", value: 3200 }]
  },
  { 
    type: "pie", 
    description: "Pie chart for showing proportions/percentages",
    bestFor: "Market share, budget allocation, composition (parts of whole)",
    dataFormat: "2-6 items that sum to 100% or a total",
    example: [{ label: "Marketing", value: 35 }, { label: "Sales", value: 28 }]
  },
  { 
    type: "donut", 
    description: "Donut chart for proportions with center metric",
    bestFor: "Same as pie but with total displayed in center",
    dataFormat: "2-6 items representing parts of a whole",
    example: [{ label: "Complete", value: 75 }, { label: "Remaining", value: 25 }]
  },
  { 
    type: "comparison", 
    description: "Side-by-side metric cards for comparing values",
    bestFor: "Comparing 2-4 key metrics, KPI overview",
    dataFormat: "2-4 items with distinct metrics",
    example: [{ label: "Revenue", value: 125000 }, { label: "Users", value: 8500 }]
  },
  { 
    type: "funnel", 
    description: "Funnel chart for conversion/process stages",
    bestFor: "Sales funnel, conversion rates, process stages",
    dataFormat: "3-6 items in decreasing order (stages)",
    example: [{ label: "Visitors", value: 10000 }, { label: "Leads", value: 5000 }]
  },
  { 
    type: "progress", 
    description: "Progress bars for showing completion",
    bestFor: "Goal progress, completion rates, multiple metrics",
    dataFormat: "2-5 items with values 0-100 (percentages)",
    example: [{ label: "Project A", value: 85 }, { label: "Project B", value: 60 }]
  },
  { 
    type: "kpi", 
    description: "Single KPI metric with trend indicator",
    bestFor: "Highlighting one key metric with trend",
    dataFormat: "Single item with value, optional trend",
    example: [{ label: "Revenue", value: 125000 }]
  },
];

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // AI slide generation costs 4 credits
    const CREDIT_COST = 4;
    if (user.credits < CREDIT_COST) {
      return NextResponse.json(
        { 
          error: "Insufficient credits",
          required: CREDIT_COST,
          available: user.credits,
        },
        { status: 403 }
      );
    }

    const { prompt, presentationContext, previousSlide, nextSlide } = await req.json() as { 
      prompt: string;
      presentationContext?: string;
      previousSlide?: { title: string; bulletPoints?: string[] };
      nextSlide?: { title: string; bulletPoints?: string[] };
    };

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const contextInfo = presentationContext 
      ? `\nPresentation topic: "${presentationContext}"`
      : "";
    
    const prevSlideInfo = previousSlide
      ? `\nPrevious slide: "${previousSlide.title}"${previousSlide.bulletPoints?.length ? ` with points: ${previousSlide.bulletPoints.slice(0, 3).join(", ")}` : ""}`
      : "";
    
    const nextSlideInfo = nextSlide
      ? `\nNext slide: "${nextSlide.title}"`
      : "";

    const systemPrompt = `You are an expert presentation designer. Create a single content slide based on the user's request.

## CONTEXT${contextInfo}${prevSlideInfo}${nextSlideInfo}

## AVAILABLE CONTENT LAYOUTS:
${JSON.stringify(layoutOptions, null, 2)}

## SLIDE LAYOUT OPTIONS (slideLayout field):
- "chart-left" - Chart on left (50%), content on right (use when chart is included)
- "chart-right" - Chart on right (50%), content on left (use when chart is included)
- "image-left" - Image on left, content on right (NO chart)
- "image-right" - Image on right, content on left (NO chart)
- "no-image" - No image, full content (can have chart below content)

## IMPORTANT: CHART vs IMAGE - MUTUALLY EXCLUSIVE
- If you include a CHART, do NOT include imageSearch (set to null)
- If you include an IMAGE (imageSearch), do NOT include chart (set to null)
- A slide should have EITHER a chart OR an image, NEVER both

## CHART TYPE GUIDE (choose based on data type):
${chartTypeOptions.map(c => `- "${c.type}": ${c.description}
  Best for: ${c.bestFor}
  Data: ${c.dataFormat}`).join("\n")}

## RESPONSE FORMAT:
Return a JSON object with the slide content:
{
  "type": "content",
  "title": "Slide Title",
  "bulletPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "introText": "Optional intro paragraph",
  "slideLayout": "chart-right",
  "imageSearch": null,
  "chart": { ... }
}

OR for image slides:
{
  "type": "content",
  "title": "Slide Title",
  "bulletPoints": ["Point 1", "Point 2", "Point 3"],
  "slideLayout": "image-right",
  "imageSearch": "search term for image",
  "chart": null
}

## CHART DECISION GUIDE:
Include a chart when content involves:
- Statistics or percentages → use "pie", "donut", or "bar"
- Trends over time → use "line" or "area"
- Rankings or comparisons → use "bar" or "horizontal-bar"
- Market share or composition → use "pie" or "donut"
- Process stages or conversions → use "funnel"
- Progress or completion → use "progress"
- Single key metric → use "kpi" or "comparison"

Use an IMAGE instead when:
- Conceptual or qualitative content
- Lists of features or benefits without numbers
- Introductions or conclusions
- Content without specific data points
- Visual storytelling needed

## CHART FORMAT (when including a chart):
{
  "chart": {
    "type": "bar",
    "title": "Chart Title",
    "data": [
      { "label": "Category A", "value": 75 },
      { "label": "Category B", "value": 60 },
      { "label": "Category C", "value": 45 }
    ],
    "config": {
      "showLegend": true,
      "showLabels": true,
      "showValues": true,
      "showGrid": true,
      "unit": "%"
    }
  }
}

## RULES:
1. Return ONLY valid JSON
2. ALWAYS include bulletPoints array with 3-5 points
3. NEVER include both chart and imageSearch - they are mutually exclusive
4. If chart is included, set imageSearch to null and use slideLayout "chart-left" or "chart-right"
5. If imageSearch is included, set chart to null and use slideLayout "image-left" or "image-right"
6. Chart data values should be realistic and match the content being discussed
7. Match chart type to data type (see Chart Decision Guide above)
8. NO HTML tags in content
9. For time-based data, use line/area charts with sequential labels
10. For categorical comparisons, use bar charts with descriptive labels
11. For proportions that sum to 100%, use pie/donut charts`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a slide: "${prompt}"` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "{}";
    
    let generatedSlide: GeneratedSlide;
    try {
      generatedSlide = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Ensure required fields
    generatedSlide.type = "content";
    if (!generatedSlide.title) {
      generatedSlide.title = "New Slide";
    }
    if (!generatedSlide.bulletPoints || generatedSlide.bulletPoints.length === 0) {
      generatedSlide.bulletPoints = ["Content point 1", "Content point 2", "Content point 3"];
    }

    // ENFORCE MUTUAL EXCLUSIVITY: Chart OR Image, never both
    if (generatedSlide.chart) {
      // If we have a chart, remove any image search
      delete generatedSlide.imageSearch;
      generatedSlide.image = null;
      
      // Validate chart type
      const validChartTypes: ChartType[] = ["bar", "horizontal-bar", "line", "area", "pie", "donut", "comparison", "funnel", "progress", "kpi", "gauge", "radar", "table"];
      if (!validChartTypes.includes(generatedSlide.chart.type)) {
        generatedSlide.chart.type = "bar";
      }
      // Ensure chart has valid data
      if (!generatedSlide.chart.data || generatedSlide.chart.data.length === 0) {
        generatedSlide.chart.data = [
          { label: "Category A", value: 75 },
          { label: "Category B", value: 60 },
          { label: "Category C", value: 45 },
        ];
      }
      // Ensure config exists
      if (!generatedSlide.chart.config) {
        generatedSlide.chart.config = {
          showLegend: true,
          showLabels: true,
          showValues: true,
          showGrid: true,
        };
      }
      
      // Set chart layout - chart on left or right
      const chartLayouts = ["chart-left", "chart-right"];
      if (!generatedSlide.slideLayout || !chartLayouts.includes(generatedSlide.slideLayout)) {
        generatedSlide.slideLayout = "chart-right";
      }
    } else if (generatedSlide.imageSearch) {
      // If we have image search, ensure no chart
      generatedSlide.chart = null;
      
      // Fetch image from Pexels
      try {
        const photos = await searchPexelsPhotos(generatedSlide.imageSearch, 5);
        if (photos.length > 0) {
          const photo = photos[Math.floor(Math.random() * photos.length)]!;
          generatedSlide.image = {
            url: photo.src.large,
            alt: photo.alt || generatedSlide.imageSearch,
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            source: "pexels",
          };
        }
        delete generatedSlide.imageSearch;
      } catch (err) {
        console.error("Failed to fetch image:", err);
        delete generatedSlide.imageSearch;
      }
      
      // Set image layout
      const imageLayouts = ["image-left", "image-right", "image-top", "image-bottom"];
      if (!generatedSlide.slideLayout || !imageLayouts.includes(generatedSlide.slideLayout)) {
        generatedSlide.slideLayout = generatedSlide.image ? "image-right" : "no-image";
      }
    } else {
      // No chart or image
      generatedSlide.slideLayout = "no-image";
    }

    // Validate imageSize
    const validImageSizes = ["small", "medium", "large", "full"];
    if (generatedSlide.imageSize && !validImageSizes.includes(generatedSlide.imageSize)) {
      generatedSlide.imageSize = "medium";
    }

    // Deduct credits
    await db.user.update({
      where: { id: user.id },
      data: { credits: { decrement: CREDIT_COST } },
    });

    // Invalidate cache
    const { serverCache } = await import("~/lib/server-cache");
    serverCache.invalidatePattern(`user-${user.id}`);

    return NextResponse.json({ 
      success: true,
      slide: generatedSlide,
      creditsUsed: CREDIT_COST,
      creditsRemaining: user.credits - CREDIT_COST,
    });
  } catch (error) {
    console.error("AI generate slide error:", error);
    return NextResponse.json(
      { error: "Failed to generate slide" },
      { status: 500 }
    );
  }
}
