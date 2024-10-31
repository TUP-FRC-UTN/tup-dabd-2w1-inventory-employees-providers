import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpListadoEmpleadosComponent } from './emp-listado-empleados.component';

describe('EmpListadoEmpleadosComponent', () => {
  let component: EmpListadoEmpleadosComponent;
  let fixture: ComponentFixture<EmpListadoEmpleadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpListadoEmpleadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpListadoEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
