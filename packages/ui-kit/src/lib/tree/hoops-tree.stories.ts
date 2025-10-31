import type { Meta, StoryObj } from '@storybook/web-components';

import './hoops-tree';
import { html, HTMLTemplateResult, nothing } from 'lit';
import Tree from './hoops-tree';
import { downIcon, rightIcon } from '../icons';

const meta: Meta = {
  component: 'hoops-tree',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
  render: () => {
    return html`<hoops-tree></hoops-tree>`;
  },
};

export const WithCustomData: Story = {
  ...Base,
};

const data = {
  childrenMap: new Map<number, number[]>([
    [0, [1, 2]],
    [2, [3, 4, 5, 6]],
    [6, [7, 8, 9]],
  ]),
  contentMap: new Map<number, HTMLTemplateResult>(
    [...Array(10)].map((_, index) => {
      return [index, html`#${index}`];
    }),
  ),
};

WithCustomData.play = async ({ canvasElement }) => {
  const tree = canvasElement.getElementsByTagName('hoops-tree')[0] as Tree;

  tree.tree = {
    context: {
      expandedIcon: html`${downIcon}`,
      collapsedIcon: html`${rightIcon}`,

      getRoot: () => 0,
      getChildren: (key: number) => data.childrenMap.get(key) ?? [],
      getContent: (_, key: number) => data.contentMap.get(key) ?? nothing,
    },
  };
};

export const WithSelected: Story = {
  ...Base,
};

WithSelected.play = async ({ canvasElement }) => {
  const tree = canvasElement.getElementsByTagName('hoops-tree')[0] as Tree;
  tree.selected = [3, 4, 6];

  tree.tree = {
    context: {
      expandedIcon: html`${downIcon}`,
      collapsedIcon: html`${rightIcon}`,

      getRoot: () => 0,
      getChildren: (key: number) => data.childrenMap.get(key) ?? [],
      getContent: (_, key: number) => data.contentMap.get(key) ?? nothing,
    },
  };

  tree.addEventListener('hoops-tree-node-click', (event) => {
    tree.selected = [event.detail.key];
  });
};

export const ExpandPath: Story = {
  ...Base,
};

ExpandPath.play = async ({ canvasElement }) => {
  const tree = canvasElement.getElementsByTagName('hoops-tree')[0] as Tree;

  tree.tree = {
    context: {
      expandedIcon: html`${downIcon}`,
      collapsedIcon: html`${rightIcon}`,

      getRoot: () => 0,
      getChildren: (key: number) => data.childrenMap.get(key) ?? [],
      getContent: (_, key: number) => data.contentMap.get(key) ?? nothing,
    },
  };

  tree.expandPath([0, 2]);
};

export const RefreshedData: Story = {
  ...Base,
};

RefreshedData.play = async ({ canvasElement }) => {
  const tree = canvasElement.getElementsByTagName('hoops-tree')[0] as Tree;

  const dynamicData = {
    childrenMap: new Map<number, number[]>([
      [0, [1, 2]],
      [2, [3, 4, 5, 6]],
      [6, [7, 8, 9]],
    ]),
    contentMap: new Map<number, HTMLTemplateResult>(
      [...Array(10)].map((_, index) => {
        return [index, html`#${index}`];
      }),
    ),
  };

  tree.tree = {
    context: {
      expandedIcon: html`${downIcon}`,
      collapsedIcon: html`${rightIcon}`,

      getRoot: () => 0,
      getChildren: (key: number) => dynamicData.childrenMap.get(key) ?? [],
      getContent: (_, key: number) => dynamicData.contentMap.get(key) ?? nothing,
    },
  };

  tree.expandPath([0, 2]);

  dynamicData.childrenMap = new Map<number, number[]>([
    [0, [1, 2, 10]],
    [2, [3, 4, 5, 6]],
    [6, [7, 8, 9]],
    [10, [11, 12]],
  ]);
  dynamicData.contentMap.set(10, html`#10 :)`);
  dynamicData.contentMap.set(11, html`#11 <:)`);
  dynamicData.contentMap.set(12, html`#12 8-)`);
  tree.refreshNodeData(0);

  dynamicData.childrenMap = new Map<number, number[]>([
    [0, [1, 10]],
    [6, [7, 8, 9]],
    [10, [11, 12]],
  ]);
  tree.removeNode(2);
};
