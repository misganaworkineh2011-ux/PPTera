import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as XLSX from "xlsx";
import type { ChartData, ChartDataPoint, ChartType } from "~/lib/charts/types";

// Use Node.js runtime for file parsing libraries
export const runtime = "nodejs";
export const maxDuration = 30; // 30 seconds timeout for large files

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CHARTS = 5; // cap total charts across the workbook
const MAX_POINTS_PER_CHART = 12; // cap categories/points per chart
const MAX_TABLE_ROWS = 20; // rows kept per sheet in `tables`
const NUMBER_THRESHOLD = 0.7; // >=70% numeric -> "number" column
const PIE_MAX_CATEGORIES = 6; // <=6 distinct categories may become pie/donut

const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"] as const;
const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "text/csv", // .csv
  "application/csv",
  "text/plain", // some browsers send csv as text/plain
];

const DEFAULT_CONFIG = {
  showValues: true,
  showGrid: true,
  showLegend: true,
  colorScheme: "theme" as const,
  showAnimation: true,
};

// ---------------------------------------------------------------------------
// Types (internal)
// ---------------------------------------------------------------------------

type ColumnType = "number" | "date" | "category";

type Cell = string | number | boolean | Date | null | undefined;

interface NumericStats {
  sum: number;
  average: number;
  min: number;
  max: number;
  count: number;
  trend: "up" | "down" | "neutral";
}

interface ColumnInfo {
  index: number;
  header: string;
  type: ColumnType;
  stats?: NumericStats;
}

interface SheetAnalysis {
  sheetName: string;
  headers: string[];
  columns: ColumnInfo[];
  dataRows: Cell[][];
  rowCount: number;
  columnCount: number;
}

interface TableResult {
  sheetName: string;
  headers: string[];
  rows: (string | number | null)[][];
}

// ---------------------------------------------------------------------------
// Number / value parsing helpers
// ---------------------------------------------------------------------------

/**
 * Attempt to parse a cell as a finite number. Strips thousands separators,
 * percent signs, and common currency symbols ($ £ €) before parsing.
 * Returns null when the value is not a finite number.
 */
function parseNumeric(value: Cell): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return null;
  if (value instanceof Date) return null;

  const raw = String(value).trim();
  if (raw === "") return null;

  // Strip currency symbols, whitespace, thousands separators, and percent.
  // Keep digits, sign, decimal point, and a possible exponent.
  let cleaned = raw
    .replace(/[$£€¥₹]/g, "")
    .replace(/%/g, "")
    .replace(/\s+/g, "")
    .replace(/,/g, "");

  // Handle parenthesised negatives e.g. "(1,200)" -> -1200
  let negative = false;
  if (/^\(.*\)$/.test(cleaned)) {
    negative = true;
    cleaned = cleaned.slice(1, -1);
  }

  if (cleaned === "" || cleaned === "-" || cleaned === "+") return null;

  // Reject strings that still contain non-numeric characters.
  if (!/^[+-]?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/.test(cleaned)) return null;

  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return null;
  return negative ? -parsed : parsed;
}

/**
 * Attempt to interpret a cell as a date. Returns a Date or null.
 * Only treats already-typed Date instances and clearly date-like strings
 * (containing separators) as dates, to avoid misclassifying plain numbers.
 */
function parseDate(value: Cell): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string") return null;

  const raw = value.trim();
  if (raw === "") return null;

  // Require something that looks like a date (has a separator and digits).
  if (!/[-/.]/.test(raw) || !/\d/.test(raw)) return null;
  // Avoid treating plain decimals (e.g. "12.5") as dates.
  if (/^[+-]?\d+(\.\d+)?$/.test(raw)) return null;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isStringLike(value: Cell): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "number" || typeof value === "boolean") return false;
  if (value instanceof Date) return false;
  const raw = String(value).trim();
  if (raw === "") return false;
  // A "string-like" header cell is text that is not purely numeric.
  return parseNumeric(value) === null;
}

function isBlank(value: Cell): boolean {
  if (value === null || value === undefined) return true;
  return String(value).trim() === "";
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/** Round to a sensible precision based on magnitude. */
function roundValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const abs = Math.abs(value);
  if (abs === 0) return 0;
  if (abs >= 1000) return Math.round(value);
  if (abs >= 1) return Math.round(value * 100) / 100;
  return Math.round(value * 10000) / 10000;
}

/** Compact human-readable number for the summary string. */
function formatNumber(value: number): string {
  const rounded = roundValue(value);
  return rounded.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatDateLabel(value: Cell): string {
  const d = parseDate(value);
  if (d) {
    // YYYY-MM-DD, dropping time when midnight.
    const iso = d.toISOString();
    return d.getUTCHours() === 0 && d.getUTCMinutes() === 0
      ? iso.slice(0, 10)
      : iso.slice(0, 16).replace("T", " ");
  }
  return cellToString(value);
}

function cellToString(value: Cell): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return formatDateLabel(value);
  return String(value).trim();
}

/** Normalize a cell for the `tables` payload: string | number | null. */
function cellForTable(value: Cell): string | number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (value instanceof Date) return formatDateLabel(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  const raw = String(value);
  return raw.trim() === "" ? null : raw;
}

// ---------------------------------------------------------------------------
// Column classification + stats
// ---------------------------------------------------------------------------

function computeStats(values: number[]): NumericStats {
  if (values.length === 0) {
    return { sum: 0, average: 0, min: 0, max: 0, count: 0, trend: "neutral" };
  }
  let sum = 0;
  let min = values[0]!;
  let max = values[0]!;
  for (const v of values) {
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const average = sum / values.length;
  const first = values[0]!;
  const last = values[values.length - 1]!;
  let trend: "up" | "down" | "neutral" = "neutral";
  if (last > first) trend = "up";
  else if (last < first) trend = "down";

  return {
    sum: roundValue(sum),
    average: roundValue(average),
    min: roundValue(min),
    max: roundValue(max),
    count: values.length,
    trend,
  };
}

/**
 * Classify a single column from its data cells. Records numeric stats when
 * the column is numeric.
 */
function classifyColumn(
  index: number,
  header: string,
  dataRows: Cell[][],
): ColumnInfo {
  const cells: Cell[] = dataRows.map((row) => row[index]);
  const nonBlank = cells.filter((c) => !isBlank(c));

  if (nonBlank.length === 0) {
    return { index, header, type: "category" };
  }

  // Count numeric and date matches.
  const numericValues: number[] = [];
  let numericCount = 0;
  let dateCount = 0;

  for (const cell of nonBlank) {
    const num = parseNumeric(cell);
    if (num !== null) {
      numericCount += 1;
      numericValues.push(num);
      continue;
    }
    if (parseDate(cell) !== null) {
      dateCount += 1;
    }
  }

  const numericRatio = numericCount / nonBlank.length;
  const dateRatio = dateCount / nonBlank.length;

  if (numericRatio >= NUMBER_THRESHOLD) {
    return {
      index,
      header,
      type: "number",
      stats: computeStats(numericValues),
    };
  }

  if (dateRatio >= NUMBER_THRESHOLD) {
    return { index, header, type: "date" };
  }

  return { index, header, type: "category" };
}

// ---------------------------------------------------------------------------
// Header detection + sheet parsing
// ---------------------------------------------------------------------------

/**
 * Detect the header row index within the array-of-arrays. Returns the index of
 * the first non-empty row whose cells are mostly strings, or -1 if none.
 */
function detectHeaderRowIndex(rows: Cell[][]): number {
  const limit = Math.min(rows.length, 10); // only scan the first few rows
  for (let i = 0; i < limit; i++) {
    const row = rows[i]!;
    const nonBlank = row.filter((c) => !isBlank(c));
    if (nonBlank.length === 0) continue;
    const stringCells = nonBlank.filter((c) => isStringLike(c)).length;
    if (stringCells / nonBlank.length >= 0.6) {
      return i;
    }
    // First non-empty row that is NOT a string header -> no header; stop.
    return -1;
  }
  return -1;
}

/** Build clean, unique, non-empty header strings from a raw header row. */
function buildHeaders(rawHeaderRow: Cell[], columnCount: number): string[] {
  const headers: string[] = [];
  const seen = new Map<string, number>();
  for (let i = 0; i < columnCount; i++) {
    let name = cellToString(rawHeaderRow[i]);
    if (name === "") name = `Column ${i + 1}`;
    // De-duplicate.
    if (seen.has(name)) {
      const next = seen.get(name)! + 1;
      seen.set(name, next);
      name = `${name} (${next})`;
    } else {
      seen.set(name, 1);
    }
    headers.push(name);
  }
  return headers;
}

/** Analyze a single worksheet; returns null for empty sheets. */
function analyzeSheet(
  sheetName: string,
  sheet: XLSX.WorkSheet,
): SheetAnalysis | null {
  const rows = XLSX.utils.sheet_to_json<Cell[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: null,
  });

  if (!rows || rows.length === 0) return null;

  // Determine the max column count across all rows.
  let columnCount = 0;
  for (const row of rows) {
    if (Array.isArray(row) && row.length > columnCount) columnCount = row.length;
  }
  if (columnCount === 0) return null;

  // Normalize ragged rows to a consistent width.
  const normalized: Cell[][] = rows.map((row) => {
    const r = Array.isArray(row) ? row.slice() : [];
    while (r.length < columnCount) r.push(null);
    return r;
  });

  const headerIndex = detectHeaderRowIndex(normalized);

  let headers: string[];
  let dataRows: Cell[][];

  if (headerIndex >= 0) {
    headers = buildHeaders(normalized[headerIndex]!, columnCount);
    dataRows = normalized.slice(headerIndex + 1);
  } else {
    headers = buildHeaders([], columnCount); // synthesizes "Column 1", ...
    dataRows = normalized;
  }

  // Drop fully-blank trailing/interspersed rows.
  dataRows = dataRows.filter((row) => row.some((c) => !isBlank(c)));

  if (dataRows.length === 0) {
    // Header-only sheet: still report structure but no data-driven charts.
    return {
      sheetName,
      headers,
      columns: headers.map((h, i) => ({ index: i, header: h, type: "category" as ColumnType })),
      dataRows: [],
      rowCount: 0,
      columnCount,
    };
  }

  const columns = headers.map((header, i) => classifyColumn(i, header, dataRows));

  return {
    sheetName,
    headers,
    columns,
    dataRows,
    rowCount: dataRows.length,
    columnCount,
  };
}

// ---------------------------------------------------------------------------
// Label column selection + aggregation
// ---------------------------------------------------------------------------

/**
 * Choose the primary label column: prefer the first date column, else the
 * first category column, else null (caller falls back to row indices).
 */
function pickLabelColumn(columns: ColumnInfo[]): ColumnInfo | null {
  const dateCol = columns.find((c) => c.type === "date");
  if (dateCol) return dateCol;
  const catCol = columns.find((c) => c.type === "category");
  if (catCol) return catCol;
  return null;
}

function labelForRow(
  row: Cell[],
  labelCol: ColumnInfo | null,
  rowIndex: number,
): string {
  if (!labelCol) return `Row ${rowIndex + 1}`;
  const raw = row[labelCol.index];
  if (labelCol.type === "date") return formatDateLabel(raw);
  const str = cellToString(raw);
  return str === "" ? `Row ${rowIndex + 1}` : str;
}

/**
 * Build (label, value) points for a single numeric column. Aggregates by label
 * (summing duplicates) and caps the number of points, slicing the remainder
 * into an "Other" bucket when necessary.
 */
function buildPoints(
  analysis: SheetAnalysis,
  labelCol: ColumnInfo | null,
  numericCol: ColumnInfo,
): ChartDataPoint[] {
  const map = new Map<string, number>();
  const order: string[] = [];

  analysis.dataRows.forEach((row, idx) => {
    const num = parseNumeric(row[numericCol.index]);
    if (num === null) return;
    const label = labelForRow(row, labelCol, idx);
    if (!map.has(label)) {
      map.set(label, 0);
      order.push(label);
    }
    map.set(label, map.get(label)! + num);
  });

  let points: ChartDataPoint[] = order.map((label) => ({
    label,
    value: roundValue(map.get(label)!),
  }));

  // Cap points; aggregate the overflow into "Other".
  if (points.length > MAX_POINTS_PER_CHART) {
    const head = points.slice(0, MAX_POINTS_PER_CHART - 1);
    const tail = points.slice(MAX_POINTS_PER_CHART - 1);
    const otherTotal = tail.reduce((acc, p) => acc + p.value, 0);
    head.push({ label: "Other", value: roundValue(otherTotal) });
    points = head;
  }

  return points;
}

/** Heuristic: do the values look like parts of a whole (all non-negative)? */
function looksLikeParts(points: ChartDataPoint[]): boolean {
  if (points.length === 0) return false;
  return points.every((p) => p.value >= 0);
}

// ---------------------------------------------------------------------------
// Chart proposal
// ---------------------------------------------------------------------------

function makeConfig(
  extra: Record<string, unknown> = {},
): ChartData["config"] {
  return { ...DEFAULT_CONFIG, ...extra };
}

/**
 * Propose charts for a single sheet, pushing into the shared `charts` array
 * until the workbook-wide cap is reached.
 */
function proposeChartsForSheet(
  analysis: SheetAnalysis,
  charts: ChartData[],
): void {
  if (charts.length >= MAX_CHARTS) return;
  if (analysis.dataRows.length === 0) return;

  const numericCols = analysis.columns.filter((c) => c.type === "number");
  if (numericCols.length === 0) return;

  const labelCol = pickLabelColumn(analysis.columns);
  const labelName = labelCol ? labelCol.header : "Row";

  // --- Special case: a single dominant KPI metric -----------------------
  // One data row, or a single numeric column with exactly one value.
  if (analysis.rowCount === 1 && numericCols.length >= 1) {
    const col = numericCols[0]!;
    const stats = col.stats;
    if (stats) {
      pushChart(charts, {
        type: "kpi",
        title: col.header,
        subtitle: analysis.sheetName,
        data: [{ label: col.header, value: roundValue(stats.sum) }],
        config: makeConfig({ trend: stats.trend, trendValue: stats.average }),
      });
    }
    return;
  }

  // --- Multiple numeric columns -> grouped-bar with series --------------
  if (numericCols.length >= 2) {
    const series = numericCols.map((col) => ({
      name: col.header,
      data: buildPoints(analysis, labelCol, col),
    }));
    const primary = series[0]!;
    pushChart(charts, {
      type: "grouped-bar",
      title: `${numericCols.map((c) => c.header).slice(0, 3).join(", ")} by ${labelName}`,
      subtitle: analysis.sheetName,
      data: primary.data, // top-level data = first series for single-series renderers
      series,
      config: makeConfig({ xAxisLabel: labelName }),
    });
    return;
  }

  // --- Single numeric column -------------------------------------------
  const numericCol = numericCols[0]!;
  const points = buildPoints(analysis, labelCol, numericCol);
  if (points.length === 0) return;

  let type: ChartType;
  if (labelCol?.type === "date") {
    // Trend over time.
    type = "area";
  } else if (
    labelCol?.type === "category" &&
    points.length <= PIE_MAX_CATEGORIES &&
    looksLikeParts(points)
  ) {
    // Few categories that look like parts of a whole.
    type = points.length <= 4 ? "pie" : "donut";
  } else {
    type = "bar";
  }

  pushChart(charts, {
    type,
    title: `${numericCol.header} by ${labelName}`,
    subtitle: analysis.sheetName,
    data: points,
    config: makeConfig({
      xAxisLabel: labelName,
      yAxisLabel: numericCol.header,
      ...(numericCol.stats ? { trend: numericCol.stats.trend } : {}),
    }),
  });
}

/** Push a chart only while under the cap. */
function pushChart(charts: ChartData[], chart: ChartData): void {
  if (charts.length < MAX_CHARTS) charts.push(chart);
}

// ---------------------------------------------------------------------------
// Summary + tables
// ---------------------------------------------------------------------------

function buildSheetSummary(analysis: SheetAnalysis): string {
  const lines: string[] = [];
  lines.push(
    `Sheet "${analysis.sheetName}": ${analysis.rowCount} data row${
      analysis.rowCount === 1 ? "" : "s"
    } x ${analysis.columnCount} column${analysis.columnCount === 1 ? "" : "s"}.`,
  );

  const colDescriptions = analysis.columns.map(
    (c) => `${c.header} (${c.type})`,
  );
  lines.push(`Columns: ${colDescriptions.join(", ")}.`);

  for (const col of analysis.columns) {
    if (col.type !== "number" || !col.stats || col.stats.count === 0) continue;
    const s = col.stats;
    const trendWord =
      s.trend === "up"
        ? "trending up"
        : s.trend === "down"
        ? "trending down"
        : "flat";
    lines.push(
      `- ${col.header} ranges ${formatNumber(s.min)}–${formatNumber(
        s.max,
      )}, ${trendWord}; total ${formatNumber(s.sum)}, average ${formatNumber(
        s.average,
      )}.`,
    );
  }

  return lines.join("\n");
}

function buildTable(analysis: SheetAnalysis): TableResult {
  const rows = analysis.dataRows
    .slice(0, MAX_TABLE_ROWS)
    .map((row) =>
      analysis.headers.map((_, i) => cellForTable(row[i])),
    );
  return {
    sheetName: analysis.sheetName,
    headers: analysis.headers,
    rows,
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isAllowedFile(fileName: string, mimeType: string): boolean {
  const lower = fileName.toLowerCase();
  const extOk = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  const mimeOk = mimeType ? ALLOWED_MIME_TYPES.includes(mimeType) : false;
  // Accept if either the extension OR the mime type matches (loose check).
  return extOk || mimeOk;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse FormData FIRST before any other operations.
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error("[Analyze Excel] FormData parsing error:", formError);
      return NextResponse.json(
        { error: "Failed to parse form data. Please try again." },
        { status: 400 },
      );
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // File size limit (10MB).
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    const fileName = file.name || "spreadsheet";
    const fileType = file.type || "";

    // Loose extension / mime validation.
    if (!isAllowedFile(fileName, fileType)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.",
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    console.log(
      `[Analyze Excel] Processing file: ${fileName}, type: ${fileType}, size: ${buffer.length}`,
    );

    // Parse the workbook. XLSX.read handles .xlsx, .xls, and .csv.
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    } catch (parseError) {
      console.error("[Analyze Excel] Workbook parse error:", parseError);
      return NextResponse.json(
        {
          error:
            "Could not read the spreadsheet. The file may be corrupted or in an unsupported format.",
        },
        { status: 400 },
      );
    }

    const sheetNames = workbook.SheetNames ?? [];
    if (sheetNames.length === 0) {
      return NextResponse.json(
        { error: "The spreadsheet contains no sheets." },
        { status: 400 },
      );
    }

    const charts: ChartData[] = [];
    const tables: TableResult[] = [];
    const summaryParts: string[] = [];
    let analyzedSheetCount = 0;

    for (const sheetName of sheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      let analysis: SheetAnalysis | null = null;
      try {
        analysis = analyzeSheet(sheetName, sheet);
      } catch (sheetError) {
        console.error(
          `[Analyze Excel] Failed to analyze sheet "${sheetName}":`,
          sheetError,
        );
        continue;
      }

      if (!analysis) continue; // empty sheet
      analyzedSheetCount += 1;

      summaryParts.push(buildSheetSummary(analysis));
      tables.push(buildTable(analysis));
      proposeChartsForSheet(analysis, charts);
    }

    if (analyzedSheetCount === 0) {
      return NextResponse.json(
        {
          error:
            "No data found in the spreadsheet. All sheets appear to be empty.",
        },
        { status: 400 },
      );
    }

    const header =
      `Workbook "${fileName}" contains ${analyzedSheetCount} sheet` +
      `${analyzedSheetCount === 1 ? "" : "s"} with data.`;
    const summary = [header, ...summaryParts].join("\n\n");

    return NextResponse.json({
      summary,
      charts,
      tables,
      meta: {
        sheetCount: analyzedSheetCount,
        fileName,
      },
    });
  } catch (error) {
    console.error("[Analyze Excel] Error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to analyze the file. Please try again or use a different file.",
      },
      { status: 500 },
    );
  }
}
