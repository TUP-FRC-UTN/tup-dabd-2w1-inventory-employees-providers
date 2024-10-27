import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepCargosComponent } from './iep-cargos.component';

describe('IepCargosComponent', () => {
  let component: IepCargosComponent;
  let fixture: ComponentFixture<IepCargosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepCargosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepCargosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
