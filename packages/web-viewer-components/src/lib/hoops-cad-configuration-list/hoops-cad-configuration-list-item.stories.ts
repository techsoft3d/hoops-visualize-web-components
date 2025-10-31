import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import './hoops-cad-configuration-list-item';
import { ifDefined } from 'lit/directives/if-defined.js';

const meta: Meta = {
  component: 'CadConfigurationListItemElement',
  tags: ['autodocs'],
  decorators: [
    (story) => {
      return html`<div style="width: 300px;">${story()}</div>`;
    },
  ],
  argTypes: {
    cadConfigurationId: { type: 'number' },
    cadConfigurationName: { type: 'string' },
    active: { type: 'boolean' },
  },

  render: (args) =>
    html`<hoops-cad-configuration-list-item
      cadConfigurationId=${ifDefined(args.cadConfigurationId)}
      cadConfigurationName=${ifDefined(args.cadConfigurationName)}
      ?active=${ifDefined(args.active)}
    >
    </hoops-cad-configuration-list-item>`,
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
};

export const WithData = {
  ...Base,
  args: {
    cadConfigurationId: 42,
    cadConfigurationName: 'Random configuration',
  },
};

export const Selected = {
  ...Base,
  args: {
    cadConfigurationId: 42,
    cadConfigurationName: 'Active configuration',
    active: true,
  },
};
