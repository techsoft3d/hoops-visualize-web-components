import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import ViewTree from './hoops-view-tree';

import './hoops-view-tree';

const meta: Meta = {
  component: 'hoops-view-tree',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
  render: () => {
    return html`<hoops-view-tree></hoops-view-tree>`;
  },
};

const model = {
  getCadViewMap: () => new Map<number, string>(),
  isAnnotationView: (_cadViewId: number) => true,
  isCombineStateView: (_cadViewId: number) => true,
};

Base.play = ({ canvasElement }) => {
  const tree = canvasElement.getElementsByTagName('hoops-view-tree')[0] as ViewTree;
  tree.model = model;
};

export const Themed = {
  ...Base,
  decorators: [
    (story: any) => {
      return html`<style>
          :root {
            --hoops-neutral-foreground: red;
            --hoops-neutral-foreground-hover: pink;
            --hoops-neutral-foreground-active: pink;

            --hoops-accent-foreground: chartreuse;
            --hoops-accent-foreground-hover: orangered;
            --hoops-accent-foreground-active: royalblue;
          }
        </style>
        <div>${story()}</div>`;
    },
  ],
};
