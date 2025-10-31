import { html } from 'lit';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { renderTemplate } from '../../testing/utils';
import './hoops-tools-measurement-item';
import HoopsToolsMeasurementItemElement from './hoops-tools-measurement-item';
import { Operators } from '@ts3d-hoops/web-viewer';

// Test data constants for different measurement types
const MEASUREMENT_TYPES = {
  POINT_POINT: {
    type: 'PointPoint',
    prototype: Operators.Markup.Measure.MeasurePointPointDistanceMarkup.prototype,
    expectedIcon: 'measurePoint',
    expectedTitle: 'Point to Point',
  },
  FACE_FACE: {
    type: 'FaceFace',
    prototype: Operators.Markup.Measure.MeasureFaceFaceDistanceMarkup.prototype,
    expectedIcon: 'measureDistance',
    expectedTitle: 'Face to Face',
  },
  FACE_ANGLE: {
    type: 'FaceAngle',
    prototype: Operators.Markup.Measure.MeasureFaceFaceAngleMarkup.prototype,
    expectedIcon: 'measureAngle',
    expectedTitle: 'Face to Face Angle',
  },
  STRAIGHT_EDGE: {
    type: 'StraightEdge',
    prototype: Operators.Markup.Measure.MeasureStraightEdgeLengthMarkup.prototype,
    expectedIcon: 'measureEdge',
    expectedTitle: 'Straight Edge Length',
  },
  CIRCLE_EDGE: {
    type: 'CircleEdge',
    prototype: Operators.Markup.Measure.MeasureCircleEdgeLengthMarkup.prototype,
    expectedIcon: 'measureEdge',
    expectedTitle: 'Circle Edge Length',
  },
} as const;

describe('HoopsToolsMeasurementItemElement', () => {
  let component: HoopsToolsMeasurementItemElement;

  // Test helper functions
  const createMockMeasurement = (
    measurementConfig: (typeof MEASUREMENT_TYPES)[keyof typeof MEASUREMENT_TYPES],
    value: string,
  ) => {
    const mock = {} as Operators.Markup.Measure.MeasureMarkup;
    Object.setPrototypeOf(mock, measurementConfig.prototype);
    mock.getMeasurementText = vi.fn().mockReturnValue(value);
    return mock;
  };

  const renderComponent = async (measurement?: Operators.Markup.Measure.MeasureMarkup) => {
    const template = measurement
      ? html`<hoops-tools-measurement-item
          .measurement=${measurement}
        ></hoops-tools-measurement-item>`
      : html`<hoops-tools-measurement-item></hoops-tools-measurement-item>`;

    await renderTemplate(template);
    component = document.querySelector('hoops-tools-measurement-item')!;
    await component.updateComplete;
    return component;
  };

  const setupEventSpy = () => {
    const eventSpy = vi.fn();
    component.addEventListener('hoops-measurement-remove-command', eventSpy);
    return eventSpy;
  };

  const getElementBySelector = (selector: string) => component.shadowRoot!.querySelector(selector);

  const expectMeasurementDisplay = (
    expectedIcon: string,
    expectedTitle: string,
    expectedValue: string,
  ) => {
    const measureContainer = getElementBySelector('.measure-container');
    expect(measureContainer).toBeTruthy();

    const icon = getElementBySelector('hoops-icon');
    expect(icon).toBeTruthy();
    expect(icon!.getAttribute('title')).toBe(expectedTitle);
    expect(icon!.getAttribute('icon')).toBe(expectedIcon);

    const label = getElementBySelector('.measure-label');
    expect(label).toBeTruthy();
    expect(label!.textContent).toBe(expectedValue);

    const removeButton = getElementBySelector('.trash-button');
    expect(removeButton).toBeTruthy();
    expect(removeButton!.getAttribute('title')).toBe('Remove Measurement');
  };

  beforeEach(async () => {
    // Default setup with no measurement for each test
    await renderComponent();
  });

  describe('Basic Rendering', () => {
    it('should render component correctly with no measurement', () => {
      expect(component).toBeTruthy();
      expect(component.tagName.toLowerCase()).toBe('hoops-tools-measurement-item');

      // Should render nothing when no measurement is provided
      const measureContainer = getElementBySelector('.measure-container');
      expect(measureContainer).toBeFalsy();
    });
  });

  describe('Measurement Display', () => {
    // Test each measurement type using parameterized approach
    Object.entries(MEASUREMENT_TYPES).forEach(([key, config]) => {
      it(`should render ${config.expectedTitle} measurement correctly`, async () => {
        const testValue = key === 'FACE_ANGLE' ? '45.0°' : '10.5 mm';
        const mockMeasurement = createMockMeasurement(config, testValue);

        await renderComponent(mockMeasurement);

        expectMeasurementDisplay(config.expectedIcon, config.expectedTitle, testValue);
      });
    });
  });

  describe('Remove Functionality', () => {
    const testValue = '15.2 mm';
    let mockMeasurement: Operators.Markup.Measure.MeasureMarkup;

    beforeEach(async () => {
      mockMeasurement = createMockMeasurement(MEASUREMENT_TYPES.POINT_POINT, testValue);
      await renderComponent(mockMeasurement);
    });

    it('should dispatch measurement-remove event when remove button is clicked @UI.11.8', () => {
      const eventSpy = setupEventSpy();
      const removeButton = getElementBySelector('.trash-button') as HTMLElement;

      removeButton.click();

      expect(eventSpy).toHaveBeenCalledOnce();
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { measurement: mockMeasurement },
        }),
      );
    });

    it('should handle remove button clicks for different measurement types', async () => {
      // Test with Face to Face measurement
      const faceMeasurement = createMockMeasurement(MEASUREMENT_TYPES.FACE_FACE, '25.0 mm');
      await renderComponent(faceMeasurement);

      const eventSpy = setupEventSpy();
      const removeButton = getElementBySelector('.trash-button') as HTMLElement;

      removeButton.click();

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { measurement: faceMeasurement },
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle measurement without getMeasurementText method gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      // Create invalid measurement mock
      const invalidMeasurement = {} as Operators.Markup.Measure.MeasureMarkup;
      Object.setPrototypeOf(invalidMeasurement, MEASUREMENT_TYPES.POINT_POINT.prototype);
      // Note: missing getMeasurementText method

      await renderComponent(invalidMeasurement);

      // Component should still render basic structure
      const measureContainer = getElementBySelector('.measure-container');
      expect(measureContainer).toBeTruthy();

      consoleSpy.mockRestore();
    });

    it('should handle unknown measurement type gracefully', async () => {
      // Create measurement with unknown prototype
      const unknownMeasurement = {} as Operators.Markup.Measure.MeasureMarkup;
      unknownMeasurement.getMeasurementText = vi.fn().mockReturnValue('Unknown: 5.0 mm');

      await renderComponent(unknownMeasurement);

      const measureContainer = getElementBySelector('.measure-container');
      expect(measureContainer).toBeTruthy();

      const label = getElementBySelector('.measure-label');
      expect(label!.textContent).toBe('Unknown: 5.0 mm');
    });
  });
});
