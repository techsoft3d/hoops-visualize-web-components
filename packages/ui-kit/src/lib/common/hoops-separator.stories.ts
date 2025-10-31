import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import './hoops-separator';

const meta: Meta = {
  component: 'Separator',
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
      .horizontal-layout {
        display: flex;
        width: 250px;
        height: 32px;
        align-items: center;
        padding-left: 8px;
        border: 1px solid;
      }
      .vertical-layout {
        display: flex;
        flex-direction: column;
        height: 250px;
        width: 32px;
        align-items: center;
        padding-top: 8px;
        border: 1px solid;
      }
      p {
        margin: 0;
      }
    </style>
    <div class="horizontal-layout">
      <p>H</p>
      <p>O</p>
      <p>R</p>
      <hoops-separator direction="vertical"></hoops-separator>
      <p>I</p>
      <p>Z</p>
      <p>O</p>
      <hoops-separator direction="vertical"></hoops-separator>
      <p>N</p>
      <p>T</p>
      <p>A</p>
      <hoops-separator direction="vertical"></hoops-separator>
      <p>L</p>
    </div>
    <div class="vertical-layout">
      <p>V</p>
      <p>E</p>
      <p>R</p>
      <hoops-separator direction="horizontal"></hoops-separator>
      <p>T</p>
      <p>I</p>
      <p>C</p>
      <hoops-separator direction="horizontal"></hoops-separator>
      <p>A</p>
      <p>L</p>
    </div>
  `,
};
