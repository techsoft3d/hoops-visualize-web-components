import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import './hoops-cutting-section';
import { getService, ICuttingService } from '../services';

const meta: Meta = {
  component: 'HoopsCuttingSectionElement',
  tags: ['autodocs', 'CuttingService'],
  decorators: [
    (story) => {
      return html`<div style="width: 300px;">${story()}</div>`;
    },
  ],
  argTypes: {
    label: { control: 'text' },
    sectionIndex: { control: 'number' },
  },

  render: (args) => {
    const service = getService<ICuttingService>('CuttingService');

    return html`<hoops-cutting-section
      label="${ifDefined(args.label)}"
      sectionIndex=${ifDefined(args.sectionIndex)}
      .service=${service}
    >
    </hoops-cutting-section>`;
  },
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {
    label: 'Section 1',
    sectionIndex: 0,
  },
};
