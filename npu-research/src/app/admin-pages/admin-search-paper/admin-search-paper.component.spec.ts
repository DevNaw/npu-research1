import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSearchPaperComponent } from './admin-search-paper.component';

describe('AdminSearchPaperComponent', () => {
  let component: AdminSearchPaperComponent;
  let fixture: ComponentFixture<AdminSearchPaperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminSearchPaperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSearchPaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
