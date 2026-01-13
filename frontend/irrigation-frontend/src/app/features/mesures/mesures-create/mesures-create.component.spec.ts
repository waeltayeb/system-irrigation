import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesuresCreateComponent } from './mesures-create.component';

describe('MesuresCreateComponent', () => {
  let component: MesuresCreateComponent;
  let fixture: ComponentFixture<MesuresCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesuresCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesuresCreateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
