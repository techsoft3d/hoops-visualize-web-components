import { useEffect, useRef } from 'react';
import { CuttingPlane, cuttingPlaneActor } from '../../statemachines/cuttingPlaneMachine';
import { useSelector } from '@xstate/react';
import { HoopsButton, HoopsIcon } from '@ts3d-hoops/ui-kit-react';
import colorString from 'color-string';
import { Color } from '@ts3d-hoops/common';

type CuttingPlaneEditorProps = {
  sectionIndex: number;
  planeIndex: number;
  onChange: (plane: CuttingPlane) => unknown;
};

const CoordinateInput = (p: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => unknown;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    inputRef.current!.value = p.value.toFixed(2);
    sliderRef.current!.value = p.value.toFixed(2);
  }, [p.value]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1rem 4rem auto',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <label style={{ textAlign: 'center' }}>{p.label}:</label>
      <input
        type="number"
        style={{
          width: '4rem',
        }}
        defaultValue={p.value.toFixed(2)}
        min={p.min}
        max={p.max}
        step={0.01}
        onChange={(e) => {
          const value = parseFloat(e.target.value).toFixed(2);
          if (sliderRef.current!.value !== value) {
            sliderRef.current!.value = value;
          }
          p.onChange(parseFloat(e.target.value));
        }}
        ref={inputRef}
      />
      <input
        type="range"
        defaultValue={p.value}
        min={p.min}
        max={p.max}
        step={0.01}
        onChange={(e) => {
          const value = parseFloat(e.target.value).toFixed(2);
          if (inputRef.current!.value !== value) {
            inputRef.current!.value = value;
          }
          p.onChange(parseFloat(e.target.value));
        }}
        ref={sliderRef}
      />
    </div>
  );
};

export default function CuttingPlaneEditor(props: CuttingPlaneEditorProps) {
  const cuttingPlaneState = useSelector(cuttingPlaneActor, (snapshot) => snapshot.context);

  const cuttingPlane =
    cuttingPlaneState.sections[props.sectionIndex].cuttingPlanes[props.planeIndex];

  const boxSize = cuttingPlaneState.modelBounding.extents().length();

  const color = (
    cuttingPlane.color
      ? colorString.to.hex(cuttingPlane.color.r, cuttingPlane.color.g, cuttingPlane.color.b)
      : '#000000'
  ) as string;

  const lineColor = (
    cuttingPlane.lineColor
      ? colorString.to.hex(
          cuttingPlane.lineColor.r,
          cuttingPlane.lineColor.g,
          cuttingPlane.lineColor.b,
        )
      : '#000000'
  ) as string;

  return (
    <div style={{ padding: '0.5rem' }}>
      <CoordinateInput
        label="x"
        value={cuttingPlane.plane.normal.x}
        min={-1}
        max={1}
        onChange={(value) => {
          cuttingPlane.plane.normal.x = value;
          props.onChange(cuttingPlane);
        }}
      />
      <CoordinateInput
        label="y"
        value={cuttingPlane.plane.normal.y}
        min={-1}
        max={1}
        onChange={(value) => {
          cuttingPlane.plane.normal.y = value;
          props.onChange(cuttingPlane);
        }}
      />
      <CoordinateInput
        label="z"
        value={cuttingPlane.plane.normal.z}
        min={-1}
        max={1}
        onChange={(value) => {
          cuttingPlane.plane.normal.z = value;
          props.onChange(cuttingPlane);
        }}
      />
      <CoordinateInput
        label="d"
        value={cuttingPlane.plane.d}
        min={-boxSize}
        max={boxSize}
        onChange={(value) => {
          cuttingPlane.plane.d = value;
          props.onChange(cuttingPlane);
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'min-content auto',
          gap: '0.25rem',
          marginTop: '1rem',
          alignItems: 'center',
        }}
      >
        <div>borders:</div>
        <div
          style={{
            display: 'flex',
            flexFlow: 'row nowrap',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 500,
          }}
        >
          <div>{lineColor}</div>
          <HoopsButton title="Set Cutting Plane Borders Color" iconSize="sm">
            <label slot="icon">
              <HoopsIcon
                icon="borderIcon"
                style={
                  {
                    width: '60%',
                    '--hoops-svg-stroke-color': lineColor,
                  } as any
                }
              ></HoopsIcon>
              <input
                type="color"
                value={lineColor}
                style={{ display: 'inline-block', width: 0, height: 0, opacity: 0 }}
                disabled={cuttingPlane.referenceGeometry === undefined}
                onChange={(event) => {
                  const color = colorString.get.rgb(event.target.value)!;
                  cuttingPlaneActor.send({
                    type: 'set cutting plane line color',
                    sectionIndex: props.sectionIndex,
                    planeIndex: props.planeIndex,
                    lineColor: new Color(color[0], color[1], color[2]),
                  });
                }}
                hidden={cuttingPlane.referenceGeometry === undefined}
              />
            </label>
          </HoopsButton>
        </div>
        <div>color:</div>
        <div
          style={{
            display: 'flex',
            flexFlow: 'row nowrap',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 500,
          }}
        >
          <div>{color}</div>
          <HoopsButton title="Set Cutting Plane Color" iconSize="sm">
            <label slot="icon">
              <HoopsIcon
                icon="fillIcon"
                style={
                  {
                    '--hoops-svg-stroke-color': color,
                    width: '60%',
                  } as any
                }
              ></HoopsIcon>
              <input
                type="color"
                value={color}
                style={{ display: 'inline-block', width: 0, height: 0, opacity: 0 }}
                disabled={cuttingPlane.referenceGeometry === undefined}
                onChange={(event) => {
                  const color = colorString.get.rgb(event.target.value)!;
                  cuttingPlaneActor.send({
                    type: 'set cutting plane color',
                    sectionIndex: props.sectionIndex,
                    planeIndex: props.planeIndex,
                    color: new Color(color[0], color[1], color[2]),
                  });
                }}
                hidden={cuttingPlane.referenceGeometry === undefined}
              />
            </label>
          </HoopsButton>
        </div>
        <div>opacity:</div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            style={{ width: '100%' }}
            className="vertical-slider"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={cuttingPlane.opacity ?? 1}
            onChange={(event) => {
              event.stopPropagation();
              const value = event.target.valueAsNumber;
              cuttingPlaneActor.send({
                type: 'set cutting plane opacity',
                sectionIndex: props.sectionIndex,
                planeIndex: props.planeIndex,
                opacity: value,
              });
            }}
          />
          <HoopsIcon
            icon="opacityIcon"
            style={
              {
                '--hoops-svg-stroke-color': color,
                margin: '0.4rem 0.6rem',
              } as any
            }
          ></HoopsIcon>
        </div>
      </div>
    </div>
  );
}
