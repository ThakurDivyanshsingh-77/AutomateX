import { WorkflowParser } from './parser/WorkflowParser.js';
import { GraphValidator } from './graph/GraphValidator.js';
import { GraphBuilder } from './graph/GraphBuilder.js';
import { ExecutionContext } from './runtime/ExecutionContext.js';
import { ExecutorRegistry } from './registry/ExecutorRegistry.js';
import { ExecutionLogger } from './logger/ExecutionLogger.js';
import { ExpressionEngine } from './expression/ExpressionEngine.js';
import { RetryEngine } from './retry/RetryEngine.js';

export class WorkflowEngine {
  static async run(workflowDefinition, executionId = `exec_${Date.now()}`, initialData = {}) {
    const startTime = Date.now();

    // 1. Parse JSON definition
    const parsedWorkflow = WorkflowParser.parse(workflowDefinition);

    // 2. Validate Graph Topology & Start Node
    const validation = GraphValidator.validate(parsedWorkflow);
    if (!validation.isValid) {
      throw new Error(`Workflow graph validation failed: ${validation.errors.join(', ')}`);
    }

    // 3. Build Adjacency List Map
    const adjacencyList = GraphBuilder.buildAdjacencyList(parsedWorkflow.nodes, parsedWorkflow.edges);

    // 4. Initialize Execution RAM Context
    const resolvedOwnerId = String(
      initialData?.ownerId ||
      initialData?.userId ||
      initialData?.workflow?.ownerId ||
      initialData?.execution?.ownerId ||
      workflowDefinition?.ownerId ||
      workflowDefinition?.owner ||
      parsedWorkflow?.ownerId ||
      parsedWorkflow?.owner ||
      ''
    ).trim();

    const context = new ExecutionContext(executionId, {
      ...initialData,
      ownerId: resolvedOwnerId,
      userId: resolvedOwnerId,
    });

    let currentNode = validation.startNode;
    let nodesExecutedCount = 0;
    let executionError = null;

    // 5. Central Execution Orchestrator Loop
    while (currentNode) {
      const stepStartTime = Date.now();
      const inputData = { ...context.currentData };

      const executor = ExecutorRegistry.getExecutor(currentNode.type);

      // Resolve all string expressions ({{ ... }}) in node config prior to execution
      const rawConfig = currentNode.config || currentNode.data?.config || {};
      const resolvedConfig = ExpressionEngine.resolve(rawConfig, context);

      const nodeToExecute = {
        ...currentNode,
        config: resolvedConfig,
        rawConfig,
      };

      // Execute Node with Retry Policy Engine
      const retryResult = await RetryEngine.executeWithRetry(executor, nodeToExecute, context);
      const durationMs = Date.now() - stepStartTime;

      if (retryResult.success) {
        const stepOutput = retryResult.result?.output !== undefined ? retryResult.result.output : (retryResult.result || {});

        // Store step log and node outputs (by nodeId, nodeType, and node label)
        context.setNodeOutput(currentNode.id, stepOutput);
        context.setNodeOutput(currentNode.type, stepOutput);
        if (currentNode.data?.label) {
          context.setNodeOutput(currentNode.data.label, stepOutput);
        }
        if (currentNode.label) {
          context.setNodeOutput(currentNode.label, stepOutput);
        }

        const logStatus = retryResult.recovered ? 'recovered' : 'success';
        const stepLog = ExecutionLogger.createStepLog(
          currentNode,
          logStatus,
          durationMs,
          inputData,
          stepOutput
        );
        stepLog.retryAttempts = retryResult.attempts;
        context.addLogStep(stepLog);
        nodesExecutedCount++;

        // Determine next node for Condition / TryCatch / Normal nodes
        if (currentNode.type === 'condition') {
          const isTrue = Boolean(stepOutput?.result);
          const selectedBranch = isTrue ? 'true' : 'false';

          const branchEdge = parsedWorkflow.edges.find((e) => {
            if (e.source !== currentNode.id) return false;
            const handle = String(e.sourceHandle || e.branch || '').toLowerCase();
            return handle === selectedBranch;
          });

          if (branchEdge) {
            currentNode = parsedWorkflow.nodeMap.get(branchEdge.target);
          } else {
            const nextNodeIds = adjacencyList.get(currentNode.id) || [];
            currentNode = nextNodeIds.length > 0 ? parsedWorkflow.nodeMap.get(nextNodeIds[0]) : null;
          }
        } else if (currentNode.type === 'tryCatch') {
          // Route into 'try' branch
          const tryEdge = parsedWorkflow.edges.find((e) => {
            if (e.source !== currentNode.id) return false;
            const handle = String(e.sourceHandle || e.branch || '').toLowerCase();
            return handle === 'try';
          });

          if (tryEdge) {
            currentNode = parsedWorkflow.nodeMap.get(tryEdge.target);
          } else {
            const nextNodeIds = adjacencyList.get(currentNode.id) || [];
            currentNode = nextNodeIds.length > 0 ? parsedWorkflow.nodeMap.get(nextNodeIds[0]) : null;
          }
        } else {
          // Standard node output connection
          const nextNodeIds = adjacencyList.get(currentNode.id) || [];
          if (nextNodeIds.length > 0) {
            currentNode = parsedWorkflow.nodeMap.get(nextNodeIds[0]);
          } else {
            currentNode = null;
          }
        }
      } else {
        // Node execution failed after all retries exhausted
        const err = retryResult.error || new Error(`Node ${currentNode.id} execution failed`);

        const failedLog = ExecutionLogger.createStepLog(
          currentNode,
          'failed',
          durationMs,
          inputData,
          null,
          err
        );
        failedLog.retryAttempts = retryResult.attempts;
        context.addLogStep(failedLog);
        nodesExecutedCount++;

        // 1. Check for dedicated 'error' / 'catch' handle edge
        const errorEdge = parsedWorkflow.edges.find((e) => {
          if (e.source !== currentNode.id) return false;
          const handle = String(e.sourceHandle || e.branch || '').toLowerCase();
          return handle === 'error' || handle === 'catch';
        });

        if (errorEdge) {
          console.log(`[WorkflowEngine]: Node "${currentNode.id}" failed. Routing to Error Branch "${errorEdge.target}"`);
          currentNode = parsedWorkflow.nodeMap.get(errorEdge.target);
          continue; // Proceed down Error Branch
        }

        // 2. Check if 'continueOnError' is checked
        if (retryResult.continueOnError) {
          console.warn(`[WorkflowEngine]: Node "${currentNode.id}" failed, but continueOnError=true. Proceeding...`);
          const nextNodeIds = adjacencyList.get(currentNode.id) || [];
          if (nextNodeIds.length > 0) {
            currentNode = parsedWorkflow.nodeMap.get(nextNodeIds[0]);
            continue;
          }
        }

        // 3. Halt workflow execution
        executionError = {
          message: err.message || 'Execution error encountered',
          stack: err.stack,
          nodeId: currentNode.id,
        };
        break;
      }
    }

    const totalDuration = Date.now() - startTime;
    const isSuccess = !executionError;

    return {
      success: isSuccess,
      status: isSuccess ? 'success' : 'failed',
      duration: totalDuration,
      nodesExecuted: nodesExecutedCount,
      logs: context.getLogs(),
      output: context.currentData || {},
      error: executionError,
    };
  }
}
