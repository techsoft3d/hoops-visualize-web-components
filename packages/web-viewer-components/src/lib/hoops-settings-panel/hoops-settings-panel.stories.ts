import type { Meta, StoryObj } from '@storybook/web-components';
import './hoops-settings-panel';
import { html } from 'lit-html';

const meta: Meta = {
  component: 'hoops-settings-panel',
  tags: ['ViewService'],
};

export default meta;

type Story = StoryObj;

export const Base: Story = {
  render: () => html`<hoops-settings-panel></hoops-settings-panel>`,
};
