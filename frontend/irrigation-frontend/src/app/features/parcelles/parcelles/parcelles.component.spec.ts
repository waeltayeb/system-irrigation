import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParcellesComponent } from './parcelles.component';

describe('ParcellesComponent', () => {
  let component: ParcellesComponent;
  let fixture: ComponentFixture<ParcellesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParcellesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParcellesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
