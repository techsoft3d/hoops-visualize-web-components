import { useEffect, useRef, useState } from 'react';
import CuttingPlane from './CuttingPlane';

import {
  HoopsAccordion,
  HoopsDropdown,
  HoopsIcon,
  HoopsIconButton,
  HoopsSwitch,
} from '@ts3d-hoops/ui-kit-react';
import { useSelector } from '@xstate/react';
import { cuttingPlaneActor } from '../../statemachines/cuttingPlaneMachine';
import { IColor, Plane, Point3 } from '@ts3d-hoops/common';
import { Axis, WebViewer } from '@ts3d-hoops/web-viewer';
import { getRegisteredViewer } from '../../utils/registerViewer';
import { viewerActor } from '../../statemachines/viewerMachine';
import DropdownMenu from '@ts3d-hoops/ui-kit/dropdown/dropdown';
import HoopsAccordionComponent from '@ts3d-hoops/ui-kit/accordion';

export type CuttingSectionProps = {
  label: string;
  sectionIndex: number;
};

function CuttingSectionToolbar({
  sectionIndex,
  onCuttingPlaneAdd,
}: {
  sectionIndex: number;
  onCuttingPlaneAdd: () => unknown;
}) {
  const [showGeometry, setShowGeometry] = useState<boolean>(true);
  const viewerState = useSelector(viewerActor, (snapshot) => snapshot.context);
  const cuttingPlaneState = useSelector(cuttingPlaneActor, (snapshot) => snapshot.context);
  const hwvRef = useRef<WebViewer | null>();
  const dropdownRef = useRef<DropdownMenu | null>(null);

  useEffect(() => {
    if (hwvRef.current) {
      return;
    }

    const viewer = getRegisteredViewer('')!;

    hwvRef.current = viewer.hwv;
  }, [viewerState.viewerReady]);

  const createCuttingPlane = (
    plane: Plane,
    options?: {
      referenceGeometry?: Point3[];
      color?: IColor;
      lineColor?: IColor;
      opacity?: number;
    },
  ) => {
    if (!hwvRef.current) {
      return;
    }

    cuttingPlaneActor.send({
      type: 'add cutting plane',
      sectionIndex,
      cuttingPlane: {
        plane,
        referenceGeometry: options?.referenceGeometry,
        color: options?.color,
        lineColor: options?.lineColor,
        opacity: options?.opacity,
      },
    });
    onCuttingPlaneAdd();
  };

  const sectionFull = cuttingPlaneState.sections[sectionIndex].cuttingPlanes.length >= 4;
  const active = cuttingPlaneState.sections[sectionIndex].active;
  const onActiveChange = (checked: boolean) => {
    cuttingPlaneActor.send({
      type: 'set cutting section active state',
      active: checked,
      sectionIndex,
    });
  };
  return (
    <div
      style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', alignItems: 'center' }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <HoopsDropdown disabled={sectionFull} ref={dropdownRef}>
        <HoopsIconButton disabled={sectionFull}>
          <HoopsIcon icon="addIcon" />
        </HoopsIconButton>
        <div slot="dropdown-popup">
          <HoopsIconButton
            title="Create Cutting Plane An X Axis"
            onClick={(event) => {
              event.stopPropagation();
              if (!hwvRef.current) {
                return;
              }

              createCuttingPlane(
                Plane.createFromCoefficients(1, 0, 0, -cuttingPlaneState.modelBounding.max.x),
                {
                  referenceGeometry: hwvRef.current.cuttingManager.createReferenceGeometryFromAxis(
                    Axis.X,
                    cuttingPlaneState.modelBounding,
                  ),
                },
              );

              onCuttingPlaneAdd();
              dropdownRef.current!.menuShown = false;
              if (!active) {
                onActiveChange(true);
              }
            }}
          >
            <HoopsIcon icon="cuttingPlaneX" style={{ width: '80%' }}></HoopsIcon>
          </HoopsIconButton>
          <HoopsIconButton
            title="Create Cutting Plane An Y Axis"
            onClick={(event) => {
              event.stopPropagation();
              if (!hwvRef.current) {
                return;
              }

              createCuttingPlane(
                Plane.createFromCoefficients(0, 1, 0, -cuttingPlaneState.modelBounding.max.y),
                {
                  referenceGeometry: hwvRef.current.cuttingManager.createReferenceGeometryFromAxis(
                    Axis.Y,
                    cuttingPlaneState.modelBounding,
                  ),
                },
              );

              onCuttingPlaneAdd();
              dropdownRef.current!.menuShown = false;
              if (!active) {
                onActiveChange(true);
              }
            }}
          >
            <HoopsIcon icon="cuttingPlaneY" style={{ width: '80%' }}></HoopsIcon>
          </HoopsIconButton>
          <HoopsIconButton
            title="Create Cutting Plane An Z Axis"
            onClick={(event) => {
              event.stopPropagation();
              if (!hwvRef.current) {
                return;
              }

              createCuttingPlane(
                Plane.createFromCoefficients(0, 0, 1, -cuttingPlaneState.modelBounding.max.z),
                {
                  referenceGeometry: hwvRef.current.cuttingManager.createReferenceGeometryFromAxis(
                    Axis.Z,
                    cuttingPlaneState.modelBounding,
                  ),
                },
              );

              onCuttingPlaneAdd();
              dropdownRef.current!.menuShown = false;
              if (!active) {
                onActiveChange(true);
              }
            }}
          >
            <HoopsIcon icon="cuttingPlaneZ" style={{ width: '80%' }}></HoopsIcon>
          </HoopsIconButton>
          <HoopsIconButton
            disabled={!cuttingPlaneState.selectedFace}
            title="Create Cutting Plane An Selected Face"
            onClick={(event) => {
              event.stopPropagation();
              if (!hwvRef.current) {
                return;
              }

              createCuttingPlane(
                Plane.createFromPointAndNormal(
                  cuttingPlaneState.selectedFace!.position,
                  cuttingPlaneState.selectedFace!.normal,
                ),
                {
                  referenceGeometry:
                    hwvRef.current.cuttingManager.createReferenceGeometryFromFaceNormal(
                      cuttingPlaneState.selectedFace!.normal,
                      cuttingPlaneState.selectedFace!.position,
                      cuttingPlaneState.modelBounding,
                    ),
                },
              );

              onCuttingPlaneAdd();
              dropdownRef.current!.menuShown = false;
              if (!active) {
                onActiveChange(true);
              }
            }}
          >
            <HoopsIcon icon="viewFace" style={{ width: '80%' }}></HoopsIcon>
          </HoopsIconButton>
          <HoopsIconButton
            title="Create Custom Cutting Plane"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              if (!hwvRef.current) {
                return;
              }

              const normal = new Point3(1, 1, 0).normalize();
              const center = cuttingPlaneState.modelBounding.center();
              createCuttingPlane(Plane.createFromPointAndNormal(center, normal), {
                referenceGeometry:
                  hwvRef.current.cuttingManager.createReferenceGeometryFromFaceNormal(
                    normal,
                    center,
                    cuttingPlaneState.modelBounding,
                  ),
              });

              onCuttingPlaneAdd();
              dropdownRef.current!.menuShown = false;
              if (!active) {
                onActiveChange(true);
              }
            }}
          >
            <HoopsIcon icon="editIcon" style={{ width: '80%' }}></HoopsIcon>
          </HoopsIconButton>
        </div>
      </HoopsDropdown>
      <HoopsIconButton disabled={!active} title="Toggle Cutting Plane Visibility">
        <HoopsIcon
          title="Toggle Cutting Planes Visibility"
          icon={showGeometry ? 'cuttingPlaneSectionToggle' : 'cuttingPlaneSection'}
          style={{ width: '80%' }}
          onClick={(e) => {
            e.stopPropagation();
            if (!active) {
              return;
            }

            setShowGeometry((value) => !value);
            cuttingPlaneActor.send({
              type: 'set cutting section geometry visibility',
              sectionIndex,
              visible: !showGeometry,
            });
          }}
        ></HoopsIcon>
      </HoopsIconButton>
      <HoopsIconButton
        disabled={!active}
        title="Clear Cutting Section"
        onClick={(event) => {
          event.stopPropagation();
          cuttingPlaneActor.send({
            type: 'clear cutting section',
            sectionIndex,
          });
        }}
      >
        <HoopsIcon icon="cuttingPlaneReset" style={{ width: '80%' }}></HoopsIcon>
      </HoopsIconButton>
      <HoopsSwitch
        checked={active}
        onChange={(event) => {
          event.stopPropagation();
          onActiveChange(!active);
        }}
      />
    </div>
  );
}

export function CuttingSection({ label, sectionIndex }: CuttingSectionProps) {
  const accordionRef = useRef<HoopsAccordionComponent | null>(null);
  const cuttingPlaneState = useSelector(cuttingPlaneActor, (snapshot) => snapshot.context);

  return (
    <section
      style={{
        marginBottom: '0.25rem',
      }}
    >
      <HoopsAccordion ref={accordionRef}>
        <div
          slot="header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.125rem 0.25rem',
            width: '100%',
          }}
        >
          <div
            style={{
              margin: 0,
              flexGrow: 1,
            }}
          >
            {label}
          </div>
        </div>
        <div slot="toolbar">
          <CuttingSectionToolbar
            sectionIndex={sectionIndex}
            onCuttingPlaneAdd={() => {
              if (accordionRef.current) {
                accordionRef.current.expanded = true;
              }
            }}
          />
        </div>
        <div slot="content">
          <div
            style={{
              minHeight: '2rem',
              backgroundColor: 'var(--hoops-neutral-background-20)',
              padding: '0.25rem',
            }}
          >
            {cuttingPlaneState.sections[sectionIndex].cuttingPlanes.map((_, i) => (
              <CuttingPlane sectionIndex={sectionIndex} cuttingPlaneIndex={i} key={i} />
            ))}
          </div>
        </div>
      </HoopsAccordion>
    </section>
  );
}
