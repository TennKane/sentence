import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) return NextResponse.json({ error: "无效的 ID" }, { status: 400 });

  const [row] = await db.select().from(articles).where(eq(articles.id, numId)).limit(1);
  if (!row) return NextResponse.json({ error: "未找到" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) return NextResponse.json({ error: "无效的 ID" }, { status: 400 });

  const body = await request.json();
  const { title, content, source, tags } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }

  const [updated] = await db
    .update(articles)
    .set({
      title: title.trim(),
      content: content.trim(),
      source: source?.trim() || null,
      tags: tags?.trim() || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(articles.id, numId))
    .returning();

  if (!updated) return NextResponse.json({ error: "未找到" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) return NextResponse.json({ error: "无效的 ID" }, { status: 400 });

  const [deleted] = await db.delete(articles).where(eq(articles.id, numId)).returning();
  if (!deleted) return NextResponse.json({ error: "未找到" }, { status: 404 });
  return NextResponse.json({ message: "已删除" });
}
