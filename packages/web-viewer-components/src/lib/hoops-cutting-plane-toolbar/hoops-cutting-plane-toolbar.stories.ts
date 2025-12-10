import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './hoops-cutting-plane-toolbar';
import { getService, ICuttingService } from '../services';

const meta: Meta = {
  component: 'HoopsCuttingPlaneToolbarElement',
  tags: ['autodocs', 'CuttingService'],
  argTypes: {
    sectionIndex: { control: 'number', defaultValue: 0 },
    planeIndex: { control: 'number', defaultValue: 0 },
  },
  render: (args) => {
    const service = getService<ICuttingService>('CuttingService');

    return html`<hoops-cutting-plane-toolbar
      .service=${service}
      .sectionIndex=${args.sectionIndex}
      .planeIndex=${args.planeIndex}
    ></hoops-cutting-plane-toolbar>`;
  },
};
export default meta;

type Story = StoryObj;

export const Base: Story = { args: { sectionIndex: 0, planeIndex: 0 } };
