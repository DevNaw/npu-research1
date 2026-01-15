import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportResearcherExpertiseComponent } from './report-researcher-expertise.component';

describe('ReportResearcherExpertiseComponent', () => {
  let component: ReportResearcherExpertiseComponent;
  let fixture: ComponentFixture<ReportResearcherExpertiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportResearcherExpertiseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportResearcherExpertiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
