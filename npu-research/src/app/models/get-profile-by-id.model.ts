export interface ResearchProfileResponse {
    result: number;
    message: string;
    data: ResearchProfileData;
  }

  export interface ResearchProfileData {
    user: UserProfile;
    donut: DonutSummary;
    bar: BarSummary[];
    radar: RadarData;
    researchs: ResearchGroup;
  }

  export interface UserProfile {
    user_id: number;
    full_name: string;
    full_name_en: string;
    avatar_url: string | null;
    generalInfo: any | null;
    workInfo: any | null;
    educationalInfo: any | null;
  }

  export interface DonutSummary {
    projects_count: number;
    articles_count: number;
    innovations_count: number;
  }

  export interface BarSummary {
    year: number;
    project_count: number;
    article_count: number;
    innovation_count: number;
  }

  export interface ResearchGroup {
    projects: ResearchItem[];
    articles: ResearchItem[];
    innovations: ResearchItem[];
  }

  export interface ResearchItem {
    research_id: number;
    research_type: 'PROJECT' | 'ARTICLE' | 'INNOVATION';
    title_th: string;
    title_en: string | null;
    abstract: string | null;
    year: number;
    published_date: string; // ISO Date (yyyy-MM-dd)
    status: string | null;
    call_other: string | null;
    img_url: string | null;
    own: ResearchOwner[];
    research_code: string;
  }

  export interface ResearchOwner {
    user_id: number;
    full_name: string;
    role: string;
  }

  export interface RadarData {
    major: RadarSection;
    sub: RadarSection;
    child: RadarSection;
  }

  export interface RadarSection {
    labels: string[];
    datasets: RadarDataset[];
    raw: any[];
  }

  export interface RadarDataset {
    label: string;
    data: number[];
  }