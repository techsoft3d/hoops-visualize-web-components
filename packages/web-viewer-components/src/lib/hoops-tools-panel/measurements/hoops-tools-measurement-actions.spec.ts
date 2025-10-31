import { html } from 'lit';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { renderTemplate } from '../../testing/utils';
import './hoops-tools-measurement-actions';
import HoopsToolsMeasurementActionsElement from './hoops-tools-measurement-actions';
import { OperatorId } from '@ts3d-hoops/web-viewer';

// Test data constants
const MEASUREMENT_TOOLS = [
  { title: 'Measure Point to Point', operator: OperatorId.MeasurePointPointDistance },
  { title: 'Measure Distance Between Faces', operator: OperatorId.MeasureFaceFaceDistance },
  { title: 'Measure Angle Between Faces', operator: OperatorId.MeasureFaceFaceAngle },
  { title: 'Measure Edges', operator: OperatorId.MeasureEdgeLength },
] as const;

const EXPECTED_BUTTON_COUNT = 4;

describe('HoopsToolsMeasurementActionsElement', () => {
  let component: HoopsToolsMeasurementActionsElement;

  const renderComponentWithActiveOperator = async (activeOperator?: OperatorId) => {
    const template = activeOperator
      ? html`<hoops-tools-measurement-actions
          .activeToolOperator=${activeOperator}
        ></hoops-tools-measurement-actions>`
      : html`<hoops-tools-measurement-actions></hoops-tools-measurement-actions>`;

    await renderTemplate(template);
    component = document.querySelector('hoops-tools-measurement-actions')!;
    await component.updateComplete;
    return component;
  };

  const getAllButtons = () => component.shadowRoot!.querySelectorAll('hoops-icon-button');

  const findButtonByTitle = (title: string): HTMLElement => {
    const buttons = getAllButtons();
    const button = Array.from(buttons).find(
      (btn) => btn.getAttribute('title') === title,
    ) as HTMLElement;
    if (!button) {
      throw new Error(`Button with title "${title}" not found`);
    }
    return button;
  };

  const setupEventSpy = () => {
    const eventSpy = vi.fn();
    component.addEventListener('measurement-tool-selected', eventSpy);
    return eventSpy;
  };

  const expectEventToBeDispatchedWith = (
    eventSpy: ReturnType<typeof vi.fn>,
    operator: OperatorId,
  ) => {
    expect(eventSpy).toHaveBeenCalledOnce();
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { operator },
      }),
    );
  };

  beforeEach(async () => {
    await renderComponentWithActiveOperator();
  });

  describe('Basic Rendering', () => {
    it('should render component correctly', () => {
      expect(component).toBeTruthy();
      expect(component.tagName.toLowerCase()).toBe('hoops-tools-measurement-actions');
    });

    it('should render all measurement tool buttons @UI.11.5', () => {
      const buttons = getAllButtons();
      expect(buttons).toHaveLength(EXPECTED_BUTTON_COUNT);

      const buttonTitles = Array.from(buttons).map((btn) => btn.getAttribute('title'));
      MEASUREMENT_TOOLS.forEach((tool) => {
        expect(buttonTitles).toContain(tool.title);
      });
    });
  });

  describe('Active Tool Highlighting', () => {
    it('should highlight active tool button when activeToolOperator is set @UI.11.6', async () => {
      await renderComponentWithActiveOperator(OperatorId.MeasurePointPointDistance);

      const pointToPointButton = findButtonByTitle('Measure Point to Point');
      expect(pointToPointButton.getAttribute('color')).toBe('accent');
    });

    it('should update button highlighting when activeToolOperator changes', async () => {
      // Initially no button should be highlighted
      let buttons = getAllButtons();
      buttons.forEach((btn) => {
        expect(btn.getAttribute('color')).toBe('default');
      });

      // Set active tool to Face to Face Distance
      component.activeToolOperator = OperatorId.MeasureFaceFaceDistance;
      await component.updateComplete;

      const faceToFaceButton = findButtonByTitle('Measure Distance Between Faces');
      expect(faceToFaceButton.getAttribute('color')).toBe('accent');

      // Other buttons should still be default
      buttons = getAllButtons();
      const otherButtons = Array.from(buttons).filter(
        (btn) => btn.getAttribute('title') !== 'Measure Distance Between Faces',
      );
      otherButtons.forEach((btn) => {
        expect(btn.getAttribute('color')).toBe('default');
      });
    });
  });

  describe('Event Dispatching', () => {
    // Test each measurement tool using parameterized approach with it.each
    it.each(MEASUREMENT_TOOLS)(
      'should dispatch measurement-tool-selected event when $title button is clicked @UI.11.6',
      ({ title, operator }) => {
        const eventSpy = setupEventSpy();
        const button = findButtonByTitle(title);

        button.click();

        expectEventToBeDispatchedWith(eventSpy, operator);
      },
    );

    it('should call selectMeasurementTool method when any button is clicked', () => {
      const eventSpy = setupEventSpy();
      const pointToPointButton = findButtonByTitle('Measure Point to Point');

      pointToPointButton.click();

      expectEventToBeDispatchedWith(eventSpy, OperatorId.MeasurePointPointDistance);
    });
  });
});
