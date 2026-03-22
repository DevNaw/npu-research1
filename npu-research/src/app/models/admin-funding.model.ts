export interface Funding {
    id: number;
    funding_name: string;
    funding_code: string;
    description: string;
    is_active: 0 | 1;
  }

  export interface FundingData {
    fundings: Funding[];
  }

  export interface FundingResponse {
    result: number;
    message: string;
    data: FundingData;
  }