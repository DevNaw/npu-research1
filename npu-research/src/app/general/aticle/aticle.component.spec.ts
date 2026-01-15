import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AticleComponent } from './aticle.component';

describe('AticleComponent', () => {
  let component: AticleComponent;
  let fixture: ComponentFixture<AticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AticleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
