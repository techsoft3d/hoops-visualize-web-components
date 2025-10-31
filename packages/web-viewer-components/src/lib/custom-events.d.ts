import { WebViewer } from '@ts3d-hoops/web-viewer';

declare global {
  interface CustomEventMap {
    hwvReady: CustomEvent<WebViewer>;
    hwvAddCuttingSection: CustomEvent<{ hwv: WebViewer; cuttingSection: core.ICuttingSection }>;
    hwvAssemblyTreeReady: CustomEvent<{ hwv: WebViewer }>;
    hwvBcfLoaded: CustomEvent<{ hwv: WebViewer; id: number; filename: Bcf.BCFName }>;
    hwvBcfRemoved: CustomEvent<{ hwv: WebViewer; id: number }>;
    hwvBeginInteraction: CustomEvent<{ hwv: WebViewer }>;
    hwvCamera: CustomEvent<{ hwv: WebViewer; camera: Camera }>;
    hwvConfigurationActivated: CustomEvent<{ hwv: WebViewer; nodeId: NodeId }>;
    hwvCuttingSectionsLoaded: CustomEvent<{ hwv: WebViewer }>;
    hwvEndInteraction: CustomEvent<{ hwv: WebViewer }>;
    hwvExplode: CustomEvent<{ hwv: WebViewer; magnitude: number }>;
    hwvHwfParseComplete: CustomEvent<{ hwv: WebViewer }>;
    hwvIncrementalSelectionBatchBegin: CustomEvent<{ hwv: WebViewer }>;
    hwvIncrementalSelectionBatchEnd: CustomEvent<{ hwv: WebViewer }>;
    hwvIncrementalSelectionEnd: CustomEvent<{ hwv: WebViewer }>;
    hwvInfo: CustomEvent<{ hwv: WebViewer; infoType: InfoType; message: string }>;
    hwvLineCreated: CustomEvent<{ hwv: WebViewer; line: Markup.Line.LineMarkup }>;
    hwvLineDeleted: CustomEvent<{ hwv: WebViewer; line: Markup.Line.LineMarkup }>;
    hwvLineLoaded: CustomEvent<{ hwv: WebViewer; line: Markup.Line.LineMarkup }>;
    hwvMeasurementBegin: CustomEvent<{ hwv: WebViewer }>;
    hwvMissingModel: CustomEvent<{ hwv: WebViewer; modelPath: string }>;
    hwvModelLoadBegin: CustomEvent<{ hwv: WebViewer }>;
    hwvModelStructureReady: CustomEvent<{ hwv: WebViewer }>;
    hwvModelSwitchStart: CustomEvent<{ hwv: WebViewer; clearOnly: boolean }>;
    hwvOverlayViewportSet: CustomEvent<{ hwv: WebViewer; overlayIndex: OverlayIndex }>;
    hwvRemoveCuttingSection: CustomEvent<{ hwv: WebViewer }>;
    hwvSceneReady: CustomEvent<{ hwv: WebViewer }>;
    hwvSheetActivated: CustomEvent<{ hwv: WebViewer; nodeId: SheetId }>;
    hwvSheetDeactivated: CustomEvent<{ hwv: WebViewer }>;
    hwvStreamingActivated: CustomEvent<{ hwv: WebViewer }>;
    hwvStreamingDeactivated: CustomEvent<{ hwv: WebViewer }>;
    hwvSubtreeDeleted: CustomEvent<{ hwv: WebViewer; modelRootIds: NodeId[] }>;
    hwvTimeout: CustomEvent<{ hwv: WebViewer }>;
    hwvTimeoutWarning: CustomEvent<{ hwv: WebViewer; minutesRemaining: number }>;
    hwvTransitionBegin: CustomEvent<{ hwv: WebViewer; duration: number }>;
    hwvTransitionEnd: CustomEvent<{ hwv: WebViewer }>;
    hwvViewCreated: CustomEvent<{ hwv: WebViewer; view: Markup.MarkupView }>;
    hwvViewDeactivated: CustomEvent<{ hwv: WebViewer; view: Markup.MarkupView }>;
    hwvViewDeleted: CustomEvent<{ hwv: WebViewer; view: Markup.MarkupView }>;
    hwvViewLoaded: CustomEvent<{ hwv: WebViewer; view: Markup.MarkupView }>;
    hwvViewOrientation: CustomEvent<{ hwv: WebViewer; orientation: ViewOrientation }>;
    hwvWalkOperatorActivated: CustomEvent<{ hwv: WebViewer }>;
    hwvWalkOperatorDeactivated: CustomEvent<{ hwv: WebViewer }>;
    hwvWebGlContextLost: CustomEvent<{ hwv: WebViewer }>;
    hwvWebsocketConnectionClosed: CustomEvent<{ hwv: WebViewer }>;
    hwvXHRonerror: CustomEvent<{ hwv: WebViewer; errorEvent: ErrorEvent }>;
    hwvXHRonprogress: CustomEvent<{ hwv: WebViewer; progressEvent: ProgressEvent }>;
    hwvCadViewCreated: CustomEvent<{ hwv: WebViewer; cadViewId: CadViewId; cadViewName: string }>;
    hwvCappingIdle: CustomEvent<{ hwv: WebViewer; isIdle: boolean; cappedInstanceCount: number }>;
    hwvContextMenu: CustomEvent<{ hwv: WebViewer; position: Point2; modifiers: KeyModifiers }>;
    hwvCuttingPlaneDragStart: CustomEvent<{
      hwv: WebViewer;
      cuttingSection: core.ICuttingSection;
      planeIndex: number;
    }>;
    hwvCuttingPlaneDrag: CustomEvent<{
      hwv: WebViewer;
      cuttingSection: core.ICuttingSection;
      planeIndex: number;
    }>;
    hwvCuttingPlaneDragEnd: CustomEvent<{
      hwv: WebViewer;
      cuttingSection: core.ICuttingSection;
      planeIndex: number;
    }>;
    hwvFirstModelLoaded: CustomEvent<{
      hwv: WebViewer;
      modelRootIds: NodeId[];
      isHwf: boolean;
    }>;
    hwvFrameDrawn: CustomEvent<{ hwv: WebViewer; camera: Camera; visiblePoints: number[] }>;
    hwvHandleEventStart: CustomEvent<{
      hwv: WebViewer;
      eventType: HandleEventType;
      nodeIds: NodeId[];
      initialMatrices: Matrix[];
    }>;
    hwvHandleEvent: CustomEvent<{
      hwv: WebViewer;
      eventType: HandleEventType;
      nodeIds: NodeId[];
      initialMatrices: Matrix[];
      newMatrices: Matrix[];
    }>;
    hwvHandleEventEnd: CustomEvent<{
      hwv: WebViewer;
      eventType: HandleEventType;
      nodeIds: NodeId[];
      initialMatrices: Matrix[];
      newMatrices: Matrix[];
    }>;
    hwvMeasurementCreated: CustomEvent<{
      hwv: WebViewer;
      measurement: Operators.Markup.Measure.MeasureMarkup;
    }>;
    hwvMeasurementDeleted: CustomEvent<{
      hwv: WebViewer;
      measurement: Operators.Markup.Measure.MeasureMarkup;
    }>;
    hwvMeasurementHidden: CustomEvent<{
      hwv: WebViewer;
      measurement: Operators.Markup.Measure.MeasureMarkup;
    }>;
    hwvMeasurementLoaded: CustomEvent<{
      hwv: WebViewer;
      measurement: Operators.Markup.Measure.MeasureMarkup;
    }>;
    hwvMeasurementShown: CustomEvent<{
      hwv: WebViewer;
      measurement: Operators.Markup.Measure.MeasureMarkup;
    }>;
    hwvMeasurementValueSet: CustomEvent<{
      hwv: WebViewer;
      measurement: Operators.Markup.Measure.MeasureMarkup;
    }>;
    hwvModelLoadFailure: CustomEvent<{
      hwv: WebViewer;
      modelName: ScModelName;
      reason: string;
      error?: unknown;
    }>;
    hwvModelStructureHeaderParsed: CustomEvent<{
      hwv: WebViewer;
      filename: string;
      fileType: FileType;
    }>;
    hwvModelSwitched: CustomEvent<{ hwv: WebViewer; clearOnly: boolean; modelRootIds: NodeId[] }>;
    hwvNoteTextCreated: CustomEvent<{ hwv: WebViewer; noteText: Operators.Markup.Note.NoteText }>;
    hwvNoteTextDeleted: CustomEvent<{ hwv: WebViewer; noteText: Operators.Markup.Note.NoteText }>;
    hwvNoteTextUpdated: CustomEvent<{ hwv: WebViewer; noteText: Operators.Markup.Note.NoteText }>;
    hwvNoteTextHidden: CustomEvent<{ hwv: WebViewer; noteText: Operators.Markup.Note.NoteText }>;
    hwvNoteTextShown: CustomEvent<{ hwv: WebViewer; noteText: Operators.Markup.Note.NoteText }>;
    hwvRedlineCreated: CustomEvent<{ hwv: WebViewer; redlineMarkup: Markup.Redline.RedlineItem }>;
    hwvRedlineDeleted: CustomEvent<{ hwv: WebViewer; redlineMarkup: Markup.Redline.RedlineItem }>;
    hwvRedlineUpdated: CustomEvent<{ hwv: WebViewer; redlineMarkup: Markup.Redline.RedlineItem }>;
    hwvSelectionArray: CustomEvent<{
      hwv: WebViewer;
      selectionEvents: Event.NodeSelectionEvent[];
      removed: boolean;
    }>;
    hwvSubtreeLoaded: CustomEvent<{ hwv: WebViewer; modelRootIds: NodeId[]; source: NodeSource }>;
    hwvViewAxes: CustomEvent<{ hwv: WebViewer; frontVector: Point3; upVector: Point3 }>;
    hwvVisibilityChanged: CustomEvent<{
      hwv: WebViewer;
      shownBodyIds: BodyId[];
      hiddenBodyIds: BodyId[];
    }>;
    hwvXHRonloadend: CustomEvent<{
      hwv: WebViewer;
      progressEvent: ProgressEvent;
      status: number;
      uri: string;
    }>;
  }
}

export {};
