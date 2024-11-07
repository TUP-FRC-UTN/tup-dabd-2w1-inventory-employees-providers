import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepDetailObservationComponent } from './iep-detail-observation.component';

describe('IepDetailObservationComponent', () => {
  let component: IepDetailObservationComponent;
  let fixture: ComponentFixture<IepDetailObservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepDetailObservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepDetailObservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
