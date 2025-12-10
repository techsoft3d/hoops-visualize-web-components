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

/**
 * A simple HTML tag to quickly initialize a complete viewer.
 *
 * This component provides a full-featured 3D model viewer with support for loading models,
 * navigation, selection, markup, and various visualization modes.
 *
 * @element hoops-web-viewer
 *
 * @fires hwvAddCuttingSection - Emitted when a cutting section is added
 * @fires hwvAssemblyTreeReady - Emitted when the assembly tree is ready
 * @fires hwvBcfLoaded - Emitted when a BCF file is loaded
 * @fires hwvBcfRemoved - Emitted when a BCF file is removed
 * @fires hwvBeginInteraction - Emitted when user interaction begins
 * @fires hwvCadViewCreated - Emitted when a CAD view is created
 * @fires hwvCamera - Emitted when camera position changes
 * @fires hwvCappingIdle - Emitted when capping becomes idle
 * @fires hwvConfigurationActivated - Emitted when a configuration is activated
 * @fires hwvContextMenu - Emitted when context menu is requested
 * @fires hwvCuttingPlaneDrag - Emitted during cutting plane drag
 * @fires hwvCuttingPlaneDragEnd - Emitted when cutting plane drag ends
 * @fires hwvCuttingPlaneDragStart - Emitted when cutting plane drag starts
 * @fires hwvCuttingSectionsLoaded - Emitted when cutting sections are loaded
 * @fires hwvEndInteraction - Emitted when user interaction ends
 * @fires hwvExplode - Emitted when explode state changes
 * @fires hwvFirstModelLoaded - Emitted when the first model is loaded
 * @fires hwvFrameDrawn - Emitted when a frame is drawn
 * @fires hwvHandleEvent - Emitted during a handle event
 * @fires hwvHandleEventEnd - Emitted when a handle event ends
 * @fires hwvHandleEventStart - Emitted when a handle event starts
 * @fires hwvHwfParseComplete - Emitted when HWF parsing is complete
 * @fires hwvIncrementalSelectionBatchBegin - Emitted when incremental selection batch begins
 * @fires hwvIncrementalSelectionBatchEnd - Emitted when incremental selection batch ends
 * @fires hwvIncrementalSelectionEnd - Emitted when incremental selection ends
 * @fires hwvInfo - Emitted with informational messages
 * @fires hwvLineCreated - Emitted when a line markup is created
 * @fires hwvLineDeleted - Emitted when a line markup is deleted
 * @fires hwvLineLoaded - Emitted when a line markup is loaded
 * @fires hwvMeasurementBegin - Emitted when measurement begins
 * @fires hwvMeasurementCreated - Emitted when a measurement is created
 * @fires hwvMeasurementDeleted - Emitted when a measurement is deleted
 * @fires hwvMeasurementHidden - Emitted when a measurement is hidden
 * @fires hwvMeasurementLoaded - Emitted when a measurement is loaded
 * @fires hwvMeasurementShown - Emitted when a measurement is shown
 * @fires hwvMeasurementValueSet - Emitted when a measurement value is set
 * @fires hwvMissingModel - Emitted when a model is missing
 * @fires hwvModelLoadBegin - Emitted when model loading begins
 * @fires hwvModelLoadFailure - Emitted when model loading fails
 * @fires hwvModelStructureHeaderParsed - Emitted when model structure header is parsed
 * @fires hwvModelStructureReady - Emitted when the model structure is loaded
 * @fires hwvModelSwitched - Emitted when the model is switched
 * @fires hwvModelSwitchStart - Emitted when model switching starts
 * @fires hwvNoteTextCreated - Emitted when a note text is created
 * @fires hwvNoteTextDeleted - Emitted when a note text is deleted
 * @fires hwvNoteTextHidden - Emitted when a note text is hidden
 * @fires hwvNoteTextShown - Emitted when a note text is shown
 * @fires hwvNoteTextUpdated - Emitted when a note text is updated
 * @fires hwvOverlayViewportSet - Emitted when overlay viewport is set
 * @fires hwvReady - Emitted when the web viewer is initialized and ready
 * @fires hwvRedlineCreated - Emitted when a redline is created
 * @fires hwvRedlineDeleted - Emitted when a redline is deleted
 * @fires hwvRedlineUpdated - Emitted when a redline is updated
 * @fires hwvRemoveCuttingSection - Emitted when a cutting section is removed
 * @fires hwvSceneReady - Emitted when the scene is ready
 * @fires hwvSelectionArray - Emitted when selection changes
 * @fires hwvSheetActivated - Emitted when a sheet is activated
 * @fires hwvSheetDeactivated - Emitted when a sheet is deactivated
 * @fires hwvStreamingActivated - Emitted when streaming is activated
 * @fires hwvStreamingDeactivated - Emitted when streaming is deactivated
 * @fires hwvSubtreeDeleted - Emitted when a subtree is deleted
 * @fires hwvSubtreeLoaded - Emitted when a subtree is loaded
 * @fires hwvTimeout - Emitted on session timeout
 * @fires hwvTimeoutWarning - Emitted before session timeout
 * @fires hwvTransitionBegin - Emitted when a transition begins
 * @fires hwvTransitionEnd - Emitted when a transition ends
 * @fires hwvViewAxes - Emitted when view axes change
 * @fires hwvViewCreated - Emitted when a view is created
 * @fires hwvViewDeactivated - Emitted when a view is deactivated
 * @fires hwvViewDeleted - Emitted when a view is deleted
 * @fires hwvViewLoaded - Emitted when a view is loaded
 * @fires hwvViewOrientation - Emitted when view orientation changes
 * @fires hwvVisibilityChanged - Emitted when visibility changes
 * @fires hwvWalkOperatorActivated - Emitted when walk operator is activated
 * @fires hwvWalkOperatorDeactivated - Emitted when walk operator is deactivated
 * @fires hwvWebGlContextLost - Emitted when WebGL context is lost
 * @fires hwvWebsocketConnectionClosed - Emitted when websocket connection closes
 * @fires hwvXHRonerror - Emitted on XHR error
 * @fires hwvXHRonloadend - Emitted when XHR load ends
 * @fires hwvXHRonprogress - Emitted on XHR progress
 *
 * @attribute {string} endpointuri - Specifies the endpoint to be used by the viewer.
 * @attribute {string} model - Specifies the instance name to be loaded.
 * @attribute {string} sessiontoken - An arbitrary value used for authentication.
 * @attribute {string} renderertype - Specifies the renderer type to be used.
 * @attribute {boolean} empty - Whether the viewer should be started without connecting to a server or loading a model.
 * @attribute {boolean} usepointerevents - Specifies whether pointer events should be used when available.
 * @attribute {string} streamingmode - Sets the streaming mode that the viewer will use.
 * @attribute {number} memorylimit - Controls the amount of mesh data present on the client machine at given time.
 * @attribute {string} boundingpreviewmode - Specifies what types of bounding previews should be rendered.
 * @attribute {number} defaultmeshlevel - Specifies which mesh detail level will be used to initially stream the model.
 * @attribute {number} streamcutoffscale - Specifies a scale factor that will be applied to the streaming size cutoff.
 * @attribute {boolean} disableautomaticbackgroundsheets - If true, then automatic generation of background sheets for drawings is not performed when the drawing is loaded.
 * @attribute {boolean} disableautomaticfloorplanoverlay - If true, then the floorplan overlay capability will not be displayed automatically for BIM enabled models.
 * @attribute {boolean} calculatedefaultviewaxes - If true, the default view axes will be calculated from the initial camera unless explicitly set during authoring time.
 * @attribute {boolean} disableautomaticfitworld - If true, disable automatic fitworld on camera activation when there is no camera on view.
 * @attribute {boolean} enableshatteredmodeluiviews - If true, then CAD views contained within external models will populate the model tree UI.
 * @attribute {string} enginepath - Path containing the graphics engine `.wasm` files.
 * @attribute {number} defaultmetallicfactor - Sets a default metallic factor that will be applied to ALL non PBR materials in the scene.
 * @attribute {number} defaultroughnessfactor - Sets a default roughness factor that will be applied to ALL non PBR materials in the scene.
 *
 * @example
 * ```html
 * <hoops-web-viewer endpointuri="/models/sample.scs" enginepath="/engine">
 * </hoops-web-viewer>
 *
 * <script>
 *   const viewer = document.getElementsByTagName('hoops-web-viewer')[0];
 *   viewer.addEventListener('hwvReady', (event) => {
 *     console.log('Viewer ready:', event.detail);
 *   });
 * </script>
 * ```
 *
 * @since 2025.8.0
 */
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
  /**
   * The internal WebViewer instance.
   * @internal
   */
  private hwv: WebViewer | null;

  /**
   * The DOM container element that hosts the WebViewer canvas.
   * Automatically assigned during component initialization.
   */
  public container!: HTMLElement;

  /**
   * Context manager for coordinating component communication.
   * Automatically injected when the component is within a context manager.
   */
  @consume({ context: contextManagerContext })
  contextManager?: WebViewerContextManager;

  /**
   * Specifies the endpoint to be used by the viewer. This can be of type: http, https or ws.
   */
  @property({
    type: String,
  })
  public endpointUri?: string;

  /**
   * Specifies the instance name to be loaded. This option is required if you specify an enpdointUri of type `ws://` or `wss://`.
   */
  @property({
    type: String,
  })
  public model?: string;

  /**
   * An arbitrary value used for authentication. If used, it must match the token expected by the server for connection to proceed.
   */
  @property({
    type: String,
  })
  public sessionToken?: string;

  /**
   * Specifies the renderer type to be used.
   * Any invalid value will be converted to \`RendererType.Client\`.
   */
  @property({
    type: String,
    converter: (value) => {
      return value?.toLowerCase() === 'server' ? RendererType.Server : RendererType.Client;
    },
  })
  public rendererType?: RendererType;

  /**
   * Whether the viewer should be started without connecting to a server or loading a model.
   * @default false
   */
  @property({
    type: Boolean,
  })
  public empty = false;

  /**
   * Specifies whether pointer events should be used when available. Setting this option to false can be useful when using web views in GUI toolkits that rely on Internet Explorer.
   * @default false
   */
  @property({
    type: Boolean,
  })
  public usePointerEvents = false;

  /**
   * Sets the streaming mode that the viewer will use.
   * Any invalid value will be converted to \`StreamingMode.Default\`.
   */
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

  /**
   * Controls the amount of mesh data present on the client machine at given time. This value is expressed in [Mebibytes](https://en.wikipedia.org/wiki/Mebibyte).
   */
  @property({
    type: Number,
  })
  public memoryLimit?: number;

  /**
   * Specifies what types of bounding previews should be rendered.
   * Any invalid value will be converted to \`StreamingMode.Default\`.
   */
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

  /**
   * Specifies which mesh detail level will be used to initially stream the model.
   */
  @property({
    type: Number,
  })
  public defaultMeshLevel?: number;

  /**
   * Specifies a scale factor that will be applied to the streaming size cutoff.
   *
   * In streaming sessions, an object whose projected size is lower than the cutoff will not be streamed until its projected size reaches the cutoff.
   *
   * In file sessions, when loading a tree via XML, a file whose projected size is lower than the cutoff will not be requested until its projected size reaches the cutoff.
   *
   * A value of 0 will disable the cutoff.  The value should be in the interval of [0.0, 2.0].
   * If unspecified, this value will default to 1.0 for streaming sessions and 0.0 (disabled) for file based sessions.
   */
  @property({
    type: Number,
  })
  public streamCutoffScale?: number;

  /**
   * If true, then automatic generation of background sheets for drawings is not performed when the drawing is loaded.
   * @default false
   */
  @property({
    type: Boolean,
  })
  public disableAutomaticBackgroundSheets = false;

  /**
   * If true, then the floorplan overlay capability will not be displayed automatically for BIM enabled models
   * @default false
   */
  @property({
    type: Boolean,
  })
  public disableAutomaticFloorplanOverlay = false;

  /**
   * If true, the default view axes will be calculated from the initial camera unless explicitly set during authoring time.
   * @default false
   */
  @property({
    type: Boolean,
  })
  public calculateDefaultViewAxes = false;

  /**
   * If true, disable automatic fitworld on camera activation when there is no camera on view
   * @default false
   */
  @property({
    type: Boolean,
  })
  public disableAutomaticFitWorld = false;

  /**
   * If true, then CAD views contained within external models will populate the model tree UI.
   * @default false
   */
  @property({
    type: Boolean,
  })
  public enableShatteredModelUiViews = false;

  /**
   * Path containing the graphics engine `.wasm` files. Follows the same rules as the `src` attribute of an HTML `script` tag.
   */
  @property({
    type: String,
  })
  public enginePath?: string;

  /**
   * Sets a default metallic factor that will be applied to ALL non PBR materials in the scene. Acceptable value range is (0.0 - 1.0)
   * If [[defaultRoughnessFactor]] is specified and this value is omitted, a value of 1.0 will be assumed.
   */
  @property({
    type: Number,
  })
  public defaultMetallicFactor?: number;

  /**
   * Sets a default roughness factor that will be applied to ALL non PBR materials in the scene. . Acceptable value range is (0.0 - 1.0)
   * If [[defaultMetallicFactor]] is specified and this value is omitted, a value of 1.0 will be assumed.
   */
  @property({
    type: Number,
  })
  public defaultRoughnessFactor?: number;

  /**
   * Creates a new WebViewerComponent instance.
   * Initializes the component and binds event handlers.
   * @internal
   */
  constructor() {
    super();
    this.hwv = null;
    this.handleResize = this.handleResize.bind(this);
  }

  /**
   * Handles window resize events by updating the viewer canvas dimensions.
   * @returns {void}
   * @internal
   */
  private handleResize() {
    this.hwv?.resizeCanvas();
  }

  /**
   * Handles viewer initialization completion.
   * Sets up context manager, dispatches ready event, and binds viewer events.
   * @returns {void}
   * @internal
   */
  private handleReady() {
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

  /**
   * Lifecycle callback invoked after the component's first update.
   * Creates and initializes the WebViewer instance with configured properties.
   * @param _changedProperties - Map of changed properties (unused)
   * @returns {void}
   * @internal
   */
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
    this.handleReady();
  }

  /**
   * Lifecycle callback invoked when the component is added to the DOM.
   * Sets up window resize event listeners for responsive canvas sizing.
   * @returns {void}
   * @internal
   */
  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Lifecycle callback invoked when the component is removed from the DOM.
   * Cleans up event listeners and shuts down the WebViewer instance.
   * @returns {void}
   * @internal
   */
  override disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    this.hwv?.shutdown();
    super.disconnectedCallback();
  }

  /**
   * Gets the underlying WebViewer instance.
   * Provides access to the full HOOPS Web Viewer API for advanced operations.
   * @returns {WebViewer | null} The WebViewer instance or null if not initialized
   */
  get viewer(): WebViewer | null {
    return this.hwv;
  }

  /**
   * Renders the component template.
   * Creates the container div that will host the WebViewer canvas and slots.
   * @returns {TemplateResult} The component's HTML template
   * @internal
   */
  override render() {
    return html`<div class="web-viewer"></div>`;
  }

  /**
   * Binds WebViewer events to custom events for component communication.
   * Creates event listeners that forward viewer events as custom DOM events.
   * @param hwv - The WebViewer instance to bind events from
   * @returns {void}
   * @internal
   */
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
