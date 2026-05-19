"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PaperCard } from "@/components/ui/paper-card";
import { PaperButton } from "@/components/ui/paper-button";
import { TagBadge } from "@/components/ui/tag-badge";
import { ArrowLeft, Loader2, Trash2, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { LinkifyText, isUrl } from "@/components/ui/linkify-text";
import { ExternalLink } from "lucide-react";
import { formatFullDate } from "@/lib/utils/date";
import type { Article } from "@/types";

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setArticle)
      .catch(() => toast.error("加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-ink-muted" /></div>;
  if (!article) return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-ink-muted">未找到该文章</p>
      <Link href="/articles" className="mt-2 inline-block text-sm text-accent hover:underline">返回列表</Link>
    </div>
  );

  const tags = article.tags?.split(",").map(t => t.trim()).filter(Boolean) ?? [];

  const handleDelete = async () => {
    if (!confirm("确定删除？")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("已删除");
      router.push("/articles");
    } catch {
      toast.error("删除失败");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/articles" className="mb-6 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-accent transition-colors">
        <ArrowLeft className="h-4 w-4" />返回文章列表
      </Link>

      <PaperCard elevation="lifted">
        <div className="flex items-start gap-3 mb-4">
          <FileText className="mt-1 h-6 w-6 shrink-0 text-accent/60" />
          <h1 className="text-2xl font-bold text-ink">{article.title}</h1>
        </div>

        <div className="prose prose-stone max-w-none">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-ink-light">
            <LinkifyText text={article.content} />
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {tags.map(tag => (
            <Link key={tag} href={`/articles?tag=${encodeURIComponent(tag)}`}>
              <TagBadge tag={tag} />
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-muted">
          {article.source && (
            <span className="inline-flex items-center gap-1">
              {isUrl(article.source) ? (
                <a
                  href={article.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent underline underline-offset-2 decoration-accent/30 hover:decoration-accent transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  来源
                </a>
              ) : (
                <>来源：<span className="text-accent font-medium">{article.source}</span></>
              )}
            </span>
          )}
          <span>创建于 {formatFullDate(article.createdAt)}</span>
          {article.updatedAt !== article.createdAt && <span>更新于 {formatFullDate(article.updatedAt)}</span>}
        </div>
      </PaperCard>

      <div className="mt-6 flex gap-3">
        <Link href={`/articles/${id}/edit`}>
          <PaperButton variant="secondary">编辑</PaperButton>
        </Link>
        <PaperButton variant="secondary" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />删除
        </PaperButton>
      </div>
    </div>
  );
}
