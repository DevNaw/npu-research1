import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInnovationComponent } from './add-innovation.component';

describe('AddInnovationComponent', () => {
  let component: AddInnovationComponent;
  let fixture: ComponentFixture<AddInnovationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddInnovationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInnovationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
