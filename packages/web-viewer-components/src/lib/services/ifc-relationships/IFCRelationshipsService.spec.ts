import { beforeEach, describe, expect, it, vi } from 'vitest';
import IFCRelationshipsService from './IFCRelationshipsService';
import { BimId, NodeId, RelationshipType, Event, Selection } from '@ts3d-hoops/web-viewer';

describe('IFCRelationshipsService', () => {
  let service: IFCRelationshipsService;
  let mockSelectionManager: Selection.SelectionManager;
  let mockViewer: {
    model: {
      getBimIdFromNode: ReturnType<typeof vi.fn>;
      getRelationshipTypesFromBimId: ReturnType<typeof vi.fn>;
      getBimIdConnectedElements: ReturnType<typeof vi.fn>;
      getBimInfoFromBimId: ReturnType<typeof vi.fn>;
      getNodeIdFromBimId: ReturnType<typeof vi.fn>;
    };
    setCallbacks: ReturnType<typeof vi.fn>;
  };

  const nodeId: NodeId = 123;
  const bimId: BimId = 'test-bim-id';

  beforeEach(() => {
    vi.clearAllMocks();

    mockViewer = {
      model: {
        getBimIdFromNode: vi.fn(),
        getRelationshipTypesFromBimId: vi.fn(),
        getBimIdConnectedElements: vi.fn(),
        getBimInfoFromBimId: vi.fn(),
        getNodeIdFromBimId: vi.fn(),
      },
      setCallbacks: vi.fn(),
    };

    mockSelectionManager = {
      viewer: mockViewer,
      getResults: vi.fn().mockReturnValue([]),
      selectNode: vi.fn(),
    } as unknown as Selection.SelectionManager;

    service = new IFCRelationshipsService(mockSelectionManager);
  });

  describe('constructor', () => {
    it('should initialize with selection manager and bind callbacks', () => {
      expect(service.serviceName).toBe('IFCRelationshipsService');
      expect(service._selectionManager).toBe(mockSelectionManager);
      expect(mockViewer.setCallbacks).toHaveBeenCalledWith(service.callbackMap);
    });

    it('should handle initialization without selection manager', () => {
      const serviceWithoutManager = new IFCRelationshipsService();
      expect(serviceWithoutManager._selectionManager).toBeUndefined();
      expect(serviceWithoutManager.viewer).toBeUndefined();
    });
  });

  describe('selectionManager', () => {
    it('should set selection manager and bind callbacks', () => {
      const serviceWithoutManager = new IFCRelationshipsService();
      serviceWithoutManager.selectionManager = mockSelectionManager;

      expect(serviceWithoutManager._selectionManager).toBe(mockSelectionManager);
      expect(mockViewer.setCallbacks).toHaveBeenCalledWith(serviceWithoutManager.callbackMap);
    });
  });

  describe('getBimElementRelationships', () => {
    it('should return agglomerated relationship data with role-based elements', () => {
      const mockConnectedElements = {
        relateds: ['related-1', 'related-2'],
        relatings: ['relating-1'],
      };
      const mockBimInfo = { name: 'Test Element', connected: true };

      mockViewer.model.getRelationshipTypesFromBimId.mockReturnValue([RelationshipType.Aggregates]);
      mockViewer.model.getBimIdConnectedElements.mockReturnValue(mockConnectedElements);
      mockViewer.model.getBimInfoFromBimId.mockReturnValue(mockBimInfo);
      mockViewer.model.getNodeIdFromBimId.mockReturnValue(100);

      const result = service.getBimElementRelationships(nodeId, bimId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          type: RelationshipType.Aggregates,
          typeName: 'Aggregates',
          elements: expect.arrayContaining([
            expect.objectContaining({ bimId: 'related-1', role: 'related' }),
            expect.objectContaining({ bimId: 'related-2', role: 'related' }),
            expect.objectContaining({ bimId: 'relating-1', role: 'relating' }),
          ]),
        }),
      );
    });

    it('should handle missing viewer gracefully', () => {
      service._selectionManager = undefined;
      const result = service.getBimElementRelationships(nodeId, bimId);
      expect(result).toEqual([]);
    });

    it('should handle multiple relationship types', () => {
      const mockConnectedElements = { relateds: ['elem-1'], relatings: [] };
      const mockBimInfo = { name: 'Test Element', connected: true };

      mockViewer.model.getRelationshipTypesFromBimId.mockReturnValue([
        RelationshipType.Aggregates,
        RelationshipType.VoidsElement,
      ]);
      mockViewer.model.getBimIdConnectedElements.mockReturnValue(mockConnectedElements);
      mockViewer.model.getBimInfoFromBimId.mockReturnValue(mockBimInfo);
      mockViewer.model.getNodeIdFromBimId.mockReturnValue(100);

      const result = service.getBimElementRelationships(nodeId, bimId);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe(RelationshipType.Aggregates);
      expect(result[1].type).toBe(RelationshipType.VoidsElement);
    });

    it('should handle null node IDs in connected elements', () => {
      mockViewer.model.getRelationshipTypesFromBimId.mockReturnValue([RelationshipType.Aggregates]);
      mockViewer.model.getBimIdConnectedElements.mockReturnValue({
        relateds: ['test-id'],
        relatings: [],
      });
      mockViewer.model.getBimInfoFromBimId.mockReturnValue({ name: 'Test', connected: true });
      mockViewer.model.getNodeIdFromBimId.mockReturnValue(null);

      const result = service.getBimElementRelationships(nodeId, bimId);

      expect(result[0].elements[0].nodeId).toBeUndefined();
    });
  });

  describe('selectionRelationships', () => {
    it('should emit hoops-selection-ifc-relationships-changed event when relationships change', () => {
      const dispatchSpy = vi.spyOn(service, 'dispatchEvent');
      const mockRelationships = [
        { type: RelationshipType.Aggregates, typeName: 'Aggregates', elements: [] },
      ];

      service.selectionRelationships = mockRelationships;

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-selection-ifc-relationships-changed',
          detail: mockRelationships,
        }),
      );
    });

    it('should return current selection relationships', () => {
      const mockRelationships = [
        { type: RelationshipType.Aggregates, typeName: 'Aggregates', elements: [] },
      ];
      service.selectionRelationships = mockRelationships;

      expect(service.selectionRelationships).toEqual(mockRelationships);
    });
  });

  describe('handleSelectionArray', () => {
    it('should process selections and emit relationships-changed event', () => {
      const mockEvent = {
        getSelection: () => ({ getNodeId: () => nodeId }),
      } as Event.NodeSelectionEvent;
      const dispatchSpy = vi.spyOn(service, 'dispatchEvent');

      mockViewer.model.getBimIdFromNode.mockReturnValue(bimId);
      mockViewer.model.getRelationshipTypesFromBimId.mockReturnValue([RelationshipType.Aggregates]);
      mockViewer.model.getBimIdConnectedElements.mockReturnValue({ relateds: [], relatings: [] });

      service.handleSelectionArray([mockEvent]);

      expect(service.selectionRelationships).toHaveLength(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'hoops-selection-ifc-relationships-changed' }),
      );
    });

    it('should filter out selections without BIM IDs', () => {
      const eventWithBim = {
        getSelection: () => ({ getNodeId: () => 123 }),
      } as Event.NodeSelectionEvent;
      const eventWithoutBim = {
        getSelection: () => ({ getNodeId: () => 999 }),
      } as Event.NodeSelectionEvent;

      mockViewer.model.getBimIdFromNode.mockImplementation((id: NodeId) =>
        id === 123 ? bimId : null,
      );
      mockViewer.model.getRelationshipTypesFromBimId.mockReturnValue([RelationshipType.Aggregates]);
      mockViewer.model.getBimIdConnectedElements.mockReturnValue({ relateds: [], relatings: [] });

      service.handleSelectionArray([eventWithBim, eventWithoutBim]);

      expect(service.selectionRelationships).toHaveLength(1);
    });

    it('should handle empty selection array', () => {
      service.handleSelectionArray([]);
      expect(service.selectionRelationships).toEqual([]);
    });
  });

  describe('_getRelationshipTypeName', () => {
    const RELATIONSHIP_TYPE_MAPPINGS = [
      [RelationshipType.ContainedInSpatialStructure, 'Contained In Spatial Structure'],
      [RelationshipType.Aggregates, 'Aggregates'],
      [RelationshipType.VoidsElement, 'Voids Element'],
      [RelationshipType.FillsElement, 'Fills Element'],
      [RelationshipType.SpaceBoundary, 'Space Boundary'],
      [RelationshipType.ConnectsPathElements, 'Connects Path Elements'],
      [RelationshipType.Undefined, 'Undefined'],
    ] as const;

    it.each(RELATIONSHIP_TYPE_MAPPINGS)('should map %s to "%s"', (relType, expectedName) => {
      mockViewer.model.getRelationshipTypesFromBimId.mockReturnValue([relType]);
      mockViewer.model.getBimIdConnectedElements.mockReturnValue({ relateds: [], relatings: [] });

      const result = service.getBimElementRelationships(nodeId, bimId);

      expect(result[0].typeName).toBe(expectedName);
    });
  });

  describe('selectNode', () => {
    it('should call selectNode with the provided nodeId', () => {
      service.selectNode(nodeId);

      expect(mockSelectionManager.selectNode).toHaveBeenCalledWith(nodeId);
    });

    it('should throw an error when selection manager is not available', () => {
      service._selectionManager = undefined;

      expect(() => service.selectNode(nodeId)).toThrowError(
        'SelectionManager not available in IFCRelationshipsService',
      );
    });
  });
});
