import { ViewerType, ViewerConfig, StreamingModeString } from './types';

/**
 * Validates the viewer type parameter and returns a valid ViewerType,
 * defaulting to 'scs' if invalid or not provided.
 */
function validateViewerType(viewerParam: string | undefined): ViewerType {
  if (!viewerParam) {
    return 'scs';
  }

  if (['csr', 'ssr'].includes(viewerParam)) {
    return viewerParam as ViewerType;
  }

  return 'scs';
}

/**
 * Validates the streaming mode parameter and returns a valid StreamingModeString,
 * defaulting to 'interactive' if invalid or not provided.
 */
function validateStreamingMode(streamingModeParam: string | undefined): StreamingModeString {
  if (!streamingModeParam) {
    return 'interactive';
  }

  if (['all', 'ondemand', 'default'].includes(streamingModeParam)) {
    return streamingModeParam as StreamingModeString;
  }

  return 'interactive';
}

/**
 * Parses URL search parameters and returns viewer configuration
 *
 * @param searchParams - URLSearchParams from react-router-dom
 * @returns Viewer configuration with defaults applied
 */
export function parseViewerConfigFromParams(searchParams: URLSearchParams): ViewerConfig {
  // Parse parameters with defaults
  const viewerParam = searchParams.get('viewer')?.toLowerCase();
  const model = searchParams.get('model') || undefined;
  const scHost = searchParams.get('scHost') || window.location.hostname;
  const scPort = searchParams.get('scPort') || window.location.port || '9999';
  const streamingModeParam = searchParams.get('streamingMode')?.toLowerCase();

  const viewerType = validateViewerType(viewerParam);
  const streamingMode = validateStreamingMode(streamingModeParam);

  // Build configuration based on viewer type
  const config: ViewerConfig = {
    viewerType,
    model,
    scHost,
    scPort,
    empty: !model,
  };

  if (viewerType === 'scs') {
    // SCS mode: use model parameter directly as endpoint URI
    if (model) {
      config.endpointUri = model;
    }
  } else {
    // CSR/SSR mode: construct WebSocket URI
    // Use wss for HTTPS, ws for HTTP
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const renderingLocation = viewerType === 'csr' ? 'csr' : 'ssr';
    config.endpointUri = `${wsProtocol}://${scHost}:${scPort}?renderingLocation=${renderingLocation}`;
    config.rendererType = viewerType === 'csr' ? 'client' : 'server';
    config.streamingMode = streamingMode;
  }

  return config;
}
