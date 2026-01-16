import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { MainComponent } from './shared/layouts/main/main.component';
import { LoginComponent } from './user-pages/login/login.component';
import { RegisterComponent } from './user-pages/register/register.component';
import { TestComponent } from './test/test.component';
import { UserDashboardComponent } from './user-pages/dashboard/dashboard.component';
import { UserAddAticleComponent } from './user-pages/user-add-aticle/user-add-aticle.component';
import { UserAddInnovationComponent } from './user-pages/user-add-innovation/user-add-innovation.component';
import { UserAddResearchComponent } from './user-pages/user-add-research/user-add-research.component';
import { UserResearchComponent } from './user-pages/user-research/user-research.component';
import { UserResearchersComponent } from './user-pages/user-researchers/user-researchers.component';
import { UserProfileComponent } from './user-pages/user-profile/user-profile.component';
import { UserEditAddressComponent } from './user-pages/user-edit-address/user-edit-address.component';
import { UserEditProfileComponent } from './user-pages/user-edit-profile/user-edit-profile.component';
import { UserEditStudyComponent } from './user-pages/user-edit-study/user-edit-study.component';
import { UserEditTraningComponent } from './user-pages/user-edit-traning/user-edit-traning.component';
import { AticleComponent } from './general/aticle/aticle.component';
import { DownloadComponent } from './general/download/download.component';
import { InnovationComponent } from './general/innovation/innovation.component';
import { NewsComponent } from './general/news/news.component';
import { ResearchComponent } from './general/research/research.component';
import { NewsDetailComponent } from './general/news-detail/news-detail.component';
import { ReportResearcherTypeComponent } from './general/report-researcher-type/report-researcher-type.component';
import { ReportResearcherInstitutionComponent } from './general/report-researcher-institution/report-researcher-institution.component';
import { ReportResearcherExpertiseComponent } from './general/report-researcher-expertise/report-researcher-expertise.component';
import { ReportResearcherProfileComponent } from './general/report-researcher-profile/report-researcher-profile.component';
import { ReportResearcherResearchComponent } from './general/report-researcher-research/report-researcher-research.component';
import { ManualComponent } from './general/manual/manual.component';
import { ExternalFundingComponent } from './admin-pages/external-funding/external-funding.component';
import { SpecializationComponent } from './admin-pages/specialization/specialization.component';
import { AdminNewsComponent } from './admin-pages/admin-news/admin-news.component';
import { AdminDownloadComponent } from './admin-pages/admin-download/admin-download.component';
import { AdminSearchResearcherComponent } from './admin-pages/admin-search-researcher/admin-search-researcher.component';
import { AdminSearchPaperComponent } from './admin-pages/admin-search-paper/admin-search-paper.component';
import { NewsEditComponent } from './admin-pages/news-edit/news-edit.component';
import { PerformanceComponent } from './user-pages/performance/performance.component';

const routes: Routes = [
  { path: '', component: NavbarComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'main', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'test', component: TestComponent },
  { path: 'dashboard', component: UserDashboardComponent },
  { path: 'user-add-aticle', component: UserAddAticleComponent },
  { path: 'user-add-aticle/:id', component: UserAddAticleComponent },
  { path: 'user-add-innovation', component: UserAddInnovationComponent },
  { path: 'user-add-innovation/:id', component: UserAddInnovationComponent },
  { path: 'user-add-research', component: UserAddResearchComponent },
  { path: 'user-add-research/:id', component: UserAddResearchComponent },
  { path: 'user-research', component: UserResearchComponent },
  { path: 'user-researchers', component: UserResearchersComponent },
  { path: 'user-profile', component: UserProfileComponent },
  { path: 'user-edit-address', component: UserEditAddressComponent },
  { path: 'user-edit-profile', component: UserEditProfileComponent },
  { path: 'user-edit-study', component: UserEditStudyComponent },
  { path: 'user-edit-traning', component: UserEditTraningComponent },
  { path: 'performance/:type/:id', component: PerformanceComponent },

  // General
  { path: 'aticle', component: AticleComponent },
  { path: 'download', component: DownloadComponent },
  { path: 'innovation', component: InnovationComponent },
  { path: 'news', component: NewsComponent },
  { path: 'research', component: ResearchComponent },
  { path: 'news/:id', component: NewsDetailComponent },
  { path: 'report-researcher', component: ReportResearcherTypeComponent },
  { path: 'report-institution', component: ReportResearcherInstitutionComponent },
  { path: 'report-expertise', component: ReportResearcherExpertiseComponent},
  { path: 'report-researcher-profile', component: ReportResearcherProfileComponent },
  { path: 'report-research', component: ReportResearcherResearchComponent },
  { path: 'manual', component: ManualComponent },

  // Admin Path
  { path: 'admin-news', component: AdminNewsComponent },
  { path: 'admin-download', component: AdminDownloadComponent },
  { path: 'admin-search-research', component: AdminSearchResearcherComponent },
  { path: 'admin-search-paper', component: AdminSearchPaperComponent },
  { path: 'external-funding', component: ExternalFundingComponent },
  { path: 'specialization', component: SpecializationComponent },
  { path: 'admin-news/create', component: NewsEditComponent },
  { path: 'admin-news/edit/:id', component: NewsEditComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
