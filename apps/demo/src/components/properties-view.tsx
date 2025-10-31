import { core, NodeId } from '@ts3d-hoops/web-viewer';
import { HoopsNodeProperties } from '@ts3d-hoops/ui-kit-react';
import { nodeProperties } from '@ts3d-hoops/ui-kit';

import { useEffect, useRef } from 'react';

interface PropertiesViewProps {
  model?: core.IModel;
  nodeId?: NodeId;
}

export default function PropertiesView({
  model = undefined,
  nodeId = Number.NaN,
}: PropertiesViewProps) {
  const nodePropertiesRef = useRef<nodeProperties.NodeProperties | null>(null);

  useEffect(() => {
    if (nodePropertiesRef.current) {
      const nodePropertyAdapter = nodePropertiesRef.current
        .node as nodeProperties.NodePropertyAdapter;
      nodePropertyAdapter.model = model;
      return () => {
        nodePropertyAdapter.model = undefined;
      };
    }
    return undefined;
  }, [model]);

  return (
    <HoopsNodeProperties
      data-testid="properties-view"
      className="properties-view"
      nodeId={nodeId}
      ref={nodePropertiesRef}
    />
  );
}
