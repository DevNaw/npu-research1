import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalFundingComponent } from './external-funding.component';

describe('ExternalFundingComponent', () => {
  let component: ExternalFundingComponent;
  let fixture: ComponentFixture<ExternalFundingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExternalFundingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalFundingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
