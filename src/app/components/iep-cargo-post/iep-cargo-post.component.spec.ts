import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepCargoPostComponent } from './iep-cargo-post.component';

describe('IepCargoPostComponent', () => {
  let component: IepCargoPostComponent;
  let fixture: ComponentFixture<IepCargoPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepCargoPostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepCargoPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
