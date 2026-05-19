import { ExternalLink, Loader2 } from "lucide-react";
import { isUrl } from "@/components/ui/linkify-text";

interface LinkPreviewProps {
  url: string;
  title?: string | null;
  loading?: boolean;
  error?: string | null;
}

export function LinkPreview({ url, title, loading, error }: LinkPreviewProps) {
  if (!url || !isUrl(url)) return null;

  return (
    <div className="mt-2 rounded-lg border border-accent/20 bg-accent/5 p-3">
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          获取页面信息…
        </div>
      ) : error ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          打开链接
        </a>
      ) : title ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block no-underline"
        >
          <p className="text-sm font-medium text-ink group-hover:text-accent transition-colors line-clamp-1">
            {title}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted/70 truncate">
            <ExternalLink className="inline h-3 w-3 mr-0.5" />
            {url}
          </p>
        </a>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          打开链接
        </a>
      )}
    </div>
  );
}
