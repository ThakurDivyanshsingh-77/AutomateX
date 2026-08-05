export const googleSheetsValidator = (nodeData) => {
  const config = nodeData?.config || {};
  const errors = [];

  if (!config.credentialId) {
    errors.push('Google Account credential selection is required.');
  }

  if (!config.spreadsheetId) {
    errors.push('Spreadsheet selection is required.');
  }

  if (!config.worksheet) {
    errors.push('Worksheet tab selection is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
