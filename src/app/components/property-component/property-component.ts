import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTable, MatTableModule} from '@angular/material/table';
import { CommonModule } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Entity } from '../../core/models/entity.model';
import { DiagramService } from '../../core/services/diagram.service';
import { Attribute } from '../../core/models/attribute.model';
import { Relationship } from '../../core/models/relationship.model';



@Component({
  selector: 'app-property',
  imports: [
    MatExpansionModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    CommonModule,
    MatIconModule,
    FormsModule
  ],
  standalone: true,
  templateUrl: './property-component.html',
  styleUrl: './property-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyComponent implements OnInit, OnDestroy{

  private readonly cdr = inject(ChangeDetectorRef)
   private destroy$ = new Subject<void>();
  selectedEntity: Entity | null = null;
  selectedRelationship: Relationship | null = null;
  availableEntities: Entity[] = [];

  constructor(private diagramService: DiagramService) {}

  ngOnInit(): void {
    this.diagramService.selectedEntity$
      .pipe(takeUntil(this.destroy$))
      .subscribe(entity => {
        this.selectedEntity = entity;
        this.cdr.markForCheck()
      });

    this.diagramService.selectedRelationship$
      .pipe(takeUntil(this.destroy$))
      .subscribe(relationship => {
        this.selectedRelationship = relationship;
        this.cdr.markForCheck()
      });

    this.diagramService.diagram$
      .pipe(takeUntil(this.destroy$))
      .subscribe(diagram => {
        this.availableEntities = diagram.entities;
        this.cdr.markForCheck()
      });
      this.cdr.markForCheck()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateEntity(): void {
    if (this.selectedEntity) {
      this.diagramService.updateEntity(this.selectedEntity.id, {
        name: this.selectedEntity.name,
        color: this.selectedEntity.color,
        attributes: this.selectedEntity.attributes
      });
    }
  }

  addAttribute(): void {
    if (this.selectedEntity) {
      this.diagramService.addAttribute(this.selectedEntity.id);
    }
  }

  deleteAttribute(attributeId: string): void {
    if (this.selectedEntity) {
      const updatedAttributes = this.selectedEntity.attributes.filter(
        attr => attr.id !== attributeId
      );
      this.selectedEntity.attributes = updatedAttributes;
      this.updateEntity();
    }
  }

  trackByAttrId(index: number, attr: Attribute): string {
    return attr.id;
  }

  updateRelationship(): void {
    if (this.selectedRelationship) {
      this.diagramService.updateRelationship(this.selectedRelationship.id, {
        name: this.selectedRelationship.name,
        fromEntityId: this.selectedRelationship.fromEntityId,
        toEntityId: this.selectedRelationship.toEntityId,
        type: this.selectedRelationship.type,
        fromCardinality: this.selectedRelationship.fromCardinality,
        toCardinality: this.selectedRelationship.toCardinality
      });
    }
  }

  onRelationshipTypeChange(): void {
    if (this.selectedRelationship) {
      // Auto-update cardinalities based on relationship type
      switch (this.selectedRelationship.type) {
        case 'one-to-one':
          this.selectedRelationship.fromCardinality = 'one';
          this.selectedRelationship.toCardinality = 'one';
          break;
        case 'one-to-many':
          this.selectedRelationship.fromCardinality = 'one';
          this.selectedRelationship.toCardinality = 'one-or-many';
          break;
        case 'many-to-many':
          this.selectedRelationship.fromCardinality = 'one-or-many';
          this.selectedRelationship.toCardinality = 'one-or-many';
          break;
      }
      this.updateRelationship();
    }
  }

  deleteRelationship(): void {
    if (this.selectedRelationship && confirm('Are you sure you want to delete this relationship?')) {
      this.diagramService.deleteRelationship(this.selectedRelationship.id);
    }
  }  
}
