import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, name, password } = body;

  if (!email || !name || !password) {
    return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.insert(users).values({ email, name, password: hashed });

  return NextResponse.json({ message: "注册成功" }, { status: 201 });
}
