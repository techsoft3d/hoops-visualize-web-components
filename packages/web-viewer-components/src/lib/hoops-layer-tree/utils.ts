import { html, HTMLTemplateResult, nothing } from 'lit';
import { layers, meshCubeIcon, rightIcon, downIcon } from '@ts3d-hoops/ui-kit/icons';

/**
 * Provide the layers icon.
 *
 * @export
 * @returns {(HTMLTemplateResult | typeof nothing)}
 */
export function formatLayersIcon(): HTMLTemplateResult | typeof nothing {
  return html`${layers}`;
}

/**
 * Provide the node icon.
 *
 * @export
 * @returns {(HTMLTemplateResult | typeof nothing)}
 */
export function formatNodeIcon(): HTMLTemplateResult | typeof nothing {
  return html`${meshCubeIcon}`;
}

/**
 * Provide the right arrow icon.
 *
 * @export
 * @returns {(HTMLTemplateResult | typeof nothing)}
 */
export function rightArrowIcon(): HTMLTemplateResult | typeof nothing {
  return html`${rightIcon}`;
}

/**
 * Provide the down arrow icon.
 *
 * @export
 * @returns {(HTMLTemplateResult | typeof nothing)}
 */
export function downArrowIcon(): HTMLTemplateResult | typeof nothing {
  return html`${downIcon}`;
}
