import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import './hoops-ifc-relationship';
import { HoopsIFCRelationshipElement } from './hoops-ifc-relationship';
import { RelationshipData, RelatedElementInfo } from '../services/ifc-relationships/types';

// Mock the service registry and getService function
const mockService = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  selectNode: vi.fn(),
  serviceName: 'IFCRelationshipsService',
  selectionRelationships: [],
};

vi.mock('../services', () => ({
  getService: vi.fn(() => mockService),
}));

// Mock hoops-button and hoops-icon components
vi.mock('@ts3d-hoops/ui-kit/button', () => ({
  default: 'hoops-button',
}));
vi.mock('@ts3d-hoops/ui-kit/icon', () => ({
  default: 'hoops-icon',
}));

// Test data fixtures
const createRelationshipData = (
  typeName: string,
  elements: RelatedElementInfo[],
): RelationshipData => ({
  type: 1,
  typeName,
  elements,
});

const createRelatedElement = (
  name: string,
  role: 'related' | 'relating',
  nodeId?: number,
  bimId?: string,
): RelatedElementInfo => ({
  name,
  role,
  bimId: bimId || `${name}_BIM`,
  connected: true,
  nodeId,
});

describe('HoopsIFCRelationshipElement', () => {
  let element: HoopsIFCRelationshipElement;

  beforeEach(async () => {
    vi.clearAllMocks();
    element = document.createElement('hoops-ifc-relationship') as HoopsIFCRelationshipElement;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  it('renders empty state with section title and no relationships', async () => {
    // Verify initial empty state rendering
    const shadowRoot = element.shadowRoot;
    expect(shadowRoot?.querySelector('.section-title')).toBeTruthy();
    expect(shadowRoot?.querySelector('.section-title')?.textContent).toBe('Relationships');

    // Verify no relationship items are rendered initially
    const relationshipItems = shadowRoot?.querySelectorAll('.relationship-item');
    expect(relationshipItems).toHaveLength(0);
  });

  it('renders relationships with correct headers, counts, and expand/collapse functionality', async () => {
    // Test data setup for rendering verification
    const mockRelationships = [
      createRelationshipData('IfcRelAssignsToGroup', [
        createRelatedElement('Wall_001', 'related', 123, 'WALL_001'),
        createRelatedElement('Door_002', 'relating', 456, 'DOOR_002'),
      ]),
      createRelationshipData('IfcRelContainedInSpatialStructure', [
        createRelatedElement('Floor_003', 'related', 789, 'FLOOR_003'),
      ]),
    ];

    // Simulate service event to update relationships
    element.selectionRelationships = mockRelationships;
    element.requestUpdate();
    await element.updateComplete;

    // Verify relationship headers with correct counts
    const shadowRoot = element.shadowRoot;
    const relationshipHeaders = shadowRoot?.querySelectorAll('.relationship-header');
    expect(relationshipHeaders).toHaveLength(2);

    const firstHeader = relationshipHeaders?.[0];
    const secondHeader = relationshipHeaders?.[1];
    expect(firstHeader?.textContent).toContain('IfcRelAssignsToGroup (2)');
    expect(secondHeader?.textContent).toContain('IfcRelContainedInSpatialStructure (1)');

    // Test expand/collapse interaction
    const firstToggle = firstHeader?.querySelector('.relationship-toggle hoops-icon');
    expect(firstToggle?.getAttribute('icon')).toBe('rightIcon');

    (firstHeader as HTMLElement)?.click();
    await element.updateComplete;

    // Verify expand/collapse state changes correctly
    expect(element.isRelationshipExpanded('IfcRelAssignsToGroup')).toBe(true);
    expect(firstToggle?.getAttribute('icon')).toBe('downIcon');

    // Verify relationship content is expanded and elements are rendered
    const expandedContent = shadowRoot?.querySelector('.relationship-content.expanded');
    expect(expandedContent).toBeTruthy();

    const buttons = expandedContent?.querySelectorAll('hoops-button');
    expect(buttons).toHaveLength(2);

    // Verify button content includes icons and element details
    const firstButton = buttons?.[0];
    expect(firstButton?.textContent).toContain('Wall_001');
    expect(firstButton?.textContent).toContain('WALL_001');
    expect(firstButton?.innerHTML).toContain('icon-arrow-left');
  });

  it('handles service interactions and button states correctly', async () => {
    // Set up test data with valid nodeId for interaction testing
    const mockRelationships = [
      createRelationshipData('IfcRelAssignsToGroup', [
        createRelatedElement('Wall_001', 'related', 123, 'WALL_001'),
      ]),
    ];

    // Initialize component with test data
    element.selectionRelationships = mockRelationships;
    element.requestUpdate();
    await element.updateComplete;

    // Expand relationship to show buttons
    const header = element.shadowRoot?.querySelector('.relationship-header') as HTMLElement;
    header?.click();
    await element.updateComplete;

    // Test button click interaction - valid nodeId should trigger service call
    const button = element.shadowRoot?.querySelector('hoops-button') as HTMLElement;
    button?.click();
    expect(mockService.selectNode).toHaveBeenCalledWith(123);

    // Test disabled state - button without nodeId should be disabled
    const disabledElement = createRelatedElement(
      'Invalid_Element',
      'related',
      undefined,
      undefined,
    );
    element.selectionRelationships = [createRelationshipData('TestType', [disabledElement])];
    element.requestUpdate();
    await element.updateComplete;

    const disabledButton = element.shadowRoot?.querySelector('hoops-button[disabled]');
    expect(disabledButton).toBeTruthy();
  });

  it('handles service lifecycle and error conditions correctly', async () => {
    // Test service initialization on firstUpdated
    element.firstUpdated();

    // Verify service event listener setup
    expect(mockService.addEventListener).toHaveBeenCalledWith(
      'hoops-selection-ifc-relationships-changed',
      expect.any(Function),
    );

    // Test event handler updates selectionRelationships by simulating service event
    const testData = [createRelationshipData('TestType', [])];
    element.selectionRelationships = testData;
    element.requestUpdate();
    await element.updateComplete;

    expect(element.selectionRelationships).toBe(testData);

    // Test cleanup on disconnect
    element.disconnectedCallback();
    expect(mockService.removeEventListener).toHaveBeenCalledWith(
      'hoops-selection-ifc-relationships-changed',
      expect.any(Function),
    );

    // Test error handling - missing nodeId should not crash
    const event = new MouseEvent('click');
    const invalidRelationship = createRelatedElement('Invalid', 'related', undefined);

    element.handleButtonClick(event, invalidRelationship);
    expect(mockService.selectNode).not.toHaveBeenCalled();
  });

  it('applies no-anim class when noAnim property is set', async () => {
    // Create component with noAnim property
    const animatedElement = document.createElement(
      'hoops-ifc-relationship',
    ) as HoopsIFCRelationshipElement;
    const noAnimElement = document.createElement(
      'hoops-ifc-relationship',
    ) as HoopsIFCRelationshipElement;
    noAnimElement.noAnim = true;

    document.body.appendChild(animatedElement);
    document.body.appendChild(noAnimElement);
    await animatedElement.updateComplete;
    await noAnimElement.updateComplete;

    // Set up test data and expand relationship
    const mockRelationship = createRelationshipData('IfcRelAssignsToGroup', [
      createRelatedElement('Wall_001', 'related', 123, 'WALL_001'),
    ]);

    animatedElement.selectionRelationships = [mockRelationship];
    noAnimElement.selectionRelationships = [mockRelationship];

    animatedElement.requestUpdate();
    noAnimElement.requestUpdate();
    await animatedElement.updateComplete;
    await noAnimElement.updateComplete;

    // Expand both relationships
    const animatedHeader = animatedElement.shadowRoot?.querySelector(
      '.relationship-header',
    ) as HTMLElement;
    const noAnimHeader = noAnimElement.shadowRoot?.querySelector(
      '.relationship-header',
    ) as HTMLElement;

    animatedHeader?.click();
    noAnimHeader?.click();
    await animatedElement.updateComplete;
    await noAnimElement.updateComplete;

    // Verify no-anim class is applied only to the noAnim element
    const animatedContent = animatedElement.shadowRoot?.querySelector(
      '.relationship-content.expanded',
    );
    const noAnimContent = noAnimElement.shadowRoot?.querySelector('.relationship-content.expanded');

    expect(animatedContent?.classList.contains('no-anim')).toBe(false);
    expect(noAnimContent?.classList.contains('no-anim')).toBe(true);

    // Clean up
    if (animatedElement.parentNode) {
      animatedElement.parentNode.removeChild(animatedElement);
    }
    if (noAnimElement.parentNode) {
      noAnimElement.parentNode.removeChild(noAnimElement);
    }
  });
});
