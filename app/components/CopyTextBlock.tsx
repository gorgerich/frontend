"use client";

import { useCallback, useEffect, useState } from "react";

type CopyTextBlockProps = {
  text: string;
};

const COPY_RESET_MS = 1800;

export default function CopyTextBlock({ text }: CopyTextBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [text]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  return (
    <div className="max-w-[72ch] rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm md:p-5">
      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          aria-label="Скопировать шаблон текста"
          onClick={handleCopy}
          className="inline-flex min-h-9 items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
        >
          {copied ? "Скопировано" : "Скопировать"}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-800">{text}</p>
    </div>
  );
}
