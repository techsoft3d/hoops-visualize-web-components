import type { Meta, StoryObj } from '@storybook/web-components';
import { action } from '@storybook/addon-actions';

import { html } from 'lit';

import './hoops-types-tree-node';
import { ifDefined } from 'lit/directives/if-defined.js';

const meta: Meta = {
  component: 'hoops-types-tree-node',
  tags: ['autodocs'],
  decorators: [
    (story) => {
      return html`<div style="width: 300px; padding: 1rem; background: var(--hoops-background-canvas, #f5f5f5);">${story()}</div>`;
    },
  ],
  argTypes: {
    nodeId: { 
      control: 'number',
      description: 'The tree id of the node for UI purposes',
    },
    modelNodeId: { 
      control: 'number',
      description: 'The id of the node represented by this element',
    },
    nodeName: { 
      control: 'text',
      description: 'The name of the node',
    },
    modelNodes: { 
      control: 'object',
      description: 'The nodes associated with this type node',
    },
    visibility: { 
      control: 'select',
      options: ['Hidden', 'Shown', 'Mixed', 'Unknown'],
      description: 'The visibility state of the node',
    },
  },

  render: (args) =>
    html`<hoops-types-tree-node
      nodeId=${ifDefined(args.nodeId)}
      modelNodeId=${ifDefined(args.modelNodeId)}
      nodeName=${ifDefined(args.nodeName)}
      .modelNodes=${args.modelNodes || []}
      visibility=${ifDefined(args.visibility)}
    >
    </hoops-types-tree-node>`,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    nodeId: 1,
    nodeName: 'Type Node',
    visibility: 'Shown',
  },
};

export const TypeNodeWithData: Story = {
  args: {
    nodeId: 2,
    nodeName: 'IfcWall',
    modelNodes: [101, 102, 103, 104],
    visibility: 'Shown',
  },
};

export const ModelNodeWithData: Story = {
  args: {
    nodeId: 3,
    modelNodeId: 456,
    nodeName: 'Wall_001',
    visibility: 'Shown',
  },
};

export const HiddenNode: Story = {
  args: {
    nodeId: 4,
    nodeName: 'IfcColumn',
    modelNodes: [201, 202],
    visibility: 'Hidden',
  },
};

export const MixedVisibilityNode: Story = {
  args: {
    nodeId: 5,
    nodeName: 'IfcBeam',
    modelNodes: [301, 302, 303],
    visibility: 'Mixed',
  },
};

export const UnknownVisibilityNode: Story = {
  args: {
    nodeId: 6,
    nodeName: 'IfcSlab',
    modelNodes: [401],
    visibility: 'Unknown',
  },
};

export const LongNodeName: Story = {
  args: {
    nodeId: 7,
    nodeName: 'IfcBuildingElementProxy_With_A_Very_Long_Name_That_Should_Be_Truncated',
    modelNodes: [501, 502, 503, 504, 505],
    visibility: 'Shown',
  },
};

export const EmptyTypeNode: Story = {
  args: {
    nodeId: 8,
    nodeName: 'IfcSpace',
    modelNodes: [],
    visibility: 'Shown',
  },
};

export const InteractiveNode: Story = {
  args: {
    nodeId: 9,
    nodeName: 'IfcDoor',
    modelNodes: [601, 602, 603],
    visibility: 'Shown',
  },
  decorators: [
    (story) => {
      return html`
        <div style="width: 300px; padding: 1rem; background: var(--hoops-background-canvas, #f5f5f5);"
             @hoops-types-tree-node-click=${action('hoops-types-tree-node-click')}
             @hoops-types-tree-node-visibility-change=${action('hoops-types-tree-node-visibility-change')}>
          <div style="margin-bottom: 1rem; font-size: 0.875rem; color: var(--hoops-foreground-subtle, #666);">
            Click the node name or visibility icon to see events in the Actions panel.
          </div>
          ${story()}
        </div>
      `;
    },
  ],
};

export const ThemedNode: Story = {
  args: {
    nodeId: 10,
    nodeName: 'IfcWindow',
    modelNodes: [701, 702],
    visibility: 'Shown',
  },
  decorators: [
    (story) => {
      return html`
        <div style="width: 300px; padding: 1rem; background: #1e1e1e; 
                    --hoops-foreground: #e1e1e1; 
                    --hoops-accent-foreground-hover: #0078d4; 
                    --hoops-background-canvas: #1e1e1e;">
          ${story()}
        </div>
      `;
    },
  ],
};
