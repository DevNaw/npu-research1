export interface InternalMemberRow {
  id: number;
  researcher_id: number | null;
  name: string;
  responsibilities: string;
}

export interface ExternalMemberRow {
  name: string;
  organization: string;
  responsibilities: string;
}

export interface Member {
  internal_members: InternalMemberRow[];
  external_members: ExternalMemberRow[];
}
