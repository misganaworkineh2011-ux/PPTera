"use client";

import { useState, useEffect } from "react";
import { FileEdit, Plus, UserPlus, Trash2, History, Loader2, Eye, Download, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  presentation?: {
    id: string;
    title: string;
  } | null;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/activities?limit=100");
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityConfig = (type: string) => {
    switch (type) {
      case "create":
        return { icon: Plus, color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300", label: t.created };
      case "edit":
        return { icon: FileEdit, color: "bg-[#e0f2fe] text-[#06b6d4] dark:bg-[#06b6d4]/20", label: t.edited };
      case "view":
        return { icon: Eye, color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300", label: t.viewed };
      case "share":
      case "collaborate":
        return { icon: UserPlus, color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300", label: t.shared };
      case "export":
        return { icon: Download, color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300", label: t.exported };
      case "delete":
        return { icon: Trash2, color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300", label: t.deleted };
      default:
        return { icon: History, color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300", label: t.activity };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (minutes < 1) return t.justNow;
    if (minutes < 60) return `${minutes} ${t.minAgo}`;
    if (hours < 24) return `${hours} ${hours > 1 ? t.hoursAgo : t.hourAgo}`;
    if (days < 7) return `${days} ${days > 1 ? t.daysAgo : t.dayAgo}`;
    return date.toLocaleDateString();
  };

  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter(a => a.type === filter);

  const activityTypes = ["all", "create", "edit", "share", "export", "delete"];

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#06b6d4]" />
      </div>
    );
  }

  const getFilterLabel = (type: string) => {
    const labels: Record<string, string> = {
      all: t.all || "All",
      create: t.created || "Created",
      edit: t.edited || "Edited",
      share: t.shared || "Shared",
      export: t.exported || "Exported",
      delete: t.deleted || "Deleted",
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-6 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-white">{t.activityTitle}</h1>
          <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">{t.activitySubtitle}</p>
        </div>
        <button
          onClick={fetchActivities}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <RefreshCw size={14} /> {t.refresh}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {activityTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              filter === type
                ? "bg-[#1e3a8a] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            {getFilterLabel(type)}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-[#1e3a8a] dark:text-white">{t.noActivity}</h3>
            <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">{t.activityEmpty}</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-6">
              {filteredActivities.map((activity, index) => {
                const config = getActivityConfig(activity.type);
                const IconComponent = config.icon;
                return (
                  <div key={activity.id} className="relative flex gap-4">
                    {index !== filteredActivities.length - 1 && (
                      <div className="absolute left-[19px] top-10 h-full w-0.5 bg-slate-100 dark:bg-slate-700"></div>
                    )}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.color}`}>
                      <IconComponent size={18} />
                    </div>
                    <div className="flex flex-1 flex-col pt-1">
                      <p className="text-sm font-semibold text-[#1e3a8a] dark:text-white">
                        {activity.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className={`px-1.5 py-0.5 rounded ${config.color}`}>{config.label}</span>
                        <span>•</span>
                        <span>{formatDate(activity.createdAt)}</span>
                        {activity.presentation && (
                          <>
                            <span>•</span>
                            <Link 
                              href={`/presentation/${activity.presentation.id}`}
                              className="text-[#06b6d4] hover:underline"
                            >
                              {activity.presentation.title}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
