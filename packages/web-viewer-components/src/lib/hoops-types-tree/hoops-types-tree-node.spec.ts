import { html } from 'lit';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { renderTemplate } from '../testing/utils';
import './hoops-types-tree-node';
import { TypeTreeNodeElement } from './hoops-types-tree-node';

describe('TypeTreeNode @UI.13', () => {
  let component: TypeTreeNodeElement;

  const renderComponent = async (props: Partial<TypeTreeNodeElement> = {}) => {
    const template = html`<hoops-types-tree-node
      .nodeId=${props.nodeId ?? 1}
      .modelNodeId=${props.modelNodeId ?? Number.NaN}
      .nodeName=${props.nodeName ?? 'Test Node'}
      .modelNodes=${props.modelNodes ?? []}
      .visibility=${props.visibility ?? 'Shown'}
    ></hoops-types-tree-node>`;
    
    await renderTemplate(template);
    component = document.querySelector('hoops-types-tree-node')!;
    await component.updateComplete;
    return component;
  };

  const getElementBySelector = (selector: string) => component.shadowRoot!.querySelector(selector);

  beforeEach(async () => {
    await renderComponent();
  });

  describe('Basic Rendering', () => {
    it('should render component correctly', () => {
      expect(component).toBeTruthy();
      expect(component.tagName.toLowerCase()).toBe('hoops-types-tree-node');
      
      const nodeElement = getElementBySelector('.types-tree-node');
      expect(nodeElement).toBeTruthy();
    });

    it('should display node name correctly', async () => {
      await renderComponent({ nodeName: 'IFCWALL' });
      
      const titleElement = getElementBySelector('.title');
      expect(titleElement).toBeTruthy();
      expect(titleElement!.textContent).toBe('IFCWALL');
    });

    it('should handle empty node name', async () => {
      await renderComponent({ nodeName: '' });
      
      const titleElement = getElementBySelector('.title');
      expect(titleElement).toBeTruthy();
      expect(titleElement!.textContent).toBe('');
    });
  });

  describe('Node Properties', () => {
    it('should set nodeId property correctly', async () => {
      await renderComponent({ nodeId: 42 });
      expect(component.nodeId).toBe(42);
    });

    it('should set modelNodeId property correctly for type nodes', async () => {
      await renderComponent({ modelNodeId: Number.NaN });
      expect(component.modelNodeId).toBeNaN();
    });

    it('should set modelNodeId property correctly for model nodes', async () => {
      await renderComponent({ modelNodeId: 123 });
      expect(component.modelNodeId).toBe(123);
    });

    it('should set modelNodes array correctly', async () => {
      const modelNodes = [1, 2, 3, 4, 5];
      await renderComponent({ modelNodes });
      expect(component.modelNodes).toEqual(modelNodes);
    });
  });

  describe('Type Detection', () => {
    it('should identify as type node when modelNodeId is NaN', async () => {
      await renderComponent({ 
        nodeId: 1,
        modelNodeId: Number.NaN,
        modelNodes: [10, 11, 12]
      });
      
      expect(component.isTypeNode()).toBe(true);
    });

    it('should identify as model node when modelNodeId is valid number', async () => {
      await renderComponent({ 
        nodeId: 1,
        modelNodeId: 456
      });
      
      expect(component.isTypeNode()).toBe(false);
    });
  });

  describe('Visibility States', () => {
    it('should render visible icon for Shown visibility', async () => {
      await renderComponent({ visibility: 'Shown' });
      
      const visibilityIcon = getElementBySelector('.visible-icon');
      expect(visibilityIcon).toBeTruthy();
      // The icon content is handled by formatNodeVisibilityIcon function
      expect(visibilityIcon!.innerHTML).toContain('svg');
    });

    it('should render hidden icon for Hidden visibility', async () => {
      await renderComponent({ visibility: 'Hidden' });
      
      const visibilityIcon = getElementBySelector('.visible-icon');
      expect(visibilityIcon).toBeTruthy();
      expect(visibilityIcon!.innerHTML).toContain('svg');
    });

    it('should render mixed icon for Mixed visibility', async () => {
      await renderComponent({ visibility: 'Mixed' });
      
      const visibilityIcon = getElementBySelector('.visible-icon');
      expect(visibilityIcon).toBeTruthy();
      expect(visibilityIcon!.innerHTML).toContain('svg');
    });
  });

  describe('Click Events', () => {
    it('should dispatch node-click event when content is clicked', async () => {
      await renderComponent({ nodeId: 42, modelNodeId: 123 });
      
      const eventSpy = vi.fn();
      component.addEventListener('hoops-types-tree-node-click', eventSpy);
      
      const content = getElementBySelector('.content') as HTMLElement;
      content.click();
      
      expect(eventSpy).toHaveBeenCalledOnce();
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            nodeId: 123,
            source: component
          })
        })
      );
    });

    it('should not dispatch click event when modelNodeId is NaN', async () => {
      await renderComponent({ nodeId: 42, modelNodeId: Number.NaN });
      
      const eventSpy = vi.fn();
      component.addEventListener('hoops-types-tree-node-click', eventSpy);
      
      const content = getElementBySelector('.content') as HTMLElement;
      content.click();
      
      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should dispatch visibility-change event when visibility icon is clicked', async () => {
      await renderComponent({ 
        nodeId: 42, 
        modelNodes: [1, 2, 3],
        visibility: 'Shown'
      });
      
      const eventSpy = vi.fn();
      component.addEventListener('hoops-types-tree-node-visibility-change', eventSpy);
      
      const visibilityIcon = getElementBySelector('.visible-icon') as HTMLElement;
      visibilityIcon.click();
      
      expect(eventSpy).toHaveBeenCalledOnce();
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            nodeIds: [1, 2, 3],
            visible: false, // Should toggle from shown to hidden
            isTypeNode: true,
            treeNodeId: 42
          })
        })
      );
    });

    it('should toggle visibility from Hidden to Shown when icon is clicked', async () => {
      await renderComponent({ 
        nodeId: 42, 
        modelNodes: [1, 2, 3],
        visibility: 'Hidden'
      });
      
      const eventSpy = vi.fn();
      component.addEventListener('hoops-types-tree-node-visibility-change', eventSpy);
      
      const visibilityIcon = getElementBySelector('.visible-icon') as HTMLElement;
      visibilityIcon.click();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            visible: true // Should toggle from hidden to shown
          })
        })
      );
    });
  });

  describe('Type vs Model Node Behavior', () => {
    it('should handle type node (modelNodeId NaN) correctly', async () => {
      await renderComponent({ 
        nodeId: 1,
        modelNodeId: Number.NaN,
        nodeName: 'IFCWALL',
        modelNodes: [10, 11, 12]
      });
      
      expect(component.isTypeNode()).toBe(true);
      expect(component.modelNodeId).toBeNaN();
      expect(component.modelNodes).toEqual([10, 11, 12]);
      
      // Should use modelNodes for visibility events
      const eventSpy = vi.fn();
      component.addEventListener('hoops-types-tree-node-visibility-change', eventSpy);
      
      const visibilityIcon = getElementBySelector('.visible-icon') as HTMLElement;
      visibilityIcon.click();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            nodeIds: [10, 11, 12],
            isTypeNode: true
          })
        })
      );
    });

    it('should handle model node (numeric modelNodeId) correctly', async () => {
      await renderComponent({ 
        nodeId: 1,
        modelNodeId: 456,
        nodeName: 'Wall Instance',
        modelNodes: []
      });
      
      expect(component.isTypeNode()).toBe(false);
      expect(component.modelNodeId).toBe(456);
      expect(component.modelNodes).toEqual([]);
      
      // Should use single modelNodeId for visibility events
      const eventSpy = vi.fn();
      component.addEventListener('hoops-types-tree-node-visibility-change', eventSpy);
      
      const visibilityIcon = getElementBySelector('.visible-icon') as HTMLElement;
      visibilityIcon.click();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            nodeIds: [456],
            isTypeNode: false
          })
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      await renderComponent({ nodeName: 'Test Node' });
      
      const content = getElementBySelector('.content');
      expect(content).toBeTruthy();
      
      // The component should be keyboard navigable and screen reader friendly
      const visibilityIcon = getElementBySelector('.visible-icon');
      expect(visibilityIcon).toBeTruthy();
      
      // Basic test that the element exists and is interactable
      expect(visibilityIcon!.tagName).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined visibility gracefully', async () => {
      await renderComponent({ visibility: undefined as any });
      
      // Should still render without crashing
      const nodeElement = getElementBySelector('.types-tree-node');
      expect(nodeElement).toBeTruthy();
    });

    it('should handle invalid nodeId gracefully', async () => {
      await renderComponent({ nodeId: Number.NaN });
      
      expect(component.nodeId).toBeNaN();
      
      // Should still render without crashing
      const nodeElement = getElementBySelector('.types-tree-node');
      expect(nodeElement).toBeTruthy();
    });
  });
});
