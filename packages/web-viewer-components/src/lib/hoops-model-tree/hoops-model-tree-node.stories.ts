import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import './hoops-model-tree-node';
import { NodeType } from '@ts3d-hoops/web-viewer';
import { ifDefined } from 'lit/directives/if-defined.js';

const meta: Meta = {
  component: 'ModelTreeNode',
  tags: ['autodocs'],
  decorators: [
    (story) => {
      return html`<div style="width: 300px;">${story()}</div>`;
    },
  ],
  argTypes: {
    nodeId: { type: 'number' },
    nodeName: { type: 'string' },
    nodeType: { type: 'number' },
    isRoot: { type: 'boolean' },
    hidden: { type: 'boolean' },
    selected: { type: 'boolean' },
  },

  render: (args) =>
    html`<hoops-model-tree-node
      nodeId=${ifDefined(args.nodeId)}
      nodeName=${ifDefined(args.nodeName)}
      nodeType=${ifDefined(args.nodeType)}
      ?isRoot=${args.isRoot}
      ?hidden=${args.hidden}
      ?selected=${args.selected}
    >
    </hoops-model-tree-node>`,
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
};

export const WithData = {
  ...Base,
  args: {
    nodeId: 0,
    nodeName: 'root',
    nodeType: NodeType.PartInstance,
  },
};

export const Hidden = {
  ...Base,
  args: {
    nodeId: 0,
    nodeName: 'root',
    nodeType: NodeType.PartInstance,
    hidden: true,
  },
};

export const Selected = {
  ...Base,
  args: {
    nodeId: 0,
    nodeName: 'root',
    nodeType: NodeType.PartInstance,
    selected: true,
  },
};
