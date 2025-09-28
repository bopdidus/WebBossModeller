export interface Relationship {
   id: string;
  name: string;
  fromEntityId: string;
  toEntityId: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  fromCardinality: 'zero-or-one' | 'one' | 'zero-or-many' | 'one-or-many';
  toCardinality: 'zero-or-one' | 'one' | 'zero-or-many' | 'one-or-many';
  isSelected: boolean;
  fromOptional: boolean;
  toOptional: boolean;
}
