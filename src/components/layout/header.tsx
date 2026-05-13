import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-paper-light/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-hand text-2xl text-accent no-underline"
        >
          Remember
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-light">
          <Link href="/sentences" className="hover:text-accent transition-colors">
            句子
          </Link>
          <Link href="/search" className="hover:text-accent transition-colors">
            搜索
          </Link>
          <Link
            href="/sentences/new"
            className="rounded-full bg-accent px-4 py-1.5 text-sm text-white no-underline hover:bg-accent-dark transition-colors"
          >
            记录
          </Link>
        </nav>
      </div>
    </header>
  );
}
