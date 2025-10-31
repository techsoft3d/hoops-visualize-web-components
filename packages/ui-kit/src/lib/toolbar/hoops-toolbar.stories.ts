import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';

import './hoops-toolbar';
import './../common/hoops-separator';

const meta: Meta = {
  component: 'hoops-toolbar',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
  render: () => {
    return html` <style>
        .app {
          height: 80vh;
        }
        .toolbar {
          width: 48px;
          height: 100%;
          background: #fbfbfb;
          border-right: 1px solid var(--hoops-separator-color);
        }
        .button {
          width: 32px;
          height: 32px;
          background-image: radial-gradient(circle, #5c0067 0%, #00d4ff 100%);
          background-size: cover;
        }
      </style>
      <div class="app">
        <div class="toolbar">
          <hoops-toolbar>
            <div class="button"></div>
            <div class="button"></div>
            <hoops-separator direction="horizontal"></hoops-separator>
            <div class="label">L</div>
            <div class="label">A</div>
            <div class="label">B</div>
            <div class="label">E</div>
            <div class="label">L</div>
          </hoops-toolbar>
        </div>
      </div>`;
  },
};
