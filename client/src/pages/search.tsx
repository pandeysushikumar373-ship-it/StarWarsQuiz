import { useState, useMemo, useCallback, useEffect } from "react";
import Fuse from "fuse.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { Search, Sun, Moon } from "lucide-react";
import type { SearchItem } from "@shared/schema";

interface SearchResult {
  item: SearchItem;
  matches?: Array<{ key: string; indices: [number, number][] }>;
  score?: number;
}

function highlightText(text: string, indices?: [number, number][]): React.ReactNode {
  if (!indices || indices.length === 0) return text;

  const ranges: Array<{ start: number; end: number }> = indices.map(([start, end]) => ({ start, end: end + 1 }));
  ranges.sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  ranges.forEach(({ start, end }) => {
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    parts.push(
      <span key={`${start}-${end}`} className="search-highlight">
        {text.slice(start, end)}
      </span>
    );
    lastIndex = end;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function SearchPage() {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<"relevance" | "newest" | "oldest">("relevance");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch data from API
  const { data: items = [] } = useQuery({
    queryKey: ["/api/items"],
    queryFn: async () => {
      const res = await fetch("/api/items");
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json() as Promise<SearchItem[]>;
    },
  });

  const fuse = useMemo(() => {
    return new Fuse(items, {
      includeMatches: true,
      threshold: 0.36,
      keys: [
        { name: "title", weight: 0.6 },
        { name: "tags", weight: 0.25 },
        { name: "description", weight: 0.15 },
      ],
      minMatchCharLength: 2,
    });
  }, [items]);

  const results = useMemo(() => {
    let filtered = items;

    if (query.trim()) {
      const fuseResults = fuse.search(query);
      filtered = fuseResults.map((result) => ({
        item: result.item,
        matches: result.matches,
        score: result.score,
      })) as SearchResult[];
    } else {
      filtered = items.map((item) => ({ item }));
    }

    if (activeTag) {
      filtered = filtered.filter((result) => result.item.tags.includes(activeTag));
    }

    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.item.date).getTime() - new Date(a.item.date).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.item.date).getTime() - new Date(b.item.date).getTime());
    }

    return filtered;
  }, [query, activeTag, sortBy, fuse, items]);

  const paginatedResults = useMemo(() => {
    return results.slice(0, perPage);
  }, [results, perPage]);

  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    items.forEach((item) => {
      item.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries());
  }, [items]);

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const tokens = new Set<string>();
    items.forEach((item) => {
      item.title.split(/\s+/).forEach((word) => {
        if (word.toLowerCase().includes(value.toLowerCase())) {
          tokens.add(word);
        }
      });
      item.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(value.toLowerCase())) {
          tokens.add(tag);
        }
      });
    });

    setSuggestions(Array.from(tokens).slice(0, 8));
    setShowSuggestions(tokens.size > 0);
  };

  const getMatchIndices = (item: SearchItem, key: string, match?: any): [number, number][] => {
    if (!match) return [];
    const keyMatch = match.find((m: any) => m.key === key);
    return keyMatch?.indices || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#071124] dark:to-[#0a0f1a]">
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="gradient-accent flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
                SI
              </div>
              <div>
                <h1 className="text-2xl font-bold" data-testid="heading-title">
                  SearchInk
                </h1>
                <p className="text-sm text-muted-foreground">
                  Fast, pretty & fuzzy — search anything
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium" data-testid="text-result-count">
                  {results.length}
                </p>
                <p className="text-xs text-muted-foreground">results</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleTheme}
                className="hover-elevate active-elevate-2"
                data-testid="button-theme-toggle"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="relative">
              <Input
                placeholder="Search titles, descriptions or tags..."
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="pl-4 pr-12 py-3 text-base rounded-xl bg-white border-gray-200 text-foreground placeholder:text-gray-500 dark:bg-card dark:border-white/5 dark:placeholder:text-muted-foreground"
                data-testid="input-search"
              />
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60" />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-40 rounded-lg glass-effect bg-white/95 border border-gray-200 overflow-hidden dark:bg-card/95 dark:border-white/5">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors dark:hover:bg-white/5"
                    data-testid={`suggestion-${suggestion}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results and Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Results */}
            <div className="lg:col-span-2 space-y-3">
              {paginatedResults.length > 0 ? (
                paginatedResults.map((result) => {
                  const titleMatch = getMatchIndices(result.item, "title", result.matches);
                  const descMatch = getMatchIndices(result.item, "description", result.matches);

                  return (
                    <div
                      key={result.item.id}
                      className="group rounded-lg glass-effect bg-white/50 border border-gray-200 p-4 cursor-pointer hit-card dark:bg-gradient-to-br dark:from-white/2 dark:to-white/1 dark:border-white/5 dark:hover:shadow-lg dark:hover:shadow-blue-500/10"
                      data-testid={`card-result-${result.item.id}`}
                    >
                      <h3 className="font-bold text-base mb-1 text-foreground">
                        {titleMatch.length > 0
                          ? highlightText(result.item.title, titleMatch)
                          : result.item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {descMatch.length > 0
                          ? highlightText(result.item.description, descMatch)
                          : result.item.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex flex-wrap gap-1">
                          {result.item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 rounded-full bg-gray-200 font-medium text-foreground dark:bg-white/5"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span>{new Date(result.item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-lg glass-effect bg-white/50 border border-gray-200 p-8 text-center dark:bg-card dark:border-white/5">
                  <p className="text-muted-foreground">No results found. Try a different search.</p>
                </div>
              )}
            </div>

            {/* Sidebar Filters */}
            <div className="rounded-lg glass-effect bg-white/50 border border-gray-200 p-4 dark:bg-white/2 dark:border-white/5 dark:h-fit">
              <div className="mb-6">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Filters
                </label>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-muted-foreground mb-3 uppercase">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(([tag, count]) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                        activeTag === tag
                          ? "gradient-btn text-white"
                          : "bg-gray-200 text-foreground hover:bg-gray-300 dark:bg-white/5 dark:text-foreground dark:hover:bg-white/10"
                      }`}
                      data-testid={`button-tag-${tag}`}
                    >
                      {tag}
                      <span className="ml-1 opacity-70">·{count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Per Page */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">
                  Results per page
                </label>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-gray-300 text-foreground dark:bg-white/5 dark:border-white/10 dark:text-foreground"
                  data-testid="select-per-page"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">
                  Sort
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-gray-300 text-foreground dark:bg-white/5 dark:border-white/10 dark:text-foreground"
                  data-testid="select-sort"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
