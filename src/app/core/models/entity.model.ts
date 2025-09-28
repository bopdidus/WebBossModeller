import { Attribute } from "./attribute.model";

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}
export interface Entity {
  id: string;
  name: string;
  position: Point;
  size: Size;
  attributes: Attribute[];
  color: string;
  isSelected: boolean;
}