import { BimId, CallbackMap, NodeId, RelationshipType, Event, Selection } from '@ts3d-hoops/web-viewer';
import { BimElementInfo, IIFCRelationshipsService, RelationshipData } from './types';

/**
 * Service for managing IFC element relationships
 * - Get relationships for any BIM element with agglomerated elements
 * - Auto-emit relationships for selected elements
 */
export default class IFCRelationshipsService
  extends EventTarget
  implements IIFCRelationshipsService
{
  public readonly serviceName = 'IFCRelationshipsService' as const;

  get viewer() {
    return this._selectionManager?.viewer;
  }

  _selectionManager?: Selection.SelectionManager;
  callbackMap: CallbackMap;

  constructor(selectionManager?: Selection.SelectionManager) {
    super();
    this._selectionManager = selectionManager;
    this.callbackMap = {
      selectionArray: this.handleSelectionArray.bind(this),
    };
    if (this._selectionManager) {
      this.bind();
    }
  }

  set selectionManager(selectionManager: Selection.SelectionManager) {
    this._selectionManager = selectionManager;
    if (this._selectionManager) {
      this.bind();
    }
  }

  _selectionRelationships: RelationshipData[] = [];

  get selectionRelationships(): RelationshipData[] {
    return this._selectionRelationships;
  }

  set selectionRelationships(relationships: RelationshipData[]) {
    this._selectionRelationships = relationships;
    this.dispatchEvent(
      new CustomEvent('hoops-selection-ifc-relationships-changed', {
        detail: this.selectionRelationships,
      }),
    );
  }

  /**
   * Handles selection changes and emits relationship data
   * @emits hoops-selection-ifc-relationships-changed
   */
  private handleSelectionArray(selections: Event.NodeSelectionEvent[]) {
    this.selectionRelationships = selections
      .map((selectionEvent) => selectionEvent.getSelection())
      .map(this.getNodeRelationships)
      .flat();
  }

  /**
   * Extracts relationships from a selection item
   */
  private getNodeRelationships = (selectionItem: Selection.SelectionItem): RelationshipData[] => {
    const nodeId = selectionItem.getNodeId();
    const bimId = this._selectionManager?.viewer.model.getBimIdFromNode(nodeId);
    if (!bimId) {
      return [];
    }
    return this.getBimElementRelationships(nodeId, bimId);
  };

  /**
   * Get all relationships for a BIM element
   * @returns Array of relationship data with agglomerated elements containing both relateds and relatings
   */
  private getBimElementRelationships(nodeId: NodeId, bimId: BimId): RelationshipData[] {
    if (!this.viewer) {
      console.warn('WebViewer not available in IFCRelationshipsService');
      return [];
    }

    const relationshipTypes = this.viewer.model.getRelationshipTypesFromBimId(nodeId, bimId);
    const relationships: RelationshipData[] = [];

    for (const relType of relationshipTypes) {
      const connectedElements = this.viewer.model.getBimIdConnectedElements(nodeId, bimId, relType);

      const relateds = this._processBimIds(nodeId, connectedElements.relateds);
      const relatings = this._processBimIds(nodeId, connectedElements.relatings);

      relationships.push({
        type: relType,
        typeName: this._getRelationshipTypeName(relType),
        elements: [
          ...relateds.map((element) => ({ ...element, role: 'related' as const })),
          ...relatings.map((element) => ({ ...element, role: 'relating' as const })),
        ],
      });
    }

    return relationships;
  }

  /**
   * Converts BIM IDs to element info with names and connection status
   */
  private _processBimIds(contextNodeId: NodeId, bimIds: BimId[]): BimElementInfo[] {
    if (!this.viewer) return [];

    return bimIds.map((bimId) => {
      if (!this.viewer) {
        return {
          bimId,
          name: bimId,
          connected: false,
          nodeId: undefined,
        };
      }

      const bimInfo = this.viewer.model.getBimInfoFromBimId(contextNodeId, bimId);
      const nodeId = this.viewer.model.getNodeIdFromBimId(contextNodeId, bimId);

      return {
        bimId,
        name: bimInfo.name,
        connected: bimInfo.connected,
        nodeId: nodeId || undefined,
      };
    });
  }

  /**
   * Converts relationship type enum to human-readable string
   */
  private _getRelationshipTypeName(type: RelationshipType): string {
    const typeNames = {
      [RelationshipType.ContainedInSpatialStructure]: 'Contained In Spatial Structure',
      [RelationshipType.Aggregates]: 'Aggregates',
      [RelationshipType.VoidsElement]: 'Voids Element',
      [RelationshipType.FillsElement]: 'Fills Element',
      [RelationshipType.SpaceBoundary]: 'Space Boundary',
      [RelationshipType.ConnectsPathElements]: 'Connects Path Elements',
      [RelationshipType.Undefined]: 'Undefined',
    };

    return typeNames[type] || 'Unknown';
  }

  /**
   * Binds service to selection manager for auto-emit functionality
   */
  private bind() {
    if (!this._selectionManager) {
      console.warn('SelectionManager not available in IFCRelationshipsService');
      return;
    }

    this._selectionManager.viewer.setCallbacks(this.callbackMap);
    this.selectionRelationships = this._selectionManager
      .getResults()
      .map(this.getNodeRelationships)
      .flat();
  }

  selectNode(nodeId: NodeId): void {
    if (!this._selectionManager) {
      throw new Error('SelectionManager not available in IFCRelationshipsService');
      return;
    }

    this._selectionManager.selectNode(nodeId);
  }
}
