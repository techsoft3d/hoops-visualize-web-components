import type { Meta, StoryObj } from '@storybook/web-components';
import { userEvent, within, expect } from '@storybook/test';

import { IService, registerService } from '../services';

import { html } from 'lit';

import './hoops-toolbar-camera';
import './hoops-toolbar-camera-operator';
import './hoops-toolbar-drawmode';
import './hoops-toolbar-home';
import './hoops-toolbar-layers';
import './hoops-toolbar-model-tree';
import './hoops-toolbar-properties';
import './hoops-toolbar-snapshot';
import './hoops-toolbar-redlines';
import './hoops-toolbar-cad-configuration';
import './hoops-toolbar-settings';

const meta: Meta = {
  component: 'toolbar-buttons',
};

export default meta;
type Story = StoryObj;

function mockCameraService() {
  registerService({
    serviceName: 'CameraService',
    addEventListener: () => undefined,
    getProjectionMode: () => 'Orthographic',
    setProjectionMode: () => undefined,
  } as unknown as IService);
}

export const Base: Story = {
  args: {},
  render: () => {
    mockCameraService();
    return html`<div style="display: flex; flex-direction: column;">
      <hoops-toolbar-model-tree></hoops-toolbar-model-tree>
      <hoops-toolbar-model-tree color="accent"></hoops-toolbar-model-tree>
      <hoops-toolbar-layers></hoops-toolbar-layers>
      <hoops-toolbar-layers color="accent"></hoops-toolbar-layers>
      <hoops-toolbar-cad-configuration></hoops-toolbar-cad-configuration>
      <hoops-toolbar-cad-configuration color="accent"></hoops-toolbar-cad-configuration>
      <hoops-toolbar-settings></hoops-toolbar-settings>
      <hoops-toolbar-settings color="accent"></hoops-toolbar-settings>
      <hoops-toolbar-properties></hoops-toolbar-properties>
      <hoops-toolbar-camera></hoops-toolbar-camera>
      <hoops-toolbar-snapshot></hoops-toolbar-snapshot>
      <hoops-toolbar-drawmode></hoops-toolbar-drawmode>
      <hoops-toolbar-camera-operator></hoops-toolbar-camera-operator>
      <hoops-toolbar-redlines></hoops-toolbar-redlines>
    </div>`;
  },
};

/** When the user clicks on the camera button, a drop down panel shows up with the following view buttons: orthographic projection, perspective projection, iso view, orient to selected face, left, right, top, bottom, front and back */
export const CameraMenuOpenAndContent: Story = {
  tags: ['@UI.2.7'],
  render: () => {
    mockCameraService();
    return html`<hoops-toolbar-camera></hoops-toolbar-camera>`;
  },
  play: async ({ canvasElement }) => {
    const toobarCameraComponent = canvasElement.getElementsByTagName(
      'hoops-toolbar-camera',
    )[0] as HTMLElement;
    const dropDownComponent = toobarCameraComponent!.shadowRoot!.querySelector(
      'hoops-dropdown',
    ) as HTMLElement;

    const withinDropDown = within(dropDownComponent!);
    const cameraButton = withinDropDown.getByTitle('Camera', { exact: true });

    await userEvent.click(cameraButton);

    const allButtons = await withinDropDown.findAllByRole('button');
    expect(allButtons.length).toBe(11);

    const buttonValues = [
      'Orthographic Projection',
      'Perspective Projection',
      'Iso View',
      'Top View',
      'Bottom View',
      'Left View',
      'Right View',
      'Front View',
      'Back View',
      'Orient to Selected Face',
    ];
    allButtons.slice(1).forEach((button, index) => {
      expect(button).toHaveTextContent(buttonValues[index]);
    });
  },
};

/** When the user clicks on the draw modes button, a drop down panel shows up with buttons for each draw modes available: wireframe, shaded, wireframe shaded, hidden lines, x-ray, gooch, toon */
export const DrawModeMenuOpenAndContent: Story = {
  tags: ['@UI.2.11'],
  render: () => {
    return html`<hoops-toolbar-drawmode></hoops-toolbar-drawmode>`;
  },
  play: async ({ canvasElement }) => {
    const toobarDrawModeComponent = canvasElement.getElementsByTagName(
      'hoops-toolbar-drawmode',
    )[0] as HTMLElement;
    const dropDownComponent = toobarDrawModeComponent!.shadowRoot!.querySelector(
      'hoops-dropdown',
    ) as HTMLElement;

    const withinDropDown = within(dropDownComponent!);
    const drawModeButton = withinDropDown.getByTitle('Draw mode - Wireframe On Shaded');

    await userEvent.click(drawModeButton);

    const allButtons = await withinDropDown.findAllByRole('button');
    expect(allButtons.length).toBe(8);

    const buttonValues = [
      'Wireframe',
      'Shaded',
      'Wireframe On Shaded',
      'Hidden Line',
      'XRay',
      'Gooch',
      'Toon',
    ];
    allButtons.slice(1).forEach((button, index) => {
      expect(button).toHaveAttribute('title', buttonValues[index]);
    });
  },
};

/** When the user clicks on the camera operator button, a drop down panel shows up with buttons for each camera operator available: orbit, turntable and walk */
export const CameraOperatorMenuOpenAndContent: Story = {
  tags: ['@UI.2.14'],
  render: () => {
    return html`<hoops-toolbar-camera-operator></hoops-toolbar-camera-operator>`;
  },
  play: async ({ canvasElement }) => {
    const toobarCameraOperatorComponent = canvasElement.getElementsByTagName(
      'hoops-toolbar-camera-operator',
    )[0] as HTMLElement;
    const dropDownComponent = toobarCameraOperatorComponent!.shadowRoot!.querySelector(
      'hoops-dropdown',
    ) as HTMLElement;

    const withinDropDown = within(dropDownComponent!);
    const cameraOperatorButton = withinDropDown.getByTitle('Camera operator - Orbit camera');

    await userEvent.click(cameraOperatorButton);

    const allButtons = await withinDropDown.findAllByRole('button');
    expect(allButtons.length).toBe(4);

    const buttonValues = ['Orbit camera', 'Turntable', 'Walk'];
    allButtons.slice(1).forEach((button, index) => {
      expect(button).toHaveAttribute('title', buttonValues[index]);
    });
  },
};

/** When the user clicks on one of the redline operator buttons, the web viewer activates each redline operator accordingly: text, circle, rectangle, free hand. The redline operator button icon in the toolbar is highlighted as long as the redline operator is active in the viewer */
export const RedlinesMenuOpenAndContent: Story = {
  tags: ['@UI.2.16'],
  render: () => {
    return html`<hoops-toolbar-redlines></hoops-toolbar-redlines>`;
  },
  play: async ({ canvasElement }) => {
    const toobarRedlinesComponent = canvasElement.getElementsByTagName(
      'hoops-toolbar-redlines',
    )[0] as HTMLElement;
    const dropDownComponent = toobarRedlinesComponent!.shadowRoot!.querySelector(
      'hoops-dropdown',
    ) as HTMLElement;

    const withinDropDown = within(dropDownComponent!);
    const redlineButton = withinDropDown.getByTitle('Redline markups');

    await userEvent.click(redlineButton);

    const allButtons = await withinDropDown.findAllByRole('button');
    expect(allButtons.length).toBe(5);

    const buttonValues = ['Circle', 'Text', 'Rectangle', 'Free hand'];
    allButtons.slice(1).forEach((button, index) => {
      expect(button).toHaveTextContent(buttonValues[index]);
    });
  },
};
