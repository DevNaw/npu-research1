// ===== Response ของ GET /grants/filter-options =====
// ApiResponse<T> ใช้ตัวเดิมจาก admin-grants.model (ไม่ประกาศซ้ำ)

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export interface GrantFunderOption {
  id: number;
  name: string;
  name_th: string;
  name_en: string;
  short_name: string;
  type: string;
}

export interface OecdMajor {
  major_id: number;
  code: string;
  name_th: string;
  name_en?: string;
}

export interface GrantFilterOptions {
  funders: GrantFunderOption[];
  funder_types: SelectOption[];
  trl: number[];
  budget: { min: number; max: number };
  views: SelectOption[];
  sorts: SelectOption[];
  oecd: OecdMajor[];
}
