import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { FileEdit, Plus, UserPlus, Trash2, History } from "lucide-react";
import ActivityStickyHeader from "./ActivityStickyHeader";

export default async function ActivityPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  // Map activity types to icons and colors
  const getActivityConfig = (type: string) => {
    switch (type) {
      case "create":
        return { icon: Plus, color: "bg-green-100 text-green-600" };
      case "edit":
        return { icon: FileEdit, color: "bg-[#e0f2fe] text-[#06b6d4]" };
      case "share":
      case "collaborate":
        return { icon: UserPlus, color: "bg-purple-100 text-purple-600" };
      case "delete":
        return { icon: Trash2, color: "bg-red-100 text-red-600" };
      default:
        return { icon: History, color: "bg-slate-100 text-slate-600" };
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const activities = user.activities.map((activity) => {
    const config = getActivityConfig(activity.type);
    return {
      id: activity.id,
      type: activity.type,
      icon: config.icon,
      color: config.color,
      description: activity.description,
      date: formatDate(activity.createdAt),
      user: user.name || "You",
    };
  });

  // If no activities, show placeholder
  if (activities.length === 0) {
    activities.push(
      {
        id: "1",
        type: "create",
        icon: Plus,
        color: "bg-[#e0f2fe] text-[#06b6d4]",
        description: "No activity yet. Start creating to see your activity history.",
        date: "Now",
        user: "System",
      }
    );
  }

  return (
    <div className="space-y-8 h-full">
      {/* Sticky Header Section */}
      <ActivityStickyHeader />

      {/* Activity Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-8">
          {activities.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="relative flex gap-4">
                {/* Timeline Line */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-[19px] top-10 h-full w-0.5 bg-slate-100"></div>
                )}
                
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.color}`}
                >
                  <IconComponent size={18} />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col pt-1">
                  <p className="text-sm font-semibold text-[#1e3a8a]">
                    {activity.description}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.date}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
