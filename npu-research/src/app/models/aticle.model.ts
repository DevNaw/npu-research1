export interface AticleData {
    id: number;
    title: string;
    photo: string;
    branches_of_the_article: string;
    branches_of_sub_articles: string;
    quality_level: string;
    internal_project_participants: string;
    external_project_participants: string;
    year_of_publication: string;
    collaboration_with_other_organizations: string;
    presentation_venue: string;
    publication: string;
}
export interface Article {
    title_th: string;
    title_en: string;
    abstract: string;
    year: string;
    published_date: string;
    call_other: string;
    image: File | null;
    db_type: string;
    country: string;
    article_type: string;
    journal_name: string;
    pre_location: string;
    pages: string;
    year_published: string;
    volume: string;
    volume_no: string;
    is_cooperation: string;
    doi: string;
    subject_area_id: string;
    responsibilities: string;
    internal_members: Internal[];
    external_members: External[];
    article_file: File | null;
}

export interface Internal {
    user_id: number;
    role: string;
    no: string;
}

export interface External {
    full_name: string;
    role: string;
    organization: string;
    no: string;
}