import { css } from 'lit';

export const panelStyles = css`
  .settings-root {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0.5rem;
  }

  .settings-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .settings-subgroup {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-left: 1rem;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 1.4rem;
  }

  label {
    text-align: left;
    height: 1.4rem;
  }

  label.disabled {
    opacity: 0.6;
  }

  .setting-row select,
  .setting-row input,
  .setting-row hoops-switch {
    justify-self: flex-end;
  }

  .setting-row input {
    width: 3.75rem;
  }

  .setting-row-group {
    display: flex;
    gap: 0.5rem;
  }

  input[type='color'] {
    width: 1.75rem;
    height: 1.4rem;
  }

  span.color {
    font-family: monospace;
    align-self: center;
  }

  .setting-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span.setting-label {
    display: inline-block;
  }

  span.color.disabled,
  .setting-label.disabled,
  .navigation-group.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  fieldset {
    min-width: 10rem;
  }
`;
