import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import TypesTree from './hoops-types-tree';

import './hoops-types-tree';

const meta: Meta = {
  component: 'hoops-types-tree',
  parameters: {
    docs: {
      description: {
        component: 'A tree component that displays model elements grouped by their IFC types. Supports visibility toggling and selection of type groups and individual elements.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: () => {
    return html`<div style="height: 400px; width: 300px; border: 1px solid #ccc;">
      <hoops-types-tree></hoops-types-tree>
    </div>`;
  },
};

// Mock model that simulates a typical IFC building model
const mockModel = {
  getCadViewMap: () => new Map<number, string>(),
  isAnnotationView: (_cadViewId: number) => false,
  isCombineStateView: (_cadViewId: number) => false,
  getNodeChildren: (_nodeId: number) => [], // Mock empty children
  getGenericTypeIdMap: () => new Map<string, Set<number>>([
    ['IFCWALL', new Set([101, 102, 103, 104, 105])],
    ['IFCWINDOW', new Set([201, 202, 203, 204])],
    ['IFCDOOR', new Set([301, 302, 303])],
    ['IFCBUILDINGSTOREY', new Set([401, 402, 403, 404])],
    ['IFCSLAB', new Set([501, 502, 503])],
    ['IFCBEAM', new Set([601, 602, 603, 604, 605, 606])],
    ['IFCCOLUMN', new Set([701, 702, 703, 704])],
    ['IFCROOF', new Set([801])],
  ]),
  getNodeName: (nodeId: number) => {
    // Generate realistic names based on node ID ranges
    if (nodeId >= 101 && nodeId <= 105) return `Wall ${nodeId - 100}`;
    if (nodeId >= 201 && nodeId <= 204) return `Window ${nodeId - 200}`;
    if (nodeId >= 301 && nodeId <= 303) return `Door ${nodeId - 300}`;
    if (nodeId >= 401 && nodeId <= 404) return `Floor ${nodeId - 400}`;
    if (nodeId >= 501 && nodeId <= 503) return `Slab ${nodeId - 500}`;
    if (nodeId >= 601 && nodeId <= 606) return `Beam ${nodeId - 600}`;
    if (nodeId >= 701 && nodeId <= 704) return `Column ${nodeId - 700}`;
    if (nodeId === 801) return 'Main Roof';
    return `Node ${nodeId}`;
  },
  getBranchVisibility: (nodeId: number) => {
    // Mock visibility - some elements are hidden by default
    if (nodeId >= 401 && nodeId <= 404) return 0; // Hidden floors
    return 1; // Shown
  }
};

export const WithBuildingModel: Story = {
  args: {},
  render: () => {
    return html`<div style="height: 500px; width: 350px; border: 1px solid #ccc; padding: 10px;">
      <h3 style="margin: 0 0 10px 0; font-size: 14px;">Building Types Tree</h3>
      <hoops-types-tree id="building-tree"></hoops-types-tree>
    </div>`;
  },
  play: ({ canvasElement }) => {
    const tree = canvasElement.querySelector('#building-tree') as TypesTree;
    tree.model = mockModel;
  },
};

// Simplified model for basic testing
const simpleModel = {
  getCadViewMap: () => new Map<number, string>(),
  isAnnotationView: (_cadViewId: number) => false,
  isCombineStateView: (_cadViewId: number) => false,
  getNodeChildren: (_nodeId: number) => [], // Mock empty children
  getGenericTypeIdMap: () => new Map<string, Set<number>>([
    ['IFCWALL', new Set([1, 2, 3])],
    ['IFCWINDOW', new Set([4, 5])],
  ]),
  getNodeName: (nodeId: number) => {
    switch (nodeId) {
      case 1: return 'Exterior Wall A';
      case 2: return 'Interior Wall B';
      case 3: return 'Partition Wall C';
      case 4: return 'Window 1';
      case 5: return 'Window 2';
      default: return `Node ${nodeId}`;
    }
  },
  getBranchVisibility: () => 1, // All shown
};

export const SimpleExample: Story = {
  args: {},
  render: () => {
    return html`<div style="height: 300px; width: 280px; border: 1px solid #ccc;">
      <hoops-types-tree id="simple-tree"></hoops-types-tree>
    </div>`;
  },
  play: ({ canvasElement }) => {
    const tree = canvasElement.querySelector('#simple-tree') as TypesTree;
    tree.model = simpleModel;
  },
};

export const Themed: Story = {
  ...WithBuildingModel,
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
