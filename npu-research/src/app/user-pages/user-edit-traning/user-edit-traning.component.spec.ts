import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEditTraningComponent } from './user-edit-traning.component';

describe('UserEditTraningComponent', () => {
  let component: UserEditTraningComponent;
  let fixture: ComponentFixture<UserEditTraningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserEditTraningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEditTraningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
