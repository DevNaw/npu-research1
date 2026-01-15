import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSearchResearcherComponent } from './admin-search-researcher.component';

describe('AdminSearchResearcherComponent', () => {
  let component: AdminSearchResearcherComponent;
  let fixture: ComponentFixture<AdminSearchResearcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminSearchResearcherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSearchResearcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
