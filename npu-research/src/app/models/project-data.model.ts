export interface Root {
    result: number;
    message: string;
    data: Data;
  }

  export interface Data {
    statistic_research: StatisticResearch;
    statistic_graph: StatisticGraph;
    radar: Radar;
    ford: Ford;
    researchs: ResearchGroup;
  }

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
    label_full: string;
    count: number;
    percent: number;
  }

  export interface Radar {
    major: RadarLevel;
    sub: RadarLevel;
    child: RadarLevel;
  }
  
  export interface RadarLevel {
    labels: string[];
    datasets: Dataset[];
    raw: Raw[];
  }
  
  export interface Dataset {
    label: string;
    data: number[];
  }
  
  export interface Raw {
    id: number | null;
    name: string;
    PROJECT: number;
    ARTICLE: number;
    INNOVATION: number;
    total: number;
  }

  export interface Ford {
    project: FordItem[];
    article: FordItem[];
    innovation: FordItem[];
  }
  
  export interface FordItem {
    name: string;
    count: number;
    percent: number;
  }


  export interface ResearchGroup {
    projects: ResearchItem[];
    articles: ResearchItem[];
    innovations: ResearchItem[];
  }

  export type ResearchType = 'PROJECT' | 'ARTICLE' | 'INNOVATION';

export interface ResearchItem {
  research_id: number;
  research_type: ResearchType;

  research_code: string | null;
  title_th: string;
  title_en: string | null;

  year: number;
  published_date: string;

  status: string | null;
  call_other: string | null;
  img_url: string | null;

  oecd: Oecd[];
  funding: Funding;
  own: Owner[];
}

export interface Oecd {
    major_id: number;
    name_th: string;
    children: OecdSub;
  }
  
  export interface OecdSub {
    sub_id: number;
    name_th: string;
    children: OecdChild;
  }
  
  export interface OecdChild {
    child_id: number;
    name_th: string;
  }

  export interface Funding {
    source_funds: string | null;
    funding_name: string | null;
  }
  
  export interface Owner {
    user_id: number | null;
    full_name: string;
    role: string;
  }