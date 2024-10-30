import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpPutEmployeesComponent } from './emp-put-employees.component';

describe('EmpPutEmployeesComponent', () => {
  let component: EmpPutEmployeesComponent;
  let fixture: ComponentFixture<EmpPutEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpPutEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpPutEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
