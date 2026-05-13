"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PaperCard } from "@/components/ui/paper-card";
import { PaperButton } from "@/components/ui/paper-button";
import { TagBadge } from "@/components/ui/tag-badge";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatFullDate } from "@/lib/utils/date";
import type { Sentence } from "@/types";

export default function SentenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sentence, setSentence] = useState<Sentence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sentences/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("未找到");
        return r.json();
      })
      .then(setSentence)
      .catch(() => toast.error("加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (!sentence) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-ink-muted">未找到该句子</p>
        <Link href="/sentences" className="mt-2 inline-block text-sm text-accent hover:underline">
          返回列表
        </Link>
      </div>
    );
  }

  const tags = sentence.tags
    ? sentence.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const handleDelete = async () => {
    if (!confirm("确定删除？")) return;
    try {
      const res = await fetch(`/api/sentences/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      toast.success("已删除");
      router.push("/sentences");
    } catch {
      toast.error("删除失败");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/sentences"
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回列表
      </Link>

      <PaperCard elevation="lifted" className="mb-6">
        <div className="relative">
          <span className="absolute -top-3 -left-2 font-hand text-5xl text-accent/20 leading-none select-none">
            &ldquo;
          </span>
          <p className="px-6 text-xl leading-relaxed text-ink">
            {sentence.content}
          </p>
          <span className="absolute -bottom-3 -right-2 font-hand text-5xl text-accent/20 leading-none select-none">
            &rdquo;
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 px-6">
          {tags.map((tag) => (
            <Link key={tag} href={`/sentences?tag=${encodeURIComponent(tag)}`}>
              <TagBadge tag={tag} />
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 px-6 text-sm text-ink-muted">
          {sentence.source && (
            <span>
              来源：<span className="text-accent font-medium">{sentence.source}</span>
            </span>
          )}
          <span>记录于 {formatFullDate(sentence.createdAt)}</span>
          {sentence.updatedAt !== sentence.createdAt && (
            <span>更新于 {formatFullDate(sentence.updatedAt)}</span>
          )}
        </div>
      </PaperCard>

      <div className="flex gap-3">
        <Link href={`/sentences/${id}/edit`}>
          <PaperButton variant="secondary">编辑</PaperButton>
        </Link>
        <PaperButton variant="secondary" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          删除
        </PaperButton>
      </div>
    </div>
  );
}
