import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageGrantsComponent } from './manage-grants.component';

describe('ManageGrantsComponent', () => {
  let component: ManageGrantsComponent;
  let fixture: ComponentFixture<ManageGrantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageGrantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageGrantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
