import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mammoth from "mammoth";
import officeParser from "officeparser";
import { extractText } from "unpdf";

// Use Node.js runtime for file parsing libraries
export const runtime = "nodejs";
export const maxDuration = 30; // 30 seconds timeout for large files

export async function POST(request: NextRequest) {
  try {
    // Use auth() directly instead of requireAuth() to avoid any body consumption issues
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse FormData FIRST before any other operations
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error("[Parse Document] FormData parsing error:", formError);
      return NextResponse.json(
        { error: "Failed to parse form data. Please try again." },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    console.log(`[Parse Document] Processing file: ${fileName}, type: ${fileType}, size: ${buffer.length}`);

    // PDF files
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      try {
        // unpdf requires Uint8Array, not Buffer
        const uint8Array = new Uint8Array(buffer);
        const result = await extractText(uint8Array, { mergePages: true });
        // With mergePages: true, result.text is always a string
        text = result.text as string;
        console.log(`[Parse Document] PDF parsed successfully, pages: ${result.totalPages}`);
      } catch (pdfError: unknown) {
        const errorMessage = pdfError instanceof Error ? pdfError.message : String(pdfError);
        console.error("[Parse Document] PDF parsing error:", errorMessage);
        return NextResponse.json(
          { error: `Failed to parse PDF: ${errorMessage}` },
          { status: 400 }
        );
      }
    }
    // Word documents (.docx)
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch (docxError) {
        console.error("[Parse Document] DOCX parsing error:", docxError);
        return NextResponse.json(
          { error: "Failed to parse Word document." },
          { status: 400 }
        );
      }
    }
    // Old Word documents (.doc)
    else if (fileType === "application/msword" || fileName.endsWith(".doc")) {
      try {
        text = await officeParser.parseOfficeAsync(buffer);
      } catch (docError) {
        console.error("[Parse Document] DOC parsing error:", docError);
        return NextResponse.json(
          { error: "Failed to parse .doc file. Please try converting to .docx format." },
          { status: 400 }
        );
      }
    }
    // PowerPoint files (.pptx, .ppt)
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      fileType === "application/vnd.ms-powerpoint" ||
      fileName.endsWith(".pptx") ||
      fileName.endsWith(".ppt")
    ) {
      try {
        text = await officeParser.parseOfficeAsync(buffer);
        
        // Check if we got meaningful content - legacy .ppt files often fail silently
        if (!text || text.trim().length < 10) {
          const isLegacyPpt = fileName.endsWith(".ppt") && !fileName.endsWith(".pptx");
          if (isLegacyPpt) {
            return NextResponse.json(
              { error: "Legacy .ppt format has limited support. Please save as .pptx in PowerPoint and try again." },
              { status: 400 }
            );
          }
        }
      } catch (pptError) {
        console.error("[Parse Document] PowerPoint parsing error:", pptError);
        const isLegacyPpt = fileName.endsWith(".ppt") && !fileName.endsWith(".pptx");
        return NextResponse.json(
          { error: isLegacyPpt 
              ? "Legacy .ppt format is not fully supported. Please save as .pptx in PowerPoint and try again."
              : "Failed to parse PowerPoint file." 
          },
          { status: 400 }
        );
      }
    }
    // Plain text files
    else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    }
    // Unsupported file type
    else {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}. Please upload PDF, DOCX, DOC, PPTX, PPT, or TXT.` },
        { status: 400 }
      );
    }

    // Clean up the text
    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    console.log(`[Parse Document] Extracted ${text.length} characters`);

    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: "Could not extract meaningful text from the document. The file may be empty or contain only images." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("[Parse Document] Error:", error);
    return NextResponse.json(
      { error: "Failed to parse document. Please try again or use a different file format." },
      { status: 500 }
    );
  }
}
