"use client";

import { useState, useCallback, useRef } from "react";
import { TagBadge } from "@/components/ui/tag-badge";
import { Search } from "lucide-react";
import { PaperButton } from "@/components/ui/paper-button";

interface TagFilterProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onSearch?: () => void;
  maxTags?: number;
}

export function TagFilter({ tags, onTagsChange, onSearch, maxTags = 5 }: TagFilterProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback((raw: string) => {
    const tag = raw.trim().replace(/,$/, "").trim();
    if (!tag) return;
    if (tags.length >= maxTags) return;
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    onTagsChange([...tags, tag]);
  }, [tags, onTagsChange, maxTags]);

  const removeTag = useCallback((tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  }, [tags, onTagsChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
        setInput("");
      }
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }, [input, addTag, removeTag, tags]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    if (val.endsWith(",")) {
      addTag(val);
      setInput("");
    } else {
      setInput(val);
    }
  }, [addTag]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <div
          className="flex min-h-[42px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-border bg-paper pl-10 pr-3 py-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-colors"
          onClick={() => inputRef.current?.focus()}
        >
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} onRemove={() => removeTag(tag)} />
          ))}
          <input
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? "输入标签，回车添加…" : ""}
            disabled={tags.length >= maxTags}
            className="min-w-[60px] flex-1 border-none bg-transparent py-0.5 text-sm text-ink placeholder:text-ink-muted focus:outline-hidden"
          />
        </div>
      </div>
      {onSearch && (
        <PaperButton size="sm" onClick={onSearch} disabled={tags.length === 0}>
          筛选
        </PaperButton>
      )}
    </div>
  );
}
