import Link from "next/link";
import { PenLine, Trash2, ExternalLink } from "lucide-react";
import { PaperCard } from "@/components/ui/paper-card";
import { TagBadge } from "@/components/ui/tag-badge";
import { LinkifyText, isUrl } from "@/components/ui/linkify-text";
import { formatRelativeDate } from "@/lib/utils/date";
import type { Sentence } from "@/types";
import { cn } from "@/lib/utils/cn";

interface SentenceCardProps {
  sentence: Sentence;
  onDelete?: (id: number) => void;
}

export function SentenceCard({ sentence, onDelete }: SentenceCardProps) {
  const tags = sentence.tags
    ? sentence.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <PaperCard elevation="raised" className="group">
      <Link href={`/sentences/${sentence.id}`} className="block no-underline">
        <div className="relative">
          {/* Quote mark decoration */}
          <span className="absolute -top-2 -left-1 font-hand text-4xl text-accent/20 leading-none select-none">
            &ldquo;
          </span>

          <p className="pl-4 text-lg leading-relaxed text-ink group-hover:text-accent transition-colors">
            <LinkifyText text={sentence.content} />
          </p>

          <span className="absolute -bottom-4 -right-1 font-hand text-4xl text-accent/20 leading-none select-none">
            &rdquo;
          </span>
        </div>
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2 pl-4">
        {tags.map((tag) => (
          <Link key={tag} href={`/sentences?tag=${encodeURIComponent(tag)}`}>
            <TagBadge tag={tag} />
          </Link>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between pl-4 text-xs text-ink-muted">
        <span>
          {sentence.source && (
            <span className="mr-3 inline-flex items-center gap-1">
              {isUrl(sentence.source) ? (
                <a
                  href={sentence.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-accent underline underline-offset-2 decoration-accent/30 hover:decoration-accent transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  {sentence.source}
                </a>
              ) : (
                <>
                  摘自 <span className="text-accent">{sentence.source}</span>
                </>
              )}
            </span>
          )}
          <span>{formatRelativeDate(sentence.createdAt)}</span>
        </span>

        <div
          className={cn(
            "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
          )}
        >
          <Link
            href={`/sentences/${sentence.id}/edit`}
            className="rounded p-1.5 text-ink-muted hover:text-accent hover:bg-accent/5 transition-colors"
            aria-label="编辑"
          >
            <PenLine className="h-3.5 w-3.5" />
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(sentence.id)}
              className="rounded p-1.5 text-ink-muted hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="删除"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </PaperCard>
  );
}
