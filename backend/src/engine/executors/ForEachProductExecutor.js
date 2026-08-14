import { BaseExecutor } from './BaseExecutor.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

export class ForEachProductExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const startTime = Date.now();

    // 1. Resolve products collection
    let rawCollection = config.products || config.collection || config.items || null;

    if (typeof rawCollection === 'string' && rawCollection.includes('{{')) {
      rawCollection = ExpressionEngine.resolve(rawCollection, context);
    }

    // Fallback to previous step data
    if (!rawCollection && context.currentData) {
      if (Array.isArray(context.currentData.products)) {
        rawCollection = context.currentData.products;
      } else if (Array.isArray(context.currentData)) {
        rawCollection = context.currentData;
      }
    }

    const products = Array.isArray(rawCollection) ? rawCollection : [];
    const totalItems = products.length;

    console.log(`[ForEachProductExecutor] 🔄 Starting product iteration over ${totalItems} items.`);

    // If context has setVariable support, set loop variables
    if (totalItems > 0) {
      const firstItem = products[0];
      if (context.setVariable) {
        context.setVariable('currentItem', firstItem);
        context.setVariable('currentIndex', 0);
        context.setVariable('totalItems', totalItems);
        context.setVariable('products', products);
      }
    }

    return {
      success: true,
      totalItems,
      currentIndex: 0,
      currentItem: totalItems > 0 ? products[0] : null,
      products,
      iterations: products.map((item, index) => ({
        index,
        item,
        status: 'pending',
      })),
      durationMs: Date.now() - startTime,
    };
  }
}
