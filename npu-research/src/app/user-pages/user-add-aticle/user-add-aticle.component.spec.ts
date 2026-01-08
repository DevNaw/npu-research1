import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAddAticleComponent } from './user-add-aticle.component';

describe('UserAddAticleComponent', () => {
  let component: UserAddAticleComponent;
  let fixture: ComponentFixture<UserAddAticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserAddAticleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAddAticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
