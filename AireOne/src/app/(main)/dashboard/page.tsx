import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (isAdmin(session.role)) redirect("/admin");

  // Fetch pending acknowledgements (simplified for now)
  const pendingAcks = await prisma.announcement.findMany({
    where: {
      requiresAck: true,
      isActive: true,
      acknowledgements: { none: { userId: session.id } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Recent announcements
  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { author: { select: { fullName: true } } },
  });

  // Recent articles
  const recentArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 6,
    include: { category: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Good {getTimeOfDay()}, {session.fullName.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here's what needs your attention today.</p>
      </div>

      {/* Pending acks banner */}
      {pendingAcks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">
                {pendingAcks.length} item{pendingAcks.length !== 1 ? "s" : ""} require your acknowledgement
              </p>
              <p className="text-sm text-amber-700 mt-0.5">Please review and sign these items to stay compliant.</p>
              <div className="mt-3 space-y-1">
                {pendingAcks.map((a) => (
                  <Link
                    key={a.id}
                    href={`/announcements/${a.id}`}
                    className="block text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                  >
                    → {a.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Pending Signatures" value={pendingAcks.length} urgent={pendingAcks.length > 0} href="/announcements" />
        <StatCard label="Announcements" value={announcements.length} href="/announcements" />
        <StatCard label="Training Modules" value={0} href="/training" />
        <StatCard label="Articles Read" value={0} href="/bible" />
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Announcements</h2>
            <Link href="/announcements" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all</Link>
          </div>
          <div className="space-y-2">
            {announcements.map((a) => (
              <Link
                key={a.id}
                href={`/announcements/${a.id}`}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-sm transition-all"
              >
                <PriorityBadge priority={a.priority} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{a.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {a.author.fullName} · {formatDate(a.createdAt)}
                  </p>
                </div>
                {a.requiresAck && !pendingAcks.find(p => p.id === a.id) && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full shrink-0">Signed</span>
                )}
                {a.requiresAck && pendingAcks.find(p => p.id === a.id) && (
                  <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full shrink-0">Sign required</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent articles */}
      {recentArticles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-slate-900">Recent Knowledge Updates</h2>
            <Link href="/bible" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Browse all</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {recentArticles.map((a) => (
              <Link
                key={a.id}
                href={`/bible/${a.slug}`}
                className="p-4 bg-white rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    {a.category.name}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 line-clamp-2">{a.title}</p>
                {a.isSample && (
                  <span className="text-xs text-slate-400 mt-1 block">Sample content</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {recentArticles.length === 0 && announcements.length === 0 && pendingAcks.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="font-medium">No content yet</p>
          <p className="text-sm mt-1">Your admin will publish content here soon.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, urgent, href }: { label: string; value: number; urgent?: boolean; href: string }) {
  return (
    <Link href={href} className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
      urgent && value > 0
        ? "bg-amber-50 border-amber-200"
        : "bg-white border-slate-200 hover:border-brand-200"
    }`}>
      <div className={`text-2xl font-bold ${urgent && value > 0 ? "text-amber-700" : "text-slate-900"}`}>
        {value}
      </div>
      <div className={`text-xs font-medium mt-0.5 ${urgent && value > 0 ? "text-amber-600" : "text-slate-500"}`}>
        {label}
      </div>
    </Link>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    NORMAL: "bg-slate-100 text-slate-500",
    IMPORTANT: "bg-blue-100 text-blue-600",
    CRITICAL: "bg-red-100 text-red-600",
  };
  return (
    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
      priority === "CRITICAL" ? "bg-red-500" : priority === "IMPORTANT" ? "bg-blue-500" : "bg-slate-300"
    }`} />
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));
}
