import { Box, Color, IColor, Matrix, Plane, Point3 } from '@ts3d-hoops/common';
import { assign, createActor, setup } from 'xstate';
import { getRegisteredViewer } from '../utils/registerViewer';
import { CuttingPlane as HwvCuttingPlane, core } from '@ts3d-hoops/web-viewer';

export type SelectedFace = {
  normal: Point3;
  position: Point3;
};

export type CuttingPlane = {
  plane: Plane;
  referenceGeometry?: Point3[];
  color?: IColor;
  lineColor?: IColor;
  opacity?: number;
  hideReferenceGeometry?: boolean;
};

type Section = {
  cuttingPlanes: CuttingPlane[];
  active: boolean;
  hideReferenceGeometry?: boolean;
};

type CuttingPlaneMachineInitEvent = {
  type: 'init';
  modelBounding: Box;
};

type AddCuttingPlaneEvent = {
  type: 'add cutting plane';
  sectionIndex: number;
  cuttingPlane: CuttingPlane;
};

type RemoveCuttingPlaneEvent = {
  type: 'remove cutting plane';
  sectionIndex: number;
  planeIndex: number;
};

type ClearCuttingSectionEvent = {
  type: 'clear cutting section';
  sectionIndex: number;
};

type SetCuttingSectionStateEvent = {
  type: 'set cutting section active state';
  active: boolean;
  sectionIndex: number;
};

type SetModelBoundingEvent = {
  type: 'set model bounding';
  modelBounding: Box;
};

type UpdateCuttingSectionsEvent = {
  type: 'update cutting sections';
};

type UpdateSingleCuttingSectionEvent = {
  type: 'update single cutting section';
  sectionIndex: number;
};

type UpdateSingleCuttingPlaneEvent = {
  type: 'update single cutting plane';
  sectionIndex: number;
  planeIndex: number;
};

type SetCuttingPlaneColorEvent = {
  type: 'set cutting plane color';
  sectionIndex: number;
  planeIndex: number;
  color: IColor;
};

type SetCuttingPlaneLineColorEvent = {
  type: 'set cutting plane line color';
  sectionIndex: number;
  planeIndex: number;
  lineColor: IColor;
};

type SetCuttingPlaneOpacityEvent = {
  type: 'set cutting plane opacity';
  sectionIndex: number;
  planeIndex: number;
  opacity: number;
};

type SetCuttingPlaneGeometryVisibilityEvent = {
  type: 'set cutting plane geometry visibility';
  sectionIndex: number;
  planeIndex: number;
  visible: boolean;
};

type SetCuttingSectionGeometryVisibilityEvent = {
  type: 'set cutting section geometry visibility';
  sectionIndex: number;
  visible: boolean;
};

type SetCuttingPlaneEvent = {
  type: 'set cutting plane';
  sectionIndex: number;
  planeIndex: number;
  cuttingPlane: CuttingPlane;
};

type SetSelectedFaceEvent = {
  type: 'set selected face';
  selectedFace?: SelectedFace;
};

type InvertCuttingPlaneEvent = {
  type: 'invert cutting plane';
  sectionIndex: number;
  planeIndex: number;
};

export type CuttingPlaneMachineEvent =
  | CuttingPlaneMachineInitEvent
  | SetCuttingSectionStateEvent
  | SetModelBoundingEvent
  | UpdateCuttingSectionsEvent
  | UpdateSingleCuttingSectionEvent
  | UpdateSingleCuttingPlaneEvent
  | SetCuttingPlaneColorEvent
  | SetCuttingPlaneLineColorEvent
  | SetCuttingPlaneOpacityEvent
  | SetSelectedFaceEvent
  | AddCuttingPlaneEvent
  | RemoveCuttingPlaneEvent
  | ClearCuttingSectionEvent
  | SetCuttingPlaneGeometryVisibilityEvent
  | SetCuttingSectionGeometryVisibilityEvent
  | InvertCuttingPlaneEvent
  | SetCuttingPlaneEvent;

const convertHwvCuttingPlaneToCuttingPlane = (hwvPlane: HwvCuttingPlane): CuttingPlane => {
  return {
    plane: hwvPlane.plane,
    referenceGeometry: hwvPlane.referenceGeometry ?? undefined,
    color: hwvPlane.color,
    lineColor: hwvPlane.lineColor,
    opacity: hwvPlane.opacity,
    hideReferenceGeometry: !hwvPlane.referenceGeometry,
  };
};

const convertHwvSectionToSection = (hwvSection: core.ICuttingSection): Section => {
  const hwvPlanes = hwvSection.getCuttingPlanes();
  return {
    cuttingPlanes: hwvPlanes.map(convertHwvCuttingPlaneToCuttingPlane),
    active: hwvSection.isActive(),
  };
};

const convertCuttingSections = (cuttingManager: core.ICuttingManager): Section[] => {
  const hwvSections = [...Array(cuttingManager.getCuttingSectionCount())].map(
    (_, index) => cuttingManager.getCuttingSection(index)!,
  );

  return hwvSections.map(convertHwvSectionToSection);
};

export const cuttingPlaneMachine = setup({
  types: {
    context: {} as {
      modelBounding: Box;
      sections: Section[];
      selectedFace?: SelectedFace | undefined;
    },
    events: {} as CuttingPlaneMachineEvent,
  },
  actions: {
    setSelectedFace: assign({
      selectedFace: ({ context, event }) => {
        if (event.type !== 'set selected face') {
          return context.selectedFace;
        }

        return event.selectedFace;
      },
    }),
    setModelBounding: assign({
      modelBounding: ({ context, event }) => {
        if (event.type !== 'set model bounding') {
          return context.modelBounding;
        }

        return event.modelBounding;
      },
    }),
    setSectionActiveStatus: assign({
      sections: ({ context, event }) => {
        if (event.type !== 'set cutting section active state') {
          return context.sections;
        }

        const sections = context.sections;
        const viewer = getRegisteredViewer('')!;
        const cuttingManager = viewer.hwv.cuttingManager;

        const section = cuttingManager.getCuttingSection(event.sectionIndex);
        if (!section) {
          return context.sections;
        }

        if (event.active) {
          section.activate();
        } else {
          section.deactivate();
        }

        sections[event.sectionIndex].active = event.active;

        return sections;
      },
    }),
    updateSections: assign(({ context, event }) => {
      if (event.type !== 'init' && event.type !== 'update cutting sections') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;

      const sections: Section[] = convertCuttingSections(cuttingManager);

      let modelBounding = context.modelBounding;
      if ('modelBounding' in event) {
        modelBounding = event.modelBounding;
      }

      return {
        ...context,
        modelBounding,
        sections,
      };
    }),
    updateSingleSections: assign(({ context, event }) => {
      if (event.type !== 'update single cutting section') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;
      const hwvSection = cuttingManager.getCuttingSection(event.sectionIndex);
      if (!hwvSection) {
        return context;
      }

      const sections = context.sections;
      sections[event.sectionIndex] = convertHwvSectionToSection(hwvSection);

      return {
        ...context,
        sections,
      };
    }),
    updateSingleCuttingPlane: assign(({ context, event }) => {
      if (event.type !== 'update single cutting plane') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;
      const hwvSection = cuttingManager.getCuttingSection(event.sectionIndex);
      if (!hwvSection) {
        return context;
      }

      const hwvPlane = hwvSection.getCuttingPlanes()[event.planeIndex];
      if (!hwvPlane) {
        return context;
      }

      const sections = context.sections;
      const cuttingPlane = sections[event.sectionIndex].cuttingPlanes[event.planeIndex];
      sections[event.sectionIndex].cuttingPlanes[event.planeIndex] = {
        referenceGeometry: cuttingPlane?.referenceGeometry,
        ...convertHwvCuttingPlaneToCuttingPlane(hwvPlane),
      };

      return {
        ...context,
        sections,
      };
    }),
    setCuttingPlaneColor: assign(({ context, event }) => {
      if (event.type !== 'set cutting plane color') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;
      const hwvSection = cuttingManager.getCuttingSection(event.sectionIndex);
      if (!hwvSection) {
        return context;
      }

      const hwvPlane = hwvSection.getCuttingPlanes()[event.planeIndex];
      if (!hwvPlane) {
        return context;
      }

      hwvSection.setPlaneColor(
        event.planeIndex,
        new Color(event.color.r, event.color.g, event.color.b),
      );

      context.sections[event.sectionIndex].cuttingPlanes[event.planeIndex].color = event.color;
      return context;
    }),
    setCuttingPlaneLineColor: assign(({ context, event }) => {
      if (event.type !== 'set cutting plane line color') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;
      const hwvSection = cuttingManager.getCuttingSection(event.sectionIndex);
      if (!hwvSection) {
        return context;
      }

      const hwvPlane = hwvSection.getCuttingPlanes()[event.planeIndex];
      if (!hwvPlane) {
        return context;
      }

      hwvSection.setPlaneLineColor(
        event.planeIndex,
        new Color(event.lineColor.r, event.lineColor.g, event.lineColor.b),
      );

      context.sections[event.sectionIndex].cuttingPlanes[event.planeIndex].lineColor =
        event.lineColor;
      return context;
    }),
    setCuttingPlaneOpacity: assign(({ context, event }) => {
      if (event.type !== 'set cutting plane opacity') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;
      const hwvSection = cuttingManager.getCuttingSection(event.sectionIndex);
      if (!hwvSection) {
        return context;
      }

      const hwvPlane = hwvSection.getCuttingPlanes()[event.planeIndex];
      if (!hwvPlane) {
        return context;
      }

      hwvSection.setPlaneOpacity(event.planeIndex, event.opacity);

      context.sections[event.sectionIndex].cuttingPlanes[event.planeIndex].opacity = event.opacity;
      return context;
    }),
    setCuttingPlaneGeometryVisibility: assign(({ context, event }) => {
      if (event.type !== 'set cutting plane geometry visibility') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;
      const hwvSection = cuttingManager.getCuttingSection(event.sectionIndex);
      if (!hwvSection) {
        return context;
      }

      const cuttingPlane = context.sections[event.sectionIndex].cuttingPlanes[event.planeIndex];

      let referenceGeometry = cuttingPlane.referenceGeometry ?? null;
      if (!event.visible) {
        referenceGeometry = null;
      }
      hwvSection.setPlane(event.planeIndex, cuttingPlane.plane, referenceGeometry, cuttingPlane);

      context.sections[event.sectionIndex].cuttingPlanes[event.planeIndex].hideReferenceGeometry =
        !event.visible;
      return context;
    }),
    addCuttingPlane: assign(({ context, event }) => {
      if (event.type !== 'add cutting plane') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;
      const hwvSection = cuttingManager.getCuttingSection(event.sectionIndex);
      if (!hwvSection) {
        return context;
      }

      const planeIndex = hwvSection.getCount();
      if (planeIndex > viewer.hwv.cuttingManager.getCuttingSectionCapacity()) {
        return context;
      }

      let referenceGeometry = event.cuttingPlane.referenceGeometry ?? null;
      if (event.cuttingPlane.hideReferenceGeometry) {
        referenceGeometry = null;
      }

      hwvSection
        .addPlane(event.cuttingPlane.plane, referenceGeometry ?? null, event.cuttingPlane)
        .then((success) => {
          if (!success) {
            return;
          }

          cuttingPlaneActor.send({
            type: 'update single cutting plane',
            sectionIndex: event.sectionIndex,
            planeIndex: planeIndex,
          });
        });

      return context;
    }),
    removeCuttingPlane: assign(({ context, event }) => {
      if (event.type !== 'remove cutting plane') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;
      const hwvSection = cuttingManager.getCuttingSection(event.sectionIndex);
      if (!hwvSection) {
        return context;
      }

      hwvSection.removePlane(event.planeIndex).then(() => {
        cuttingPlaneActor.send({
          type: 'update single cutting section',
          sectionIndex: event.sectionIndex,
        } as any);
      });
      return context;
    }),
    clearCuttingSection: assign(({ context, event }) => {
      if (event.type !== 'clear cutting section') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;
      const hwvSection = cuttingManager.getCuttingSection(event.sectionIndex);
      if (!hwvSection) {
        return context;
      }

      hwvSection.clear().then(() => {
        cuttingPlaneActor.send({
          type: 'update single cutting section',
          sectionIndex: event.sectionIndex,
        });
      });

      return context;
    }),
    setCuttingSectionGeometryVisibility: assign(({ context, event }) => {
      if (event.type !== 'set cutting section geometry visibility') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;
      const hwvSection = cuttingManager.getCuttingSection(event.sectionIndex);
      if (!hwvSection) {
        return context;
      }

      const cuttingSections = context.sections[event.sectionIndex];
      cuttingSections.cuttingPlanes.forEach((cuttingPlane, index) => {
        hwvSection.setPlane(
          index,
          cuttingPlane.plane,
          event.visible ? (cuttingPlane.referenceGeometry ?? null) : null,
          cuttingPlane,
        );

        context.sections[event.sectionIndex].cuttingPlanes[index].hideReferenceGeometry =
          !event.visible;
      });

      return context;
    }),
    invertCuttingPlane: assign(({ context, event }) => {
      if (event.type !== 'invert cutting plane') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;
      const hwvSection = cuttingManager.getCuttingSection(event.sectionIndex);
      if (!hwvSection) {
        return context;
      }

      const hwvPlane = hwvSection.getCuttingPlanes()[event.planeIndex];
      if (!hwvPlane) {
        return context;
      }

      hwvPlane.plane.normal.negate();
      hwvPlane.plane.d *= -1;
      hwvSection.updatePlane(event.planeIndex, hwvPlane.plane, new Matrix(), false, false);

      const cuttingPlane = context.sections[event.sectionIndex].cuttingPlanes[event.planeIndex];
      cuttingPlane.plane.normal.negate();
      cuttingPlane.plane.d *= -1;

      return context;
    }),
    setCuttingPlane: assign(({ context, event }) => {
      if (event.type !== 'set cutting plane') {
        return context;
      }

      const viewer = getRegisteredViewer('')!;
      const cuttingManager = viewer.hwv.cuttingManager;
      const hwvSection = cuttingManager.getCuttingSection(event.sectionIndex);
      if (!hwvSection) {
        return context;
      }

      const cuttingPlane = event.cuttingPlane;
      context.sections[event.sectionIndex].cuttingPlanes[event.planeIndex] = cuttingPlane;
      if (cuttingPlane.plane.normal.length() === 0) {
        return context;
      }

      let referenceGeometry = cuttingPlane.referenceGeometry ?? null;
      if (cuttingPlane.hideReferenceGeometry) {
        referenceGeometry = null;
      }

      hwvSection.setPlane(event.planeIndex, cuttingPlane.plane, referenceGeometry, cuttingPlane);

      return context;
    }),
  },
}).createMachine({
  context: {
    modelBounding: new Box(),
    sections: [],
    selectedFace: undefined,
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        init: {
          target: 'ready',
          actions: ['setModelBounding', 'updateSections'],
        },
      },
    },
    ready: {
      on: {
        'set cutting section active state': {
          actions: 'setSectionActiveStatus',
        },
        'update cutting sections': {
          actions: 'updateSections',
        },
        'update single cutting section': {
          actions: 'updateSingleSections',
        },
        'update single cutting plane': {
          actions: 'updateSingleCuttingPlane',
        },
        'set cutting plane color': {
          actions: 'setCuttingPlaneColor',
        },
        'set cutting plane line color': {
          actions: 'setCuttingPlaneLineColor',
        },
        'set cutting plane opacity': {
          actions: 'setCuttingPlaneOpacity',
        },
        'set selected face': {
          actions: 'setSelectedFace',
        },
        'add cutting plane': {
          actions: 'addCuttingPlane',
        },
        'set model bounding': {
          actions: 'setModelBounding',
        },
        'remove cutting plane': {
          actions: 'removeCuttingPlane',
        },
        'clear cutting section': {
          actions: 'clearCuttingSection',
        },
        'set cutting plane geometry visibility': {
          actions: 'setCuttingPlaneGeometryVisibility',
        },
        'set cutting section geometry visibility': {
          actions: 'setCuttingSectionGeometryVisibility',
        },
        'invert cutting plane': {
          actions: 'invertCuttingPlane',
        },
        'set cutting plane': {
          actions: 'setCuttingPlane',
        },
      },
    },
  },
});

export const cuttingPlaneActor = createActor(cuttingPlaneMachine);
cuttingPlaneActor.start();
