import { Component, Input } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from "@angular/material/icon";
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { FileNode } from '../file-node';


@Component({
  selector: 'side-tree',
  imports: [MatTreeModule, MatIconModule],
  templateUrl: './side-tree.html',
  styleUrl: './side-tree.scss'
})
export class SideTree {
  treeControl = (node: FileNode) => node.children ?? [];
  @Input()  dataSource : FileNode[] = [];
  protected slectedNode: FileNode | null = null;

  hasChild = (_: number, node: FileNode) => !!node.children && node.children.length > 0;

  protected onNodeSelect(node: FileNode) {
    this.slectedNode = node;
    console.log('Selected node:', node);
  }
}
