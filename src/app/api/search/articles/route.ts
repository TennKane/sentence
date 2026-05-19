import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
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

  const rows = await db
    .select()
    .from(articles)
    .orderBy(desc(articles.createdAt))
    .limit(100000);

  if (rows.length === 0) {
    return NextResponse.json({
      matches: [],
      totalProcessed: 0,
      processingTimeMs: Date.now() - startTime,
    });
  }

  const articleList = rows
    .map(
      (a, i) =>
        `[${i + 1}] 标题: "${a.title}"\n    摘要: ${a.content.slice(0, 300)}${a.content.length > 300 ? "..." : ""}${a.source ? `\n    来源: ${a.source}` : ""}${a.tags ? `\n    标签: ${a.tags}` : ""}`,
    )
    .join("\n\n");

  const systemPrompt =
    "你是一个智能语义检索助手，擅长发现文章与用户查询之间的语义关联。" +
    "从用户提供的文章列表中，找出与查询语义相关的文章，包括主题相关、观点一致、可作为佐证或参考、或者部分关键词匹配的情况。" +
    "宽松匹配，宁可多抓不要漏过。" +
    "返回结果必须是合法的 JSON 数组格式，不要包含其他内容。" +
    "每个匹配项包含三个字段：index（数字序号）、reason（一句话说明文章如何相关或可作为佐证）、sentences（数组，从文章内容中摘取最匹配用户查询的具体句子，每句含 text 原文和 reason 说明为什么这句支持了查询）。" +
    "最多返回 5 个最相关的结果，每篇文章最多提取 3 句，如果没有匹配的文章则返回空数组 []。";

  const userPrompt = `## 文章列表\n${articleList}\n\n## 用户查询\n${query}\n\n找出与查询最相关的文章，并从文章内容中摘取能佐证用户查询的具体句子，返回 JSON 数组。`;

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
          max_tokens: 2048,
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

    let matches: { index: number; reason: string; sentences?: { text: string; reason: string }[] }[] = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) matches = JSON.parse(jsonMatch[0]);
    } catch {
      // ignore parse errors
    }

    const result = matches
      .filter((m) => m.index >= 1 && m.index <= rows.length)
      .map((m) => ({
        id: rows[m.index - 1].id,
        title: rows[m.index - 1].title,
        content: rows[m.index - 1].content.slice(0, 500),
        source: rows[m.index - 1].source,
        tags: rows[m.index - 1].tags,
        reason: m.reason,
        matchedSentences: (m.sentences ?? []).slice(0, 3),
      }));

    return NextResponse.json({
      matches: result,
      totalProcessed: rows.length,
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
