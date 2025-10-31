import { html } from 'lit';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { WebViewer } from '@ts3d-hoops/web-viewer';
import { waitFor, within } from '@testing-library/dom';

import '../context-manager';
import WebViewerContextManager from '../context-manager';
import '../hoops-service-registry';
import { renderTemplate } from '../testing/utils';
import './hoops-toolbar-camera';
import CameraButton from './hoops-toolbar-camera';
import './hoops-toolbar-camera-operator';
import './hoops-toolbar-drawmode';
import './hoops-toolbar-model-tree';
import ModelTreeButton from './hoops-toolbar-model-tree';

describe('hoops-toolbar-model-tree', () => {
  it('Renders', async () => {
    await renderTemplate(html` <hoops-toolbar-model-tree></hoops-toolbar-model-tree> `);
    const modelTreeButton: ModelTreeButton = document.querySelector('hoops-toolbar-model-tree')!;
    await modelTreeButton.updateComplete;
    expect(modelTreeButton).toBeTruthy();
  });
});

describe('hoops-toolbar-camera', () => {
  beforeEach(() => {
    // Mock getService from ../services
    vi.mock(import('../services'), async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        getService: vi.fn(() => ({
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          getProjectionMode: vi.fn(() => 'Perspective'),
        })),
      } as any;
    });
  });

  it('Renders', async () => {
    await renderTemplate(html` <hoops-toolbar-camera></hoops-toolbar-camera> `);
    const cameraButton: CameraButton = document.querySelector('hoops-toolbar-camera')!;
    await cameraButton.updateComplete;
    expect(cameraButton).toBeTruthy();
  });
});

describe('hoops-toolbar-drawmode', () => {
  it('At initialization, the draw mode button icon reflects the current web viewer draw mode @UI.2.10', async () => {
    await renderTemplate(
      html`<hoops-service-registry
        ><hoops-web-viewer-context-manager
          ><hoops-toolbar-drawmode></hoops-toolbar-drawmode></hoops-web-viewer-context-manager
      ></hoops-service-registry>`,
    );

    const contextManager = document.querySelector(
      'hoops-web-viewer-context-manager',
    ) as WebViewerContextManager;
    contextManager.webViewer = {
      view: {
        operatorManager: {
          get: (_) => 0,
          getOperator: (id: number) => {
            if (id === 8) {
              return {
                walkOperator: {},
                keyboardWalkOperator: {},
              };
            }
            return null;
          },
        },
        getDrawMode: () => 1,
        getProjectionMode: () => 0,
      },
      setCallbacks: (_) => undefined,
      getSceneReady: () => true,
    } as WebViewer;

    const drawModeButton = document.querySelector('hoops-toolbar-drawmode') as HTMLElement;
    const dropdownButton = within(drawModeButton.shadowRoot! as any).getAllByRole('button')[0];
    await waitFor(() => expect(dropdownButton.getAttribute('title')).toEqual('Draw mode - Shaded'));
  });
});

describe('hoops-toolbar-camera-operator', () => {
  it('At initialization, the camera operator button icon reflects the current active camera operator in the web viewer. @UI.2.13', async () => {
    await renderTemplate(
      html`<hoops-service-registry
        ><hoops-web-viewer-context-manager
          ><hoops-toolbar-camera-operator></hoops-toolbar-camera-operator></hoops-web-viewer-context-manager
      ></hoops-service-registry>`,
    );

    const contextManager = document.querySelector(
      'hoops-web-viewer-context-manager',
    ) as WebViewerContextManager;
    contextManager.webViewer = {
      view: {
        operatorManager: {
          get: (_) => 8,
          getOperator: (id: number) => {
            if (id === 8) {
              return {
                walkOperator: {},
                keyboardWalkOperator: {},
              };
            }
            return null;
          },
        },
        getDrawMode: () => 1,
        getProjectionMode: () => 0,
      },
      setCallbacks: (_) => undefined,
      unsetCallbacks: (_) => undefined,
      getSceneReady: () => true,
    } as WebViewer;

    const cameraOperatorButton = document.querySelector(
      'hoops-toolbar-camera-operator',
    ) as HTMLElement;
    const dropdownButton = within(cameraOperatorButton.shadowRoot! as any).getAllByRole(
      'button',
    )[0];
    await waitFor(() =>
      expect(dropdownButton.getAttribute('title')).toEqual('Camera operator - Walk'),
    );
  });
});
