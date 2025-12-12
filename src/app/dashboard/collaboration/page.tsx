import { Users, UserPlus, FolderOpen, Mail } from "lucide-react";

export default function CollaborationPage() {
  const sharedProjects = [
    {
      id: "proj-1",
      title: "Q4 Marketing Strategy",
      members: 3,
      role: "Owner",
      updated: "2 hours ago",
    },
    {
      id: "proj-2",
      title: "Product Roadmap 2024",
      members: 5,
      role: "Editor",
      updated: "1 day ago",
    },
  ];

  const teamMembers = [
    { name: "Alice Smith", email: "alice@example.com", role: "Admin" },
    { name: "Bob Jones", email: "bob@example.com", role: "Editor" },
    { name: "Charlie Day", email: "charlie@example.com", role: "Viewer" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collaboration</h1>
          <p className="text-sm text-slate-500">
            Manage your team and shared projects
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
          <UserPlus size={16} /> Invite Member
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shared Projects */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Shared Projects</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            {sharedProjects.length > 0 ? (
              <div className="space-y-4">
                {sharedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-4 transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <FolderOpen size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {project.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {project.role} • Updated {project.updated}
                        </p>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                       {Array.from({ length: project.members }).map((_, i) => (
                          <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200"></div>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500">
                No shared projects yet
              </p>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {member.name}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <Mail size={10} /> {member.email}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

