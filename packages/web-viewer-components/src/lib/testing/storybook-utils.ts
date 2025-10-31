import { expect, waitFor } from '@storybook/test';

export function waitForElement(queryFn: () => Element | null): Promise<Element> {
  return waitFor(() => {
    const element = queryFn();
    expect(element).toBeTruthy();
    return element as Element;
  });
}
