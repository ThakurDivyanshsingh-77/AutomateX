/**
 * FieldValidator.js
 * Validates required configuration fields on planned nodes and generates smart, non-redundant clarification prompts.
 */

import { CapabilityRegistry } from './CapabilityRegistry.js';

export class FieldValidator {
  /**
   * Validate fields on generated nodes against their capability specs
   * @param {Array<Object>} nodes - React Flow nodes with data.config
   * @returns {Object} { isValid, missingFieldsByNode, clarificationQuestions }
   */
  static validate(nodes = []) {
    const missingByNode = [];
    const questions = [];

    nodes.forEach((node) => {
      const spec = CapabilityRegistry.getNodeSpec(node.type);
      if (!spec || !spec.requiredFields || spec.requiredFields.length === 0) return;

      const config = node.data?.config || {};
      const missingForThisNode = [];

      spec.requiredFields.forEach((field) => {
        const val = config[field];
        if (val === undefined || val === null || val === '') {
          missingForThisNode.push(field);
        }
      });

      if (missingForThisNode.length > 0) {
        missingByNode.push({
          nodeId: node.id,
          nodeType: node.type,
          nodeName: spec.name,
          missingFields: missingForThisNode,
        });

        const q = this.generateClarificationQuestion(spec.name, node.type, missingForThisNode);
        if (q) questions.push(q);
      }
    });

    return {
      isValid: missingByNode.length === 0,
      missingByNode,
      clarificationQuestions: questions,
    };
  }

  static generateClarificationQuestion(nodeName, nodeType, missingFields) {
    if (nodeType === 'discordSendMessage') {
      if (missingFields.includes('channelId') && missingFields.includes('content')) {
        return 'Which Discord channel should receive the message, and what should the message say?';
      }
      if (missingFields.includes('channelId')) {
        return 'Which Discord channel ID or name should receive this notification?';
      }
      if (missingFields.includes('content')) {
        return 'What message content should AutomateX send to Discord?';
      }
    }

    if (nodeType === 'gmail') {
      if (missingFields.includes('to')) {
        return 'Who is the recipient email address for this message?';
      }
      if (missingFields.includes('subject') || missingFields.includes('body')) {
        return 'What should be the subject and body of the automated email?';
      }
    }

    if (nodeType === 'githubDailyActivityCommit') {
      if (missingFields.includes('repository')) {
        return 'Which GitHub repository (e.g. username/repo) should receive the daily activity heartbeat?';
      }
    }

    return `Please provide the following required parameters for ${nodeName}: ${missingFields.join(', ')}.`;
  }
}
