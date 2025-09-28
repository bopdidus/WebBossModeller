import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menutool } from "./menutool/menutool";
import {MatSidenavModule} from '@angular/material/sidenav';
import { SideTree } from "./side-tree/side-tree";
import { Toolbar } from "./components/toolbar/toolbar";
import { PropertyComponent } from "./components/property-component/property-component";
import { ToolboxComponent } from "./components/toolbox-component/toolbox-component";
import { CanvasComponent } from "./components/canvas-component/canvas-component";



@Component({
  selector: 'app-root',
  imports: [Toolbar, PropertyComponent, ToolboxComponent, CanvasComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
 

}
