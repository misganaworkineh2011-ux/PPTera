/**
 * Adobe PDF Services API Integration
 * Converts PDF to PPTX with pixel-perfect layout AND editable text
 */

import {
  ServicePrincipalCredentials,
  PDFServices,
  MimeType,
  ExportPDFJob,
  ExportPDFParams,
  ExportPDFTargetFormat,
  ExportPDFResult,
} from "@adobe/pdfservices-node-sdk";
import { Readable } from "stream";

// Check if Adobe credentials are configured
export function isAdobeConfigured(): boolean {
  return !!(
    process.env.ADOBE_PDF_SERVICES_CLIENT_ID &&
    process.env.ADOBE_PDF_SERVICES_CLIENT_SECRET
  );
}

/**
 * Convert PDF buffer to PPTX using Adobe PDF Services API
 * Returns editable PPTX with preserved layout, text, and images
 */
export async function convertPdfToPptx(pdfBuffer: Buffer): Promise<Buffer> {
  const clientId = process.env.ADOBE_PDF_SERVICES_CLIENT_ID;
  const clientSecret = process.env.ADOBE_PDF_SERVICES_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Adobe PDF Services credentials not configured");
  }

  try {
    // Create credentials
    const credentials = new ServicePrincipalCredentials({
      clientId,
      clientSecret,
    });

    // Create PDF Services instance
    const pdfServices = new PDFServices({ credentials });

    // Create readable stream from buffer
    const inputStream = Readable.from(pdfBuffer);

    // Upload the PDF
    const inputAsset = await pdfServices.upload({
      readStream: inputStream,
      mimeType: MimeType.PDF,
    });

    // Create export parameters for PPTX
    const params = new ExportPDFParams({
      targetFormat: ExportPDFTargetFormat.PPTX,
    });

    // Create and submit the export job
    const job = new ExportPDFJob({ inputAsset, params });
    const pollingURL = await pdfServices.submit({ job });

    // Poll for result
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: ExportPDFResult,
    });

    // Get the result asset
    const resultAsset = pdfServicesResponse.result?.asset;
    if (!resultAsset) {
      throw new Error("No result asset returned from Adobe PDF Services");
    }

    // Download the PPTX
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of streamAsset.readStream) {
      chunks.push(Buffer.from(chunk));
    }
    
    return Buffer.concat(chunks);
  } catch (error) {
    console.error("[Adobe PDF Services] Error:", error);
    throw error;
  }
}
