export interface ToolboxItem {
  id: string;
  name: string;
  icon: string;
  type: 'entity' | 'relationship' | 'attribute';
  description: string;
}