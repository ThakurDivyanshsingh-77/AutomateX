import { BaseTrigger } from './BaseTrigger.js';

export class GoogleSheetsTrigger extends BaseTrigger {
  formatEvent(payload = {}) {
    return {
      triggerType: 'googleSheetsTrigger',
      timestamp: payload.triggeredAt || new Date().toISOString(),
      type: payload.type || 'NEW_ROW',
      rowNumber: payload.rowNumber || 1,
      item: payload.item || {},
      data: payload.item || {},
      raw: payload,
    };
  }
}
