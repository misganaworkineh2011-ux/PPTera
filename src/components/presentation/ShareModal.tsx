"use client";

import { useState, useEffect } from "react";
import { X, Globe, Lock, CheckCircle2, Share2, UserPlus, Trash2, Mail, Users, ChevronDown } from "lucide-react";

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
  onClose: () => void;
}

export default function ShareModal({ presentationId, onClose }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<"link" | "people">("link");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-xl font-bold text-slate-900">Share Presentation</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("link")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "link"
                ? "border-b-2 border-cyan-500 text-cyan-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Globe size={16} className="inline mr-2" />
            Public Link
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "people"
                ? "border-b-2 border-cyan-500 text-cyan-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users size={16} className="inline mr-2" />
            People
          </button>
        </div>

        <div className="p-4">
          {activeTab === "link" ? (
            <PublicLinkTab presentationId={presentationId} />
          ) : (
            <PeopleTab presentationId={presentationId} />
          )}
        </div>
      </div>
    </div>
  );
}

function PublicLinkTab({ presentationId }: { presentationId: string }) {
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShareStatus();
  }, [presentationId]);

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
    } catch {
      console.error("Failed to update sharing settings");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isPublic ? (
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Globe className="text-green-600" size={20} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Lock className="text-slate-500" size={20} />
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900">{isPublic ? "Public" : "Private"}</p>
              <p className="text-sm text-slate-500">
                {isPublic ? "Anyone with the link can view" : "Only you and collaborators can access"}
              </p>
            </div>
          </div>
          <button
            onClick={handleTogglePublic}
            disabled={loading}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              isPublic ? "bg-green-500" : "bg-slate-300"
            } ${loading ? "opacity-50" : ""}`}
          >
            <div
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                isPublic ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {isPublic && shareUrl && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Share Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 transition"
            >
              {copied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Public viewers see a clean presentation view without editing controls
          </p>
        </div>
      )}

      {!isPublic && (
        <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-600">
          Enable public sharing to get a shareable link for anyone to view
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
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCollaborators();
  }, [presentationId]);

  const fetchCollaborators = async () => {
    try {
      const res = await fetch(`/api/presentations/${presentationId}/collaborators`);
      const data = await res.json();
      setCollaborators(data.collaborators || []);
      setIsOwner(data.isOwner);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
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
      fetchCollaborators();
    } catch {
      console.error("Failed to update role");
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    try {
      await fetch(`/api/presentations/${presentationId}/collaborators?collaboratorId=${collaboratorId}`, {
        method: "DELETE",
      });
      fetchCollaborators();
    } catch {
      console.error("Failed to remove collaborator");
    }
  };

  return (
    <div className="space-y-4">
      {isOwner && (
        <form onSubmit={handleAddCollaborator} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
                className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition disabled:opacity-50"
            >
              <UserPlus size={16} />
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">
          {collaborators.length > 0 ? `${collaborators.length} collaborator${collaborators.length > 1 ? "s" : ""}` : "No collaborators yet"}
        </p>
        
        {collaborators.length === 0 && (
          <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
            Add people by email to give them access to this presentation
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {collaborators.map((collab) => (
            <div key={collab.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                {collab.user?.image ? (
                  <img src={collab.user.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-slate-600">
                      {collab.email[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {collab.user?.name || collab.email}
                  </p>
                  {collab.user?.name && (
                    <p className="text-xs text-slate-500">{collab.email}</p>
                  )}
                  {collab.status === "pending" && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Pending</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOwner ? (
                  <>
                    <select
                      value={collab.role}
                      onChange={(e) => handleUpdateRole(collab.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded border border-slate-200 bg-white"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button
                      onClick={() => handleRemove(collab.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <span className={`text-xs px-2 py-1 rounded ${
                    collab.role === "editor" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"
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
