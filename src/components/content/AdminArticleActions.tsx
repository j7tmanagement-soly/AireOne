"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface Props {
  articleId: string;
  articleSlug: string;
}

export default function AdminArticleActions({ articleId, articleSlug }: Props) {
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleArchive() {
    if (!confirm) {
      setConfirm(true);
      return;
    }

    setArchiving(true);
    try {
      await fetch(`/api/articles/${articleId}`, { method: "DELETE" });
      router.push("/bible");
      router.refresh();
    } catch {
      setArchiving(false);
      setConfirm(false);
    }
  }

  return (
    <div className="space-y-2">
      <Link
        href={`/bible/${articleSlug}/edit`}
        className="flex items-center gap-2 w-full px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:border-brand-300 hover:text-brand-700 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
        Edit Article
      </Link>

      <button
        onClick={handleArchive}
        disabled={archiving}
        className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
          confirm
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-white border border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600"
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.75 7.5h16.5M13.5 7.5V3.375c0-.621-.504-1.125-1.125-1.125H11.625A1.125 1.125 0 0010.5 3.375V7.5" />
        </svg>
        {archiving ? "Archiving…" : confirm ? "Confirm Archive?" : "Archive Article"}
      </button>

      {confirm && (
        <button
          onClick={() => setConfirm(false)}
          className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
