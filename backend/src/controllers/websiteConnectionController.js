import { websiteConnectionService } from '../services/WebsiteConnectionService.js';

export const createWebsiteConnection = async (req, res) => {
  try {
    const ownerId = req.user?._id || req.user?.id || req.body?.ownerId;
    if (!ownerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User authentication required.' },
      });
    }

    const {
      name,
      websiteUrl,
      apiBaseUrl,
      connectionMethod,
      authType,
      credentials,
      customHeaders,
    } = req.body;

    const connection = await websiteConnectionService.createConnection({
      ownerId,
      name,
      websiteUrl,
      apiBaseUrl,
      connectionMethod,
      authType,
      credentials,
      customHeaders,
    });

    return res.status(201).json({
      success: true,
      connection,
    });
  } catch (error) {
    console.error('[WebsiteConnectionController] Create error:', error);
    const statusCode = error.status || 400;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CONNECTION_CREATION_FAILED',
        message: error.message || 'Failed to create website connection.',
      },
    });
  }
};

export const getWebsiteConnections = async (req, res) => {
  try {
    const ownerId = req.user?._id || req.user?.id;
    const connections = await websiteConnectionService.listConnections(ownerId);

    return res.status(200).json({
      success: true,
      connections,
    });
  } catch (error) {
    console.error('[WebsiteConnectionController] List error:', error);
    return res.status(400).json({
      success: false,
      error: {
        code: error.code || 'CONNECTION_FETCH_FAILED',
        message: error.message || 'Failed to retrieve website connections.',
      },
    });
  }
};

export const getWebsiteConnectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user?._id || req.user?.id;

    const connection = await websiteConnectionService.getConnection(id, ownerId, false);

    return res.status(200).json({
      success: true,
      connection,
    });
  } catch (error) {
    console.error('[WebsiteConnectionController] GetById error:', error);
    const statusCode = error.status || 404;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CONNECTION_NOT_FOUND',
        message: error.message || 'Website connection not found.',
      },
    });
  }
};

export const testWebsiteConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user?._id || req.user?.id;

    const result = await websiteConnectionService.testConnection(id, ownerId);

    return res.status(200).json({
      success: result.success,
      result,
    });
  } catch (error) {
    console.error('[WebsiteConnectionController] Test error:', error);
    const statusCode = error.status || 400;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CONNECTION_TEST_FAILED',
        message: error.message || 'Failed to test website connection.',
      },
    });
  }
};

export const testRawWebsiteConnection = async (req, res) => {
  try {
    const result = await websiteConnectionService.testRawConnection(req.body);

    return res.status(200).json({
      success: result.success,
      result,
    });
  } catch (error) {
    console.error('[WebsiteConnectionController] TestRaw error:', error);
    const statusCode = error.status || 400;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CONNECTION_TEST_FAILED',
        message: error.message || 'Failed to test connection settings.',
      },
    });
  }
};

export const deleteWebsiteConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user?._id || req.user?.id;

    const result = await websiteConnectionService.deleteConnection(id, ownerId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[WebsiteConnectionController] Delete error:', error);
    const statusCode = error.status || 400;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CONNECTION_DELETE_FAILED',
        message: error.message || 'Failed to delete website connection.',
      },
    });
  }
};
