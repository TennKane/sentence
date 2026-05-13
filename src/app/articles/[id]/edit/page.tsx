"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArticleForm } from "@/components/article/article-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Article } from "@/types";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setArticle)
      .catch(() => toast.error("加载失败"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-ink-muted" /></div>;
  if (!article) return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-ink-muted">未找到该文章</div>;

  return <ArticleForm article={article} mode="edit" />;
}
