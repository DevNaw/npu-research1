import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportResearcherInstitutionComponent } from './report-researcher-institution.component';

describe('ReportResearcherInstitutionComponent', () => {
  let component: ReportResearcherInstitutionComponent;
  let fixture: ComponentFixture<ReportResearcherInstitutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportResearcherInstitutionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportResearcherInstitutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
