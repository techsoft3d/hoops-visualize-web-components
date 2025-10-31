import React from 'react';

import { createComponent } from '@lit/react';

import {
  WebViewerComponent as LitWebViewerComponent,
  WebViewerContextManager,
  HoopsModelTreeButtonElement,
  HoopsLayersButtonElement,
  HoopsViewsButtonElement,
  HoopsTypesButtonElement,
  HoopsCadConfigurationButtonElement,
  HoopsPropertiesButtonElement,
  HoopsSettingsButtonElement,
  HoopsHomeButtonElement,
  HoopsSnapshotButtonElement,
  HoopsDrawmodeButtonElement,
  HoopsRedlinesButtonElement,
  HoopsCameraOperatorButtonElement,
  HoopsCameraButtonElement,
  HoopsExplodeButtonElement,
  HoopsModelTreeElement,
  HoopsLayerTreeElement,
  HoopsViewTreeElement,
  InfoButton,
  HoopsContextMenuElement,
  HoopsToolsButtonElement,
  HoopsToolsPanelElement,
  HoopsCadConfigurationListElement,
  HoopsSettingsPanelElement,
  HoopsTypesTreeElement,
  HoopsServiceRegistryElement,
  HoopsIFCRelationshipElement,
} from '@ts3d-hoops/web-viewer-components';

export const WebViewerComponent = createComponent({
  tagName: 'hoops-web-viewer',
  elementClass: LitWebViewerComponent,
  react: React,
  events: {
    hwvReady: 'hwvReady',
    hwvAddCuttingSection: 'hwvAddCuttingSection',
    hwvAssemblyTreeReady: 'hwvAssemblyTreeReady',
    hwvBcfLoaded: 'hwvBcfLoaded',
    hwvBcfRemoved: 'hwvBcfRemoved',
    hwvBeginInteraction: 'hwvBeginInteraction',
    hwvCamera: 'hwvCamera',
    hwvConfigurationActivated: 'hwvConfigurationActivated',
    hwvCuttingSectionsLoaded: 'hwvCuttingSectionsLoaded',
    hwvEndInteraction: 'hwvEndInteraction',
    hwvExplode: 'hwvExplode',
    hwvHwfParseComplete: 'hwvHwfParseComplete',
    hwvIncrementalSelectionBatchBegin: 'hwvIncrementalSelectionBatchBegin',
    hwvIncrementalSelectionBatchEnd: 'hwvIncrementalSelectionBatchEnd',
    hwvIncrementalSelectionEnd: 'hwvIncrementalSelectionEnd',
    hwvInfo: 'hwvInfo',
    hwvLineCreated: 'hwvLineCreated',
    hwvLineDeleted: 'hwvLineDeleted',
    hwvLineLoaded: 'hwvLineLoaded',
    hwvMeasurementBegin: 'hwvMeasurementBegin',
    hwvMissingModel: 'hwvMissingModel',
    hwvModelLoadBegin: 'hwvModelLoadBegin',
    hwvModelStructureReady: 'hwvModelStructureReady',
    hwvModelSwitchStart: 'hwvModelSwitchStart',
    hwvOverlayViewportSet: 'hwvOverlayViewportSet',
    hwvRemoveCuttingSection: 'hwvRemoveCuttingSection',
    hwvSceneReady: 'hwvSceneReady',
    hwvSheetActivated: 'hwvSheetActivated',
    hwvSheetDeactivated: 'hwvSheetDeactivated',
    hwvStreamingActivated: 'hwvStreamingActivated',
    hwvStreamingDeactivated: 'hwvStreamingDeactivated',
    hwvSubtreeDeleted: 'hwvSubtreeDeleted',
    hwvTimeout: 'hwvTimeout',
    hwvTimeoutWarning: 'hwvTimeoutWarning',
    hwvTransitionBegin: 'hwvTransitionBegin',
    hwvTransitionEnd: 'hwvTransitionEnd',
    hwvViewCreated: 'hwvViewCreated',
    hwvViewDeactivated: 'hwvViewDeactivated',
    hwvViewDeleted: 'hwvViewDeleted',
    hwvViewLoaded: 'hwvViewLoaded',
    hwvViewOrientation: 'hwvViewOrientation',
    hwvWalkOperatorActivated: 'hwvWalkOperatorActivated',
    hwvWalkOperatorDeactivated: 'hwvWalkOperatorDeactivated',
    hwvWebGlContextLost: 'hwvWebGlContextLost',
    hwvWebsocketConnectionClosed: 'hwvWebsocketConnectionClosed',
    hwvXHRonerror: 'hwvXHRonerror',
    hwvXHRonprogress: 'hwvXHRonprogress',
    hwvCadViewCreated: 'hwvCadViewCreated',
    hwvCappingIdle: 'hwvCappingIdle',
    hwvContextMenu: 'hwvContextMenu',
    hwvCuttingPlaneDragStart: 'hwvCuttingPlaneDragStart',
    hwvCuttingPlaneDrag: 'hwvCuttingPlaneDrag',
    hwvCuttingPlaneDragEnd: 'hwvCuttingPlaneDragEnd',
    hwvFirstModelLoaded: 'hwvFirstModelLoaded',
    hwvFrameDrawn: 'hwvFrameDrawn',
    hwvHandleEventStart: 'hwvHandleEventStart',
    hwvHandleEvent: 'hwvHandleEvent',
    hwvHandleEventEnd: 'hwvHandleEventEnd',
    hwvMeasurementCreated: 'hwvMeasurementCreated',
    hwvMeasurementDeleted: 'hwvMeasurementDeleted',
    hwvMeasurementHidden: 'hwvMeasurementHidden',
    hwvMeasurementLoaded: 'hwvMeasurementLoaded',
    hwvMeasurementShown: 'hwvMeasurementShown',
    hwvMeasurementValueSet: 'hwvMeasurementValueSet',
    hwvModelLoadFailure: 'hwvModelLoadFailure',
    hwvModelStructureHeaderParsed: 'hwvModelStructureHeaderParsed',
    hwvModelSwitched: 'hwvModelSwitched',
    hwvNoteTextCreated: 'hwvNoteTextCreated',
    hwvNoteTextHidden: 'hwvNoteTextHidden',
    hwvNoteTextShown: 'hwvNoteTextShown',
    hwvRedlineCreated: 'hwvRedlineCreated',
    hwvRedlineDeleted: 'hwvRedlineDeleted',
    hwvRedlineUpdated: 'hwvRedlineUpdated',
    hwvSelectionArray: 'hwvSelectionArray',
    hwvSubtreeLoaded: 'hwvSubtreeLoaded',
    hwvViewAxes: 'hwvViewAxes',
    hwvVisibilityChanged: 'hwvVisibilityChanged',
    hwvXHRonloadend: 'hwvXHRonloadend',
  },
});

export const HoopsWebviewerContextManager = createComponent({
  tagName: 'hoops-web-viewer-context-manager',
  elementClass: WebViewerContextManager,
  react: React,
});

export const HoopsServiceRegistry = createComponent({
  tagName: 'hoops-service-registry',
  elementClass: HoopsServiceRegistryElement,
  react: React,
});

export const HoopsModelTreeButton = createComponent({
  tagName: 'hoops-toolbar-model-tree',
  elementClass: HoopsModelTreeButtonElement,
  react: React,
});

export const HoopsLayersButton = createComponent({
  tagName: 'hoops-toolbar-layers',
  elementClass: HoopsLayersButtonElement,
  react: React,
});

export const HoopsViewsButton = createComponent({
  tagName: 'hoops-toolbar-views',
  elementClass: HoopsViewsButtonElement,
  react: React,
});

export const HoopsTypesButton = createComponent({
  tagName: 'hoops-toolbar-types',
  elementClass: HoopsTypesButtonElement,
  react: React,
});

export const HoopsPropertiesButton = createComponent({
  tagName: 'hoops-toolbar-properties',
  elementClass: HoopsPropertiesButtonElement,
  react: React,
});

export const HoopsCadConfigurationButton = createComponent({
  tagName: 'hoops-toolbar-cad-configuration',
  elementClass: HoopsCadConfigurationButtonElement,
  react: React,
});

export const HoopsSettingsButton = createComponent({
  tagName: 'hoops-toolbar-settings',
  elementClass: HoopsSettingsButtonElement,
  react: React,
});

export const HoopsHomeButton = createComponent({
  tagName: 'hoops-toolbar-home',
  elementClass: HoopsHomeButtonElement,
  react: React,
});

export const HoopsSnapshotButton = createComponent({
  tagName: 'hoops-toolbar-snapshot',
  elementClass: HoopsSnapshotButtonElement,
  react: React,
});

export const HoopsDrawmodeButton = createComponent({
  tagName: 'hoops-toolbar-drawmode',
  elementClass: HoopsDrawmodeButtonElement,
  react: React,
});

export const HoopsRedlinesButton = createComponent({
  tagName: 'hoops-toolbar-redlines',
  elementClass: HoopsRedlinesButtonElement,
  react: React,
});

export const HoopsCameraOperatorButton = createComponent({
  tagName: 'hoops-toolbar-camera-operator',
  elementClass: HoopsCameraOperatorButtonElement,
  react: React,
});

export const HoopsCameraButton = createComponent({
  tagName: 'hoops-toolbar-camera',
  elementClass: HoopsCameraButtonElement,
  react: React,
});

export const HoopsExplodeButton = createComponent({
  tagName: 'hoops-toolbar-explode',
  elementClass: HoopsExplodeButtonElement,
  react: React,
});

export const HoopsToolsButton = createComponent({
  tagName: 'hoops-toolbar-tools',
  elementClass: HoopsToolsButtonElement,
  react: React,
});

export const HoopsToolsPanel = createComponent({
  tagName: 'hoops-tools-panel',
  elementClass: HoopsToolsPanelElement,
  react: React,
});

export const HoopsSettingsPanel = createComponent({
  tagName: 'hoops-settings-panel',
  elementClass: HoopsSettingsPanelElement,
  react: React,
});

export const HoopsModelTree = createComponent({
  tagName: 'hoops-model-tree',
  elementClass: HoopsModelTreeElement,
  react: React,
  events: {
    modelTreeNodeVisibilityChange: 'hoops-model-tree-node-visibility-change',
    modelTreeNodeClick: 'hoops-model-tree-node-click',
  },
});

export const HoopsIFCRelationship = createComponent({
  tagName: 'hoops-ifc-relationship',
  elementClass: HoopsIFCRelationshipElement,
  react: React,
});

export const HoopsLayerTree = createComponent({
  tagName: 'hoops-layer-tree',
  elementClass: HoopsLayerTreeElement,
  react: React,
  events: {
    layerClick: 'hoops-layer-tree-element-click',
    layerTreeNodeClick: 'hoops-layer-tree-node-selected',
    layerTreeVisibilityChanged: 'hoops-layer-tree-visibility-changed',
  },
});

export const HoopsViewTree = createComponent({
  tagName: 'hoops-view-tree',
  elementClass: HoopsViewTreeElement,
  react: React,
  events: {
    viewTreeNodeClick: 'hoops-view-tree-node-click',
  },
});

export const HoopsTypesTree = createComponent({
  tagName: 'hoops-types-tree',
  elementClass: HoopsTypesTreeElement,
  react: React,
  events: {
    typesTreeNodeClick: 'hoops-types-tree-node-click',
    typesTreeTypeNodeClick: 'hoops-types-tree-type-node-click',
    typesTreeNodeVisibilityChange: 'hoops-types-tree-node-visibility-change',
  },
});

export const HoopsCadConfigurationList = createComponent({
  tagName: 'hoops-cad-configuration-list',
  elementClass: HoopsCadConfigurationListElement,
  react: React,
  events: {
    cadConfigurationListClick: 'hoops-cad-configuration-list-click',
  },
});

export const HoopsInfoButton = createComponent({
  tagName: 'hoops-info-button',
  elementClass: InfoButton,
  react: React,
});

export const HoopsContextMenu = createComponent({
  tagName: 'hoops-context-menu',
  elementClass: HoopsContextMenuElement,
  react: React,
  events: {
    contextMenuItemClicked: 'context-menu-item-clicked',
  },
});
