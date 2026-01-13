import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCapteurComponent } from './create-capteur.component';

describe('CreateCapteurComponent', () => {
  let component: CreateCapteurComponent;
  let fixture: ComponentFixture<CreateCapteurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCapteurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCapteurComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
