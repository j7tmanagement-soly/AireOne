import { getSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ArticleEditor from "@/components/forms/ArticleEditor";

export const metadata = { title: "New Article | HVAC Ops" };

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isAdmin(session.role)) redirect("/bible");

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, dept: true },
  });

  // Pre-select category if passed via query param
  const preselected = searchParams.category
    ? categories.find((c) => c.id === searchParams.category)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/bible" className="hover:text-brand-600 transition-colors">
            Company Bible
          </Link>
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900 font-medium">New Article</span>
        </nav>

        <h1 className="text-2xl font-bold text-slate-900">Create Article</h1>
        <p className="text-slate-500 mt-1">
          Write an article, procedure, or policy for your team
        </p>
      </div>

      <ArticleEditor
        categories={categories}
        article={
          preselected
            ? {
                id: "",
                title: "",
                content: "",
                categoryId: preselected.id,
                contentType: "ARTICLE",
                status: "PUBLISHED",
                requiresAck: false,
                tags: [],
              }
            : undefined
        }
      />
    </div>
  );
}
