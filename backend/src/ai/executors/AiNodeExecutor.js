import { AiGenerateTextService } from '../services/AiGenerateTextService.js';

export class AiNodeExecutor {
  async execute(nodeData, context) {
    const config = nodeData.config || nodeData.data || {};
    const credentialId = config.credentialId || config.credential;
    const ownerId = context?.ownerId || context?.userId;

    if (!ownerId) {
      throw new Error('[AiNodeExecutor] Security Error: Missing ownerId in execution context.');
    }

    if (!credentialId) {
      throw new Error('[AiNodeExecutor] Validation Error: AI Credential is required.');
    }

    const nodeType = String(nodeData.type || '').toLowerCase();
    console.log(`[AiNodeExecutor] 🚀 Executing Node Type: "${nodeData.type}" for User: "${ownerId}"`);

    if (nodeType.includes('generatetext') || nodeType === 'aigeneratetext' || nodeType === 'ai') {
      return await AiGenerateTextService.generateText(ownerId, credentialId, { ...config, context });
    }

    // Default fallback to AiGenerateTextService
    return await AiGenerateTextService.generateText(ownerId, credentialId, { ...config, context });
  }
}
