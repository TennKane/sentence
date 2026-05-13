"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SentenceForm } from "@/components/sentence/sentence-form";
import { ArticleForm } from "@/components/article/article-form";
import { cn } from "@/lib/utils/cn";

function RecordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "sentence";

  const tabs = [
    { key: "sentence", label: "句子" },
    { key: "article", label: "文章" },
  ] as const;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-hand text-3xl text-accent">记录</h1>

      {/* Tab switch */}
      <div className="mb-8 flex gap-1 rounded-lg border border-border bg-paper p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => router.replace(`/record?type=${tab.key}`)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              type === tab.key
                ? "bg-accent text-white shadow-sm"
                : "text-ink-muted hover:text-accent",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {type === "sentence" ? <SentenceForm mode="create" /> : <ArticleForm mode="create" />}
    </div>
  );
}

export default function RecordPage() {
  return (
    <Suspense>
      <RecordContent />
    </Suspense>
  );
}
