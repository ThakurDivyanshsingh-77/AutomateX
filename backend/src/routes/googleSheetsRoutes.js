import express from 'express';
import { GoogleSheetsService } from '../engine/googleSheets/GoogleSheetsService.js';
import { GoogleSheetsTriggerExecutor } from '../engine/googleSheets/GoogleSheetsTriggerExecutor.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

/**
 * GET /api/v1/google/sheets
 * List all spreadsheets owned/accessible by user via Google Drive API
 */
router.get('/sheets', async (req, res, next) => {
  try {
    const { credentialId, q } = req.query;
    const sheets = await GoogleSheetsService.listSpreadsheets({
      credentialId,
      userId: req.user._id,
      query: q,
    });
    return res.json({ success: true, count: sheets.length, spreadsheets: sheets });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/google-sheets/spreadsheets
 * GET /api/v1/google/spreadsheets
 */
router.get('/spreadsheets', async (req, res, next) => {
  try {
    const { credentialId, q } = req.query;
    const sheets = await GoogleSheetsService.listSpreadsheets({
      credentialId,
      userId: req.user._id,
      query: q,
    });
    return res.json({ success: true, count: sheets.length, spreadsheets: sheets });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/google/sheets/:id/worksheets
 * GET /api/v1/google-sheets/spreadsheets/:id/worksheets
 * Get all sheet tabs for a spreadsheet
 */
router.get('/sheets/:id/worksheets', async (req, res, next) => {
  try {
    const { credentialId } = req.query;
    const worksheets = await GoogleSheetsService.getWorksheets({
      credentialId,
      userId: req.user._id,
      spreadsheetId: req.params.id,
    });
    return res.json({ success: true, count: worksheets.length, worksheets });
  } catch (err) {
    next(err);
  }
});

router.get('/spreadsheets/:id/worksheets', async (req, res, next) => {
  try {
    const { credentialId } = req.query;
    const worksheets = await GoogleSheetsService.getWorksheets({
      credentialId,
      userId: req.user._id,
      spreadsheetId: req.params.id,
    });
    return res.json({ success: true, count: worksheets.length, worksheets });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/google/sheets/:id/headers
 * Auto detect column headers from the first row of a sheet tab
 */
router.get('/sheets/:id/headers', async (req, res, next) => {
  try {
    const { credentialId, worksheet = 'Sheet1', headerRow = 1 } = req.query;
    const headers = await GoogleSheetsService.getHeaders({
      credentialId,
      userId: req.user._id,
      spreadsheetId: req.params.id,
      worksheetTitle: worksheet,
      headerRow,
    });
    return res.json({ success: true, headers });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/google/sheets/read
 */
router.post('/sheets/read', async (req, res, next) => {
  try {
    const { credentialId, spreadsheetId, worksheet, headerRow, limit, offset, filterEmpty } = req.body;
    const result = await GoogleSheetsService.readRows({
      credentialId,
      userId: req.user._id,
      spreadsheetId,
      worksheetTitle: worksheet,
      headerRow,
      limit,
      offset,
      filterEmpty,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/google/sheets/append
 */
router.post('/sheets/append', async (req, res, next) => {
  try {
    const { credentialId, spreadsheetId, worksheet, columnsMap } = req.body;
    const result = await GoogleSheetsService.appendRow({
      credentialId,
      userId: req.user._id,
      spreadsheetId,
      worksheetTitle: worksheet,
      columnsMap,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/google/sheets/update
 */
router.post('/sheets/update', async (req, res, next) => {
  try {
    const { credentialId, spreadsheetId, worksheet, rowNumber, searchColumn, searchValue, columnsMap } = req.body;
    const result = await GoogleSheetsService.updateRow({
      credentialId,
      userId: req.user._id,
      spreadsheetId,
      worksheetTitle: worksheet,
      rowNumber,
      searchColumn,
      searchValue,
      columnsMap,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/google/sheets/find
 */
router.post('/sheets/find', async (req, res, next) => {
  try {
    const { credentialId, spreadsheetId, worksheet, searchColumn, searchValue, matchType } = req.body;
    const result = await GoogleSheetsService.findRow({
      credentialId,
      userId: req.user._id,
      spreadsheetId,
      worksheetTitle: worksheet,
      searchColumn,
      searchValue,
      matchType,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/google/sheets/delete
 */
router.post('/sheets/delete', async (req, res, next) => {
  try {
    const { credentialId, spreadsheetId, worksheet, rowNumber, searchColumn, searchValue, columnsMap } = req.body;

    if (!spreadsheetId || !worksheet) {
      return res.status(400).json({ success: false, message: 'Missing configuration: spreadsheetId and worksheet are required.' });
    }

    const result = await GoogleSheetsService.deleteRow({
      credentialId,
      userId: req.user._id,
      spreadsheetId,
      worksheetTitle: worksheet,
      rowNumber,
      searchColumn,
      searchValue,
      columnsMap,
    });

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('404')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.message.includes('required') || err.message.includes('400')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.message.includes('token') || err.message.includes('401') || err.message.includes('auth')) {
      return res.status(401).json({ success: false, message: err.message });
    }
    next(err);
  }
});

/**
 * POST /api/v1/google/sheets/clear
 */
router.post('/sheets/clear', async (req, res, next) => {
  try {
    const { credentialId, spreadsheetId, worksheet, range, allowHeaderClear } = req.body;

    if (!spreadsheetId || !worksheet) {
      return res.status(400).json({ success: false, message: 'Missing configuration: spreadsheetId and worksheet are required.' });
    }
    if (!range || !String(range).trim()) {
      return res.status(400).json({ success: false, message: 'Missing configuration: Cell range is required.' });
    }

    const result = await GoogleSheetsService.clearRows({
      credentialId,
      userId: req.user._id,
      spreadsheetId,
      worksheetTitle: worksheet,
      range,
      allowHeaderClear,
    });
    return res.json(result);
  } catch (err) {
    if (err.message.includes('required') || err.message.includes('400')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.message.includes('token') || err.message.includes('401') || err.message.includes('auth')) {
      return res.status(401).json({ success: false, message: err.message });
    }
    if (err.message.includes('not found') || err.message.includes('404')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
});

/**
 * POST /api/v1/google/sheets/batch-update
 */
router.post('/sheets/batch-update', async (req, res, next) => {
  try {
    const { credentialId, spreadsheetId, worksheet, updateMode, rowNumbers, searchColumn, searchValue, columnsMap, items, batchSize, continueOnError } = req.body;

    if (!spreadsheetId || !worksheet) {
      return res.status(400).json({ success: false, message: 'Missing configuration: spreadsheetId and worksheet are required.' });
    }

    const result = await GoogleSheetsService.batchUpdateRows({
      credentialId,
      userId: req.user._id,
      spreadsheetId,
      worksheetTitle: worksheet,
      updateMode,
      rowNumbers,
      searchColumn,
      searchValue,
      columnsMap,
      items,
      batchSize,
      continueOnError,
    });
    return res.json(result);
  } catch (err) {
    if (err.message.includes('required') || err.message.includes('400')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.message.includes('token') || err.message.includes('401') || err.message.includes('auth')) {
      return res.status(401).json({ success: false, message: err.message });
    }
    next(err);
  }
});

/**
 * POST /api/v1/google/sheets/trigger/test
 * POST /api/v1/google-sheets/trigger/test
 * Test Trigger configuration: Reads current rows, stores DB snapshot, returns status & sample rows.
 */
const handleTestTrigger = async (req, res, next) => {
  try {
    const { credentialId, spreadsheetId, worksheet, worksheetTitle, workflowId, nodeId } = req.body;

    if (!spreadsheetId) {
      return res.status(400).json({ success: false, message: 'Missing configuration: Spreadsheet ID is required.' });
    }

    const result = await GoogleSheetsTriggerExecutor.executeTest({
      credentialId,
      spreadsheetId,
      worksheetTitle: worksheet || worksheetTitle || 'Sheet1',
      userId: req.user._id,
      workflowId,
      nodeId,
    });

    return res.json(result);
  } catch (err) {
    if (err.message.includes('required') || err.message.includes('400')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.message.includes('token') || err.message.includes('401') || err.message.includes('auth')) {
      return res.status(401).json({ success: false, message: err.message });
    }
    if (err.message.includes('not found') || err.message.includes('404') || err.message.includes('Worksheet')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.message.includes('rate limit') || err.message.includes('429')) {
      return res.status(429).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/sheets/trigger/test', handleTestTrigger);
router.post('/trigger/test', handleTestTrigger);

export default router;
