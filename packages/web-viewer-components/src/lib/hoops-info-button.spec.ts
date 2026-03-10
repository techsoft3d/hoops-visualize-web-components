import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { renderTemplate, tick } from './testing/utils';
import './hoops-info-button';
import { InfoButton } from './hoops-info-button';

describe('hoops-info-button', () => {
  it('should render the info button element', async () => {
    await renderTemplate(html`<hoops-info-button></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;

    expect(button).toBeTruthy();
    expect(button.shadowRoot?.querySelector('hoops-icon-button')).toBeTruthy();
  });

  it('should have default tabindex of 0', async () => {
    await renderTemplate(html`<hoops-info-button></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;

    expect(button.tabindex).toBe('0');
    expect(button.getAttribute('tabindex')).toBe('0');
  });

  it('should have default role of button', async () => {
    await renderTemplate(html`<hoops-info-button></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;

    expect(button.role).toBe('button');
    expect(button.getAttribute('role')).toBe('button');
  });

  it('should have default size of md', async () => {
    await renderTemplate(html`<hoops-info-button></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;

    expect(button.size).toBe('md');
  });

  it('should have default color of default', async () => {
    await renderTemplate(html`<hoops-info-button></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;

    expect(button.color).toBe('default');
  });

  it('should accept custom tabindex attribute', async () => {
    await renderTemplate(html`<hoops-info-button tabindex="2"></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;

    expect(button.tabindex).toBe('2');
    expect(button.getAttribute('tabindex')).toBe('2');
  });

  it('should accept custom role attribute', async () => {
    await renderTemplate(html`<hoops-info-button role="menuitem"></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;

    expect(button.role).toBe('menuitem');
    expect(button.getAttribute('role')).toBe('menuitem');
  });

  it('should accept custom size attribute', async () => {
    await renderTemplate(html`<hoops-info-button size="lg"></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;

    expect(button.size).toBe('lg');
  });

  it('should accept accent color attribute', async () => {
    await renderTemplate(html`<hoops-info-button color="accent"></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;

    expect(button.color).toBe('accent');
  });

  it('should pass properties to hoops-icon-button', async () => {
    await renderTemplate(
      html`<hoops-info-button
        tabindex="3"
        role="menuitem"
        size="sm"
        color="accent"
      ></hoops-info-button>`,
    );
    const button = document.querySelector('hoops-info-button') as InfoButton;
    await button.updateComplete;
    await tick();

    const iconButton = button.shadowRoot?.querySelector('hoops-icon-button');
    expect(iconButton).toBeTruthy();
    expect(iconButton?.getAttribute('tabindex')).toBe('3');
    expect(iconButton?.getAttribute('role')).toBe('menuitem');
    expect(iconButton?.getAttribute('size')).toBe('sm');
    expect(iconButton?.getAttribute('color')).toBe('accent');
  });

  it('should update hoops-icon-button when properties change', async () => {
    await renderTemplate(html`<hoops-info-button></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;
    await button.updateComplete;

    button.size = 'lg';
    button.color = 'accent';
    await button.updateComplete;
    await tick();

    const iconButton = button.shadowRoot?.querySelector('hoops-icon-button');
    expect(iconButton?.getAttribute('size')).toBe('lg');
    expect(iconButton?.getAttribute('color')).toBe('accent');
  });

  it('should render info icon inside hoops-icon-button', async () => {
    await renderTemplate(html`<hoops-info-button></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;
    await button.updateComplete;

    const iconButton = button.shadowRoot?.querySelector('hoops-icon-button');
    expect(iconButton).toBeTruthy();
    expect(iconButton?.innerHTML).toContain('svg');
  });

  it('should reflect tabindex property', async () => {
    await renderTemplate(html`<hoops-info-button></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;

    button.tabindex = '5';
    await button.updateComplete;

    expect(button.getAttribute('tabindex')).toBe('5');
  });

  it('should reflect role property', async () => {
    await renderTemplate(html`<hoops-info-button></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;

    button.role = 'link';
    await button.updateComplete;

    expect(button.getAttribute('role')).toBe('link');
  });

  it.each([['sm'], ['md'], ['lg']])('should support multiple size values', async (size) => {
    await renderTemplate(html`<hoops-info-button size=${size}></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;
    await button.updateComplete;

    expect(button.size).toBe(size);
    const iconButton = button.shadowRoot?.querySelector('hoops-icon-button');
    expect(iconButton?.getAttribute('size')).toBe(size);
  });

  it.each([['default'], ['accent']])('should support default and accent colors', async (color) => {
    await renderTemplate(html`<hoops-info-button color=${color as any}></hoops-info-button>`);
    const button = document.querySelector('hoops-info-button') as InfoButton;
    await button.updateComplete;

    expect(button.color).toBe(color);
    const iconButton = button.shadowRoot?.querySelector('hoops-icon-button');
    expect(iconButton?.getAttribute('color')).toBe(color);
  });
});
