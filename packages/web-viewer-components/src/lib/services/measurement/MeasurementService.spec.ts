import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import MeasurementService from './MeasurementService';
import { Color, MeasureManager } from '@ts3d-hoops/web-viewer';
import { Operators } from '@ts3d-hoops/web-viewer';

type MeasureMarkup = Operators.Markup.Measure.MeasureMarkup;

describe('MeasurementService', () => {
  let measurementService: MeasurementService;
  let mockMeasureManager: MeasureManager & { _capturedCallbacks?: Record<string, Function> };
  let mockMeasurement: MeasureMarkup;

  /**
   * Set up common test fixtures before each test
   * Creates mock objects for MeasureManager and MeasureMarkup
   */
  beforeEach(() => {
    // Create a mock MeasureManager with essential methods for testing
    // We use a _capturedCallbacks property to store the callbacks for testing
    mockMeasureManager = {
      viewer: {
        setCallbacks: vi.fn((callbacks) => {
          // Store callbacks for later testing
          mockMeasureManager._capturedCallbacks = callbacks;
        }),
      },
      removeMeasurement: vi.fn(),
      getAllMeasurements: vi.fn().mockReturnValue([]),
      getMeasurementColor: vi.fn().mockReturnValue(Color.black()),
      setMeasurementColor: vi.fn(),
      _capturedCallbacks: {},
    } as unknown as MeasureManager & { _capturedCallbacks?: Record<string, Function> };

    // Create a mock MeasureMarkup for testing measurement operations
    mockMeasurement = {
      id: 'test-measurement-id',
      type: 'test-measurement-type',
    } as unknown as MeasureMarkup;

    // Reset all mocks before each test to ensure test isolation
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should initialize without a MeasureManager', () => {
      measurementService = new MeasurementService();
      expect(measurementService.serviceName).toBe('MeasurementService');
      expect(measurementService.measureManager).toBeUndefined();
    });

    it('should initialize with a MeasureManager and bind callbacks', () => {
      measurementService = new MeasurementService(mockMeasureManager);
      expect(measurementService.serviceName).toBe('MeasurementService');
      expect(measurementService.measureManager).toBe(mockMeasureManager);
      expect(mockMeasureManager.viewer.setCallbacks).toHaveBeenCalledOnce();
      expect(mockMeasureManager.viewer.setCallbacks).toHaveBeenCalledWith({
        measurementCreated: expect.any(Function),
        measurementDeleted: expect.any(Function),
      });
    });
  });

  describe('event handling', () => {
    /**
     * Test the events dispatched by the MeasurementService
     * We're verifying that the service properly registers callbacks and dispatches custom events
     */
    describe('measurement events', () => {
      it('should dispatch hoops-measurement-updated event when measurement is created @UI.11.7', () => {
        // Create a new service with the mock manager
        measurementService = new MeasurementService(mockMeasureManager);

        // Set up spy to verify events
        const dispatchSpy = vi.spyOn(measurementService, 'dispatchEvent');

        // Simulate HOOPS triggering the callback
        if (
          mockMeasureManager._capturedCallbacks &&
          mockMeasureManager._capturedCallbacks.measurementCreated
        ) {
          mockMeasureManager._capturedCallbacks.measurementCreated();
        }

        // Verify measurement updated event was dispatched with measurements in detail
        expect(dispatchSpy).toHaveBeenCalledOnce();
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'hoops-measurement-updated',
            bubbles: true,
            composed: true,
            detail: {
              measurements: expect.any(Array),
            },
          }),
        );
      });

      it('should dispatch hoops-measurement-updated event when measurement is deleted @UI.11.8', () => {
        // Create a new service with the mock manager
        measurementService = new MeasurementService(mockMeasureManager);

        // Set up spy to verify events
        const dispatchSpy = vi.spyOn(measurementService, 'dispatchEvent');

        // Simulate HOOPS triggering the callback
        if (
          mockMeasureManager._capturedCallbacks &&
          mockMeasureManager._capturedCallbacks.measurementDeleted
        ) {
          mockMeasureManager._capturedCallbacks.measurementDeleted();
        }

        // Verify measurement updated event was dispatched with measurements in detail
        expect(dispatchSpy).toHaveBeenCalledOnce();
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'hoops-measurement-updated',
            bubbles: true,
            composed: true,
            detail: {
              measurements: expect.any(Array),
            },
          }),
        );
      });

      it('should include current measurements state in event detail @UI.11.7', () => {
        // Set up mock measurements
        const mockMeasurements = [
          { id: 'measurement-1', type: 'point-to-point' } as unknown as MeasureMarkup,
          { id: 'measurement-2', type: 'distance' } as unknown as MeasureMarkup,
        ];
        mockMeasureManager.getAllMeasurements = vi.fn().mockReturnValue(mockMeasurements);

        // Create a new service with the mock manager
        measurementService = new MeasurementService(mockMeasureManager);

        // Set up spy to verify events
        const dispatchSpy = vi.spyOn(measurementService, 'dispatchEvent');

        // Simulate HOOPS triggering the callback
        if (
          mockMeasureManager._capturedCallbacks &&
          mockMeasureManager._capturedCallbacks.measurementCreated
        ) {
          mockMeasureManager._capturedCallbacks.measurementCreated();
        }

        // Verify event contains the actual measurements state
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'hoops-measurement-updated',
            detail: {
              measurements: mockMeasurements,
            },
          }),
        );
      });
    });
  });

  describe('removeMeasurement', () => {
    beforeEach(() => {
      measurementService = new MeasurementService(mockMeasureManager);
    });

    it('should call removeMeasurement on the measure manager with the provided measurement', () => {
      measurementService.removeMeasurement(mockMeasurement);

      // Verify measure manager's removeMeasurement was called with the measurement
      expect(mockMeasureManager.removeMeasurement).toHaveBeenCalledOnce();
      expect(mockMeasureManager.removeMeasurement).toHaveBeenCalledWith(mockMeasurement);
    });
  });

  describe('get measurements', () => {
    it('should return measurements from measure manager', () => {
      // Create mock measurements
      const mockMeasurements = [{} as MeasureMarkup, {} as MeasureMarkup];

      // Configure mock to return measurements
      mockMeasureManager.getAllMeasurements = vi.fn().mockReturnValue(mockMeasurements);

      // Create service with mock measure manager
      measurementService = new MeasurementService(mockMeasureManager);

      // Get measurements
      const result = measurementService.measurements;

      // Verify getAllMeasurements was called
      expect(mockMeasureManager.getAllMeasurements).toHaveBeenCalledOnce();

      // Verify correct measurements were returned
      expect(result).toBe(mockMeasurements);
    });

    it('should return empty array if measure manager is not set', () => {
      // Create service without measure manager
      measurementService = new MeasurementService();

      // Get measurements
      const result = measurementService.measurements;

      // Verify empty array was returned
      expect(result).toEqual([]);
    });
  });

  describe('measure manager setter', () => {
    it('should set measure manager and bind callbacks', () => {
      // Create service without measure manager
      measurementService = new MeasurementService();

      // Set measure manager
      measurementService.measureManager = mockMeasureManager;

      // Verify measure manager is set
      expect(measurementService.measureManager).toBe(mockMeasureManager);

      // Verify callbacks are bound
      expect(mockMeasureManager.viewer.setCallbacks).toHaveBeenCalledOnce();
    });
  });

  describe('error handling', () => {
    it('should throw appropriate error when trying to bind with undefined measure manager', () => {
      // Create service with undefined measure manager
      measurementService = new MeasurementService();

      // Define a method to access the private bind method
      const attemptRebind = () => {
        // @ts-expect-error - Accessing private method for testing
        measurementService.bind();
      };

      // Verify binding without a measure manager throws appropriate error
      expect(attemptRebind).toThrow('MarkupManager is not set');
    });
  });

  describe('callback binding', () => {
    it('should rebind with new callbacks if measure manager is replaced', () => {
      // Start with a clean service (no mock manager)
      measurementService = new MeasurementService();

      // Set the first measure manager
      measurementService.measureManager = mockMeasureManager;
      expect(mockMeasureManager.viewer.setCallbacks).toHaveBeenCalledOnce();

      // Create a second measure manager
      const secondMockManager = {
        viewer: {
          setCallbacks: vi.fn(),
        },
        removeMeasurement: vi.fn(),
        getAllMeasurements: vi.fn().mockReturnValue([]),
      } as unknown as MeasureManager;

      // Clear mocks to start fresh
      vi.clearAllMocks();

      // Set new measure manager
      measurementService.measureManager = secondMockManager;

      // First manager should have empty callbacks set (unbind)
      expect(mockMeasureManager.viewer.setCallbacks).toHaveBeenCalledWith({});

      // New manager should get callbacks
      expect(secondMockManager.viewer.setCallbacks).toHaveBeenCalledWith({
        measurementCreated: expect.any(Function),
        measurementDeleted: expect.any(Function),
      });
    });
  });

  describe('measurements integration', () => {
    beforeEach(() => {
      measurementService = new MeasurementService(mockMeasureManager);
    });

    it('should return accurate measurements after they are updated in the measure manager', () => {
      // Initially returns an empty array
      expect(measurementService.measurements).toEqual([]);

      // Create mock measurements
      const mockMeasurements = [
        { id: 'measurement-1', type: 'point-to-point' } as unknown as MeasureMarkup,
        { id: 'measurement-2', type: 'face-to-face' } as unknown as MeasureMarkup,
      ];

      // Update what the mock returns
      mockMeasureManager.getAllMeasurements = vi.fn().mockReturnValue(mockMeasurements);

      // Verify service returns updated measurements
      expect(measurementService.measurements).toEqual(mockMeasurements);
      expect(mockMeasureManager.getAllMeasurements).toHaveBeenCalledOnce();
    });
  });

  describe('measurement color', () => {
    beforeEach(() => {
      measurementService = new MeasurementService(mockMeasureManager);
    });

    it('should return default value if measurement manager is not set', () => {
      // Create service without measure manager
      measurementService = new MeasurementService();

      // Get measurement color
      const color = measurementService.getMeasurementColor();

      // Verify default color is returned
      expect(color).toBe('#000000');
    });

    it('should return measurement color from measure manager', () => {
      // Set up mock color
      const mockColor = Color.fromHexString('#123456');
      mockMeasureManager.getMeasurementColor = vi.fn().mockReturnValue(mockColor);

      // Get measurement color
      const color = measurementService.getMeasurementColor();

      // Verify correct color is returned
      expect(color).toBe('#123456');
      expect(mockMeasureManager.getMeasurementColor).toHaveBeenCalledOnce();
    });

    it('should set measurement color in measure manager', () => {
      // Set measurement color
      measurementService.setMeasurementColor('#789abc');

      // Verify setMeasurementColor was called with correct color
      expect(mockMeasureManager.setMeasurementColor).toHaveBeenCalledOnce();
      expect((mockMeasureManager.setMeasurementColor as Mock).mock.calls[0][0].toHexString()).toBe(
        '#789abc',
      );
    });

    it('should throw error if trying to set measurement color without measure manager', () => {
      // Create service without measure manager
      measurementService = new MeasurementService();

      // Define a method to access the private setMeasurementColor method
      const attemptSetColor = () => {
        measurementService.setMeasurementColor('#abcdef');
      };

      // Verify setting color without a measure manager throws appropriate error
      expect(attemptSetColor).toThrow('MeasureManager is not set');
    });

    it('should dispatch hoops-measurement-color-changed event when measurement color is set', () => {
      // Spy on dispatchEvent
      const dispatchSpy = vi.spyOn(measurementService, 'dispatchEvent');

      // Set measurement color
      measurementService.setMeasurementColor('#abcd12');

      // Verify event was dispatched with correct detail
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hoops-measurement-color-changed',
          bubbles: true,
          composed: true,
          detail: '#abcd12',
        }),
      );
    });
  });
});
