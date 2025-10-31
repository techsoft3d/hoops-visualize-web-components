import type { Meta, StoryObj } from '@storybook/web-components';
import { userEvent, expect, waitFor } from '@storybook/test';
import { BranchVisibility, NodeType } from '@ts3d-hoops/web-viewer';

import { html } from 'lit';
import ModelTree from './hoops-model-tree';

import './hoops-model-tree';
import { waitForElement } from '../testing/storybook-utils';

const meta: Meta = {
  component: 'hoops-model-tree',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
  render: () => {
    return html`<hoops-model-tree></hoops-model-tree>`;
  },
};

const data = {
  childrenMap: new Map<number, number[]>([
    [0, [1, 2]],
    [2, [3, 4, 5, 6]],
    [6, [7, 8, 9]],
  ]),
  visibilityMap: new Map<number, boolean>([...Array(10)].map((_, index) => [index, true])),
};

const model = {
  getAbsoluteRootNode: () => 0,
  getNodeChildren: (nodeId: number) => data.childrenMap.get(nodeId) ?? [],
  getNodeName: (nodeId: number) => `-${nodeId}-`,
  getNodeType: (nodeId: number) => {
    // NodeType.PartInstance, AssemblyNode, BodyInstance
    if (nodeId === 0) {
      return NodeType.AssemblyNode;
    }

    if (nodeId == 1) {
      return NodeType.PartInstance;
    }

    return data.childrenMap.get(nodeId) && data.childrenMap.get(nodeId)!.length > 0
      ? NodeType.AssemblyNode
      : NodeType.BodyInstance;
  },
  getNodeVisibility: (nodeId: number) => data.visibilityMap.get(nodeId) ?? true,
  setNodesVisibility: (nodeIds: number[], visible: boolean) =>
    nodeIds.forEach((nodeId) => data.visibilityMap.set(nodeId, visible)),
  getBranchVisibility: (_nodeId: number) => BranchVisibility.Shown,
};

Base.play = ({ canvasElement }) => {
  const tree = canvasElement.getElementsByTagName('hoops-model-tree')[0] as ModelTree;
  tree.model = model;

  tree.addEventListener('hoops-model-tree-node-visibility-change', (event) => {
    tree.updateNodeData(event.detail.nodeId, { visible: event.detail.visibility });
  });

  tree.addEventListener('hoops-model-tree-node-click', (event) => {
    tree.selectNodes([event.detail.nodeId], true);
  });
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

            --hoops-svg-stroke-color: red;
          }
        </style>
        <div>${story()}</div>`;
    },
  ],
};

/** When the user click on the icon, the current node expand or collapse its children and the icon change */
export const ExpandCollapse: Story = {
  ...Base,
  tags: ['@UI.1.5'],
  name: 'Expand/Collapse',
};

ExpandCollapse.play = async ({ canvasElement }) => {
  const modelTree = canvasElement.querySelector('hoops-model-tree') as ModelTree;
  const simpleModel = {
    getAbsoluteRootNode: () => 0,
    getNodeChildren: (nodeId: number) => (nodeId === 0 ? [1] : []),
    getNodeName: (nodeId: number) => `-${nodeId}-`,
    getNodeType: () => NodeType.PartInstance,
    getNodeVisibility: (_nodeId: number) => true,
    setNodesVisibility: (_nodeIds: number[], _visible: boolean) => undefined,
    getBranchVisibility: (_nodeId: number) => BranchVisibility.Shown,
  };
  modelTree.model = simpleModel;

  const hoopsTree = modelTree.shadowRoot!.querySelector('hoops-tree')!;

  const rootNode = await waitForElement(() => {
    return hoopsTree.shadowRoot!.querySelector('hoops-tree-node[key="0"]');
  });

  // Check root is expanded and children visible
  expect(rootNode.hasAttribute('expanded')).toBe(true);

  const childrenNode = rootNode.shadowRoot!.querySelector('.children');
  expect(childrenNode).toBeTruthy();
  expect(childrenNode).toBeVisible();

  // Click on the icon
  const expandIcon = rootNode.shadowRoot!.querySelector('.expand-icon');
  expect(expandIcon).toBeTruthy();
  userEvent.click(expandIcon!);

  // Check child is now hidden
  await waitFor(() => expect(childrenNode).not.toBeVisible());
  expect(rootNode.hasAttribute('expanded')).toBe(false);

  // Click again on the icon
  userEvent.click(expandIcon!);

  // Check root is expanded and child is visible again
  await waitFor(() => expect(childrenNode).toBeVisible());
  expect(rootNode.hasAttribute('expanded')).toBe(true);
};

/** Visibility icons are shown according to the branch visibility provided by Model */
export const ParentHide: Story = {
  ...Base,
  tags: ['@UI.1.8'],
  name: 'Parent Hide/Show',
};

ParentHide.play = async ({ canvasElement }) => {
  const modelTree = canvasElement.querySelector('hoops-model-tree') as ModelTree;
  const branchVisibilityMap = new Map<number, BranchVisibility>([
    [0, BranchVisibility.Shown],
    [1, BranchVisibility.Hidden],
    [2, BranchVisibility.Mixed],
  ]);

  const simpleModel = {
    getAbsoluteRootNode: () => 0,
    getNodeChildren: (nodeId: number) => (nodeId === 0 ? [1, 2] : []),
    getNodeName: (nodeId: number) => `-${nodeId}-`,
    getNodeType: () => NodeType.PartInstance,
    getNodeVisibility: (_nodeId: number) => true,
    setNodesVisibility: (_nodeIds: number[], _visible: boolean) => undefined,
    getBranchVisibility: (nodeId: number) =>
      branchVisibilityMap.get(nodeId) ?? BranchVisibility.Shown,
  };
  modelTree.model = simpleModel;

  const hoopsTree = modelTree.shadowRoot!.querySelector('hoops-tree')!;

  const rootNode = await waitForElement(() => {
    return hoopsTree.shadowRoot!.querySelector('hoops-tree-node[key="0"]');
  });

  expect(rootNode.hasAttribute('expanded')).toBe(true);

  const modelTreeRootNode = await waitForElement(() => {
    return rootNode.shadowRoot!.querySelector('hoops-model-tree-node[nodeid="0"]');
  });
  
  // Check root is expanded and children visible
  expect(modelTreeRootNode.getAttribute('visibility')).toBe('Shown');

  const childrenNode = rootNode.shadowRoot!.querySelector('.children');
  expect(childrenNode).toBeTruthy();
  expect(childrenNode).toBeVisible();

  // Check child 1 is hidden
  const hiddenChildNode = await waitForElement(() => {
    return rootNode.querySelector('hoops-tree-node[key="1"]');
  });
  expect(hiddenChildNode).toBeVisible();
  const modelTreeHiddenChildNode = await waitForElement(() => {
    return hiddenChildNode.shadowRoot!.querySelector('hoops-model-tree-node[nodeid="1"]');
  });
  expect(modelTreeHiddenChildNode.getAttribute('visibility')).toBe('Hidden');

  // Check child 2 is partially visible
  const mixedChildNode = await waitForElement(() => {
    return rootNode.querySelector('hoops-tree-node[key="2"]');
  });
  expect(mixedChildNode).toBeVisible();
  const modelTreeMixedChildNode = await waitForElement(() => {
    return mixedChildNode.shadowRoot!.querySelector('hoops-model-tree-node[nodeid="2"]');
  });
  expect(modelTreeMixedChildNode.getAttribute('visibility')).toBe('Mixed');
};