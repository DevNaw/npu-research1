import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditInnovationComponent } from './edit-innovation.component';

describe('EditInnovationComponent', () => {
  let component: EditInnovationComponent;
  let fixture: ComponentFixture<EditInnovationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditInnovationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditInnovationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
