"use client";

import { useState, useEffect } from "react";
import { X, Globe, Lock, CheckCircle2, Copy, Link2, Users, ChevronDown, Mail, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Theme } from "~/lib/themes";

interface Collaborator {
  id: string;
  email: string;
  role: string;
  status: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  } | null;
}

interface ShareModalProps {
  presentationId: string;
  initialIsPublic?: boolean;
  initialShareToken?: string | null;
  onClose: () => void;
  theme?: Theme;
}

export default function ShareModal({
  presentationId,
  initialIsPublic = false,
  initialShareToken = null,
  onClose,
  theme
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<"collaborate" | "share" | "export" | "embed">("share");

  // Theme colors
  const bgColor = theme?.colors.background || "#ffffff";
  const textColor = theme?.colors.text || "#1e293b";
  const headingColor = theme?.colors.heading || "#0f172a";
  const primaryColor = theme?.colors.primary || "#06b6d4";
  const mutedColor = theme?.colors.textMuted || "#64748b";

  // Determine if theme is dark
  const isDark = theme?.colors.background.startsWith("#") &&
    parseInt(theme.colors.background.slice(1, 3), 16) < 128;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-3xl rounded-2xl shadow-2xl"
        style={{ backgroundColor: bgColor }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-5"
          style={{
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor + '20' }}
            >
              <Link2 size={20} style={{ color: primaryColor }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: headingColor }}>Share Presentation</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors"
            style={{
              color: mutedColor,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-8 pt-4">
          <button
            onClick={() => setActiveTab("collaborate")}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
            style={{
              backgroundColor: activeTab === "collaborate" ? primaryColor + '20' : 'transparent',
              color: activeTab === "collaborate" ? primaryColor : mutedColor
            }}
          >
            <Users size={18} />
            Collaborate
          </button>
          <button
            onClick={() => setActiveTab("share")}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
            style={{
              backgroundColor: activeTab === "share" ? primaryColor + '20' : 'transparent',
              color: activeTab === "share" ? primaryColor : mutedColor
            }}
          >
            <Globe size={18} />
            Share
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
            style={{
              backgroundColor: activeTab === "export" ? primaryColor + '20' : 'transparent',
              color: activeTab === "export" ? primaryColor : mutedColor
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button
            onClick={() => setActiveTab("embed")}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
            style={{
              backgroundColor: activeTab === "embed" ? primaryColor + '20' : 'transparent',
              color: activeTab === "embed" ? primaryColor : mutedColor
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Embed
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === "collaborate" && <CollaborateTab presentationId={presentationId} theme={theme} />}
          {activeTab === "share" && (
            <ShareTab
              presentationId={presentationId}
              initialIsPublic={initialIsPublic}
              initialShareToken={initialShareToken}
              theme={theme}
            />
          )}
          {activeTab === "export" && <ExportTab theme={theme} />}
          {activeTab === "embed" && <EmbedTab presentationId={presentationId} theme={theme} />}
        </div>
      </div>
    </div>
  );
}

function ExportTab({ theme }: { theme?: Theme }) {
  const textColor = theme?.colors.text || "#1e293b";
  const mutedColor = theme?.colors.textMuted || "#64748b";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Export Presentation</h3>
        <p className="text-sm text-slate-500">Download your presentation in various formats</p>
      </div>

      <div className="grid gap-4">
        {/* PDF Export */}
        <button className="flex items-center justify-between p-5 rounded-xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900">PDF Document</p>
              <p className="text-sm text-slate-500">Best for sharing and printing</p>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-cyan-600">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        {/* PowerPoint Export */}
        <button className="flex items-center justify-between p-5 rounded-xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-orange-600">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900">PowerPoint (PPTX)</p>
              <p className="text-sm text-slate-500">Editable presentation file</p>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-cyan-600">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        {/* Images Export */}
        <button className="flex items-center justify-between p-5 rounded-xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-purple-600">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <polyline points="21 15 16 10 5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900">Images (ZIP)</p>
              <p className="text-sm text-slate-500">Individual slide images</p>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-cyan-600">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function EmbedTab({ presentationId, theme }: { presentationId: string; theme?: Theme }) {
  const [copied, setCopied] = useState(false);
  const [embedSize, setEmbedSize] = useState<"responsive" | "fixed">("responsive");
  const [width, setWidth] = useState(960);
  const [height, setHeight] = useState(540);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  
  const embedCode = embedSize === "responsive" 
    ? `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;">
  <iframe src="${baseUrl}/present/${presentationId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe>
</div>`
    : `<iframe src="${baseUrl}/present/${presentationId}" width="${width}" height="${height}" style="border:0;" allowfullscreen></iframe>`;

  const primaryColor = theme?.colors.primary || "#06b6d4";
  const isDark = theme?.colors.background.startsWith("#") &&
    parseInt(theme.colors.background.slice(1, 3), 16) < 128;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Embed code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Embed Presentation</h3>
        <p className="text-sm text-slate-500">Add this presentation to your website or blog</p>
      </div>

      {/* Size Options */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700">Embed Size</label>
        <div className="flex gap-2">
          <button
            onClick={() => setEmbedSize("responsive")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
              embedSize === "responsive"
                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Responsive
          </button>
          <button
            onClick={() => setEmbedSize("fixed")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
              embedSize === "fixed"
                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Fixed Size
          </button>
        </div>
        
        {embedSize === "fixed" && (
          <div className="flex gap-3 mt-3">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="rounded-xl border-2 border-slate-200 p-4 bg-slate-50">
        <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Preview</p>
        <div className="aspect-video bg-white rounded-lg border border-slate-200 overflow-hidden">
          <iframe
            src={`${baseUrl}/present/${presentationId}`}
            className="w-full h-full"
            style={{ border: 0 }}
            title="Presentation Preview"
          />
        </div>
      </div>

      {/* Embed Code */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700">Embed Code</label>
        <div className="relative">
          <pre className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap break-all">
            {embedCode}
          </pre>
          <button
            onClick={copyEmbedCode}
            className={`absolute top-3 right-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${copied
                ? "bg-green-500 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          💡 Paste this code into your website&apos;s HTML to embed the presentation
        </p>
      </div>
    </div>
  );
}

function ShareTab({
  presentationId,
  initialIsPublic,
  initialShareToken,
  theme,
}: {
  presentationId: string;
  initialIsPublic?: boolean;
  initialShareToken?: string | null;
  theme?: Theme;
}) {
  const [isPublic, setIsPublic] = useState(initialIsPublic || false);
  const [shareToken, setShareToken] = useState(initialShareToken || null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = shareToken ? `${baseUrl}/share/${shareToken}` : "";

  const handleTogglePublic = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const data = await res.json();
      setIsPublic(data.isPublic);

      if (data.shareUrl) {
        const urlParts = data.shareUrl.split("/");
        setShareToken(urlParts[urlParts.length - 1] || null);
      }

      toast.success(data.isPublic ? "Link sharing enabled!" : "Link sharing disabled");
    } catch {
      toast.error("Failed to update sharing settings");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* View Analytics Section */}
      <div className="flex items-center justify-between py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">View analytics</p>
            <p className="text-xs text-slate-500">Anyone can view, but not comment or edit.</p>
          </div>
        </div>
        <button
          onClick={copyToClipboard}
          disabled={!isPublic || !shareUrl}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${copied
              ? "bg-green-50 text-green-600 border border-green-200"
              : isPublic && shareUrl
                ? "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            }`}
        >
          <Link2 size={16} />
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      {/* Share Link Section */}
      {isPublic && shareUrl ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Globe className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">Public link active</p>
              <p className="text-xs text-green-700 mt-0.5">Anyone with the link can view this presentation</p>
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={loading}
              className="text-sm font-medium text-green-700 hover:text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-100 transition"
            >
              Disable
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Share Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-mono focus:outline-none"
                />
              </div>
              <button
                onClick={copyToClipboard}
                className={`p-3 rounded-lg transition-all ${copied
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="text-slate-400" size={28} />
          </div>
          <p className="text-slate-900 font-semibold mb-2">Link sharing is off</p>
          <p className="text-sm text-slate-500 mb-4">
            Enable link sharing to let anyone with the link view this presentation
          </p>
          <button
            onClick={handleTogglePublic}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Enabling..." : "Enable link sharing"}
          </button>
        </div>
      )}
    </div>
  );
}

function CollaborateTab({ presentationId, theme }: { presentationId: string; theme?: Theme }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  const textColor = theme?.colors.text || "#1e293b";
  const mutedColor = theme?.colors.textMuted || "#64748b";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [workspaceAccess, setWorkspaceAccess] = useState<"no-access" | "can-view" | "can-edit">("no-access");

  const fetchCollaborators = async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/collaborators`);
      const data = await res.json();
      setCollaborators(data.collaborators || []);
      setIsOwner(data.isOwner);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [presentationId]);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/presentations/${presentationId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role: "viewer" }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add collaborator");
        return;
      }

      setEmail("");
      toast.success("Collaborator added successfully!");
      fetchCollaborators();
    } catch {
      setError("Failed to add collaborator");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (collaboratorId: string, newRole: string) => {
    try {
      await fetch(`/api/presentations/${presentationId}/collaborators`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId, role: newRole }),
      });
      toast.success("Role updated!");
      fetchCollaborators();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    try {
      await fetch(`/api/presentations/${presentationId}/collaborators?collaboratorId=${collaboratorId}`, {
        method: "DELETE",
      });
      toast.success("Collaborator removed");
      fetchCollaborators();
    } catch {
      toast.error("Failed to remove collaborator");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add People Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddCollaborator(e);
            }
          }}
          placeholder="Add emails or people"
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Workspace Members */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">Workspace members</span>
          </div>
          <div className="relative">
            <select
              value={workspaceAccess}
              onChange={(e) => setWorkspaceAccess(e.target.value as typeof workspaceAccess)}
              className="appearance-none pl-3 pr-10 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600 font-medium"
            >
              <option value="no-access">No access</option>
              <option value="can-view">Can view</option>
              <option value="can-edit">Can edit</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Current User */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">Y</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">You</p>
            </div>
          </div>
          <span className="text-sm text-slate-500 font-medium">Full Access</span>
        </div>
      </div>

      {/* Collaborators List */}
      {!fetching && collaborators.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto border-t border-slate-200 pt-4">
          {collaborators.map((collab) => (
            <div key={collab.id} className="flex items-center justify-between py-3 hover:bg-slate-50 rounded-lg px-2 transition-colors">
              <div className="flex items-center gap-3">
                {collab.user?.image ? (
                  <img src={collab.user.image} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {collab.email[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {collab.user?.name || collab.email}
                  </p>
                  {collab.status === "pending" && (
                    <span className="text-xs text-slate-500">Pending</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOwner ? (
                  <>
                    <select
                      value={collab.role}
                      onChange={(e) => handleUpdateRole(collab.id, e.target.value)}
                      className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-600"
                    >
                      <option value="viewer">Can view</option>
                      <option value="editor">Can edit</option>
                    </select>
                    <button
                      onClick={() => handleRemove(collab.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-slate-500 font-medium">
                    {collab.role === "editor" ? "Can edit" : "Can view"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
