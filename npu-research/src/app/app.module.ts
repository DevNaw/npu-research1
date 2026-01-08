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
import { NgApexchartsModule } from "ng-apexcharts";
import { TestComponent } from './test/test.component';
import { UserDashboardComponent } from './user-pages/dashboard/dashboard.component';
import { UserAddResearchComponent } from './user-pages/user-add-research/user-add-research.component';
import { UserAddAticleComponent } from './user-pages/user-add-aticle/user-add-aticle.component';
import { UserAddInnovationComponent } from './user-pages/user-add-innovation/user-add-innovation.component';
import { FormsModule } from '@angular/forms';
import { UserResearchComponent } from './user-pages/user-research/user-research.component';
import { UserResearchersComponent } from './user-pages/user-researchers/user-researchers.component';

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgApexchartsModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
