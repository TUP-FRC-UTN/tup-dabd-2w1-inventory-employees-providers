import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepProductListComponent } from './iep-product-list.component';

describe('IepProductListComponent', () => {
  let component: IepProductListComponent;
  let fixture: ComponentFixture<IepProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepProductListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
