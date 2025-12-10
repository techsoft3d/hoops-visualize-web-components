import { describe, it, expect } from 'vitest';
import { html } from 'lit';
import './hoops-coordinate-input';
import { HoopsCoordinateInputElement } from './hoops-coordinate-input';
import { renderTemplate, tick } from '../testing/utils';

describe('hoops-coordinate-input', () => {
  it('renders with default properties', async () => {
    await renderTemplate(html`<hoops-coordinate-input></hoops-coordinate-input>`);
    const el = document.querySelector('hoops-coordinate-input') as HoopsCoordinateInputElement;
    expect(el).toBeTruthy();
    expect(el.label).toBe('');
    expect(el.value).toBe(0);
    expect(el.min).toBe(0);
    expect(el.max).toBe(100);
    const numberInput = el.shadowRoot?.querySelector('input[type=number]') as HTMLInputElement;
    const rangeInput = el.shadowRoot?.querySelector('input[type=range]') as HTMLInputElement;
    expect(numberInput).toBeTruthy();
    expect(rangeInput).toBeTruthy();
    expect(numberInput.min).toBe('0');
    expect(rangeInput.max).toBe('100');
  });

  it('reflects label, min, max, and value properties to inputs', async () => {
    await renderTemplate(
      html`<hoops-coordinate-input label="X" min="-5" max="5"></hoops-coordinate-input>`,
    );
    const el = document.querySelector('hoops-coordinate-input') as HoopsCoordinateInputElement;
    el.value = 2.5;
    await tick();
    const numberInput = el.shadowRoot?.querySelector('input[type=number]') as HTMLInputElement;
    const rangeInput = el.shadowRoot?.querySelector('input[type=range]') as HTMLInputElement;
    expect(numberInput.min).toBe('-5');
    expect(rangeInput.max).toBe('5');
    // value is randomized slightly in render; assert numeric closeness
    expect(parseFloat(numberInput.value)).toBeGreaterThanOrEqual(2.5);
    expect(parseFloat(numberInput.value)).toBeLessThan(2.6);
    expect(parseFloat(rangeInput.value)).toBeGreaterThanOrEqual(2.5);
    expect(parseFloat(rangeInput.value)).toBeLessThan(2.6);
    const labelEl = el.shadowRoot?.querySelector('label');
    expect(labelEl?.textContent).toBe('X:');
  });

  it('emits hoops-coordinate-changed on number input change', async () => {
    await renderTemplate(
      html`<hoops-coordinate-input label="Y" value="1"></hoops-coordinate-input>`,
    );
    const el = document.querySelector('hoops-coordinate-input') as HoopsCoordinateInputElement;
    const numberInput = el.shadowRoot?.querySelector('input[type=number]') as HTMLInputElement;
    const newVal = '3.25';
    const promise = new Promise<number>((resolve) => {
      el.addEventListener('hoops-coordinate-changed', (e: Event) => {
        const detail = (e as CustomEvent).detail as { label: string; value: number };
        expect(detail.label).toBe('Y');
        resolve(detail.value);
      });
    });
    numberInput.value = newVal;
    numberInput.dispatchEvent(new Event('change'));
    await tick();
    expect(promise).resolves.toBe(parseFloat(newVal));
  });

  it('emits hoops-coordinate-changed on range input change', async () => {
    await renderTemplate(
      html`<hoops-coordinate-input label="Z" value="2"></hoops-coordinate-input>`,
    );
    const el = document.querySelector('hoops-coordinate-input') as HoopsCoordinateInputElement;
    const rangeInput = el.shadowRoot?.querySelector('input[type=range]') as HTMLInputElement;
    const newVal = '4.50';
    const promise = new Promise<number>((resolve) => {
      el.addEventListener('hoops-coordinate-changed', (e: Event) => {
        const detail = (e as CustomEvent).detail as { label: string; value: number };
        expect(detail.label).toBe('Z');
        resolve(detail.value);
      });
    });
    rangeInput.value = newVal;
    rangeInput.dispatchEvent(new Event('change'));
    await tick();
    expect(promise).resolves.toBe(parseFloat(newVal));
  });

  it('multiple changes emit events each time', async () => {
    await renderTemplate(
      html`<hoops-coordinate-input label="M" value="0"></hoops-coordinate-input>`,
    );
    const el = document.querySelector('hoops-coordinate-input') as HoopsCoordinateInputElement;
    const numberInput = el.shadowRoot?.querySelector('input[type=number]') as HTMLInputElement;
    let count = 0;
    el.addEventListener('hoops-coordinate-changed', () => count++);
    numberInput.value = '1.00';
    numberInput.dispatchEvent(new Event('change'));
    numberInput.value = '2.00';
    numberInput.dispatchEvent(new Event('change'));
    await tick();
    expect(count).toBe(2);
  });
});
