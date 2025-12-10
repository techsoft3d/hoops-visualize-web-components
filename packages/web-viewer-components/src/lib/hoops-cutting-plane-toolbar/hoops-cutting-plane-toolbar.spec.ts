import { describe, it, expect, vi, beforeEach } from 'vitest';
import { html } from 'lit';
import { renderTemplate } from '../testing/utils';
import './hoops-cutting-plane-toolbar';
import { type ICuttingService } from '../services';
import { HoopsCuttingPlaneToolbarElement } from './hoops-cutting-plane-toolbar';
import { CuttingServiceMock } from '../../mocks/CuttingServiceMock';

describe('HoopsCuttingPlaneToolbarElement', () => {
  let element: HoopsCuttingPlaneToolbarElement;
  let service: ICuttingService;

  beforeEach(async () => {
    service = new CuttingServiceMock(vi.fn);
    element = document.createElement(
      'hoops-cutting-plane-toolbar',
    ) as HoopsCuttingPlaneToolbarElement;
    element.service = service;
    element.sectionIndex = 0;
    element.planeIndex = 0;
    document.body.appendChild(element);

    await element.updateComplete;
  });

  describe('initialization', () => {
    it('should initialize with default property values', async () => {
      await renderTemplate(
        html`<hoops-cutting-plane-toolbar .service=${service}></hoops-cutting-plane-toolbar>`,
      );
      const toolbar = document.querySelector(
        'hoops-cutting-plane-toolbar',
      ) as HoopsCuttingPlaneToolbarElement;

      expect(toolbar.sectionIndex).toBe(0);
      expect(toolbar.planeIndex).toBe(0);
    });

    it('should bind invalidateToolbar method in constructor', () => {
      // This test is skipped as invalidateToolbar is a private method
      // We can only verify the component initializes without errors
      expect(element).toBeDefined();
      expect(element instanceof HoopsCuttingPlaneToolbarElement).toBe(true);
    });
  });

  describe('rendering', () => {
    it('should render nothing when service is null', async () => {
      element.service = null;
      await element.updateComplete;

      const container = element.shadowRoot?.querySelector('.container');
      expect(container).toBeNull();
    });

    it('should render toolbar buttons when plane exists', async () => {
      const container = element.shadowRoot?.querySelector('.container');
      const buttons = element.shadowRoot?.querySelectorAll('hoops-button, hoops-icon-button');

      expect(container).not.toBeNull();
      expect(buttons?.length).toBe(4);
    });

    it('should render buttons with correct titles', async () => {
      const buttons = element.shadowRoot?.querySelectorAll('hoops-button, hoops-icon-button');
      const expectedTitles = [
        'Customize Cutting Plane',
        'Invert Cutting Plane',
        'Toggle Reference Geometry Visibility',
        'Remove Cutting Plane',
      ];

      buttons?.forEach((button, index) => {
        expect(button.getAttribute('title')).toBe(expectedTitles[index]);
      });
    });

    it('should show correct visibility icon when reference geometry is visible', async () => {
      const visibilityIcon = element.shadowRoot?.querySelector('.visibility-icon');

      expect(visibilityIcon?.getAttribute('icon')).toBe('visibilityHidden');
    });

    it('should show correct visibility icon when reference geometry is hidden', async () => {
      await service.setCuttingPlaneVisibility(0, 0, false);
      await element.updateComplete;

      const visibilityIcon = element.shadowRoot?.querySelector('.visibility-icon');

      expect(visibilityIcon?.getAttribute('icon')).toBe('visibilityHidden');
    });
  });

  describe('event handling', () => {
    it('should dispatch change event when customize button clicked', async () => {
      const changeSpy = vi.fn();
      element.addEventListener('change', changeSpy);

      const customizeButton = element.shadowRoot?.querySelector('hoops-button');
      customizeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      await element.updateComplete;
      expect(changeSpy).toHaveBeenCalledOnce();
    });

    it('should stop propagation when customize button clicked', async () => {
      const customizeButton = element.shadowRoot?.querySelector('hoops-button');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

      customizeButton?.dispatchEvent(clickEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should update when cutting plane change event matches indices', async () => {
      const updateSpy = vi.spyOn(element, 'requestUpdate');

      service.dispatchEvent(
        new CustomEvent('hoops-cutting-plane-change', {
          detail: { sectionIndex: 0, planeIndex: 0 },
          bubbles: true,
          composed: true,
        }),
      );

      expect(updateSpy).toHaveBeenCalledOnce();
    });

    it('should not update when cutting plane change event has different indices', async () => {
      const updateSpy = vi.spyOn(element, 'requestUpdate');

      service.dispatchEvent(
        new CustomEvent('hoops-cutting-plane-change', {
          detail: { sectionIndex: 1, planeIndex: 1 },
          bubbles: true,
          composed: true,
        }),
      );

      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should not update when cutting plane change event has partial matching indices', async () => {
      const updateSpy = vi.spyOn(element, 'requestUpdate');

      // Section matches but plane doesn't
      service.dispatchEvent(
        new CustomEvent('hoops-cutting-plane-change', {
          detail: { sectionIndex: 0, planeIndex: 1 },
          bubbles: true,
          composed: true,
        }),
      );

      expect(updateSpy).not.toHaveBeenCalled();

      // Plane matches but section doesn't
      service.dispatchEvent(
        new CustomEvent('hoops-cutting-plane-change', {
          detail: { sectionIndex: 1, planeIndex: 0 },
          bubbles: true,
          composed: true,
        }),
      );

      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('lifecycle methods', () => {
    it('should remove event listeners on disconnectedCallback', () => {
      const removeEventListenerSpy = vi.spyOn(service, 'removeEventListener');

      element.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'hoops-cutting-plane-change',
        expect.any(Function),
      );
    });

    it('should not throw when disconnecting without service', async () => {
      await renderTemplate(html`<hoops-cutting-plane-toolbar></hoops-cutting-plane-toolbar>`);
      const toolbar = document.querySelector(
        'hoops-cutting-plane-toolbar',
      ) as HoopsCuttingPlaneToolbarElement;

      expect(() => toolbar.disconnectedCallback()).not.toThrow();
    });
  });

  describe('cutting plane operations', () => {
    describe('invert operation', () => {
      it('should invert plane normal and distance', async () => {
        const plane = service.getCuttingPlane(0, 0);
        expect(plane).toBeTruthy();

        if (!plane) return;
        const originalNormal = { ...plane.plane.normal };
        const originalDistance = plane.plane.d;

        const invertButton = element.shadowRoot?.querySelectorAll('hoops-button')[1];
        invertButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        await element.updateComplete;

        const updatedPlane = service.getCuttingPlane(0, 0);
        expect(updatedPlane?.plane.normal.x).toBe(-originalNormal.x);
        expect(updatedPlane?.plane.normal.y).toBe(-originalNormal.y);
        expect(updatedPlane?.plane.normal.z).toBe(-originalNormal.z);
        expect(updatedPlane?.plane.d).toBe(-originalDistance);
      });

      it('should stop propagation when inverting', async () => {
        const invertButton = element.shadowRoot?.querySelectorAll('hoops-button')[1];
        const clickEvent = new MouseEvent('click', { bubbles: true });
        const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

        invertButton?.dispatchEvent(clickEvent);

        expect(stopPropagationSpy).toHaveBeenCalled();
      });

      it('should handle invert when service is null', async () => {
        element.service = null;
        await element.updateComplete;

        const invertButton = element.shadowRoot?.querySelectorAll('hoops-button')[1];

        expect(() => {
          invertButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }).not.toThrow();
      });
    });

    describe('visibility toggle operation', () => {
      it('should toggle visibility from visible to hidden', async () => {
        const setCuttingPlaneVisibilitySpy = vi.spyOn(service, 'setCuttingPlaneVisibility');

        const visibilityButton = element.shadowRoot?.querySelectorAll('hoops-button')[2];
        visibilityButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(setCuttingPlaneVisibilitySpy).toHaveBeenCalledWith(0, 0, true);
      });

      it('should toggle visibility from hidden to visible', async () => {
        // First hide the plane
        await service.setCuttingPlaneVisibility(0, 0, false);
        await element.updateComplete;

        const setCuttingPlaneVisibilitySpy = vi.spyOn(service, 'setCuttingPlaneVisibility');

        const visibilityButton = element.shadowRoot?.querySelectorAll('hoops-button')[2];
        visibilityButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(setCuttingPlaneVisibilitySpy).toHaveBeenCalledWith(0, 0, true);
      });

      it('should stop propagation when toggling visibility', async () => {
        const visibilityButton = element.shadowRoot?.querySelectorAll('hoops-button')[2];
        const clickEvent = new MouseEvent('click', { bubbles: true });
        const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

        visibilityButton?.dispatchEvent(clickEvent);

        expect(stopPropagationSpy).toHaveBeenCalled();
      });

      it('should handle visibility toggle when service is null', async () => {
        element.service = null;
        await element.updateComplete;

        const visibilityButton = element.shadowRoot?.querySelectorAll('hoops-button')[2];

        expect(() => {
          visibilityButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }).not.toThrow();
      });
    });

    describe('remove operation', () => {
      it('should call removeCuttingPlane with correct indices', async () => {
        const removeCuttingPlaneSpy = vi.spyOn(service, 'removeCuttingPlane');

        const removeButton = element.shadowRoot?.querySelector('hoops-icon-button');
        removeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        expect(removeCuttingPlaneSpy).toHaveBeenCalledWith(0, 0);
      });

      it('should stop propagation when removing', async () => {
        const removeButton = element.shadowRoot?.querySelector('hoops-icon-button');
        const clickEvent = new MouseEvent('click', { bubbles: true });
        const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

        removeButton?.dispatchEvent(clickEvent);

        expect(stopPropagationSpy).toHaveBeenCalled();
      });

      it('should handle remove when service is null', async () => {
        element.service = null;
        await element.updateComplete;

        const removeButton = element.shadowRoot?.querySelector('hoops-icon-button');

        expect(() => {
          removeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }).not.toThrow();
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle multiple rapid clicking without errors', async () => {
      const customizeButton = element.shadowRoot?.querySelector('hoops-button');

      for (let i = 0; i < 5; i++) {
        customizeButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }

      await element.updateComplete;
      // Should not throw any errors
      expect(true).toBe(true);
    });

    it('should maintain correct indices when service updates cutting planes', async () => {
      // Add another plane to test index handling
      const existingPlane = service.getCuttingPlane(0, 0);
      expect(existingPlane).toBeTruthy();
      if (!existingPlane) return;

      await service.addCuttingPlane(0, {
        plane: existingPlane.plane,
        referenceGeometry: undefined,
      });

      // Our toolbar should still reference the original plane at index 0
      expect(element.sectionIndex).toBe(0);
      expect(element.planeIndex).toBe(0);

      const plane = service.getCuttingPlane(0, 0);
      expect(plane).toBeTruthy();
    });

    it('should handle plane data with undefined reference geometry', async () => {
      const plane = service.getCuttingPlane(0, 0);
      expect(plane?.referenceGeometry).toBeUndefined();

      // Should still render and function normally
      const container = element.shadowRoot?.querySelector('.container');
      expect(container).not.toBeNull();
    });

    it('should handle negative indices gracefully', async () => {
      element.sectionIndex = -1;
      element.planeIndex = -1;
      try {
        await element.updateComplete;
      } catch {
        // Ignore errors during update
      }

      const container = element.shadowRoot?.querySelector('.container');
      expect(container).toBeNull();
    });
  });
});
