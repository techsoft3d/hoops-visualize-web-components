import type { Meta, StoryObj } from '@storybook/web-components';

import './hoops-list-element';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

const meta: Meta = {
  component: 'hoops-list',
  tags: ['autodocs'],
  argTypes: {
    key: { type: 'number' },
    name: { type: 'string' },
    selected: { type: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
  render: (args) => {
    return html`<hoops-list-element elementId=${ifDefined(args.key)} ?selected=${args.selected}
      >${args.name}
    </hoops-list-element>`;
  },
};

export const WithKey = {
  ...Base,
  args: {
    key: 0,
    name: 'List element',
  },
};

export const Selected = {
  ...Base,
  args: {
    key: 0,
    name: 'List element',
    selected: true,
  },
};
