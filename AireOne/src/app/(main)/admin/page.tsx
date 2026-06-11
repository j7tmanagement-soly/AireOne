import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isAdmin(session.role)) redirect("/dashboard");

  const [totalUsers, totalArticles, totalPolicies, pendingAcksCount, recentActivity] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.policy.count(),
    prisma.acknowledgement.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { fullName: true } } },
    }),
  ]);

  // Users who have outstanding required acks
  const announcementsRequiringAck = await prisma.announcement.count({
    where: { requiresAck: true, isActive: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview and compliance status</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AdminStat label="Active Employees" value={totalUsers} href="/admin/users" color="blue" />
        <AdminStat label="Published Articles" value={totalArticles} href="/bible" color="green" />
        <AdminStat label="Policies" value={totalPolicies} href="/policies" color="purple" />
        <AdminStat label="Total Signatures" value={pendingAcksCount} href="/admin/reports" color="slate" />
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction href="/admin/users?action=new" label="Add Employee" icon="user-plus" />
          <QuickAction href="/bible?action=new" label="New Article" icon="document-plus" />
          <QuickAction href="/announcements?action=new" label="New Announcement" icon="megaphone" />
          <QuickAction href="/policies?action=new" label="New Policy" icon="clipboard" />
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400 p-4 text-center">No activity yet</p>
          ) : (
            recentActivity.map((log) => (
              <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-slate-700">
                    <span className="font-medium">{log.user?.fullName ?? "System"}</span>
                    {" · "}
                    <span className="text-slate-500">{formatAction(log.action)}</span>
                    {log.entityType && (
                      <span className="text-slate-400"> ({log.entityType})</span>
                    )}
                  </span>
                </div>
                <time className="text-xs text-slate-400 shrink-0">
                  {formatRelativeTime(log.createdAt)}
                </time>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function AdminStat({ label, value, href, color }: {
  label: string; value: number; href: string; color: string;
}) {
  const colors: Record<string, string> = {
    blue: "text-blue-700 bg-blue-50 border-blue-100",
    green: "text-green-700 bg-green-50 border-green-100",
    purple: "text-purple-700 bg-purple-50 border-purple-100",
    slate: "text-slate-700 bg-white border-slate-200",
  };
  return (
    <Link href={href} className={`p-4 rounded-xl border transition-all hover:shadow-sm ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium mt-0.5 opacity-70">{label}</div>
    </Link>
  );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: string }) {
  const icons: Record<string, string> = {
    "user-plus": "M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z",
    "document-plus": "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
    "megaphone": "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46",
    "clipboard": "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z",
  };

  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-sm transition-all text-center"
    >
      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
        <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icons[icon]} />
        </svg>
      </div>
      <span className="text-xs font-medium text-slate-700">{label}</span>
    </Link>
  );
}

function formatAction(action: string) {
  return action.replace(/_/g, " ").toLowerCase();
}

function formatRelativeTime(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
