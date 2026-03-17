export interface OecdResponse {
  result: number;
  message: string;
  data: OecdData;
}

export interface OecdData {
  oecd: Major[];
}

export interface Major {
  major_id: number;
  name_th: string;
  children: Sub[];
}

export interface Sub {
  sub_id: number;
  name_th: string;
  children: Child[];
}

export interface Child {
  child_id: number;
  name_th: string;
}