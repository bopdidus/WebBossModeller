import { Entity } from "./entity.model";
import { Relationship } from "./relationship.model";

export interface DiagramSettings {
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showFieldTypes: boolean;
  showRelationshipNames: boolean;
  theme: 'light' | 'dark';
  defaultEntityColor: string;
  defaultRelationshipColor: string;
}

export interface DiagramData {
  entities: Entity[];
  relationships: Relationship[];
  metadata: {
    name: string;
    created: Date;
    modified: Date;
    version: string;
  };
}
