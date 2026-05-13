"use client";

import Link from "next/link";
import { PenLine, Trash2, FileText } from "lucide-react";
import { PaperCard } from "@/components/ui/paper-card";
import { TagBadge } from "@/components/ui/tag-badge";
import { formatRelativeDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import type { Article } from "@/types";

interface ArticleCardProps {
  article: Article;
  onDelete?: (id: number) => void;
}

export function ArticleCard({ article, onDelete }: ArticleCardProps) {
  const tags = article.tags
    ? article.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <PaperCard elevation="raised" className="group">
      <div className="flex items-start gap-3">
        <FileText className="mt-1 h-5 w-5 shrink-0 text-accent/60" />
        <div className="min-w-0 flex-1">
          <Link
            href={`/articles/${article.id}`}
            className="block no-underline"
          >
            <h3 className="text-lg font-semibold text-ink hover:text-accent transition-colors truncate">
              {article.title}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-ink-light leading-relaxed">
            {article.content}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Link key={tag} href={`/articles?tag=${encodeURIComponent(tag)}`}>
            <TagBadge tag={tag} />
          </Link>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
        <span>
          {article.source && (
            <span className="mr-3">
              来自 <span className="text-accent">{article.source}</span>
            </span>
          )}
          <span>{formatRelativeDate(article.createdAt)}</span>
        </span>

        <div className={cn("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity")}>
          <Link
            href={`/articles/${article.id}/edit`}
            className="rounded p-1.5 text-ink-muted hover:text-accent hover:bg-accent/5 transition-colors"
          >
            <PenLine className="h-3.5 w-3.5" />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(article.id)}
              className="rounded p-1.5 text-ink-muted hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </PaperCard>
  );
}
