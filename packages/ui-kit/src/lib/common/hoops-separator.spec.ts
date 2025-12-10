import { describe, it, expect } from 'vitest';
import { html } from 'lit';
import './hoops-separator';
import { Separator } from './hoops-separator';
import { renderTemplate, tick } from '../testing/utils';

describe('hoops-separator', () => {
  it('renders with default vertical direction', async () => {
    await renderTemplate(html`<hoops-separator></hoops-separator>`);
    const el = document.querySelector('hoops-separator') as Separator;
    expect(el).toBeTruthy();
    expect(el.direction).toBe('vertical');
    const hr = el.shadowRoot?.querySelector('hr');
    expect(hr).toBeTruthy();
    const classList = hr?.getAttribute('class') || '';
    expect(classList.includes('separator-vertical')).toBe(true);
  });

  it('renders with horizontal direction when set', async () => {
    await renderTemplate(html`<hoops-separator direction="horizontal"></hoops-separator>`);
    const el = document.querySelector('hoops-separator') as Separator;
    expect(el.direction).toBe('horizontal');
    const hr = el.shadowRoot?.querySelector('hr');
    const classList = hr?.getAttribute('class') || '';
    expect(classList.includes('separator-horizontal')).toBe(true);
    expect(classList.includes('separator-vertical')).toBe(false);
  });

  it('updates class when direction property changes dynamically', async () => {
    await renderTemplate(html`<hoops-separator></hoops-separator>`);
    const el = document.querySelector('hoops-separator') as Separator;
    el.direction = 'horizontal';
    await tick();
    const hr = el.shadowRoot?.querySelector('hr');
    const classList = hr?.getAttribute('class') || '';
    expect(classList.includes('separator-horizontal')).toBe(true);
  });
});
