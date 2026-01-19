export interface DataPerformanceItem {
    id: number;
    title: string;
    date: string;
  }
  
  export interface DataPerformance {
    research: DataPerformanceItem[];
    article: DataPerformanceItem[];
    innovation: DataPerformanceItem[];
  }

  export interface Address {
    houseNo?: string;
    alley?: string;
    road?: string;
    subDistrict?: string;
    district?: string;
    province?: string;
    phone?: string;
  }

  export interface Data {
    id: number;
    title: string;
    researchers: string;
  }