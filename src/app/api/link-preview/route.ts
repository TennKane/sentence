import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL 不能为空" }, { status: 400 });
    }

    if (!/^https?:\/\/.+/.test(url)) {
      return NextResponse.json({ error: "无效的 URL" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RememberBot/1.0)",
      },
    });
    clearTimeout(timeout);

    const html = await res.text();

    const titleMatch =
      html.match(/<title[^>]*>([^<]+)<\/title>/i) ??
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
    const title = titleMatch?.[1]?.trim() ?? null;

    return NextResponse.json({ title, url });
  } catch {
    return NextResponse.json({ error: "无法获取页面信息" }, { status: 422 });
  }
}
