import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliersFormComponent } from './suppliers-form.component';

describe('SuppliersFormComponent', () => {
  let component: SuppliersFormComponent;
  let fixture: ComponentFixture<SuppliersFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliersFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuppliersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
