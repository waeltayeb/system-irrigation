import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateParcelleComponent } from './create-parcelle.component';

describe('CreateParcelleComponent', () => {
  let component: CreateParcelleComponent;
  let fixture: ComponentFixture<CreateParcelleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateParcelleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateParcelleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
