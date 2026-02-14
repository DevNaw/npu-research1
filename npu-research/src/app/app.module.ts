import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './admin-pages/dashboard/dashboard.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { MainComponent } from './shared/layouts/main/main.component';
import { LoginComponent } from './user-pages/login/login.component';
import { RegisterComponent } from './user-pages/register/register.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TestComponent } from './test/test.component';
import { UserDashboardComponent } from './user-pages/dashboard/dashboard.component';
import { UserAddResearchComponent } from './user-pages/user-add-research/user-add-research.component';
import { UserAddAticleComponent } from './user-pages/user-add-aticle/user-add-aticle.component';
import { UserAddInnovationComponent } from './user-pages/user-add-innovation/user-add-innovation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserResearchComponent } from './user-pages/user-research/user-research.component';
import { UserResearchersComponent } from './user-pages/user-researchers/user-researchers.component';
import { UserProfileComponent } from './user-pages/user-profile/user-profile.component';
import { UserEditProfileComponent } from './user-pages/user-edit-profile/user-edit-profile.component';
import { UserEditStudyComponent } from './user-pages/user-edit-study/user-edit-study.component';
import { UserEditTraningComponent } from './user-pages/user-edit-traning/user-edit-traning.component';
import { UserEditAddressComponent } from './user-pages/user-edit-address/user-edit-address.component';
import { ResearchComponent } from './general/research/research.component';
import { AticleComponent } from './general/aticle/aticle.component';
import { InnovationComponent } from './general/innovation/innovation.component';
import { NewsComponent } from './general/news/news.component';
import { DownloadComponent } from './general/download/download.component';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReportComponent } from './general/report/report.component';
import { EditWorkComponent } from './user-pages/edit-work/edit-work.component';
import { NgxEditorModule } from 'ngx-editor';
import { PerformanceByDepartmentComponent } from './general/performance-by-department/performance-by-department.component';
import { PerformanceDetailByDepartmentComponent } from './general/performance-detail-by-department/performance-detail-by-department.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    FooterComponent,
    NavbarComponent,
    MainComponent,
    LoginComponent,
    RegisterComponent,
    TestComponent,
    UserDashboardComponent,
    UserAddResearchComponent,
    UserAddAticleComponent,
    UserAddInnovationComponent,
    UserResearchComponent,
    UserResearchersComponent,
    UserProfileComponent,
    UserEditProfileComponent,
    UserEditStudyComponent,
    UserEditTraningComponent,
    UserEditAddressComponent,
    ResearchComponent,
    AticleComponent,
    InnovationComponent,
    NewsComponent,
    DownloadComponent,
    NewsDetailComponent,
    ReportResearcherTypeComponent,
    ReportResearcherInstitutionComponent,
    ReportResearcherExpertiseComponent,
    ReportResearcherProfileComponent,
    ReportResearcherResearchComponent,
    ManualComponent,
    ExternalFundingComponent,
    SpecializationComponent,
    AdminNewsComponent,
    AdminDownloadComponent,
    AdminSearchResearcherComponent,
    AdminSearchPaperComponent,
    NewsEditComponent,
    PerformanceComponent,
    ReportComponent,
    EditWorkComponent,
    PerformanceByDepartmentComponent,
    PerformanceDetailByDepartmentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgApexchartsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    AppRoutingModule,
    NgxEditorModule,
    HttpClientModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
