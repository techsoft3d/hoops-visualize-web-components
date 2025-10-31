# Service API — web-viewer-components

This folder provides a service architecture to extend and share features within the application.  
Each service is registered globally and can be retrieved or replaced dynamically.

## Key Concepts

- **Service**: A class extending `EventTarget` and exposing a unique `serviceName` property.
- **Registration**: Use `registerService` to make a service available globally.
- **Retrieval**: Use `getService` to access a service from any component.
- **Unregistration**: Use `unregisterService` to remove a service from the registry.
- **Interoperability**: Services can communicate via events (`dispatchEvent`).

## Loose completion and service name autocompletion

The service system uses the **loose completion** concept for the `ServiceName` type.  
This allows autocompletion for known names (declared in `ServiceNames`), while still allowing any string as a service name.  
This is achieved with the following type:

```typescript
export type ServiceName = (typeof ServiceNames)[number] | (string & {});
```

**Recommendation:**  
To benefit from IDE autocompletion and improve code readability, it is recommended to explicitly add each new service name to the `ServiceNames` array (in `types.ts`).  
This is not required for functionality, but is strongly encouraged.

## Minimal example

```typescript
// Define an interface for your service
import { IService } from './types';
export interface IMyService extends IService {
  doSomething(): void;
}

// Implement the service class
export class MyService extends EventTarget implements IMyService {
  public readonly serviceName = 'MyService' as const;
  doSomething() {
    console.log('Hello from MyService!');
  }
}

// Register the service
import { registerService } from './serviceRegistry';
registerService(new MyService());

// Retrieve and use the service
import { getService } from './serviceRegistry';
const myService = getService<IMyService>('MyService');
myService.doSomething();
```

## Advanced usage

- **Event listening**:
  ```typescript
  myService.addEventListener('custom-event', (e) => { ... });
  myService.dispatchEvent(new CustomEvent('custom-event', { detail: ... }));
  ```
- **Service replacement**:  
  Registering a new service with the same `serviceName` will overwrite the previous one.

## Example usage in a Lit Web Component

Here is how to consume a service in a custom Lit component:

```typescript
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { getService, type IMyService } from '../services';

@customElement('my-service-consumer')
export class MyServiceConsumer extends LitElement {
  private myService?: IMyService;

  connectedCallback() {
    super.connectedCallback();
    // Retrieve the service when the component is initialized
    this.myService = getService<IMyService>('MyService');
    // Example: listen to a service event
    this.myService.addEventListener('custom-event', this.handleCustomEvent);
  }

  disconnectedCallback() {
    // Clean up listeners to avoid memory leaks
    this.myService?.removeEventListener('custom-event', this.handleCustomEvent);
    super.disconnectedCallback();
  }

  private handleCustomEvent = (event: Event) => {
    // Handle the service event
    this.requestUpdate();
  };

  protected render() {
    return html` <button @click=${this._onClick}>Call the service</button> `;
  }

  private _onClick() {
    this.myService?.doSomething();
  }
}
```

## Best practices

- Use `as const` for the service name.
- Prefer interfaces to type your services.
- Add your service name to `ServiceNames` to benefit from autocompletion.
- Clean up listeners in `disconnectedCallback` if you use services in Web Components.
- Prefer public get/set functions instead of properties. Do not mix both in the same service.
- Send an event when something change, the event must contains the new value.
- The service should emit a reset event when all its properties change, usually when the webviewer sub part attached to it has been set.

---
