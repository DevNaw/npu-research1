export interface GeneralInfo {
    first_name: string;
    last_name: string;
    first_name_en: string | null;
    last_name_en: string | null;
    email: string;
    phone: string | null;
    id_card_number: string;
    date_of_birth: string;
    age: number;
    ethnicity: string;
    nationality: string;
    religion: string;
  }

  export interface GeneralInfoData {
    general_info: GeneralInfo;
  }

  export interface GeneralInfoResponse {
    result: number;
    message: string;
    data: GeneralInfoData;
  }