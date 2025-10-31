import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { viewIso } from '../icons';
import './hoops-button';

const meta: Meta = {
  component: 'hoops-button',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  render: () => {
    return html`
      <h2>Just text</h2>

      <hoops-button>Click me !</hoops-button>

      <h2>With icon</h2>

      <hoops-button><span slot="icon">${viewIso}</span>With Icon</hoops-button>

      <h2>Icon size</h2>

      <hoops-button iconSize="xl"><span slot="icon">${viewIso}</span>Size XL</hoops-button>
      <hoops-button iconSize="md"><span slot="icon">${viewIso}</span>Size MD</hoops-button>
      <hoops-button iconSize="sm"><span slot="icon">${viewIso}</span>Size SM</hoops-button>

      <h2>Colors</h2>

      <hoops-button><span slot="icon">${viewIso}</span>Default</hoops-button>
      <hoops-button color="default"><span slot="icon">${viewIso}</span>Forced default</hoops-button>
      <hoops-button color="accent"><span slot="icon">${viewIso}</span>Accent</hoops-button>

      <h2>Disabled</h2>

      <hoops-button><span slot="icon">${viewIso}</span>Enabled</hoops-button>
      <hoops-button disabled><span slot="icon">${viewIso}</span>Disabled</hoops-button>
      <hoops-button color="accent" disabled
        ><span slot="icon">${viewIso}</span>Accent disabled</hoops-button
      >
    `;
  },
};
