import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceByDepartmentComponent } from './performance-by-department.component';

describe('PerformanceByDepartmentComponent', () => {
  let component: PerformanceByDepartmentComponent;
  let fixture: ComponentFixture<PerformanceByDepartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerformanceByDepartmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformanceByDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
