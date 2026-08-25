/**
 * WorkflowPlanner.js
 * Generates structured, intermediate workflow plans and React Flow DAG topologies.
 */

export class WorkflowPlanner {
  /**
   * Create an intermediate step-by-step execution plan from matched capabilities
   * @param {Object} matchedResult
   * @returns {Object} Structured plan
   */
  static createPlan(matchedResult) {
    const { trigger, actions } = matchedResult;
    const steps = [];

    steps.push({
      step: 1,
      type: 'trigger',
      nodeType: trigger.nodeType,
      name: trigger.name,
      category: trigger.category,
      requiredCredentials: trigger.requiredCredentials || [],
      requiredFields: trigger.requiredFields || [],
    });

    actions.forEach((action, index) => {
      steps.push({
        step: index + 2,
        type: 'action',
        nodeType: action.nodeType,
        name: action.name,
        category: action.category,
        requiredCredentials: action.requiredCredentials || [],
        requiredFields: action.requiredFields || [],
      });
    });

    return {
      status: 'valid',
      intent: 'AUTOMATION',
      stepCount: steps.length,
      steps,
    };
  }

  /**
   * Convert a structured plan into a fully connected React Flow DAG definition
   * @param {Object} plan
   * @param {string} prompt
   * @returns {Object} React Flow definition { nodes, edges, viewport }
   */
  static generateDAG(plan, prompt = '') {
    const nodes = [];
    const edges = [];
    const text = prompt.toLowerCase();

    let currentX = 100;
    const Y_POS = 150;
    const X_GAP = 280;

    let prevNodeId = null;

    plan.steps.forEach((step, idx) => {
      const nodeId = `node_${step.nodeType}_${idx + 1}`;
      const config = this.generateDefaultConfig(step.nodeType, text);

      nodes.push({
        id: nodeId,
        type: step.nodeType,
        position: { x: currentX, y: Y_POS },
        data: {
          label: step.name,
          config,
        },
      });

      if (prevNodeId) {
        edges.push({
          id: `edge_${prevNodeId}_to_${nodeId}`,
          source: prevNodeId,
          target: nodeId,
          type: 'smoothstep',
          animated: true,
        });
      }

      prevNodeId = nodeId;
      currentX += X_GAP;
    });

    return {
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
    };
  }

  /**
   * Helper to derive smart default config values from prompt
   */
  static generateDefaultConfig(nodeType, text) {
    switch (nodeType) {
      case 'cron':
        if (text.includes('10 minutes')) return { cronExpression: '*/10 * * * *', expression: '*/10 * * * *' };
        if (text.includes('hourly') || text.includes('every hour')) return { cronExpression: '0 * * * *', expression: '0 * * * *' };
        if (text.includes('9 am')) return { cronExpression: '0 9 * * *', expression: '0 9 * * *' };
        return { cronExpression: '0 0 * * *', expression: '0 0 * * *' };

      case 'webhook':
        return { path: '/webhook/event', method: 'POST' };

      case 'discordSendMessage':
        return {
          channelId: 'general',
          content: text.includes('good morning') ? 'Good morning!' : 'AutomateX automated notification message.',
        };

      case 'discordSendEmbed':
        return {
          channelId: 'general',
          title: text.includes('live stream') ? '🔴 Live Stream Update' : 'AutomateX Embed Notification',
          description: text.includes('live stream') ? 'Live stream is now online: https://twitch.tv/streamer' : 'Automated status notification.',
          color: '#8b5cf6',
        };

      case 'gmail':
        return {
          to: 'user@example.com',
          subject: 'AutomateX Notification',
          body: 'Hello, this is an automated message triggered by your AutomateX workflow.',
        };

      case 'githubSyncProfileReadme':
        return {
          profileRepo: 'USERNAME/USERNAME',
          branch: 'main',
          sortBy: 'updated',
          maxProjects: 10,
        };

      case 'githubDailyActivityCommit':
        return {
          repository: 'USERNAME/REPOSITORY',
          branch: 'main',
          activityFile: '.github/automatex/activity.md',
          commitMessage: 'chore: daily AutomateX activity',
          dailyDeduplication: true,
          dryRun: false,
        };

      case 'googleSheetsAppendRow':
        return {
          spreadsheetId: 'SPREADSHEET_ID',
          sheetName: 'Sheet1',
          values: '{{$json.data}}',
        };

      case 'mongoInsertOne':
        return {
          database: 'automatex_db',
          collection: 'events',
          document: '{{$json}}',
        };

      case 'aiGenerateText':
        return {
          prompt: 'Summarize the input data concisely.',
          model: 'gemini-1.5-flash',
        };

      default:
        return {};
    }
  }
}
