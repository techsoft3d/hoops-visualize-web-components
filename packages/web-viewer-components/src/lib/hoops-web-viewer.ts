import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  Bcf,
  CadViewId,
  Camera,
  HandleEventType,
  InfoType,
  KeyModifiers,
  Markup,
  Matrix,
  NodeId,
  Point2,
  Operators,
  ScModelName,
  FileType,
  OverlayIndex,
  Event,
  SheetId,
  NodeSource,
  Point3,
  ViewOrientation,
  BodyId,
  WebViewer,
  RendererType,
  StreamingMode,
  BoundingPreviewMode,
  WebViewerConfig,
  core,
} from '@ts3d-hoops/web-viewer';
import { consume } from '@lit/context';
import WebViewerContextManager, { contextManagerContext } from './context-manager';

export type * from './custom-events';

@customElement('hoops-web-viewer')
export class WebViewerComponent extends LitElement implements WebViewerConfig {
  static override styles = [
    css`
      :host {
        display: block;
      }
      .web-viewer {
        position: relative;
        min-width: 300px;
        min-height: 300px;
        height: 100%;
      }

      .webviewer-canvas:focus {
        outline: none;
      }

      .noteTextElement {
        position: absolute;
        width: 250px;
        height: 160px;
        z-index: 2;
        background: rgba(180, 180, 180, 0.8);
        border-radius: 5px;
        border: 1px solid black;
        pointer-events: auto;
      }

      .noteTextElement:after,
      .noteTextElement:before {
        border: solid rgba(224, 24, 24, 0);
        content: ' ';
        height: 0;
        left: -20px;
        position: absolute;
        width: 0;
      }

      .noteTextElement:after {
        border-width: 11px;
        border-right-color: rgba(190, 190, 190, 1);
        top: 13px;
        left: -21px;
      }

      .noteTextElement:before {
        border-width: 12px;
        border-right-color: #000;
        top: 12px;
        left: -24px;
      }

      .noteTextElement textArea {
        margin: 5px;
        width: 200px;
        height: 142px;
        z-index: 2;
        resize: none;
      }

      .noteTextElement .noteButton {
        position: absolute;
        left: 220px;
        width: 20px;
        height: 20px;
        border: 1px solid black;
      }

      .noteTextElement .noteButton.color.blue {
        background-color: blue;
      }

      .noteTextElement .noteButton.color.red {
        background-color: red;
      }

      .noteTextElement .noteButton.color.green {
        background-color: rgba(0, 255, 0, 1);
      }

      .noteTextElement .noteButton.color.white {
        background-color: white;
      }

      .noteTextElement .noteButton.color.black {
        background-color: black;
      }

      .noteTextElement .noteButton.trash {
        background: url(images/ui-icons_444444_256x240.png) no-repeat top left;
        display: block;
        background-position: -176px -96px;
      }
    `,
  ];
  private hwv: WebViewer | null;

  public container!: HTMLElement;

  @consume({ context: contextManagerContext })
  contextManager?: WebViewerContextManager;

  @property({
    type: String,
  })
  public endpointUri?: string;

  @property({
    type: String,
  })
  public model?: string;

  @property({
    type: String,
  })
  public sessionToken?: string;

  @property({
    type: String,
    converter: (value) => {
      return value?.toLowerCase() === 'server' ? RendererType.Server : RendererType.Client;
    },
  })
  public rendererType?: RendererType;

  @property({
    type: Boolean,
  })
  public empty = false;

  @property({
    type: Boolean,
  })
  public usePointerEvents = false;

  @property({
    type: String,
    converter: (value) => {
      switch (value?.toLowerCase()) {
        case 'all':
          return StreamingMode.All;
        case 'ondemand':
          return StreamingMode.OnDemand;
        case 'interactive':
          return StreamingMode.Interactive;
        default:
          return StreamingMode.Default;
      }
    },
  })
  public streamingMode?: StreamingMode;

  @property({
    type: Number,
  })
  public memoryLimit?: number;

  @property({
    type: String,
    converter: (value) => {
      switch (value?.toLowerCase()) {
        case 'all':
          return StreamingMode.All;
        case 'ondemand':
          return StreamingMode.OnDemand;
        case 'interactive':
          return StreamingMode.Interactive;
        default:
          return StreamingMode.Default;
      }
    },
  })
  public boundingPreviewMode?: BoundingPreviewMode;

  @property({
    type: Number,
  })
  public defaultMeshLevel?: number;

  @property({
    type: Number,
  })
  public streamCutoffScale?: number;

  @property({
    type: Boolean,
  })
  public disableAutomaticBackgroundSheets = false;

  @property({
    type: Boolean,
  })
  public disableAutomaticFloorplanOverlay = false;

  @property({
    type: Boolean,
  })
  public calculateDefaultViewAxes = false;

  @property({
    type: Boolean,
  })
  public disableAutomaticFitWorld = false;

  @property({
    type: Boolean,
  })
  public enableShatteredModelUiViews = false;

  @property({
    type: String,
  })
  public enginePath?: string;

  @property({
    type: Number,
  })
  public defaultMetallicFactor?: number;

  @property({
    type: Number,
  })
  public defaultRoughnessFactor?: number;

  constructor() {
    super();
    this.hwv = null;
    this._handleResize = this._handleResize.bind(this);
  }

  _handleResize() {
    this.hwv?.resizeCanvas();
  }

  _handleReady() {
    if (!this.hwv) {
      return;
    }
    if (this.contextManager) {
      this.contextManager.webViewer = this.hwv;
    }

    const event = new CustomEvent<WebViewer>('hwvReady', {
      bubbles: true,
      composed: true,
      detail: this.hwv,
    });
    this.dispatchEvent(event);
    this.bindEvents(this.hwv);
  }

  override firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>,
  ): void {
    super.firstUpdated(_changedProperties);
    this.container = this.shadowRoot?.querySelector('.web-viewer') as HTMLElement;
    this.hwv = new WebViewer({
      container: this.container,
      endpointUri: this.endpointUri,
      model: this.model,
      sessionToken: this.sessionToken,
      rendererType: this.rendererType,
      empty: this.empty,
      usePointerEvents: this.usePointerEvents,
      streamingMode: this.streamingMode,
      memoryLimit: this.memoryLimit,
      boundingPreviewMode: this.boundingPreviewMode,
      defaultMeshLevel: this.defaultMeshLevel,
      streamCutoffScale: this.streamCutoffScale,
      disableAutomaticBackgroundSheets: this.disableAutomaticBackgroundSheets,
      disableAutomaticFloorplanOverlay: this.disableAutomaticFloorplanOverlay,
      calculateDefaultViewAxes: this.calculateDefaultViewAxes,
      disableAutomaticFitWorld: this.disableAutomaticFitWorld,
      enableShatteredModelUiViews: this.enableShatteredModelUiViews,
      enginePath: this.enginePath,
      defaultMetallicFactor: this.defaultMetallicFactor,
      defaultRoughnessFactor: this.defaultRoughnessFactor,
    });
    this.hwv.start();
    this._handleReady();
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._handleResize);
  }

  override disconnectedCallback() {
    window.removeEventListener('resize', this._handleResize);
    this.hwv?.shutdown();
    super.disconnectedCallback();
  }

  get viewer(): WebViewer | null {
    return this.hwv;
  }

  override render() {
    return html`<div class="web-viewer"></div>`;
  }

  bindEvents(hwv: WebViewer) {
    hwv.setCallbacks({
      addCuttingSection: (cuttingSection: core.ICuttingSection) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; cuttingSection: core.ICuttingSection }>(
            'hwvAddCuttingSection',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                cuttingSection,
              },
            },
          ),
        );
      },
      assemblyTreeReady: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvAssemblyTreeReady', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      bcfLoaded: (id: number, filename: Bcf.BCFName) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; id: number; filename: Bcf.BCFName }>('hwvBcfLoaded', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              id,
              filename,
            },
          }),
        );
      },
      bcfRemoved: (id: number) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; id: number }>('hwvBcfRemoved', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              id,
            },
          }),
        );
      },
      beginInteraction: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvBeginInteraction', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      }, // XXX: This should probably pass in a reference of the operator in question.
      cadViewCreated: (cadViewId: CadViewId, cadViewName: string) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; cadViewId: CadViewId; cadViewName: string }>(
            'hwvCadViewCreated',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                cadViewId,
                cadViewName,
              },
            },
          ),
        );
      },
      camera: (camera: Camera) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; camera: Camera }>('hwvCamera', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              camera,
            },
          }),
        );
      },
      cappingIdle: (isIdle: boolean, cappedInstanceCount: number) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; isIdle: boolean; cappedInstanceCount: number }>(
            'hwvCappingIdle',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                isIdle,
                cappedInstanceCount,
              },
            },
          ),
        );
      },
      configurationActivated: (nodeId: NodeId) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; nodeId: NodeId }>('hwvConfigurationActivated', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              nodeId,
            },
          }),
        );
      },
      contextMenu: (position: Point2, modifiers: KeyModifiers) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; position: Point2; modifiers: KeyModifiers }>(
            'hwvContextMenu',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                position,
                modifiers,
              },
            },
          ),
        );
      },
      cuttingPlaneDragStart: (cuttingSection: core.ICuttingSection, planeIndex: number) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            cuttingSection: core.ICuttingSection;
            planeIndex: number;
          }>('hwvCuttingPlaneDragStart', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              cuttingSection,
              planeIndex,
            },
          }),
        );
      },
      cuttingPlaneDrag: (cuttingSection: core.ICuttingSection, planeIndex: number) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            cuttingSection: core.ICuttingSection;
            planeIndex: number;
          }>('hwvCuttingPlaneDrag', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              cuttingSection,
              planeIndex,
            },
          }),
        );
      },
      cuttingPlaneDragEnd: (cuttingSection: core.ICuttingSection, planeIndex: number) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            cuttingSection: core.ICuttingSection;
            planeIndex: number;
          }>('hwvCuttingPlaneDragEnd', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              cuttingSection,
              planeIndex,
            },
          }),
        );
      },
      cuttingSectionsLoaded: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvCuttingSectionsLoaded', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      endInteraction: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvEndInteraction', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      }, // XXX: This should probably pass in a reference of the operator in question.
      explode: (magnitude: number) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; magnitude: number }>('hwvExplode', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              magnitude,
            },
          }),
        );
      },
      firstModelLoaded: (modelRootIds: NodeId[], isHwf: boolean) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            modelRootIds: NodeId[];
            isHwf: boolean;
          }>('hwvFirstModelLoaded', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              modelRootIds,
              isHwf,
            },
          }),
        );
      },
      frameDrawn: (camera: Camera, visiblePoints: number[]) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; camera: Camera; visiblePoints: number[] }>(
            'hwvFrameDrawn',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                camera,
                visiblePoints,
              },
            },
          ),
        );
      },
      handleEventStart: (
        eventType: HandleEventType,
        nodeIds: NodeId[],
        initialMatrices: Matrix[],
      ) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            eventType: HandleEventType;
            nodeIds: NodeId[];
            initialMatrices: Matrix[];
          }>('hwvHandleEventStart', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              eventType,
              nodeIds,
              initialMatrices,
            },
          }),
        );
      },
      handleEvent: (
        eventType: HandleEventType,
        nodeIds: NodeId[],
        initialMatrices: Matrix[],
        newMatrices: Matrix[],
      ) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            eventType: HandleEventType;
            nodeIds: NodeId[];
            initialMatrices: Matrix[];
            newMatrices: Matrix[];
          }>('hwvHandleEvent', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              eventType,
              nodeIds,
              initialMatrices,
              newMatrices,
            },
          }),
        );
      },
      handleEventEnd: (
        eventType: HandleEventType,
        nodeIds: NodeId[],
        initialMatrices: Matrix[],
        newMatrices: Matrix[],
      ) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            eventType: HandleEventType;
            nodeIds: NodeId[];
            initialMatrices: Matrix[];
            newMatrices: Matrix[];
          }>('hwvHandleEventEnd', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              eventType,
              nodeIds,
              initialMatrices,
              newMatrices,
            },
          }),
        );
      },
      hwfParseComplete: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvHwfParseComplete', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      incrementalSelectionBatchBegin: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvIncrementalSelectionBatchBegin', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      incrementalSelectionBatchEnd: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvIncrementalSelectionBatchEnd', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      incrementalSelectionEnd: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvIncrementalSelectionEnd', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      info: (infoType: InfoType, message: string) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; infoType: InfoType; message: string }>('hwvInfo', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              infoType,
              message,
            },
          }),
        );
      },
      lineCreated: (line: Markup.Line.LineMarkup) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; line: Markup.Line.LineMarkup }>('hwvLineCreated', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              line,
            },
          }),
        );
      },
      lineDeleted: (line: Markup.Line.LineMarkup) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; line: Markup.Line.LineMarkup }>('hwvLineDeleted', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              line,
            },
          }),
        );
      },
      lineLoaded: (line: Markup.Line.LineMarkup) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; line: Markup.Line.LineMarkup }>('hwvLineLoaded', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              line,
            },
          }),
        );
      },
      measurementBegin: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvMeasurementBegin', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      measurementCreated: (measurement: Operators.Markup.Measure.MeasureMarkup) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            measurement: Operators.Markup.Measure.MeasureMarkup;
          }>('hwvMeasurementCreated', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              measurement,
            },
          }),
        );
      },
      measurementDeleted: (measurement: Operators.Markup.Measure.MeasureMarkup) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            measurement: Operators.Markup.Measure.MeasureMarkup;
          }>('hwvMeasurementDeleted', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              measurement,
            },
          }),
        );
      },
      measurementHidden: (measurement: Operators.Markup.Measure.MeasureMarkup) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            measurement: Operators.Markup.Measure.MeasureMarkup;
          }>('hwvMeasurementHidden', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              measurement,
            },
          }),
        );
      },
      measurementLoaded: (measurement: Operators.Markup.Measure.MeasureMarkup) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            measurement: Operators.Markup.Measure.MeasureMarkup;
          }>('hwvMeasurementLoaded', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              measurement,
            },
          }),
        );
      },
      measurementShown: (measurement: Operators.Markup.Measure.MeasureMarkup) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            measurement: Operators.Markup.Measure.MeasureMarkup;
          }>('hwvMeasurementShown', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              measurement,
            },
          }),
        );
      },
      measurementValueSet: (measurement: Operators.Markup.Measure.MeasureMarkup) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            measurement: Operators.Markup.Measure.MeasureMarkup;
          }>('hwvMeasurementValueSet', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              measurement,
            },
          }),
        );
      },
      missingModel: (modelPath: string) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; modelPath: string }>('hwvMissingModel', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              modelPath,
            },
          }),
        );
      },
      modelLoadBegin: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvModelLoadBegin', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      modelLoadFailure: (modelName: ScModelName, reason: string, error?: any) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            modelName: ScModelName;
            reason: string;
            error?: any;
          }>('hwvModelLoadFailure', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              modelName,
              reason,
              error,
            },
          }),
        );
      },
      modelStructureHeaderParsed: (filename: string, fileType: FileType) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; filename: string; fileType: FileType }>(
            'hwvModelStructureHeaderParsed',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                filename,
                fileType,
              },
            },
          ),
        );
      },
      modelStructureReady: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvModelStructureReady', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      modelSwitched: (clearOnly: boolean, modelRootIds: NodeId[]) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; clearOnly: boolean; modelRootIds: NodeId[] }>(
            'hwvModelSwitched',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                clearOnly,
                modelRootIds,
              },
            },
          ),
        );
      },
      modelSwitchStart: (clearOnly: boolean) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; clearOnly: boolean }>('hwvModelSwitchStart', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              clearOnly,
            },
          }),
        );
      },
      noteTextCreated: (noteText: Operators.Markup.Note.NoteText) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; noteText: Operators.Markup.Note.NoteText }>(
            'hwvNoteTextCreated',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                noteText,
              },
            },
          ),
        );
      },
      noteTextDeleted: (noteText: Operators.Markup.Note.NoteText) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; noteText: Operators.Markup.Note.NoteText }>(
            'hwvNoteTextDeleted',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                noteText,
              },
            },
          ),
        );
      },
      noteTextUpdated: (noteText: Operators.Markup.Note.NoteText) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; noteText: Operators.Markup.Note.NoteText }>(
            'hwvNoteTextUpdated',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                noteText,
              },
            },
          ),
        );
      },
      noteTextHidden: (noteText: Operators.Markup.Note.NoteText) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; noteText: Operators.Markup.Note.NoteText }>(
            'hwvNoteTextHidden',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                noteText,
              },
            },
          ),
        );
      },
      noteTextShown: (noteText: Operators.Markup.Note.NoteText) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; noteText: Operators.Markup.Note.NoteText }>(
            'hwvNoteTextShown',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                noteText,
              },
            },
          ),
        );
      },
      overlayViewportSet: (overlayIndex: OverlayIndex) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; overlayIndex: OverlayIndex }>('hwvOverlayViewportSet', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              overlayIndex,
            },
          }),
        );
      },
      redlineCreated: (redlineMarkup: Markup.Redline.RedlineItem) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; redlineMarkup: Markup.Redline.RedlineItem }>(
            'hwvRedlineCreated',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                redlineMarkup,
              },
            },
          ),
        );
      },
      redlineDeleted: (redlineMarkup: Markup.Redline.RedlineItem) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; redlineMarkup: Markup.Redline.RedlineItem }>(
            'hwvRedlineDeleted',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                redlineMarkup,
              },
            },
          ),
        );
      },
      redlineUpdated: (redlineMarkup: Markup.Redline.RedlineItem) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; redlineMarkup: Markup.Redline.RedlineItem }>(
            'hwvRedlineUpdated',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                redlineMarkup,
              },
            },
          ),
        );
      },
      removeCuttingSection: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvRemoveCuttingSection', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      sceneReady: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvSceneReady', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      selectionArray: (selectionEvents: Event.NodeSelectionEvent[], removed: boolean) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            selectionEvents: Event.NodeSelectionEvent[];
            removed: boolean;
          }>('hwvSelectionArray', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              selectionEvents,
              removed,
            },
          }),
        );
      },
      sheetActivated: (nodeId: SheetId) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; nodeId: SheetId }>('hwvSheetActivated', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              nodeId,
            },
          }),
        );
      },
      sheetDeactivated: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvSheetDeactivated', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      streamingActivated: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvStreamingActivated', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      streamingDeactivated: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvStreamingDeactivated', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      subtreeDeleted: (modelRootIds: NodeId[]) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; modelRootIds: NodeId[] }>('hwvSubtreeDeleted', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              modelRootIds,
            },
          }),
        );
      },
      subtreeLoaded: (modelRootIds: NodeId[], source: NodeSource) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; modelRootIds: NodeId[]; source: NodeSource }>(
            'hwvSubtreeLoaded',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                modelRootIds,
                source,
              },
            },
          ),
        );
      },
      timeout: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvTimeout', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      timeoutWarning: (minutesRemaining: number) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; minutesRemaining: number }>('hwvTimeoutWarning', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              minutesRemaining,
            },
          }),
        );
      },
      transitionBegin: (duration: number) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; duration: number }>('hwvTransitionBegin', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              duration,
            },
          }),
        );
      },
      transitionEnd: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvTransitionEnd', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      viewAxes: (frontVector: Point3, upVector: Point3) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; frontVector: Point3; upVector: Point3 }>(
            'hwvViewAxes',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                frontVector,
                upVector,
              },
            },
          ),
        );
      },
      viewCreated: (view: Markup.MarkupView) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; view: Markup.MarkupView }>('hwvViewCreated', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              view,
            },
          }),
        );
      },
      viewDeactivated: (view: Markup.MarkupView) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; view: Markup.MarkupView }>('hwvViewDeactivated', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              view,
            },
          }),
        );
      },
      viewDeleted: (view: Markup.MarkupView) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; view: Markup.MarkupView }>('hwvViewDeleted', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              view,
            },
          }),
        );
      },
      viewLoaded: (view: Markup.MarkupView) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; view: Markup.MarkupView }>('hwvViewLoaded', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              view,
            },
          }),
        );
      },
      viewOrientation: (orientation: ViewOrientation) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; orientation: ViewOrientation }>('hwvViewOrientation', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              orientation,
            },
          }),
        );
      },
      visibilityChanged: (shownBodyIds: BodyId[], hiddenBodyIds: BodyId[]) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; shownBodyIds: BodyId[]; hiddenBodyIds: BodyId[] }>(
            'hwvVisibilityChanged',
            {
              bubbles: true,
              composed: true,
              detail: {
                hwv,
                shownBodyIds,
                hiddenBodyIds,
              },
            },
          ),
        );
      },
      walkOperatorActivated: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvWalkOperatorActivated', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      walkOperatorDeactivated: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvWalkOperatorDeactivated', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      webGlContextLost: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvWebGlContextLost', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      websocketConnectionClosed: () => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer }>('hwvWebsocketConnectionClosed', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
            },
          }),
        );
      },
      XHRonerror: (errorEvent: ErrorEvent) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; errorEvent: ErrorEvent }>('hwvXHRonerror', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              errorEvent,
            },
          }),
        );
      },
      XHRonloadend: (progressEvent: ProgressEvent, status: number, uri: string) => {
        this.dispatchEvent(
          new CustomEvent<{
            hwv: WebViewer;
            progressEvent: ProgressEvent;
            status: number;
            uri: string;
          }>('hwvXHRonloadend', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              progressEvent,
              status,
              uri,
            },
          }),
        );
      },
      XHRonprogress: (progressEvent: ProgressEvent) => {
        this.dispatchEvent(
          new CustomEvent<{ hwv: WebViewer; progressEvent: ProgressEvent }>('hwvXHRonprogress', {
            bubbles: true,
            composed: true,
            detail: {
              hwv,
              progressEvent,
            },
          }),
        );
      },
    });
  }
}

export default WebViewerComponent;
