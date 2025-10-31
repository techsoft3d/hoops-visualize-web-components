import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './hoops-settings-controls-section';

const meta: Meta = {
  component: 'hoops-settings-controls-section',
  tags: ['WalkOperatorService'],
};

export default meta;

type Story = StoryObj;

export const Base: Story = {
  argTypes: {
    walkMode: {
      control: 'select',
      options: ['Mouse', 'Keyboard'],
      description: 'Controls the walk mode of the viewer.',
    },
  },
  args: {
    walkMode: 'Mouse',
  },
  render: (_args) => html`<hoops-settings-controls-section></hoops-settings-controls-section>`,
};
