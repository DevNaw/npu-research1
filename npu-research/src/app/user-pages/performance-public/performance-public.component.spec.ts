import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformancePublicComponent } from './performance-public.component';

describe('PerformancePublicComponent', () => {
  let component: PerformancePublicComponent;
  let fixture: ComponentFixture<PerformancePublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerformancePublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformancePublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
