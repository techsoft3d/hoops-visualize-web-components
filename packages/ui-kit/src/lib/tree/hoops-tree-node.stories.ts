import type { Meta, StoryObj } from '@storybook/web-components';

import './hoops-tree-node';
import { html, HTMLTemplateResult, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { provide } from '@lit/context';
import type { ContextWrapper } from './context';
import { treeContext } from './context';

import { dotIcon, downIcon, rightIcon } from '../icons';
import TreeNode, { TreeNodeExpandEvent } from './hoops-tree-node';

const data = {
  childrenMap: new Map<number, number[]>([
    [0, [1, 2]],
    [2, [3, 4, 5, 6]],
    [6, [7, 8, 9]],
  ]),
  contentMap: new Map<number, HTMLTemplateResult>(
    [...Array(10)].map((_, index) => {
      return [index, html`#$${index}`];
    }),
  ),
};

@customElement('test-decorator')
export class Decorator extends LitElement {
  @provide({ context: treeContext })
  @state()
  tree: ContextWrapper = {
    context: {
      expandedIcon: html`${downIcon}`,
      collapsedIcon: html`${rightIcon}`,
      leafIcon: html`${dotIcon}`,

      getRoot: () => 0,
      getChildren: (key: number) => data.childrenMap.get(key) ?? [],
      getContent: (_, key: number) => data.contentMap.get(key) ?? nothing,
    },
  };

  @state()
  expanded = new Set<number>();

  render() {
    return html`<div
      @hoops-tree-node-expand=${(event: TreeNodeExpandEvent) => {
        const node = event.detail.source as TreeNode;
        node.expanded = event.detail.expanded;
      }}
    >
      <slot></slot>
    </div>`;
  }
}

const meta: Meta = {
  component: 'hoops-tree',
  tags: ['autodocs'],
  decorators: [(story) => html`<test-decorator>${story()}</test-decorator>`],
  argTypes: {
    key: { type: 'number' },
    expanded: { type: 'boolean' },
    selected: { type: 'boolean' },
    leaf: { type: 'boolean' },
  },
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
  render: (args) => {
    return html`<hoops-tree-node
      key=${ifDefined(args.key)}
      ?expanded=${args.expanded}
      ?selected=${args.selected}
      ?leaf=${args.leaf}
      @hoops-tree-node-expand=${(event: TreeNodeExpandEvent) => {
        const elm = event.detail.source;
        if (event.detail.expanded) {
          elm.setAttribute('expanded', 'true');
        } else {
          elm.removeAttribute('expanded');
        }
      }}
    >
    </hoops-tree-node>`;
  },
};

export const WithRootKey = {
  ...Base,
  args: {
    key: 0,
  },
};

export const WithKey = {
  ...Base,
  args: {
    key: 1,
  },
};

export const Expanded = {
  ...Base,
  args: {
    key: 0,
    expanded: true,
  },
};

export const Leaf = {
  ...Base,
  args: {
    key: 0,
    leaf: true,
  },
};

export const Selected = {
  ...Base,
  args: {
    key: 0,
    selected: true,
  },
};
