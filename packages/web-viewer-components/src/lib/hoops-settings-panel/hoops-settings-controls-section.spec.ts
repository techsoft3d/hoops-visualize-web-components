import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { html } from 'lit';

import { HoopsSettingsControlsSectionElement } from './hoops-settings-controls-section';
import { renderTemplate } from '../testing/utils';

import './hoops-settings-controls-section';
import { getService, ISpaceMouseService, registerService } from '../services';
import { WalkOperatorServiceMock } from '../../mocks/WalkOperatorServiceMock';
import { IWalkOperatorService } from '../services/walk-operator/types';

describe('HoopsSettingsControlsSectionElement', () => {
  beforeAll(() => {
    registerService(new WalkOperatorServiceMock(vi.fn));
    registerService({
      serviceName: 'SpaceMouseService',
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      removeEventListener: vi.fn(),
      connect: vi.fn(),
    } as ISpaceMouseService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the controls section', async () => {
    await renderTemplate(html`<hoops-settings-controls-section></hoops-settings-controls-section>`);

    const elm = document.querySelector(
      'hoops-settings-controls-section',
    ) as HoopsSettingsControlsSectionElement;
    await elm.updateComplete;

    expect(elm).toBeInstanceOf(HoopsSettingsControlsSectionElement);
  });

  it('should render walk mode select with correct value', async () => {
    await renderTemplate(html`<hoops-settings-controls-section></hoops-settings-controls-section>`);

    const elm = document.querySelector(
      'hoops-settings-controls-section',
    ) as HoopsSettingsControlsSectionElement;
    await elm.updateComplete;

    const select = elm.shadowRoot?.querySelector('select#walk-move-select') as HTMLSelectElement;
    expect(select.value).toBe('Mouse');

    const service = getService<IWalkOperatorService>('WalkOperatorService');
    expect(service.getWalkMode()).toBe('Mouse');
    service.setWalkMode('Keyboard');
    await elm.updateComplete;
    expect(select.value).toBe('Keyboard');
  });

  it('should update walkMode when select changes', async () => {
    await renderTemplate(html`<hoops-settings-controls-section></hoops-settings-controls-section>`);
    const elm = document.querySelector(
      'hoops-settings-controls-section',
    ) as HoopsSettingsControlsSectionElement;
    await elm.updateComplete;
    const select = elm.shadowRoot?.querySelector('select#walk-move-select') as HTMLSelectElement;
    select.value = 'Keyboard';
    select.dispatchEvent(new Event('change'));
    await elm.updateComplete;
    expect(getService<IWalkOperatorService>('WalkOperatorService').getWalkMode()).toBe('Keyboard');
  });

  it('should disable navigation group when walkMode is not Keyboard', async () => {
    const walkOperatorService = getService<IWalkOperatorService>('WalkOperatorService');
    walkOperatorService.setWalkMode('Mouse');

    await renderTemplate(html`<hoops-settings-controls-section></hoops-settings-controls-section>`);
    const elm = document.querySelector(
      'hoops-settings-controls-section',
    ) as HoopsSettingsControlsSectionElement;
    await elm.updateComplete;
    const navGroup = elm.shadowRoot?.querySelector('.navigation-group') as HTMLElement;
    expect(navGroup.classList.contains('disabled')).toBe(true);
    expect(navGroup.getAttribute('title')).toBe('Keyboard mode is not enabled');
  });

  it('should enable navigation group when walkMode is Keyboard', async () => {
    const walkOperatorService = getService<IWalkOperatorService>('WalkOperatorService');
    walkOperatorService.setWalkMode('Keyboard');

    await renderTemplate(html`<hoops-settings-controls-section></hoops-settings-controls-section>`);
    const elm = document.querySelector(
      'hoops-settings-controls-section',
    ) as HoopsSettingsControlsSectionElement;
    await elm.updateComplete;
    const navGroup = elm.shadowRoot?.querySelector('.navigation-group') as HTMLElement;
    expect(navGroup.classList.contains('disabled')).toBe(false);
    expect(navGroup.getAttribute('title')).toBeNull();
  });

  it('should render all input fields with correct default values', async () => {
    await renderTemplate(html`<hoops-settings-controls-section></hoops-settings-controls-section>`);
    const elm = document.querySelector(
      'hoops-settings-controls-section',
    ) as HoopsSettingsControlsSectionElement;
    await elm.updateComplete;
    const inputs = elm.shadowRoot?.querySelectorAll('input[type="number"]');
    expect(inputs?.[0]).toHaveProperty('value', '40');
    expect(inputs?.[1]).toHaveProperty('value', '1.0');
    expect(inputs?.[2]).toHaveProperty('value', '1.0');
    expect(inputs?.[3]).toHaveProperty('value', '90');
    expect(inputs?.[4]).toHaveProperty('value', '1');
  });

  it('should render hoops-switch elements', async () => {
    await renderTemplate(html`<hoops-settings-controls-section></hoops-settings-controls-section>`);
    const elm = document.querySelector(
      'hoops-settings-controls-section',
    ) as HoopsSettingsControlsSectionElement;
    await elm.updateComplete;
    const switches = elm.shadowRoot?.querySelectorAll('hoops-switch');
    expect(switches?.length).toBe(2);
    expect(switches?.[0]?.getAttribute('label')).toBe('Enable Mouse Look');
    expect(switches?.[1]?.getAttribute('label')).toBe('Enable Collision Detection');
  });

  it('should apply disabled class to mouse look and speed fields when not in Keyboard mode', async () => {
    const walkOperatorService = getService<IWalkOperatorService>('WalkOperatorService');
    walkOperatorService.setWalkMode('Mouse');

    await renderTemplate(html`<hoops-settings-controls-section></hoops-settings-controls-section>`);
    const elm = document.querySelector(
      'hoops-settings-controls-section',
    ) as HoopsSettingsControlsSectionElement;
    await elm.updateComplete;
    const mouseLook = elm.shadowRoot?.querySelector('[data-testid="enable-mouse-look-row"]');
    const speedDiv = elm.shadowRoot?.querySelector('[data-testid="speed-row"]');
    expect(mouseLook?.classList.contains('disabled')).toBe(true);
    expect(speedDiv?.classList.contains('disabled')).toBe(true);
  });

  it('should not apply disabled class to mouse look and speed fields when in Keyboard mode', async () => {
    const walkOperatorService = getService<IWalkOperatorService>('WalkOperatorService');
    walkOperatorService.setWalkMode('Keyboard');

    await renderTemplate(html`<hoops-settings-controls-section></hoops-settings-controls-section>`);
    const elm = document.querySelector(
      'hoops-settings-controls-section',
    ) as HoopsSettingsControlsSectionElement;
    await elm.updateComplete;
    const mouseLook = elm.shadowRoot?.querySelector('[data-testid="enable-mouse-look-row"]');
    expect(mouseLook).toBeTruthy();
    const speedDiv = elm.shadowRoot?.querySelector('[data-testid="speed-row"]');
    expect(speedDiv).toBeTruthy();
    expect(mouseLook?.classList.contains('disabled')).toBe(false);
    expect(speedDiv?.classList.contains('disabled')).toBe(false);
  });
});
