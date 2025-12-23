import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import mammoth from "mammoth";
import officeParser from "officeparser";
import PDFParser from "pdf2json";

export async function POST(request: NextRequest) {
    try {
        const authUser = await requireAuth();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";

        if (file.type === "application/pdf") {
            text = await new Promise((resolve, reject) => {
                const pdfParser = new PDFParser(null, true); // true = enable raw text parsing
                pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                    // @ts-ignore - types are tricky
                    const rawText = pdfParser.getRawTextContent();
                    resolve(rawText);
                });
                pdfParser.parseBuffer(buffer);
            });
        } else if (
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.name.endsWith(".docx")
        ) {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (
            file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
            file.type === "application/vnd.ms-powerpoint" ||
            file.name.endsWith(".pptx") ||
            file.name.endsWith(".ppt")
        ) {
            text = await officeParser.parseOfficeAsync(buffer);
        } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
            text = buffer.toString("utf-8");
        } else {
            return NextResponse.json(
                { error: "Unsupported file type. Please upload PDF, DOCX, PPTX, PPT, or TXT." },
                { status: 400 }
            );
        }

        return NextResponse.json({ text });
    } catch (error) {
        console.error("[Parse Document] Error:", error);
        return NextResponse.json(
            { error: "Failed to parse document" },
            { status: 500 }
        );
    }
}
