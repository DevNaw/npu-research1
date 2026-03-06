export interface Funding {
    id: number;
    funding_name: string;
  }

  export interface FundingData {
    fundings: Funding[];
  }

  export interface FundingResponse {
    result: number;
    message: string;
    data: FundingData;
  }