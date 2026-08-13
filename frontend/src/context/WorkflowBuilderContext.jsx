import React, { createContext, useContext } from 'react';

export const WorkflowBuilderContext = createContext({
  workflowNodes: [],
  executionSnapshot: null,
  updateNodeData: () => {},
  workflowId: null,
});

export const useWorkflowBuilder = () => useContext(WorkflowBuilderContext);

export const WorkflowBuilderProvider = ({
  children,
  workflowNodes = [],
  executionSnapshot = null,
  updateNodeData = () => {},
  workflowId = null,
}) => {
  return (
    <WorkflowBuilderContext.Provider
      value={{
        workflowNodes,
        executionSnapshot,
        updateNodeData,
        workflowId,
      }}
    >
      {children}
    </WorkflowBuilderContext.Provider>
  );
};
