import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sentences } from "@/lib/db/schema";
import { desc, like, eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const tagsParam = searchParams.get("tags");
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");

  const conditions = [];
  if (tagsParam) {
    const tagList = tagsParam.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5);
    for (const t of tagList) {
      conditions.push(like(sentences.tags, `%${t}%`));
    }
  } else if (tag) {
    conditions.push(like(sentences.tags, `%${tag}%`));
  }
  if (q) {
    conditions.push(like(sentences.content, `%${q}%`));
  }

  const where = conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(sentences)
      .where(where)
      .orderBy(desc(sentences.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)` })
      .from(sentences)
      .where(where),
  ]);

  return NextResponse.json({
    data: rows,
    total: Number(countResult[0]?.count ?? 0),
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, source, tags } = body;

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }

  const [inserted] = await db
    .insert(sentences)
    .values({
      content: content.trim(),
      source: source?.trim() || null,
      tags: tags?.trim() || null,
    })
    .returning();

  return NextResponse.json(inserted, { status: 201 });
}
