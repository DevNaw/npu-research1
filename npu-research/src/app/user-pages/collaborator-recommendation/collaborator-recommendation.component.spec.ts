import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaboratorRecommendationComponent } from './collaborator-recommendation.component';

describe('CollaboratorRecommendationComponent', () => {
  let component: CollaboratorRecommendationComponent;
  let fixture: ComponentFixture<CollaboratorRecommendationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollaboratorRecommendationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollaboratorRecommendationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
