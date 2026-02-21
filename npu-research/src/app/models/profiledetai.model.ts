export interface UserProfile {
    result: number;
    message: string;
    data: {
        user: UserProfileInfo;
    }
}

export interface UserProfileInfo {
    user_id: number;
    full_name: string;
    avatar_url: string | null;
    expertises: string;
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
    expertise: string | null;
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