import { IService } from '../types';
import { BimId, NodeId, RelationshipType } from '@ts3d-hoops/web-viewer';

export interface RelationshipData {
  type: RelationshipType;
  typeName: string;
  elements: RelatedElementInfo[];
}

export interface BimElementInfo {
  bimId: BimId;
  name: string;
  connected: boolean;
  nodeId?: NodeId;
}

export interface RelatedElementInfo extends BimElementInfo {
  /** Direction of the relationship: 'related' or 'relating' */
  role: 'related' | 'relating';
}

export interface IIFCRelationshipsService extends IService {
  selectionRelationships: RelationshipData[];
  selectNode(nodeId: NodeId): void;
}
