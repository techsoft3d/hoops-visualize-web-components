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
    color: var(--hoops-neutral-foreground);
    stroke: var(--hoops-neutral-foreground);
    font-family: var(--hoops-body-font);
    box-sizing: border-box;
  }

  :host * {
    box-sizing: border-box;
  }
`;
