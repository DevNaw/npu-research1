export interface OECDResponse {
    result: number;
    message: string;
    data: OECDData;
  }
  
  export interface OECDData {
    oecd: OECDMajor[];
  }

  export interface OECDMajor {
    major_id: number;
    code: string;
    name_th: string;
    children: OECDSub[];
  }

  export interface OECDSub {
    sub_id: number;
    code: string;
    name_th: string;
    children: OECDChild[];
  }

  export interface OECDChild {
    child_id: number;
    code: string;
    name_th: string;
  }