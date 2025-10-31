import { NodeType } from '@ts3d-hoops/web-viewer';
import { html, HTMLTemplateResult, nothing } from 'lit';
import {
  assemblyNode,
  bodyNode,
  rootModel,
  visibleIcon,
  hiddenIcon,
  halfVisibleIcon,
} from '@ts3d-hoops/ui-kit/icons';
import { BranchVisibility } from './types';

/**
 * Turn a node type name into the corresponding value in the NodeType enum.
 *
 * @export
 * @param {string} name of the NodeType
 * @returns {NodeType}
 */
export function toNodeType(name: string): NodeType {
  switch (name) {
    case 'Assembly Node':
      return NodeType.AssemblyNode;
    case 'Part Instance':
      return NodeType.PartInstance;
    case 'Part':
      return NodeType.Part;
    case 'Body Instance':
      return NodeType.BodyInstance;
    case 'Pmi Body':
      return NodeType.PmiBody;
    case 'View Frame':
      return NodeType.ViewFrame;
    case 'Body':
      return NodeType.Body;
    case 'Brep Body':
      return NodeType.BrepBody;
    case 'Tess Body':
      return NodeType.TessBody;
    case 'Wire Body':
      return NodeType.WireBody;
    case 'Points Body':
      return NodeType.PointsBody;
    case 'Pmi':
      return NodeType.Pmi;
    case 'Cad View':
      return NodeType.CadView;
    case 'Drawing Sheet':
      return NodeType.DrawingSheet;
    case 'Unknown':
      return NodeType.Unknown;
    default:
      return NodeType.Unknown;
  }
}

/**
 * Formate a NodeType into a string.
 *
 * @export
 * @param {NodeType} type The type to format.
 * @returns {("Assembly Node" | "Part Instance" | "Part" | "Body Instance" | "Pmi Body" | "View Frame" | "Body" | "Brep Body" | "Tess Body" | "Wire Body" | "Points Body" | "Pmi" | "Cad View" | "Drawing Sheet" | "Unknown")}
 */
export function formatNodeType(type: NodeType) {
  switch (type) {
    case NodeType.AssemblyNode:
      return 'Assembly Node';
    case NodeType.PartInstance:
      return 'Part Instance';
    case NodeType.Part:
      return 'Part';
    case NodeType.BodyInstance:
      return 'Body Instance';
    case NodeType.PmiBody:
      return 'Pmi Body';
    case NodeType.ViewFrame:
      return 'View Frame';
    case NodeType.Body:
      return 'Body';
    case NodeType.BrepBody:
      return 'Brep Body';
    case NodeType.TessBody:
      return 'Tess Body';
    case NodeType.WireBody:
      return 'Wire Body';
    case NodeType.PointsBody:
      return 'Points Body';
    case NodeType.Pmi:
      return 'Pmi';
    case NodeType.CadView:
      return 'Cad View';
    case NodeType.DrawingSheet:
      return 'Drawing Sheet';
    case NodeType.Unknown:
      return 'Unknown';
  }
}

/**
 * Provide the icon for a NodeType as an HTML fragment.
 *
 * @export
 * @param {boolean} isRoot If the node is a root.
 * @param {NodeType} type The type of the node we want the icon for.
 * @returns {(HTMLTemplateResult | typeof nothing)}
 */
export function formatNodeTypeIcon(
  isRoot: boolean,
  type: NodeType,
): HTMLTemplateResult | typeof nothing {
  if (isRoot) {
    return html`${rootModel}`;
  }
  switch (type) {
    case NodeType.PartInstance:
      return html`${assemblyNode}`;

    case NodeType.AssemblyNode:
      return html`${assemblyNode}`;

    case NodeType.BodyInstance:
      return html`${bodyNode}`;

    default:
      return nothing;
  }
}

/**
 * Provide the icon for the visibility of a node.
 *
 * @export
 * @param {BranchVisibility} visibility The visibility of the node.
 * @returns {(HTMLTemplateResult | typeof nothing)}
 */
export function formatNodeVisibilityIcon(
  visibility: BranchVisibility,
): HTMLTemplateResult | typeof nothing {
  switch (visibility) {
    case 'Shown':
      return html`${visibleIcon}`;
    case 'Hidden':
      return html`${hiddenIcon}`;
    case 'Mixed':
      return html`${halfVisibleIcon}`;
    default:
      return nothing;
  }
}
