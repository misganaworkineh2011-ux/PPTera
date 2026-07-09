"use client";

import { useState, useEffect } from "react";
import {
  Code2,
  Key,
  Webhook,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import DashboardStickyHeader from "~/components/dashboard/DashboardStickyHeader";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
}

export default function ApiWebhooksPage() {
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const [activeTab, setActiveTab] = useState<"keys" | "webhooks" | "docs">("keys");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["export.completed"]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [keysRes, hooksRes] = await Promise.all([
        fetch("/api/user/api-keys"),
        fetch("/api/user/webhooks"),
      ]);

      if (keysRes.ok) setApiKeys(await keysRes.json());
      if (hooksRes.ok) setWebhooks(await hooksRes.json());
    } catch (err) {
      console.error("Failed to fetch API data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    setIsCreatingKey(true);
    try {
      const res = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!res.ok) throw new Error("Failed to create key");

      const data = await res.json();
      setCreatedKey(data.key);
      setNewKeyName("");
      fetchData();
      toast.success("API key created successfully");
    } catch (err) {
      toast.error("Failed to create API key");
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return;

    try {
      const res = await fetch(`/api/user/api-keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setApiKeys(apiKeys.filter(k => k.id !== id));
      toast.success("API key revoked");
    } catch (err) {
      toast.error("Failed to revoke API key");
    }
  };

  const handleCreateWebhook = async () => {
    if (!webhookUrl.trim() || !webhookUrl.startsWith("http")) {
      toast.error("Please enter a valid URL (starting with http/https)");
      return;
    }

    setIsCreatingWebhook(true);
    try {
      const res = await fetch("/api/user/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl, events: selectedEvents }),
      });

      if (!res.ok) throw new Error("Failed to create webhook");

      setWebhookUrl("");
      setIsCreatingWebhook(false);
      fetchData();
      toast.success("Webhook configured successfully");
    } catch (err) {
      toast.error("Failed to create webhook");
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    try {
      const res = await fetch(`/api/user/webhooks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setWebhooks(webhooks.filter(w => w.id !== id));
      toast.success("Webhook deleted");
    } catch (err) {
      toast.error("Failed to delete webhook");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (loading && apiKeys.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      <DashboardStickyHeader
        icon={<Code2 size={22} />}
        title={t.apiAndWebhooks || "API & Webhooks"}
        subtitle="Manage your Ultra-tier developer access and automation"
        stickyIcon={<Code2 size={18} />}
        stickyTitle={t.apiAndWebhooks || "API & Webhooks"}
      />

      <div className="flex border-b border-slate-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("keys")}
          className={cn(
            "px-6 py-3 text-sm font-semibold transition-all border-b-2",
            activeTab === "keys"
              ? "border-cyan-500 text-cyan-500"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
          )}
        >
          API Keys
        </button>
        <button
          onClick={() => setActiveTab("webhooks")}
          className={cn(
            "px-6 py-3 text-sm font-semibold transition-all border-b-2",
            activeTab === "webhooks"
              ? "border-cyan-500 text-cyan-500"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
          )}
        >
          Webhooks
        </button>
        <button
          onClick={() => setActiveTab("docs")}
          className={cn(
            "px-6 py-3 text-sm font-semibold transition-all border-b-2",
            activeTab === "docs"
              ? "border-cyan-500 text-cyan-500"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
          )}
        >
          Quick Start
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === "keys" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* Create Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Key size={18} className="text-cyan-500" />
                Create New API Key
              </h3>
              
              {createdKey ? (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm">
                      <p className="font-bold text-amber-800 dark:text-amber-200">Save this key!</p>
                      <p className="text-amber-700 dark:text-amber-300">For security, this key will only be shown once. Copy it now and store it safely.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-black/40 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
                    <code className="flex-1 font-mono text-xs break-all truncate">{createdKey}</code>
                    <button
                      onClick={() => copyToClipboard(createdKey)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => setCreatedKey(null)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    I've saved it
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="e.g. Production App, Integration"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <button
                    onClick={handleCreateKey}
                    disabled={isCreatingKey}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCreatingKey ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Generate Key
                  </button>
                </div>
              )}
            </div>

            {/* Keys Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-bold text-lg">Active API Keys</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-800/50 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">API Key</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4">Last Used</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {apiKeys.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-zinc-500 italic">
                          No API keys generated yet
                        </td>
                      </tr>
                    ) : (
                      apiKeys.map((key) => (
                        <tr key={key.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-sm">{key.name}</td>
                          <td className="px-6 py-4">
                            <code className="text-xs bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono">
                              {key.key}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {new Date(key.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : "Never"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteKey(key.id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "webhooks" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <Webhook size={18} className="text-cyan-500" />
                Configure Outgoing Webhook
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-app.com/api/webhooks/pptera"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
                    Events to Subscribe
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["export.completed", "export.failed", "presentation.created", "presentation.deleted"].map((event) => (
                      <button
                        key={event}
                        onClick={() => {
                          if (selectedEvents.includes(event)) {
                            setSelectedEvents(selectedEvents.filter(e => e !== event));
                          } else {
                            setSelectedEvents([...selectedEvents, event]);
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                          selectedEvents.includes(event)
                            ? "bg-cyan-50 border-cyan-200 text-cyan-600 dark:bg-cyan-950/30 dark:border-cyan-800"
                            : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"
                        )}
                      >
                        {event}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateWebhook}
                  disabled={isCreatingWebhook}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCreatingWebhook ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Add Webhook Endpoint
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-bold text-lg">Configured Webhooks</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-zinc-800/50 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Endpoint</th>
                      <th className="px-6 py-4">Events</th>
                      <th className="px-6 py-4">Secret (Signing Key)</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {webhooks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-zinc-500 italic">
                          No webhooks configured yet
                        </td>
                      </tr>
                    ) : (
                      webhooks.map((hook) => (
                        <tr key={hook.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-sm truncate max-w-[200px]">{hook.url}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {hook.events.map(e => (
                                <span key={e} className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                  {e}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono text-slate-500 truncate max-w-[100px]">
                                {hook.secret}
                              </code>
                              <button
                                onClick={() => copyToClipboard(hook.secret)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteWebhook(hook.id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "docs" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-8 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <ShieldCheck className="text-cyan-500" size={28} />
                  Authentication
                </h2>
                <p className="text-slate-600 dark:text-zinc-400">
                  All API requests must include your API key in the <code>X-API-Key</code> header.
                  You can generate multiple keys for different environments.
                </p>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm text-cyan-400 border border-slate-800 shadow-xl overflow-x-auto">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                    <span className="text-slate-500 text-xs">Example Shell Request</span>
                    <button onClick={() => copyToClipboard('curl -X GET "https://pptmaster.org/api/v1/presentations" \\\n  -H "X-API-Key: pptm_your_api_key_here"')} className="text-slate-500 hover:text-white transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                  <pre className="text-xs sm:text-sm">
                    {`curl -X GET "https://pptmaster.org/api/v1/presentations" \\
  -H "X-API-Key: pptm_your_api_key_here"`}
                  </pre>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                    <Zap className="text-cyan-600" size={20} />
                  </div>
                  <h3 className="font-bold">Available Endpoints</h3>
                  <ul className="text-sm space-y-2 text-slate-600 dark:text-zinc-400">
                    <li><code className="text-cyan-600 font-bold">GET</code> /api/v1/presentations</li>
                    <li><code className="text-cyan-600 font-bold">POST</code> /api/v1/generate</li>
                    <li><code className="text-cyan-600 font-bold">GET</code> /api/v1/exports/:id</li>
                    <li><code className="text-cyan-600 font-bold">GET</code> /api/v1/credits</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Webhook className="text-purple-600" size={20} />
                  </div>
                  <h3 className="font-bold">Webhook Events</h3>
                  <p className="text-sm text-slate-600 dark:text-zinc-400">
                    Receive real-time notifications when long-running jobs are finished.
                  </p>
                  <ul className="text-sm space-y-2 text-slate-600 dark:text-zinc-400">
                    <li><code className="text-purple-600 font-bold">export.completed</code></li>
                    <li><code className="text-purple-600 font-bold">presentation.created</code></li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Link
                  href="/developer-docs"
                  className="inline-flex items-center gap-2 text-cyan-600 font-bold hover:underline"
                >
                  View Full Documentation
                  <ExternalLink size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
