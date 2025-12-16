"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Globe, Lock } from "lucide-react";
import { toast } from "sonner";

interface SharePresentationModalProps {
  presentationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SharePresentationModal({
  presentationId,
  isOpen,
  onClose,
}: SharePresentationModalProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchShareStatus();
    }
  }, [isOpen, presentationId]);

  const fetchShareStatus = async () => {
    try {
      const res = await fetch(`/api/presentations/${presentationId}/share`);
      const data = await res.json();
      setIsPublic(data.isPublic);
      setShareUrl(data.shareUrl || "");
    } catch (error) {
      console.error("Error fetching share status:", error);
    }
  };

  const handleTogglePublic = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      const data = await res.json();
      setIsPublic(data.isPublic);
      setShareUrl(data.shareUrl);
      toast.success(
        data.isPublic
          ? "Presentation is now public"
          : "Presentation is now private"
      );
    } catch (error) {
      toast.error("Failed to update sharing settings");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          Share Presentation
        </h2>

        {/* Public/Private Toggle */}
        <div className="mb-6 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="text-green-500" size={24} />
              ) : (
                <Lock className="text-slate-400" size={24} />
              )}
              <div>
                <p className="font-semibold text-slate-900">
                  {isPublic ? "Public" : "Private"}
                </p>
                <p className="text-sm text-slate-500">
                  {isPublic
                    ? "Anyone with the link can view"
                    : "Only you can access"}
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={loading}
              className={`relative h-8 w-14 rounded-full transition-colors ${
                isPublic ? "bg-green-500" : "bg-slate-300"
              } ${loading ? "opacity-50" : ""}`}
            >
              <div
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                  isPublic ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Share Link */}
        {isPublic && shareUrl && (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              Share Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              />
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Anyone with this link can view your presentation
            </p>
          </div>
        )}

        {!isPublic && (
          <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-600">
            Enable public sharing to get a shareable link
          </div>
        )}
      </div>
    </div>
  );
}
