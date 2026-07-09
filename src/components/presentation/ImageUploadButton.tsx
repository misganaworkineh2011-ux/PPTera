"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadButtonProps {
  /** Called with the hosted URL after a successful upload. */
  onUploaded: (url: string) => void;
  /** Optional presentation to associate the upload with. */
  presentationId?: string;
  /** Override the button styling. */
  className?: string;
  /** Inline styles for themed contexts (e.g. modal color tokens). */
  style?: React.CSSProperties;
  /** Button label (defaults to "Upload"). */
  label?: string;
  /** Accept attribute for the hidden file input. */
  accept?: string;
  disabled?: boolean;
  /** Icon size in px. */
  iconSize?: number;
}

/**
 * Self-contained "upload from computer" button: a hidden file input plus a
 * styled trigger. Posts the chosen file to /api/upload-image and hands the
 * resulting hosted URL back via onUploaded. Drop it next to any URL field.
 */
export function ImageUploadButton({
  onUploaded,
  presentationId,
  className,
  style,
  label = "Upload",
  accept = "image/*",
  disabled,
  iconSize = 16,
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (presentationId) fd.append("presentationId", presentationId);

      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      onUploaded(data.url as string);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        style={style}
        className={
          className ||
          "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
        }
      >
        {uploading ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          <Upload size={iconSize} />
        )}
        {uploading ? "Uploading…" : label}
      </button>
    </>
  );
}

export default ImageUploadButton;
