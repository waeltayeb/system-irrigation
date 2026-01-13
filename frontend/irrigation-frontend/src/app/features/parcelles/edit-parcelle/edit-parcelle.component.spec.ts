import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditParcelleComponent } from './edit-parcelle.component';

describe('EditParcelleComponent', () => {
  let component: EditParcelleComponent;
  let fixture: ComponentFixture<EditParcelleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditParcelleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditParcelleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
