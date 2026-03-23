export interface DashboardResponse {
    result: number;
    message: string;
    data: DashboardData;
  }
  
  export interface DashboardData {
    statistic: Statistic;
    graph_research: GraphResearch[];
    graph_oecd: GraphOECD[];
    top_researcher: TopResearcher[];
  }
  
  export interface Statistic {
    total_researcher: number;
    total_research: number;
    total_project: number;
    total_article: number;
    total_innovation: number;
  }
  
  export interface GraphResearch {
    organization_id: number;
    label: string;
    label_full: string;
    count: number;
    percent: number;
  }
  
  export interface GraphOECD {
    oecd_id: number;
    oecd_name: string;
    count: number;
    percent: number;
  }
  
  export interface TopResearcher {
    user_id: number;
    full_name: string;
    avatar_url: string | null;
    organization: string;
    project_count: number;
    article_count: number;
    innovation_count: number;
    total_count: number;
  }