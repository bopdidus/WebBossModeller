import { Component, EventEmitter, Output}  from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { FileNode } from '../file-node';


@Component({
  selector: 'app-menutool',
  imports: [
            MatIconModule,
            MatToolbarModule,
            MatMenuModule, 
            MatTooltipModule,
            DragDropModule
          ],
  templateUrl: './menutool.html',
  styleUrl: './menutool.scss'
})
export class Menutool {
  @Output() newElement = new EventEmitter<FileNode>();

  protected onNewElement(type: number) {
    switch(type) {
      case 1:
        var node: FileNode = { name: 'New File', icon: 'insert_drive_file' };
        break;  
      case 2:
         var node: FileNode = { name: 'New Folder', icon: 'folder', children: [] };
        break;
      default:
        console.error('Unknown type for new element:', type);
        return;
    }
    this.newElement.emit(node);
  }

  
}
