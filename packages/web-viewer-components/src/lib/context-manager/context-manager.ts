import { createContext, provide } from '@lit/context';
import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

import { DrawMode, OperatorId, Operators, WebViewer } from '@ts3d-hoops/web-viewer';

import {
  ActiveToolOperatorPosition,
  CameraOperatorPosition,
  redlineModes,
  type WebViewerState,
} from './types';

// Usually it's best to use a globally unique context object. Symbols are one of the easiest ways to do this.
export const contextManagerContext = createContext<WebViewerContextManager>(
  Symbol('hoops-context-manager-context'),
);
export const webViewerContext = createContext<WebViewer>(Symbol('hoops-web-viewer-context'));
export const webViewerStateContext = createContext<WebViewerState>(
  Symbol('hoops-web-viewer-state-context'),
);

import '../hoops-service-registry';
import {
  CuttingService,
  CameraService,
  getService,
  RedlineService,
  RenderOptionsService,
  IFCRelationshipsService,
  PmiService,
  SelectionService,
  SheetService,
  SpaceMouseService,
  WalkOperatorService,
  ExplodeService,
} from '../services';
import NoteTextService from '../services/notetext';
import MeasurementService from '../services/measurement/MeasurementService';
import ViewService from '../services/view/ViewService';
import FloorplanService from '../services/floorplan';

/**
 * Provides centralized context management for the Hoops Web Viewer ecosystem.
 *
 * This component acts as a context provider that manages the global state and coordinates
 * communication between different web viewer components. It provides shared access to
 * the WebViewer instance, state management, and service coordination.
 *
 * @element hoops-web-viewer-context-manager
 *
 * @example
 * ```html
 * <hoops-web-viewer-context-manager></hoops-web-viewer-context-manager>
 *
 * <script>
 *   document.getElementsByTagName('hoops-web-viewer-context-manager')[0].webViewer = webViewerInstance;
 * </script>
 * ```
 *
 * @since 2025.8.0
 */
@customElement('hoops-web-viewer-context-manager')
export default class WebViewerContextManager extends LitElement {
  @provide({ context: webViewerStateContext })
  webviewerState: WebViewerState = {
    drawMode: DrawMode.Wireframe,
    topCameraOperator: OperatorId.Navigate,
    toolOperator: OperatorId.None,
  };

  @provide({ context: contextManagerContext })
  contextManager: WebViewerContextManager = this;

  @provide({ context: webViewerContext })
  private _webViewer?: WebViewer;

  /**
   * Gets the current WebViewer instance.
   *
   * @returns {WebViewer | undefined} The current WebViewer instance or undefined if not set
   */
  get webViewer() {
    return this._webViewer;
  }

  /**
   * Sets the WebViewer instance and initializes all associated services.
   * When set, automatically configures service dependencies and refreshes operator states.
   *
   * @param value - The WebViewer instance to set
   * @returns {void}
   */
  set webViewer(value: WebViewer | undefined) {
    this._webViewer = value;

    if (!this._webViewer) {
      return;
    }

    const currentDrawMode = this._webViewer.view.getDrawMode();
    this.dispatchDrawMode(currentDrawMode);

    this.refreshCameraOperator();
    this.refreshToolOperator();

    getService<MeasurementService>('MeasurementService').measureManager =
      this._webViewer.measureManager;
    getService<RedlineService>('RedlineService').markupManager = this._webViewer?.markupManager;
    getService<NoteTextService>('NoteTextService').noteTextManager =
      this._webViewer.noteTextManager;
    getService<RenderOptionsService>('RenderOptionsService').webViewer = this._webViewer;
    getService<IFCRelationshipsService>('IFCRelationshipsService').selectionManager =
      this._webViewer.selectionManager;
    getService<ViewService>('ViewService').view = this._webViewer.view;
    getService<FloorplanService>('FloorplanService').floorplanManager =
      this._webViewer.view.floorplanManager;
    getService<PmiService>('PmiService').viewer = this._webViewer;
    getService<SelectionService>('SelectionService').webViewer = this._webViewer;
    getService<CuttingService>('CuttingService').cuttingManager = this._webViewer.cuttingManager;
    getService<CameraService>('CameraService').webViewer = this._webViewer;
    getService<SheetService>('SheetService').sheetManager = this._webViewer.sheetManager;
    const walkService = getService<WalkOperatorService>('WalkOperatorService');
    walkService.walkModeOperator = this._webViewer.view.operatorManager.getOperator(
      OperatorId.WalkMode,
    );
    getService<ExplodeService>('ExplodeService').webViewer = this._webViewer;
    getService<SpaceMouseService>('SpaceMouseService').spaceMouseOperator =
      this._webViewer.view.operatorManager.getOperator(
        OperatorId.SpaceMouse,
      ) as Operators.SpaceMouseOperator;
  }

  /**
   * Updates the web viewer state with the specified draw mode.
   * Dispatches state change to all consuming components via context.
   *
   * @internal
   * @param drawMode - The new draw mode to set in the state
   * @returns {void}
   */
  private dispatchDrawMode(drawMode: DrawMode) {
    this.webviewerState = {
      ...this.webviewerState,
      drawMode,
    };
  }

  /**
   * Sets the draw mode for the web viewer and updates the context state.
   * Changes how 3D models are rendered (wireframe, shaded, etc.).
   *
   * @param drawMode - The draw mode to apply to the web viewer
   * @returns {void}
   */
  setDrawMode(drawMode: DrawMode) {
    if (this._webViewer) {
      this._webViewer.view.setDrawMode(drawMode);
      this.dispatchDrawMode(drawMode);
    }
  }

  /**
   * Resets the web viewer and all associated services to their initial state.
   * Clears all active operations, handles, and resets service states.
   *
   * @returns {Promise<void>} Promise that resolves when reset is complete
   */
  async reset() {
    if (!this.webViewer) {
      return;
    }

    await this.webViewer.reset();
    if (!this.webViewer.sheetManager.isDrawingSheetActive()) {
      this.webViewer.noteTextManager.setIsolateActive(false);
      await this.webViewer.noteTextManager.updatePinVisibility();
      const handleOperator = this.webViewer.view.operatorManager.getOperator(OperatorId.Handle);
      if (handleOperator !== null && handleOperator.removeHandles) {
        await handleOperator.removeHandles();
      }
    }

    getService<RedlineService>('RedlineService').reset();
    getService<NoteTextService>('NoteTextService').reset();
    getService<ViewService>('ViewService').reset();
    getService<FloorplanService>('FloorplanService').reset();
    getService<CameraService>('CameraService').reset();
    getService<WalkOperatorService>('WalkOperatorService').reset();
    getService<ExplodeService>('ExplodeService').reset();
  }

  /**
   * Updates the web viewer state with the specified camera operator.
   * Dispatches camera operator change to all consuming components via context.
   *
   * @internal
   * @param cameraOp - The camera operator ID to set in the state
   * @returns {void}
   */
  private dispatchCameraOperator(cameraOp: OperatorId) {
    this.webviewerState = {
      ...this.webviewerState,
      topCameraOperator: cameraOp,
    };
  }

  /**
   * Updates the web viewer state with the specified tool operator.
   * Dispatches tool operator change to all consuming components via context.
   *
   * @internal
   * @param redlineOperator - The tool operator ID to set in the state
   * @returns {void}
   */
  private dispatchToolOperator(redlineOperator: OperatorId) {
    this.webviewerState = {
      ...this.webviewerState,
      toolOperator: redlineOperator,
    };
  }

  /**
   * Refreshes the camera operator state from the web viewer and updates the context.
   * Synchronizes the context state with the current camera operator.
   *
   * @returns {void}
   */
  refreshCameraOperator() {
    if (this._webViewer) {
      const currentCameraOp = this._webViewer.view.operatorManager.get(CameraOperatorPosition);
      this.dispatchCameraOperator(currentCameraOp);
    }
  }

  /**
   * Refreshes the tool operator state from the web viewer and updates the context.
   * Synchronizes the context state with the current active tool operator.
   *
   * @returns {void}
   */
  refreshToolOperator() {
    if (this._webViewer) {
      const currentRedlineOp = this._webViewer.view.operatorManager.get(ActiveToolOperatorPosition);
      this.dispatchToolOperator(currentRedlineOp);
    }
  }

  /**
   * Sets the active redline operator for drawing markup annotations.
   * Validates the operator ID against supported redline modes before setting.
   *
   * @param redlineOperatorId - The redline operator ID to activate
   * @returns {void}
   */
  setRedlineOperator(redlineOperatorId: OperatorId) {
    if (!redlineModes.includes(redlineOperatorId as (typeof redlineModes)[number])) {
      console.error('Invalid redline operator ID:', redlineOperatorId);
      return;
    }

    this.activeToolOperator = redlineOperatorId;
  }

  /**
   * Checks if a redline operator is currently active.
   * Returns true if any redline drawing mode is currently enabled.
   *
   * @returns {boolean} True if a redline operator is active, false otherwise
   */
  isRedlineOperatorActive() {
    if (!this._webViewer) {
      return false;
    }

    return redlineModes.includes(
      this._webViewer.view.operatorManager.get(
        ActiveToolOperatorPosition,
      ) as (typeof redlineModes)[number],
    );
  }

  /**
   * Gets the currently active tool operator.
   * Returns the operator ID if a tool is active, undefined otherwise.
   *
   * @returns {OperatorId | undefined} The active tool operator ID or undefined if none is active
   */
  get activeToolOperator(): OperatorId | undefined {
    if (!this._webViewer) {
      return undefined;
    }

    const op = this._webViewer.view.operatorManager.get(ActiveToolOperatorPosition);
    if (op === OperatorId.Invalid || op === OperatorId.None) {
      return undefined;
    }

    return op;
  }

  /**
   * Sets the active tool operator and updates the context state.
   * Activates the specified operator in the web viewer's operator manager and 
   * synchronizes the context state to notify all consuming components.
   *
   * @param value - The operator ID to set as active, or undefined to clear
   * @returns {void}
   */
  set activeToolOperator(value: OperatorId | undefined) {
    if (!this._webViewer) {
      console.error('Cannot set operator: WebViewer not initialized');
      return;
    }

    this._webViewer.view.operatorManager.set(value ?? OperatorId.None, ActiveToolOperatorPosition);
    this.refreshToolOperator();
  }

  /**
   * Returns the element itself as the render root instead of creating a shadow DOM.
   * This ensures the context provider doesn't interfere with application styling.
   *
   * @internal
   * @returns {Element} The element itself
   */
  protected createRenderRoot() {
    return this;
  }

  /**
   * Renders an empty template since this component is purely functional.
   * The component's purpose is context management, not visual rendering.
   *
   * @internal
   * @returns {unknown} Empty HTML template
   */
  protected override render(): unknown {
    return html``;
  }
}

export { WebViewerContextManager };
