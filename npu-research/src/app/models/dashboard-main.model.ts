export interface DashboardResponse {
  result: number;
  message: string;
  data: DashboardData;
}

/* ===================== MAIN DATA ===================== */

export interface DashboardData {
  statistic_research: StatisticResearch;
  statistic_graph: StatisticGraph;
  radar: RadarData;
  ford: FordData;
  news: NewsItem[];
  researchs: ResearchSection;
  faculty_breakdown?: FacultyBreakdown;
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
  label_full: string;
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
  research_code: string;
  title_th: string;
  title_en: string | null;
  abstract: string | null;
  year: number;
  published_date: string;
  status: string | null;
  call_other: string | null;
  img_url: string | null;
  own: ResearchOwner[];
  funding: Funding;
}

export interface ResearchOwner {
  user_id: number;
  full_name: string;
  role: string;
}

export interface Funding {
  funding_name: string;
  source_funds: string;
}

export interface RadarDataset {
  label: string;
  data: number;
}

export interface RadarRawItem {
  id: number | null;
  name: string;
  PROJECT: number;
  ARTICLE: number;
  INNOVATION: number;
  total: number;
}

export interface RadarLevel {
  labels: string[];
  datasets: RadarDataset[];
  raw: RadarRawItem[];
}

export interface RadarData {
  major: RadarLevel;
  sub: RadarLevel;
  child: RadarLevel;
}

export interface FordItem {
  name: string;
  count: number;
  percent: number;
}

export interface FordData {
  project: FordItem[];
  article: FordItem[];
  innovation: FordItem[];
}

export interface MajorStat {
  major_name: string;
  count: number;
  works?: MajorWork[]; 
}

export interface FacultyStat {
  faculty_id: number;
  faculty_name: string;
  count: number;
  majors: MajorStat[];
}

export interface FacultyBreakdown {
  project: FacultyStat[];
  article: FacultyStat[];
  innovation: FacultyStat[];
}

export interface MajorWork {
  research_id: number;
  title_th: string;
  year: number;
  owner_name: string;
}

export interface FacultyOverviewItem {
  organization_id: number;
  faculty_name: string;
  faculty_short: string;
  faculty_code: string;
  count: number;
  percent: number;
}

export interface FacultyOverviewData {
  type: string;
  total: number;
  items: FacultyOverviewItem[];
}

export interface FacultyOverviewResponse {
  result: number;
  message: string;
  data: FacultyOverviewData;
}

export interface FacultyOecdItem {
  id: number;
  name_th: string;
  name_en: string | null;
  count: number;
  percent: number;
}

export interface FacultyOecdRadar {
  labels: string[];
  data: number[];
  items: FacultyOecdItem[];
}

export interface FacultyOecdData {
  type: string;
  organization: {
    id: number;
    name: string;
    short_name: string;
    code: string;
  };
  total_research: number;
  top_oecd: FacultyOecdItem;
  radar: FacultyOecdRadar;
}

export interface FacultyOecdResponse {
  result: number;
  message: string;
  data: FacultyOecdData;
}