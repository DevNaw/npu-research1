export interface DashboardResponse {
    result: number;
    message: string;
    data: DashboardData;
  }
  
  /* ===================== MAIN DATA ===================== */
  
  export interface DashboardData {
    statistic_research: StatisticResearch;
    statistic_graph: StatisticGraph;
    news: NewsItem[];
    researchs: ResearchSection;
  }
  
  /* ===================== STATISTIC ===================== */
  
  export interface StatisticResearch {
    total_project: number;
    total_article: number;
    total_innovation: number;
    total_users: number;
  }
  
  export interface StatisticGraph {
    graph_project: GraphItem[];
    graph_article: GraphItem[];
    graph_innovation: GraphItem[];
  }
  
  export interface GraphItem {
    organization_id: number;
    label: string;
    count: number;
    percent: number;
  }
  
  /* ===================== NEWS ===================== */
  
  export interface NewsItem {
    news_id: number;
    title: string;
    published_date: string;
    expires_date: string;
    news_cover: string;
  }
  
  /* ===================== RESEARCH ===================== */
  
  export interface ResearchSection {
    projects: ResearchItem[];
    articles: ResearchItem[];
    innovations: ResearchItem[];
  }
  
  export type ResearchType = 'PROJECT' | 'ARTICLE' | 'INNOVATION';
  
  export interface ResearchItem {
    research_id: number;
    research_type: ResearchType;
    title_th: string;
    title_en: string | null;
    abstract: string | null;
    year: number;
    published_date: string;
    status: string | null;
    call_other: string | null;
    img_url: string | null;
    own: ResearchOwner[];
  }
  
  export interface ResearchOwner {
    user_id: number;
    full_name: string;
    role: string;
  }