"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { PaperInput } from "@/components/ui/paper-input";
import { PaperButton } from "@/components/ui/paper-button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().min(1, "请输入密码"),
});

type LoginData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("邮箱或密码错误");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-sm flex-col justify-center px-4">
      <h1 className="mb-2 text-center font-hand text-3xl text-accent">登录</h1>
      <p className="mb-8 text-center text-sm text-ink-muted">
        欢迎回到 Remember
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="输入密码"
          {...register("password")}
          error={errors.password?.message}
        />
        <PaperButton type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          登录
        </PaperButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        私人使用，暂不开放注册
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
