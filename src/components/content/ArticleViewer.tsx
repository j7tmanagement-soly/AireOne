"use client";

import { useEffect } from "react";

interface ArticleViewerProps {
  article: {
    id: string;
    title: string;
    content: string;
    contentType: string;
    tags: string[];
    viewCount: number;
    requiresAck: boolean;
    isSample: boolean;
    publishedAt: Date | null;
    updatedAt: Date;
    author: { fullName: string };
    category: { name: string; slug: string };
    _count?: { readRecords: number };
  };
  isAdmin?: boolean;
  onEdit?: () => void;
}

export default function ArticleViewer({ article, isAdmin, onEdit }: ArticleViewerProps) {
  // Auto-scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [article.id]);

  return (
    <article className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        {/* Breadcrumb + badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
          <span className="font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
            {article.category.name}
          </span>
          <span className="text-slate-300">·</span>
          <TypeBadge type={article.contentType} />
          {article.isSample && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              Sample Content
            </span>
          )}
          {article.requiresAck && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium">
              Requires Acknowledgement
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 leading-snug mb-3">
          {article.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {article.author.fullName}
          </span>
          {article.publishedAt && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {formatDate(article.publishedAt)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {article.viewCount.toLocaleString()} views
          </span>
          {isAdmin && article._count && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              {article._count.readRecords} readers
            </span>
          )}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Admin edit button */}
      {isAdmin && onEdit && (
        <div className="mb-6">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:border-brand-300 hover:text-brand-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit Article
          </button>
        </div>
      )}

      {/* Divider */}
      <hr className="border-slate-200 mb-6" />

      {/* Content body */}
      <div className="prose-content">
        <ContentRenderer content={article.content} />
      </div>

      {/* Updated at */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Last updated {formatDate(article.updatedAt)}
        </p>
      </div>
    </article>
  );
}

// ── Content renderer ────────────────────────────────────────────────────────
// Parses and renders simple markdown-like content stored as plain text.
// Supports: # headers, **bold**, *italic*, - lists, numbered lists,
//           > blockquotes, ``` code blocks, --- dividers, plain paragraphs.

function ContentRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm my-4 leading-relaxed">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++;
      continue;
    }

    // H1
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold text-slate-900 mt-8 mb-3 first:mt-0">
          {inlineFormat(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl font-bold text-slate-900 mt-7 mb-2.5">
          {inlineFormat(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-slate-900 mt-5 mb-2">
          {inlineFormat(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={i} className="border-l-4 border-brand-400 pl-4 py-1 my-4 text-slate-600 italic">
          {quoteLines.map((l, idx) => (
            <p key={idx} className={idx > 0 ? "mt-1" : ""}>
              {inlineFormat(l)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Warning / tip callout  ⚠️ or 💡
    if (line.startsWith("⚠️") || line.startsWith("WARNING:")) {
      elements.push(
        <div key={i} className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl my-4">
          <span className="text-xl shrink-0">⚠️</span>
          <p className="text-sm text-amber-900">
            {inlineFormat(line.replace(/^⚠️\s*|^WARNING:\s*/i, ""))}
          </p>
        </div>
      );
      i++;
      continue;
    }

    if (line.startsWith("💡") || line.startsWith("TIP:")) {
      elements.push(
        <div key={i} className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl my-4">
          <span className="text-xl shrink-0">💡</span>
          <p className="text-sm text-blue-900">
            {inlineFormat(line.replace(/^💡\s*|^TIP:\s*/i, ""))}
          </p>
        </div>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (line.match(/^-{3,}$/) || line.match(/^\*{3,}$/) || line.match(/^_{3,}$/)) {
      elements.push(<hr key={i} className="border-slate-200 my-6" />);
      i++;
      continue;
    }

    // Unordered list
    if (line.match(/^[-*+] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*+] /)) {
        items.push(lines[i].replace(/^[-*+] /, ""));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-outside ml-5 my-3 space-y-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="text-slate-700 text-sm leading-relaxed pl-1">
              {inlineFormat(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="list-decimal list-outside ml-5 my-3 space-y-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="text-slate-700 text-sm leading-relaxed pl-1">
              {inlineFormat(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-slate-700 text-sm leading-relaxed my-3">
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

// Inline formatting: **bold**, *italic*, `code`, [text](url)
function inlineFormat(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Split on bold, italic, inline code, links
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }

    if (match[0].startsWith("**")) {
      parts.push(<strong key={match.index} className="font-semibold text-slate-900">{match[2]}</strong>);
    } else if (match[0].startsWith("*")) {
      parts.push(<em key={match.index} className="italic">{match[3]}</em>);
    } else if (match[0].startsWith("`")) {
      parts.push(<code key={match.index} className="bg-slate-100 text-brand-700 px-1.5 py-0.5 rounded text-xs font-mono">{match[4]}</code>);
    } else if (match[0].startsWith("[")) {
      parts.push(
        <a key={match.index} href={match[6]} className="text-brand-600 underline underline-offset-2 hover:text-brand-700" target="_blank" rel="noopener noreferrer">
          {match[5]}
        </a>
      );
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ARTICLE: { label: "Article", className: "text-slate-500 bg-slate-100" },
    SOP: { label: "Procedure", className: "text-purple-600 bg-purple-50" },
    POLICY: { label: "Policy", className: "text-blue-600 bg-blue-50" },
    INCIDENT_GUIDE: { label: "Incident Guide", className: "text-red-600 bg-red-50" },
  };
  const { label, className } = map[type] ?? map.ARTICLE;
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
      {label}
    </span>
  );
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
