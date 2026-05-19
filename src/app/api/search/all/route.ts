import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sentences, articles } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";

const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN;
const BASE_URL = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const body = await request.json();
  const { query } = body as { query?: string };

  if (!query || typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "请输入搜索描述" }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "搜索未配置（缺少 API key）" },
      { status: 500 },
    );
  }

  // Fetch both sentences and articles
  const [sentenceRows, articleRows] = await Promise.all([
    db.select().from(sentences).orderBy(desc(sentences.createdAt)).limit(100000),
    db.select().from(articles).orderBy(desc(articles.createdAt)).limit(100000),
  ]);

  const totalProcessed = sentenceRows.length + articleRows.length;

  if (totalProcessed === 0) {
    return NextResponse.json({
      matches: [],
      totalProcessed: 0,
      processingTimeMs: Date.now() - startTime,
    });
  }

  // Build the combined prompt
  const sentenceList = sentenceRows
    .map(
      (s, i) =>
        `[S${i + 1}] "${s.content}"${s.source ? ` (来源: ${s.source})` : ""}${s.tags ? ` [标签: ${s.tags}]` : ""}`,
    )
    .join("\n");

  const articleList = articleRows
    .map(
      (a, i) =>
        `[A${i + 1}] 标题: "${a.title}"\n    内容: ${a.content.slice(0, 300)}${a.content.length > 300 ? "..." : ""}${a.source ? `\n    来源: ${a.source}` : ""}${a.tags ? `\n    标签: ${a.tags}` : ""}`,
    )
    .join("\n\n");

  const combinedList = [
    sentenceList ? `## 句子\n${sentenceList}` : "",
    articleList ? `## 文章\n${articleList}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const systemPrompt =
    "你是一个智能语义检索助手，擅长发现句子、文章与用户查询之间的语义关联。" +
    "从用户提供的数据中，找出与查询语义相关的条目，包括含义相近、主题相关、部分关键词匹配的情况。" +
    "宽松匹配，宁可多抓不要漏过。" +
    "返回结果必须是合法的 JSON 数组格式，不要包含其他内容。" +
    "每个匹配项包含两个字段：id（完整编号如 \"S3\" 或 \"A12\"）和 reason（一句话说明匹配理由）。" +
    "最多返回 10 个最相关的结果（句子和文章混排），如果没有匹配则返回空数组 []。";

  const userPrompt = `## 用户查询\n${query}\n\n## 数据\n${combinedList}\n\n找出与查询最相关的条目（句子和文章混合），返回 JSON 数组。`;

  try {
    const response = await fetch(
      `${BASE_URL}/v1/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8192,
          thinking: { type: "enabled", budget_tokens: 4096 },
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("API error:", response.status, errText);
      return NextResponse.json(
        { error: "搜索服务调用失败" },
        { status: 502 },
      );
    }

    const data = await response.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
    const content = textBlock?.text ?? "[]";

    let matches: { id: string; reason: string }[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) matches = JSON.parse(jsonMatch[0]);
    } catch {
      // ignore parse errors
    }

    const result = matches
      .map((m) => {
        const typeMatch = m.id.match(/^([SA])(\d+)$/);
        if (!typeMatch) return null;
        const [, prefix, numStr] = typeMatch;
        const num = parseInt(numStr, 10);
        if (prefix === "S" && num >= 1 && num <= sentenceRows.length) {
          const s = sentenceRows[num - 1];
          return {
            id: s.id,
            type: "sentence" as const,
            content: s.content,
            source: s.source,
            tags: s.tags,
            reason: m.reason,
          };
        }
        if (prefix === "A" && num >= 1 && num <= articleRows.length) {
          const a = articleRows[num - 1];
          return {
            id: a.id,
            type: "article" as const,
            title: a.title,
            content: a.content.slice(0, 500),
            source: a.source,
            tags: a.tags,
            reason: m.reason,
          };
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json({
      matches: result,
      totalProcessed,
      processingTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "搜索处理失败" },
      { status: 500 },
    );
  }
}
