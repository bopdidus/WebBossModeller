import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DiagramData } from '../models/diagram.model';
import { Entity, Point } from '../models/entity.model';
import { Relationship } from '../models/relationship.model';
import { Attribute } from '../models/attribute.model';


@Injectable({
  providedIn: 'root'
})
export class DiagramService {

    private diagramSubject = new BehaviorSubject<DiagramData>({
    entities: [],
    relationships: [],
    metadata: {
      name: 'Untitled Diagram',
      created: new Date(),
      modified: new Date(),
      version: '1.0.0'
    }
  });

  private selectedEntitySubject = new BehaviorSubject<Entity | null>(null);
  selectedRelationshipSubject = new BehaviorSubject<Relationship | null>(null);
  private selectedToolSubject = new BehaviorSubject<string>('select');
  private relationshipModeSubject = new BehaviorSubject<{
    isActive: boolean;
    fromEntityId: string | null;
    relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many' | null;
  }>({
    isActive: false,
    fromEntityId: null,
    relationshipType: null
  });

  diagram$ = this.diagramSubject.asObservable();
  selectedEntity$ = this.selectedEntitySubject.asObservable();
  selectedRelationship$ = this.selectedRelationshipSubject.asObservable();
  selectedTool$ = this.selectedToolSubject.asObservable();
  relationshipMode$ = this.relationshipModeSubject.asObservable();

  addEntity(position: Point, entityType: string = 'entity'): Entity {
    const isWeakEntity = entityType === 'weak-entity';
    const newEntity: Entity = {
      id: this.generateId(),
      name: isWeakEntity ? 'WeakEntity' : 'NewEntity',
      position,
      size: { width: 150, height: 100 },
      attributes: [
        {
          id: this.generateId(),
          name: 'id',
          type: 'int',
          isPrimaryKey: true,
          isUnique:false,
          isForeignKey: false,
          isNullable: false
        }
      ],
      color: isWeakEntity ? '#f59e0b' : '#3b82f6',
      isSelected: false
    };

    const currentDiagram = this.diagramSubject.value;
    const updatedEntities = [...currentDiagram.entities, newEntity];
    
    this.updateDiagram({
      ...currentDiagram,
      entities: updatedEntities,
      metadata: {
        ...currentDiagram.metadata,
        modified: new Date()
      }
    });

    console.log('Entity added to diagram:', newEntity);
    return newEntity;
  }

  setSelectedTool(toolId: string): void {
    this.selectedToolSubject.next(toolId);
  }

  getSelectedTool(): string {
    return this.selectedToolSubject.value;
  }

  selectEntity(entityId: string): void {
    const currentDiagram = this.diagramSubject.value;
    const updatedEntities = currentDiagram.entities.map(entity => ({
      ...entity,
      isSelected: entity.id === entityId
    }));

    this.updateDiagram({
      ...currentDiagram,
      entities: updatedEntities
    });

    const selectedEntity = updatedEntities.find(e => e.id === entityId) || null;
    this.selectedEntitySubject.next(selectedEntity);
  }

  updateEntity(entityId: string, updates: Partial<Entity>): void {
    const currentDiagram = this.diagramSubject.value;
    const updatedEntities = currentDiagram.entities.map(entity =>
      entity.id === entityId ? { ...entity, ...updates } : entity
    );

    this.updateDiagram({
      ...currentDiagram,
      entities: updatedEntities,
      metadata: {
        ...currentDiagram.metadata,
        modified: new Date()
      }
    });

    if (updates.isSelected !== undefined) {
      const selectedEntity = updatedEntities.find(e => e.isSelected) || null;
      this.selectedEntitySubject.next(selectedEntity);
    }
  }

  deleteEntity(entityId: string): void {
    const currentDiagram = this.diagramSubject.value;
    const updatedEntities = currentDiagram.entities.filter(entity => entity.id !== entityId);
    const updatedRelationships = currentDiagram.relationships.filter(
      rel => rel.fromEntityId !== entityId && rel.toEntityId !== entityId
    );

    this.updateDiagram({
      ...currentDiagram,
      entities: updatedEntities,
      relationships: updatedRelationships,
      metadata: {
        ...currentDiagram.metadata,
        modified: new Date()
      }
    });

    this.selectedEntitySubject.next(null);
  }

  addAttribute(entityId: string): void {
    const currentDiagram = this.diagramSubject.value;
    const entity = currentDiagram.entities.find(e => e.id === entityId);
    
    if (!entity) return;

    const newAttribute: Attribute = {
      id: this.generateId(),
      name: 'attribute',
      type: 'varchar',
      isPrimaryKey: false,
      isUnique: false,
      isForeignKey: false,
      isNullable: true
    };

    const updatedEntity = {
      ...entity,
      attributes: [...entity.attributes, newAttribute]
    };

    this.updateEntity(entityId, updatedEntity);
  }

  addRelationship(fromEntityId: string, toEntityId: string, type: 'one-to-one' | 'one-to-many' | 'many-to-many'): void {
    const currentDiagram = this.diagramSubject.value;
    
    const newRelationship: Relationship = {
      id: this.generateId(),
      name: 'relationship',
      fromEntityId,
      toEntityId,
      type,
      fromCardinality: type === 'one-to-one' ? 'one' : type === 'one-to-many' ? 'one' : 'one-or-many',
      toCardinality: type === 'one-to-one' ? 'one' : type === 'one-to-many' ? 'one-or-many' : 'one-or-many',
      isSelected: false,
      fromOptional: false,
      toOptional: false
    };

    const updatedRelationships = [...currentDiagram.relationships, newRelationship];
    
    this.updateDiagram({
      ...currentDiagram,
      relationships: updatedRelationships,
      metadata: {
        ...currentDiagram.metadata,
        modified: new Date()
      }
    });

    console.log('Relationship created:', newRelationship);
  }

  startRelationshipMode(relationshipType: string): void {
    const validTypes: ('one-to-one' | 'one-to-many' | 'many-to-many')[] = ['one-to-one', 'one-to-many', 'many-to-many'];
    const type = validTypes.includes(relationshipType as any) ? relationshipType as 'one-to-one' | 'one-to-many' | 'many-to-many' : null;
    
    this.relationshipModeSubject.next({
      isActive: true,
      fromEntityId: null,
      relationshipType: type
    });
    console.log('Relationship mode started:', type);
  }

  handleEntityClickForRelationship(entityId: string): boolean {
    const currentMode = this.relationshipModeSubject.value;
    
    if (!currentMode.isActive || !currentMode.relationshipType) {
      return false;
    }

    if (!currentMode.fromEntityId) {
      // First entity selection
      this.relationshipModeSubject.next({
        ...currentMode,
        fromEntityId: entityId
      });
      console.log('First entity selected for relationship:', entityId);
      return true;
    } else {
      // Second entity selection - create relationship
      if (currentMode.fromEntityId !== entityId) {
        this.addRelationship(currentMode.fromEntityId, entityId, currentMode.relationshipType);
        
        // Reset relationship mode
        this.relationshipModeSubject.next({
          isActive: false,
          fromEntityId: null,
          relationshipType: null
        });
        
        // Switch back to select tool
        this.setSelectedTool('select');
        console.log('Relationship created between:', currentMode.fromEntityId, 'and', entityId);
        return true;
      } else {
        console.log('Cannot create relationship with the same entity');
        return false;
      }
    }
  }

  clearSelection(): void {
    const currentDiagram = this.diagramSubject.value;
    const updatedEntities = currentDiagram.entities.map(entity => ({
      ...entity,
      isSelected: false
    }));
    const updatedRelationships = currentDiagram.relationships.map(relationship => ({
    ...relationship,
    isSelected: false
  }));
    this.updateDiagram({
      ...currentDiagram,
      entities: updatedEntities,
      relationships : updatedRelationships
    });

    this.selectedEntitySubject.next(null);
    this.selectedRelationshipSubject.next(null);
  }

  selectRelationship(relationshipId: string): void {
    const currentDiagram = this.diagramSubject.value;
    const updatedRelationships = currentDiagram.relationships.map(rel => ({
      ...rel,
      isSelected: rel.id === relationshipId
    }));

    // Clear entity selection
    const updatedEntities = currentDiagram.entities.map(entity => ({
      ...entity,
      isSelected: false
    }));

    this.updateDiagram({
      ...currentDiagram,
      entities: updatedEntities,
      relationships: updatedRelationships
    });

    const selectedRelationship = updatedRelationships.find(r => r.id === relationshipId) || null;
    this.selectedRelationshipSubject.next(selectedRelationship);
    this.selectedEntitySubject.next(null);
  }

  updateRelationship(relationshipId: string, updates: Partial<Relationship>): void {
    const currentDiagram = this.diagramSubject.value;
    const updatedRelationships = currentDiagram.relationships.map(rel =>
      rel.id === relationshipId ? { ...rel, ...updates } : rel
    );

    this.updateDiagram({
      ...currentDiagram,
      relationships: updatedRelationships,
      metadata: {
        ...currentDiagram.metadata,
        modified: new Date()
      }
    });

    if (updates.isSelected !== undefined) {
      const selectedRelationship = updatedRelationships.find(r => r.isSelected) || null;
      this.selectedRelationshipSubject.next(selectedRelationship);
    }
  }

  deleteRelationship(relationshipId: string): void {
    const currentDiagram = this.diagramSubject.value;
    const updatedRelationships = currentDiagram.relationships.filter(rel => rel.id !== relationshipId);

    this.updateDiagram({
      ...currentDiagram,
      relationships: updatedRelationships,
      metadata: {
        ...currentDiagram.metadata,
        modified: new Date()
      }
    });

    this.selectedRelationshipSubject.next(null);
  }

  exportToPNG(): void {
    // Implementation for PNG export
    console.log('Exporting to PNG...');
  }

  exportToSQL(): void {
    // Implementation for SQL export
    const diagram = this.diagramSubject.value;
    let sql = '';
    
    diagram.entities.forEach(entity => {
      sql += `CREATE TABLE ${entity.name} (\n`;
      entity.attributes.forEach((attr, index) => {
        sql += `  ${attr.name} ${attr.type.toUpperCase()}`;
        if (attr.isPrimaryKey) sql += ' PRIMARY KEY';
        if (!attr.isNullable) sql += ' NOT NULL';
        if (index < entity.attributes.length - 1) sql += ',';
        sql += '\n';
      });
      sql += ');\n\n';
    });
    
    // Create and download SQL file
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.diagramSubject.value.metadata.name}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('SQL file downloaded');
  }

  newDiagram(): void {
    const newDiagram: DiagramData = {
      entities: [],
      relationships: [],
      metadata: {
        name: 'Untitled Diagram',
        created: new Date(),
        modified: new Date(),
        version: '1.0.0'
      }
    };
    
    this.updateDiagram(newDiagram);
    this.selectedEntitySubject.next(null);
    this.selectedRelationshipSubject.next(null);
  }

  loadDiagram(diagramData: DiagramData): void {
    this.updateDiagram(diagramData);
    this.selectedEntitySubject.next(null);
    this.selectedRelationshipSubject.next(null);
  }

  saveDiagram(): void {
    const diagram = this.diagramSubject.value;
    const dataStr = JSON.stringify(diagram, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagram.metadata.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private updateDiagram(diagram: DiagramData): void {
    this.diagramSubject.next(diagram);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}