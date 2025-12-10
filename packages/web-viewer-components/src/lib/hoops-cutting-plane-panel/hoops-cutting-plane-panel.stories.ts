import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import './hoops-cutting-plane-panel';

const meta: Meta = {
  component: 'HoopsCuttingPlanePanelElement',
  tags: ['autodocs', 'CuttingService'],
  decorators: [
    (story) => {
      return html`<div style="width: 300px;">${story()}</div>`;
    },
  ],
  argTypes: {
    visible: { control: 'boolean' },
  },

  render: () => {
    return html`<hoops-cutting-plane-panel></hoops-cutting-plane-panel>`;
  },
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
};
