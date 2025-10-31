import { html } from 'lit';
import { describe, expect, it, vi, beforeEach, afterAll } from 'vitest';
import { clearServices, registerService } from '../../services';
import { IMeasurementService } from '../../services/measurement';
import { HoopsToolsMeasurementGroupElement } from './hoops-tools-measurement-group';
import { renderTemplate } from '../../testing/utils';
import { OperatorId } from '@ts3d-hoops/web-viewer';
import { IService } from '../../services/types';

/**
 * Simple test for HoopsToolsMeasurementGroupElement focused on interface points and responsibilities
 */
describe('HoopsToolsMeasurementGroupElement', () => {
  let component: HoopsToolsMeasurementGroupElement;
  let mockMeasurementService: IMeasurementService;

  // Mock operators that will be used for measurement tools
  const MOCK_OPERATORS = {
    POINT_POINT: OperatorId.MeasurePointPointDistance,
    FACE_FACE: OperatorId.MeasureFaceFaceDistance,
    FACE_ANGLE: OperatorId.MeasureFaceFaceAngle,
  };

  // Mock measurement types with required structure
  const MOCK_MEASUREMENTS = {
    POINT_POINT: {
      prototype: { constructor: { name: 'MeasurePointPointDistance' } },
      value: '10.5 mm',
    },
    FACE_FACE: {
      prototype: { constructor: { name: 'MeasureFaceFaceDistance' } },
      value: '25.3 mm',
    },
    FACE_ANGLE: {
      prototype: { constructor: { name: 'MeasureFaceFaceAngle' } },
      value: '45.1°',
    },
  };

  /**
   * Creates a mock measurement with the necessary properties and methods
   */
  const createMockMeasurement = (
    config: (typeof MOCK_MEASUREMENTS)[keyof typeof MOCK_MEASUREMENTS],
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mock = {} as any;
    Object.setPrototypeOf(mock, config.prototype);
    mock.getMeasurementText = vi.fn().mockReturnValue(config.value);
    return mock;
  };

  /**
   * Sets up the component with optional measurements
   */
  const setupComponent = async (measurements: unknown[] = []) => {
    // Clear existing services
    clearServices();

    // Create a mock measurement service
    mockMeasurementService = {
      serviceName: 'MeasurementService' as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      measurements: measurements as any[], // Type assertion needed for testing
      removeMeasurement: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      getMeasurementColor: vi.fn().mockReturnValue('#FF0000'),
      setMeasurementColor: vi.fn(),
    };

    // Register the mock service
    registerService(mockMeasurementService as unknown as IService);

    // Render the component
    await renderTemplate(html`<hoops-tools-measurement-group></hoops-tools-measurement-group>`);
    component = document.querySelector(
      'hoops-tools-measurement-group',
    ) as HoopsToolsMeasurementGroupElement;

    // Mock the contextManager for tool operations
    const mockContextManager = {
      webViewer: { measureManager: {} },
      addEventListener: vi.fn(),
      activeToolOperator: undefined,
    };

    // Set the necessary properties on the component
    Object.defineProperty(component, 'contextManager', {
      value: mockContextManager,
      configurable: true,
    });

    // Make sure service is set correctly
    Object.defineProperty(component, 'service', {
      value: mockMeasurementService,
      configurable: true,
    });

    // Update the component
    component.requestUpdate();
    await component.updateComplete;

    return { component, mockMeasurementService, mockContextManager };
  };

  // Helper functions for querying shadow DOM
  const getElementBySelector = (selector: string) => component.shadowRoot?.querySelector(selector);
  const getAllElementsBySelector = (selector: string) =>
    component.shadowRoot?.querySelectorAll(selector) || [];

  // Clean up after all tests
  afterAll(() => {
    clearServices();
  });

  describe('Basic Rendering', () => {
    beforeEach(async () => {
      await setupComponent();
    });

    it('should render component with correct structure', async () => {
      expect(component).toBeInstanceOf(HoopsToolsMeasurementGroupElement);

      // Check basic structure
      const groupElement = getElementBySelector('hoops-tools-group');
      expect(groupElement).toBeTruthy();
      expect(groupElement?.getAttribute('label')).toBe('Measurement');

      // Check that the list container exists
      const measurementList = getElementBySelector('.measurement-list');
      expect(measurementList).toBeTruthy();

      // Check for actions component
      const actionsComponent = getElementBySelector('hoops-tools-measurement-actions');
      expect(actionsComponent).toBeTruthy();
    });

    it('should show empty state when no measurements exist', async () => {
      const emptyState = getElementBySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState?.textContent?.trim()).toBe('No measurements');
    });
  });

  describe('Measurement Service Integration @UI.11.7', () => {
    it('should render measurement items based on service data', async () => {
      const measurements = [
        createMockMeasurement(MOCK_MEASUREMENTS.POINT_POINT),
        createMockMeasurement(MOCK_MEASUREMENTS.FACE_FACE),
      ];

      await setupComponent(measurements);

      // Verify correct number of measurement items
      const measurementItems = getAllElementsBySelector('hoops-tools-measurement-item');
      expect(measurementItems).toHaveLength(2);

      // Check that measurement items exist
      expect(measurementItems[0]).toBeTruthy();
      expect(measurementItems[1]).toBeTruthy();
    });

    it('should update when measurements property changes', async () => {
      // Start with no measurements
      await setupComponent([]);
      expect(getAllElementsBySelector('hoops-tools-measurement-item')).toHaveLength(0);

      // Update with measurements
      const measurements = [createMockMeasurement(MOCK_MEASUREMENTS.POINT_POINT)];
      await setupComponent(measurements);
      expect(getAllElementsBySelector('hoops-tools-measurement-item')).toHaveLength(1);
    });
  });

  describe('Event Handling @UI.11.8', () => {
    it('should handle measurement removal events', async () => {
      const measurements = [createMockMeasurement(MOCK_MEASUREMENTS.POINT_POINT)];
      const { mockMeasurementService } = await setupComponent(measurements);

      // Create and dispatch a removal event
      const measurement = measurements[0];
      const mockEvent = new CustomEvent('hoops-measurement-remove-command', {
        detail: { measurement },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component.handleMeasurementRemoveCommand(mockEvent);

      // Verify service method was called
      expect(mockMeasurementService.removeMeasurement).toHaveBeenCalledWith(measurement);
    });

    it('should handle measurement tool selection events', async () => {
      const { mockContextManager } = await setupComponent([]);

      // Create a tool selection event with proper OperatorId
      const mockEvent = new CustomEvent('measurement-tool-selected', {
        detail: { operator: MOCK_OPERATORS.POINT_POINT },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component.handleMeasurementToolSelection(mockEvent);

      // Verify context manager was updated
      expect(mockContextManager.activeToolOperator).toBe(MOCK_OPERATORS.POINT_POINT);
    });

    it('should not update activeToolOperator if webViewer is unavailable', async () => {
      const { mockContextManager } = await setupComponent([]);

      // Replace webViewer with null to simulate its absence
      Object.defineProperty(mockContextManager, 'webViewer', {
        value: null,
        configurable: true,
      });

      // Create tool selection event
      const mockEvent = new CustomEvent('measurement-tool-selected', {
        detail: { operator: MOCK_OPERATORS.POINT_POINT },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component.handleMeasurementToolSelection(mockEvent);

      // Verify context manager was not updated
      expect(mockContextManager.activeToolOperator).toBeUndefined();
    });
  });

  describe('Service Event Lifecycle @UI.11.7', () => {
    it('should register and unregister event listeners properly', async () => {
      clearServices();

      // Create mock service with spies
      const mockService = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        serviceName: 'MeasurementService' as const,
        measurements: [],
        removeMeasurement: vi.fn(),
        dispatchEvent: vi.fn(),
      };

      registerService(mockService as IService);

      // Create component
      await renderTemplate(html`<hoops-tools-measurement-group></hoops-tools-measurement-group>`);
      component = document.querySelector(
        'hoops-tools-measurement-group',
      ) as HoopsToolsMeasurementGroupElement;

      // Force connected callback
      component.connectedCallback();

      // Verify listeners added
      expect(mockService.addEventListener).toHaveBeenCalledWith(
        'hoops-measurement-updated',
        expect.any(Function),
      );

      // Call disconnectedCallback
      component.disconnectedCallback();

      // Verify listeners removed
      expect(mockService.removeEventListener).toHaveBeenCalledWith(
        'hoops-measurement-updated',
        expect.any(Function),
      );
    });
  });
});
