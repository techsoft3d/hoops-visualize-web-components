import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './hoops-icon';

const meta: Meta = {
  component: 'hoops-icon',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  argTypes: {
    icon: {
      control: 'text',
      description: 'The icon to display',
      defaultValue: 'rightIcon',
    },
  },
  render: (args) => {
    console.log(args);

    return html`<div style="height: 4rem;">
      <hoops-icon icon=${args.icon} style="width: 4rem"></hoops-icon>
    </div>`;
  },
};
