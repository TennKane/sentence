"use client";

import { useState, useCallback } from "react";
import { PaperButton } from "@/components/ui/paper-button";
import { PaperCard } from "@/components/ui/paper-card";
import { Loader2, Search, BookOpen, MessageSquare } from "lucide-react";
import { TagBadge } from "@/components/ui/tag-badge";
import Link from "next/link";
import { toast } from "sonner";
import type { SearchResult, SearchResponse, ArticleSearchMatch, ArticleSearchResponse } from "@/types";

type Tab = "sentence" | "article";

function SentenceSearch() {
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
    <div>
      <div className="mb-6">
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

      {searching && (
        <div className="flex flex-col items-center justify-center py-16 text-ink-muted">
          <Loader2 className="mb-3 h-6 w-6 animate-spin" />
          <p className="text-sm">正在搜索…</p>
        </div>
      )}

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

function ArticleSearch() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ArticleSearchMatch[] | null>(null);
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
      const res = await fetch("/api/search/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "搜索失败");
      }

      const data: ArticleSearchResponse = await res.json();
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
    <div>
      <div className="mb-6">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder='例如：关于昆明的文章，或描述雨季的文章'
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

      {searching && (
        <div className="flex flex-col items-center justify-center py-16 text-ink-muted">
          <Loader2 className="mb-3 h-6 w-6 animate-spin" />
          <p className="text-sm">正在搜索…</p>
        </div>
      )}

      {results !== null && !searching && (
        <>
          {results.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-ink-muted">没有找到匹配的文章</p>
              {metadata && (
                <p className="mt-2 text-xs text-ink-muted/60">
                  已检索 {metadata.totalProcessed} 篇，用时 {(metadata.processingTimeMs / 1000).toFixed(1)}s
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
                    已检索 {metadata.totalProcessed} 篇，用时{" "}
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
                      <div className="mb-3 inline-block rounded-full bg-accent/10 px-3 py-1">
                        <span className="text-xs text-accent-dark font-medium">
                          {match.reason}
                        </span>
                      </div>

                      <Link
                        href={`/articles/${match.id}`}
                        className="group no-underline"
                      >
                        <h3 className="font-hand text-xl text-accent group-hover:underline">
                          {match.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                          {match.content}
                        </p>
                      </Link>

                      {match.matchedSentences && match.matchedSentences.length > 0 && (
                        <div className="mt-4 border-t border-border pt-4">
                          <p className="mb-3 text-xs font-medium text-accent/70">匹配句子</p>
                          <div className="space-y-3">
                            {match.matchedSentences.map((s, i) => (
                              <div key={i}>
                                <div className="relative">
                                  <span className="absolute -top-1 -left-1 font-hand text-3xl text-accent/15 leading-none select-none">
                                    &ldquo;
                                  </span>
                                  <p className="pl-4 pr-2 text-sm leading-relaxed text-ink">
                                    {s.text}
                                  </p>
                                  <span className="absolute -bottom-2 -right-1 font-hand text-3xl text-accent/15 leading-none select-none">
                                    &rdquo;
                                  </span>
                                </div>
                                <p className="mt-1 pl-4 text-xs text-ink-muted/70 italic">
                                  {s.reason}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {match.source && (
                          <span className="text-xs text-ink-muted/60">{match.source}</span>
                        )}
                        {tags.map((tag) => (
                          <TagBadge key={tag} tag={tag} />
                        ))}
                      </div>
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

export function SearchPanel() {
  const [tab, setTab] = useState<Tab>("sentence");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 font-hand text-3xl text-accent">搜索</h1>
      <p className="mb-8 text-sm text-ink-muted">
        用自然语言描述你想找的内容，从记录中找出最匹配的
      </p>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 rounded-lg bg-border/50 p-1">
        <button
          onClick={() => setTab("sentence")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "sentence"
              ? "bg-paper text-accent shadow-xs"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          搜索句子
        </button>
        <button
          onClick={() => setTab("article")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "article"
              ? "bg-paper text-accent shadow-xs"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          搜索文章
        </button>
      </div>

      {tab === "sentence" ? <SentenceSearch /> : <ArticleSearch />}
    </div>
  );
}
