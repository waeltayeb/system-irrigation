import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Irrigation } from './irrigation';

describe('Irrigation', () => {
  let component: Irrigation;
  let fixture: ComponentFixture<Irrigation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Irrigation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Irrigation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
