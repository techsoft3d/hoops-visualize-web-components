import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, queryAll } from 'lit/decorators.js';

/**
 * A custom web component that provides a coordinate input interface with both
 * numeric input and range slider controls for editing coordinate values.
 *
 * This component renders a labeled input control that consists of:
 * - A text label
 * - A numeric input field
 * - A range slider
 *
 * Both input controls are kept in sync and allow users to modify coordinate
 * values either by typing precise values or using the slider for approximate adjustments.
 *
 * @element hoops-coordinate-input
 * @fires hoops-coordinate-changed - Dispatched when the coordinate value changes
 *
 * @example
 * ```html
 * <hoops-coordinate-input
 *   label="X"
 *   value="10.5"
 *   min="0"
 *   max="100"
 *   @hoops-coordinate-changed=${this.handleCoordinateChange}>
 * </hoops-coordinate-input>
 * ```
 *
 * @example
 * ```typescript
 * // Listening to coordinate changes
 * element.addEventListener('hoops-coordinate-changed', (event) => {
 *   console.log(`${event.detail.label}: ${event.detail.value}`);
 * });
 * ```
 */
@customElement('hoops-coordinate-input')
export class HoopsCoordinateInputElement extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      div {
        display: grid;
        grid-template-columns: 1rem 4rem auto;
        align-items: center;
        gap: 0.5rem;
      }

      label {
        text-align: center;
      }

      input[type='number'] {
        width: 4rem;
      }
    `,
  ];

  /**
   * The display label for this coordinate input (e.g., "X", "Y", "Z").
   * This label appears before the input controls and is also included
   * in the change event details.
   */
  @property({ type: String }) label: string;

  /**
   * The current numeric value of the coordinate.
   * This value is displayed in both the numeric input and range slider,
   * and is formatted to 2 decimal places for display.
   */
  @property({ type: Number }) value: number;

  /**
   * The minimum allowed value for the coordinate.
   * This constrains both the numeric input and range slider.
   */
  @property({ type: Number }) min: number;

  /**
   * The maximum allowed value for the coordinate.
   * This constrains both the numeric input and range slider.
   */
  @property({ type: Number }) max: number;

  @queryAll('input') private _inputs!: NodeListOf<HTMLInputElement>;

  /**
   * Constructs a new HoopsCoordinateInputElement with default values.
   *
   * Initializes the component with:
   * - Empty label
   * - Value of 0
   * - Min value of 0
   * - Max value of 100
   */
  constructor() {
    super();
    this.label = '';
    this.value = 0;
    this.min = 0;
    this.max = 100;
  }

  /**
   * Lifecycle method called when the element's properties change.
   *
   * This override ensures that both input controls (numeric and range)
   * stay synchronized with the current value property. This is necessary
   * because external updates to the value property may not trigger a
   * re-render of the input elements if they already contain the same value.
   *
   * @param changedProperties - Map of changed properties and their previous values
   *
   * @example
   * ```typescript
   * // When value is updated externally, both inputs will reflect the new value
   * element.value = 42.5; // Both numeric input and slider will show 42.50
   * ```
   */
  protected update(changedProperties: PropertyValues): void {
    super.update(changedProperties);

    /**
     * Keep both inputs in sync when value property changes.
     *
     * Since the value can be updated from outside while the
     * internal state of the inputs remain the same,
     * we need to manually update the input values here.
     *
     * For example, when you edit the value via one of the inputs it will
     * dispatch an event. If the parent component listens to that event and
     * updates the value property to the same value as before the input changed
     * it will consider that the value property is unchanged and will not
     * re-render the inputs.
     */
    this._inputs.forEach((input) => {
      input.value = this.formattedValue;
    });
  }

  /**
   * Gets the current value formatted as a string with 2 decimal places.
   *
   * This formatter ensures consistent display across both input controls
   * and provides a standardized precision for coordinate values.
   *
   * @returns The formatted value string (e.g., "10.50", "0.00", "-5.25")
   *
   * @example
   * ```typescript
   * element.value = 10.5;
   * console.log(element.formattedValue); // "10.50"
   *
   * element.value = 0;
   * console.log(element.formattedValue); // "0.00"
   * ```
   */
  private get formattedValue(): string {
    return this.value.toFixed(2);
  }

  /**
   * Renders the coordinate input component template.
   *
   * Creates a layout with three columns:
   * 1. Label (1rem width)
   * 2. Numeric input (4rem width)
   * 3. Range slider (auto width)
   *
   * Both input controls share the same value, constraints, and change handler
   * to ensure they remain synchronized.
   *
   * @returns TemplateResult containing the component's HTML structure
   */
  render() {
    const value = this.formattedValue;

    return html`<div>
      <label>${this.label}:</label>
      <input
        type="number"
        .value=${value}
        min=${this.min}
        max=${this.max}
        step="0.01"
        @change=${(e: Event) => this.onChange(parseFloat((e.target as HTMLInputElement).value))}
      />
      <input
        type="range"
        .value=${value}
        min=${this.min}
        max=${this.max}
        step="0.01"
        @change=${(e: Event) => this.onChange(parseFloat((e.target as HTMLInputElement).value))}
      />
    </div>`;
  }

  /**
   * Handles value changes from either the numeric input or range slider.
   *
   * When either input control changes, this method dispatches a custom
   * 'hoops-coordinate-changed' event with the new value and the coordinate
   * label in the event detail.
   *
   * @param value - The new numeric value from the input control
   *
   * @fires hoops-coordinate-changed - Custom event containing the label and new value
   *
   * @internal
   */
  private onChange(value: number) {
    this.dispatchEvent(
      new CustomEvent<{ label: string; value: number }>('hoops-coordinate-changed', {
        detail: { label: this.label, value },
      }),
    );
  }
}
