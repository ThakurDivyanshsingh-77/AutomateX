/**
 * CapabilityMatcher.js
 * Analyzes natural language prompts and maps them deterministically to real registered AutomateX capabilities.
 */

import { CapabilityRegistry, NODE_CAPABILITIES } from './CapabilityRegistry.js';

export class CapabilityMatcher {
  /**
   * Match prompt requirements against available AutomateX capabilities
   * @param {string} prompt
   * @returns {Object} Matched capabilities, matched nodes, missing capabilities, and warnings
   */
  static match(prompt) {
    const text = (prompt || '').toLowerCase();
    const matchedTriggers = [];
    const matchedActions = [];
    const missingCapabilities = [];
    const partialNotice = [];

    // ─── 1. Determine Trigger ─────────────────────────────────────────────────
    if (
      text.includes('cron') ||
      text.includes('schedule') ||
      text.includes('every') ||
      text.includes('daily') ||
      text.includes('hourly') ||
      text.includes('minute') ||
      text.includes('at 9 am') ||
      text.includes('morning')
    ) {
      matchedTriggers.push(NODE_CAPABILITIES.cron);
    } else if (
      text.includes('discord message') &&
      (text.includes('received') || text.includes('when someone posts') || text.includes('incoming discord'))
    ) {
      matchedTriggers.push(NODE_CAPABILITIES.discordMessageReceived);
    } else if (
      text.includes('sheet') &&
      (text.includes('new row') || text.includes('row added') || text.includes('watch rows'))
    ) {
      matchedTriggers.push(NODE_CAPABILITIES.googleSheetsTriggerWatchRows);
    } else if (
      text.includes('webhook') ||
      text.includes('form') ||
      text.includes('payment') ||
      text.includes('stripe') ||
      text.includes('signup') ||
      text.includes('sign up') ||
      text.includes('lead') ||
      text.includes('when') ||
      text.includes('github')
    ) {
      matchedTriggers.push(NODE_CAPABILITIES.webhook);
    } else {
      matchedTriggers.push(NODE_CAPABILITIES.start);
    }

    // ─── 2. Determine Actions ─────────────────────────────────────────────────
    // A. GitHub Actions
    if (
      text.includes('readme') ||
      (text.includes('sync') && (text.includes('profile') || text.includes('projects') || text.includes('github')))
    ) {
      matchedActions.push(NODE_CAPABILITIES.githubSyncProfileReadme);
    } else if (
      text.includes('daily activity') ||
      text.includes('activity commit') ||
      (text.includes('commit') && text.includes('github')) ||
      (text.includes('heartbeat') && text.includes('github'))
    ) {
      matchedActions.push(NODE_CAPABILITIES.githubDailyActivityCommit);
    }

    // B. Discord Actions
    if (text.includes('discord')) {
      if (text.includes('embed') || text.includes('rich') || text.includes('stream') || text.includes('link')) {
        matchedActions.push(NODE_CAPABILITIES.discordSendEmbed);
      } else if (!matchedActions.some((a) => a.nodeType === 'discordSendMessage')) {
        matchedActions.push(NODE_CAPABILITIES.discordSendMessage);
      }
    }

    // C. Email / Gmail
    if (text.includes('gmail') || text.includes('email') || text.includes('send mail') || text.includes('mail notification')) {
      matchedActions.push(NODE_CAPABILITIES.gmail);
    }

    // D. Google Sheets
    if (text.includes('sheet') || text.includes('spreadsheet')) {
      if (text.includes('read') || text.includes('fetch')) {
        matchedActions.push(NODE_CAPABILITIES.googleSheetsReadRows);
      } else {
        matchedActions.push(NODE_CAPABILITIES.googleSheetsAppendRow);
      }
    }

    // E. Database / MongoDB
    if (text.includes('mongo') || text.includes('mongodb') || (/\bdatabase\b/i.test(text)) || text.includes('save to db')) {
      if (text.includes('find') || text.includes('query') || text.includes('search')) {
        matchedActions.push(NODE_CAPABILITIES.mongoFind);
      } else {
        matchedActions.push(NODE_CAPABILITIES.mongoInsertOne);
      }
    }

    // F. AI Generation (use regex word boundary to avoid substring match in 'email', 'daily', etc.)
    if (/\bai\b/i.test(text) || text.includes('gemini') || text.includes('grok') || text.includes('llm') || text.includes('summarize') || text.includes('generate text')) {
      matchedActions.push(NODE_CAPABILITIES.aiGenerateText);
    }

    // G. PDF Generation
    if (/\bpdf\b/i.test(text) || text.includes('invoice document') || text.includes('generate pdf')) {
      matchedActions.push(NODE_CAPABILITIES.pdfGenerator);
    }

    // H. Document Extract
    if (text.includes('extract text') || text.includes('parse document') || text.includes('read file')) {
      matchedActions.push(NODE_CAPABILITIES.documentExtractContent);
    }

    // I. HTTP / Webhook Request
    if (/\bhttp\b/i.test(text) || text.includes('api call') || /\brest api\b/i.test(text) || text.includes('fetch api')) {
      matchedActions.push(NODE_CAPABILITIES.http);
    }

    // J. Delay
    if (text.includes('wait') || text.includes('delay') || text.includes('pause')) {
      matchedActions.push(NODE_CAPABILITIES.delay);
    }

    // K. Log / Debug
    if (text.includes('log message') || text.includes('print output') || text.includes('debug log')) {
      matchedActions.push(NODE_CAPABILITIES.log);
    }

    // Check for partial physical / unsupported keywords in automation
    if (text.includes('coffee') || text.includes('wash') || text.includes('clean')) {
      partialNotice.push('AutomateX cannot physically operate real-world appliances. Digital notifications or webhook requests have been configured instead.');
    }

    // Always include End node
    const finalActions = [...matchedActions];
    if (!finalActions.some((a) => a.nodeType === 'end')) {
      finalActions.push(NODE_CAPABILITIES.end);
    }

    return {
      trigger: matchedTriggers[0] || NODE_CAPABILITIES.start,
      actions: finalActions,
      allMatchedNodes: [matchedTriggers[0] || NODE_CAPABILITIES.start, ...finalActions],
      missingCapabilities,
      partialNotice,
      isFeasible: matchedActions.length > 0 || matchedTriggers.length > 0,
    };
  }
}
