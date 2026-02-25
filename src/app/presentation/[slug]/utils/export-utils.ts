export type ExportFormat = "pdf" | "pptx" | "images";

export interface ExportOptions {
  range: "all" | "current" | "custom";
  customRange?: { from: number; to: number };
  quality?: "standard" | "hd" | "2k";
}

export const buildExportParams = (
  format: ExportFormat,
  currentSlideIndex: number,
  options?: ExportOptions,
): URLSearchParams => {
  const params = new URLSearchParams();
  params.set("format", format);

  if (options) {
    params.set("range", options.range);
    if (options.range === "current") {
      params.set("from", String(currentSlideIndex + 1));
    } else if (options.range === "custom" && options.customRange) {
      params.set("from", String(options.customRange.from));
      params.set("to", String(options.customRange.to));
    }
    
    if (options.quality) {
      params.set("quality", options.quality);
    }
  }

  return params;
};

export const getExportFilename = (
  presentationTitle: string,
  format: ExportFormat,
  contentDisposition: string | null,
): string => {
  let filename = `${presentationTitle}.${format === "images" ? "zip" : format}`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
    if (match && match[1]) {
      filename = decodeURIComponent(match[1]);
    }
  }
  return filename;
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
