import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import '../context-manager';
import './hoops-toolbar-explode';

import { Point3 } from '@ts3d-hoops/common';
import { WebViewer } from '@ts3d-hoops/web-viewer';
import { html } from 'lit';
import { renderTemplate } from '../testing/utils';
import HoopsExplodeButtonElement from './hoops-toolbar-explode';
import { registerService, unregisterService } from '../services';

function setupMockWebViewer(options: Record<string, any> = {}): any {
  const webViewerMock = {
    explodeManager: {
      getActive: vi.fn().mockReturnValue(false),
      start: vi.fn().mockResolvedValue(undefined),
      getMagnitude: vi.fn().mockReturnValue(0),
      setMagnitude: vi.fn(),
    },
    model: {
      getModelBounding: vi.fn(() =>
        Promise.resolve({
          center: vi.fn().mockReturnValue(options?.modelCenter ?? new Point3(4, 2, 0)),
        }),
      ),
    },
  } as any;
  return webViewerMock;
}

function mockExplodeService() {
  return {
    serviceName: 'ExplodeService',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    getActive: vi.fn(() => false),
    start: vi.fn(() => Promise.resolve()),
    setMagnitude: vi.fn(() => Promise.resolve()),
    stop: vi.fn(() => Promise.resolve()),
    getMagnitude: vi.fn(() => 0),
  };
}

describe('hoops-toolbar-explode', () => {
  let webViewerMock: WebViewer;
  let toolbarExplodeButton: HoopsExplodeButtonElement;
  let toolbarRangeInput: HTMLInputElement;
  const dispatchRangeValue = async ({ value, toolbarRangeInput, toolbarExplodeButton }) => {
    toolbarRangeInput.value = value;
    toolbarRangeInput.dispatchEvent(
      new InputEvent('input', { bubbles: true, composed: true }) as any,
    );
    await toolbarExplodeButton.updateComplete;
  };
  const explodeService = mockExplodeService();

  beforeEach(async () => {
    vi.clearAllMocks();
    webViewerMock = setupMockWebViewer();
    registerService(explodeService);

    await renderTemplate(html`<hoops-toolbar-explode></hoops-toolbar-explode>`);

    toolbarExplodeButton = document.querySelector('hoops-toolbar-explode')!;
    toolbarRangeInput = toolbarExplodeButton.shadowRoot!.querySelector('input[type="range"]')!;
  });

  afterEach(() => {
    unregisterService('ExplodeService');
    vi.clearAllMocks();
  });

  it('Renders without error', async () => {
    expect(toolbarExplodeButton).toBeTruthy();
    expect(toolbarRangeInput).toBeTruthy();

    toolbarExplodeButton.webViewer = null;

    await dispatchRangeValue({
      value: '0.5',
      toolbarRangeInput,
      toolbarExplodeButton,
    });

    expect(toolbarExplodeButton).toBeTruthy();
    expect(toolbarRangeInput).toBeTruthy();
  });

  it('Has a slider with 100 discrete steps @UI.2.18', async () => {
    const rangeMax = toolbarRangeInput.max;
    const rangeMin = toolbarRangeInput.min;
    const rangeStep = toolbarRangeInput.step;
    const incrementCount = (parseFloat(rangeMax) - parseFloat(rangeMin)) / parseFloat(rangeStep);

    expect(incrementCount).toEqual(100);
  });

  it(`
    On range activity,
    if the explodeManager is not active,
    start it with the current model bounding modelCenter
    @UI.2.19
  `, async () => {
    const modelCenter = new Point3(4, 2, 0);

    toolbarExplodeButton.webViewer = setupMockWebViewer({ modelCenter });
    await dispatchRangeValue({
      value: '0.5',
      toolbarRangeInput,
      toolbarExplodeButton,
    });

    expect(explodeService.start).toHaveBeenCalledWith(undefined, modelCenter);
  });
});
