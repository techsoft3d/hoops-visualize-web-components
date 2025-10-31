# WebViewer Context Manager

The context manager is a logical component to synchronize UI web viewer components states around the web viewer.

It is responsible of making changes in the web viewer and store states as a single source of truth.
States are propagated using the [Context Community Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md) by the W3C's Web Components Community Group.

## Usage

Start by importing the context-manager module, this allows the HTML tag to be registered in the DOM:

The `hoops-web-viewer-context-manager` component must be an ancestor of a ui component to be able to propagate states to it.

When the `WebViewer` is created, it must be passed to the `hoops-web-viewer-context-manager` with the `webViewer` attribute.

As soon as a `WebViewer` instance is linked to the `hoops-web-viewer-context-manager`, states will be updated and propagated to children UI components. Most UI components with internal self contained logic will directly negotiate with the `hoops-web-viewer-context-manager` to interact with the `WebViewer` instance and states will remain synchronized.

The `WebViewer` doesn't have a callback mechanism for every of its states. If an action is triggered from outside of builtin UI components, it's required to call the corresponding action method of the `hoops-web-viewer-context-manager` to have states updated.

## Basic example

```html
<!doctype html>
<html lang="en">
  <body>
    <button>Outside</button>
    <hoops-web-viewer-context-manager>
      <hoops-toolbar-drawmode></hoops-toolbar-drawmode>
      <hoops-web-viewer></hoops-web-viewer>
    </hoops-web-viewer-context-manager>
    <script type="module">
      import './lib/context-manager';
      import './lib/hoops-web-viewer';
      import './lib/toolbar-buttons';
      import { DrawMode } from '@ts3d-hoops/web-viewer';

      const contextManager = document.querySelector('hoops-web-viewer-context-manager');
      document.querySelector('hoops-web-viewer').addEventListener('hwvReady', (event) => {
        const webViewer = event.detail;
        contextManager.webViewer = webViewer;
      });
      document.querySelector('button').addEventListener('click', (event) => {
        contextManager.setDrawMode(DrawMode.Shaded);
      });
    </script>
  </body>
</html>
```
