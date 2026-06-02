import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllResearcherComponent } from './all-researcher.component';

describe('AllResearcherComponent', () => {
  let component: AllResearcherComponent;
  let fixture: ComponentFixture<AllResearcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllResearcherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllResearcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
