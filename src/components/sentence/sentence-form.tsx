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
import type { Sentence } from "@/types";

const sentenceSchema = z.object({
  content: z
    .string()
    .min(1, "内容不能为空")
    .max(5000, "内容不能超过 5000 字"),
  source: z.string().max(200, "来源不能超过 200 字").optional(),
  tags: z.string().max(500).optional(),
});

type SentenceFormData = z.infer<typeof sentenceSchema>;

interface SentenceFormProps {
  sentence?: Sentence;
  mode: "create" | "edit";
}

export function SentenceForm({ sentence, mode }: SentenceFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SentenceFormData>({
    resolver: zodResolver(sentenceSchema),
    defaultValues: {
      content: sentence?.content ?? "",
      source: sentence?.source ?? "",
      tags: sentence?.tags ?? "",
    },
  });

  const onSubmit = useCallback(
    async (data: SentenceFormData) => {
      setSubmitting(true);
      try {
        const url =
          mode === "create"
            ? "/api/sentences"
            : `/api/sentences/${sentence!.id}`;
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
        router.push("/sentences");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "操作失败");
      } finally {
        setSubmitting(false);
      }
    },
    [mode, sentence, router],
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/sentences"
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回列表
      </Link>

      <h1 className="mb-8 font-hand text-3xl text-accent">
        {mode === "create" ? "记录一句" : "编辑句子"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <PaperTextarea
          label="内容"
          id="content"
          placeholder="输入你想记录的句子…"
          rows={5}
          {...register("content")}
          error={errors.content?.message}
        />

        <PaperInput
          label="来源（可选）"
          id="source"
          placeholder="摘自哪本书、文章或谁说的"
          {...register("source")}
          error={errors.source?.message}
        />

        <PaperInput
          label="标签（可选，逗号分隔）"
          id="tags"
          placeholder="如：文学, 励志, 哲学"
          {...register("tags")}
          error={errors.tags?.message}
        />

        <div className="flex gap-3 pt-2">
          <PaperButton type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "保存" : "更新"}
          </PaperButton>
          <PaperButton
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            取消
          </PaperButton>
        </div>
      </form>
    </div>
  );
}
