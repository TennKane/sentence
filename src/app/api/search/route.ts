import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sentences } from "@/lib/db/schema";
import { like, desc, sql } from "drizzle-orm";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  const body = await request.json();
  const { query, tag } = body as { query?: string; tag?: string };

  if (!query || typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "请输入搜索描述" }, { status: 400 });
  }

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI 搜索未配置（缺少 ANTHROPIC_API_KEY）" },
      { status: 500 },
    );
  }

  // Fetch sentences from DB
  const conditions = [];
  if (tag) {
    conditions.push(like(sentences.tags, `%${tag}%`));
  }

  const where = conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

  const rows = await db
    .select()
    .from(sentences)
    .where(where)
    .orderBy(desc(sentences.createdAt))
    .limit(200);

  if (rows.length === 0) {
    return NextResponse.json({
      matches: [],
      totalProcessed: 0,
      processingTimeMs: Date.now() - startTime,
    });
  }

  // Build the prompt for Claude
  const sentenceList = rows
    .map(
      (s, i) =>
        `[${i + 1}] "${s.content}"${s.source ? ` (来源: ${s.source})` : ""}${s.tags ? ` [标签: ${s.tags}]` : ""}`,
    )
    .join("\n");

  const systemPrompt =
    "你是一个语句检索助手。你的任务是从用户提供的句子列表中，找出与用户查询最相关的句子。" +
    "返回结果必须是合法的 JSON 数组格式，不要包含其他内容。" +
    "每个匹配项包含两个字段：index（数字序号）和 reason（匹配理由，一句话说明为什么这个句子匹配）。" +
    "如果没有匹配的句子，返回空数组 []。" +
    "最多返回 5 个最相关的结果。";

  const userPrompt = `## 句子列表\n${sentenceList}\n\n## 用户查询\n${query}\n\n找出与查询最相关的句子，返回 JSON 数组。`;

  try {
    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Claude API error:", response.status, errText);
      return NextResponse.json(
        { error: "AI 搜索服务调用失败" },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? "[]";

    // Parse Claude's JSON response
    let matches: { index: number; reason: string }[] = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        matches = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If parsing fails, return empty
    }

    const result = matches
      .filter((m) => m.index >= 1 && m.index <= rows.length)
      .map((m) => ({
        id: rows[m.index - 1].id,
        content: rows[m.index - 1].content,
        source: rows[m.index - 1].source,
        tags: rows[m.index - 1].tags,
        reason: m.reason,
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
