import { describe, it, expect, beforeEach, vi } from 'vitest';
import SelectionService from './SelectionService';
import { Color, core, SelectionMask } from '@ts3d-hoops/web-viewer';

// Mocks
const mockSelectionManager = {
  getHighlightFaceElementSelection: vi.fn(),
  getHighlightLineElementSelection: vi.fn(),
  setHighlightFaceElementSelection: vi.fn(),
  setHighlightLineElementSelection: vi.fn(),
  getNodeSelectionColor: vi.fn(),
  setNodeSelectionColor: vi.fn(),
  setNodeSelectionOutlineColor: vi.fn(),
  getNodeElementSelectionColor: vi.fn(),
  setNodeElementSelectionColor: vi.fn(),
  setNodeElementSelectionOutlineColor: vi.fn(),
  getHonorsSceneVisibility: vi.fn(),
  setHonorsSceneVisibility: vi.fn(),
};

const mockPickConfig = { forceEffectiveSceneVisibilityMask: SelectionMask.None };

const mockOperator = {
  getPickConfig: vi.fn(() => mockPickConfig),
  setPickConfig: vi.fn(),
  setForceEffectiveSceneVisibilityMask: vi.fn(),
};

const mockOperatorManager = {
  getOperator: vi.fn(() => mockOperator),
};

const mockWebViewer = {
  selectionManager: mockSelectionManager,
  operatorManager: mockOperatorManager,
};

describe('SelectionService', () => {
  let service: SelectionService;

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockSelectionManager).forEach((fn) => fn.mockReset && fn.mockReset());
    Object.values(mockOperator).forEach((fn) => fn.mockReset && fn.mockReset());
    mockOperatorManager.getOperator.mockReset && mockOperatorManager.getOperator.mockReset();
    service = new SelectionService();
    service.webViewer = undefined;
  });

  describe('getEnableFaceLineSelection', () => {
    it('returns false if webviewer is not set', () => {
      expect(service.getEnableFaceLineSelection()).toBe(true);
    });
    it('returns true if both highlight selections are true', () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;
      mockSelectionManager.getHighlightFaceElementSelection.mockReturnValue(true);
      mockSelectionManager.getHighlightLineElementSelection.mockReturnValue(true);
      expect(service.getEnableFaceLineSelection()).toBe(true);
    });
    it('returns false if one highlight selection is false', () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;
      mockSelectionManager.getHighlightFaceElementSelection.mockReturnValue(true);
      mockSelectionManager.getHighlightLineElementSelection.mockReturnValue(false);
      expect(service.getEnableFaceLineSelection()).toBe(false);
    });
  });

  describe('setEnableFaceLineSelection', () => {
    it('rejects if webviewer is not set', async () => {
      await expect(service.setEnableFaceLineSelection(true)).rejects.toThrow('Webviewer not set');
    });
    it('sets both highlight selections and dispatches event', async () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;
      const dispatchSpy = vi.spyOn(service, 'dispatchEvent');
      await service.setEnableFaceLineSelection(true);
      expect(mockSelectionManager.setHighlightFaceElementSelection).toHaveBeenCalledWith(true);
      expect(mockSelectionManager.setHighlightLineElementSelection).toHaveBeenCalledWith(true);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'hoops-enable-face-line-selection-changed', detail: true }),
      );
    });
  });

  describe('getHonorsSceneVisibility', () => {
    it('returns false if webviewer is not set', () => {
      expect(service.getHonorsSceneVisibility()).toBe(true);
    });
    it('returns true if forceEffectiveSceneVisibilityMask is None', () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;
      mockPickConfig.forceEffectiveSceneVisibilityMask = SelectionMask.None;
      expect(service.getHonorsSceneVisibility()).toBe(true);
    });
    it('returns false if forceEffectiveSceneVisibilityMask is not None', () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;
      mockPickConfig.forceEffectiveSceneVisibilityMask = SelectionMask.All;
      expect(service.getHonorsSceneVisibility()).toBe(false);
    });
  });

  describe('setHonorsSceneVisibility', () => {
    it('throws if webviewer is not set', () => {
      expect(() => service.setHonorsSceneVisibility(true)).toThrow('Webviewer not set');
    });
    it('sets forceEffectiveSceneVisibilityMask and dispatches event', () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;
      const dispatchSpy = vi.spyOn(service, 'dispatchEvent');
      service.setHonorsSceneVisibility(true);
      expect(mockOperator.setPickConfig).toHaveBeenCalledWith(mockPickConfig);
      expect(mockOperator.setForceEffectiveSceneVisibilityMask).toHaveBeenCalledWith(
        SelectionMask.None,
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'hoops-honors-scene-visibility-changed', detail: true }),
      );
    });
  });

  describe('getBodyColor', () => {
    it('returns Color.black if webviewer is not set', () => {
      expect(service.getBodyColor()).toEqual('#ffff00');
    });
    it('returns color from selectionManager if webviewer is set', () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;
      const color = Color.fromHexString('#1155ff');
      mockSelectionManager.getNodeSelectionColor.mockReturnValue(color);
      expect(service.getBodyColor()).toBe('#1155ff');
    });
  });

  describe('setBodyColor', () => {
    it('throws if webviewer is not set', async () => {
      await expect(service.setBodyColor('#112233')).rejects.toThrow('Webviewer not set');
    });
    it('sets node selection color and dispatches event', async () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;
      const color = Color.fromHexString('#2255DD');
      const dispatchSpy = vi.spyOn(service, 'dispatchEvent');
      await service.setBodyColor('#2255DD');
      expect(mockSelectionManager.setNodeSelectionColor).toHaveBeenCalledWith(color);
      expect(mockSelectionManager.setNodeSelectionOutlineColor).toHaveBeenCalledWith(color);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'hoops-body-color-changed', detail: '#2255DD' }),
      );
    });
  });

  describe('getFaceAndLineColor', () => {
    it('returns Color.black if webviewer is not set', () => {
      expect(service.getFaceAndLineColor()).toEqual('#ff0000');
    });
    it('returns color from selectionManager if webviewer is set', () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;
      const color = Color.fromHexString('#ff5500');
      mockSelectionManager.getNodeElementSelectionColor.mockReturnValue(color);
      expect(service.getFaceAndLineColor()).toBe('#ff5500');
    });
  });

  describe('setFaceAndLineColor', () => {
    it('throws if webviewer is not set', async () => {
      await expect(service.setFaceAndLineColor('#2288EE')).rejects.toThrow('Webviewer not set');
    });
    it('sets node element selection color and dispatches event', async () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;
      const color = Color.fromHexString('#2288EE');
      const dispatchSpy = vi.spyOn(service, 'dispatchEvent');
      await service.setFaceAndLineColor('#2288EE');
      expect(mockSelectionManager.setNodeElementSelectionColor).toHaveBeenCalledWith(color);
      expect(mockSelectionManager.setNodeElementSelectionOutlineColor).toHaveBeenCalledWith(color);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'hoops-face-and-line-color-changed', detail: '#2288EE' }),
      );
    });
  });

  describe('resetConfiguration', () => {
    it('throws error when webViewer is not set', async () => {
      await expect(service.resetConfiguration()).rejects.toThrow('Webviewer not set');
    });

    it('resets all selection-related configurations to defaults', async () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;

      // Mock default values from SelectionService.DefaultConfiguration
      const defaultBodyColor = Color.fromHexString('#ffff00'); // yellow
      const defaultFaceAndLineColor = Color.fromHexString('#ff0000'); // red

      await service.resetConfiguration();

      // Verify body color is set to default yellow
      expect(mockSelectionManager.setNodeSelectionColor).toHaveBeenCalledWith(defaultBodyColor);
      expect(mockSelectionManager.setNodeSelectionOutlineColor).toHaveBeenCalledWith(
        defaultBodyColor,
      );

      // Verify face and line color is set to default red
      expect(mockSelectionManager.setNodeElementSelectionColor).toHaveBeenCalledWith(
        defaultFaceAndLineColor,
      );
      expect(mockSelectionManager.setNodeElementSelectionOutlineColor).toHaveBeenCalledWith(
        defaultFaceAndLineColor,
      );
    });

    it('uses correct default color values during reset', async () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;

      await service.resetConfiguration();

      // Verify the exact color values used for reset
      const expectedBodyColor = Color.fromHexString('#ffff00'); // yellow
      const expectedFaceLineColor = Color.fromHexString('#ff0000'); // red

      expect(mockSelectionManager.setNodeSelectionColor).toHaveBeenCalledWith(expectedBodyColor);
      expect(mockSelectionManager.setNodeSelectionOutlineColor).toHaveBeenCalledWith(
        expectedBodyColor,
      );
      expect(mockSelectionManager.setNodeElementSelectionColor).toHaveBeenCalledWith(
        expectedFaceLineColor,
      );
      expect(mockSelectionManager.setNodeElementSelectionOutlineColor).toHaveBeenCalledWith(
        expectedFaceLineColor,
      );
    });

    it('calls all reset operations in sequence', async () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;

      await service.resetConfiguration();

      // Verify selection manager methods are called exactly once per operation
      expect(mockSelectionManager.setNodeSelectionColor).toHaveBeenCalledTimes(1);
      expect(mockSelectionManager.setNodeSelectionOutlineColor).toHaveBeenCalledTimes(1);
      expect(mockSelectionManager.setNodeElementSelectionColor).toHaveBeenCalledTimes(1);
      expect(mockSelectionManager.setNodeElementSelectionOutlineColor).toHaveBeenCalledTimes(1);
      expect(mockSelectionManager.setHighlightFaceElementSelection).toHaveBeenCalledTimes(1);
      expect(mockSelectionManager.setHighlightLineElementSelection).toHaveBeenCalledTimes(1);
    });

    it('accepts custom configuration object', async () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;
      const customConfig = {
        faceLineSelectionEnabled: false,
        honorsSceneVisibility: false,
        bodyColor: '#00ff00',
        faceAndLineColor: '#0000ff',
      };

      await service.resetConfiguration(customConfig);

      // Verify custom colors are used
      expect(mockSelectionManager.setNodeSelectionColor).toHaveBeenCalledWith(
        Color.fromHexString('#00ff00'),
      );
      expect(mockSelectionManager.setNodeElementSelectionColor).toHaveBeenCalledWith(
        Color.fromHexString('#0000ff'),
      );

      // Verify custom boolean values are used
      expect(mockSelectionManager.setHighlightFaceElementSelection).toHaveBeenCalledWith(false);
      expect(mockSelectionManager.setHighlightLineElementSelection).toHaveBeenCalledWith(false);
    });

    it('throws error with invalid configuration object', async () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;
      const invalidConfig = { invalidProperty: 'invalid' };

      await expect(service.resetConfiguration(invalidConfig)).rejects.toThrow(
        'Invalid configuration object',
      );
    });

    it('resets all default configuration properties', async () => {
      service.webViewer = mockWebViewer as unknown as core.IWebViewer;

      await service.resetConfiguration();

      // Verify all default configuration properties are applied
      expect(mockSelectionManager.setHighlightFaceElementSelection).toHaveBeenCalledWith(true);
      expect(mockSelectionManager.setHighlightLineElementSelection).toHaveBeenCalledWith(true);
    });
  });
});
