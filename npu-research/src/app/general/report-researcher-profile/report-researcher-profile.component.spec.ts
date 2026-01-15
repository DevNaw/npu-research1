import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportResearcherProfileComponent } from './report-researcher-profile.component';

describe('ReportResearcherProfileComponent', () => {
  let component: ReportResearcherProfileComponent;
  let fixture: ComponentFixture<ReportResearcherProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportResearcherProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportResearcherProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
