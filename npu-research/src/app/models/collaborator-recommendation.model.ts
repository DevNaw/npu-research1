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
  /** มีเฉพาะ endpoint explain */
  reason?: string;
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
  /** true = ทั้งคู่เป็นสาขา "อื่นๆ" (generic) */
  is_generic_pair?: boolean;
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

/**
 * หัวข้อที่ตรงกันในหน้ารายการ — ตัวอย่างยังเป็น [] ทั้งหมด
 * รองรับทั้ง string และ object ไว้ก่อน ปรับให้ตรงเมื่อ API ส่งข้อมูลจริง
 */
export type ListSharedTopic = string | Pick<SharedTopic, 'topic'> & Partial<SharedTopic>;

export interface CollaboratorRecommendation {
  researcher: RecommendedResearcher;
  /** คะแนนรวม 0–100 */
  matching_score: number;
  level: RecommendationLevel;
  confidence: ConfidenceSummary;
  rank: RecommendationRank;
  scores: RecommendationScores;
  shared_topics: ListSharedTopic[];
  common_collaborator_count: number;
  recent_output_count: number;
  direct_collaboration: boolean;
  direct_collaboration_count: number;
  /** หน้ารายการไม่ส่งมาแล้ว — ใช้ endpoint explain แทน */
  explain?: RecommendationExplain;
  algorithm_version: string;
  policy_version: string;
  calculated_at: string;
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  /** null เมื่อหน้าว่าง (Laravel paginator) */
  from: number | null;
  to: number | null;
}

/** เกณฑ์คะแนนตามเปอร์เซ็นไทล์ของ Candidate Pool */
export interface RankThresholds {
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  candidate_count: number;
}

export interface CollaboratorRecommendationData {
  researcher_id: number;
  view: string;
  selected_level: MatchLevel | null;
  /** ตัวอย่างล่าสุดไม่มีแล้ว — เก็บเป็น optional */
  thresholds?: LevelThresholds;
  level_counts: LevelCounts;
  rank_thresholds: RankThresholds;
  pagination: Pagination;
  recommendations: CollaboratorRecommendation[];
  algorithm_version: string;
  policy_version: string;
}

export type CollaboratorRecommendationResponse = ApiResponse<CollaboratorRecommendationData>;

// ---------------------------------------------------------------------------
// GET /v1/extreme/collaborator-recommendations/{researcherId}/explain
// "ดึงรายละเอียดการจับคู่ผู้ร่วมวิจัย" — ขยายจาก type ของ list ด้านบน
// ---------------------------------------------------------------------------
export type ConfidenceCode = 'high' | 'medium' | 'low';
/** ตัวอย่างพบ 'top_5', 'lower_50' — ค่าอื่นเดาจาก rank_thresholds (p50/p75/p90/p95) */
export type RankCode = 'top_5' | 'top_10' | 'top_25' | 'top_50' | 'lower_50' | (string & {});
export type TopicSource = 'keyword_phrase' | 'keyword_token' | 'title_token' | (string & {});

export interface ExplainResearcher extends RecommendedResearcher {
  prefix_en: string | null;
  first_name_en: string | null;
  last_name_en: string | null;
  full_name_en: string | null;
}

// ----- confidence -----
export interface ScoreSignal {
  available: boolean;
  score: number;
}

export interface TopicSignal extends ScoreSignal {
  supporting: boolean;
  support_threshold: number;
}

export interface NetworkSignal extends ScoreSignal {
  common_collaborator_count: number;
  supporting: boolean;
  score_support_threshold: number;
  common_collaborator_support_threshold: number;
}

export interface ConfidenceSignals {
  oecd: ScoreSignal;
  topic: TopicSignal;
  network: NetworkSignal;
  direct_collaboration: { value: boolean };
}

/** หน้ารายการส่งมาเท่านี้ */
export interface ConfidenceSummary {
  code: ConfidenceCode;
  label: string;
  points: number;
  max_points: number;
}

/** endpoint explain มี signals เพิ่ม */
export interface RecommendationConfidence extends ConfidenceSummary {
  signals: ConfidenceSignals;
}

// ----- rank -----
export interface RecommendationRank {
  code: RankCode;
  label: string;
  /** null เมื่อไม่ได้อยู่กลุ่มบน */
  top_percent: number | null;
}

// ----- scores -----
export interface ExplainScores extends RecommendationScores {
  oecd: number;
  topic: number;
  relevance: number;
  /** ตัวคูณ 0.9–1 */
  activity_factor: number;
}

// ----- explain.total -----
export interface TotalComponent {
  used: boolean;
  score: number;
  weight: number;
}

export interface TotalExplain {
  score: number;
  /** เช่น 'relevance_x_activity_modifier' */
  formula: string;
  components: {
    network: TotalComponent;
    expertise: TotalComponent;
  };
  used_weight: number;
  activity_factor: number;
  relevance_score: number;
  configured_weight: number;
}

// ----- explain.expertise.topic -----
export interface TopicItem {
  topic: string;
  weight: number;
  sources: TopicSource[];
  output_count: number;
}

export interface SharedTopic {
  topic: string;
  common_weight: number;
  candidate_weight: number;
  candidate_sources: TopicSource[];
  researcher_weight: number;
  researcher_sources: TopicSource[];
  candidate_output_count: number;
  researcher_output_count: number;
}

export interface TopicExplain {
  score: number;
  /** เช่น 'directional-weighted-coverage' */
  method: string;
  shared_topics: SharedTopic[];
  shared_weight: number;
  coverage_weights: {
    candidate: number;
    researcher: number;
  };
  shared_topic_count: number;
  candidate_top_topics: TopicItem[];
  candidate_topic_count: number;
  researcher_top_topics: TopicItem[];
  candidate_output_count: number;
  candidate_total_weight: number;
  researcher_topic_count: number;
  candidate_keyword_count: number;
  researcher_output_count: number;
  researcher_total_weight: number;
  candidate_coverage_score: number;
  researcher_keyword_count: number;
  researcher_coverage_score: number;
}

export interface ExpertiseExplainDetail extends ExpertiseExplain {
  topic: TopicExplain;
  oecd_score: number;
  oecd_weight: number;
  topic_score: number;
  topic_weight: number;
  /** เช่น 'generic_mixed' */
  weighting_mode: string;
  evidence_status: {
    has_oecd: boolean;
    has_topic: boolean;
  };
  generic_match_ratio: number;
  candidate_generic_profile_ratio: number;
  researcher_generic_profile_ratio: number;
}

// ----- explain.activity_modifier -----
export interface ActivityModifier {
  used: boolean;
  factor: number;
  max_factor: number;
  min_factor: number;
  activity_score: number;
}

export interface RecommendationExplainDetail {
  total: TotalExplain;
  expertise: ExpertiseExplainDetail;
  network: NetworkExplain;
  activity: ActivityExplain;
  activity_modifier: ActivityModifier;
}

export interface CollaboratorExplainData {
  researcher: ExplainResearcher;
  matching_score: number;
  level: Required<RecommendationLevel>;
  confidence: RecommendationConfidence;
  rank: RecommendationRank;
  /** เช่น 'new' */
  rank_context_view: string;
  scores: ExplainScores;
  common_collaborator_count: number;
  recent_output_count: number;
  direct_collaboration: boolean;
  direct_collaboration_count: number;
  explain: RecommendationExplainDetail;
  algorithm_version: string;
  policy_version: string;
  calculated_at: string;
}

export type CollaboratorExplainResponse = ApiResponse<CollaboratorExplainData>;

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