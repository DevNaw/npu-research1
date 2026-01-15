import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportResearcherResearchComponent } from './report-researcher-research.component';

describe('ReportResearcherResearchComponent', () => {
  let component: ReportResearcherResearchComponent;
  let fixture: ComponentFixture<ReportResearcherResearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportResearcherResearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportResearcherResearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
