import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrantFundersComponent } from './grant-funders.component';

describe('GrantFundersComponent', () => {
  let component: GrantFundersComponent;
  let fixture: ComponentFixture<GrantFundersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GrantFundersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrantFundersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
