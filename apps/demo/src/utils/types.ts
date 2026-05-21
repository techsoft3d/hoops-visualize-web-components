/**
 * Type of viewer to use
 */
export type ViewerType = 'scs' | 'csr' | 'ssr';

/**
 * Renderer type for WebViewerComponent (matches hoops-web-viewer web component API)
 */
export type RendererTypeString = 'client' | 'server';

/**
 * Streaming mode for WebViewerComponent (matches Lit component's string API)
 */
export type StreamingModeString = 'interactive' | 'all' | 'ondemand' | 'default';

/**
 * Configuration parsed from URL parameters
 */
export interface ViewerConfig {
  /** Type of viewer: scs (file), csr (client-side rendering), or ssr (server-side rendering) */
  viewerType: ViewerType;
  /** Model name to load (including .scs extension for SCS files) */
  model?: string;
  /** Streaming server host */
  scHost: string;
  /** Streaming server port */
  scPort: string;
  /** Full endpoint URI for the viewer */
  endpointUri?: string;
  /** Renderer type for WebViewerComponent */
  rendererType?: RendererTypeString;
  /** Streaming mode for WebViewerComponent (string value compatible with Lit converter) */
  streamingMode?: StreamingModeString;
  /** Whether to start with an empty viewer */
  empty: boolean;
}
