import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import '../button/hoops-button';
import '../icon-button/hoops-icon-button';

import { appMenuIcon } from '../icons';
import './dropdown';

const meta: Meta = {
  component: 'Dropdown',
  tags: ['autodocs', 'dropdown'],
  decorators: [
    (story) => {
      return html`<div style="width: 400px;height: 250px">${story()}</div>`;
    },
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: (_args) => html`
    <style>
      .grid {
        display: grid;
        grid-template-columns: auto auto auto auto;
      }
    </style>
    <hoops-dropdown>
      <hoops-icon-button>O</hoops-icon-button>
      <div slot="dropdown-popup" class="grid">
        <hoops-icon-button>A</hoops-icon-button>
        <hoops-icon-button>B</hoops-icon-button>
        <hoops-icon-button>C</hoops-icon-button>
        <hoops-icon-button>D</hoops-icon-button>
        <hoops-icon-button>E</hoops-icon-button>
        <hoops-icon-button>F</hoops-icon-button>
        <hoops-icon-button>G</hoops-icon-button>
        <hoops-icon-button>H</hoops-icon-button>
        <hoops-icon-button>I</hoops-icon-button>
      </div>
    </hoops-dropdown>

    <hoops-dropdown>
      <hoops-icon-button>O</hoops-icon-button>
      <div slot="dropdown-popup">
        <hoops-button><span slot="icon">${appMenuIcon}</span>Hello</hoops-button>
        <hoops-button><span slot="icon">${appMenuIcon}</span>World</hoops-button>
      </div>
    </hoops-dropdown>
  `,
};

export const DropdownPosition: Story = {
  args: {},
  render: (_args) => html`
    ${['top', 'bottom'].map(
      (position) => html`
        ${['left', 'right'].map(
          (anchor) => html`
            <hoops-dropdown position="${position}" anchor="${anchor}">
              <hoops-button>${position}-${anchor}</hoops-button>
              <div slot="dropdown-popup">
                <div style="width:200px;height:200px;background-color:red;">A</div>
              </div>
            </hoops-dropdown>
          `,
        )}
      `,
    )}
    ${['left', 'right'].map(
      (position) => html`
        ${['top', 'bottom'].map(
          (anchor) => html`
            <hoops-dropdown position="${position}" anchor="${anchor}">
              <hoops-button>${position}-${anchor}</hoops-button>
              <div slot="dropdown-popup">
                <div style="width:200px;height:200px;background-color:red;">A</div>
              </div>
            </hoops-dropdown>
          `,
        )}
      `,
    )}
  `,
};

export const DropdownNoActivable: Story = {
  args: {},
  render: (_args) => html`
    <hoops-dropdown>
      <hoops-button>Open me please</hoops-button>
      <div slot="dropdown-popup">
        <div style="width:200px; height:200px; background-image: linear-gradient(#e66465, #9198e5);">
      </div>
    </hoops-dropdown>
  `,
};
