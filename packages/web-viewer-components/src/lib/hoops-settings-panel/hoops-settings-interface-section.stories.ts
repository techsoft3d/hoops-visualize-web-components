import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './hoops-settings-interface-section';

const meta: Meta = {
  component: 'hoops-settings-interface-section',
  tags: ['ViewService', 'FloorplanService'],
};

export default meta;

type Story = StoryObj;

export const Base: Story = {
  render: () => html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
};
