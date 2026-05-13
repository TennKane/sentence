"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SentenceForm } from "@/components/sentence/sentence-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Sentence } from "@/types";

export default function EditSentencePage() {
  const { id } = useParams<{ id: string }>();
  const [sentence, setSentence] = useState<Sentence | undefined>(undefined);
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
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-ink-muted">
        未找到该句子
      </div>
    );
  }

  return <SentenceForm sentence={sentence} mode="edit" />;
}
