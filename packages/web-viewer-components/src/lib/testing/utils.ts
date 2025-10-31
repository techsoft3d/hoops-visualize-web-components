import { render, TemplateResult } from 'lit';

export function renderTemplate(template: TemplateResult) {
  render(template, document.body);
  return tick();
}

export function tick() {
  return new Promise((ok) => setTimeout(ok.bind(undefined))); // wait for the event loop to flush tasks
}
