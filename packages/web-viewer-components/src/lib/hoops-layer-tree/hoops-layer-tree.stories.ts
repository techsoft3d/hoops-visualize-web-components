import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import LayerTree from './hoops-layer-tree';

import './hoops-layer-tree';
import { LayerId, NodeId, LayerName, NodeType, FileType } from '@ts3d-hoops/web-viewer';

const meta: Meta = {
  component: 'hoops-layer-tree',
  decorators: [
    (story) => {
      return html`<div style="width: 300px;">${story()}</div>`;
    },
  ],
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
  render: () => {
    return html`<hoops-layer-tree></hoops-layer-tree>`;
  },
};

const data = {
  content: new Array<number>(0, 1, 2),
  visibilityMap: new Map<number, boolean>([...Array(3)].map((_, index) => [index, true])),
  namesMap: new Map<LayerId, string>([
    [0, 'Layer 0'],
    [1, 'Layer 1'],
    [2, 'Layer 2'],
  ]),
  layerNamesToNodeLists: new Map<LayerName, NodeId[]>([
    ['Layer 0', [0, 1]],
    ['Layer 1', [0, 2, 3]],
  ]),
  nodeNames: new Map<number, string>([
    [0, 'Node 0'],
    [1, 'Node 1'],
    [2, 'Node 2'],
    [3, 'Node 3'],
  ]),
  childrenMap: new Map<number, number[]>(),
};

const layersContainer = {
  getLayers: () => data.namesMap,
  getLayerName: (layerId: LayerId) => data.namesMap.get(layerId) ?? null,
  getNodesFromLayerName: (layerName: LayerName, _onlyTreeNodes?: boolean) =>
    data.layerNamesToNodeLists.get(layerName) ?? [],
  getNodeName: (nodeId: number) => data.nodeNames.get(nodeId) ?? null,
  getNodeType: (_nodeId: number) => NodeType.Part,
  getModelFileTypeFromNode: (_nodeId: number) => FileType.Dwg,
  getNodeParent: (_nodeId: number) => 0,
  getNodeChildren: (_nodeId: number) => data.childrenMap.get(_nodeId) ?? null,
  isDrawing: () => false,
};

Base.play = ({ canvasElement }) => {
  const layerTree = canvasElement.getElementsByTagName('hoops-layer-tree')[0] as LayerTree;
  layerTree.layersContainer = layersContainer;
};

export const Themed = {
  ...Base,
  decorators: [
    (story: any) => {
      return html`<style>
          :root {
            --hoops-neutral-foreground: red;
            --hoops-neutral-foreground-hover: pink;
            --hoops-neutral-foreground-active: pink;

            --hoops-accent-foreground: chartreuse;
            --hoops-accent-foreground-hover: orangered;
            --hoops-accent-foreground-active: royalblue;
          }
        </style>
        <div>${story()}</div>`;
    },
  ],
};
