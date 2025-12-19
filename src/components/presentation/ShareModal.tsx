"use client";

import { useState } from "react";
import { X, Globe, Lock, CheckCircle2, Copy, Link2, Users, ChevronDown, Mail, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
}

export default function ShareModal({ 
  presentationId, 
  initialIsPublic = false,
  initialShareToken = null,
  onClose 
}: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<"link" | "people">("link");

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Share Presentation</h2>
            <p className="text-sm text-slate-500 mt-0.5">Control who can view and edit</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6">
          <button
            onClick={() => setActiveTab("link")}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "link"
                ? "border-cyan-500 text-cyan-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Link2 size={18} />
            Public Link
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === "people"
                ? "border-cyan-500 text-cyan-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users size={18} />
            People
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "link" ? (
            <PublicLinkTab 
              presentationId={presentationId} 
              initialIsPublic={initialIsPublic}
              initialShareToken={initialShareToken}
            />
          ) : (
            <PeopleTab presentationId={presentationId} />
          )}
        </div>
      </div>
    </div>
  );
}

function PublicLinkTab({ 
  presentationId,
  initialIsPublic,
  initialShareToken,
}: { 
  presentationId: string;
  initialIsPublic?: boolean;
  initialShareToken?: string | null;
}) {
  const [isPublic, setIsPublic] = useState(initialIsPublic || false);
  const [shareToken, setShareToken] = useState(initialShareToken || null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generate share URL from token
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
      
      if (!res.ok) {
        throw new Error("Failed to update");
      }
      
      const data = await res.json();
      setIsPublic(data.isPublic);
      
      // Extract token from the returned URL or use existing
      if (data.shareUrl) {
        const urlParts = data.shareUrl.split("/");
        setShareToken(urlParts[urlParts.length - 1] || null);
      }
      
      toast.success(
        data.isPublic 
          ? "Presentation is now public! Anyone with the link can view it." 
          : "Presentation is now private."
      );
    } catch {
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

  return (
    <div className="space-y-6">
      {/* Public/Private Toggle Card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {isPublic ? (
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Globe className="text-green-600" size={24} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <Lock className="text-slate-500" size={24} />
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900 text-lg">
                {isPublic ? "Public Access" : "Private"}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                {isPublic 
                  ? "Anyone with the link can view this presentation" 
                  : "Only you and collaborators can access this presentation"}
              </p>
            </div>
          </div>
          
          {/* Toggle Switch */}
          <button
            onClick={handleTogglePublic}
            disabled={loading}
            className={`relative h-8 w-14 rounded-full transition-colors flex-shrink-0 ${
              isPublic ? "bg-green-500" : "bg-slate-300"
            } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                isPublic ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Share Link Section */}
      {isPublic && shareUrl && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">Share Link</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-700 font-mono"
              />
              <Link2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all ${
                copied 
                  ? "bg-green-500" 
                  : "bg-cyan-500 hover:bg-cyan-600"
              }`}
            >
              {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            💡 Public viewers will see a clean, read-only presentation view without editing controls
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isPublic && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
            <Lock className="text-slate-400" size={24} />
          </div>
          <p className="text-slate-600 font-medium">Enable public sharing</p>
          <p className="text-sm text-slate-500 mt-1">
            Toggle the switch above to generate a shareable link
          </p>
        </div>
      )}
    </div>
  );
}

function PeopleTab({ presentationId }: { presentationId: string }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("viewer");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Fetch collaborators only when People tab is shown
  useState(() => {
    fetchCollaborators();
  });

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

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/presentations/${presentationId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
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
      {/* Add Collaborator Form */}
      {isOwner && (
        <form onSubmit={handleAddCollaborator} className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">Invite people</label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
                className="appearance-none h-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              >
                <option value="viewer">Can view</option>
                <option value="editor">Can edit</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-5 py-3 rounded-xl bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <UserPlus size={18} />
              Add
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </form>
      )}

      {/* Collaborators List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            {fetching ? "Loading..." : collaborators.length > 0 
              ? `${collaborators.length} collaborator${collaborators.length > 1 ? "s" : ""}` 
              : "No collaborators yet"}
          </p>
        </div>
        
        {!fetching && collaborators.length === 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
              <Users className="text-slate-400" size={24} />
            </div>
            <p className="text-slate-600 font-medium">No collaborators</p>
            <p className="text-sm text-slate-500 mt-1">
              Add people by email to give them access
            </p>
          </div>
        )}

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {collaborators.map((collab) => (
            <div key={collab.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                {collab.user?.image ? (
                  <img src={collab.user.image} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {collab.email[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {collab.user?.name || collab.email}
                  </p>
                  {collab.user?.name && (
                    <p className="text-xs text-slate-500">{collab.email}</p>
                  )}
                  {collab.status === "pending" && (
                    <span className="inline-flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                      Pending invite
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOwner ? (
                  <>
                    <select
                      value={collab.role}
                      onChange={(e) => handleUpdateRole(collab.id, e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
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
                  <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                    collab.role === "editor" 
                      ? "bg-blue-50 text-blue-600" 
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {collab.role === "editor" ? "Can edit" : "Can view"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
