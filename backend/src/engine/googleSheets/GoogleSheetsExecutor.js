import { GoogleSheetsService } from './GoogleSheetsService.js';

export class GoogleSheetsExecutor {
  async execute(node, context) {
    const config = node.config || node.data?.config || {};
    const operation = config.operation || node.type || 'readRows';

    const credentialId = config.credentialId;
    const spreadsheetId = config.spreadsheetId;
    const worksheet = config.worksheet || config.sheetName || 'Sheet1';
    const userId = context.userId;

    if (!spreadsheetId && operation !== 'createSpreadsheet' && operation !== 'googleSheetsCreateSpreadsheet') {
      throw new Error(`Google Sheets Execution Error: Spreadsheet selection is required for node "${node.id}".`);
    }

    const startTime = Date.now();
    let result = null;

    // Convert columnsMap array or object if passed from frontend Mapper
    let columnsMap = {};
    if (Array.isArray(config.mappings)) {
      config.mappings.forEach((m) => {
        if (m.column) columnsMap[m.column] = m.value;
      });
    } else if (config.columnsMap && typeof config.columnsMap === 'object') {
      columnsMap = config.columnsMap;
    }

    switch (operation) {
      case 'createSpreadsheet':
      case 'googleSheetsCreateSpreadsheet':
        result = await GoogleSheetsService.createSpreadsheet({
          credentialId,
          userId,
          title: config.title || config.spreadsheetName || 'Untitled Spreadsheet',
          worksheetTitle: config.worksheetTitle || config.worksheet || config.initialWorksheetName || 'Sheet1',
        });
        break;
      case 'readRows':
      case 'googleSheetsReadRows':
        result = await GoogleSheetsService.readRows({
          credentialId,
          userId,
          spreadsheetId,
          worksheetTitle: worksheet,
          headerRow: config.headerRow || 1,
          limit: config.limit || 0,
          offset: config.offset || 0,
          filterEmpty: config.filterEmpty !== false,
        });
        break;

      case 'appendRow':
      case 'googleSheetsAppendRow':
        result = await GoogleSheetsService.appendRow({
          credentialId,
          userId,
          spreadsheetId,
          worksheetTitle: worksheet,
          columnsMap,
        });
        break;

      case 'updateRow':
      case 'googleSheetsUpdateRow': {
        // Resolve rowNumber expression (e.g. {{item._rowNumber}}, {{steps.findRow._rowNumber}}, 2)
        let resolvedRow = config.rowNumber;
        if (typeof config.rowNumber === 'string' && context.resolveVariables) {
          resolvedRow = context.resolveVariables(config.rowNumber);
        }

        // Resolve expression variables for each mapped column value
        const resolvedColumnsMap = {};
        Object.entries(columnsMap).forEach(([col, val]) => {
          let resolvedVal = val;
          if (typeof val === 'string' && context.resolveVariables) {
            resolvedVal = context.resolveVariables(val);
          }
          resolvedColumnsMap[col] = resolvedVal;
        });

        let resolvedSearchVal = config.searchValue;
        if (typeof config.searchValue === 'string' && context.resolveVariables) {
          resolvedSearchVal = context.resolveVariables(config.searchValue);
        }

        result = await GoogleSheetsService.updateRow({
          credentialId,
          userId,
          spreadsheetId,
          worksheetTitle: worksheet,
          rowNumber: resolvedRow,
          searchColumn: config.searchColumn,
          searchValue: resolvedSearchVal,
          columnsMap: resolvedColumnsMap,
        });
        break;
      }

      case 'findRow':
      case 'googleSheetsFindRow': {
        // Resolve expression variables (e.g. {{item.email}}, {{trigger.email}})
        let resolvedValue = config.searchValue;
        if (typeof config.searchValue === 'string' && context.resolveVariables) {
          resolvedValue = context.resolveVariables(config.searchValue);
        }

        result = await GoogleSheetsService.findRow({
          credentialId,
          userId,
          spreadsheetId,
          worksheetTitle: worksheet,
          searchColumn: config.searchColumn,
          searchValue: resolvedValue,
          matchType: config.matchType || config.operator || 'equals',
          returnMode: config.returnMode || 'first',
          limit: config.limit || 1,
          caseSensitive: config.caseSensitive === true,
        });
        break;
      }

      case 'deleteRow':
      case 'googleSheetsDeleteRow': {
        // Resolve rowNumber or columnsMap variable expressions
        let resolvedRow = config.rowNumber;
        if (typeof config.rowNumber === 'string' && context.resolveVariables) {
          resolvedRow = context.resolveVariables(config.rowNumber);
        }

        const resolvedColumnsMap = {};
        Object.entries(columnsMap).forEach(([col, val]) => {
          let resolvedVal = val;
          if (typeof val === 'string' && context.resolveVariables) {
            resolvedVal = context.resolveVariables(val);
          }
          resolvedColumnsMap[col] = resolvedVal;
        });

        let resolvedSearchVal = config.searchValue;
        if (typeof config.searchValue === 'string' && context.resolveVariables) {
          resolvedSearchVal = context.resolveVariables(config.searchValue);
        }

        result = await GoogleSheetsService.deleteRow({
          credentialId,
          userId,
          spreadsheetId,
          worksheetTitle: worksheet,
          rowNumber: resolvedRow,
          searchColumn: config.searchColumn,
          searchValue: resolvedSearchVal,
          columnsMap: resolvedColumnsMap,
        });
        break;
      }

      case 'clearRange':
      case 'googleSheetsClearRange': {
        let resolvedRange = config.range || 'A2:ZZ100';
        if (typeof config.range === 'string' && context.resolveVariables) {
          resolvedRange = context.resolveVariables(config.range);
        }

        result = await GoogleSheetsService.clearRows({
          credentialId,
          userId,
          spreadsheetId,
          worksheetTitle: worksheet,
          range: resolvedRange,
          allowHeaderClear: config.allowHeaderClear === true,
        });
        break;
      }

      case 'batchUpdate':
      case 'googleSheetsBatchUpdate': {
        let resolvedRowNumbers = config.rowNumbers;
        if (typeof config.rowNumbers === 'string' && context.resolveVariables) {
          resolvedRowNumbers = context.resolveVariables(config.rowNumbers);
        }
        if (typeof resolvedRowNumbers === 'string') {
          resolvedRowNumbers = resolvedRowNumbers.split(',').map((s) => s.trim()).filter(Boolean);
        }

        let resolvedItems = config.items;
        if (typeof config.items === 'string' && context.resolveVariables) {
          resolvedItems = context.resolveVariables(config.items);
        }

        let resolvedSearchVal = config.searchValue;
        if (typeof config.searchValue === 'string' && context.resolveVariables) {
          resolvedSearchVal = context.resolveVariables(config.searchValue);
        }

        const resolvedColumnsMap = {};
        Object.entries(columnsMap).forEach(([col, val]) => {
          let resolvedVal = val;
          if (typeof val === 'string' && context.resolveVariables) {
            resolvedVal = context.resolveVariables(val);
          }
          resolvedColumnsMap[col] = resolvedVal;
        });

        result = await GoogleSheetsService.batchUpdateRows({
          credentialId,
          userId,
          spreadsheetId,
          worksheetTitle: worksheet,
          updateMode: config.updateMode || config.mode || 'rowNumber',
          rowNumbers: resolvedRowNumbers || [],
          searchColumn: config.searchColumn,
          searchValue: resolvedSearchVal,
          columnsMap: resolvedColumnsMap,
          items: Array.isArray(resolvedItems) ? resolvedItems : [],
          batchSize: config.batchSize || 100,
          continueOnError: config.continueOnError !== false,
        });
        break;
      }

      default:
        // Default fallback to readRows
        result = await GoogleSheetsService.readRows({
          credentialId,
          userId,
          spreadsheetId,
          worksheetTitle: worksheet,
        });
        break;
    }

    const executionTime = Date.now() - startTime;

    return {
      output: {
        success: true,
        spreadsheetId,
        worksheet,
        rowsAffected: result.rowsAffected || 1,
        rowNumber: result.rowNumber || null,
        values: result.values || result.rows || [],
        executionTime,
        ...result,
      },
    };
  }
}
