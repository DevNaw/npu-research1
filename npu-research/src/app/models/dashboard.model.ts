export interface DataPerformanceItem{
    id: number;
    title: string;
    researchers: string;
    date: string;
    year: number;
}

export interface DataPerformance {
    research: DataPerformanceItem[];
    article: DataPerformanceItem[];
    innovation: DataPerformanceItem[];
}