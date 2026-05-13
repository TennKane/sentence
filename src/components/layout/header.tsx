"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils/cn";
import { LogOut } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-paper-light/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-hand text-2xl text-accent no-underline"
        >
          Remember
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-6 text-sm text-ink-light">
            <Link
              href="/sentences"
              className={cn(
                "transition-colors",
                isActive("/sentences")
                  ? "text-accent font-medium"
                  : "hover:text-accent",
              )}
            >
              句子
            </Link>
            <Link
              href="/articles"
              className={cn(
                "transition-colors",
                isActive("/articles")
                  ? "text-accent font-medium"
                  : "hover:text-accent",
              )}
            >
              文章
            </Link>
            <Link
              href="/search"
              className={cn(
                "transition-colors",
                isActive("/search")
                  ? "text-accent font-medium"
                  : "hover:text-accent",
              )}
            >
              搜索
            </Link>
            <Link
              href="/record"
              className={cn(
                "rounded-full px-4 py-1.5 text-sm text-white no-underline transition-colors",
                isActive("/record")
                  ? "bg-accent-dark"
                  : "bg-accent hover:bg-accent-dark",
              )}
            >
              记录
            </Link>
          </nav>

          {session?.user && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
              title="退出登录"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
