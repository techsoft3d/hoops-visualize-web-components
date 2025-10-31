# HOOPS Visualize Web Components

A comprehensive collection of web components and React wrappers for building 3D CAD visualization applications using HOOPS Visualize Web technology.

## 📦 Packages

This repository contains the following packages:

- **[@ts3d-hoops/ui-kit](./packages/ui-kit)** - Core UI components built with Lit
- **[@ts3d-hoops/ui-kit-react](./packages/ui-kit-react)** - React wrappers for ui-kit components
- **[@ts3d-hoops/web-viewer-components](./packages/web-viewer-components)** - 3D viewer components for CAD visualization
- **[@ts3d-hoops/web-viewer-components-react](./packages/web-viewer-components-react)** - React wrappers for web viewer components

These packages are used in **[the react demo located in ./apps/demo](./apps/demo)**

## ️ Development

### Building from Source

```bash
npm install

npm run build
```

### Running the Demo

```bash
npx nx run demo:serve
```

### Running Tests

```bash
npx nx run-many -t test
```

### Linting and Code Quality

```bash
npx nx run-many -t lint
```

## 📚 Documentation

- **[HOOPS Visualize Web Documentation](https://docs.techsoft3d.com/hoops/visualize-web/index.html)** - Main documentation portal
- **[API Documentation](https://docs.techsoft3d.com/hoops/visualize-web/prog_guide/viewing/web_components/api.html)** - Complete API reference for all components

## 🏗️ Architecture

This monorepo uses:

- **[Nx](https://nx.dev/)** for build orchestration and workspace management
- **[Lit](https://lit.dev/)** for web component development
- **[React](https://reactjs.org/)** for React wrapper components and the demo
- **[Vite](https://vitejs.dev/)** for fast development and building
- **[Vitest](https://vitest.dev/)** for unit testing

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.
