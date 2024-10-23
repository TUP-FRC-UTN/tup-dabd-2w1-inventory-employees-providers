import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepCargoPutComponent } from './iep-cargo-put.component';

describe('IepCargoPutComponent', () => {
  let component: IepCargoPutComponent;
  let fixture: ComponentFixture<IepCargoPutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepCargoPutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepCargoPutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
