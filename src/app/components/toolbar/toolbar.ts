import {
  Component,
} from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import { DiagramService } from '../../core/services/diagram.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
   standalone: true,
  imports: [MatIconModule, MatToolbarModule, MatTooltipModule]
})
export class Toolbar {

   constructor(private diagramService: DiagramService) {}

  newDiagram(): void {
    if (confirm('Create a new diagram? This will clear the current diagram.')) {
      this.diagramService.newDiagram();
      console.log('New diagram created');
    }
  }

  openDiagram(): void {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const diagramData = JSON.parse(e.target.result);
            this.diagramService.loadDiagram(diagramData);
            console.log('Diagram loaded successfully');
          } catch (error) {
            alert('Error loading diagram file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  saveDiagram(): void {
    this.diagramService.saveDiagram();
    console.log('Diagram saved');
  }

  undo(): void {
    console.log('Undo action');
    // TODO: Implement undo functionality
  }

  redo(): void {
    console.log('Redo action');
    // TODO: Implement redo functionality
  }

  zoomIn(): void {
    console.log('Zoom in');
    // TODO: Implement zoom functionality
  }

  zoomOut(): void {
    console.log('Zoom out');
    // TODO: Implement zoom functionality
  }

  fitToScreen(): void {
    console.log('Fit to screen');
    // TODO: Implement fit to screen functionality
  }

  exportToPNG(): void {
    this.diagramService.exportToPNG();
  }

  exportToSQL(): void {
    this.diagramService.exportToSQL();
  }

  share(): void {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'ERD Diagram',
        text: 'Check out this ERD diagram',
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Diagram URL copied to clipboard!');
      });
    }
  }

}
