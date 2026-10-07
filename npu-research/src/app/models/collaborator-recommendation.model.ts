// ---------------------------------------------------------------------------
// Common
// ---------------------------------------------------------------------------
export interface ApiResponse<T> {
  result: number;
  message: string;
  data: T;
}

export type MatchLevel = 'high' | 'good' | 'consider' | 'other';
export type LevelFilter = 'all' | MatchLevel;
export type ResearchType = 'ARTICLE' | 'PROJECT' | 'INNOVATION';

// ---------------------------------------------------------------------------
// GET /v1/extreme/collaborator-recommendations
// ---------------------------------------------------------------------------
export interface LevelThresholds {
  high: number;
  good: number;
  consider: number;
}

export type LevelCounts = Record<LevelFilter, number>;

export interface RecommendationLevel {
  code: MatchLevel;
  label: string;
}

export interface ResearcherWork {
  position: string | null;
  academic_position: string | null;
  organization_id: number | null;
}

export interface RecommendedResearcher {
  id: number;
  prefix_th: string | null;
  first_name: string;
  last_name: string;
  full_name_th: string;
  avatar: string | null;
  work: ResearcherWork | null;
}

/** คะแนนแต่ละส่วนอยู่ในช่วง 0–100 */
export interface RecommendationScores {
  expertise: number;
  network: number;
  activity: number;
}

// ----- explain.expertise -----
export interface OecdField {
  id: number;
  code: string;
  level: number;
  name_th: string;
  is_generic: boolean;
}

export interface ExpertiseMatch {
  similarity: number;
  source_oecd: OecdField;
  target_oecd: OecdField;
  source_output_count: number;
  weighted_similarity: number;
}

export interface ExpertiseExplain {
  score: number;
  top_matches: ExpertiseMatch[];
  relevant_pair_count: number;
  candidate_oecd_count: number;
  researcher_oecd_count: number;
  candidate_evidence_count: number;
  researcher_evidence_count: number;
  candidate_to_researcher_score: number;
  researcher_to_candidate_score: number;
}

// ----- explain.network -----
/** ตัวอย่างข้อมูลยังเป็น [] ทั้งหมด — ปรับ field ให้ตรงเมื่อ API ส่งข้อมูลจริง */
export interface CommonCollaborator {
  id: number;
  full_name_th?: string;
}

export interface NetworkExplain {
  score: number;
  direct_output_ids: number[];
  jaccard_coefficient: number;
  network_union_count: number;
  common_collaborators: CommonCollaborator[];
  direct_collaboration: boolean;
  common_collaborator_count: number;
  direct_collaboration_count: number;
  candidate_collaborator_count: number;
  researcher_collaborator_count: number;
}

// ----- explain.activity -----
export interface ActivityPeriod {
  end_year: number;
  start_year: number;
  end_year_be: number;
  recent_years: number;
  start_year_be: number;
}

export interface ResearchOutput {
  id: number;
  year: number;
  title_en: string | null;
  title_th: string | null;
  original_year: number;
  research_type: ResearchType;
}

export interface ActivityExplain {
  score: number;
  period: ActivityPeriod;
  active_years: number[];
  volume_score: number;
  latest_outputs: ResearchOutput[];
  active_years_be: number[];
  continuity_score: number;
  active_year_count: number;
  output_type_counts: Record<ResearchType, number>;
  recent_output_count: number;
}

export interface RecommendationExplain {
  expertise: ExpertiseExplain;
  network: NetworkExplain;
  activity: ActivityExplain;
}

export interface CollaboratorRecommendation {
  researcher: RecommendedResearcher;
  /** คะแนนรวม 0–100 */
  matching_score: number;
  level: RecommendationLevel;
  scores: RecommendationScores;
  common_collaborator_count: number;
  recent_output_count: number;
  direct_collaboration: boolean;
  direct_collaboration_count: number;
  explain: RecommendationExplain;
  algorithm_version: string;
  calculated_at: string;
}

export interface CollaboratorRecommendationData {
  researcher_id: number;
  view: string;
  selected_level: MatchLevel | null;
  thresholds: LevelThresholds;
  level_counts: LevelCounts;
  recommendations: CollaboratorRecommendation[];
}

export type CollaboratorRecommendationResponse = ApiResponse<CollaboratorRecommendationData>;

// ---------------------------------------------------------------------------
// POST /v1/extreme/collaborator-recommendations/recalculate
// ---------------------------------------------------------------------------
export interface RecalculateResult {
  candidate_count: number;
  calculated_count: number;
  new_collaborator_count: number;
  existing_collaborator_count: number;
  failed_count: number;
  failed_user_ids: number[];
}

export type RecalculateResponse = ApiResponse<RecalculateResult>;

/** ผลของการกดอัปเดต */
export interface RecalculateOutcome {
  /** true = หลังบ้านรับคำสั่งแล้ว กำลังคำนวณเบื้องหลัง (202 หรือ 409 มีงานรันอยู่แล้ว) */
  accepted: boolean;
  /** ตัวเลขสรุป — มีเฉพาะกรณีตอบ 200 */
  result: RecalculateResult | null;
  message: string | null;
}

// ---------------------------------------------------------------------------
// Evaluation (API ยังไม่ส่งมา — เก็บไว้ใช้กับป้าย "ผ่านการประเมินผลแล้ว")
// ---------------------------------------------------------------------------
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