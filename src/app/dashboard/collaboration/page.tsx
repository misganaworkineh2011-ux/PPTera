import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { FolderOpen, Mail, Users } from "lucide-react";
import CollaborationStickyHeader from "./CollaborationStickyHeader";

export default async function CollaborationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      collaborations: {
        include: {
          presentation: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  // Group collaborations by presentation
  const sharedProjects = user.collaborations.reduce((acc, collab) => {
    const existing = acc.find(p => p.id === collab.presentationId);
    if (existing) {
      existing.members++;
    } else {
      acc.push({
        id: collab.presentationId,
        title: collab.presentation.title,
        members: 1,
        role: collab.role,
        updated: "Recently",
      });
    }
    return acc;
  }, [] as Array<{ id: string; title: string; members: number; role: string; updated: string }>);

  // Mock team members for now - replace with actual data when available
  const teamMembers = [
    { name: "Alice Smith", email: "alice@example.com", role: "Admin" },
    { name: "Bob Jones", email: "bob@example.com", role: "Editor" },
    { name: "Charlie Day", email: "charlie@example.com", role: "Viewer" },
  ];

  return (
    <div className="space-y-8 h-full">
      {/* Sticky Header Section */}
      <CollaborationStickyHeader />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shared Projects */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1e3a8a]">Shared Projects</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {sharedProjects.length > 0 ? (
              <div className="space-y-4">
                {sharedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-4 transition hover:border-[#06b6d4]/50 hover:bg-[#e0f2fe]/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10 text-[#06b6d4]">
                        <FolderOpen size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1e3a8a]">
                          {project.title}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {project.role} • Updated {project.updated}
                        </p>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                       {Array.from({ length: Math.min(project.members, 3) }).map((_, i) => (
                          <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4]"></div>
                       ))}
                       {project.members > 3 && (
                         <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-bold text-slate-600">
                           +{project.members - 3}
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-slate-500 py-8">
                No shared projects yet
              </p>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1e3a8a]">Team Members</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white font-bold text-sm">
                      {member.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1e3a8a]">
                        {member.name}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <Mail size={10} /> {member.email}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#e0f2fe] px-3 py-1 text-xs font-semibold text-[#06b6d4]">
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
