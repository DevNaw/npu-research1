export type MatchLevel = 'high' | 'medium' | 'low';

export interface CollaboratorRecommendation {
  id: number;
  name: string;
  position: string | null;
  department: string | null;
  photo_url: string | null;
  score: number;
  level: MatchLevel;
  components: { content: number; network: number; activity: number };
  reasons: {
    shared_topics: string[];
    mutual_collaborators: number;
    recent_works: number;
  };
}

export interface RecommenderMetrics {
  precision: number;
  recall: number;
  hit_rate: number;
  ndcg: number;
  mrr: number;
  coverage?: number;
}

export interface RecommenderEvaluation {
  evaluated_at: string;
  strategy: 'temporal' | 'holdout';
  k: number;
  test_users: number;
  passed: boolean;
  metrics: RecommenderMetrics;
  baselines: { popularity: RecommenderMetrics; random: RecommenderMetrics };
}

export interface CollaboratorRecommendationResponse {
  data: CollaboratorRecommendation[];
  meta: {
    status: 'ready' | 'not_ready';
    evaluation: RecommenderEvaluation | null;
  };
}