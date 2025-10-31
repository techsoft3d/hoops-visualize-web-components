import { html } from 'lit';
import { describe, expect, it } from 'vitest';

import { renderTemplate, tick } from '../testing/utils';
import './hoops-model-tree';
import ModelTree from './hoops-model-tree';
import { BranchVisibility, NodeType } from '@ts3d-hoops/web-viewer';

describe('model-tree @UI.1', () => {
  it('Renders', async () => {
    await renderTemplate(html` <hoops-model-tree></hoops-model-tree>`);
    const modelTree: ModelTree = document.querySelector('hoops-model-tree')!;
    await modelTree.updateComplete;
    expect(modelTree).toBeTruthy();
  });
  it('Each node which is not a leaf has an arrow icon @UI.1.5', async () => {
    await renderTemplate(html`<hoops-model-tree></hoops-model-tree>`);
    const modelTree: ModelTree = document.querySelector('hoops-model-tree')!;
    await modelTree.updateComplete;

    modelTree.model = {
      getAbsoluteRootNode: () => 0,
      getNodeChildren: (nodeId: number) => {
        return nodeId === 0 ? [1] : [];
      },
      getNodeName: (nodeId: number) => `-${nodeId}-`,
      getNodeType: () => NodeType.PartInstance,
      getBranchVisibility: (_nodeId: number) => BranchVisibility.Shown,
    };

    await tick();

    const hoopsTree = modelTree.shadowRoot!.querySelector('hoops-tree')!;
    const treeNodes = hoopsTree.shadowRoot!.querySelectorAll('hoops-tree-node');

    expect(treeNodes.length).toBe(2);

    const expandIcons = treeNodes[0].shadowRoot!.querySelectorAll('.expand-icon');
    expect(expandIcons.length).toBe(1);

    const leafIcons = treeNodes[1].shadowRoot!.querySelectorAll('.leaf-icon');
    expect(leafIcons.length).toBe(1);
  });
  it('Each node has an icon corresponding to its type: product occurrence or body @UI.1.6', async () => {
    await renderTemplate(html`<hoops-model-tree></hoops-model-tree>`);
    const modelTree: ModelTree = document.querySelector('hoops-model-tree')!;
    await modelTree.updateComplete;

    modelTree.model = {
      getAbsoluteRootNode: () => 0,
      getNodeChildren: (nodeId: number) => {
        return nodeId === 0 ? [1, 2, 3] : [];
      },
      getNodeName: (nodeId: number) => `-${nodeId}-`,
      getNodeType: (nodeId: number) => {
        if (nodeId === 2) return NodeType.BodyInstance;
        if (nodeId === 3) return NodeType.PartInstance;
        return NodeType.AssemblyNode;
      },
      getBranchVisibility: (_nodeId: number) => BranchVisibility.Shown,
    };

    await tick();

    const hoopsTree = modelTree.shadowRoot!.querySelector('hoops-tree')!;
    const treeNodes = hoopsTree.shadowRoot!.querySelectorAll('hoops-tree-node');

    for (let i = 0; i < 4; i++) {
      const hoopsModelTreeNode = treeNodes[i].shadowRoot!.querySelector('hoops-model-tree-node')!;
      const divIcon = hoopsModelTreeNode.shadowRoot!.querySelector('.type-icon');
      const svgIcon = divIcon!.querySelector('svg');
      expect(svgIcon).toMatchSnapshot();
    }
  });
  it('Each node has a label to show the node name @UI.1.7', async () => {
    await renderTemplate(html`<hoops-model-tree></hoops-model-tree>`);
    const modelTree: ModelTree = document.querySelector('hoops-model-tree')!;
    await modelTree.updateComplete;

    modelTree.model = {
      getAbsoluteRootNode: () => 0,
      getNodeChildren: (nodeId: number) => {
        return nodeId === 0 ? [1] : [];
      },
      getNodeName: (nodeId: number) => `Node ${nodeId}`,
      getNodeType: () => NodeType.PartInstance,
      getBranchVisibility: (_nodeId: number) => BranchVisibility.Shown,
    };

    await tick();

    const hoopsTree = modelTree.shadowRoot!.querySelector('hoops-tree')!;
    const treeNodes = hoopsTree.shadowRoot!.querySelectorAll('hoops-tree-node');

    expect(treeNodes.length).toBe(2);

    const node0 = treeNodes[0].shadowRoot!.querySelector('hoops-model-tree-node')!;
    const node0Title = node0.shadowRoot!.querySelector('.title') as HTMLElement;
    expect(node0Title.textContent?.trim()).toEqual('Node 0');

    const node1 = treeNodes[1].shadowRoot!.querySelector('hoops-model-tree-node')!;
    const node1Title = node1.shadowRoot!.querySelector('.title') as HTMLElement;
    expect(node1Title.textContent?.trim()).toEqual('Node 1');
  });

  it('Each node has a visibility icon @UI.1.8', async () => {
    await renderTemplate(html`<hoops-model-tree></hoops-model-tree>`);
    const modelTree: ModelTree = document.querySelector('hoops-model-tree')!;
    await modelTree.updateComplete;

    modelTree.model = {
      getAbsoluteRootNode: () => 0,
      getNodeChildren: (nodeId: number) => {
        return nodeId === 0 ? [1] : [];
      },
      getNodeName: (nodeId: number) => `-${nodeId}-`,
      getNodeType: () => NodeType.PartInstance,
      getBranchVisibility: (_nodeId: number) => BranchVisibility.Shown,
    };

    await tick();

    const hoopsTree = modelTree.shadowRoot!.querySelector('hoops-tree')!;
    const treeNodes = hoopsTree.shadowRoot!.querySelectorAll('hoops-tree-node');

    for (let i = 0; i < 2; i++) {
      const hoopsModelTreeNode = treeNodes[i].shadowRoot!.querySelector('hoops-model-tree-node');
      expect(hoopsModelTreeNode!.shadowRoot!.querySelector('.visible-icon')).toBeTruthy();
    }
  });
});
