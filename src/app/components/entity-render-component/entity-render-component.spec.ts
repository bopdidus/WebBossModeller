import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityRenderComponent } from './entity-render-component';

describe('EntityRenderComponent', () => {
  let component: EntityRenderComponent;
  let fixture: ComponentFixture<EntityRenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityRenderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
