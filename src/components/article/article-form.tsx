"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { PaperInput } from "@/components/ui/paper-input";
import { PaperTextarea } from "@/components/ui/paper-textarea";
import { PaperButton } from "@/components/ui/paper-button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Article } from "@/types";

const articleSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(500),
  content: z.string().min(1, "内容不能为空").max(50000),
  source: z.string().max(200).optional(),
  tags: z.string().max(500).optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  article?: Article;
  mode: "create" | "edit";
}

export function ArticleForm({ article, mode }: ArticleFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title ?? "",
      content: article?.content ?? "",
      source: article?.source ?? "",
      tags: article?.tags ?? "",
    },
  });

  const onSubmit = useCallback(
    async (data: ArticleFormData) => {
      setSubmitting(true);
      try {
        const url = mode === "create"
          ? "/api/articles"
          : `/api/articles/${article!.id}`;
        const method = mode === "create" ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "操作失败");
        }

        toast.success(mode === "create" ? "已记录" : "已更新");
        router.push("/articles");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "操作失败");
      } finally {
        setSubmitting(false);
      }
    },
    [mode, article, router],
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/articles"
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回文章列表
      </Link>

      <h1 className="mb-8 font-hand text-3xl text-accent">
        {mode === "create" ? "写一篇文章" : "编辑文章"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <PaperInput
          label="标题"
          id="title"
          placeholder="文章标题"
          {...register("title")}
          error={errors.title?.message}
        />
        <PaperTextarea
          label="内容"
          id="content"
          placeholder="写点什么…"
          rows={12}
          {...register("content")}
          error={errors.content?.message}
        />
        <PaperInput
          label="来源（可选）"
          id="source"
          placeholder="链接或出处"
          {...register("source")}
          error={errors.source?.message}
        />
        <PaperInput
          label="标签（可选，逗号分隔）"
          id="tags"
          placeholder="如：技术, 随笔, 笔记"
          {...register("tags")}
          error={errors.tags?.message}
        />
        <div className="flex gap-3 pt-2">
          <PaperButton type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "保存" : "更新"}
          </PaperButton>
          <PaperButton type="button" variant="secondary" onClick={() => router.back()}>
            取消
          </PaperButton>
        </div>
      </form>
    </div>
  );
}
