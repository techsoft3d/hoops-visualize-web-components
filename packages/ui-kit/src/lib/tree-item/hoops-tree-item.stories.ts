import { Args, Meta, StoryObj } from '@storybook/web-components';
import { html, nothing } from 'lit';

import './hoops-tree-item';
import { ifDefined } from 'lit-html/directives/if-defined.js';

const meta: Meta = {
  component: 'hoops-tree-item',
};

export default meta;
type Story = StoryObj;

export const Empty: Story = {
  argTypes: {
    expanded: {
      control: 'boolean',
      description: 'Whether the tree item is expanded or not.',
      defaultValue: true,
    },
    label: {
      control: 'text',
      description: 'The label of the tree item.',
      defaultValue: 'Tree Item',
    },
    selected: {
      control: 'boolean',
      description: 'Whether the tree item is selected or not.',
      defaultValue: false,
    },
    leaf: {
      control: 'boolean',
      description: 'Whether the tree item is a leaf node (no children).',
      defaultValue: false,
    },
    children: {
      control: 'object',
    },
    icon: {
      control: 'text',
      description: 'The icon to display in the tree item.',
      defaultValue: undefined,
    },
  },
  args: {},
  render: (args) => {
    const renderItem = (args: Args) => {
      return html`<hoops-tree-item
        ?leaf=${args.leaf}
        ?expanded=${args.expanded}
        ?selected=${args.selected}
      >
        ${ifDefined(args.icon ? html`<span slot="icon">${args.icon}</span>` : nothing)}
        ${ifDefined(args.label)}
        ${!args.children
          ? nothing
          : html`<div slot="children">
              ${args.children.map((child: Args) => renderItem(child))}
            </div>`}
      </hoops-tree-item>`;
    };

    return renderItem(args);
  },
};

export const WithLabel = {
  ...Empty,
  args: {
    label: 'Tree Item with Label',
  },
};

export const Leaf = {
  ...Empty,
  args: {
    label: 'Tree Item leaf',
    leaf: true,
  },
};

export const Selected = {
  ...Empty,
  args: {
    label: 'Tree Item selected',
    selected: true,
  },
};

export const LeafSelected = {
  ...Empty,
  args: {
    label: 'Tree Item selected',
    leaf: true,
    selected: true,
  },
};

export const WithChildren = {
  ...Empty,
  args: {
    label: 'Tree Item with Children',
    children: [
      { label: 'Child 1', leaf: true },
      { label: 'Child 2', leaf: true },
      { label: 'Child 3', leaf: true },
    ],
  },
};

export const WithNestedChildren = {
  ...Empty,
  args: {
    label: 'Tree Item with Nested Children',
    children: [
      {
        label: 'Child 1',
        expanded: true,
        children: [
          { label: 'Grandchild 1', leaf: true, selected: true },
          { label: 'Grandchild 2', leaf: true },
        ],
      },
      {
        label: 'Child 2',
        children: [{ label: 'Grandchild 3', leaf: true }],
      },
    ],
  },
};

export const WithIcon: Story = {
  argTypes: {
    expanded: {
      control: 'boolean',
      description: 'Whether the tree item is expanded or not.',
      defaultValue: true,
    },
    selected: {
      control: 'boolean',
      description: 'Whether the tree item is selected or not.',
      defaultValue: false,
    },
  },
  args: {
    expanded: true,
    selected: false,
  },
  render: (args) => {
    return html`<hoops-tree-item ?expanded=${args.expanded} ?selected=${args.selected}>
      <span slot="icon">📁</span>
      Root with Icon
      <div slot="children">
        <hoops-tree-item leaf>Child 1</hoops-tree-item>
        <hoops-tree-item leaf>Child 2</hoops-tree-item>
        <hoops-tree-item leaf>Child 3</hoops-tree-item>
      </div>
    </hoops-tree-item>`;
  },
};
