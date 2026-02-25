// export interface UserProfile {
//     result: number;
//     message: string;
//     data: {
//         user: UserProfileInfo;
//     }
// }

// export interface UserProfileInfo {
//     user_id: number;
//     full_name: string;
//     avatar_url: string | null;
//     expertises: string;
//     generalInfo: GeneralInfo;
//     workInfo: WorkInfo;
//     educationalInfo: EducationalInfo;
// }

// export interface GeneralInfo {
//     id_card_number: string;
//     date_of_birth: string;
//     age: number;
//     ethnicity: string;
//     nationality: string;
//     religion: string;
//   }

//   export interface WorkInfo {
//     position: string;
//     organization: string;
//     type: string;
//     line_work: string;
//     academic_position: string;
//     interest: string;
//     expertises: string | null;
//     work_start_date: string;
//     year_of_service: number;
//   }

//   export interface EducationalInfo {
//     highest_education: string;
//     field_of_study: string;
//     qualification: string;
//     gpa: string;
//     institution: string;
//     date_enrollment: string;
//     date_graduation: string;
//   }

  // New
  export interface UserProfileResponse {
    result: number;
    message: string;
    data: ProfileData;
  }

  export interface ProfileData {
    user: UserProfile;
    donut: DonutSummary;
    bar: BarSummary[];
    researchs: ResearchGroup;
  }

  export interface UserProfile {
    user_id: number;
    full_name: string;
    avatar_url: string | null;
    generalInfo: GeneralInfo;
    workInfo: WorkInfo;
    educationalInfo: EducationalInfo;
  }

  export interface GeneralInfo {
    id_card_number: string;
    date_of_birth: string;
    age: number;
    ethnicity: string;
    nationality: string;
    religion: string;
  }

  export interface WorkInfo {
    position: string;
    organization: string;
    type: string;
    line_work: string;
    academic_position: string;
    interest: string;
    expertises: string | null;
    work_start_date: string;
    year_of_service: number;
  }

  export interface EducationalInfo {
    highest_education: string;
    field_of_study: string;
    qualification: string;
    gpa: string;
    institution: string;
    date_enrollment: string;
    date_graduation: string;
  }

  export interface BarSummary {
    year: number;
    project_count: number;
    article_count: number;
    innovation_count: number;
  }

  export interface DonutSummary {
    projects_count: number;
    articles_count: number;
    innovations_count: number;
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