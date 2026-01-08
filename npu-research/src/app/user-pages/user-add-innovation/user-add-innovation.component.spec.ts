import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAddInnovationComponent } from './user-add-innovation.component';

describe('UserAddInnovationComponent', () => {
  let component: UserAddInnovationComponent;
  let fixture: ComponentFixture<UserAddInnovationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserAddInnovationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAddInnovationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
