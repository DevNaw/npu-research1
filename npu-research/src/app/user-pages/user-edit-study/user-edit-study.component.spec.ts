import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEditStudyComponent } from './user-edit-study.component';

describe('UserEditStudyComponent', () => {
  let component: UserEditStudyComponent;
  let fixture: ComponentFixture<UserEditStudyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserEditStudyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEditStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
