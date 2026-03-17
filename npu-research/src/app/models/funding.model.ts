export interface Funding {
    id: number;
    funding_name: string;
    funding_code: string;
  }

  export interface FundingData {
    fundings: Funding[];
  }

  export interface FundingResponse {
    result: number;
    message: string;
    data: FundingData;
  }