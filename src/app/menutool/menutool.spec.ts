import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Menutool } from './menutool';

describe('Menutool', () => {
  let component: Menutool;
  let fixture: ComponentFixture<Menutool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menutool]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Menutool);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
