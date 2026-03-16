import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManualComponent } from './admin-manual.component';

describe('AdminManualComponent', () => {
  let component: AdminManualComponent;
  let fixture: ComponentFixture<AdminManualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminManualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
