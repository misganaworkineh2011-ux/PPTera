"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Globe, ChevronDown, UserPlus, Trash2, Edit3, X } from "lucide-react";
import { toast } from "sonner";
import type { Theme } from "~/lib/themes";
import { trackSharePresentation } from "~/components/GoogleAnalytics";

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

interface CollaborateTabProps {
  presentationId: string;
  theme?: Theme;
}

export default function CollaborateTab({ presentationId, theme }: CollaborateTabProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  const [emailInput, setEmailInput] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<"viewer" | "editor">("viewer");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [openCollabDropdown, setOpenCollabDropdown] = useState<string | null>(null);
  const [updatingCollabId, setUpdatingCollabId] = useState<string | null>(null);

  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});
  const [roleDropdownStyle, setRoleDropdownStyle] = useState<CSSProperties>({});
  const roleButtonRef = useRef<HTMLButtonElement>(null);
  const collabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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

  const handleOpenRoleDropdown = () => {
    if (showRoleDropdown) {
      setShowRoleDropdown(false);
      return;
    }

    if (roleButtonRef.current) {
      const rect = roleButtonRef.current.getBoundingClientRect();
      const dropdownHeight = 140;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < dropdownHeight;

      setRoleDropdownStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        ...(openAbove
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }
        ),
      });
    }
    setShowRoleDropdown(true);
  };

  const handleOpenCollabDropdown = (collabId: string) => {
    if (openCollabDropdown === collabId) {
      setOpenCollabDropdown(null);
      return;
    }

    const buttonEl = collabButtonRefs.current[collabId];
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect();
      const dropdownHeight = 80;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < dropdownHeight;

      setDropdownStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        ...(openAbove
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }
        ),
      });
    }
    setOpenCollabDropdown(collabId);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmailToList();
    } else if (e.key === "Backspace" && !emailInput && emailList.length > 0) {
      setEmailList(emailList.slice(0, -1));
    }
  };

  const addEmailToList = () => {
    const trimmedEmail = emailInput.trim().toLowerCase();
    if (!trimmedEmail) return;

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (emailList.includes(trimmedEmail)) {
      setError("This email is already added");
      return;
    }

    if (collaborators.some(c => c.email.toLowerCase() === trimmedEmail)) {
      setError("This person is already a collaborator");
      return;
    }

    setEmailList([...emailList, trimmedEmail]);
    setEmailInput("");
    setError("");
  };

  const removeEmail = (emailToRemove: string) => {
    setEmailList(emailList.filter(e => e !== emailToRemove));
  };

  const handleInviteAll = async () => {
    if (emailList.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/presentations/${presentationId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: emailList, role: selectedRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send invitations");
        return;
      }

      const data = await res.json();
      toast.success(`Invitations sent to ${data.invited} people!`);
      trackSharePresentation("collaborate");
      setEmailList([]);
      fetchCollaborators();
    } catch {
      setError("Failed to send invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (collaboratorId: string, newRole: string) => {
    const previousCollaborators = [...collaborators];
    setUpdatingCollabId(collaboratorId);

    setCollaborators(prev =>
      prev.map(c => c.id === collaboratorId ? { ...c, role: newRole } : c)
    );

    try {
      const res = await fetch(`/api/presentations/${presentationId}/collaborators`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collaboratorId, role: newRole }),
      });

      if (!res.ok) {
        throw new Error("Failed to update role");
      }

      toast.success("Role updated!");
    } catch {
      setCollaborators(previousCollaborators);
      toast.error("Failed to update role");
    } finally {
      setUpdatingCollabId(null);
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
      <div className="space-y-3">
        <div 
          className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 min-h-[52px] cursor-text"
          onClick={() => document.getElementById("email-input")?.focus()}
        >
          {emailList.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {email}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeEmail(email);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition"
              >
                <X size={14} />
              </button>
            </span>
          ))}

          <input
            id="email-input"
            type="email"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            onBlur={addEmailToList}
            placeholder={emailList.length === 0 ? "Add emails (press Enter after each)" : "Add more..."}
            className="flex-1 min-w-[150px] bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {emailList.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <button
                ref={roleButtonRef}
                type="button"
                onClick={handleOpenRoleDropdown}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-slate-700 font-medium transition-all"
              >
                <span className="flex items-center gap-2">
                  {selectedRole === "editor" ? (
                    <>
                      <Edit3 size={14} className="text-[#1e3a8a]" />
                      Can edit
                    </>
                  ) : (
                    <>
                      <Globe size={14} className="text-[#06b6d4]" />
                      Can view
                    </>
                  )}
                </span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${showRoleDropdown ? "rotate-180" : ""}`} 
                />
              </button>

              {showRoleDropdown && typeof document !== "undefined" && createPortal(
                <>
                  <div 
                    className="fixed inset-0 z-[99999]" 
                    onClick={() => setShowRoleDropdown(false)} 
                  />
                  <div 
                    className="bg-white rounded-lg border border-slate-200 shadow-xl z-[100000] overflow-hidden animate-in fade-in duration-100"
                    style={roleDropdownStyle}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole("viewer");
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${
                        selectedRole === "viewer" ? "bg-slate-50" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center">
                        <Globe size={16} className="text-[#06b6d4]" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Can view</p>
                        <p className="text-xs text-slate-500">View only access</p>
                      </div>
                    </button>
                    <div className="border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole("editor");
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${
                        selectedRole === "editor" ? "bg-slate-50" : ""
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#1e3a8a]/10 flex items-center justify-center">
                        <Edit3 size={16} className="text-[#1e3a8a]" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Can edit</p>
                        <p className="text-xs text-slate-500">Full editing access</p>
                      </div>
                    </button>
                  </div>
                </>,
                document.body
              )}
            </div>
            <button
              onClick={handleInviteAll}
              disabled={loading || emailList.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Add {emailList.length > 1 ? `(${emailList.length})` : ""}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex items-center justify-between py-3 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <span className="text-sm font-bold text-white">Y</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">You</p>
            <p className="text-xs text-slate-500">Owner</p>
          </div>
        </div>
        <span className="text-sm text-slate-500 font-medium">Full Access</span>
      </div>

      {!fetching && collaborators.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto border-t border-slate-200 pt-4">
          {collaborators.map((collab) => (
            <div 
              key={collab.id} 
              className={`flex items-center justify-between py-3 hover:bg-slate-50 rounded-lg px-2 transition-all duration-200 ${
                updatingCollabId === collab.id ? "opacity-50" : ""
              }`}
            >
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
                    <div className="relative">
                      <button
                        ref={(el) => { collabButtonRefs.current[collab.id] = el; }}
                        type="button"
                        onClick={() => handleOpenCollabDropdown(collab.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 text-slate-600 font-medium transition-all"
                      >
                        {collab.role === "editor" ? (
                          <>
                            <Edit3 size={12} className="text-[#1e3a8a]" />
                            Can edit
                          </>
                        ) : (
                          <>
                            <Globe size={12} className="text-[#06b6d4]" />
                            Can view
                          </>
                        )}
                        <ChevronDown 
                          size={14} 
                          className={`text-slate-400 transition-transform duration-200 ${openCollabDropdown === collab.id ? "rotate-180" : ""}`} 
                        />
                      </button>

                      {openCollabDropdown === collab.id && typeof document !== "undefined" && createPortal(
                        <>
                          <div 
                            className="fixed inset-0 z-[99999]" 
                            onClick={() => setOpenCollabDropdown(null)} 
                          />
                          <div 
                            className="bg-white rounded-lg border border-slate-200 shadow-xl z-[100000] overflow-hidden animate-in fade-in duration-100"
                            style={dropdownStyle}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCollabDropdown(null);
                                if (collab.role !== "viewer") {
                                  handleUpdateRole(collab.id, "viewer");
                                }
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${
                                collab.role === "viewer" ? "bg-slate-50" : ""
                              }`}
                            >
                              <Globe size={12} className="text-[#06b6d4]" />
                              Can view
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenCollabDropdown(null);
                                if (collab.role !== "editor") {
                                  handleUpdateRole(collab.id, "editor");
                                }
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${
                                collab.role === "editor" ? "bg-slate-50" : ""
                              }`}
                            >
                              <Edit3 size={12} className="text-[#1e3a8a]" />
                              Can edit
                            </button>
                          </div>
                        </>,
                        document.body
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(collab.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                    {collab.role === "editor" ? (
                      <>
                        <Edit3 size={12} className="text-[#1e3a8a]" />
                        Can edit
                      </>
                    ) : (
                      <>
                        <Globe size={12} className="text-[#06b6d4]" />
                        Can view
                      </>
                    )}
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
