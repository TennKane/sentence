export interface Article {
  id: number;
  title: string;
  content: string;
  source: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Sentence {
  id: number;
  content: string;
  source: string | null;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SearchMatch {
  id: number;
  content: string;
  source: string | null;
  tags: string | null;
  reason: string;
}

export type SearchResult = SearchMatch;

export interface SearchResponse {
  matches: SearchResult[];
  totalProcessed: number;
  processingTimeMs: number;
}

export interface MatchedSentence {
  text: string;
  reason: string;
}

export interface ArticleSearchMatch {
  id: number;
  title: string;
  content: string;
  source: string | null;
  tags: string | null;
  reason: string;
  matchedSentences: MatchedSentence[];
}

export interface ArticleSearchResponse {
  matches: ArticleSearchMatch[];
  totalProcessed: number;
  processingTimeMs: number;
}

export interface CombinedSearchResult {
  id: number;
  type: "sentence" | "article";
  title?: string;
  content: string;
  source: string | null;
  tags: string | null;
  reason: string;
}

export interface CombinedSearchResponse {
  matches: CombinedSearchResult[];
  totalProcessed: number;
  processingTimeMs: number;
}

export interface ApiError {
  error: string;
}
