"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  dept: string;
}

interface ArticleEditorProps {
  categories: Category[];
  article?: {
    id: string;
    title: string;
    content: string;
    categoryId: string;
    contentType: string;
    status: string;
    requiresAck: boolean;
    tags: string[];
  };
  onSaved?: (slug: string) => void;
}

const CONTENT_TYPES = [
  { value: "ARTICLE", label: "Article" },
  { value: "SOP", label: "Procedure (SOP)" },
  { value: "POLICY", label: "Policy" },
  { value: "INCIDENT_GUIDE", label: "Incident Guide" },
];

export default function ArticleEditor({ categories, article, onSaved }: ArticleEditorProps) {
  const router = useRouter();
  const isEditing = !!article;

  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? "");
  const [contentType, setContentType] = useState(article?.contentType ?? "ARTICLE");
  const [status, setStatus] = useState(article?.status ?? "PUBLISHED");
  const [requiresAck, setRequiresAck] = useState(article?.requiresAck ?? false);
  const [tagInput, setTagInput] = useState(article?.tags.join(", ") ?? "");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim()) { setError("Title is required"); return; }
    if (!content.trim()) { setError("Content is required"); return; }
    if (!categoryId) { setError("Please select a category"); return; }

    setError("");
    setSaving(true);

    const tags = tagInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const body = { title, content, categoryId, contentType, status, requiresAck, tags };

    try {
      const res = await fetch(
        isEditing ? `/api/articles/${article!.id}` : "/api/articles",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to save article");
        return;
      }

      if (onSaved) {
        onSaved(json.data.slug);
      } else {
        router.push(`/bible/${json.data.slug}`);
        router.refresh();
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setPreview(false)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            !preview
              ? "bg-brand-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => setPreview(true)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            preview
              ? "bg-brand-600 text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:border-brand-300"
          }`}
        >
          Preview
        </button>
      </div>

      {!preview ? (
        <>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to Handle a No-Cool Call"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Row: category + type */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Content <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">
                Supports **bold**, *italic*, `code`, # headers, - lists, &gt; quotes
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"# Introduction\n\nWrite your content here...\n\n## Section\n\n- Point one\n- Point two"}
              rows={20}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tags
              <span className="text-slate-400 font-normal ml-1">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. hvac, service, no-cool"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Status + ack row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={requiresAck}
                    onChange={(e) => setRequiresAck(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${requiresAck ? "bg-brand-600" : "bg-slate-200"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${requiresAck ? "translate-x-5" : "translate-x-1"}`}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700">Requires Acknowledgement</div>
                  <div className="text-xs text-slate-400">Employees must sign off on this</div>
                </div>
              </label>
            </div>
          </div>

          {/* Formatting helper */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Formatting Reference</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs text-slate-600 font-mono">
              <span># Heading 1</span>
              <span>## Heading 2</span>
              <span>### Heading 3</span>
              <span>**bold text**</span>
              <span>*italic text*</span>
              <span>`inline code`</span>
              <span>- bullet item</span>
              <span>1. numbered item</span>
              <span>&gt; blockquote</span>
              <span>⚠️ warning text</span>
              <span>💡 tip text</span>
              <span>--- (divider)</span>
            </div>
          </div>
        </>
      ) : (
        /* Preview pane */
        <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-64">
          {title && (
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{title}</h1>
          )}
          {!title && !content && (
            <p className="text-slate-400 text-sm italic">Nothing to preview yet…</p>
          )}
          {content && (
            <div className="mt-4">
              <PreviewContent content={content} />
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving…" : isEditing ? "Save Changes" : "Publish Article"}
        </button>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:border-slate-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Lightweight preview — just render headings and paragraphs
function PreviewContent({ content }: { content: string }) {
  return (
    <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
      {content.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;
        if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold text-slate-900">{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold text-slate-900">{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold text-slate-900">{line.slice(4)}</h3>;
        if (line.match(/^[-*] /)) return <p key={i} className="ml-4">• {line.slice(2)}</p>;
        if (line.match(/^---+$/)) return <hr key={i} className="border-slate-200 my-2" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}
