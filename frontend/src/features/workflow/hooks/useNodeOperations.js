import { useCallback } from 'react';
import { NODE_REGISTRY } from '../nodes/registry/nodeRegistry';

export const useNodeOperations = (setNodes, setEdges, setSelectedNodeId) => {
  const addNode = useCallback(
    (type, position) => {
      const registryEntry = NODE_REGISTRY[type];
      if (!registryEntry) return;

      // Support both defaultData.config (new format) and defaultConfig (legacy format)
      const defaultConfig = registryEntry.defaultData?.config
        || registryEntry.defaultConfig
        || {};

      const defaultLabel = registryEntry.defaultData?.label
        || registryEntry.label
        || type;

      const newNode = {
        id: `node_${type}_${Date.now()}`,
        type,
        position,
        data: {
          label: defaultLabel,
          config: { ...defaultConfig },
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(newNode.id);
    },
    [setNodes, setSelectedNodeId]
  );

  const deleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNodeId(null);
    },
    [setNodes, setEdges, setSelectedNodeId]
  );

  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                ...newData,
              },
            };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  return {
    addNode,
    deleteNode,
    updateNodeData,
  };
};
