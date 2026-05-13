"use client";

import { useState, useCallback } from "react";
import { PaperButton } from "@/components/ui/paper-button";
import { PaperCard } from "@/components/ui/paper-card";
import { Loader2, Search } from "lucide-react";
import { TagBadge } from "@/components/ui/tag-badge";
import Link from "next/link";
import { toast } from "sonner";
import type { SearchResult } from "@/types";

interface SearchResponse {
  matches: SearchResult[];
  totalProcessed: number;
  processingTimeMs: number;
}

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [metadata, setMetadata] = useState<{
    totalProcessed: number;
    processingTimeMs: number;
  } | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setSearching(true);
    setResults(null);
    setMetadata(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "搜索失败");
      }

      const data: SearchResponse = await res.json();
      setResults(data.matches);
      setMetadata({
        totalProcessed: data.totalProcessed,
        processingTimeMs: data.processingTimeMs,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "搜索失败");
    } finally {
      setSearching(false);
    }
  }, [query]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 font-hand text-3xl text-accent">AI 搜索</h1>
      <p className="mb-8 text-sm text-ink-muted">
        用自然语言描述你想找的句子，AI 会帮你从记录中找出最匹配的
      </p>

      {/* Search input */}
      <div className="mb-8">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder='例如："关于孤独的句子" 或 "描述秋天的文字"…'
          rows={3}
          className="w-full rounded-lg border border-border bg-paper p-4 text-ink placeholder:text-ink-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden transition-colors resize-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-ink-muted">按 Enter 搜索，Shift+Enter 换行</span>
          <PaperButton onClick={handleSearch} disabled={!query.trim() || searching}>
            {searching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                搜索中…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                搜索
              </>
            )}
          </PaperButton>
        </div>
      </div>

      {/* Loading state */}
      {searching && (
        <div className="flex flex-col items-center justify-center py-16 text-ink-muted">
          <Loader2 className="mb-3 h-6 w-6 animate-spin" />
          <p className="text-sm">AI 正在思考中…</p>
        </div>
      )}

      {/* Results */}
      {results !== null && !searching && (
        <>
          {results.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-ink-muted">没有找到匹配的句子</p>
              {metadata && (
                <p className="mt-2 text-xs text-ink-muted/60">
                  已检索 {metadata.totalProcessed} 条，用时 {(metadata.processingTimeMs / 1000).toFixed(1)}s
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-ink-muted">
                  找到 {results.length} 个匹配
                </p>
                {metadata && (
                  <p className="text-xs text-ink-muted/60">
                    已检索 {metadata.totalProcessed} 条，用时{" "}
                    {(metadata.processingTimeMs / 1000).toFixed(1)}s
                  </p>
                )}
              </div>
              <div className="space-y-4">
                {results.map((match) => {
                  const tags = match.tags
                    ? match.tags.split(",").map((t) => t.trim()).filter(Boolean)
                    : [];

                  return (
                    <PaperCard key={match.id} elevation="raised">
                      {/* Reason badge */}
                      <div className="mb-3 inline-block rounded-full bg-accent/10 px-3 py-1">
                        <span className="text-xs text-accent-dark font-medium">
                          {match.reason}
                        </span>
                      </div>

                      <Link
                        href={`/sentences/${match.id}`}
                        className="group no-underline"
                      >
                        <div className="relative">
                          <span className="absolute -top-2 -left-1 font-hand text-4xl text-accent/20 leading-none select-none">
                            &ldquo;
                          </span>
                          <p className="pl-4 text-lg leading-relaxed text-ink group-hover:text-accent transition-colors">
                            {match.content}
                          </p>
                          <span className="absolute -bottom-4 -right-1 font-hand text-4xl text-accent/20 leading-none select-none">
                            &rdquo;
                          </span>
                        </div>
                      </Link>

                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 pl-4">
                          {tags.map((tag) => (
                            <TagBadge key={tag} tag={tag} />
                          ))}
                        </div>
                      )}
                    </PaperCard>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
