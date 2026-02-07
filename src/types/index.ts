export interface CategoryInfo {
  displayName: string;
  description: string;
}

export interface LeaderboardEntry {
  modelId: string;
  wins: number;
  losses: number;
  battles: number;
  winRate: number;
  elo: number;
  btStdErr: number | null;
  avgGenerationTimeMs: number;
  insufficientVotes: boolean;
}

export interface LeaderboardMetadata {
  lastUpdateTime: string;
  totalVotes: number;
}

export interface LeaderboardResponse {
  success: boolean;
  arenaType: string;
  category: string;
  data: LeaderboardEntry[];
  metadata: LeaderboardMetadata;
  timestamp: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export interface OpenRouterChatResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface ModelMapping {
  arenaId: string;
  openRouterId: string;
  source: "static" | "dynamic" | "fuzzy";
}
