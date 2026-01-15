import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportResearcherTypeComponent } from './report-researcher-type.component';

describe('ReportResearcherTypeComponent', () => {
  let component: ReportResearcherTypeComponent;
  let fixture: ComponentFixture<ReportResearcherTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportResearcherTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportResearcherTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
