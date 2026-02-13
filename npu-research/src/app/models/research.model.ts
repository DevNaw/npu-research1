export interface InternalMember {
    user_id: string;
    role: string;
    no: string;
  }
  
  export interface ExternalMember {
    full_name: string;
    role: string;
    organization: string;
    no: string;
  }

  export interface ResearchData {
    id?: number;
    title_th: string;
    title_en: string;
    abstract: string;
    year: string;
    published_date: string;
    call_other: string;
    image: File | null;
    source_funds: string;
    name_funding: string;
    budget_amount: string;
    budget: string;
    year_received_budget: string;
    research_area: string;
    usable_area: string;
    start_date: string;
    end_date: string;
  
    internal_members: InternalMember[];
    external_members: ExternalMember[];
  
    full_report: File | null;
    contract_file: File | null;
  }
  