import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './hoops-cutting-section-toolbar';
import { getService, ICuttingService } from '../services';

const meta: Meta = {
  component: 'HoopsCuttingSectionToolbarElement',
  tags: ['autodocs', 'CuttingService'],
  decorators: [
    (story) => {
      return html`<div style="width: 300px;">${story()}</div>`;
    },
  ],
  argTypes: {
    sectionIndex: { control: 'number' },
  },

  render: (args) => {
    const service = getService<ICuttingService>('CuttingService');

    return html`<hoops-cutting-section-toolbar
      sectionIndex=${ifDefined(args.sectionIndex)}
      .service=${service}
    ></hoops-cutting-section-toolbar>`;
  },
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {
    sectionIndex: 0,
  },
};
