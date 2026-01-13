import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Capteurs } from './capteurs';

describe('Capteurs', () => {
  let component: Capteurs;
  let fixture: ComponentFixture<Capteurs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Capteurs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Capteurs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
