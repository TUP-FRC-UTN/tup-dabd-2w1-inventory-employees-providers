import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormLlamadoAtencionComponent } from './form-llamado-atencion.component';

describe('FormLlamadoAtencionComponent', () => {
  let component: FormLlamadoAtencionComponent;
  let fixture: ComponentFixture<FormLlamadoAtencionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormLlamadoAtencionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormLlamadoAtencionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
