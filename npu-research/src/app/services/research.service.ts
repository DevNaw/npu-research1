import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  Research,
  ResearchPublicResponse,
  ResearchDataPublic,
} from '../models/research.model';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { SubjectAreaResponse } from '../models/subject.model';
import { ResearcherResponse } from '../models/researchers.model';
import { ArticleApiResponse } from '../models/article-show.model';

export type ResearchType = 'project' | 'article' | 'innovation';

@Injectable({
  providedIn: 'root',
})
export class ResearchService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) {}

  // ✅ สร้าง research ทุกประเภท
  createResearch(data: any) {
    return this.http.post(`${this.baseUrl}/research/add-project`, data);
  }

  // ✅ ดึงทั้งหมด
  getPublicData(): Observable<{
    research: Research[];
    article: Research[];
    innovation: Research[];
  }> {
    return this.http.get<any>(`${this.baseUrl}/public/research/lists`).pipe(
      map((res) => {
        const list = res?.data?.researchs ?? [];

        const research: Research[] = [];
        const article: Research[] = [];
        const innovation: Research[] = [];

        list.forEach((r: any) => {
          const mapped: Research = {
            id: r.research_id,
            type:
              r.research_type === 'PROJECT'
                ? 'research'
                : r.research_type === 'ARTICLE'
                ? 'article'
                : 'innovation',
            subType: '',
            faculty: '',
            agency: r.call_other ?? '',
            funding: 'internal',
            year: r.year,
            date: new Date(r.published_date),
            name: this.mapOwners(r.own),
            title: r.title_th || r.title_en,
            img: r.img_url || 'assets/logoNPU.png',
          };

          if (r.research_type === 'PROJECT') {
            research.push(mapped);
          } else if (r.research_type === 'ARTICLE') {
            article.push(mapped);
          } else if (r.research_type === 'INNOVATION') {
            innovation.push(mapped);
          }
        });

        return { research, article, innovation };
      })
    );
  }

  private mapOwners(owners: any[]): string {
    if (!owners || owners.length === 0) return '-';

    return owners.map((o) => `${o.full_name} (${o.role})`).join(', ');
  }

  // Public
  getDataResearchPublic() {
    return this.http.get<ResearchPublicResponse>(
      `${this.baseUrl}/public/research/project-lists`
    );
  }

  getDataArticlePublic() {
    return this.http.get<ResearchPublicResponse>(
      `${this.baseUrl}/public/research/article-lists`
    );
  }

  getDataInnovationPublic() {
    return this.http.get<ResearchPublicResponse>(
      `${this.baseUrl}/public/research/innovation-lists`
    );
  }

  getResearch(): Observable<Research[]> {
    return this.http
      .get<ResearchPublicResponse>(`${this.baseUrl}/research/lists`)
      .pipe(
        map((res) =>
          (res.data.projects ?? []).map(
            (r: ResearchDataPublic): Research => ({
              id: r.research_id,
              type:
                r.research_type === 'PROJECT'
                  ? 'research'
                  : r.research_type === 'ARTICLE'
                  ? 'article'
                  : 'innovation',
              subType: '',
              faculty: '',
              agency: r.call_other ?? '',
              funding: 'internal',
              year: r.year,
              date: new Date(r.published_date),
              name: this.mapOwners(r.own),
              title: r.title_th || r.title_en,
              img: r.img_url || 'assets/logoNPU.png',
            })
          )
        )
      );
  }

  // Subject Area
  getSubjectArea() {
    return this.http.get<SubjectAreaResponse>(
      `${this.baseUrl}/research/subject-areas`
    );
  }

  // ดึงรายชื่อนักวิจัย
  getResearchers(): Observable<ResearcherResponse> {
    return this.http.get<ResearcherResponse>(
      `${this.baseUrl}/research/researchers`
    );
  }

  // Create to Article Project
  createArticle(data: any) {
    return this.http.post(`${this.baseUrl}/research/add-article`, data);
  }

  // Retrieve data for Article Project
  getArticleById(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/research/${id}/article`
    );
  }

  // Update Article Project
  updateArticle(id: number, data: any) {
    return this.http.post(`${this.baseUrl}/research/${id}/update-article`, data);
  }
}
