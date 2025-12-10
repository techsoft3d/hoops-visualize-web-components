import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import './hoops-cutting-plane-editor';
import { Plane, Point3, Color } from '@ts3d-hoops/web-viewer';
import type { CuttingPlane } from '../services';
import { registerService, clearServices } from '../services/serviceRegistry';
import { HoopsCuttingPlaneEditorElement } from './hoops-cutting-plane-editor';
import { CuttingServiceMock } from '../../mocks/CuttingServiceMock';

describe('hoops-cutting-plane-editor component', () => {
  let element: HoopsCuttingPlaneEditorElement;
  let service: CuttingServiceMock;

  /**
   * Setup the mock service with a cutting plane for testing
   */
  const setupServiceWithCuttingPlane = (withReferenceGeometry = true) => {
    const plane = new Plane();
    plane.normal.set(0.5, -0.25, 1);
    plane.d = 10;

    const cuttingPlane: CuttingPlane = {
      plane,
      referenceGeometry: withReferenceGeometry ? [new Point3(0, 0, 0)] : undefined,
      color: new Color(10, 20, 30),
      lineColor: new Color(40, 50, 60),
      opacity: 0.8,
    };

    service.getCuttingPlanes(0)[0] = cuttingPlane;
  };

  beforeEach(async () => {
    clearServices();
    service = new CuttingServiceMock(vi.fn);
    setupServiceWithCuttingPlane(true);
    registerService(service);

    document.body.innerHTML = '';
    element = document.createElement(
      'hoops-cutting-plane-editor',
    ) as HoopsCuttingPlaneEditorElement;
    element.sectionIndex = 0;
    element.planeIndex = 0;
    element.service = service;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    // Clean up the element to ensure debouncer is cleared
    if (element && element.isConnected) {
      element.remove();
    }
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  afterAll(() => {
    clearServices();
  });

  it('renders coordinate inputs and color UI when plane exists', async () => {
    const inputs = element.shadowRoot?.querySelectorAll('hoops-coordinate-input') ?? [];
    expect(inputs.length).toBe(4);
    const colorButtons = element.shadowRoot?.querySelectorAll('hoops-color-button') ?? [];
    expect(colorButtons.length).toBe(2);
  });

  it('disables color buttons when referenceGeometry is undefined', async () => {
    // Setup a new service with no reference geometry
    const noRefService = new CuttingServiceMock(vi.fn);
    const plane = new Plane();
    plane.normal.set(0.5, -0.25, 1);
    plane.d = 10;

    const cuttingPlane: CuttingPlane = {
      plane,
      referenceGeometry: undefined,
      color: new Color(10, 20, 30),
      lineColor: new Color(40, 50, 60),
      opacity: 0.8,
    };
    noRefService.getCuttingPlanes(0)[0] = cuttingPlane;
    registerService(noRefService);

    // Create a new element with the service without reference geometry
    document.body.innerHTML = '';
    element = document.createElement(
      'hoops-cutting-plane-editor',
    ) as HoopsCuttingPlaneEditorElement;
    element.service = noRefService;
    document.body.appendChild(element);
    await element.updateComplete;

    const colorButtons = element.shadowRoot?.querySelectorAll('hoops-color-button') ?? [];
    expect(colorButtons.length).toBe(2);
    colorButtons.forEach((btn) => expect(btn.hasAttribute('disabled')).toBe(true));
  });

  it('updates plane normal components and d with debounce, single updateCuttingPlane call', async () => {
    // Use fake timers only for debounce test
    vi.useFakeTimers();

    const inputs = Array.from(element.shadowRoot?.querySelectorAll('hoops-coordinate-input') ?? []);
    expect(inputs.length).toBe(4);

    inputs[0].dispatchEvent(
      new CustomEvent('hoops-coordinate-changed', { detail: { value: 0.1 } }),
    );
    inputs[1].dispatchEvent(
      new CustomEvent('hoops-coordinate-changed', { detail: { value: -0.2 } }),
    );
    inputs[2].dispatchEvent(
      new CustomEvent('hoops-coordinate-changed', { detail: { value: 0.3 } }),
    );
    inputs[3].dispatchEvent(new CustomEvent('hoops-coordinate-changed', { detail: { value: 15 } }));

    vi.advanceTimersByTime(500);
    // Flush pending timers and wait for promises to resolve
    await vi.runAllTimersAsync();

    const currentPlane = service.getCuttingPlane(0, 0);
    expect(currentPlane).toBeTruthy();
    if (!currentPlane) return;

    // Calculate the expected normalized values: the CuttingServiceMock normalizes the normal vector
    // Original input: (0.1, -0.2, 0.3)
    // Magnitude = sqrt(0.1^2 + (-0.2)^2 + 0.3^2) = sqrt(0.01 + 0.04 + 0.09) = sqrt(0.14) ≈ 0.374166...
    // Normalized values: (0.1/0.374166, -0.2/0.374166, 0.3/0.374166)
    const magnitude = Math.sqrt(0.1 * 0.1 + -0.2 * -0.2 + 0.3 * 0.3);
    const expectedNormalX = 0.1 / magnitude;
    const expectedNormalY = -0.2 / magnitude;
    const expectedNormalZ = 0.3 / magnitude;

    expect(currentPlane.plane.normal.x).toBeCloseTo(expectedNormalX, 5);
    expect(currentPlane.plane.normal.y).toBeCloseTo(expectedNormalY, 5);
    expect(currentPlane.plane.normal.z).toBeCloseTo(expectedNormalZ, 5);
    expect(currentPlane.plane.d).toBe(15);

    vi.useRealTimers();
  });

  describe('color interactions', () => {
    it('changes line color via first color button', async () => {
      interface ColorButtonEl extends HTMLElement {
        value?: string;
      }
      const lineColorBtn = element.shadowRoot?.querySelectorAll(
        'hoops-color-button',
      )[0] as ColorButtonEl;

      expect(lineColorBtn).toBeTruthy();
      lineColorBtn.value = '#123456';
      lineColorBtn.dispatchEvent(new Event('change', { bubbles: true }));

      // Verify the call was made to setCuttingPlaneLineColor by checking the cutting plane's lineColor
      const currentPlane = service.getCuttingPlane(0, 0);
      expect(currentPlane?.lineColor?.r).toBe(18);
      expect(currentPlane?.lineColor?.g).toBe(52);
      expect(currentPlane?.lineColor?.b).toBe(86);
    });

    it('changes fill color via second color button', async () => {
      interface ColorButtonEl extends HTMLElement {
        value?: string;
      }
      const fillColorBtn = element.shadowRoot?.querySelectorAll(
        'hoops-color-button',
      )[1] as ColorButtonEl;
      expect(fillColorBtn).toBeTruthy();

      fillColorBtn.value = '#abcdef';
      fillColorBtn.dispatchEvent(new Event('change', { bubbles: true }));

      // Verify the call was made to setCuttingPlaneColor by checking the cutting plane's color
      const currentPlane = service.getCuttingPlane(0, 0);
      expect(currentPlane?.color?.r).toBe(171);
      expect(currentPlane?.color?.g).toBe(205);
      expect(currentPlane?.color?.b).toBe(239);
    });
  });

  describe('opacity control', () => {
    it('changes opacity via slider input', async () => {
      const slider = element.shadowRoot?.querySelector('input[type="range"]') as HTMLInputElement;
      expect(slider).toBeTruthy();

      slider.value = '0.55';
      slider.dispatchEvent(new Event('change', { bubbles: true }));

      // Verify the opacity was set correctly by checking the cutting plane
      const currentPlane = service.getCuttingPlane(0, 0);
      expect(currentPlane?.opacity).toBe(0.55);
    });
  });

  describe('event handling', () => {
    it('reacts to matching hoops-cutting-plane-change event', async () => {
      const spy = vi.spyOn(element, 'requestUpdate');
      service.dispatchEvent(
        new CustomEvent('hoops-cutting-plane-change', {
          detail: { sectionIndex: 0, planeIndex: 0 },
          bubbles: true,
          composed: true,
        }),
      );
      await element.updateComplete;

      expect(spy).toHaveBeenCalled();
    });

    it('ignores non-matching hoops-cutting-plane-change event', async () => {
      const spy = vi.spyOn(element, 'requestUpdate');
      service.dispatchEvent(
        new CustomEvent('hoops-cutting-plane-change', {
          detail: { sectionIndex: 1, planeIndex: 2 },
          bubbles: true,
          composed: true,
        }),
      );
      await element.updateComplete;

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('does not throw when service not available (graceful path)', () => {
      document.body.innerHTML = '';
      const create = () => {
        const orphan = document.createElement('hoops-cutting-plane-editor');
        document.body.appendChild(orphan);
      };
      expect(create).not.toThrow();
    });

    it('renders no coordinate or color UI when cuttingPlane lookup fails', async () => {
      const emptyService = new CuttingServiceMock(vi.fn);
      // Mock getCuttingPlane to return undefined
      emptyService.getCuttingPlane = vi.fn(() => undefined);
      registerService(emptyService);

      const orphan = document.createElement(
        'hoops-cutting-plane-editor',
      ) as HoopsCuttingPlaneEditorElement;
      orphan.sectionIndex = 1;
      orphan.planeIndex = 2;
      document.body.appendChild(orphan);
      await orphan.updateComplete;

      // Styles still render but functional UI elements should be absent
      expect(orphan.shadowRoot?.querySelectorAll('hoops-coordinate-input').length).toBe(0);
      expect(orphan.shadowRoot?.querySelectorAll('hoops-color-button').length).toBe(0);
    });
  });

  describe('utility functions', () => {
    it('htmlToHwvColor returns black for invalid color string', async () => {
      interface Accessor {
        htmlToHwvColor(color: string): Color;
      }
      const accessor = element as unknown as Accessor;
      const bad = accessor.htmlToHwvColor('not-a-color');
      expect(bad.r).toBe(0);
      expect(bad.g).toBe(0);
      expect(bad.b).toBe(0);
    });
  });
});
