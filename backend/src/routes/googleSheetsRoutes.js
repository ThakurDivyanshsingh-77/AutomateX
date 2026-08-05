import express from 'express';
import { GoogleSheetsService } from '../engine/googleSheets/GoogleSheetsService.js';
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
    return res.json({ success: true, worksheets });
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
 * POST /api/v1/google/sheets/clear
 */
router.post('/sheets/clear', async (req, res, next) => {
  try {
    const { credentialId, spreadsheetId, worksheet, range } = req.body;
    const result = await GoogleSheetsService.clearRows({
      credentialId,
      userId: req.user._id,
      spreadsheetId,
      worksheetTitle: worksheet,
      range,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
