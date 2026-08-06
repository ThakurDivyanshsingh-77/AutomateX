export const googleSheetsValidator = (nodeData) => {
  const config = nodeData?.config || {};
  const errors = [];
  const nodeType = nodeData?.type || config.operation;

  if (!config.credentialId) {
    errors.push('Google Account credential selection is required.');
  }

  // 1. Create Spreadsheet
  if (nodeType === 'googleSheetsCreateSpreadsheet' || config.operation === 'createSpreadsheet') {
    if (!config.spreadsheetName && !config.title) {
      errors.push('Spreadsheet Name is required.');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 2. Create Worksheet
  if (nodeType === 'googleSheetsCreateWorksheet' || config.operation === 'createWorksheet') {
    if (!config.spreadsheetId) {
      errors.push('Spreadsheet selection is required.');
    }
    if (!config.worksheetName && !config.newWorksheetName) {
      errors.push('New Worksheet Name is required.');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 3. Delete Worksheet (Requires ONLY credentialId, spreadsheetId & Worksheet tab selection)
  if (nodeType === 'googleSheetsDeleteWorksheet' || config.operation === 'deleteWorksheet') {
    if (!config.spreadsheetId) {
      errors.push('Spreadsheet selection is required.');
    }
    if (!config.worksheet && !config.worksheetTitle && !config.worksheetName) {
      errors.push('Worksheet selection is required.');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 4. Get Spreadsheet Info (Requires ONLY credentialId & spreadsheetId)
  if (nodeType === 'googleSheetsGetSpreadsheetInfo' || config.operation === 'getSpreadsheetInfo') {
    if (!config.spreadsheetId) {
      errors.push('Spreadsheet selection is required.');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 5. Standard Google Sheets Action Nodes
  if (!config.spreadsheetId) {
    errors.push('Spreadsheet selection is required.');
  }

  if (!config.worksheet && !config.worksheetTitle && !config.worksheetName) {
    errors.push('Worksheet tab selection is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
