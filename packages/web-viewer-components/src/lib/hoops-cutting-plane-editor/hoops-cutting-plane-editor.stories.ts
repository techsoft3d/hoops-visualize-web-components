import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import './hoops-cutting-plane-editor';
import { getService, ICuttingService } from '../services';

const meta: Meta = {
  component: 'HoopsCuttingPlaneEditorElement',
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

    return html`<hoops-cutting-plane-editor
      sectionIndex=${args.sectionIndex}
      planeIndex=${args.planeIndex}
      .service=${service}
    ></hoops-cutting-plane-editor>`;
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
