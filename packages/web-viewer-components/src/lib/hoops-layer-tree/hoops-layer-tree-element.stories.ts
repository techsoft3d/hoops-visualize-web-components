import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import './hoops-layer-tree-element';
import { ifDefined } from 'lit/directives/if-defined.js';
import { LayerTreeElement } from './hoops-layer-tree-element';

const data = {
  nodes: new Map<number, string>([
    [0, 'Node of layer'],
    [1, 'Another node of layer'],
  ]),
};

const meta: Meta = {
  component: 'LayerTreeElement',
  tags: ['autodocs'],
  decorators: [
    (story) => {
      return html`<div style="width: 300px;">${story()}</div>`;
    },
  ],
  argTypes: {
    layerId: { type: 'number' },
    layerName: { type: 'string' },
    hidden: { type: 'boolean' },
    selected: { type: 'boolean' },
  },

  render: (args) =>
    html`<hoops-layer-tree-element
      layerId=${ifDefined(args.layerId)}
      layerName=${ifDefined(args.layerName)}
      ?hidden=${args.hidden}
      ?selected=${args.selected}
    >
    </hoops-layer-tree-element>`,
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
};

Base.play = ({ canvasElement }) => {
  const layerElement = canvasElement.getElementsByTagName(
    'hoops-layer-tree-element',
  )[0] as LayerTreeElement;
  layerElement.layerNodes = data.nodes;
  layerElement.addEventListener('hoops-layer-tree-node-clicked', (event) => {
    layerElement.toggleNodeSelection(event.detail.nodeId);
  });
  layerElement.addEventListener('hoops-layer-clicked', (_event) => {
    layerElement.toggleSelection();
  });
  layerElement.addEventListener('hoops-layer-visibility-change', (_event) => {
    layerElement.toggleVisibility();
  });
};

export const WithData = {
  ...Base,
  args: {
    layerId: 0,
    layerName: 'Some layer',
  },
};

export const Hidden = {
  ...Base,
  args: {
    layerId: 0,
    layerName: 'Some hidden layer',
    hidden: true,
  },
};

export const Selected = {
  ...Base,
  args: {
    layerId: 0,
    layerName: 'Some selected layer',
    selected: true,
  },
};
