import { createContext } from '@lit/context';
import { TreeContext } from './types';

/**
 * We use this structure to Wrap the context into a literal object to simplify
 * reassignment.
 *
 * @export
 * @typedef {ContextWrapper}
 */
export type ContextWrapper = {
  context: TreeContext;
};

/**
 * The context that we will provide to our tree nodes
 */
export const treeContext = createContext<ContextWrapper>('tree');
