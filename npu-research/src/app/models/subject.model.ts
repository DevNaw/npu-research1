export interface SubArea {
  sub_id: number;
  name_en: string;
  major_id: number;
}

export interface Major {
  major_id: number;
  name_en: string;
  children: SubArea[];
}

export interface SubjectAreaResponse {
  result: number;
  message: string;
  data: {
    subject_areas: Major[];
  };
}

export interface ArticleForm {
  responsibility: string;
  type: string;
  database_types: string;
  quality: string;
  major_id?: number | null;
  sub_id?: number | null;
}
