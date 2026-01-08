import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserResearchersComponent } from './user-researchers.component';

describe('UserResearchersComponent', () => {
  let component: UserResearchersComponent;
  let fixture: ComponentFixture<UserResearchersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserResearchersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserResearchersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
