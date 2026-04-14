import { nothing } from 'lit';
import { describe, expect, it, vi } from 'vitest';
import { FileType, NodeType } from '@ts3d-hoops/web-viewer';

import LayerAdapter, { defaultLayerElementFactory, getAdjustedNodeId } from './LayerAdapter';
import { ILayersContainer } from './types';

/**
 * Creates a mock ILayersContainer with configurable layers and nodes.
 */
function createMockLayersContainer(
  options: {
    layers?: Map<number, string>;
    nodesPerLayer?: Map<number, number[]>;
    nodeNames?: Map<number, string>;
    nodeTypes?: Map<number, NodeType>;
    fileTypes?: Map<number, FileType>;
    nodeParents?: Map<number, number | null>;
    nodeChildren?: Map<number, number[]>;
    isDrawing?: boolean;
  } = {},
): ILayersContainer {
  const layers = options.layers ?? new Map<number, string>();
  const nodesPerLayer = options.nodesPerLayer ?? new Map<number, number[]>();
  const nodeNames = options.nodeNames ?? new Map<number, string>();
  const nodeTypes = options.nodeTypes ?? new Map<number, NodeType>();
  const fileTypes = options.fileTypes ?? new Map<number, FileType>();
  const nodeParents = options.nodeParents ?? new Map<number, number | null>();
  const nodeChildren = options.nodeChildren ?? new Map<number, number[]>();

  return {
    getLayers: vi.fn(() => layers),
    getLayerName: vi.fn((layerId: number) => layers.get(layerId) ?? null),
    getNodesFromLayer: vi.fn((layerId: number) => nodesPerLayer.get(layerId) ?? null),
    getNodeName: vi.fn((nodeId: number) => nodeNames.get(nodeId) ?? null),
    getNodeType: vi.fn((nodeId: number) => nodeTypes.get(nodeId) ?? null),
    getModelFileTypeFromNode: vi.fn((nodeId: number) => fileTypes.get(nodeId) ?? null),
    getNodeParent: vi.fn((nodeId: number) => nodeParents.get(nodeId) ?? null),
    getNodeChildren: vi.fn((nodeId: number) => nodeChildren.get(nodeId) ?? null),
    isDrawing: vi.fn(() => options.isDrawing ?? false),
  };
}

describe('getAdjustedNodeId', () => {
  it('should return the parent for a BodyInstance node in a non-drawing, non-DWG model', () => {
    const container = createMockLayersContainer({
      nodeTypes: new Map([[10, NodeType.BodyInstance]]),
      fileTypes: new Map([[10, FileType.Ifc]]),
      nodeParents: new Map([[10, 5]]),
    });

    const result = getAdjustedNodeId(container, 10);

    expect(result).toBe(5);
  });

  it('should return the original nodeId when model is a drawing', () => {
    const container = createMockLayersContainer({
      nodeTypes: new Map([[10, NodeType.BodyInstance]]),
      fileTypes: new Map([[10, FileType.Ifc]]),
      nodeParents: new Map([[10, 5]]),
      isDrawing: true,
    });

    const result = getAdjustedNodeId(container, 10);

    expect(result).toBe(10);
  });

  it('should return the original nodeId for a DWG file', () => {
    const container = createMockLayersContainer({
      nodeTypes: new Map([[10, NodeType.BodyInstance]]),
      fileTypes: new Map([[10, FileType.Dwg]]),
      nodeParents: new Map([[10, 5]]),
    });

    const result = getAdjustedNodeId(container, 10);

    expect(result).toBe(10);
  });

  it('should return the original nodeId for non-BodyInstance nodes', () => {
    const container = createMockLayersContainer({
      nodeTypes: new Map([[10, NodeType.PartInstance]]),
      fileTypes: new Map([[10, FileType.Ifc]]),
      nodeParents: new Map([[10, 5]]),
    });

    const result = getAdjustedNodeId(container, 10);

    expect(result).toBe(10);
  });

  it('should return the original nodeId when parent is null', () => {
    const container = createMockLayersContainer({
      nodeTypes: new Map([[10, NodeType.BodyInstance]]),
      fileTypes: new Map([[10, FileType.Ifc]]),
      nodeParents: new Map([[10, null]]),
    });

    const result = getAdjustedNodeId(container, 10);

    expect(result).toBe(10);
  });
});

describe('LayerAdapter', () => {
  it('should return nothing from getContent when layersContainer is not set', () => {
    const adapter = new LayerAdapter();

    const result = adapter.getContent(adapter, 0);

    expect(result).toBe(nothing);
  });

  it('should delegate to layerFactory from getContent when layersContainer is set', () => {
    const adapter = new LayerAdapter();
    const container = createMockLayersContainer();
    adapter.layersContainer = container;
    const spy = vi.fn(() => nothing);
    adapter.layerFactory = spy;

    adapter.getContent(adapter, 42, true, [1, 2]);

    expect(spy).toHaveBeenCalledWith(adapter, container, 42, true, [1, 2]);
  });

  it('should default selected to false and selectedNodes to [] when not provided', () => {
    const adapter = new LayerAdapter();
    const container = createMockLayersContainer();
    adapter.layersContainer = container;
    const spy = vi.fn(() => nothing);
    adapter.layerFactory = spy;

    adapter.getContent(adapter, 0);

    expect(spy).toHaveBeenCalledWith(adapter, container, 0, false, []);
  });

  it('should have alwaysShowLeafNodes default to false', () => {
    const adapter = new LayerAdapter();
    expect(adapter.alwaysShowLeafNodes).toBe(false);
  });
});

describe('defaultLayerElementFactory', () => {
  function createAdapter(
    container: ILayersContainer,
    elementsData?: Map<number, string>,
  ): LayerAdapter {
    const adapter = new LayerAdapter();
    adapter.layersContainer = container;
    if (elementsData) {
      adapter.elementsData = elementsData;
    }
    return adapter;
  }

  it('should return nothing for "No layer"', () => {
    const container = createMockLayersContainer();
    const adapter = createAdapter(
      container,
      new Map([[0, 'No layer']]),
    );

    const result = defaultLayerElementFactory(adapter, container, 0);

    expect(result).toBe(nothing);
  });

  it('should return nothing when layer has no nodes', () => {
    const container = createMockLayersContainer({
      layers: new Map([[1, 'Layer A']]),
      nodesPerLayer: new Map([[1, []]]),
    });
    const adapter = createAdapter(
      container,
      new Map([[0, 'Layer A']]),
    );

    const result = defaultLayerElementFactory(adapter, container, 0);

    expect(result).toBe(nothing);
  });

  it('should return an HTML template when layer has nodes', () => {
    const container = createMockLayersContainer({
      layers: new Map([[1, 'Layer A']]),
      nodesPerLayer: new Map([[1, [10, 20]]]),
      nodeNames: new Map([
        [10, 'Node 10'],
        [20, 'Node 20'],
      ]),
      nodeTypes: new Map([
        [10, NodeType.PartInstance],
        [20, NodeType.PartInstance],
      ]),
    });
    const adapter = createAdapter(
      container,
      new Map([[0, 'Layer A']]),
    );

    const result = defaultLayerElementFactory(adapter, container, 0);

    expect(result).not.toBe(nothing);
  });

  it('should skip getAdjustedNodeId when alwaysShowLeafNodes is true', () => {
    const container = createMockLayersContainer({
      layers: new Map([[1, 'Layer A']]),
      nodesPerLayer: new Map([[1, [10]]]),
      nodeNames: new Map([[10, 'Leaf Node']]),
      nodeTypes: new Map([[10, NodeType.BodyInstance]]),
      fileTypes: new Map([[10, FileType.Ifc]]),
      nodeParents: new Map([[10, 5]]),
    });
    const adapter = createAdapter(
      container,
      new Map([[0, 'Layer A']]),
    );
    adapter.alwaysShowLeafNodes = true;

    defaultLayerElementFactory(adapter, container, 0);

    // When alwaysShowLeafNodes is true, getNodeParent should not be called
    // because getAdjustedNodeId is skipped entirely.
    expect(container.getNodeParent).not.toHaveBeenCalled();
  });

  it('should call getAdjustedNodeId when alwaysShowLeafNodes is false', () => {
    const container = createMockLayersContainer({
      layers: new Map([[1, 'Layer A']]),
      nodesPerLayer: new Map([[1, [10]]]),
      nodeNames: new Map([
        [5, 'Parent Node'],
        [10, 'Leaf Node'],
      ]),
      nodeTypes: new Map([[10, NodeType.BodyInstance]]),
      fileTypes: new Map([[10, FileType.Ifc]]),
      nodeParents: new Map([[10, 5]]),
    });
    const adapter = createAdapter(
      container,
      new Map([[0, 'Layer A']]),
    );
    adapter.alwaysShowLeafNodes = false;

    defaultLayerElementFactory(adapter, container, 0);

    // When alwaysShowLeafNodes is false, getNodeParent is called via getAdjustedNodeId.
    expect(container.getNodeParent).toHaveBeenCalled();
  });

  it('should compute nodesChildren when alwaysShowLeafNodes is false', () => {
    const container = createMockLayersContainer({
      layers: new Map([[1, 'Layer A']]),
      nodesPerLayer: new Map([[1, [100, 200]]]),
      nodeNames: new Map([
        [100, 'Parent'],
        [200, 'Child'],
      ]),
      nodeTypes: new Map([
        [100, NodeType.PartInstance],
        [200, NodeType.PartInstance],
      ]),
      nodeChildren: new Map([[100, [200]]]),
    });
    const adapter = createAdapter(
      container,
      new Map([[0, 'Layer A']]),
    );
    adapter.alwaysShowLeafNodes = false;

    defaultLayerElementFactory(adapter, container, 0);

    expect(container.getNodeChildren).toHaveBeenCalled();
  });

  it('should not compute nodesChildren when alwaysShowLeafNodes is true', () => {
    const container = createMockLayersContainer({
      layers: new Map([[1, 'Layer A']]),
      nodesPerLayer: new Map([[1, [100, 200]]]),
      nodeNames: new Map([
        [100, 'Parent'],
        [200, 'Child'],
      ]),
      nodeTypes: new Map([
        [100, NodeType.PartInstance],
        [200, NodeType.PartInstance],
      ]),
      nodeChildren: new Map([[100, [200]]]),
    });
    const adapter = createAdapter(
      container,
      new Map([[0, 'Layer A']]),
    );
    adapter.alwaysShowLeafNodes = true;

    defaultLayerElementFactory(adapter, container, 0);

    expect(container.getNodeChildren).not.toHaveBeenCalled();
  });

  it('should use "Unnamed layer" for unnamed layers when matching', () => {
    const container = createMockLayersContainer({
      layers: new Map([[1, '']]),
      nodesPerLayer: new Map([[1, [10]]]),
      nodeNames: new Map([[10, 'Some Node']]),
      nodeTypes: new Map([[10, NodeType.PartInstance]]),
    });
    const adapter = createAdapter(
      container,
      new Map([[0, 'Unnamed layer 1']]),
    );

    const result = defaultLayerElementFactory(adapter, container, 0);

    expect(result).not.toBe(nothing);
  });

  it('should deduplicate nodes across layers with the same name', () => {
    const container = createMockLayersContainer({
      layers: new Map([
        [1, 'Layer A'],
        [2, 'Layer A'],
      ]),
      nodesPerLayer: new Map([
        [1, [10, 20]],
        [2, [20, 30]],
      ]),
      nodeNames: new Map([
        [10, 'Node 10'],
        [20, 'Node 20'],
        [30, 'Node 30'],
      ]),
      nodeTypes: new Map([
        [10, NodeType.PartInstance],
        [20, NodeType.PartInstance],
        [30, NodeType.PartInstance],
      ]),
    });
    const adapter = createAdapter(
      container,
      new Map([[0, 'Layer A']]),
    );

    defaultLayerElementFactory(adapter, container, 0);

    // getNodeName is called once per unique node (10, 20, 30), not 4 times.
    expect(container.getNodeName).toHaveBeenCalledTimes(3);
  });
});
