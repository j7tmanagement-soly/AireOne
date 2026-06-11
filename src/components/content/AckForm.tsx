"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AckFormProps {
  articleId: string;
  articleTitle: string;
  userId: string;
  fullName: string;
  employeeId?: string;
}

export default function AckForm({
  articleId,
  articleTitle,
  userId,
  fullName,
  employeeId,
}: AckFormProps) {
  const router = useRouter();
  const [typedName, setTypedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const nameMatches =
    typedName.trim().toLowerCase() === fullName.trim().toLowerCase();

  async function handleAck() {
    if (!nameMatches) {
      setError("Name doesn't match your account name");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/acknowledgements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "ARTICLE",
          contentId: articleId,
          fullName: fullName,
          employeeId: employeeId,
          signatureData: `typed:${typedName.trim()}`,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to submit acknowledgement");
        return;
      }

      setDone(true);
      router.refresh();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-green-900">Acknowledged — thank you</p>
          <p className="text-xs text-green-700 mt-0.5">Your signature has been recorded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-900">Acknowledgement Required</p>
          <p className="text-sm text-amber-800 mt-0.5">
            By signing below, you confirm you have read and understood{" "}
            <strong>{articleTitle}</strong>.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-amber-200 p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Type your full name to sign
          </label>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder={`Type: ${fullName}`}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
              typedName && nameMatches
                ? "border-green-300 focus:ring-green-400 bg-green-50"
                : typedName && !nameMatches
                ? "border-red-300 focus:ring-red-400"
                : "border-slate-200 focus:ring-brand-500"
            }`}
          />
          {typedName && !nameMatches && (
            <p className="text-xs text-red-600 mt-1">
              Must match your account name: {fullName}
            </p>
          )}
          {typedName && nameMatches && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              Name verified
            </p>
          )}
        </div>

        {employeeId && (
          <div className="text-xs text-slate-500">
            Employee ID: <span className="font-mono font-medium">{employeeId}</span>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        <button
          onClick={handleAck}
          disabled={!nameMatches || submitting}
          className="w-full py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Submitting…" : "I Have Read and Understood This"}
        </button>
      </div>

      <p className="text-xs text-amber-700 mt-3 opacity-75">
        This acknowledgement is legally binding. Your IP address, device, and timestamp are recorded.
      </p>
    </div>
  );
}
