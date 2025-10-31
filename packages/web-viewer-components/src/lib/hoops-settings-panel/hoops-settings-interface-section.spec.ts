import { beforeAll, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { html } from 'lit';

import { renderTemplate } from '../testing/utils';

import HoopsSettingsInterfaceSectionElement from './hoops-settings-interface-section';
import './hoops-settings-interface-section';
import { getService, registerService } from '../services';
import { ViewServiceMock } from '../../mocks/ViewServiceMock';
import { FloorplanServiceMock } from '../../mocks/FloorplanServiceMock';
import { hoopsSwitch } from '@ts3d-hoops/ui-kit';

describe('hoops-settings-interface-section', () => {
  beforeAll(() => {
    registerService(new ViewServiceMock(vi.fn));
    registerService(new FloorplanServiceMock(vi.fn));
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the interface section', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    expect(true).not.toBeNull();
    expect(elm.shadowRoot!.querySelectorAll('fieldset').length).toBe(2);
    expect(elm.shadowRoot!.querySelectorAll('legend').length).toBe(2);
    expect(elm.shadowRoot!.querySelectorAll('hoops-switch').length).toBe(4);
    expect(elm.shadowRoot!.querySelectorAll('select').length).toBe(2);
    expect(elm.shadowRoot!.querySelectorAll('input[type="number"]').length).toBe(5);
    expect(elm.shadowRoot!.querySelectorAll('input[type="color"]').length).toBe(4);
  });

  it('should render the interface section with the values from the service', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const viewService = getService<ViewServiceMock>('ViewService');
    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');

    const axisTriadSwitch = elm.shadowRoot!.querySelector(
      'hoops-switch#show-axis-triad',
    ) as hoopsSwitch.HoopsSwitchElement;
    const navCubeSwitch = elm.shadowRoot!.querySelector(
      'hoops-switch#show-nav-cube',
    ) as hoopsSwitch.HoopsSwitchElement;

    expect(axisTriadSwitch.checked).toBe(viewService.isAxisTriadVisible());
    expect(navCubeSwitch.checked).toBe(viewService.isNavCubeVisible());

    const floorplanSwitch = elm.shadowRoot!.querySelector(
      'hoops-switch#activate-floorplan',
    ) as hoopsSwitch.HoopsSwitchElement;
    const trackCameraSwitch = elm.shadowRoot!.querySelector(
      'hoops-switch#track-camera',
    ) as hoopsSwitch.HoopsSwitchElement;

    expect(floorplanSwitch.checked).toBe(floorplanService.isActive());
    expect(trackCameraSwitch.checked).toBe(floorplanService.isTrackCameraEnabled());

    const overlayFeetPerPixelInput = elm.shadowRoot!.querySelector(
      'input#overlay-feet-per-pixel',
    ) as HTMLInputElement;
    const overlayZoomLevelInput = elm.shadowRoot!.querySelector(
      'input#overlay-zoom-level',
    ) as HTMLInputElement;
    const overlayBackgroundOpacityInput = elm.shadowRoot!.querySelector(
      'input#overlay-background-opacity',
    ) as HTMLInputElement;
    const overlayBorderOpacityInput = elm.shadowRoot!.querySelector(
      'input#overlay-border-opacity',
    ) as HTMLInputElement;

    expect(overlayFeetPerPixelInput.value).toBe(
      floorplanService.getOverlayFeetPerPixel().toString(),
    );
    expect(overlayZoomLevelInput.value).toBe(floorplanService.getOverlayZoomLevel().toString());
    expect(overlayBackgroundOpacityInput.value).toBe(
      floorplanService.getOverlayBackgroundOpacity().toString(),
    );
    expect(overlayBorderOpacityInput.value).toBe(
      floorplanService.getOverlayBorderOpacity().toString(),
    );

    const floorplanBackgroundColorInput = elm.shadowRoot!.querySelector(
      'input#floorplan-background-color',
    ) as HTMLInputElement;
    const floorplanBorderColorInput = elm.shadowRoot!.querySelector(
      'input#floorplan-border-color',
    ) as HTMLInputElement;
    const floorplanAvatarColorInput = elm.shadowRoot!.querySelector(
      'input#floorplan-avatar-color',
    ) as HTMLInputElement;
    const floorplanAvatarOutlineColorInput = elm.shadowRoot!.querySelector(
      'input#floorplan-avatar-outline-color',
    ) as HTMLInputElement;

    expect(floorplanBackgroundColorInput.value).toBe(
      floorplanService.getFloorplanBackgroundColor(),
    );
    expect(floorplanBorderColorInput.value).toBe(floorplanService.getFloorplanBorderColor());
    expect(floorplanAvatarColorInput.value).toBe(floorplanService.getFloorplanAvatarColor());
    expect(floorplanAvatarOutlineColorInput.value).toBe(
      floorplanService.getFloorplanAvatarOutlineColor(),
    );
  });

  it('should update the view service when the axis triad switch is toggled', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const axisTriadSwitch = elm.shadowRoot!.querySelector(
      'hoops-switch#show-axis-triad',
    ) as hoopsSwitch.HoopsSwitchElement;

    const viewService = getService<ViewServiceMock>('ViewService');
    (viewService.setAxisTriadVisible as Mock).mockClear();

    axisTriadSwitch.shadowRoot!.querySelector('label')!.click();
    expect(viewService.setAxisTriadVisible).toHaveBeenCalledWith(axisTriadSwitch.checked);
  });

  it('should update the view service when the axis triad is toggled from the service', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const axisTriadSwitch = elm.shadowRoot!.querySelector(
      'hoops-switch#show-axis-triad',
    ) as hoopsSwitch.HoopsSwitchElement;

    const viewService = getService<ViewServiceMock>('ViewService');
    const previous = viewService.isAxisTriadVisible();
    expect(axisTriadSwitch.checked).toBe(previous);
    viewService.setAxisTriadVisible(!previous);
    await elm.updateComplete;
    expect(axisTriadSwitch.checked).toBe(!previous);
  });

  it('should update the view service when the nav cube switch is toggled', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const navCubeSwitch = elm.shadowRoot!.querySelector(
      'hoops-switch#show-nav-cube',
    ) as hoopsSwitch.HoopsSwitchElement;

    const viewService = getService<ViewServiceMock>('ViewService');
    (viewService.setNavCubeVisible as Mock).mockClear();

    navCubeSwitch.shadowRoot!.querySelector('label')!.click();
    expect(viewService.setNavCubeVisible).toHaveBeenCalledWith(navCubeSwitch.checked);
  });

  it('should update the view service when the nav cube is toggled from the service', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const navCubeSwitch = elm.shadowRoot!.querySelector(
      'hoops-switch#show-nav-cube',
    ) as hoopsSwitch.HoopsSwitchElement;

    const viewService = getService<ViewServiceMock>('ViewService');
    const previous = viewService.isNavCubeVisible();
    expect(navCubeSwitch.checked).toBe(previous);
    viewService.setNavCubeVisible(!previous);
    await elm.updateComplete;
    expect(navCubeSwitch.checked).toBe(!previous);
  });

  it('should update the floorplan service when the floorplan switch is toggled', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const floorplanSwitch = elm.shadowRoot!.querySelector(
      'hoops-switch#activate-floorplan',
    ) as hoopsSwitch.HoopsSwitchElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setActive as Mock).mockClear();

    floorplanSwitch.shadowRoot!.querySelector('label')!.click();
    expect(floorplanService.setActive).toHaveBeenCalledWith(floorplanSwitch.checked);
  });

  it('should update the floorplan service when the floorplan is toggled from the service', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const floorplanSwitch = elm.shadowRoot!.querySelector(
      'hoops-switch#activate-floorplan',
    ) as hoopsSwitch.HoopsSwitchElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    const previous = floorplanService.isActive();
    expect(floorplanSwitch.checked).toBe(previous);
    floorplanService.setActive(!previous);
    await elm.updateComplete;
    expect(floorplanSwitch.checked).toBe(!previous);
  });

  it('should update the floorplan service when the track camera switch is toggled', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const trackCameraSwitch = elm.shadowRoot!.querySelector(
      'hoops-switch#track-camera',
    ) as hoopsSwitch.HoopsSwitchElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setTrackCameraEnabled as Mock).mockClear();

    trackCameraSwitch.shadowRoot!.querySelector('label')!.click();
    expect(floorplanService.setTrackCameraEnabled).toHaveBeenCalledWith(trackCameraSwitch.checked);
  });

  it('should update the floorplan service when the track camera is toggled from the service', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const trackCameraSwitch = elm.shadowRoot!.querySelector(
      'hoops-switch#track-camera',
    ) as hoopsSwitch.HoopsSwitchElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    const previous = floorplanService.isTrackCameraEnabled();
    expect(trackCameraSwitch.checked).toBe(previous);
    floorplanService.setTrackCameraEnabled(!previous);
    await elm.updateComplete;
    expect(trackCameraSwitch.checked).toBe(!previous);
  });

  it('should update the floorplan service when the overlay feet per pixel input is changed', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const overlayFeetPerPixelInput = elm.shadowRoot!.querySelector(
      'input#overlay-feet-per-pixel',
    ) as HTMLInputElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setOverlayFeetPerPixel as Mock).mockClear();

    overlayFeetPerPixelInput.value = '10';
    overlayFeetPerPixelInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await elm.updateComplete;
    expect(floorplanService.setOverlayFeetPerPixel).toHaveBeenCalledWith(10);
    (floorplanService.setOverlayFeetPerPixel as Mock).mockClear();

    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    overlayFeetPerPixelInput.value = 'invalid';
    overlayFeetPerPixelInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await elm.updateComplete;

    expect(floorplanService.setOverlayFeetPerPixel).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('Invalid input for Overlay Feet per Pixel');
  });

  it('should update the floorplan service when the overlay feet per pixel input is changed', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const overlayZoomLevelInput = elm.shadowRoot!.querySelector(
      'input#overlay-zoom-level',
    ) as HTMLInputElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setOverlayZoomLevel as Mock).mockClear();

    overlayZoomLevelInput.value = '10';
    overlayZoomLevelInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await elm.updateComplete;
    expect(floorplanService.setOverlayZoomLevel).toHaveBeenCalledWith(10);
    (floorplanService.setOverlayZoomLevel as Mock).mockClear();

    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    overlayZoomLevelInput.value = 'invalid';
    overlayZoomLevelInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await elm.updateComplete;

    expect(floorplanService.setOverlayZoomLevel).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('Invalid input for Overlay Zoom Level');
  });

  it('should update the floorplan service when the overlay background opacity input is changed', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const overlayBackgroundOpacityInput = elm.shadowRoot!.querySelector(
      'input#overlay-background-opacity',
    ) as HTMLInputElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setOverlayBackgroundOpacity as Mock).mockClear();

    overlayBackgroundOpacityInput.value = '0.5';
    overlayBackgroundOpacityInput.dispatchEvent(
      new Event('input', { bubbles: true, composed: true }),
    );
    await elm.updateComplete;
    expect(floorplanService.setOverlayBackgroundOpacity).toHaveBeenCalledWith(0.5);
    (floorplanService.setOverlayBackgroundOpacity as Mock).mockClear();

    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    overlayBackgroundOpacityInput.value = 'invalid';
    overlayBackgroundOpacityInput.dispatchEvent(
      new Event('input', { bubbles: true, composed: true }),
    );
    await elm.updateComplete;

    expect(floorplanService.setOverlayBackgroundOpacity).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('Invalid input for Overlay Background Opacity');
  });

  it('should update the floorplan service when the overlay border opacity input is changed', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const overlayBorderOpacityInput = elm.shadowRoot!.querySelector(
      'input#overlay-border-opacity',
    ) as HTMLInputElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setOverlayBorderOpacity as Mock).mockClear();

    overlayBorderOpacityInput.value = '0.5';
    overlayBorderOpacityInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await elm.updateComplete;
    expect(floorplanService.setOverlayBorderOpacity).toHaveBeenCalledWith(0.5);
    (floorplanService.setOverlayBorderOpacity as Mock).mockClear();

    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    overlayBorderOpacityInput.value = 'invalid';
    overlayBorderOpacityInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await elm.updateComplete;

    expect(floorplanService.setOverlayBorderOpacity).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('Invalid input for Overlay Border Opacity');
  });

  it('should update the floorplan service when the floorplan avatar opacity input is changed', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const overlayAvatarOpacityInput = elm.shadowRoot!.querySelector(
      'input#overlay-avatar-opacity',
    ) as HTMLInputElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setOverlayAvatarOpacity as Mock).mockClear();

    overlayAvatarOpacityInput.value = '0.5';
    overlayAvatarOpacityInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await elm.updateComplete;
    expect(floorplanService.setOverlayAvatarOpacity).toHaveBeenCalledWith(0.5);
    (floorplanService.setOverlayAvatarOpacity as Mock).mockClear();

    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    overlayAvatarOpacityInput.value = 'invalid';
    overlayAvatarOpacityInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await elm.updateComplete;

    expect(floorplanService.setOverlayAvatarOpacity).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('Invalid input for Overlay Avatar Opacity');
  });

  it('should update the floorplan service when the floorplan background color input is changed', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const floorplanBackgroundColorInput = elm.shadowRoot!.querySelector(
      'input#floorplan-background-color',
    ) as HTMLInputElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setFloorplanBackgroundColor as Mock).mockClear();

    floorplanBackgroundColorInput.value = '#ff0000';
    floorplanBackgroundColorInput.dispatchEvent(
      new Event('change', { bubbles: true, composed: true }),
    );
    await elm.updateComplete;
    expect(floorplanService.setFloorplanBackgroundColor).toHaveBeenCalledWith('#ff0000');
  });

  it('should update the floorplan service when the floorplan border color input is changed', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const floorplanBorderColorInput = elm.shadowRoot!.querySelector(
      'input#floorplan-border-color',
    ) as HTMLInputElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setFloorplanBorderColor as Mock).mockClear();

    floorplanBorderColorInput.value = '#00ff00';
    floorplanBorderColorInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    await elm.updateComplete;
    expect(floorplanService.setFloorplanBorderColor).toHaveBeenCalledWith('#00ff00');
  });

  it('should update the floorplan service when the floorplan avatar color input is changed', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const floorplanAvatarColorInput = elm.shadowRoot!.querySelector(
      'input#floorplan-avatar-color',
    ) as HTMLInputElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setFloorplanAvatarColor as Mock).mockClear();

    floorplanAvatarColorInput.value = '#0000ff';
    floorplanAvatarColorInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    await elm.updateComplete;
    expect(floorplanService.setFloorplanAvatarColor).toHaveBeenCalledWith('#0000ff');
  });

  it('should update the floorplan service when the floorplan avatar outline color input is changed', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const floorplanAvatarOutlineColorInput = elm.shadowRoot!.querySelector(
      'input#floorplan-avatar-outline-color',
    ) as HTMLInputElement;

    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setFloorplanAvatarOutlineColor as Mock).mockClear();

    floorplanAvatarOutlineColorInput.value = '#ffffff';
    floorplanAvatarOutlineColorInput.dispatchEvent(
      new Event('change', { bubbles: true, composed: true }),
    );
    await elm.updateComplete;
    expect(floorplanService.setFloorplanAvatarOutlineColor).toHaveBeenCalledWith('#ffffff');
  });

  it('should update the floorplan orientation when the select is changed', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const orientationSelect = elm.shadowRoot!.querySelector(
      'select#orientation',
    ) as HTMLSelectElement;

    const orientationSelectOptions = [
      ...elm.shadowRoot!.querySelectorAll('select#orientation > option'),
    ] as HTMLOptionElement[];

    const notSelected = orientationSelectOptions.find((option) => !option.selected)!;
    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setOrientation as Mock).mockClear();

    orientationSelect.value = notSelected.value;
    orientationSelect.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    await elm.updateComplete;
    expect(floorplanService.setOrientation).toHaveBeenCalledWith(notSelected.value);
  });

  it('should update the floorplan auto activation when the select is changed', async () => {
    await renderTemplate(
      html`<hoops-settings-interface-section></hoops-settings-interface-section>`,
    );

    const elm = document.querySelector(
      'hoops-settings-interface-section',
    ) as HoopsSettingsInterfaceSectionElement;
    await elm.updateComplete;

    const autoActivationSelect = elm.shadowRoot!.querySelector(
      'select#auto-activation',
    ) as HTMLSelectElement;

    const autoActivationSelectOptions = [
      ...elm.shadowRoot!.querySelectorAll('select#auto-activation > option'),
    ] as HTMLOptionElement[];

    const notSelected = autoActivationSelectOptions.find((option) => !option.selected)!;
    const floorplanService = getService<FloorplanServiceMock>('FloorplanService');
    (floorplanService.setAutoActivationMode as Mock).mockClear();

    notSelected.click();
    autoActivationSelect.value = notSelected.value;
    autoActivationSelect.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    await elm.updateComplete;
    expect(floorplanService.setAutoActivationMode).toHaveBeenCalledWith(notSelected.value);
  });
});
