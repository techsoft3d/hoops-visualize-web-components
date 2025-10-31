import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import {
  areaSelect,
  camera,
  cameraTurntable,
  cubeBack,
  cubeBottom,
  cubeFront,
  cubeHiddenLine,
  cubeLeft,
  cubeRight,
  cubeShaded,
  cubeTop,
  cubeWireframe,
  cuttingPlane,
  cuttingPlaneReset,
  cuttingPlaneSection,
  cuttingPlaneSectionToggle,
  cuttingPlaneX,
  cuttingPlaneY,
  cuttingPlaneZ,
  explode,
  home,
  layers,
  measureAngle,
  measureDistance,
  measureEdge,
  measurePoint,
  note,
  orbit,
  orthoView,
  perspectiveView,
  redlineCircle,
  redlineFreehand,
  redlineNote,
  redlineRectangle,
  search,
  select,
  settings,
  snapshot,
  viewFace,
  viewIso,
  walk,
  wireframeShaded,
  info,
  rootModel,
  assemblyNode,
  visibilityShown,
  visibilityHidden,
  bodyNode,
  playIcon,
  pauseIcon,
  stopIcon,
  hiddenIcon,
  visibleIcon,
  halfVisibleIcon,
  folderIcon,
  meshCubeIcon,
  rightIcon,
  downIcon,
  dotIcon,
  appMenuIcon,
  noWireframeShaded,
  toonShader,
  goochShader,
  xRayShader,
  moon,
  light,
  close,
  modelTree,
  importIcon,
  newFileIcon,
  viewIcon,
  typesIcon,
  addIcon,
  removeIcon,
  editIcon,
  borderIcon,
  fillIcon,
  planeIcon,
  invertIcon,
  opacityIcon,
  paletteIcon,
  repeatIcon,
  fastForwardIcon,
  fpsIcon,
  recordIcon,
  uploadIcon,
  downloadIcon,
  toolsIcon,
  cadConfiguration,
} from '../icons';

const meta: Meta = {
  component: 'hoops-icon-button',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {
    size: ['sm', 'md', 'xl'],
  },
  render: (_args) => {
    const icons = [
      ['layers', layers],
      ['explode', explode],
      ['home', home],
      ['measureDistance', measureDistance],
      ['orbit', orbit],
      ['redlineFreehand', redlineFreehand],
      ['select', select],
      ['cubeTop', cubeTop],
      ['camera', camera],
      ['viewFace', viewFace],
      ['viewIso', viewIso],
      ['cubeBack', cubeBack],
      ['measureEdge', measureEdge],
      ['orthoView', orthoView],
      ['redlineNote', redlineNote],
      ['settings', settings],
      ['cameraTurntable', cameraTurntable],
      ['cubeFront', cubeFront],
      ['cubeWireframe', cubeWireframe],
      ['cubeLeft', cubeLeft],
      ['measurePoint', measurePoint],
      ['wireframeShaded', wireframeShaded],
      ['cuttingPlane', cuttingPlane],
      ['perspectiveView', perspectiveView],
      ['cuttingPlaneZ', cuttingPlaneZ],
      ['redlineRectangle', redlineRectangle],
      ['cuttingPlaneY', cuttingPlaneY],
      ['cubeShaded', cubeShaded],
      ['cuttingPlaneX', cuttingPlaneX],
      ['walk', walk],
      ['cuttingPlaneSectionToggle', cuttingPlaneSectionToggle],
      ['areaSelect', areaSelect],
      ['cuttingPlaneReset', cuttingPlaneReset],
      ['cubeHiddenLine', cubeHiddenLine],
      ['cuttingPlaneSection', cuttingPlaneSection],
      ['measureAngle', measureAngle],
      ['note', note],
      ['redlineCircle', redlineCircle],
      ['cubeRight', cubeRight],
      ['snapshot', snapshot],
      ['cubeBottom', cubeBottom],
      ['search', search],
      ['layers', layers],
      ['info', info],
      ['root model', rootModel],
      ['assembly node', assemblyNode],
      ['body node', bodyNode],
      ['visibility shown', visibilityShown],
      ['visibility hidden', visibilityHidden],
      ['play icon', playIcon],
      ['pause icon', pauseIcon],
      ['stop icon', stopIcon],
      ['hidden icon', hiddenIcon],
      ['visible icon', visibleIcon],
      ['halfVisible icon', halfVisibleIcon],
      ['folder icon', folderIcon],
      ['meshCube icon', meshCubeIcon],
      ['right icon', rightIcon],
      ['down icon', downIcon],
      ['dot icon', dotIcon],
      ['appMenu icon', appMenuIcon],
      ['noWireframeShaded', noWireframeShaded],
      ['toon shader', toonShader],
      ['gooch shader', goochShader],
      ['x-ray shader', xRayShader],
      ['moon', moon],
      ['light', light],
      ['close', close],
      ['model tree', modelTree],
      ['import icon', importIcon],
      ['new file icon', newFileIcon],
      ['view icon', viewIcon],
      ['types icon', typesIcon],
      ['add icon', addIcon],
      ['remove icon', removeIcon],
      ['edit icon', editIcon],
      ['border icon', borderIcon],
      ['fill icon', fillIcon],
      ['plane icon', planeIcon],
      ['invert icon', invertIcon],
      ['opacity icon', opacityIcon],
      ['palette icon', paletteIcon],
      ['repeat icon', repeatIcon],
      ['fast forward icon', fastForwardIcon],
      ['fps icon', fpsIcon],
      ['record icon', recordIcon],
      ['upload icon', uploadIcon],
      ['download icon', downloadIcon],
      ['tools icon', toolsIcon],
      ['cad configuration', cadConfiguration],
    ];

    return html`
      <style>
        :root {
          --hoops-svg-accent-color: royalblue;
          --hoops-svg-stroke-color: #525252;
          --hoops-svg-fill-color: #ffffff;
        }
        .bg-dark {
          background-color: #333;
        }
        .alt {
          --hoops-svg-accent-color: orangered;
          --hoops-svg-stroke-color: royalblue;
          --hoops-svg-fill-color: transparent;
        }
        .container {
          background-color: #99000099;
        }
        .icon-container {
          height: 1rem;
        }
        .svg-container {
          display: inline-block;
          height: 1rem;
          width: 1rem;
        }
        .svg-container.md {
          display: inline-block;
          height: 1.8rem;
          width: 1.8rem;
        }
        .svg-container.xl {
          display: inline-block;
          height: 3.6rem;
          width: 3.6rem;
        }
        .label {
          margin-right: 5px;
        }
        .dark {
          background-color: #202020;
          --hoops-svg-accent-color: #ffd700;
          --hoops-svg-stroke-color: #acacac;
          --hoops-svg-fill-color: transparent;
        }
      </style>
      <h2>SM normal</h2>
      <table>
        <thead>
          <tr>
            <th>Icon</th>
            <th>Light sm</th>
            <th>Light md</th>
            <th>Light xl</th>
            <th>Dark sm</th>
            <th>Dark md</th>
            <th>Dark xl</th>
            <th>Alt sm</th>
            <th>Alt md</th>
            <th>Alt xl</th>
          </tr>
        </thead>
        <tbody>
          ${icons.map(
            (svg) =>
              html`<tr>
                <td>${svg?.at(0)}</td>
                <td><div class="svg-container sm">${svg?.at(1)}</div></td>
                <td><div class="svg-container md">${svg?.at(1)}</div></td>
                <td><div class="svg-container xl">${svg?.at(1)}</div></td>
                <td class="bg-dark"><div class="svg-container dark sm">${svg?.at(1)}</div></td>
                <td class="bg-dark"><div class="svg-container dark md">${svg?.at(1)}</div></td>
                <td class="bg-dark"><div class="svg-container dark xl">${svg?.at(1)}</div></td>
                <td class="alt"><div class="svg-container alt sm">${svg?.at(1)}</div></td>
                <td class="alt"><div class="svg-container alt md">${svg?.at(1)}</div></td>
                <td class="alt"><div class="svg-container alt xl">${svg?.at(1)}</div></td>
                <td class="bg-dark">
                  <div class="svg-container alt sm">${svg?.at(1)}</div>
                </td>
                <td class="bg-dark">
                  <div class="svg-container alt md">${svg?.at(1)}</div>
                </td>
                <td class="bg-dark">
                  <div class="svg-container alt xl">${svg?.at(1)}</div>
                </td>
              </tr>`,
          )}
        </tbody>
      </table>
    `;
  },
};
