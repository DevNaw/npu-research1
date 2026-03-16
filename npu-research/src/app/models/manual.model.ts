export interface Manual {
  manual_id: number;
  doc_name: string;
  file_url: string;
  download_count: number;
}

export interface ManualData {
  manuals: Manual[];
}

export interface ManualResponse {
  result: number;
  message: string;
  data: ManualData;
}