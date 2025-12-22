"use client";

import { useState, useEffect } from "react";
import {
  History,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  Save,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface Version {
  id: string;
  version: number;
  description: string;
  type: string;
  createdAt: string;
  metadata?: any;
}

interface VersionHistoryProps {
  presentationId: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore?: (versionId: string) => void;
}

export default function VersionHistory({
  presentationId,
  isOpen,
  onClose,
  onRestore,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveDescription, setSaveDescription] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, presentationId]);

  const fetchVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/versions`);
      if (!res.ok) throw new Error("Failed to fetch versions");
      const data = await res.json();
      setVersions(data.versions || []);
    } catch (err) {
      setError("Failed to load version history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!saveDescription.trim()) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: saveDescription }),
      });
      
      if (!res.ok) throw new Error("Failed to save version");
      
      setSaveDescription("");
      setShowSaveForm(false);
      fetchVersions();
    } catch (err) {
      console.error(err);
      alert("Failed to save version");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? "Just now" : `${minutes} minutes ago`;
      }
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "create":
        return "Created";
      case "edit":
      case "update":
        return "Edited";
      case "version_save":
        return "Saved";
      default:
        return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
      <div className="h-full w-full max-w-md bg-white dark:bg-neutral-900 shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Version History
              </h2>
              <p className="text-xs text-slate-500">
                {versions.length} version{versions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Save Version Button */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          {showSaveForm ? (
            <div className="space-y-3">
              <input
                type="text"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Version description..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveVersion}
                  disabled={saving || !saveDescription.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveForm(false);
                    setSaveDescription("");
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSaveForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-200 dark:border-neutral-800 rounded-lg text-slate-600 dark:text-slate-400 hover:border-purple-500 hover:text-purple-600 transition"
            >
              <Save className="h-4 w-4" />
              Save Current Version
            </button>
          )}
        </div>

        {/* Version List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
              <p className="text-slate-600 dark:text-slate-400">{error}</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-600 dark:text-slate-400">No version history yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Save versions to track changes
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version, idx) => (
                <div
                  key={version.id}
                  className={cn(
                    "p-4 rounded-xl border transition",
                    idx === 0
                      ? "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20"
                      : "border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          idx === 0
                            ? "bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300"
                            : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400"
                        )}>
                          {idx === 0 ? "Current" : `v${version.version}`}
                        </span>
                        <span className="text-xs text-slate-400">
                          {getTypeLabel(version.type)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {version.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {formatDate(version.createdAt)}
                      </div>
                    </div>
                    {idx !== 0 && onRestore && (
                      <button
                        onClick={() => onRestore(version.id)}
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition"
                        title="Restore this version"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
