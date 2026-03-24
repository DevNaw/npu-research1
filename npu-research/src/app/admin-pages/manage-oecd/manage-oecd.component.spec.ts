import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageOecdComponent } from './manage-oecd.component';

describe('ManageOecdComponent', () => {
  let component: ManageOecdComponent;
  let fixture: ComponentFixture<ManageOecdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageOecdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageOecdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
