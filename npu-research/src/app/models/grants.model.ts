// ===================================================================
// Grants — API types (ตรงกับ response จริง) + UI model + mapper
// ===================================================================

// ===== Shared =====
export type FunderType = 'government' | 'private' | 'international';

export const FUNDER_TYPE_LABELS: Record<string, string> = {
  government: 'รัฐ',
  private: 'เอกชน',
  international: 'ต่างประเทศ',
};

export interface ApiPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

/** query ที่ส่งไป GET /grants — ส่งเฉพาะค่าที่มี */
export interface GrantQuery {
  search?: string;
  oecd_id?: number;
  trl?: number;
  funder_type?: string;
  view?: string;
  max_budget?: number;
  sort?: string;
  page?: number;
  per_page?: number;
}

// ===== API: ชิ้นส่วนย่อย =====
export interface ApiGrantFunder {
  id: number;
  code?: string | null;
  name: string;
  name_th: string | null;
  name_en: string | null;
  short_name: string | null;
  type: string | null;
  website_url?: string | null;
}

export interface ApiGrantTrl {
  min: number | null;
  max: number | null;
  label?: string | null;
}

export interface ApiGrantOecd {
  id: number;
  parent_id?: number | null;
  code: string | null;
  name_th: string | null;
  name_en: string | null;
  level: number | null;
  weight?: number | null;
}

export interface ApiGrantKeyword {
  id: number;
  keyword: string;
  weight?: number | null;
}

export interface ApiEligibilityRequirement {
  id: number;
  requirement_key: string | null;
  operator: string | null;
  value: string | number | null;
  description: string | null;
  is_required: boolean;
}

// TODO: ยืนยันรูปแบบ matching_score กับ backend (ตอนนี้ได้ null) — รองรับทั้งตัวเลขและ object
export interface ApiMatchItem {
  key?: string;
  label: string;
  score: number;
  max: number;
  note?: string | null;
}

export type ApiMatchingScore =
  | number
  | { total: number; items?: ApiMatchItem[] }
  | null;

// ===== API: list (GET /grants) =====
export interface ApiGrantListItem {
  id: number;
  code: string | null;
  title: string;
  title_th: string | null;
  title_en: string | null;
  summary: string | null;
  funder: ApiGrantFunder | null;
  min_budget: number | null;
  max_budget: number | null;
  open_date: string | null;
  deadline: string | null;
  days_remaining: number | null;
  is_closing_soon?: boolean;
  trl: ApiGrantTrl | null;
  oecds: ApiGrantOecd[];
  keywords: string[]; // list = array ของ string
  is_saved: boolean;
  matching_score: ApiMatchingScore;
  announcement_url: string | null;
}

export interface ApiGrantListData {
  items: ApiGrantListItem[];
  pagination: ApiPagination;
  filters?: Partial<Record<keyof GrantQuery, string | number | null>>;
}

// ===== API: detail (GET /grants/{id}) =====
export interface ApiGrantDetail
  extends Omit<ApiGrantListItem, 'keywords' | 'is_closing_soon'> {
  description: string | null;
  objective: string | null;
  principal_investigator_requirement: string | null;
  keywords: ApiGrantKeyword[]; // detail = array ของ object
  eligibility_requirements: ApiEligibilityRequirement[];
  application_url: string | null;
  document_url: string | null;
  is_closing_soon?: boolean;
}

// ===== UI model =====
export interface GrantOecd {
  id: number;
  code: string | null;
  name: string;
  level: number;
}

export interface GrantRequirement {
  id: number;
  description: string;
  isRequired: boolean;
}

export interface GrantMatch {
  total: number;
  items: { label: string; score: number; max: number; note: string | null }[];
}

export interface Grant {
  id: number;
  code: string | null;
  title: string;
  summary: string | null;
  description: string | null;
  objective: string | null;

  funderId: number | null;
  funderName: string;
  funderType: string;

  minBudget: number | null;
  maxBudget: number | null;
  openDate: string | null;
  deadline: string | null;
  daysRemaining: number;
  isClosingSoon: boolean;

  trlMin: number | null;
  trlMax: number | null;

  oecds: GrantOecd[];
  keywords: string[];
  piRequirement: string | null;
  requirements: GrantRequirement[];

  announcementUrl: string | null;
  applicationUrl: string | null;
  documentUrl: string | null;

  isSaved: boolean;
  match: GrantMatch | null;
  hasDetail: boolean; // true = โหลด detail แล้ว ไม่ต้องยิงซ้ำ
}

// ===== Mapper helpers =====
const CLOSING_SOON_DAYS = 14;

/** ใช้ days_remaining จาก API ก่อน ไม่มี -> คำนวณจาก deadline (ไม่มี deadline = ถือว่าเปิดรับ) */
function resolveDaysRemaining(
  apiDays: number | null | undefined,
  deadline: string | null
): number {
  if (typeof apiDays === 'number') return apiDays;
  if (!deadline) return 0;
  const [y, m, d] = deadline.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return 0;
  const end = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

function mapOecds(list: ApiGrantOecd[] | null | undefined): GrantOecd[] {
  return (list ?? []).map((o) => ({
    id: o.id,
    code: o.code,
    name: o.name_th || o.name_en || o.code || '-',
    level: o.level ?? 1,
  }));
}

function mapMatch(score: ApiMatchingScore | undefined): GrantMatch | null {
  if (score === null || score === undefined) return null;
  if (typeof score === 'number') return { total: Math.round(score), items: [] };
  if (typeof score.total !== 'number') return null;
  return {
    total: Math.round(score.total),
    items: (score.items ?? []).map((i) => ({
      label: i.label,
      score: i.score,
      max: i.max,
      note: i.note ?? null,
    })),
  };
}

function mapBase(
  api: ApiGrantListItem | ApiGrantDetail
): Omit<
  Grant,
  | 'keywords'
  | 'description'
  | 'objective'
  | 'piRequirement'
  | 'requirements'
  | 'applicationUrl'
  | 'documentUrl'
  | 'hasDetail'
> {
  const daysRemaining = resolveDaysRemaining(api.days_remaining, api.deadline);
  return {
    id: api.id,
    code: api.code,
    title: api.title_th || api.title || api.title_en || '-',
    summary: api.summary,

    funderId: api.funder?.id ?? null,
    funderName:
      api.funder?.name_th ||
      api.funder?.name ||
      api.funder?.name_en ||
      'ไม่ระบุแหล่งทุน',
    funderType: api.funder?.type ?? '',

    minBudget: api.min_budget,
    maxBudget: api.max_budget,
    openDate: api.open_date,
    deadline: api.deadline,
    daysRemaining,
    isClosingSoon:
      api.is_closing_soon ??
      (daysRemaining >= 0 && daysRemaining <= CLOSING_SOON_DAYS),

    trlMin: api.trl?.min ?? null,
    trlMax: api.trl?.max ?? null,

    oecds: mapOecds(api.oecds),

    announcementUrl: api.announcement_url,
    isSaved: !!api.is_saved,
    match: mapMatch(api.matching_score),
  };
}

// ===== Mappers =====
export function mapGrantListItem(api: ApiGrantListItem): Grant {
  return {
    ...mapBase(api),
    description: null,
    objective: null,
    keywords: (api.keywords ?? []).filter(Boolean),
    piRequirement: null,
    requirements: [],
    applicationUrl: null,
    documentUrl: null,
    hasDetail: false,
  };
}

export function mapGrantDetail(api: ApiGrantDetail): Grant {
  return {
    ...mapBase(api),
    description: api.description,
    objective: api.objective,
    keywords: (api.keywords ?? []).map((k) => k.keyword).filter(Boolean),
    piRequirement: api.principal_investigator_requirement,
    requirements: (api.eligibility_requirements ?? [])
      .filter((r) => !!r.description)
      .map((r) => ({
        id: r.id,
        description: r.description as string,
        isRequired: !!r.is_required,
      })),
    applicationUrl: api.application_url,
    documentUrl: api.document_url,
    hasDetail: true,
  };
}
