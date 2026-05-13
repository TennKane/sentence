"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArticleCard } from "@/components/article/article-card";
import { PaperButton } from "@/components/ui/paper-button";
import { Loader2, Search, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Article } from "@/types";

interface ListResponse {
  data: Article[];
  total: number;
  page: number;
  pageSize: number;
}

function ArticleListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get("tag") ?? "";

  const [items, setItems] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (tagFilter) params.set("tag", tagFilter);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/articles?${params}`);
      if (!res.ok) throw new Error("加载失败");
      const json: ListResponse = await res.json();
      setItems(json.data);
      setTotal(json.total);
    } catch {
      toast.error("加载文章列表失败");
    } finally {
      setLoading(false);
    }
  }, [page, tagFilter, q]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("确定删除？")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      toast.success("已删除");
      load();
    } catch {
      toast.error("删除失败");
    }
  }, [load]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-hand text-3xl text-accent">
          {tagFilter ? `#${tagFilter}` : "文章"}
        </h1>
        <Link href="/record?type=article">
          <PaperButton>
            <Plus className="h-4 w-4" />
            写文章
          </PaperButton>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="搜索文章标题…"
            className="w-full rounded-lg border border-border bg-paper py-2.5 pl-10 pr-4 text-ink placeholder:text-ink-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-hidden transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-ink-muted">还没有文章</p>
          <Link href="/record?type=article" className="mt-2 inline-block text-sm text-accent hover:underline">
            写第一篇 →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <PaperButton variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            上一页
          </PaperButton>
          <span className="px-3 text-sm text-ink-muted">{page} / {totalPages}</span>
          <PaperButton variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            下一页
          </PaperButton>
        </div>
      )}
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-ink-muted" /></div>}>
      <ArticleListContent />
    </Suspense>
  );
}
