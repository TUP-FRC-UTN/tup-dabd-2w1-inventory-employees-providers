import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseMovementSearchComponent } from './warehouse-movement-search.component';

describe('WarehouseMovementSearchComponent', () => {
  let component: WarehouseMovementSearchComponent;
  let fixture: ComponentFixture<WarehouseMovementSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseMovementSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseMovementSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
