import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAumentoComponent } from './stock-aumento.component';

describe('StockAumentoComponent', () => {
  let component: StockAumentoComponent;
  let fixture: ComponentFixture<StockAumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockAumentoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockAumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
