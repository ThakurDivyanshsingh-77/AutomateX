import { BaseExecutor } from './BaseExecutor.js';
import { ExpressionEngine } from '../expression/ExpressionEngine.js';

/**
 * ConditionExecutor
 * Evaluates boolean logic expressions for IF Condition nodes.
 */
export class ConditionExecutor extends BaseExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const { left: rawLeft, operator = 'equals', right: rawRight } = config;

    const leftVal = ExpressionEngine.resolve(rawLeft, context);
    const rightVal = ExpressionEngine.resolve(rawRight, context);

    let result = false;

    switch (operator) {
      case 'equals':
        // Flexible equality (number vs string 200 == "200")
        result = String(leftVal) === String(rightVal) || leftVal == rightVal;
        break;

      case 'notEquals':
        result = String(leftVal) !== String(rightVal) && leftVal != rightVal;
        break;

      case 'greaterThan':
        result = Number(leftVal) > Number(rightVal);
        break;

      case 'greaterThanOrEqual':
        result = Number(leftVal) >= Number(rightVal);
        break;

      case 'lessThan':
        result = Number(leftVal) < Number(rightVal);
        break;

      case 'lessThanOrEqual':
        result = Number(leftVal) <= Number(rightVal);
        break;

      case 'contains':
        result = String(leftVal ?? '').includes(String(rightVal ?? ''));
        break;

      case 'startsWith':
        result = String(leftVal ?? '').startsWith(String(rightVal ?? ''));
        break;

      case 'endsWith':
        result = String(leftVal ?? '').endsWith(String(rightVal ?? ''));
        break;

      case 'isEmpty':
        result =
          leftVal === null ||
          leftVal === undefined ||
          leftVal === '' ||
          (Array.isArray(leftVal) && leftVal.length === 0) ||
          (typeof leftVal === 'object' && Object.keys(leftVal).length === 0);
        break;

      case 'isNotEmpty':
        result = !(
          leftVal === null ||
          leftVal === undefined ||
          leftVal === '' ||
          (Array.isArray(leftVal) && leftVal.length === 0) ||
          (typeof leftVal === 'object' && Object.keys(leftVal).length === 0)
        );
        break;

      case 'exists':
        result = leftVal !== null && leftVal !== undefined && leftVal !== '';
        break;

      case 'notExists':
        result = leftVal === null || leftVal === undefined || leftVal === '';
        break;

      default:
        result = String(leftVal) === String(rightVal);
        break;
    }

    const selectedBranch = result ? 'true' : 'false';

    console.log(
      `[ConditionExecutor]: Evaluated "${rawLeft}" (${leftVal}) ${operator} "${rawRight}" (${rightVal}) => Result: ${result} (Selected Branch: ${selectedBranch})`
    );

    return {
      status: 'success',
      output: {
        result,
        selectedBranch,
        leftRaw: rawLeft,
        leftResolved: leftVal,
        operator,
        rightRaw: rawRight,
        rightResolved: rightVal,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
