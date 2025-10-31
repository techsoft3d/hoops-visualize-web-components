import type { Meta, StoryObj } from '@storybook/web-components';

import './hoops-node-properties';
import { html } from 'lit';
import PropertyTable from './hoops-node-properties';
import { ifDefined } from 'lit/directives/if-defined.js';

const meta: Meta = {
  component: 'hoops-node-properties',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: { nodeId: undefined },
  render: (args) => {
    return html`<hoops-node-properties nodeId=${ifDefined(args.nodeId)}></hoops-node-properties>`;
  },
};

export const WithCustomData: Story = {
  ...Base,
  args: { nodeId: 0 },
};

WithCustomData.play = async ({ canvasElement }) => {
  const node = canvasElement.getElementsByTagName('hoops-node-properties')[0] as PropertyTable;

  node.node = {
    getNodeName: () => 'node',
    getProperties: async () => [
      ['a', 'test'],
      ['B', 'TEST'],
    ],
    getUserData: async () => [
      ['c', 'Test'],
      ['D', 'tEST'],
    ],
  };
};
