import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAddResearchComponent } from './user-add-research.component';

describe('UserAddResearchComponent', () => {
  let component: UserAddResearchComponent;
  let fixture: ComponentFixture<UserAddResearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserAddResearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAddResearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
