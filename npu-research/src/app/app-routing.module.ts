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

const routes: Routes = [
  { path: '', component: NavbarComponent },
  { path: 'footer', component: FooterComponent },
  { path: 'main', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'test', component: TestComponent },
  { path: 'dashboard', component: UserDashboardComponent },
  { path: 'user-add-aticle', component: UserAddAticleComponent },
  { path: 'user-add-innovation', component: UserAddInnovationComponent },
  { path: 'user-add-research', component: UserAddResearchComponent },
  { path: 'user-research', component: UserResearchComponent },
  { path: 'user-researchers', component: UserResearchersComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
