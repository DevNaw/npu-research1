import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { adminGuard } from './core/guards/admin.guard';
import { userGuard } from './core/guards/user.guard';
import { ReportComponent } from './general/report/report.component';
import { EditWorkComponent } from './user-pages/edit-work/edit-work.component';
import { PerformanceByDepartmentComponent } from './general/performance-by-department/performance-by-department.component';
import { PerformanceDetailByDepartmentComponent } from './general/performance-detail-by-department/performance-detail-by-department.component';
import { DashboardComponent } from './admin-pages/dashboard/dashboard.component';
import { PerformancePublicComponent } from './user-pages/performance-public/performance-public.component';
import { ManagementAdminComponent } from './admin-pages/management-admin/management-admin.component';
import { ManagementUserComponent } from './admin-pages/management-user/management-user.component';
import { AdminManualComponent } from './admin-pages/admin-manual/admin-manual.component';
import { ManageProjectComponent } from './admin-pages/manage-project/manage-project.component';
import { OrganizationComponent } from './admin-pages/organization/organization.component';
import { ManageOecdComponent } from './admin-pages/manage-oecd/manage-oecd.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { EditProjectsComponent } from './admin-pages/edit-projects/edit-projects.component';
import { EditArticleComponent } from './admin-pages/edit-article/edit-article.component';
import { EditInnovationComponent } from './admin-pages/edit-innovation/edit-innovation.component';
import { AddProjectComponent } from './admin-pages/add-projects/add-project/add-project.component';
import { AddArticleComponent } from './admin-pages/add-projects/add-article/add-article.component';
import { AddInnovationComponent } from './admin-pages/add-projects/add-innovation/add-innovation.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  /* ================= PUBLIC (ไม่ต้อง login) ================= */
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'test', component: TestComponent },
      { path: 'aticle', component: AticleComponent },
      { path: 'aticle/:id', component: AticleComponent },
      { path: 'download', component: DownloadComponent },
      { path: 'innovation', component: InnovationComponent },
      { path: 'innovation/:id', component: InnovationComponent },
      { path: 'news', component: NewsComponent },
      { path: 'news/:id', component: NewsDetailComponent },
      { path: 'research', component: ResearchComponent },
      { path: 'research/:id', component: ResearchComponent },
      { path: 'report-researcher', component: ReportResearcherTypeComponent },
      { path: 'profile/:id', component: UserProfileComponent },
      { path: 'profile-public/:id', component: DashboardComponent },
      { path: 'performance-by-departmaent/:type', component: PerformanceByDepartmentComponent },
      { path: 'performance-detail-by-departmaent/:type/:id', component: PerformanceDetailByDepartmentComponent },
      {
        path: 'report-institution',
        component: ReportResearcherInstitutionComponent,
      },
      {
        path: 'report-expertise',
        component: ReportResearcherExpertiseComponent,
      },
      {
        path: 'report-researcher-profile',
        component: ReportResearcherProfileComponent,
      },
      { path: 'report-research', component: ReportResearcherResearchComponent },
      { path: 'manual', component: ManualComponent },
      { path: 'performance/:type/:id', component: PerformanceComponent },
      { path: 'performance-public/:type/:id', component: PerformancePublicComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
    ],
  },
  /* ================= USER ================= */
  {
    path: 'user',
    canActivate: [userGuard],
    component: MainComponent,
    children: [
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'add-aticle', component: UserAddAticleComponent },
      { path: 'aticle/:id', component: UserAddAticleComponent },
      { path: 'edit-aticle/:id', component: UserAddAticleComponent },
      { path: 'add-innovation', component: UserAddInnovationComponent },
      { path: 'innovation/:id', component: UserAddInnovationComponent },
      { path: 'edit-innovation/:id', component: UserAddInnovationComponent },
      { path: 'add-research', component: UserAddResearchComponent },
      { path: 'research/:id', component: UserAddResearchComponent },
      { path: 'edit-research/:id', component: UserAddResearchComponent },
      { path: 'research', component: UserResearchComponent },
      { path: 'researchers', component: UserResearchersComponent },
      { path: 'profile', component: UserProfileComponent },
      { path: 'profile/:id', component: UserProfileComponent },
      { path: 'profile-public/:id', component: DashboardComponent },
      { path: 'edit-addres', component: UserEditAddressComponent },
      { path: 'edit-profile', component: UserEditProfileComponent },
      { path: 'edit-study', component: UserEditStudyComponent },
      { path: 'edit-traning', component: UserEditTraningComponent },
      { path: 'performance/:type/:id', component: PerformanceComponent },
      { path: 'performance-public/:type/:id', component: PerformancePublicComponent },
      { path: 'edit-work', component: EditWorkComponent },
      { path: 'performance-by-departmaent/:type', component: PerformanceByDepartmentComponent },
      { path: 'performance-by-departmaent/:type/:id', component: PerformanceDetailByDepartmentComponent },
    ],
  },

  /* ================= ADMIN ================= */
  {
    path: 'admin',
    canActivate: [adminGuard],
    component: MainComponent,
    children: [
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'download', component: AdminDownloadComponent },
      { path: 'external-funding', component: ExternalFundingComponent },
      { path: 'search-research', component: AdminSearchResearcherComponent },
      { path: 'search-paper', component: AdminSearchPaperComponent },
      { path: 'specialization', component: SpecializationComponent },
      { path: 'news', component: AdminNewsComponent },
      { path: 'news/create', component: NewsEditComponent },
      { path: 'news/edit/:id', component: NewsEditComponent },
      { path: 'profile', component: UserProfileComponent },
      { path: 'profile/:id', component: UserProfileComponent },
      { path: 'profile-public/:id', component: DashboardComponent },
      { path: 'edit-profile', component: UserEditProfileComponent },
      { path: 'edit-address', component: UserEditAddressComponent },
      { path: 'edit-study', component: UserEditStudyComponent },
      { path: 'edit-traning', component: UserEditTraningComponent },
      { path: 'add-research', component: UserAddResearchComponent },
      { path: 'research/:id', component: UserAddResearchComponent },
      { path: 'edit-research/:id', component: UserAddResearchComponent },
      { path: 'add-aticle', component: UserAddAticleComponent },
      { path: 'aticle/:id', component: UserAddAticleComponent },
      { path: 'edit-aticle/:id', component: UserAddAticleComponent },
      { path: 'add-innovation', component: UserAddInnovationComponent },
      {
        path: 'innovation/:id',
        component: UserAddInnovationComponent,
      },
      {
        path: 'edit-innovation/:id',
        component: UserAddInnovationComponent,
      },
      { path: 'performance/:type/:id', component: PerformanceComponent },
      { path: 'performance-public/:type/:id', component: PerformancePublicComponent },
      { path: 'report', component: ReportComponent },
      { path: 'edit-work', component: EditWorkComponent },
      { path: 'performance-by-departmaent/:type', component: PerformanceByDepartmentComponent },
      { path: 'performance-by-departmaent/:type/:id', component: PerformanceDetailByDepartmentComponent },
      { path: 'management-user', component: ManagementUserComponent },
      { path: 'management-admin', component: ManagementAdminComponent },
      { path: 'admin-manual', component: AdminManualComponent },
      { path: 'manage-project', component: ManageProjectComponent },
      { path: 'manage-organization', component: OrganizationComponent },
      { path: 'manage-oecd', component: ManageOecdComponent },
      { path: 'edit-projects/:id', component: EditProjectsComponent },
      { path: 'edit-articles/:id', component: EditArticleComponent },
      { path: 'edit-innovations/:id', component: EditInnovationComponent },
      { path: 'project/create', component: AddProjectComponent },
      { path: 'article/create', component: AddArticleComponent },
      { path: 'innovation-create', component: AddInnovationComponent },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
