// ===== API models =====
export interface ApiResponse<T> {
  result: number;
  message: string;
  data: T;
}

export interface ApiPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

// ===== Funder =====
export type ApiFunderType = 'government' | 'private' | 'international' | string;

export interface ApiFunder {
  id: number;
  code: string;
  name_th: string;
  name_en: string | null;
  short_name: string | null;
  type: ApiFunderType;
}

/** GET /admin/grant-funders/options */
export interface ApiFunderOption extends ApiFunder {
  display_name: string;
}

/** GET /admin/grant-funders/{id} และรายการใน GET /admin/grant-funders */
export interface ApiFunderDetail extends ApiFunder {
  type_name: string;
  description: string | null;
  website_url: string | null;
  logo_path: string | null;
  is_active: boolean;
  grants_count: number;
  created_at: string;
  updated_at: string;
}

export interface ApiFunderList {
  items: ApiFunderDetail[];
  pagination: ApiPagination;
}

export interface FunderListQuery {
  page?: number;
  per_page?: number;
  keyword?: string;
}

/** body ของ POST / PUT /admin/grant-funders */
export interface FunderPayload {
  code: string;
  name_th: string;
  name_en: string | null;
  short_name: string | null;
  type: ApiFunderType;
  description: string | null;
  website_url: string | null;
  logo_path?: string | null;
  is_active: boolean;
}

// ===== Grant list =====
export interface ApiGrantListItem {
  id: number;
  code: string;
  title_th: string;
  title_en: string | null;
  funder: ApiFunder | null;
  min_budget: number | null;
  max_budget: number | null;
  open_date: string | null; // yyyy-MM-dd
  deadline: string | null; // yyyy-MM-dd
  days_remaining: number | null;
  trl: { min: number | null; max: number | null } | null;
  status: 'draft' | 'published' | string;
  display_status: string;
  published_at: string | null;
  updated_at: string; // ISO
}

export interface ApiGrantList {
  items: ApiGrantListItem[];
  pagination: ApiPagination;
}

export interface GrantListQuery {
  page?: number;
  per_page?: number;
  keyword?: string;
  status?: string;
  funder_id?: number;
}

// ===== Grant detail =====
export interface ApiOecd {
  id: number;
  parent_id: number | null;
  code: string;
  name_th: string;
  name_en: string | null;
  level: number;
  weight: number;
}

export interface ApiGrantKeyword {
  id: number;
  keyword: string;
  weight: number;
}

export interface ApiEligibilityRequirement {
  id: number;
  requirement_key: string;
  operator: string | null;
  value: string | null;
  description: string;
  is_required: boolean;
  sort_order: number;
  metadata: unknown;
}

/** GET /admin/grants/{id} */
export interface ApiGrantDetail {
  id: number;
  funder_id: number | null;
  funder: (ApiFunder & { website_url: string | null }) | null;
  code: string;
  title_th: string;
  title_en: string | null;
  summary: string | null;
  description: string | null;
  objective: string | null;
  min_budget: number | null;
  max_budget: number | null;
  open_date: string | null;
  deadline: string | null;
  trl_min: number | null;
  trl_max: number | null;
  principal_investigator_requirement: string | null;
  announcement_url: string | null;
  application_url: string | null;
  document_url: string | null;
  oecds: ApiOecd[];
  keywords: ApiGrantKeyword[];
  eligibility_requirements: ApiEligibilityRequirement[];
  status: 'draft' | 'published' | string;
  display_status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** body ของ POST / PUT /admin/grants */
export interface GrantPayload {
  funder_id: number | null;
  title_th: string;
  title_en: string | null;
  summary: string | null;
  description: string | null;
  objective: string | null;
  min_budget: number | null;
  max_budget: number | null;
  open_date: string | null;
  deadline: string | null;
  trl_min: number;
  trl_max: number;
  announcement_url: string | null;
  application_url: string | null;
  document_url: string | null;
  oecd_ids: number[];
  keywords: string[];
  eligibility_requirements: { description: string; is_required: boolean }[];
}

// ===== Statistics =====
export interface ApiGrantStatistics {
  published_open: number;
  draft: number;
  closed: number;
  cancelled: number;
  total: number;
}

// ===== OECD tree (GET /research/oecd) =====
export interface ApiOecdChild {
  child_id: number;
  code: string;
  name_th: string;
}

export interface ApiOecdSub {
  sub_id: number;
  code: string;
  name_th: string;
  children: ApiOecdChild[];
}

export interface ApiOecdMajor {
  major_id: number;
  code: string;
  name_th: string;
  children: ApiOecdSub[];
}

export interface ApiOecdTree {
  oecd: ApiOecdMajor[];
}
