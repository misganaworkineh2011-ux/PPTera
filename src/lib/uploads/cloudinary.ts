import { env } from "~/env";

interface UploadOptions {
  folder?: string;
  tags?: string[];
}

interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload a base64/data-URL image to Cloudinary using an unsigned upload preset.
 *
 * This expects the following env vars:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_UPLOAD_PRESET
 */
export async function uploadImageFromDataUrl(
  dataUrl: string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult | null> {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.warn(
      "[Cloudinary] CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET not configured. Skipping upload."
    );
    return null;
  }

  try {
    const formData = new FormData();
    formData.append("file", dataUrl);
    formData.append("upload_preset", uploadPreset);

    if (options.folder) {
      formData.append("folder", options.folder);
    }
    if (options.tags && options.tags.length > 0) {
      formData.append("tags", options.tags.join(","));
    }

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(
        "[Cloudinary] Upload failed:",
        res.status,
        res.statusText,
        body
      );
      return null;
    }

    const json = await res.json();

    return {
      url: json.secure_url as string,
      publicId: json.public_id as string,
    };
  } catch (error) {
    console.error("[Cloudinary] Unexpected upload error:", error);
    return null;
  }
}


