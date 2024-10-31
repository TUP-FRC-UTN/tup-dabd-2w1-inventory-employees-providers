import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSelectComponent } from './modal-select.component';

describe('ModalSelectComponent', () => {
  let component: ModalSelectComponent;
  let fixture: ComponentFixture<ModalSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
