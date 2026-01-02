"use client";

import { useState, useEffect } from "react";
import { FolderOpen, Mail, Users, UserPlus, Loader2, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import { getPresentationUrl } from "~/lib/utils";

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

interface Presentation {
  id: string;
  title: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  collaborations?: Collaborator[];
}

interface Collaboration {
  id: string;
  role: string;
  presentation: Presentation;
}

export default function CollaborationPage() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [sharedByMe, setSharedByMe] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"shared-with-me" | "shared-by-me">("shared-with-me");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/collaborations");
      const data = await res.json();
      setCollaborations(data.collaborations || []);
      setSharedByMe(data.sharedByMe || []);
    } catch (error) {
      console.error("Error fetching collaborations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !selectedPresentation) return;
    try {
      setIsInviting(true);
      const res = await fetch(`/api/presentations/${selectedPresentation}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        setInviteEmail("");
        setShowInviteModal(false);
        fetchCollaborations();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to invite collaborator");
      }
    } catch (error) {
      console.error("Error inviting:", error);
      alert("Failed to invite collaborator");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (presentationId: string, collaboratorId: string) => {
    if (!confirm("Remove this collaborator?")) return;
    try {
      await fetch(`/api/presentations/${presentationId}/collaborators?collaboratorId=${collaboratorId}`, {
        method: "DELETE",
      });
      fetchCollaborations();
    } catch (error) {
      console.error("Error removing collaborator:", error);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return t.today;
    if (days === 1) return t.yesterday;
    if (days < 7) return `${days} ${t.daysAgo}`;
    return d.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#06b6d4]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-white">{t.collaborationTitle}</h1>
            <p className="text-sm text-slate-500 dark:text-neutral-400">{t.collaborationSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab("shared-with-me")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "shared-with-me"
              ? "border-[#06b6d4] text-[#1e3a8a] dark:text-white"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-neutral-400"
          }`}
        >
          {t.sharedWithMe} ({collaborations.length})
        </button>
        <button
          onClick={() => setActiveTab("shared-by-me")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "shared-by-me"
              ? "border-[#06b6d4] text-[#1e3a8a] dark:text-white"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-neutral-400"
          }`}
        >
          {t.sharedByMe} ({sharedByMe.length})
        </button>
      </div>

      {activeTab === "shared-with-me" ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          {collaborations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-[#1e3a8a] dark:text-white">{t.noSharedPresentations}</h3>
              <p className="text-sm text-slate-500 mt-1 dark:text-neutral-400">{t.sharedWithMeEmpty}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {collaborations.map((collab) => (
                <div key={collab.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition dark:hover:bg-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10 text-[#06b6d4]">
                      <FolderOpen size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1e3a8a] dark:text-white">{collab.presentation.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-400">
                        {t.by} {collab.presentation.user?.name || "Unknown"} • {collab.role} • {t.updated} {formatDate(collab.presentation.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={getPresentationUrl(collab.presentation.id, collab.presentation.title)}
                    className="flex items-center gap-2 rounded-lg bg-[#1e3a8a] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1e3a8a]/90 transition"
                  >
                    <ExternalLink size={14} /> {t.open}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sharedByMe.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <UserPlus className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-[#1e3a8a] dark:text-white">{t.noSharedPresentations}</h3>
                <p className="text-sm text-slate-500 mt-1 dark:text-neutral-400">{t.sharedByMeEmpty}</p>
              </div>
            </div>
          ) : (
            sharedByMe.map((pres) => (
              <div key={pres.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10 text-[#06b6d4]">
                      <FolderOpen size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1e3a8a] dark:text-white">{pres.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-neutral-400">{pres.collaborations?.length || 0} {t.collaborators}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPresentation(pres.id);
                      setShowInviteModal(true);
                    }}
                    className="flex items-center gap-2 rounded-lg border border-[#06b6d4] px-3 py-1.5 text-sm font-medium text-[#06b6d4] hover:bg-[#e0f2fe] transition"
                  >
                    <UserPlus size={14} /> {t.invite}
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {pres.collaborations?.map((collab) => (
                    <div key={collab.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white text-sm font-bold">
                          {collab.user?.name?.[0] || collab.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-neutral-300">{collab.user?.name || collab.email}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 dark:text-neutral-400">
                            <Mail size={10} /> {collab.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          collab.status === "accepted" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}>
                          {collab.status === "accepted" ? t.accepted : t.pending}
                        </span>
                        <span className="rounded-full bg-[#e0f2fe] px-2 py-0.5 text-xs font-medium text-[#06b6d4] dark:bg-[#06b6d4]/20">
                          {collab.role}
                        </span>
                        <button
                          onClick={() => handleRemoveCollaborator(pres.id, collab.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1e3a8a] mb-4 dark:text-white">{t.inviteCollaborator}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-neutral-300">{t.emailAddressLabel}</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-neutral-300">{t.role}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#06b6d4] focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="viewer">{t.viewer}</option>
                  <option value="editor">{t.editor}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleInvite}
                disabled={isInviting || !inviteEmail}
                className="flex-1 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3a8a]/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isInviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                {isInviting ? t.inviting : t.sendInvite}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
