import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Entity, Point } from '../../core/models/entity.model';
import { DiagramService } from '../../core/services/diagram.service';
import { CommonModule } from '@angular/common';
import { Relationship } from '../../core/models/relationship.model';

@Component({
  selector: 'app-canvas',
  imports: [CommonModule],
  templateUrl: './canvas-component.html',
  styleUrl: './canvas-component.scss'
})
export class CanvasComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasSvg') canvasSvg!: ElementRef<SVGElement>;
  
  private destroy$ = new Subject<void>();
  entities: Entity[] = [];
  relationships: Relationship[] = [];
  relationshipMode: any = { isActive: false, fromEntityId: null, relationshipType: null };
  
  private isDragging = false;
  private dragEntity: Entity | null = null;
  private dragOffset: Point = { x: 0, y: 0 };

  constructor(private diagramService: DiagramService) {}

  ngOnInit(): void {
    this.diagramService.diagram$
      .pipe(takeUntil(this.destroy$))
      .subscribe(diagram => {
        this.entities = diagram.entities;
        this.relationships = diagram.relationships;
      });

    this.diagramService.relationshipMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(mode => {
        this.relationshipMode = mode;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCanvasClick(event: MouseEvent): void {
    // Check if click is on canvas background (not on an entity)
    const target = event.target as Element;
    if (target === this.canvasContainer.nativeElement || 
        target.classList.contains('canvas-grid') ||
        target.classList.contains('canvas-svg') ||
        target.tagName === 'svg' ||
        target.tagName === 'rect' ||
        target.tagName === 'path') {
      
      const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
      const point: Point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      const selectedTool = this.diagramService.getSelectedTool();
      
      // Handle tool-based creation
      if (selectedTool === 'entity') {
        this.diagramService.addEntity(point, 'entity');
        this.diagramService.setSelectedTool('select'); // Switch back to select mode
        console.log('Regular entity created at:', point);
      } else if (selectedTool === 'weak-entity') {
        this.diagramService.addEntity(point, 'weak-entity');
        this.diagramService.setSelectedTool('select'); // Switch back to select mode
        console.log('Weak entity created at:', point);
      } else if (selectedTool === 'select') {
        // Double-click in select mode creates entity (fallback)
        if (event.detail === 2) {
          this.diagramService.addEntity(point, 'entity');
          console.log('Entity created via double-click at:', point);
        } else {
          this.diagramService.clearSelection();
        }
      }
    }
  }

  onEntityClick(entity: Entity, event: MouseEvent): void {
    event.stopPropagation();
    
    // Check if we're in relationship mode
    if (this.relationshipMode.isActive) {
      const handled = this.diagramService.handleEntityClickForRelationship(entity.id);
      if (handled) {
        return; // Don't select the entity if we're creating a relationship
      }
    }
    
    this.diagramService.selectEntity(entity.id);
  }

  onEntityMouseDown(entity: Entity, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.isDragging = true;
    this.dragEntity = entity;
    
    const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
    this.dragOffset = {
      x: event.clientX - rect.left - entity.position.x,
      y: event.clientY - rect.top - entity.position.y
    };

    const onMouseMove = (e: MouseEvent) => {
      if (this.isDragging && this.dragEntity) {
        const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
        const newPosition: Point = {
          x: Math.max(0, e.clientX - rect.left - this.dragOffset.x),
          y: Math.max(0, e.clientY - rect.top - this.dragOffset.y)
        };
        
        this.diagramService.updateEntity(this.dragEntity.id, { position: newPosition });
      }
    };

    const onMouseUp = () => {
      this.isDragging = false;
      this.dragEntity = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  getEntityById(id: string): Entity | undefined {
    return this.entities.find(entity => entity.id === id);
  }

  onRelationshipClick(relationship: Relationship, event: MouseEvent): void {
    event.stopPropagation();
    this.diagramService.selectRelationship(relationship.id);
  }

  getCrowsFootTransform(entity: Entity, otherEntity: Entity, side: 'from' | 'to'): string {
    const centerX = entity.position.x + entity.size.width / 2;
    const centerY = entity.position.y + entity.size.height / 2;
    const otherCenterX = otherEntity.position.x + otherEntity.size.width / 2;
    const otherCenterY = otherEntity.position.y + otherEntity.size.height / 2;
    
    // Calculate angle for rotation
    const angle = Math.atan2(otherCenterY - centerY, otherCenterX - centerX) * 180 / Math.PI;
    
    // Calculate connection point on entity edge
    const dx = otherCenterX - centerX;
    const dy = otherCenterY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize and scale to entity edge
    const edgeX = centerX + (dx / distance) * (entity.size.width / 2);
    const edgeY = centerY + (dy / distance) * (entity.size.height / 2);
    
    return `translate(${edgeX}, ${edgeY}) rotate(${angle})`;
  }

  getMarkerStart(type: string): string {
        switch (type) {
          case 'one-to-one': return 'url(#crow-one)';
          case 'one-to-many': return 'url(#crow-one)';
          case '0-1': return 'url(#crow-zero)';
          case 'many-to-many': return 'url(#crow-zero)';
          default: return '';
        }
  }

getMarkerEnd(type: string): string {
    switch (type) {
      case 'one-to-one': return 'url(#crow-one)';
      case 'one-to-many': return 'url(#crow-many)';
      case '0-1': return 'url(#crow-one)';
      case 'many-to-many': return 'url(#crow-many)';
      default: return '';
    }
  }

}