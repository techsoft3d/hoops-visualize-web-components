import { createContext } from '@lit/context';
import { ListContext } from './types';

/**
 * We use this structure to Wrap the context into a literal object to simplify
 * reassignment.
 *
 * @export
 * @typedef {ContextWrapper}
 */
export type ContextWrapper = {
  context: ListContext;
};

/**
 * The context that we will provide to our list elements
 */
export const listContext = createContext<ContextWrapper>('list');
