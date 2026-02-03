import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceDetailByDepartmentComponent } from './performance-detail-by-department.component';

describe('PerformanceDetailByDepartmentComponent', () => {
  let component: PerformanceDetailByDepartmentComponent;
  let fixture: ComponentFixture<PerformanceDetailByDepartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerformanceDetailByDepartmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformanceDetailByDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
