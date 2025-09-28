import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ToolboxItem } from '../../core/models/toolbox-item.model';
import { DiagramService } from '../../core/services/diagram.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toolbox',
  imports: [CommonModule],
  templateUrl: './toolbox-component.html',
  styleUrl: './toolbox-component.scss'
})
export class ToolboxComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  selectedTool = 'select';

  entityTools: ToolboxItem[] = [
    {
      id: 'entity',
      name: 'Entity',
      icon: 'fas fa-square',
      type: 'entity',
      description: 'Create a new entity'
    },
    {
      id: 'weak-entity',
      name: 'Weak Entity',
      icon: 'fas fa-square',
      type: 'entity',
      description: 'Create a weak entity'
    }
  ];
  
  relationshipTools: ToolboxItem[] = [
    {
      id: 'one-to-one',
      name: 'One to One',
      icon: 'fas fa-arrows-alt-h',
      type: 'relationship',
      description: 'Create a one-to-one relationship'
    },
    {
      id: 'one-to-many',
      name: 'One to Many',
      icon: 'fas fa-project-diagram',
      type: 'relationship',
      description: 'Create a one-to-many relationship'
    },
    {
      id: 'many-to-many',
      name: 'Many to Many',
      icon: 'fas fa-sitemap',
      type: 'relationship',
      description: 'Create a many-to-many relationship'
    }
  ];
  
  constructor(private diagramService: DiagramService) {}
  
  ngOnInit(): void {
    // Subscribe to selected tool changes to keep UI in sync
    this.diagramService.selectedTool$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tool => {
        this.selectedTool = tool;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTool(toolId: string): void {
    this.selectedTool = toolId;
    this.diagramService.setSelectedTool(toolId);
    console.log(`Selected tool: ${toolId}`);
    
    // Handle relationship tools
    if (['one-to-one', 'one-to-many', 'many-to-many'].includes(toolId)) {
      this.diagramService.startRelationshipMode(toolId);
      console.log(`Starting relationship mode: ${toolId}`);
    }
    
    // Clear any existing selections when switching tools
    if (toolId === 'select') {
      this.diagramService.clearSelection();
    }
  }
  
}