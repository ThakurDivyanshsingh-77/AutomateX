/**
 * VersionComparator — Structured diff engine for workflow versions.
 *
 * Compares two workflow definitions ({ nodes, edges }) and produces a
 * structured diff with human-readable change summaries.
 */

export class VersionComparator {
  /**
   * Compare two workflow definitions and produce a structured diff.
   *
   * @param {Object} defA - Older definition { nodes, edges }
   * @param {Object} defB - Newer definition { nodes, edges }
   * @returns {Object} diff result
   */
  static compare(defA, defB) {
    const nodesA = (defA?.nodes || []);
    const nodesB = (defB?.nodes || []);
    const edgesA = (defA?.edges || []);
    const edgesB = (defB?.edges || []);

    // ─── Node Diff ────────────────────────────────────────────────────────
    const nodesAMap = new Map(nodesA.map((n) => [n.id, n]));
    const nodesBMap = new Map(nodesB.map((n) => [n.id, n]));

    const addedNodes = [];
    const removedNodes = [];
    const updatedNodes = [];
    const unchangedNodes = [];

    // Find added and updated nodes
    for (const [id, nodeB] of nodesBMap) {
      if (!nodesAMap.has(id)) {
        addedNodes.push(nodeB);
      } else {
        const nodeA = nodesAMap.get(id);
        const changes = VersionComparator._diffNode(nodeA, nodeB);
        if (changes.length > 0) {
          updatedNodes.push({ node: nodeB, changes });
        } else {
          unchangedNodes.push(nodeB);
        }
      }
    }

    // Find removed nodes
    for (const [id, nodeA] of nodesAMap) {
      if (!nodesBMap.has(id)) {
        removedNodes.push(nodeA);
      }
    }

    // ─── Edge Diff ────────────────────────────────────────────────────────
    const edgeKey = (e) => `${e.source}→${e.target}${e.sourceHandle ? ':' + e.sourceHandle : ''}`;
    const edgesAMap = new Map(edgesA.map((e) => [edgeKey(e), e]));
    const edgesBMap = new Map(edgesB.map((e) => [edgeKey(e), e]));

    const addedEdges = [];
    const removedEdges = [];
    const updatedEdges = [];

    for (const [key, edgeB] of edgesBMap) {
      if (!edgesAMap.has(key)) {
        addedEdges.push(edgeB);
      }
    }
    for (const [key, edgeA] of edgesAMap) {
      if (!edgesBMap.has(key)) {
        removedEdges.push(edgeA);
      }
    }

    // ─── Human-Readable Summary ───────────────────────────────────────────
    const summary = VersionComparator._buildSummary({
      addedNodes,
      removedNodes,
      updatedNodes,
      addedEdges,
      removedEdges,
    });

    return {
      nodes: {
        added: addedNodes,
        removed: removedNodes,
        updated: updatedNodes,
        unchanged: unchangedNodes,
      },
      edges: {
        added: addedEdges,
        removed: removedEdges,
        updated: updatedEdges,
      },
      summary,
      hasChanges:
        addedNodes.length > 0 ||
        removedNodes.length > 0 ||
        updatedNodes.length > 0 ||
        addedEdges.length > 0 ||
        removedEdges.length > 0,
      stats: {
        nodesAdded: addedNodes.length,
        nodesRemoved: removedNodes.length,
        nodesUpdated: updatedNodes.length,
        edgesAdded: addedEdges.length,
        edgesRemoved: removedEdges.length,
      },
    };
  }

  /**
   * Diff two node objects — returns an array of change descriptor strings.
   */
  static _diffNode(nodeA, nodeB) {
    const changes = [];

    const labelA = nodeA?.data?.label || nodeA?.data?.name || '';
    const labelB = nodeB?.data?.label || nodeB?.data?.name || '';

    if (nodeA.type !== nodeB.type) {
      changes.push(`Type changed: ${nodeA.type} → ${nodeB.type}`);
    }
    if (labelA !== labelB) {
      changes.push(`Label changed: "${labelA}" → "${labelB}"`);
    }

    // Deep compare node.data config fields
    const configA = nodeA?.data?.config || {};
    const configB = nodeB?.data?.config || {};
    const allConfigKeys = new Set([...Object.keys(configA), ...Object.keys(configB)]);

    for (const key of allConfigKeys) {
      const valA = JSON.stringify(configA[key]);
      const valB = JSON.stringify(configB[key]);
      if (valA !== valB) {
        changes.push(`Config "${key}" changed`);
      }
    }

    // Position change (significant move)
    const posA = nodeA?.position || {};
    const posB = nodeB?.position || {};
    const movedX = Math.abs((posA.x || 0) - (posB.x || 0)) > 50;
    const movedY = Math.abs((posA.y || 0) - (posB.y || 0)) > 50;
    if (movedX || movedY) {
      changes.push('Node repositioned on canvas');
    }

    return changes;
  }

  /**
   * Build an array of human-readable summary strings for the diff.
   */
  static _buildSummary({ addedNodes, removedNodes, updatedNodes, addedEdges, removedEdges }) {
    const summary = [];

    for (const node of addedNodes) {
      const label = node?.data?.label || node?.data?.name || node.type || node.id;
      summary.push(`+ ${label} node added`);
    }
    for (const node of removedNodes) {
      const label = node?.data?.label || node?.data?.name || node.type || node.id;
      summary.push(`- ${label} node removed`);
    }
    for (const { node, changes } of updatedNodes) {
      const label = node?.data?.label || node?.data?.name || node.type || node.id;
      summary.push(`* ${label} updated (${changes.slice(0, 2).join(', ')}${changes.length > 2 ? '...' : ''})`);
    }
    for (const edge of addedEdges) {
      summary.push(`+ Connection added: ${edge.source} → ${edge.target}`);
    }
    for (const edge of removedEdges) {
      summary.push(`- Connection removed: ${edge.source} → ${edge.target}`);
    }

    if (summary.length === 0) {
      summary.push('No structural changes detected');
    }

    return summary;
  }
}
