"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PaperInput } from "@/components/ui/paper-input";
import { PaperButton } from "@/components/ui/paper-button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const registerSchema = z
  .object({
    name: z.string().min(1, "请输入昵称").max(50),
    email: z.string().email("请输入有效的邮箱"),
    password: z.string().min(6, "密码至少 6 位"),
    confirm: z.string().min(1, "请确认密码"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "两次密码不一致",
    path: ["confirm"],
  });

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "注册失败");
      }

      toast.success("注册成功，请登录");
      router.push("/login");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-sm flex-col justify-center px-4">
      <h1 className="mb-2 text-center font-hand text-3xl text-accent">注册</h1>
      <p className="mb-8 text-center text-sm text-ink-muted">
        创建你的 Remember 账号
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PaperInput
          label="昵称"
          id="name"
          placeholder="你的名字"
          {...register("name")}
          error={errors.name?.message}
        />
        <PaperInput
          label="邮箱"
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register("email")}
          error={errors.email?.message}
        />
        <PaperInput
          label="密码"
          id="password"
          type="password"
          placeholder="至少 6 位"
          {...register("password")}
          error={errors.password?.message}
        />
        <PaperInput
          label="确认密码"
          id="confirm"
          type="password"
          placeholder="再次输入密码"
          {...register("confirm")}
          error={errors.confirm?.message}
        />
        <PaperButton type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          注册
        </PaperButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        已有账号？{" "}
        <Link href="/login" className="text-accent hover:underline">
          登录
        </Link>
      </p>
    </div>
  );
}
