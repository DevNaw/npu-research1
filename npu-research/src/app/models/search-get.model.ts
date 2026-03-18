export interface OecdResponse {
  result: number;
  message: string;
  data: OecdData;
}

export interface OecdData {
  organizations: Organization[];
  oecd: OecdMajor[];
}

export interface Organization {
  id: number;
  faculty: string;
}

export interface OecdMajor {
  major_id: number;
  name_th: string;
  children: OecdSub[];
}

export interface OecdSub {
  sub_id: number;
  name_th: string;
  children: OecdChild[];
}

export interface OecdChild {
  child_id: number;
  name_th: string;
}