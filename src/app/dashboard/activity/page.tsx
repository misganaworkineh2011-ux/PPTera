import { History, FileEdit, Plus, UserPlus, Trash2, Filter } from "lucide-react";

export default function ActivityPage() {
  const activities = [
    {
      id: 1,
      type: "create",
      icon: Plus,
      color: "bg-green-100 text-green-600",
      description: "Created a new presentation 'Q4 Marketing Strategy'",
      date: "2 hours ago",
      user: "You",
    },
    {
      id: 2,
      type: "edit",
      icon: FileEdit,
      color: "bg-blue-100 text-blue-600",
      description: "Edited slides 4-6 in 'Q4 Marketing Strategy'",
      date: "3 hours ago",
      user: "You",
    },
    {
      id: 3,
      type: "collaborate",
      icon: UserPlus,
      color: "bg-purple-100 text-purple-600",
      description: "Invited Sarah Jenkins to 'Project Alpha'",
      date: "Yesterday at 4:30 PM",
      user: "You",
    },
    {
      id: 4,
      type: "delete",
      icon: Trash2,
      color: "bg-red-100 text-red-600",
      description: "Deleted 'Untitled Draft'",
      date: "Yesterday at 2:00 PM",
      user: "You",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity History</h1>
          <p className="text-sm text-slate-500">
            Track changes and updates across your projects
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-8">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative flex gap-4">
              {/* Timeline Line */}
              {index !== activities.length - 1 && (
                <div className="absolute left-[19px] top-10 h-full w-0.5 bg-slate-100"></div>
              )}
              
              {/* Icon */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.color}`}
              >
                <activity.icon size={18} />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col pt-1">
                <p className="text-sm font-medium text-slate-900">
                  {activity.description}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{activity.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

