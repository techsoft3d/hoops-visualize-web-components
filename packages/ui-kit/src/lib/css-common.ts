import { css } from 'lit';

/**
 * This CSS Fragment is used to share common CSS properties between all our
 * components.
 *
 * @type {CSSResult}
 */
export const componentBaseStyle = css`
  :host {
    display: block;
    color: var(--hoops-neutral-foreground, #303030);
    stroke: var(--hoops-neutral-foreground, #303030);
    box-sizing: border-box;
  }

  :host * {
    box-sizing: border-box;
  }
`;
