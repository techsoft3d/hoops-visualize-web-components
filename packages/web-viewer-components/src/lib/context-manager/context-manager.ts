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

  get webViewer() {
    return this._webViewer;
  }

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

  private dispatchDrawMode(drawMode: DrawMode) {
    this.webviewerState = {
      ...this.webviewerState,
      drawMode,
    };
  }

  setDrawMode(drawMode: DrawMode) {
    if (this._webViewer) {
      this._webViewer.view.setDrawMode(drawMode);
      this.dispatchDrawMode(drawMode);
    }
  }

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

  private dispatchCameraOperator(cameraOp: OperatorId) {
    this.webviewerState = {
      ...this.webviewerState,
      topCameraOperator: cameraOp,
    };
  }

  private dispatchToolOperator(redlineOperator: OperatorId) {
    this.webviewerState = {
      ...this.webviewerState,
      toolOperator: redlineOperator,
    };
  }

  refreshCameraOperator() {
    if (this._webViewer) {
      const currentCameraOp = this._webViewer.view.operatorManager.get(CameraOperatorPosition);
      this.dispatchCameraOperator(currentCameraOp);
    }
  }

  refreshToolOperator() {
    if (this._webViewer) {
      const currentRedlineOp = this._webViewer.view.operatorManager.get(ActiveToolOperatorPosition);
      this.dispatchToolOperator(currentRedlineOp);
    }
  }

  setRedlineOperator(redlineOperatorId: OperatorId) {
    if (!redlineModes.includes(redlineOperatorId as (typeof redlineModes)[number])) {
      console.error('Invalid redline operator ID:', redlineOperatorId);
      return;
    }

    this.activeToolOperator = redlineOperatorId;
  }

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

  set activeToolOperator(value: OperatorId | undefined) {
    if (!this._webViewer) {
      console.error('Cannot set operator: WebViewer not initialized');
      return;
    }

    this._webViewer.view.operatorManager.set(value ?? OperatorId.None, ActiveToolOperatorPosition);
    this.refreshToolOperator();
  }

  protected createRenderRoot() {
    return this;
  }

  protected override render(): unknown {
    return html``;
  }
}

export { WebViewerContextManager };
