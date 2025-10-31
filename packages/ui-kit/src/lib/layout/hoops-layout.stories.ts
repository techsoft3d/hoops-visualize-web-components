import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import './hoops-layout';
import HoopsLayout, { HoopsLayoutSlotName } from './hoops-layout';

const meta: Meta = {
  component: 'hoops-layout',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {
    displayedSlots: [
      'menu-bar',
      'central-widget',
      'status-bar',
      'toolbar-left',
      'panel-left',
      'panel-right',
    ],
    floatingPanels: true,
  },
  argTypes: {
    floatingPanels: {
      control: 'boolean',
    },
    displayedSlots: {
      control: 'check',
      label: 'displayedSlots',
      description: 'enabled',
      options: [
        'menu-bar',
        'status-bar',
        'central-widget',
        'panel-top',
        'panel-bottom',
        'panel-left',
        'panel-right',
        'toolbar-top',
        'toolbar-bottom',
        'toolbar-left',
        'toolbar-right',
      ],
    },
  },
  render: (args) => {
    const conditionalColoredSlot = (slotName: string, color: string) =>
      args.displayedSlots.includes(slotName)
        ? html`<div slot="${slotName}" style="background-color: ${color}">${slotName}</div>`
        : '';

    return html` <style>
        :root {
          --toolbar-size: 48px;
          --panel-size: 300px;
        }
        [slot] {
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
        }
        [slot='central-widget'] {
          background-size: cover;
        }
        [slot^='panel'] {
          opacity: 0.8;
        }
      </style>

      <hoops-layout ?floatingPanels="${args.floatingPanels}">
        ${conditionalColoredSlot('menu-bar', 'red')}
        ${conditionalColoredSlot('toolbar-left', 'green')}
        ${conditionalColoredSlot('toolbar-top', 'purple')}
        ${conditionalColoredSlot('toolbar-bottom', 'orange')}
        ${conditionalColoredSlot('toolbar-right', 'royalblue')}
        ${conditionalColoredSlot('central-widget', 'lightblue')}
        ${conditionalColoredSlot('panel-left', 'hotpink')}
        ${conditionalColoredSlot('panel-top', 'chartreuse')}
        ${conditionalColoredSlot('panel-bottom', 'grey')}
        ${conditionalColoredSlot('panel-right', 'orangered')}
        ${conditionalColoredSlot('status-bar', 'cyan')}
      </hoops-layout>`;
  },
};

export const ExternalApi: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const hoopsLayoutComponent = canvasElement.querySelector<HoopsLayout>('hoops-layout');
    if (!hoopsLayoutComponent) {
      throw new Error('hoops-layout component not found');
    }
    Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-toggle-target]')).forEach((el) =>
      el.addEventListener(
        'click',
        hoopsLayoutComponent.toggleSlotVisibility.bind(
          this,
          el.dataset.toggleTarget as HoopsLayoutSlotName,
        ),
      ),
    );
  },
  render: () => {
    return html` <style>
        :root {
          --toolbar-size: 48px;
          --panel-size: 300px;
        }
      </style>
      <hoops-layout>
        <div slot="menu-bar">
          <button data-toggle-target="panel-left">Toggle left panel</button>
          <button data-toggle-target="panel-right">Toggle right panel</button>
        </div>
        <div slot="toolbar-left"></div>
        <div slot="panel-left" style="background: red;">Panel left</div>
        <div slot="central-widget"></div>
        <div slot="panel-right">Panel right</div>
        <div slot="status-bar"></div>
      </hoops-layout>`;
  },
};

export const SmallerLayout: Story = {
  args: {},
  render: () => {
    return html` <style>
        :root {
          --hoops-layout-width: 600px;
          --hoops-layout-height: 600px;
        }
      </style>
      <hoops-layout>
        <div slot="menu-bar" style="background-color: crimson;">Menu</div>
        <div slot="panel-left" style="background-color: pink;">Panel right</div>
      </hoops-layout>`;
  },
};
