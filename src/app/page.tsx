import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      {/* Tree branch decoration */}
      <svg
        viewBox="0 0 200 120"
        className="mb-8 w-48 text-accent/30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M10 110 Q50 80 80 60 Q110 40 140 35 Q170 30 190 25" />
        <path d="M60 70 Q50 45 35 30" />
        <path d="M80 58 Q85 35 90 15" />
        <path d="M100 48 Q120 28 140 20" />
        <path d="M130 38 Q150 18 160 10" />
        {/* Leaves */}
        <ellipse cx="35" cy="28" rx="8" ry="5" transform="rotate(-30 35 28)" />
        <ellipse cx="90" cy="13" rx="8" ry="5" transform="rotate(-10 90 13)" />
        <ellipse cx="140" cy="18" rx="9" ry="5" transform="rotate(-20 140 18)" />
        <ellipse cx="160" cy="8" rx="7" ry="4" transform="rotate(-15 160 8)" />
        <ellipse cx="50" cy="38" rx="7" ry="4" transform="rotate(-40 50 38)" />
      </svg>

      <h1 className="font-hand text-5xl text-accent mb-2">Remember</h1>
      <p className="text-ink-muted text-base mb-10">记录打动你的每一句话</p>

      {/* Quick entry cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
        <Link
          href="/sentences"
          className="flex-1 rounded-xl border border-border bg-paper px-6 py-5 text-center shadow-md shadow-stone-200/50 hover:shadow-lg hover:border-accent/30 transition-all no-underline"
        >
          <span className="block font-hand text-lg text-accent mb-1">句子</span>
          <span className="text-sm text-ink-muted">浏览所有记录</span>
        </Link>
        <Link
          href="/articles"
          className="flex-1 rounded-xl border border-border bg-paper px-6 py-5 text-center shadow-md shadow-stone-200/50 hover:shadow-lg hover:border-accent/30 transition-all no-underline"
        >
          <span className="block font-hand text-lg text-accent mb-1">文章</span>
          <span className="text-sm text-ink-muted">阅读和浏览</span>
        </Link>
        <Link
          href="/record"
          className="flex-1 rounded-xl border border-border bg-paper px-6 py-5 text-center shadow-md shadow-stone-200/50 hover:shadow-lg hover:border-accent/30 transition-all no-underline"
        >
          <span className="block font-hand text-lg text-accent mb-1">记录</span>
          <span className="text-sm text-ink-muted">句子或文章</span>
        </Link>
        <Link
          href="/search"
          className="flex-1 rounded-xl border border-border bg-paper px-6 py-5 text-center shadow-md shadow-stone-200/50 hover:shadow-lg hover:border-accent/30 transition-all no-underline"
        >
          <span className="block font-hand text-lg text-accent mb-1">搜索</span>
          <span className="text-sm text-ink-muted">帮你找句子</span>
        </Link>
      </div>
    </div>
  );
}
