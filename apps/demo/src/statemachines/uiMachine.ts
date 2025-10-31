import { assign, createActor, setup } from 'xstate';

export type UiMachineEvent =
  | {
      type:
        | 'setInfoShown'
        | 'setModelTreeShown'
        | 'setLayerTreeShown'
        | 'setViewTreeShown'
        | 'setCadConfigurationListShown'
        | 'setCuttingPlaneShown'
        | 'setPropertyPanelShown'
        | 'setToolsPanelShown'
        | 'setSettingsPanelShown'
        | 'setTypesTreeShown';
      shown: boolean;
    }
  | {
      type: 'setContextMenuShown';
      shown: boolean;
      position?: { x: number; y: number };
    }
  | {
      type: 'setIfcRelationshipView';
      shown: boolean;
      enabled: boolean;
    };

export const uiMachine = setup({
  types: {
    context: {} as {
      leftPanelShown: boolean;
      rightPanelShown: boolean;
      modelTreeShown: boolean;
      layerTreeShown: boolean;
      viewTreeShown: boolean;
      cadConfigurationListShown: boolean;
      cuttingPlaneShown: boolean;
      propertyPanelShown: boolean;
      ifcRelationshipEnabled: boolean;
      ifcRelationshipViewShown: boolean;
      toolsPanelShown: boolean;
      settingsPanelShown: boolean;
      infoShown: boolean;
      contextMenuShown: boolean;
      contextMenuPosition: { x: number; y: number };
      typesTreeShown: boolean;
    },
    events: {} as UiMachineEvent,
  },
}).createMachine({
  context: {
    leftPanelShown: false,
    rightPanelShown: false,
    modelTreeShown: false,
    layerTreeShown: false,
    viewTreeShown: false,
    cadConfigurationListShown: false,
    cuttingPlaneShown: false,
    propertyPanelShown: false,
    toolsPanelShown: false,
    settingsPanelShown: false,
    infoShown: false,
    ifcRelationshipEnabled: false,
    ifcRelationshipViewShown: false,
    contextMenuShown: false,
    contextMenuPosition: { x: 0, y: 0 },
    typesTreeShown: false,
  },
  on: {
    setInfoShown: {
      actions: assign({
        infoShown: ({ event }) => event.shown,
      }),
    },
    setModelTreeShown: {
      actions: assign({
        modelTreeShown: ({ event }) => event.shown,
        toolsPanelShown: ({ event, context }) => (event.shown ? false : context.toolsPanelShown),
        cuttingPlaneShown: ({ event, context }) =>
          event.shown ? false : context.cuttingPlaneShown,
        settingsPanelShown: ({ event, context }) =>
          event.shown ? false : context.settingsPanelShown,
        leftPanelShown: ({ context, event }) =>
          context.cuttingPlaneShown ||
          context.toolsPanelShown ||
          context.settingsPanelShown ||
          context.ifcRelationshipViewShown ||
          event.shown,
      }),
    },
    setLayerTreeShown: {
      actions: assign({
        layerTreeShown: ({ event }) => event.shown,
        viewTreeShown: ({ context, event }) => (event.shown ? false : context.viewTreeShown),
        typesTreeShown: ({ context, event }) => (event.shown ? false : context.typesTreeShown),
        cadConfigurationListShown: ({ context, event }) =>
          event.shown ? false : context.cadConfigurationListShown,
        rightPanelShown: ({ context, event }) =>
          context.propertyPanelShown ||
          context.viewTreeShown ||
          context.cadConfigurationListShown ||
          context.typesTreeShown ||
          event.shown,
      }),
    },
    setViewTreeShown: {
      actions: assign({
        viewTreeShown: ({ event }) => event.shown,
        layerTreeShown: ({ context, event }) => (event.shown ? false : context.layerTreeShown),
        typesTreeShown: ({ context, event }) => (event.shown ? false : context.typesTreeShown),
        cadConfigurationListShown: ({ context, event }) =>
          event.shown ? false : context.cadConfigurationListShown,
        rightPanelShown: ({ context, event }) =>
          context.propertyPanelShown ||
          context.layerTreeShown ||
          context.cadConfigurationListShown ||
          context.typesTreeShown ||
          event.shown,
      }),
    },
    setCadConfigurationListShown: {
      actions: assign({
        cadConfigurationListShown: ({ event }) => event.shown,
        viewTreeShown: ({ context, event }) => (event.shown ? false : context.viewTreeShown),
        layerTreeShown: ({ context, event }) => (event.shown ? false : context.layerTreeShown),
        typesTreeShown: ({ context, event }) => (event.shown ? false : context.typesTreeShown),
        rightPanelShown: ({ context, event }) =>
          context.propertyPanelShown ||
          context.layerTreeShown ||
          context.viewTreeShown ||
          context.typesTreeShown ||
          event.shown,
      }),
    },
    setPropertyPanelShown: {
      actions: assign({
        propertyPanelShown: ({ event }) => event.shown,
        rightPanelShown: ({ context, event }) =>
          context.viewTreeShown ||
          context.layerTreeShown ||
          context.cadConfigurationListShown ||
          context.typesTreeShown ||
          event.shown,
      }),
    },
    setIfcRelationshipView: {
      actions: assign({
        ifcRelationshipEnabled: ({ event }) => event.enabled,
        ifcRelationshipViewShown: ({ event }) => event.shown,
        toolsPanelShown: ({ event, context }) => (event.shown ? false : context.toolsPanelShown),
        cuttingPlaneShown: ({ event, context }) =>
          event.shown ? false : context.cuttingPlaneShown,
        settingsPanelShown: ({ event, context }) =>
          event.shown ? false : context.settingsPanelShown,
        leftPanelShown: ({ context, event }) =>
          context.modelTreeShown ||
          context.cuttingPlaneShown ||
          context.toolsPanelShown ||
          context.settingsPanelShown ||
          event.shown,
      }),
    },
    setCuttingPlaneShown: {
      actions: assign({
        cuttingPlaneShown: ({ event }) => event.shown,
        modelTreeShown: ({ event, context }) => (event.shown ? false : context.modelTreeShown),
        toolsPanelShown: ({ event, context }) => (event.shown ? false : context.toolsPanelShown),
        settingsPanelShown: ({ event, context }) =>
          event.shown ? false : context.settingsPanelShown,
        ifcRelationshipViewShown: ({ event, context }) =>
          event.shown ? false : context.ifcRelationshipViewShown,
        leftPanelShown: ({ context, event }) =>
          context.modelTreeShown ||
          context.toolsPanelShown ||
          context.settingsPanelShown ||
          context.ifcRelationshipViewShown ||
          event.shown,
      }),
    },
    setContextMenuShown: {
      actions: assign({
        contextMenuShown: ({ event }) => event.shown,
        contextMenuPosition: ({ event, context }) => event.position ?? context.contextMenuPosition,
      }),
    },
    setToolsPanelShown: {
      actions: assign({
        toolsPanelShown: ({ event }) => event.shown,
        modelTreeShown: ({ event, context }) => (event.shown ? false : context.modelTreeShown),
        cuttingPlaneShown: ({ event, context }) =>
          event.shown ? false : context.cuttingPlaneShown,
        settingsPanelShown: ({ event, context }) =>
          event.shown ? false : context.settingsPanelShown,
        ifcRelationshipViewShown: ({ event, context }) =>
          event.shown ? false : context.ifcRelationshipViewShown,
        leftPanelShown: ({ context, event }) =>
          context.modelTreeShown ||
          context.cuttingPlaneShown ||
          context.settingsPanelShown ||
          context.ifcRelationshipViewShown ||
          event.shown,
      }),
    },
    setSettingsPanelShown: {
      actions: assign({
        settingsPanelShown: ({ event }) => event.shown,
        modelTreeShown: ({ event, context }) => (event.shown ? false : context.modelTreeShown),
        cuttingPlaneShown: ({ event, context }) =>
          event.shown ? false : context.cuttingPlaneShown,
        toolsPanelShown: ({ event, context }) => (event.shown ? false : context.toolsPanelShown),
        ifcRelationshipViewShown: ({ event, context }) =>
          event.shown ? false : context.ifcRelationshipViewShown,
        leftPanelShown: ({ context, event }) =>
          context.modelTreeShown ||
          context.cuttingPlaneShown ||
          context.toolsPanelShown ||
          context.ifcRelationshipViewShown ||
          event.shown,
      }),
    },
    setTypesTreeShown: {
      actions: assign({
        typesTreeShown: ({ event }) => event.shown,
        viewTreeShown: ({ context, event }) => (event.shown ? false : context.viewTreeShown),
        layerTreeShown: ({ context, event }) => (event.shown ? false : context.layerTreeShown),
        cadConfigurationListShown: ({ context, event }) =>
          event.shown ? false : context.cadConfigurationListShown,
        rightPanelShown: ({ context, event }) =>
          context.propertyPanelShown ||
          context.viewTreeShown ||
          context.layerTreeShown ||
          context.cadConfigurationListShown ||
          event.shown,
      }),
    },
  },
});

export const uiActor = createActor(uiMachine);
uiActor.start();
