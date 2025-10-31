import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import { downIcon, home } from '../icons';
import './hoops-icon-button';
import HoopsIconButton from './hoops-icon-button';

const meta: Meta = {
  component: 'hoops-icon-button',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {
    size: ['sm', 'md', 'xl'],
  },
  render: (_args) => {
    return html`
      <h2>Images</h2>

      <hoops-icon-button size="xl"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="xl"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="xl"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="xl"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="xl"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="md"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="md"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="md"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="md"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="md"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="sm"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="sm"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="sm"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="sm"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <hoops-icon-button size="sm"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>

      <h2>SVG</h2>

      <hoops-icon-button size="xl">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="xl">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="xl">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="xl">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="xl">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="md">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="md">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="md">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="md">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="md">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="sm">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="sm">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="sm">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="sm">${downIcon}</hoops-icon-button>
      <hoops-icon-button size="sm">${downIcon}</hoops-icon-button>

      <h2>Colors</h2>
      <hoops-icon-button>${home}</hoops-icon-button>
      <hoops-icon-button color="default">${home}</hoops-icon-button>
      <hoops-icon-button color="accent">${home}</hoops-icon-button>

      <h2>Disabled</h2>
      <hoops-icon-button>${home}</hoops-icon-button>
      <hoops-icon-button color="accent" disabled>${home}</hoops-icon-button>
      <hoops-icon-button disabled>${home}</hoops-icon-button>
    `;
  },
};

export const events: Story = {
  play: ({ canvasElement }) => {
    const button = canvasElement.querySelector('hoops-icon-button') as HoopsIconButton;

    button.addEventListener('click', () => {
      const counterElement: HTMLElement = canvasElement.querySelector('#counter')!;
      counterElement.innerText = (Number.parseInt(counterElement.innerText) + 1).toString();
    });
  },

  render: (_args) => {
    return html`
      <hoops-icon-button size="xl"
        ><div
          style="background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%); width: 48px; height:48px;"
        ></div
      ></hoops-icon-button>
      <div id="counter">0</div>
    `;
  },
};
