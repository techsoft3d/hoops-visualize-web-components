import { HoopsAccordion, HoopsButton, HoopsIcon, HoopsIconButton } from '@ts3d-hoops/ui-kit-react';
import { useSelector } from '@xstate/react';
import { useRef, useState } from 'react';
import { cuttingPlaneActor, cuttingPlaneMachine } from '../../statemachines/cuttingPlaneMachine';
import {
  Box,
  get3dBaseFromVector,
  Plane as Plane3d,
  Point3,
  sortVerticesCounterClockwise,
} from '@ts3d-hoops/common';
import CuttingPlaneEditor from './CuttingPlaneEditor';
import { getRegisteredViewer } from '../../utils/registerViewer';

export type CuttingPlaneProps = {
  sectionIndex: number;
  cuttingPlaneIndex: number;
  defaultOpen?: boolean;
};

export function getReferenceGeometry(plane: Plane3d, position: Point3, modelBounding: Box) {
  const base = get3dBaseFromVector(plane.normal.copy().normalize());
  const extents = modelBounding.extents().scale(0.5);
  return sortVerticesCounterClockwise(
    [
      Point3.subtract(base[1], base[2]),
      Point3.add(base[1], base[2]),
      Point3.subtract(base[2], base[1]),
      Point3.subtract(Point3.scale(base[2], -1), base[1]),
    ].map((current) =>
      Point3.add(
        new Point3(current.x * extents.x, current.y * extents.y, current.z * extents.z),
        position,
      ),
    ),
    base,
  ).map((p) => new Point3(p.x, p.y, p.z));
}

export function getPlaneCenter(plane: Plane3d, bounding: Box) {
  const center = bounding.center();
  const normal = plane.normal.copy().normalize();
  const offset = Point3.scale(normal, -plane.d / plane.normal.length());
  return Point3.add(offset, center);
}

function CuttingPlaneToolbar(props: {
  sectionIndex: number;
  cuttingPlaneIndex: number;
  onOpen: () => unknown;
}) {
  const cuttingPlaneState: typeof cuttingPlaneMachine.config.context = useSelector(
    cuttingPlaneActor,
    (snapshot) => snapshot.context,
  );

  const cuttingPlane =
    cuttingPlaneState.sections[props.sectionIndex].cuttingPlanes[props.cuttingPlaneIndex];

  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      <HoopsButton title="Customize Cutting Plane" iconSize="sm" onClick={props.onOpen}>
        <div slot="icon">
          <HoopsIcon icon="editIcon" style={{ width: '60%' }}></HoopsIcon>
        </div>
      </HoopsButton>
      <HoopsButton
        title="Invert Cutting Plane"
        iconSize="sm"
        onClick={(event) => {
          event.stopPropagation();
          cuttingPlaneActor.send({
            type: 'invert cutting plane',
            sectionIndex: props.sectionIndex,
            planeIndex: props.cuttingPlaneIndex,
          });
        }}
      >
        <label slot="icon">
          <HoopsIcon icon="invertIcon"></HoopsIcon>
        </label>
      </HoopsButton>
      <HoopsButton
        title="Toggle Reference Geometry Visibility"
        iconSize="sm"
        onClick={() => {
          cuttingPlaneActor.send({
            type: 'set cutting plane geometry visibility',
            sectionIndex: props.sectionIndex,
            planeIndex: props.cuttingPlaneIndex,
            visible: !!cuttingPlane.hideReferenceGeometry,
          });
        }}
      >
        <label slot="icon">
          <HoopsIcon
            icon={cuttingPlane.hideReferenceGeometry ? 'visibilityHidden' : 'visibilityShown'}
            style={{ width: '100%' }}
          ></HoopsIcon>
        </label>
      </HoopsButton>
      <HoopsIconButton
        title="Remove Cutting Plane"
        size="sm"
        onClick={() => {
          cuttingPlaneActor.send({
            type: 'remove cutting plane',
            sectionIndex: props.sectionIndex,
            planeIndex: props.cuttingPlaneIndex,
          });
        }}
      >
        <HoopsIcon icon="removeIcon" style={{ width: '80%' }}></HoopsIcon>
      </HoopsIconButton>
    </div>
  );
}

export default function CuttingPlane(props: CuttingPlaneProps) {
  const [showEditor, setShowEditor] = useState<boolean>(props.defaultOpen ?? false);
  const cuttingPlaneState: typeof cuttingPlaneMachine.config.context = useSelector(
    cuttingPlaneActor,
    (snapshot) => snapshot.context,
  );

  const debouncerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <HoopsAccordion expanded={showEditor}>
      <div
        slot="header"
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          flexFlow: 'row nowrap',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <HoopsIcon icon="planeIcon"></HoopsIcon>
          Cutting Plane {props.cuttingPlaneIndex + 1}
        </div>
      </div>
      <div slot="icon">
        <CuttingPlaneToolbar
          cuttingPlaneIndex={props.cuttingPlaneIndex}
          sectionIndex={props.sectionIndex}
          onOpen={() => setShowEditor((value) => !value)}
        />
      </div>
      <div slot="content">
        <CuttingPlaneEditor
          sectionIndex={props.sectionIndex}
          planeIndex={props.cuttingPlaneIndex}
          onChange={(cuttingPlane) => {
            if (debouncerTimeout.current) {
              clearTimeout(debouncerTimeout.current);
            }

            debouncerTimeout.current = setTimeout(() => {
              debouncerTimeout.current = null;
              const plane = cuttingPlane.plane;

              /* COM-4607: Normalize the plane normal so that reference geometry aligns with the plane.
               * This is a workaround for the fact that the normal supplied by the user may not be a unit vector,
               * and non-unit vectors are handled poorly. In a more complete solution, we should simply handle
               * non-unit normals in the reference geometry code.
               */
              plane.normal.normalize();

              const length = plane.normal.length();
              if (length > 0 && cuttingPlane.referenceGeometry) {
                const normal = plane.normal;

                const refGeo = getRegisteredViewer(
                  '',
                )!.hwv.cuttingManager.createReferenceGeometryFromFaceNormal(
                  normal,
                  getPlaneCenter(plane, cuttingPlaneState.modelBounding),
                  cuttingPlaneState.modelBounding,
                );
                cuttingPlane.referenceGeometry = refGeo;
              }

              cuttingPlaneActor.send({
                type: 'set cutting plane',
                sectionIndex: props.sectionIndex,
                planeIndex: props.cuttingPlaneIndex,
                cuttingPlane,
              });
            }, 500);
          }}
        />
      </div>
    </HoopsAccordion>
  );
}
