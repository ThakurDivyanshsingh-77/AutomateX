import { useState, useEffect, useRef, useCallback } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { builderService } from '../services/builderService';
import toast from 'react-hot-toast';

export const useWorkflow = (workflowId) => {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved' | 'error'
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });

  const isInitialLoad = useRef(true);
  const autoSaveTimer = useRef(null);

  // 1. Fetch Workflow JSON Definition on Mount
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await builderService.loadWorkflow(workflowId);
        const wfData = res.workflow || res.data || res;

        if (isMounted) {
          setWorkflow(wfData);
          const def = wfData.definition || {};
          setNodes(def.nodes || []);
          setEdges(def.edges || []);
          if (def.viewport) setViewport(def.viewport);
          setSaveStatus('saved');
        }
      } catch (err) {
        if (isMounted) {
          toast.error('Failed to load workflow definition');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          // Allow auto-save tracking after initial state render
          setTimeout(() => {
            isInitialLoad.current = false;
          }, 500);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [workflowId, setNodes, setEdges]);

  // 2. Perform Save API Call
  const saveWorkflow = useCallback(
    async (currentNodes = nodes, currentEdges = edges, currentViewport = viewport) => {
      setSaveStatus('saving');
      try {
        const definition = {
          nodes: currentNodes,
          edges: currentEdges,
          viewport: currentViewport,
        };
        await builderService.saveWorkflowDefinition(workflowId, definition);
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('error');
        toast.error('Auto-save failed');
      }
    },
    [workflowId, nodes, edges, viewport]
  );

  // 3. Debounced Auto-Save Trigger on Graph Changes (2s delay)
  useEffect(() => {
    if (isInitialLoad.current || loading) return;

    setSaveStatus('unsaved');

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      saveWorkflow(nodes, edges, viewport);
    }, 2000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [nodes, edges, viewport, loading, saveWorkflow]);

  // 4. Ctrl + S Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveWorkflow(nodes, edges, viewport);
        toast.success('Workflow saved manually!');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveWorkflow, nodes, edges, viewport]);

  return {
    workflow,
    loading,
    saveStatus,
    nodes,
    edges,
    viewport,
    selectedNodeId,
    setSelectedNodeId,
    setNodes,
    setEdges,
    setViewport,
    onNodesChange,
    onEdgesChange,
    saveWorkflow,
  };
};
