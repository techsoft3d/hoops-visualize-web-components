import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import './hoops-cutting-plane';
import { getService, ICuttingService } from '../services';

const meta: Meta = {
  component: 'HoopsCuttingPlaneElement',
  tags: ['autodocs', 'CuttingService'],
  decorators: [
    (story) => {
      return html`<div style="width: 300px;">${story()}</div>`;
    },
  ],
  argTypes: {
    sectionIndex: { control: 'number' },
    planeIndex: { control: 'number' },
  },

  render: (args) => {
    const service = getService<ICuttingService>('CuttingService');

    return html`<hoops-cutting-plane
      sectionIndex=${args.sectionIndex}
      planeIndex=${args.planeIndex}
      .service=${service}
    ></hoops-cutting-plane>`;
  },
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {
    sectionIndex: 0,
    planeIndex: 0,
  },
};
