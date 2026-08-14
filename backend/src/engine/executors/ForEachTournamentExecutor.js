import { BaseExecutor } from './BaseExecutor.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class ForEachTournamentExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const startTime = Date.now();

    // 1. Resolve tournaments collection
    let rawCollection = config.tournaments || config.tournament || config.items || config.collection || null;

    if (typeof rawCollection === 'string' && rawCollection.includes('{{')) {
      rawCollection = ExpressionEngine.resolve(rawCollection, context);
    }

    // Fallback to previous step data
    if (!rawCollection && context.currentData) {
      if (Array.isArray(context.currentData.tournaments)) {
        rawCollection = context.currentData.tournaments;
      } else if (context.currentData.tournament && typeof context.currentData.tournament === 'object') {
        rawCollection = [context.currentData.tournament];
      } else if (Array.isArray(context.currentData)) {
        rawCollection = context.currentData;
      } else if (context.currentData && typeof context.currentData === 'object' && context.currentData.title) {
        rawCollection = [context.currentData];
      }
    }

    let tournaments = [];
    if (Array.isArray(rawCollection)) {
      tournaments = rawCollection;
    } else if (rawCollection && typeof rawCollection === 'object') {
      tournaments = [rawCollection];
    }

    const totalItems = tournaments.length;
    const currentTournament = totalItems > 0 ? tournaments[0] : null;

    console.log(`[ForEachTournamentExecutor] 🔄 Starting tournament iteration over ${totalItems} items.`);

    // If context has setVariable support, set loop variables
    if (totalItems > 0) {
      if (context.setVariable) {
        context.setVariable('currentItem', currentTournament);
        context.setVariable('currentTournament', currentTournament);
        context.setVariable('currentIndex', 0);
        context.setVariable('totalItems', totalItems);
        context.setVariable('tournaments', tournaments);
      }
    }

    return {
      success: true,
      totalItems,
      currentIndex: 0,
      currentItem: currentTournament,
      currentTournament,
      tournaments,
      iterations: tournaments.map((item, index) => ({
        index,
        item,
        status: 'pending',
      })),
      durationMs: Date.now() - startTime,
    };
  }
}
