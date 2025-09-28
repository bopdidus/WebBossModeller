import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideTree } from './side-tree';

describe('SideTree', () => {
  let component: SideTree;
  let fixture: ComponentFixture<SideTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideTree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
