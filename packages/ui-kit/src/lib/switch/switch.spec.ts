import { html } from 'lit';
import { describe, expect, it, vi } from 'vitest';
import { renderTemplate, tick } from '../testing/utils';
import './switch';
import { HoopsSwitchElement } from './switch';

describe('hoops-switch', () => {
  it('should render the switch element', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement = document.querySelector('hoops-switch')!;

    expect(switchElement).toBeTruthy();
    expect(switchElement.shadowRoot?.querySelector('.switch')).toBeTruthy();
    expect(switchElement.shadowRoot?.querySelector('.slider')).toBeTruthy();
  });

  it('should have default unchecked state', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;

    expect(switchElement.checked).toBe(false);
  });

  it('should have default disabled false', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;

    expect(switchElement.disabled).toBe(false);
  });

  it('should have default empty label', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;

    expect(switchElement.label).toBe('');
  });

  it('should accept checked attribute', async () => {
    await renderTemplate(html`<hoops-switch checked></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;

    expect(switchElement.checked).toBe(true);
  });

  it('should accept disabled attribute', async () => {
    await renderTemplate(html`<hoops-switch disabled></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;

    expect(switchElement.disabled).toBe(true);
  });

  it('should accept label attribute', async () => {
    await renderTemplate(html`<hoops-switch label="Toggle Feature"></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;

    expect(switchElement.label).toBe('Toggle Feature');
  });

  it('should set aria-label from label property', async () => {
    await renderTemplate(html`<hoops-switch label="Dark Mode"></hoops-switch>`);
    const switchElement = document.querySelector('hoops-switch')!;
    const switchLabel = switchElement.shadowRoot?.querySelector('[role="switch"]');

    expect(switchLabel?.getAttribute('aria-label')).toBe('Dark Mode');
  });

  it('should set title attribute from label property', async () => {
    await renderTemplate(html`<hoops-switch label="Enable Notifications"></hoops-switch>`);
    const switchElement = document.querySelector('hoops-switch')!;
    const switchLabel = switchElement.shadowRoot?.querySelector('[role="switch"]');

    expect(switchLabel?.getAttribute('title')).toBe('Enable Notifications');
  });

  it('should set aria-checked based on checked state', async () => {
    await renderTemplate(html`<hoops-switch checked></hoops-switch>`);
    const switchElement = document.querySelector('hoops-switch')!;
    const switchLabel = switchElement.shadowRoot?.querySelector('[role="switch"]');

    expect(switchLabel?.getAttribute('aria-checked')).toBe('true');
  });

  it('should update aria-checked when toggled', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;
    await switchElement.updateComplete;
    await tick();

    const switchLabel = switchElement.shadowRoot?.querySelector('[role="switch"]');

    expect(switchLabel?.getAttribute('aria-checked')).toBe('false');

    switchElement.checked = true;
    await switchElement.updateComplete;
    await tick();

    expect(switchLabel?.getAttribute('aria-checked')).toBe('true');
  });

  it('should emit change event when toggle() is called', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;
    await switchElement.updateComplete;
    await tick();

    let changeEventFired = false;

    switchElement.addEventListener('change', () => {
      changeEventFired = true;
    });

    const input = switchElement.shadowRoot?.querySelector('input') as HTMLInputElement;
    input?.click();
    await tick();

    expect(changeEventFired).toBe(true);
  });

  it('should toggle checked state on click', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;
    await switchElement.updateComplete;
    await tick();

    expect(switchElement.checked).toBe(false);

    const input = switchElement.shadowRoot?.querySelector('input') as HTMLInputElement;
    input?.click();
    await tick();

    expect(switchElement.checked).toBe(true);

    input?.click();
    await tick();

    expect(switchElement.checked).toBe(false);
  });

  it('should not toggle when disabled', async () => {
    await renderTemplate(html`<hoops-switch disabled></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;
    await switchElement.updateComplete;
    await tick();

    let changeEventFired = false;

    switchElement.addEventListener('change', () => {
      changeEventFired = true;
    });

    const input = switchElement.shadowRoot?.querySelector('input') as HTMLInputElement;
    input?.click();
    await tick();

    expect(switchElement.checked).toBe(false);
    expect(changeEventFired).toBe(false);
  });

  it('should have disabled class on slider when disabled', async () => {
    await renderTemplate(html`<hoops-switch disabled></hoops-switch>`);
    const switchElement = document.querySelector('hoops-switch')!;
    const slider = switchElement.shadowRoot?.querySelector('.slider');

    expect(slider?.classList.contains('disabled')).toBe(true);
  });

  it('should not have disabled class on slider when not disabled', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement = document.querySelector('hoops-switch')!;
    const slider = switchElement.shadowRoot?.querySelector('.slider');

    expect(slider?.classList.contains('disabled')).toBe(false);
  });

  it('should update disabled class when disabled property changes', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;
    await switchElement.updateComplete;
    await tick();

    const slider = switchElement.shadowRoot?.querySelector('.slider');

    expect(slider?.classList.contains('disabled')).toBe(false);

    switchElement.disabled = true;
    await switchElement.updateComplete;
    await tick();

    expect(slider?.classList.contains('disabled')).toBe(true);
  });

  it('should have role switch on label', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement = document.querySelector('hoops-switch')!;
    const switchLabel = switchElement.shadowRoot?.querySelector('[role="switch"]');

    expect(switchLabel?.getAttribute('role')).toBe('switch');
  });

  it('should set input checked attribute', async () => {
    await renderTemplate(html`<hoops-switch checked></hoops-switch>`);
    const switchElement = document.querySelector('hoops-switch')!;
    const input = switchElement.shadowRoot?.querySelector('input') as HTMLInputElement;

    expect(input?.checked).toBe(true);
  });

  it('should set input disabled attribute', async () => {
    await renderTemplate(html`<hoops-switch disabled></hoops-switch>`);
    const switchElement = document.querySelector('hoops-switch')!;
    const input = switchElement.shadowRoot?.querySelector('input') as HTMLInputElement;

    expect(input?.disabled).toBe(true);
  });

  it('should reflect checked property to input element', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;
    await switchElement.updateComplete;
    await tick();

    const input = switchElement.shadowRoot?.querySelector('input') as HTMLInputElement;

    expect(input?.checked).toBe(false);

    switchElement.checked = true;
    await switchElement.updateComplete;
    await tick();

    expect(input?.checked).toBe(true);
  });

  it('should update input disabled when disabled property changes', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;
    await switchElement.updateComplete;
    await tick();

    const input = switchElement.shadowRoot?.querySelector('input') as HTMLInputElement;

    expect(input?.disabled).toBe(false);

    switchElement.disabled = true;
    await switchElement.updateComplete;
    await tick();

    expect(input?.disabled).toBe(true);
  });

  it('should stop propagation on label click', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;
    await switchElement.updateComplete;
    await tick();

    const switchLabel = switchElement.shadowRoot?.querySelector('.switch') as HTMLElement;
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

    switchLabel?.dispatchEvent(clickEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should stop propagation on input change', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;
    await switchElement.updateComplete;
    await tick();

    const input = switchElement.shadowRoot?.querySelector('input') as HTMLInputElement;
    const changeEvent = new Event('change', { bubbles: true });
    const stopPropagationSpy = vi.spyOn(changeEvent, 'stopPropagation');

    input?.dispatchEvent(changeEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should support checked and unchecked toggle', async () => {
    await renderTemplate(html`<hoops-switch checked></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;
    await switchElement.updateComplete;
    await tick();

    expect(switchElement.checked).toBe(true);

    switchElement.checked = false;
    await switchElement.updateComplete;
    await tick();

    expect(switchElement.checked).toBe(false);

    switchElement.checked = true;
    await switchElement.updateComplete;
    await tick();

    expect(switchElement.checked).toBe(true);
  });

  it('should render with all properties set', async () => {
    await renderTemplate(html`<hoops-switch checked disabled label="Test Switch"></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;

    expect(switchElement.checked).toBe(true);
    expect(switchElement.disabled).toBe(true);
    expect(switchElement.label).toBe('Test Switch');
  });

  it('should emit only one change event per toggle', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement: HoopsSwitchElement = document.querySelector('hoops-switch')!;
    await switchElement.updateComplete;
    await tick();

    let changeEventCount = 0;

    switchElement.addEventListener('change', () => {
      changeEventCount++;
    });

    const input = switchElement.shadowRoot?.querySelector('input') as HTMLInputElement;
    input?.click();
    await tick();

    expect(changeEventCount).toBe(1);
  });

  it('should have input of type checkbox', async () => {
    await renderTemplate(html`<hoops-switch></hoops-switch>`);
    const switchElement = document.querySelector('hoops-switch')!;
    const input = switchElement.shadowRoot?.querySelector('input') as HTMLInputElement;

    expect(input?.type).toBe('checkbox');
  });
});
