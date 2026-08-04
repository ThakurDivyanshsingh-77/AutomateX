/**
 * HeuristicWorkflowGenerator — Built-in Offline Pattern Generator.
 *
 * Converts natural language prompts into valid AutomateX workflow definitions
 * using pattern matching, keyword detection, and graph topology rules when Grok AI API
 * is unconfigured or offline.
 */

export class HeuristicWorkflowGenerator {
  /**
   * Parse prompt text and generate a complete workflow graph.
   *
   * @param {string} prompt - User natural language prompt
   * @returns {Object} { name, description, definition: { nodes, edges }, summary, warnings }
   */
  static generate(prompt) {
    const text = (prompt || '').toLowerCase();
    const nodes = [];
    const edges = [];
    const warnings = [];
    const summarySteps = [];

    let currentX = 100;
    const Y_POS = 150;
    const X_GAP = 250;

    let nodeCounter = 1;
    const nextId = (prefix) => `${prefix}_${nodeCounter++}`;

    // ── 1. Determine Trigger Node ─────────────────────────────────────────────
    let triggerNode = null;

    if (
      text.includes('cron') ||
      text.includes('schedule') ||
      text.includes('every') ||
      text.includes('daily') ||
      text.includes('hourly') ||
      text.includes('minutes') ||
      text.includes('at 9 am')
    ) {
      triggerNode = {
        id: nextId('node'),
        type: 'cron',
        position: { x: currentX, y: Y_POS },
        data: {
          label: 'Cron Schedule Trigger',
          config: { cronExpression: '0 9 * * *' },
        },
      };
      summarySteps.push('1. Triggers automatically on a scheduled cron timer.');
    } else if (
      text.includes('webhook') ||
      text.includes('signup') ||
      text.includes('sign up') ||
      text.includes('payment') ||
      text.includes('stripe') ||
      text.includes('lead') ||
      text.includes('form') ||
      text.includes('when') ||
      text.includes('on user')
    ) {
      triggerNode = {
        id: nextId('node'),
        type: 'webhook',
        position: { x: currentX, y: Y_POS },
        data: {
          label: 'Webhook Event Trigger',
          config: { path: '/webhook' },
        },
      };
      summarySteps.push('1. Starts when an incoming HTTP Webhook payload is received.');
    } else {
      // Default Start Trigger
      triggerNode = {
        id: nextId('node'),
        type: 'start',
        position: { x: currentX, y: Y_POS },
        data: {
          label: 'Start Trigger',
        },
      };
      summarySteps.push('1. Starts manually or via API launch trigger.');
    }

    nodes.push(triggerNode);
    let prevNode = triggerNode;

    // Helper to append a node
    const addActionNode = (type, label, config = {}, summaryDesc = '') => {
      currentX += X_GAP;
      const newNode = {
        id: nextId('node'),
        type,
        position: { x: currentX, y: Y_POS },
        data: { label, config },
      };
      nodes.push(newNode);

      // Create edge from previous node
      edges.push({
        id: `e_${prevNode.id}_${newNode.id}`,
        source: prevNode.id,
        target: newNode.id,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      });

      prevNode = newNode;
      if (summaryDesc) {
        summarySteps.push(`${summarySteps.length + 1}. ${summaryDesc}`);
      }
    };

    // ── 2. Action Pattern Matching ────────────────────────────────────────────

    // Check for HTTP Request
    if (text.includes('fetch') || text.includes('http') || text.includes('api') || text.includes('weather') || text.includes('get data')) {
      let url = 'https://jsonplaceholder.typicode.com/todos/1';
      if (text.includes('weather')) url = 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true';
      addActionNode('http', 'HTTP Request', { method: 'GET', url }, 'Fetches external API data via HTTP GET request.');
    }

    // Check for Condition (IF)
    if (text.includes('if') || text.includes('check') || text.includes('condition') || text.includes('when email exists')) {
      addActionNode('condition', 'IF Condition', { field: 'body.email', operator: 'exists', value: '' }, 'Evaluates condition rule against input payload.');
    }

    // Check for Gmail / Email
    if (text.includes('email') || text.includes('gmail') || text.includes('welcome') || text.includes('send invoice')) {
      addActionNode(
        'gmail',
        'Gmail Send Email',
        { to: '{{trigger.body.email}}', subject: 'AutomateX Notification', body: 'Hello! Your automation has been processed.' },
        'Sends an automated Gmail message to recipient.'
      );
    }

    // Check for Delay / Wait
    if (text.includes('wait') || text.includes('delay') || text.includes('pause') || text.includes('5 minutes') || text.includes('10 seconds')) {
      let seconds = 300;
      if (text.includes('1 minute') || text.includes('60 seconds')) seconds = 60;
      if (text.includes('5 minutes')) seconds = 300;
      if (text.includes('1 hour')) seconds = 3600;
      addActionNode('delay', 'Delay Pause', { seconds }, `Pauses workflow execution for ${seconds} seconds.`);
    }

    // Check for Slack
    if (text.includes('slack')) {
      addActionNode('slack', 'Slack Notification', { message: 'AutomateX alert: Workflow step executed successfully!' }, 'Posts notification message to Slack channel.');
    }

    // Check for Discord
    if (text.includes('discord')) {
      addActionNode('discord', 'Discord Alert', { content: 'AutomateX alert: Workflow event received!' }, 'Posts alert message to Discord webhook channel.');
    }

    // Check for Telegram
    if (text.includes('telegram')) {
      addActionNode('telegram', 'Telegram Message', { text: 'AutomateX notification: Task completed.' }, 'Sends alert message to Telegram chat.');
    }

    // Check for Log / Logger
    if (text.includes('log') || text.includes('logger') || text.includes('result') || text.includes('record')) {
      addActionNode('log', 'Log Output', { message: 'Workflow step completed successfully.' }, 'Logs step outputs and metrics to execution log history.');
    }

    // ── 3. Append End Completion Node ─────────────────────────────────────────
    currentX += X_GAP;
    const endNode = {
      id: nextId('node'),
      type: 'end',
      position: { x: currentX, y: Y_POS },
      data: { label: 'End Completion' },
    };
    nodes.push(endNode);

    edges.push({
      id: `e_${prevNode.id}_${endNode.id}`,
      source: prevNode.id,
      target: endNode.id,
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    });

    summarySteps.push(`${summarySteps.length + 1}. Workflow execution completes cleanly.`);

    // Auto-detect template title
    let title = 'Generated Automation Workflow';
    if (text.includes('signup') || text.includes('sign up')) title = 'User Signup Welcome Sequence';
    else if (text.includes('weather')) title = 'Daily Weather Forecast Alert';
    else if (text.includes('payment') || text.includes('stripe')) title = 'Payment Receipt Workflow';
    else if (text.includes('lead')) title = 'CRM Lead Capture & Routing';

    return {
      name: title,
      description: `Auto-generated workflow from prompt: "${prompt}"`,
      definition: {
        nodes,
        edges,
        viewport: { x: 0, y: 0, zoom: 1 },
      },
      variables: [
        { name: 'trigger.body.email', type: 'string', description: 'Recipient email address from trigger' },
        { name: 'trigger.body.name', type: 'string', description: 'User full name' },
      ],
      summary: summarySteps.join('\n'),
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
